import { Router } from 'express';
import { authenticate } from '../middleware/security.js';
import { SmartTicketService } from '../services/smartTicket.service.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * @route GET /api/smart-vision/analysis/:id
 */
router.get('/analysis/:id', authenticate, async (req, res, next) => {
    try {
        const insights = await SmartTicketService.generateSmartInsights(req.params.id as string);
        return successResponse(res, insights);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/smart-vision/global
 */
router.get('/global', authenticate, async (req, res, next) => {
    try {
        const global = await SmartTicketService.getGlobalSmartAnalysis();
        return successResponse(res, global);
    } catch (err) {
        next(err);
    }
});

export default router;
