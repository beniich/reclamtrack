import type { Response } from 'express';
import express from 'express';
import { requireOrganization } from '../middleware/organization';
import { authenticate as auth } from '../middleware/security.js';
import ITTicket from '../models/ITTicket';
import { User } from '../models/User.js';
import type { AuthenticatedRequest } from '../types/request.js';
import type { ImpactLevel, UrgencyLevel } from '../services/priorityMatrixService';
import { calculatePriority } from '../services/priorityMatrixService';

const router = express.Router();

// Apply authentication and organization context to all routes
router.use(auth, requireOrganization);

// GET /api/it-tickets - Get all IT tickets
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, category, assignedTo, requestedBy, search } = req.query;

    const query: any = { organizationId: req.organizationId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (requestedBy) query.requestedBy = requestedBy;

    if (search) {
      query.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { ticketNumber: new RegExp(search as string, 'i') },
      ];
    }

    const tickets = await ITTicket.find(query)
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('relatedAsset', 'name type assetTag')
      .sort({ createdAt: -1 });

    res.json({ tickets, count: tickets.length });
  } catch (error: any) {
    console.error('Error fetching IT tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/it-tickets/stats - Get ticket statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = {
      total: await ITTicket.countDocuments({ organizationId: req.organizationId }),

      byStatus: await ITTicket.aggregate([
        { $match: { organizationId: req.organizationId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      byPriority: await ITTicket.aggregate([
        { $match: { organizationId: req.organizationId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      byCategory: await ITTicket.aggregate([
        { $match: { organizationId: req.organizationId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),

      slaBreach: await ITTicket.countDocuments({
        organizationId: req.organizationId,
        'sla.breached': true,
      }),

      avgResolutionTime: await ITTicket.aggregate([
        {
          $match: {
            organizationId: req.organizationId,
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true },
          },
        },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolvedAt', '$createdAt'],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$resolutionTime' },
          },
        },
      ]),
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/it-tickets/:id - Get single ticket
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = await ITTicket.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    })
      .populate('requestedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('relatedAsset', 'name type assetTag ipAddress')
      .populate('updates.userId', 'firstName lastName')
      .populate('resolution.resolvedBy', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/it-tickets - Create new ticket
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Calculate SLA deadlines based on priority
    const slaMinutes = {
      critical: { response: 15, resolution: 240 }, // 15min, 4h
      urgent: { response: 30, resolution: 480 }, // 30min, 8h
      high: { response: 120, resolution: 1440 }, // 2h, 24h
      medium: { response: 240, resolution: 4320 }, // 4h, 3 days
      low: { response: 480, resolution: 10080 }, // 8h, 7 days
    };

    const impact = (req.body.impact || 'medium') as ImpactLevel;
    const urgency = (req.body.urgency || 'medium') as UrgencyLevel;
    const priority = calculatePriority(impact, urgency);
    const sla = slaMinutes[priority as keyof typeof slaMinutes];

    const now = new Date();
    const responseDeadline = new Date(now.getTime() + sla.response * 60000);
    const resolutionDeadline = new Date(now.getTime() + sla.resolution * 60000);

    const ticket = await ITTicket.create({
      ...req.body,
      impact,
      urgency,
      priority,
      organizationId: req.organizationId,
      requestedBy: req.user!._id || req.user!.id,
      sla: {
        responseTime: sla.response,
        resolutionTime: sla.resolution,
        responseDeadline,
        resolutionDeadline,
        breached: false,
      },
    });

    // Auto-assign Level 1 IT (For demo, find an admin or technician)
    const itStaff = await User.findOne({
        organizationId: req.organizationId,
        role: { $in: ['admin', 'technician'] }
    });
    
    if (itStaff) {
        ticket.assignedTo = itStaff._id;
        ticket.status = 'assigned';
        ticket.updates.push({
            timestamp: new Date(),
            userId: itStaff._id,
            message: 'Billet assigné automatiquement (Niveau 1)',
            internal: true,
        });
        await ticket.save();
    }

    const populatedTicket = await ITTicket.findById(ticket._id)
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('relatedAsset', 'name type assetTag');

    res.status(201).json({ ticket: populatedTicket });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/it-tickets/:id - Update ticket
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updateData: any = { ...req.body };

    // Update priority if impact or urgency changed
    if (req.body.impact || req.body.urgency) {
      const currentTicket = await ITTicket.findById(req.params.id);
      if (currentTicket) {
        const impact = (req.body.impact || currentTicket.impact) as ImpactLevel;
        const urgency = (req.body.urgency || currentTicket.urgency) as UrgencyLevel;
        updateData.priority = calculatePriority(impact, urgency);
      }
    }

    // Update timestamps based on status changes
    if (req.body.status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (req.body.status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    const ticket = await ITTicket.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('relatedAsset', 'name type assetTag');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/it-tickets/:id/updates - Add update/comment
router.post('/:id/updates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = await ITTicket.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      {
        $push: {
          updates: {
            timestamp: new Date(),
            userId: req.user!._id || req.user!.id,
            message: req.body.message,
            internal: req.body.internal || false,
          },
        },
      },
      { new: true }
    ).populate('updates.userId', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error: any) {
    console.error('Error adding ticket update:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/it-tickets/:id/assign - Assign ticket
router.post('/:id/assign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = await ITTicket.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      {
        $set: {
          assignedTo: req.body.assignedTo,
          status: 'assigned',
        },
        $push: {
          updates: {
            timestamp: new Date(),
            userId: req.user!._id || req.user!.id,
            message: `Ticket assigned to ${req.body.assignedTo}`,
            internal: true,
          },
        },
      },
      { new: true }
    )
      .populate('assignedTo', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error: any) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/it-tickets/:id/resolve - Resolve ticket
router.post('/:id/resolve', async (req: any, res) => {
  try {
    const ticket = await ITTicket.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      {
        $set: {
          status: 'resolved',
          resolvedAt: new Date(),
          resolution: {
            summary: req.body.summary,
            rootCause: req.body.rootCause,
            solution: req.body.solution,
            resolvedBy: req.user!._id || req.user!.id,
          },
        },
      },
      { new: true }
    ).populate('resolution.resolvedBy', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error: any) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
