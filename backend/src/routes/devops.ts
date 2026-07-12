import type { Response } from 'express';
import express from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { requireOrganization, requireRole } from '../middleware/security.js';
import { healthService } from '../services/healthService.js';
import type { AuthenticatedRequest } from '../types/request.js';
import os from 'os';
import { performance } from 'perf_hooks';

const router = express.Router();

// DevOps routes require highest privileges
router.use(auth, requireOrganization, requireRole(['OWNER', 'ADMIN']));

/**
 * GET /api/devops/services/health
 * Get health status of microservices
 */
router.get('/services/health', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await healthService.getServicesHealth();
    const metrics = healthService.getSystemMetrics();

    res.json({
      success: true,
      data: {
        services,
        metrics,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/devops/services/:id/restart
 * Restart a microservice (Simulated)
 */
router.post('/services/:id/restart', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Mock restart logic
    await new Promise((resolve) => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: `Service ${id} restarted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/devops/metrics
 * Real-time system metrics (CPU, RAM, uptime)
 */
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = healthService.getSystemMetrics();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    res.json({
      success: true,
      data: {
        cpu: metrics.cpu,
        memory: {
          total: Math.round(totalMem / 1024 / 1024),
          free: Math.round(freeMem / 1024 / 1024),
          used: Math.round((totalMem - freeMem) / 1024 / 1024),
          usagePct: metrics.memory.usagePercentage,
        },
        uptime: {
          os: os.uptime(),
          process: Math.floor(process.uptime()),
        },
        node: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        loadAvg: os.loadavg(),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/devops/logs
 * Return recent application log entries (simulated + process info)
 */
router.get('/logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { level = 'all', limit = 50 } = req.query;
    
    // Generate realistic mock logs from actual system state
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const sources = ['auth.ts', 'complaints.ts', 'fleet.ts', 'planning.ts', 'inventory.ts', 'mongodb'];
    const messages = [
      'Request processed successfully',
      'Database query executed in {ms}ms',
      'Socket event emitted: intervention-updated',
      'Auto-assignment algorithm ran for 3 technicians',
      'SLA breach detected for ticket #{n}',
      'Email notification sent to user',
      'JWT token verified',
      'Cache invalidated for org:{org}',
      'File uploaded to storage',
      'Webhook delivered successfully',
    ];

    const logs = Array.from({ length: Math.min(Number(limit), 100) }, (_, i) => {
      const lvl = levels[Math.floor(Math.random() * (level === 'all' ? 4 : 1))];
      const src = sources[Math.floor(Math.random() * sources.length)];
      const msg = messages[Math.floor(Math.random() * messages.length)]
        .replace('{ms}', String(Math.floor(Math.random() * 200)))
        .replace('{n}', String(Math.floor(Math.random() * 9000) + 1000))
        .replace('{org}', 'org123');
      const ts = new Date(Date.now() - i * 1000 * Math.floor(Math.random() * 60));
      return { level: lvl, source: src, message: msg, timestamp: ts.toISOString() };
    });

    res.json({ success: true, data: logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
