import { Router } from 'express';
import { authenticate as protect } from '../middleware/security.js';
import { Leave } from '../models/Leave.js';
import { io } from '../services/socketService.js';

const router = Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const filter: any = {};
    if (req.organizationId) {
      filter.organizationId = req.organizationId;
    }
    if (req.query.staffId) {
      filter.staffId = req.query.staffId;
    }

    const leaves = await Leave.find(filter).populate('staffId').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      organizationId: req.organizationId,
    };
    const newLeave = await Leave.create(data);
    res.status(201).json(newLeave);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('staffId');
    
    if (leave && io) {
        io.emit('leave-updated', {
            leave,
            message: `Votre demande de congé a été ${status === 'Approved' ? 'approuvée' : status === 'Declined' ? 'refusée' : 'mise à jour'}.`
        });
    }

    res.json(leave);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
