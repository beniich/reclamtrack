/**
 * @file auth.ts
 * @description Authentication routes: register, login, /me, /refresh (token rotation),
 *              /logout, /introspect (phantom token pattern for service-to-service).
 * @module backend/routes
 */

import crypto from 'crypto';
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/security.js';
import { validator } from '../middleware/validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';
import { eventBus } from '../services/eventBus.js';
import {
  introspectToken,
  issueTokenPair,
  revokeAllUserTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/tokenService.js';
import {
  conflictResponse,
  createdResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
} from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/** Génère un slug unique depuis le domaine email (ex: john@acme.com → acme) */
function slugFromEmail(email: string): string {
  const domain = email.split('@')[1] || email;
  const base = domain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

import { securityDetectionService } from '../services/securityDetectionService.js';

const router = Router();
// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[A-Z]/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/)
      .withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('name').optional().trim().isLength({ max: 100 }),
  ],
  validator,
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return conflictResponse(res, 'Email déjà utilisé');

      const verificationToken = crypto.randomBytes(32).toString('hex');

      // ── 1. Créer l'utilisateur ────────────────────────────────────────────
      const user = await User.create({
        email,
        password,
        name,
        emailVerificationToken: verificationToken,
        role: 'admin', // Le créateur d'une org est admin par défaut
      });

      // ── 2. Créer l'organisation automatiquement (slug depuis domaine email) ─
      const slug = slugFromEmail(email);
      const orgName = name ? `Org de ${name}` : slug;
      const organization = await Organization.create({
        name: orgName,
        slug,
        ownerId: user._id,
        subscription: {
          plan: 'FREE',
          status: 'TRIAL',
          maxUsers: 5,
          maxTickets: 100,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours trial
        },
      });

      // ── 3. Lier l'utilisateur à l'organisation (OWNER) ────────────────────
      await Membership.create({
        userId: user._id,
        organizationId: organization._id,
        roles: ['OWNER'],
        status: 'ACTIVE',
      });

      // Mettre à jour l'organizationId sur le user
      user.organizationId = organization._id as any;
      await user.save();

      // ── 4. Email de vérification ─────────────────────────────────────────
      await sendEmailVerification(user.email, verificationToken);

      // ── 5. Audit log ─────────────────────────────────────────────────────
      logger.info(`✅ Inscription — ${email} → org: ${slug}`);
      await AuditLog.create({
        action: 'REGISTER',
        userId: user._id,
        targetId: user._id.toString(),
        targetType: 'User',
        category: 'AUTH',
        severity: 'INFO',
        outcome: 'SUCCESS',
        details: { email, role: user.role, organizationId: organization._id, slug },
        ipAddress: req.ip,
      });

      await eventBus.publish('auth-events', 'USER_REGISTERED', {
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        timestamp: new Date(),
      });

      // ── 6. Ne pas retourner de tokens si vérification email requise ───────
      const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
      if (requireEmailVerification) {
        return createdResponse(res, {
          user: { id: user._id, email, role: user.role, organizationId: organization._id },
          message: 'Compte créé. Veuillez vérifier votre email avant de vous connecter.',
          emailVerificationRequired: true,
        });
      }

      const tokens = await issueTokenPair(user._id.toString(), user.role, user.email, req.ip);
      return createdResponse(res, {
        ...tokens,
        user: { id: user._id, email, role: user.role, organizationId: organization._id },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validator,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`Login failed: user not found – ${email}`);
        
        await AuditLog.create({
            action: 'LOGIN',
            targetType: 'Session',
            category: 'AUTH',
            severity: 'MEDIUM',
            outcome: 'FAILURE',
            details: { email, reason: 'user_not_found' },
            ipAddress: req.ip,
        });
        
        await securityDetectionService.detectBruteForce(req.ip, email);
        return unauthorizedResponse(res, 'Identifiants invalides');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
          const waitTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          return res.status(403).json({
              success: false,
              message: `Compte verrouillé. Réessayez dans ${waitTime} minutes.`,
              code: 'ACCOUNT_LOCKED'
          });
      }

      const matched = await user.comparePassword(password);
      if (!matched) {
        // Increment failed count and lock if necessary
        user.failedLoginCount = (user.failedLoginCount || 0) + 1;
        if (user.failedLoginCount >= 5) {
            user.lockedUntil = new Date(Date.now() + 30 * 60000); // Lock for 30 mins
            logger.warn(`🚫 Account locked — ${email} after 5 failed attempts`);
        }
        await user.save();

        logger.warn(`Login failed: bad password – ${email} (Attempt ${user.failedLoginCount})`);
        
        await AuditLog.create({
            action: 'LOGIN',
            userId: user._id,
            targetId: user._id.toString(),
            targetType: 'Session',
            category: 'AUTH',
            severity: 'MEDIUM',
            outcome: 'FAILURE',
            details: { email, reason: 'bad_password', attempt: user.failedLoginCount },
            ipAddress: req.ip,
        });
        
        await securityDetectionService.detectBruteForce(req.ip, email);
        return unauthorizedResponse(res, 'Identifiants invalides');
      }

      // Reset lockout stats on success
      user.failedLoginCount = 0;
      user.lockedUntil = undefined;
      user.lastLoginAt = new Date();
      user.lastLoginIp = req.ip;
      await user.save();

      const tokens = await issueTokenPair(user._id.toString(), user.role, user.email, req.ip);

      logger.info(`🔐 Connexion — ${email}`);
      await AuditLog.create({
        action: 'LOGIN',
        userId: user._id,
        targetId: user._id.toString(),
        targetType: 'Session',
        category: 'AUTH',
        severity: 'INFO',
        outcome: 'SUCCESS',
        details: { email, role: user.role },
        ipAddress: req.ip,
      });

      await eventBus.publish('auth-events', 'USER_LOGIN', {
        userId: user._id,
        email: user.email,
        role: user.role,
        timestamp: new Date(),
      });

      return successResponse(res, {
        ...tokens,
        user: { id: user._id, email, role: user.role, organizationId: user.organizationId },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) return notFoundResponse(res, 'Utilisateur');
    return successResponse(res, {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      organizationId: user.organizationId,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh   — Refresh token rotation
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('refreshToken requis')],
  validator,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await rotateRefreshToken(refreshToken, req.ip);
      logger.info(`🔄 Token refresh – user rotated`);
      return successResponse(res, tokens);
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────────────────────────────────────
router.post('/logout', [body('refreshToken').optional()], async (req, res, next) => {
  try {
    const { refreshToken, allDevices } = req.body;

    if (allDevices && req.user?.id) {
      await revokeAllUserTokens(req.user.id);
    } else if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    logger.info('🚪 User logged out');
    return successResponse(res, { message: 'Déconnexion réussie' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/introspect  — Phantom Token pattern (service-to-service)
// Restricted to internal network / service accounts via IP or x-internal-secret header
// ──────────────────────────────────────────────────────────────────────────────
router.post('/introspect', async (req, res, next) => {
  try {
    // Validate internal secret header to restrict to backend services only
    const internalSecret = req.headers['x-internal-secret'];
    if (!process.env.INTERNAL_SECRET || internalSecret !== process.env.INTERNAL_SECRET) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'token requis',
        code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString(),
      });
    }

    const payload = await introspectToken(token);
    return successResponse(res, { active: !!payload, ...(payload ?? {}) });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validator,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Return success even if user not found for security
        return successResponse(res, {
          message:
            'Si cet email correspond à un compte, vous recevrez un lien de réinitialisation.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      await sendPasswordResetEmail(user.email, resetToken);

      logger.info(`🔑 Demande reset password — ${email}`);
      return successResponse(res, {
        message: 'Si cet email correspond à un compte, vous recevrez un lien de réinitialisation.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }).withMessage('8 caractères minimum'),
  ],
  validator,
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return unauthorizedResponse(res, 'Token invalide ou expiré');
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.info(`✅ Password reset — ${user.email}`);
      return successResponse(res, { message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ──────────────────────────────────────────────────────────────────────────────
router.post('/verify-email', [body('token').notEmpty()], validator, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return notFoundResponse(res, 'Token de vérification invalide');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    logger.info(`📧 Email vérifié — ${user.email}`);
    return successResponse(res, { message: 'Email vérifié avec succès' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Sessions Management (SOC 2 CC6.1)
// ──────────────────────────────────────────────────────────────────────────────

router.get('/sessions', authenticate, async (req, res, next) => {
    try {
        const { getActiveSessionsForUser } = await import('../services/tokenService.js');
        const sessions = await getActiveSessionsForUser(req.user!.id);
        
        return successResponse(res, sessions);
    } catch (err) {
        next(err);
    }
});

router.delete('/sessions/:hash', authenticate, async (req, res, next) => {
    try {
        const { revokeTokenByHash } = await import('../services/tokenService.js');
        await revokeTokenByHash(req.params.hash as string);
        
        logger.info(`🚫 Session revoked manually: ${req.params.hash}`);
        return successResponse(res, { message: 'Session révoquée' });
    } catch (err) {
        next(err);
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// 2FA (TOTP)
// ──────────────────────────────────────────────────────────────────────────────

router.post('/2fa/setup', authenticate, asyncHandler(async (req, res) => {
  // Skeleton: Generate TOTP secret and QR code URI
  successResponse(res, { secret: 'dummy_secret', qrCode: 'dummy_qr' });
}));

router.post('/2fa/verify', authenticate, [
  body('code').isString().isLength({ min: 6, max: 6 }),
], validator, asyncHandler(async (req, res) => {
  // Skeleton: Verify TOTP code and enable 2FA
  successResponse(res, { message: '2FA activé avec succès' });
}));

router.post('/2fa/disable', authenticate, [
  body('code').isString().isLength({ min: 6, max: 6 }),
], validator, asyncHandler(async (req, res) => {
  // Skeleton: Verify TOTP code and disable 2FA
  successResponse(res, { message: '2FA désactivé avec succès' });
}));

// ──────────────────────────────────────────────────────────────────────────────
// Password Reset
// ──────────────────────────────────────────────────────────────────────────────

router.post('/password-reset/request', [
  body('email').isEmail().normalizeEmail(),
], validator, asyncHandler(async (req, res) => {
  // Skeleton: Generate reset token and send email
  successResponse(res, { message: 'Email de réinitialisation envoyé si le compte existe' });
}));

router.post('/password-reset/confirm', [
  body('token').isString(),
  body('newPassword').isLength({ min: 8 }),
], validator, asyncHandler(async (req, res) => {
  // Skeleton: Verify token and update password
  successResponse(res, { message: 'Mot de passe mis à jour avec succès' });
}));

export default router;
