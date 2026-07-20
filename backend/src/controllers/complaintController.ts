import type { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { complaintService } from '../services/complaintService.js';
import { eventBus } from '../services/eventBus.js';
import { PrivacyShield } from '../utils/privacyShield.js';

/**
 * Standard API response format
 */
const formatResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message,
});

const formatError = (message: string, statusCode: number = 400) => ({
  success: false,
  error: message,
  statusCode,
});

export class ComplaintController {
  /**
   * GET /api/complaints
   * Get all complaints with optional filters
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        category: req.query.category as string,
        assignedTeamId: req.query.teamId as string,
      };

      const complaints = await complaintService.getAllComplaints(
        filters,
        (req as any).organizationId
      );
      res.json(formatResponse(complaints));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/complaints/:id
   * Get a single complaint by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const complaint = await complaintService.getComplaintById(
        req.params.id as string,
        (req as any).organizationId
      );

      // --- Privacy Shield (SOC 2 Implementation) ---
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'auditor') {
          const rep = complaint as any;
          if (rep.phone) rep.phone = PrivacyShield.maskPhone(rep.phone);
          if (rep.email) rep.email = PrivacyShield.maskEmail(rep.email);
          if (rep.reporterAddress) rep.reporterAddress = 'Masqué (Confidentialité)';
          if (rep.reporterLocation) {
              const loc = rep.reporterLocation as any;
              const blurred = PrivacyShield.blurLocation(loc.latitude, loc.longitude);
              loc.latitude = blurred.lat;
              loc.longitude = blurred.lng;
          }
      }

      res.json(formatResponse(complaint));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/complaints
   * Create a new complaint
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).organizationId;
      const complaintData = {
        ...req.body,
        userId,
        organizationId,
      };
      const complaint = await complaintService.createComplaint(complaintData);

      // Create Method
      // Audit Log
      if (userId) {
        await prisma.auditLog.create({
          data: {
            action: 'DATA_CREATE',
            userId: userId,
            targetId: (complaint as any).id,
            targetType: 'Complaint',
            details: { event: 'CREATE_TICKET', title: req.body.title, category: req.body.category },
            ipAddress: req.ip,
          }
        });
      }

      // ... inside create method
      // Kafka Event
      await eventBus.publish('complaint-events', 'COMPLAINT_CREATED', {
        complaintId: (complaint as any).id,
        userId: userId,
        title: req.body.title, // Add Title
        category: req.body.category,
        priority: req.body.priority,
        status: 'nouvelle',
        timestamp: new Date(),
      });

      res.status(201).json(formatResponse(complaint, 'Complaint created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/complaints/:id
   * Update a complaint
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const complaint = await complaintService.updateComplaint(
        req.params.id as string,
        req.body,
        (req as any).organizationId
      );

      // Kafka Event (only if status changed or just general update?)
      // We publish generic update, consumer filters if needed.
      // Or specifically status.
      if (req.body.status) {
        await eventBus.publish('complaint-events', 'COMPLAINT_STATUS_UPDATED', {
          complaintId: req.params.id,
          status: req.body.status,
          updatedBy: (req as any).user?.id,
          timestamp: new Date(),
        });
      }

      res.json(formatResponse(complaint, 'Complaint updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/complaints/:id
   * Delete a complaint
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await complaintService.deleteComplaint(req.params.id as string, (req as any).organizationId);
      res.json(formatResponse(null, 'Complaint deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/complaints/stats
   * Get complaint statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await complaintService.getComplaintStats((req as any).organizationId);
      res.json(formatResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/complaints/:id/approve
   * Approve a complaint (change status to 'en cours')
   */
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).organizationId;

      const complaint = await complaintService.approveComplaint(
        req.params.id as string,
        organizationId,
        userId
      );

      // Audit Log
      if (userId) {
        await prisma.auditLog.create({
          data: {
            action: 'DATA_UPDATE',
            userId: userId,
            targetId: (complaint as any).id,
            targetType: 'Complaint',
            details: { event: 'APPROVE_COMPLAINT', number: complaint.number, title: complaint.title },
            ipAddress: req.ip,
          }
        });
      }

      // Kafka Event
      await eventBus.publish('complaint-events', 'COMPLAINT_APPROVED', {
        complaintId: complaint.id,
        approvedBy: userId,
        status: 'en cours',
        timestamp: new Date(),
      });

      res.json(formatResponse(complaint, 'Complaint approved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/complaints/:id/reject
   * Reject a complaint with a reason
   */
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).organizationId;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json(formatError('Rejection reason is required'));
      }

      const complaint = await complaintService.rejectComplaint(
        req.params.id as string,
        organizationId,
        rejectionReason,
        userId
      );

      // Audit Log
      if (userId) {
        await prisma.auditLog.create({
          data: {
            action: 'DATA_UPDATE',
            userId: userId,
            targetId: (complaint as any).id,
            targetType: 'Complaint',
            details: {
              event: 'REJECT_COMPLAINT',
              number: (complaint as any).number,
              title: (complaint as any).title,
              rejectionReason,
            },
            ipAddress: req.ip,
          }
        });
      }

      // Kafka Event
      await eventBus.publish('complaint-events', 'COMPLAINT_REJECTED', {
        complaintId: complaint.id,
        rejectedBy: userId,
        rejectionReason,
        status: 'rejetée',
        timestamp: new Date(),
      });

      res.json(formatResponse(complaint, 'Complaint rejected successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const complaintController = new ComplaintController();
