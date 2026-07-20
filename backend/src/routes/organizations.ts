import type { Response} from 'express';
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireOrganization } from '../middleware/security.js';
import { validator } from '../middleware/validator.js';
import prisma from '../lib/prisma.js';

const router = Router();

/**
 * @route   POST /api/organizations
 * @desc    Create a new organization
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().trim().isLength({ min: 3, max: 100 }),
    body('slug')
      .notEmpty()
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-z0-9-]+$/),
  ],
  validator,
  async (req: any, res: Response) => {
    try {
      const { name, slug } = req.body;
      const userId = req.user.id;

      // Check if slug already exists
      const existing = await prisma.organization.findUnique({ where: { slug } });
      if (existing) {
        return res.status(409).json({ message: 'Ce slug est déjà utilisé' });
      }

      // Create organization
      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          ownerId: userId,
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'TRIAL',
          subscriptionMaxUsers: 5,
          subscriptionMaxTickets: 100,
          // Trial expires in 14 days
          subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        }
      });

      // Create membership for the creator (OWNER role)
      await prisma.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          roles: ['OWNER'],
          status: 'ACTIVE',
        }
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'DATA_CREATE',
          userId,
          targetId: organization.id,
          targetType: 'Organization',
          details: { event: 'CREATE_ORGANIZATION', name, slug },
          ipAddress: req.ip,
        }
      });

      res.status(201).json({
        success: true,
        organization,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/organizations
 * @desc    Get all organizations the user is a member of
 * @access  Private
 */
router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Find all memberships for this user
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        organization: true
      }
    });

    const organizations = memberships
      .filter((m) => m.organization) // Guard against null populates
      .map((m) => ({
        ...m.organization,
        membership: {
          roles: m.roles,
          joinedAt: m.joinedAt,
        },
      }));

    res.json({ success: true, organizations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization details
 * @access  Private (must be a member)
 */
router.get('/:id', authenticate, requireOrganization, async (req: any, res: Response) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.organizationId }
    });
    
    if (!organization) {
      return res.status(404).json({ message: 'Organisation introuvable' });
    }

    res.json({
      success: true,
      organization,
      membership: {
        roles: req.membership.roles,
        joinedAt: req.membership.joinedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/organizations/:id
 * @desc    Update organization settings
 * @access  Private (Admin only)
 */
router.patch('/:id', authenticate, requireOrganization, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Check admin permission
    if (!req.membership.isAdmin()) {
      return res.status(403).json({ message: 'Droits insuffisants' });
    }

    const organization = await prisma.organization.update({
      where: { id: req.organizationId },
      data: req.body
    });

    res.json({ success: true, organization });
  } catch (error: any) {
    if (error.code === 'P2025') { // Record not found
       return res.status(404).json({ message: 'Organisation introuvable' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
