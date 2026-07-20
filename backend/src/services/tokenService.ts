/**
 * @file tokenService.ts
 * @description Service for issuing, rotating, and revoking JWT token pairs.
 *              Implements:
 *              - Short-lived access tokens (15 min)
 *              - Long-lived refresh tokens (7d), stored as SHA-256 hash in DB
 *              - Refresh token rotation with family-based reuse attack detection
 *              - Phantom token introspection endpoint support
 * @module backend/services
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import {
  AuthAppError,
  NotFoundAppError,
  TokenExpiredAppError,
  TokenInvalidAppError,
} from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hash a raw token to the value stored in DB.
 */
const hashToken = (raw: string): string => crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Generate a cryptographically secure opaque refresh token (48 bytes → 96 hex chars).
 */
const generateRawRefreshToken = (): string => crypto.randomBytes(48).toString('hex');

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Issue a fresh access + refresh token pair for the given user.
 * Creates a new refresh token family.
 *
 * @param userId - String UUID of the authenticated user
 * @param role - User role embedded in JWT payload
 * @param email - User email embedded in JWT payload
 * @param ip - Client IP address for audit trail
 */
export const issueTokenPair = async (
  userId: string,
  role: string,
  email: string,
  ip?: string
): Promise<TokenPair> => {
  const accessToken = jwt.sign({ id: userId, role, email }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  } as jwt.SignOptions);

  const rawRefresh = generateRawRefreshToken();
  const family = uuidv4();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawRefresh),
      family,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdFromIp: ip || null,
      ipAddress: ip || null,
    }
  });

  logger.info(`[TokenService] Issued token pair for user ${userId}`, { family });

  // Parse expiry from access token string to get exact seconds
  const decoded = jwt.decode(accessToken) as { exp: number };
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  return { accessToken, refreshToken: rawRefresh, expiresIn };
};

/**
 * Rotate a refresh token: validates the current one, revokes it,
 * issues a new pair in the same family.
 *
 * 🔒 If the presented token is already revoked, the ENTIRE family is revoked
 * (reuse attack detection — "refresh token theft" mitigation).
 *
 * @param rawRefreshToken - Raw refresh token string from the client
 * @param ip - Client IP address
 * @throws TokenExpiredAppError | TokenInvalidAppError | AuthAppError
 */
export const rotateRefreshToken = async (
  rawRefreshToken: string,
  ip?: string
): Promise<TokenPair> => {
  const tokenHash = hashToken(rawRefreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record) {
    throw new TokenInvalidAppError();
  }

  // Reuse attack: token already revoked → revoke entire family
  if (record.revokedAt) {
    logger.warn(
      `[TokenService] 🚨 Refresh token REUSE detected — revoking family ${record.family}`
    );
    await prisma.refreshToken.updateMany({
      where: { family: record.family, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    throw new AuthAppError(
      'Session compromise détectée — reconnectez-vous',
      'AUTH_SESSION_COMPROMISED'
    );
  }

  // Expired
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() }
    });
    throw new TokenExpiredAppError();
  }

  // Revoke current token
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() }
  });

  // Load user to get latest role/email (in case they changed)
  const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { role: true, email: true } });
  if (!user) {
    throw new NotFoundAppError('Utilisateur');
  }

  // Issue new pair (keeps the SAME family)
  const accessToken = jwt.sign(
    { id: record.userId, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    } as jwt.SignOptions
  );

  const newRawRefresh = generateRawRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: record.userId,
      tokenHash: hashToken(newRawRefresh),
      family: record.family, // Link to existing family
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdFromIp: ip || null,
      ipAddress: ip || null,
    }
  });

  logger.info(`[TokenService] Rotated refresh token for user ${record.userId}`, {
    family: record.family,
  });

  const decoded = jwt.decode(accessToken) as { exp: number };
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  return { accessToken, refreshToken: newRawRefresh, expiresIn };
};

/**
 * Log out user from a specific device by revoking their refresh token.
 */
export const revokeRefreshToken = async (rawRefreshToken: string): Promise<void> => {
  const tokenHash = hashToken(rawRefreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (record && !record.revokedAt) {
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() }
    });
    logger.info(`[TokenService] Revoked refresh token for user ${record.userId}`);
  }
};

/**
 * Log out user from ALL devices (revoke entire family or all families).
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  logger.info(`[TokenService] Revoked ALL tokens for user ${userId}`);
};

/**
 * Phantom Token Introspection (Service-to-Service).
 * Translates opaque token back to user payload if valid.
 */
export const introspectToken = async (accessToken: string): Promise<any | null> => {
  try {
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
    return {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (err) {
    return null;
  }
};

/**
 * Sessions Management: List all active sessions for a user
 * SOC 2 CC6.1 - Allow users to view active sessions.
 */
export const getActiveSessionsForUser = async (userId: string) => {
  const activeTokens = await prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });

  return activeTokens.map(token => ({
    id: token.id, // safe to expose DB id? Yes, or maybe just hash. In previous code we returned tokenHash snippet. Let's return tokenHash.
    hash: token.tokenHash, // Using hash as session identifier
    ipAddress: token.createdFromIp || token.ipAddress,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
  }));
};

/**
 * Revoke a specific session by hash (used by users in their dashboard).
 */
export const revokeTokenByHash = async (tokenHash: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  });
};
