import prisma from '../lib/prisma.js';
import { autoAssignComplaint } from './schedulingService.js';
import notificationService from './socketService.js';

export class ComplaintService {
  /**
   * Get all complaints with optional filters
   */
  async getAllComplaints(filters: any = {}, organizationId: string) {
    const where: any = { organizationId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.assignedTeamId) {
      where.assignedTeamId = filters.assignedTeamId;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        technician: { select: { name: true, email: true } },
        asset: { select: { name: true, code: true, category: true, criticality: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return complaints;
  }

  /**
   * Get a single complaint by ID
   */
  async getComplaintById(id: string, organizationId: string) {
    const complaint = await prisma.complaint.findFirst({
      where: { id, organizationId },
      include: {
        technician: { select: { name: true, email: true } },
        asset: { select: { name: true, code: true, category: true, criticality: true } }
      }
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  }

  /**
   * Create a new complaint
   */
  async createComplaint(data: any) {
    let complaint = await prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        status: (data.status || 'nouvelle') as any,
        priority: data.priority,
        category: data.category,
        subcategory: data.subcategory,
        address: data.address,
        city: data.city,
        district: data.district,
        photos: data.photos || [],
        isAnonymous: data.isAnonymous || false,
        assetId: data.assetId,
        organizationId: data.organizationId,
        userId: data.userId,
        number: `REC-${Date.now()}`,
      }
    });

    // Auto-assign if not already assigned
    if (!complaint.assignedTeamId) {
      try {
        const teamId = await autoAssignComplaint(complaint.id);
        if (teamId) {
          complaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              assignedTeamId: teamId,
              assignedAt: new Date(),
              status: 'nouvelle'
            }
          });
        }
      } catch (error) {
        console.error('Error in auto-scheduling:', error);
      }
    }

    // Trigger notifications if assigned (either manually or via auto-schedule)
    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaint.id },
      include: { technician: true }
    });

    if (updatedComplaint?.assignedTeamId) {
      try {
        const teamId = updatedComplaint.assignedTeamId;
        const teamMembers = await prisma.membership.findMany({
          where: { organizationId: updatedComplaint.organizationId }
        });
        
        // Let's assume Team model in Prisma has members relation if we implemented it, or we skip complex socket logic for now
        const memberIds = teamMembers.map((m) => m.userId);

        await notificationService.notifyComplaintAssigned(teamId, updatedComplaint, memberIds);
      } catch (error) {
        console.error('Failed to send team notification:', error);
      }
    }

    // Notify technician if assigned
    if (updatedComplaint?.technicianId) {
      try {
        const techId = updatedComplaint.technicianId;
        await notificationService.sendToUser(techId, {
          type: 'complaint_assigned',
          title: 'Nouvelle Réclamation Assignée',
          message: `La réclamation "${updatedComplaint.title}" vous a été assignée directement.`,
          data: { complaintId: updatedComplaint.id },
        });
      } catch (error) {
        console.error('Failed to send technician notification:', error);
      }
    }

    return updatedComplaint || complaint;
  }

  /**
   * Update a complaint
   */
  async updateComplaint(id: string, data: any, organizationId: string) {
    const existing = await prisma.complaint.findFirst({ where: { id, organizationId } });
    if (!existing) {
      throw new Error('Complaint not found');
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data,
      include: {
        technician: { select: { name: true, email: true } },
        asset: { select: { name: true, code: true, category: true, criticality: true } }
      }
    });

    return complaint;
  }

  /**
   * Delete a complaint
   */
  async deleteComplaint(id: string, organizationId: string) {
    const existing = await prisma.complaint.findFirst({ where: { id, organizationId } });
    if (!existing) {
      throw new Error('Complaint not found');
    }

    const complaint = await prisma.complaint.delete({ where: { id } });
    return complaint;
  }

  /**
   * Get complaint statistics
   */
  async getComplaintStats(organizationId: string) {
    const total = await prisma.complaint.count({ where: { organizationId } });
    
    // Group by status
    const byStatusGroups = await prisma.complaint.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true
    });
    const byStatus = byStatusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority
    const byPriorityGroups = await prisma.complaint.groupBy({
      by: ['priority'],
      where: { organizationId },
      _count: true
    });
    const byPriority = byPriorityGroups.reduce((acc, curr) => {
      acc[curr.priority] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      byPriority,
    };
  }

  /**
   * Approve a complaint (change status to 'en cours')
   */
  async approveComplaint(id: string, organizationId: string, approvedBy: string) {
    const existing = await prisma.complaint.findFirst({ where: { id, organizationId } });
    if (!existing) {
      throw new Error('Complaint not found');
    }
    if (existing.status !== 'nouvelle') {
      throw new Error('Only new complaints can be approved');
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { status: 'en_cours' as any },
      include: {
        technician: { select: { name: true, email: true } }
      }
    });

    // Send notification if assigned
    if (complaint.assignedTeamId) {
      try {
        const teamId = complaint.assignedTeamId;
        // Approximation of members for Prisma mock
        const memberIds: string[] = []; 
        await notificationService.notifyComplaintAssigned(teamId, complaint, memberIds);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    if (complaint.technicianId) {
      try {
        const techId = complaint.technicianId;
        await notificationService.sendToUser(techId, {
          type: 'complaint_assigned',
          title: 'Réclamation Approuvée et Assignée',
          message: `La réclamation "${complaint.title}" a été approuvée et vous est assignée.`,
          data: { complaintId: complaint.id },
        });
      } catch (error) {
        console.error('Failed to send technician notification:', error);
      }
    }

    return complaint;
  }

  /**
   * Reject a complaint
   */
  async rejectComplaint(
    id: string,
    organizationId: string,
    rejectionReason: string,
    rejectedBy: string
  ) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const existing = await prisma.complaint.findFirst({ where: { id, organizationId } });
    if (!existing) {
      throw new Error('Complaint not found');
    }
    if (existing.status !== 'nouvelle') {
      throw new Error('Only new complaints can be rejected');
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: 'rejetee' as any,
        rejectionReason
      },
      include: {
        technician: { select: { name: true, email: true } }
      }
    });

    return complaint;
  }
}

export const complaintService = new ComplaintService();
