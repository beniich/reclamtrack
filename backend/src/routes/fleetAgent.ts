import { Router } from 'express';
import { authenticate } from '../middleware/security.js';
import { FleetTrafficAgent } from '../services/fleetAgent.service.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * @route GET /api/fleet-agent/optimize/:complaintId
 */
router.get('/optimize/:complaintId', authenticate, async (req, res, next) => {
    try {
        const recommendations = await FleetTrafficAgent.recommendBestTeamForComplaint(req.params.complaintId as string);
        return successResponse(res, recommendations);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/fleet-agent/status
 */
router.get('/status', authenticate, (req, res, next) => {
    try {
        const status = FleetTrafficAgent.getFleetTrafficStatus();
        return successResponse(res, status);
    } catch (err) {
        next(err);
    }
});

export default router;
