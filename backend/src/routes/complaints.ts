import { Router } from 'express';
import { body, param } from 'express-validator';
import { complaintController } from '../controllers/complaintController.js';
import { authenticate, requireOrganization, requireRole } from '../middleware/security.js';
import { upload } from '../middleware/upload.js';
import { validator } from '../middleware/validator.js';
import { complaintCreationLimiter, globalLimiter } from '../middleware/rateLimiters.js';

const router = Router();

// Apply authentication and organization context to all complaint routes
router.use(authenticate, requireOrganization);

// Apply a global rate limit to ALL operations below
router.use(globalLimiter);

// GET /api/complaints/stats - Must be before /:id route
router.get('/stats', complaintController.getStats.bind(complaintController));

// GET /api/complaints
router.get('/', complaintController.getAll.bind(complaintController));

// GET /api/complaints/:id
router.get('/:id', complaintController.getById.bind(complaintController));

// POST /api/complaints
router.post(
  '/',
  complaintCreationLimiter,
  upload.array('photos', 5), // Handle up to 5 photos
  [
    // Step 1: Info
    body('category').notEmpty().withMessage('Category is required').trim().escape(),
    body('subcategory').notEmpty().withMessage('Subcategory is required').trim().escape(),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']),
    body('title').notEmpty().trim().escape(),
    body('description').notEmpty().trim().escape(),

    // Step 2: Location
    body('address').notEmpty().trim().escape(),
    body('city').notEmpty().trim().escape(),
    body('district').notEmpty().trim().escape(),

    // Step 4: Contact
    body('isAnonymous').optional().isBoolean(),
  ],
  validator,
  complaintController.create.bind(complaintController)
);

// PUT /api/complaints/:id
router.put(
  '/:id',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD', 'AGENT']),
  [
    param('id').isUUID(),
    body('status').optional().isIn(['nouvelle', 'en cours', 'résolue', 'fermée', 'rejetée']),
    body('assignedTeamId').optional().isUUID(),
    body('technicianId').optional().isUUID(),
  ],
  validator,
  complaintController.update.bind(complaintController)
);

// DELETE /api/complaints/:id
router.delete(
  '/:id',
  requireRole(['ADMIN', 'OWNER']),
  [param('id').isUUID()],
  validator,
  complaintController.delete.bind(complaintController)
);

// POST /api/complaints/:id/approve - Approve a complaint (Admin/Owner/Tech Lead only)
router.post(
  '/:id/approve',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD']),
  [param('id').isUUID()],
  validator,
  complaintController.approve.bind(complaintController)
);

// POST /api/complaints/:id/reject - Reject a complaint (Admin/Owner/Tech Lead only)
router.post(
  '/:id/reject',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD']),
  [
    param('id').isUUID(),
    body('rejectionReason').notEmpty().withMessage('Rejection reason is required').trim().escape(),
  ],
  validator,
  complaintController.reject.bind(complaintController)
);

export default router;
