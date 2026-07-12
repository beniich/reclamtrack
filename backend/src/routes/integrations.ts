/**
 * @file integrations.ts
 * @description Routes for setting up third-party integrations (Slack, Teams, etc).
 * @module backend/routes
 */

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/security.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

import { createOrUpdateContact, getHubspotStatus } from '../services/hubspotService.js';

/**
 * GET /api/integrations/hubspot/status
 * Vérifie le statut de la connexion HubSpot.
 */
router.get('/hubspot/status', asyncHandler(async (req, res) => {
    const status = await getHubspotStatus();
    res.json(successResponse(status));
}));

/**
 * POST /api/integrations/hubspot/lead
 * Capture un prospect et l'envoie vers HubSpot CRM.
 */
router.post('/hubspot/lead', asyncHandler(async (req, res) => {
    const { email, firstname, lastname, company, linkedin_url, phone } = req.body;
    
    if (!email || !firstname) {
        return res.status(400).json({ success: false, message: 'Email et prénom sont requis.' });
    }

    const result = await createOrUpdateContact({
        email,
        firstname,
        lastname: lastname || '',
        company,
        linkedin_url,
        phone,
        lifecyclestage: 'lead'
    });

    res.json(successResponse(result, 'Lead synchronisé avec succès'));
}));


/**
 * POST /api/integrations/slack
 * Configure Slack integration via Webhook URL.
 */
router.post('/slack', asyncHandler(async (req, res) => {
  const { webhookUrl } = req.body as Record<string, unknown>;
  // In a real implementation, save to DB associated with the organization
  await Promise.resolve(successResponse(res, { message: 'Slack integration configured successfully', webhookUrl }));
}));

/**
 * POST /api/integrations/teams
 * Configure Microsoft Teams integration via Webhook URL.
 */
router.post('/teams', asyncHandler(async (req, res) => {
  const { webhookUrl } = req.body as Record<string, unknown>;
  // In a real implementation, save to DB associated with the organization
  await Promise.resolve(successResponse(res, { message: 'Teams integration configured successfully', webhookUrl }));
}));

export default router;
