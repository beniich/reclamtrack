import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB } from './config/db.js';
import { envValidator } from './config/envValidator.js';
import { auditTrail } from './middleware/auditTrail.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { requestId } from './middleware/requestId.js';
import { authenticate, requireAdmin, securityHeaders } from './middleware/security.js';
import { initSocket } from './services/socketService.js';
import { startSagaConsumer } from './services/sagaConsumer.js';
import { logger } from './utils/logger.js';

import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import apiKeysRoutes from './routes/api-keys.js';
import assignmentRoutes from './routes/assignments.js';
import auditRoutes from './routes/audit.js';
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import complaintRoutes from './routes/complaints.js';
import complianceRoutes from './routes/compliance.js';
import dashboardRoutes from './routes/dashboard.js';
import dbRoutes from './routes/db.js';
import devopsRoutes from './routes/devops.js';
import eventsRoutes from './routes/events.js';
import feedbackRoutes from './routes/feedback.js';
import fleetRoutes from './routes/fleet.js';
import fleetAgentRoutes from './routes/fleetAgent.js';
import googleAuthRoutes from './routes/googleAuth.js';
import hrRoutes from './routes/hr.js';
import interventionRoutes from './routes/interventions.js';
import inventoryRoutes from './routes/inventory.js';
import itTicketsRoutes from './routes/it-tickets.js';
import knowledgeRoutes from './routes/knowledge.js';
import leaveRoutes from './routes/leave.js';
import memberRoutes from './routes/members.js';
import messageRoutes from './routes/messages.js';
import monitoringRoutes from './routes/monitoring.js';
import notificationRoutes from './routes/notifications.js';
import organizationRoutes from './routes/organizations.js';
import planningRoutes from './routes/planning.js';
import rosterRoutes from './routes/roster.js';
import schedulerRoutes from './routes/scheduler.js';
import simulationRoutes from './routes/simulation.js';
import smartVisionRoutes from './routes/smartVision.js';
import staffRoutes from './routes/staff.js';
import teamRoutes from './routes/teams.js';
import uploadRoutes from './routes/upload.js';
import technicalSchemaRoutes from './routes/technical-schemas.js';
import assetRoutes from './routes/assets.js';
import workOrderRoutes from './routes/workOrders.js';
import maintenancePlanRoutes from './routes/maintenancePlans.js';
import mroRoutes from './routes/mro.js';
import auditAgentRoutes from './routes/auditAgent.js';
import aiRoutes from './routes/ai.js';

// IT Administration Module Routes
import adRoutes from './routes/ad.js';
import itAssetsRoutes from './routes/it-assets.js';
import networkRoutes from './routes/network.js';
import securityRoutes from './routes/security.js';
import sshRoutes from './routes/ssh-management.js';

// New feature routes
import reportsRoutes from './routes/reports.js';
import webhooksRoutes from './routes/webhooks.js';
import integrationsRoutes from './routes/integrations.js';

// Validate environment
envValidator();

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(requestId);
app.use(securityHeaders);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow accessing images
  })
);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1 && allowedOrigins[0] !== '*') {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use('/api/', globalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation
const swaggerDocument = YAML.load('./docs/openapi.yaml') as Record<string, unknown>;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Audit Middleware (SOC 2 CC6.1 Compliant)
app.use('/api', auditTrail('DATA_ACCESS', 'INFO'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);

app.use('/api/db', dbRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api', memberRoutes); // Handles /organizations/:id/members and related
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/api-keys', apiKeysRoutes);

// IT Administration Module Routes
app.use('/api/it-assets', itAssetsRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/it-tickets', itTicketsRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/devops', devopsRoutes);
app.use('/api/ssh', sshRoutes);
app.use('/api/technical-schemas', technicalSchemaRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/maintenance-plans', maintenancePlanRoutes);
app.use('/api/mro', mroRoutes);
app.use('/api/audit-agent', auditAgentRoutes);
app.use('/api/fleet-agent', fleetAgentRoutes);
app.use('/api/smart-vision', smartVisionRoutes);
app.use('/api/simulation', simulationRoutes);
// New feature routes
app.use('/api/reports', reportsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/roster', rosterRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ReclamTrack API' });
});

// Test notification endpoint — Must be protected in prod!
app.post('/api/test-notification', authenticate, requireAdmin, async (req, res) => {
  // Safe dynamic import pattern
  const { default: notificationService } = await import('./services/socketService.js');

  notificationService.broadcast({
    type: 'success',
    title: 'Test Notification',
    message: 'Le système de notifications fonctionne parfaitement ! 🎉',
    timestamp: new Date(),
  });

  res.json({
    success: true,
    message: 'Notification envoyée à tous les clients connectés',
  });
});

// Error handler
app.use(errorHandler);

// Initialize Socket.IO
initSocket(httpServer);

// HTTP event bridge
app.use('/events', eventsRoutes);

// ─── Server startup ───────────────────────────────────────────────────────────
const PORT = process.env['PORT'] ?? 5001;

const start = async (): Promise<void> => {
  try {
    await connectDB();

    if (process.env['DISABLE_KAFKA'] !== 'true') {
      await startSagaConsumer();
    } else {
      logger.warn('⚠️  Kafka disabled — backend ready for HTTP events.');
    }

    httpServer.listen(PORT, () => {
      logger.info(`🚀 API ReclamTrack listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Server startup failed', { error: err });
    process.exit(1);
  }
};

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal: string): void => {
  logger.info(`🛑 ${signal} received — shutting down gracefully…`);
  httpServer.close(() => {
    logger.info('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10s if connections do not drain
  setTimeout(() => {
    logger.error('⏱️  Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Handle unhandled promise rejections — prevent silent failures
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Promise Rejection', { reason });
});

// Handle uncaught exceptions — log then exit (let orchestrator restart)
process.on('uncaughtException', (err: Error) => {
  logger.error('💥 Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

start();
