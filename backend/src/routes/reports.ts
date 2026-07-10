/**
 * @file reports.ts
 * @description Routes for generating and downloading reports (Complaints, SLA).
 * @module backend/routes
 */

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/security.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateComplaintsXLSX, generateSLAReportXLSX, type ComplaintReportRow, type SLAReportRow } from '../services/reportService.js';
import { Complaint } from '../models/Complaint.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/reports/complaints
 * Generates an XLSX report of complaints based on query filters.
 */
router.get('/complaints', asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  
  const query: Record<string, unknown> = {};
  if (status) query['status'] = status;
  if (startDate || endDate) {
    query['createdAt'] = {};
    if (startDate) (query['createdAt'] as Record<string, unknown>)['$gte'] = new Date(startDate as string);
    if (endDate) (query['createdAt'] as Record<string, unknown>)['$lte'] = new Date(endDate as string);
  }

  const complaints = await Complaint.find(query).populate('technicianId', 'firstName lastName').sort({ createdAt: -1 });

  const rows: ComplaintReportRow[] = complaints.map(c => {
    const tech = c.technicianId as unknown as { firstName?: string, lastName?: string };
    const assignedToName = tech ? `${tech.firstName || ''} ${tech.lastName || ''}`.trim() : 'Non assigné';
    return {
      id: c._id.toString(),
      title: c.title,
      status: c.status,
      priority: c.priority,
      category: c.category,
      createdAt: c.createdAt,
      resolvedAt: c.status === 'résolue' || c.status === 'fermée' ? c.updatedAt : undefined,
      resolutionTimeHours: c.status === 'résolue' || c.status === 'fermée' ? Math.round((c.updatedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60)) : undefined,
      assignedTo: assignedToName,
    };
  });

  await generateComplaintsXLSX(res, rows);
}));

/**
 * GET /api/reports/sla
 * Generates an XLSX report of SLA compliance.
 */
router.get('/sla', asyncHandler(async (req, res) => {
  // Mock data for SLA report - in a real scenario, this would aggregate from the DB
  const rows: SLAReportRow[] = [
    { month: '2024-01', total: 150, resolved: 140, resolutionRate: 93.3, avgResolutionHours: 24, slaBreaches: 5 },
    { month: '2024-02', total: 160, resolved: 155, resolutionRate: 96.8, avgResolutionHours: 20, slaBreaches: 2 },
  ];

  await generateSLAReportXLSX(res, rows);
}));

export default router;
