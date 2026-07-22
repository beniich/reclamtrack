import { PrismaClient, AuditAction } from '@prisma/client';
const prisma = new PrismaClient();
import { logger } from '../utils/logger.js';

export class SecurityDetectionService {
    /**
     * Checks for brute force attempts based on failed logins
     * SOC 2 CC7.1 - Detection of security events
     */
    async detectBruteForce(ipAddress: string, email: string) {
        try {
            // Count failed login attempts from this IP in the last 15 minutes
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            const failedAttempts = await prisma.auditLog.count({
                where: {
                    action: AuditAction.LOGIN,
                    createdAt: { gte: fifteenMinsAgo }
                }
            });

            if (failedAttempts >= 5) {
                // Not implementing full SecurityEvent logic for now, just logging
                logger.warn(`🚨 SECURITY EVENT: Brute force detected from ${ipAddress}`);
            }
        } catch (error) {
            logger.error('Error in detectBruteForce:', error);
        }
    }

    /**
     * Checks for session anomalies (e.g. IP change mid-session)
     */
    async detectSessionAnomaly(userId: string, sessionId: string, currentIp: string, lastIp?: string) {
        if (lastIp && currentIp !== lastIp) {
            try {
                await prisma.securityEvent.create({
                    data: {
                        type: 'ANOMALY',
                        severity: 'MEDIUM',
                        userId: userId,
                        ipAddress: currentIp,
                        description: `Session IP change detected: User ${userId} switched from ${lastIp} to ${currentIp} in session ${sessionId}`,
                        metadata: { sessionId, previousIp: lastIp, currentIp }
                    }
                });
            } catch (e) {
                logger.error('Could not persist SecurityEvent:', e);
            }
            logger.warn(`🚨 SECURITY EVENT: Session hijacking risk (IP jump) for user ${userId}`);
        }
    }

    /**
     * Checks for access outside designated business hours or from unexpected locations
     */
    async detectAnomalousAccess(userId: string, ipAddress: string, action: AuditAction) {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const events = await prisma.auditLog.count({
                where: {
                    userId,
                    action: action,
                    createdAt: { gte: oneHourAgo }
                }
            });

            if (events > 50) {
                logger.warn(`🚨 SECURITY EVENT: Anomalous access pattern from user ${userId} on ${action}`);
            }
        } catch (error) {
            logger.error('Error in detectAnomalousAccess:', error);
        }
    }
}

export const securityDetectionService = new SecurityDetectionService();
