import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireOrganization } from '../middleware/security.js';
import { validator } from '../middleware/validator.js';
import { Intervention } from '../models/Intervention.js';
import { io } from '../services/socketService.js';

const router = Router();

// Apply global middleware
router.use(authenticate, requireOrganization);

/* GET /api/planning/interventions */
router.get('/interventions', async (req, res, next) => {
  try {
    const { start, end, teamId } = req.query;

    const query: any = { organizationId: req.organizationId };

    if (start && end) {
      query.start = { $gte: new Date(start as string), $lte: new Date(end as string) };
    }

    if (teamId) {
      query.teamId = teamId;
    }

    const interventions = await Intervention.find(query)
      .populate('teamId', 'name color')
      .populate('complaintId', 'title number address') // Include address for map
      .populate('assignedTechnicians', 'name')
      .sort({ start: 1 });

    res.json(interventions);
  } catch (err) {
    next(err);
  }
});

/* POST /api/planning/interventions */
router.post(
  '/interventions',
  [
    body('teamId').isMongoId(),
    body('complaintId').isMongoId(),
    body('title').notEmpty(),
    body('start').isISO8601(),
    body('end').isISO8601(),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']),
    // body('status') defaults to 'scheduled'
  ],
  validator,
  async (req, res, next) => {
    try {
      // Check for conflicts (simple overlap check)
      const { teamId, start, end } = req.body;

      const conflict = await Intervention.findOne({
        organizationId: req.organizationId,
        teamId,
        $or: [{ start: { $lt: end }, end: { $gt: start } }],
      });

      if (conflict) {
        return res.status(409).json({
          message: 'Conflit de planning détecté pour cette équipe.',
          conflictId: conflict._id,
        });
      }

      const intervention = await Intervention.create({
        ...req.body,
        organizationId: req.organizationId,
      });

      // Notify team members (mock)
      if (io) {
        io.emit('new-intervention', intervention);
      }

      res.status(201).json(intervention);
    } catch (err) {
      next(err);
    }
  }
);

/* PATCH /api/planning/interventions/:id */
router.patch(
  '/interventions/:id',
  [
    param('id').isMongoId(),
    body('start').optional().isISO8601(),
    body('end').optional().isISO8601(),
    body('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']),
  ],
  validator,
  async (req, res, next) => {
    try {
      const { start, end, teamId, status } = req.body;
      const existing = await Intervention.findOne({ _id: req.params.id, organizationId: req.organizationId });
      
      if (!existing) return res.status(404).json({ message: 'Intervention introuvable' });

      // If dates are changing, check for conflicts
      if (start || end) {
          const newStart = start || existing.start;
          const newEnd = end || existing.end;
          const targetTeamId = teamId || existing.teamId;

          const conflict = await Intervention.findOne({
              organizationId: req.organizationId,
              teamId: targetTeamId,
              _id: { $ne: existing._id },
              $or: [{ start: { $lt: newEnd }, end: { $gt: newStart } }],
          });

          if (conflict) {
              return res.status(409).json({
                  message: 'Conflit de planning détecté avec ce nouveau créneau.',
                  conflictId: conflict._id,
              });
          }
      }

      // Track timesheets (suivi des heures)
      if (status === 'completed' && existing.status !== 'completed') {
          // Compute total hours based on actual start/end if available, else planned start/end
          const s = new Date(existing.actualStart || existing.start).getTime();
          const e = new Date(existing.actualEnd || existing.end || Date.now()).getTime();
          const totalHours = (e - s) / (1000 * 60 * 60);
          req.body.totalHours = totalHours;
      }

      const updated = await Intervention.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        req.body,
        { new: true }
      );

      if (io) {
        io.emit('intervention-updated', updated);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/* DELETE /api/planning/interventions/:id */
router.delete(
  '/interventions/:id',
  [param('id').isMongoId()],
  validator,
  async (req, res, next) => {
    try {
      const deleted = await Intervention.findOneAndDelete({
        _id: req.params.id,
        organizationId: req.organizationId,
      });
      if (!deleted) return res.status(404).json({ message: 'Intervention introuvable' });
      res.json({ message: 'Intervention supprimée' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
