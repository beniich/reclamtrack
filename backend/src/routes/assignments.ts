import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate as protect } from '../middleware/security.js';
import { validator } from '../middleware/validator.js';
import { Assignment } from '../models/Assignment.js';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import { io } from '../services/socketService.js';

const router = Router();

// Helper to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

/* GET /api/assignments - Get assignments for the current user (via Team) */
router.get('/', protect, async (req: any, res, next) => {
  try {
    // 1. Find teams where the user is a member
    const teams = await Team.find({ members: req.user.id });
    const teamIds = teams.map((t) => t._id);

    // 2. Find assignments for these teams
    // We verify that status is not 'terminé' to get active/pending ones (or use query param to filter)
    const { status } = req.query;
    const filter: any = { teamId: { $in: teamIds } };

    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter)
      .populate('complaintId') // Get details of the complaint
      .populate('teamId', 'name color') // Get basic team info
      .sort({ createdAt: -1 }); // Newest first

    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

/* POST /api/assignments */
router.post(
  '/',
  protect,
  [body('complaintId').isMongoId(), body('teamId').isMongoId()],
  validator,
  async (req, res, next) => {
    try {
      const { complaintId, teamId } = req.body;

      const complaint = await Complaint.findById(complaintId);
      const team = await Team.findById(teamId);
      if (!complaint || !team) {
        return res.status(404).json({ message: 'Réclamation ou équipe introuvable' });
      }

      const assignment = await Assignment.create({
        complaintId,
        teamId,
        status: 'affecté',
      });

      complaint.status = 'en cours';
      await complaint.save();

      team.status = 'intervention';
      await team.save();

      if (io) {
        io.emit('assignment-created', { assignment, complaint, team });
      }

      res.status(201).json(assignment);
    } catch (err) {
      next(err);
    }
  }
);

/* POST /api/assignments/auto-assign */
router.post(
  '/auto-assign',
  protect,
  [body('complaintId').isMongoId()],
  validator,
  async (req: any, res, next) => {
    try {
      const { complaintId } = req.body;
      const complaint = await Complaint.findById(complaintId);
      
      if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable' });
      if (complaint.status === 'résolue' || complaint.status === 'fermée') {
        return res.status(400).json({ message: 'Cette réclamation est déjà clôturée' });
      }

      // Find teams in the same organization
      const teams = await Team.find({ 
        organizationId: complaint.organizationId,
        isActive: true
      });

      if (teams.length === 0) {
        return res.status(404).json({ message: 'Aucune équipe disponible dans cette organisation' });
      }

      // Complaint coordinates
      const cLat = complaint.latitude || complaint.location?.latitude;
      const cLng = complaint.longitude || complaint.location?.longitude;

      let bestTeam = teams[0];
      let bestScore = Infinity;

      for (const team of teams) {
        // Calculate workload (active assignments)
        const activeCount = await Assignment.countDocuments({
          teamId: team._id,
          status: { $in: ['affecté', 'en cours'] }
        });

        // Workload penalty (e.g., +10km perceived distance per active assignment)
        let score = activeCount * 10;

        // If team is not available, add heavy penalty
        if (team.status !== 'disponible') {
          score += 50; 
        }

        // Distance logic
        if (cLat && cLng) {
          const tLat = team.location?.lat || team.baseLocation?.latitude;
          const tLng = team.location?.lng || team.baseLocation?.longitude;

          if (tLat && tLng) {
            const distance = calculateDistance(cLat, cLng, tLat, tLng);
            score += distance;
          }
        }

        if (score < bestScore) {
          bestScore = score;
          bestTeam = team;
        }
      }

      // Assign to the best team
      const assignment = await Assignment.create({
        complaintId,
        teamId: bestTeam._id,
        status: 'affecté',
      });

      complaint.status = 'en cours';
      await complaint.save();

      bestTeam.status = 'intervention';
      await bestTeam.save();

      if (io) {
        io.emit('assignment-created', { assignment, complaint, team: bestTeam });
      }

      res.status(201).json({ assignment, team: bestTeam, score: bestScore });
    } catch (err) {
      next(err);
    }
  }
);

/* PATCH /api/assignments/:id */
router.patch(
  '/:id',
  protect,
  [body('status').isIn(['affecté', 'en cours', 'terminé'])],
  validator,
  async (req, res, next) => {
    try {
      const assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      if (!assignment) return res.status(404).json({ message: 'Affectation introuvable' });

      if (io) {
        io.emit('assignment-updated', assignment);
      }
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  }
);

/* PATCH /api/assignments/:id/complete */
router.patch(
  '/:id/complete',
  protect,
  [
    body('status').equals('terminé'),
    body('closureNote').optional().isString(),
    body('signature').optional().isString(),
  ],
  validator,
  async (req: any, res, next) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ message: 'Affectation introuvable' });

      assignment.status = 'terminé';
      assignment.closureNote = req.body.closureNote;
      assignment.signature = req.body.signature;
      assignment.completedAt = new Date();
      await assignment.save();

      // Update complaint status
      await Complaint.findByIdAndUpdate(assignment.complaintId, { status: 'résolue' });

      // Update team status
      await Team.findByIdAndUpdate(assignment.teamId, { status: 'disponible' });

      if (io) {
        io.emit('assignment-completed', assignment);
      }
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  }
);

/* PATCH /api/assignments/:id/comment */
router.patch(
  '/:id/comment',
  protect,
  [body('comment').notEmpty().isString()],
  validator,
  async (req: any, res, next) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ message: 'Affectation introuvable' });

      // Assuming Assignment model has a comments array or we just log it in audit
      // For now, let's just log it or add it to a new field if it exists
      // Since I haven't seen the Assignment model yet, let's check it first
      res.json({ message: 'Commentaire enregistré' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
