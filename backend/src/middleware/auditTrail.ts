import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { logger } from '../utils/logger.js';

export const auditTrail = (category: 'AUTH' | 'DATA_ACCESS' | 'CONFIG_CHANGE' | 'SECURITY' | 'COMPLIANCE' | 'SYSTEM' = 'DATA_ACCESS', severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'INFO') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Intercept response to capture status code
        const originalSend = res.send;
        let outcome: 'SUCCESS' | 'FAILURE' | 'BLOCKED' = 'SUCCESS';

        res.send = function (body) {
            if (res.statusCode >= 400 && res.statusCode < 500) outcome = 'BLOCKED';
            if (res.statusCode >= 500) outcome = 'FAILURE';
            return originalSend.call(this, body);
        };

        res.on('finish', async () => {
             // Exclude OPTIONS & basic GET (unless it's a specific HIGH/CRITICAL data access like exports)
             if (req.method === 'OPTIONS') return;
             if (req.method === 'GET' && severity === 'INFO') return; // Don't spam DB with every GET

             const userId = (req as any).user?._id || (req as any).user?.id;
             const action = `${req.method} ${req.route?.path || req.path}`;

             try {
                 const severityMap: any = { INFO: 'LOW', LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' };
                 const mappedSeverity = severityMap[severity] || 'LOW';
                 const actionCode = (category === 'AUTH') ? (outcome === 'SUCCESS' ? 'USER_LOGIN' : 'USER_LOGOUT') : 'DATA_ACCESS';

                 await prisma.auditLog.create({
                     data: {
                         action: actionCode,
                         userId,
                         targetId: (req as any).organizationId || 'none',
                         details: {
                             path: action,
                             organizationId: (req as any).organizationId,
                             category,
                             severity: mappedSeverity,
                             outcome,
                             ipAddress: req.ip,
                             userAgent: req.get('user-agent'),
                             sessionId: req.headers['x-session-id'] || null,
                             requestId: (req as any).id,
                             body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? maskSensitiveData(req.body) : undefined,
                             query: req.query,
                             params: req.params,
                             statusCode: res.statusCode
                         }
                     }
                 });

                 // Trigger Security Detection for non-INFO events
                 if (severity !== 'INFO' || outcome === 'FAILURE') {
                     const { securityDetectionService } = await import('../services/securityDetectionService.js');
                     if (outcome === 'FAILURE' && category === 'AUTH') {
                         await securityDetectionService.detectBruteForce(req.ip || '0.0.0.0', req.body?.email || 'unknown');
                     }

                     if (userId) {
                         await securityDetectionService.detectAnomalousAccess(userId.toString(), req.ip || '0.0.0.0', action);
                     }
                 }
             } catch (error) {
                 logger.error('Failed to save audit log:', error);
             }
        });

        next();
    };
};

// Basic data masking to prevent sensitive info in DB
const maskSensitiveData = (body: any) => {
    if (!body) return body;
    const masked = { ...body };
    const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'apiKey'];
    
    for (const key of Object.keys(masked)) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
            masked[key] = '***MASKED***';
        }
    }
    return masked;
};
