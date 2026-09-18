import { Complaint, ComplaintSchema, IComplaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import { autoAssignComplaint } from './schedulingService.js';
import notificationService from './socketService.js';
import { getModel } from '../utils/modelRegistry.js';
import { Connection, Types } from 'mongoose';

export class ComplaintService {
  /**
   * Get all complaints with optional filters
   */
  async getAllComplaints(filters: any = {}, organizationId: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    const query: any = { organizationId };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.assignedTeamId) {
      query.assignedTeamId = new Types.ObjectId(filters.assignedTeamId);
    }

    // @ts-ignore
    const complaints = await ComplaintModel.find(query)
      .populate('assignedTeamId', 'name specialization')
      .populate('technicianId', 'firstName lastName email')
      .populate('assetId', 'name code category criticality')
      .sort({ createdAt: -1 });

    return complaints;
  }

  /**
   * Get a single complaint by ID
   */
  async getComplaintById(id: string, organizationId: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await ComplaintModel.findOne({ _id: id, organizationId })
      .populate('assignedTeamId', 'name specialization')
      .populate('technicianId', 'firstName lastName email')
      .populate('assetId', 'name code category criticality');

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  }

  /**
   * Create a new complaint
   */
  async createComplaint(data: Partial<IComplaint>, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    const complaint = new ComplaintModel(data);
    await complaint.save();

    // Auto-assign if not already assigned
    if (!complaint.assignedTeamId) {
      try {
        const teamId = await autoAssignComplaint(complaint._id.toString());
        if (teamId) {
          complaint.assignedTeamId = teamId;
          complaint.assignedAt = new Date();
          complaint.status = 'nouvelle'; // Or 'assigned' if we want to change status immediately
          // But autoAssignComplaint already updates the DB document!
          // We need to reload the complaint or just trust the side effect.
          // autoAssignComplaint updates the doc in DB.
          // Let's refresh our local instance or manually update it to match.
          // autoAssignComplaint returns Promise<Types.ObjectId | null>
        }
      } catch (error) {
        console.error('Error in auto-scheduling:', error);
      }
    }

    // Trigger notifications if assigned (either manually or via auto-schedule)
    // We need to re-fetch to get the latest state including auto-assignment updates if any
    const updatedComplaint = await ComplaintModel.findById(complaint._id).populate(
      'assignedTeamId',
      'name specialization'
    );

    if (updatedComplaint?.assignedTeamId) {
      try {
        const teamId = updatedComplaint.assignedTeamId._id
          ? updatedComplaint.assignedTeamId._id.toString()
          : updatedComplaint.assignedTeamId.toString();

        // Fetch team members for persistence
        const team = await Team.findById(teamId).select('members');
        const memberIds = team?.members.map((m) => m.toString()) || [];

        await notificationService.notifyComplaintAssigned(teamId, updatedComplaint, memberIds);
      } catch (error) {
        console.error('Failed to send team notification:', error);
      }
    }

    // Notify technician if assigned
    if (updatedComplaint?.technicianId) {
      try {
        const techId = updatedComplaint.technicianId._id
          ? updatedComplaint.technicianId._id.toString()
          : updatedComplaint.technicianId.toString();

        await notificationService.sendToUser(techId, {
          type: 'complaint_assigned',
          title: 'Nouvelle Réclamation Assignée',
          message: `La réclamation "${updatedComplaint.title}" vous a été assignée directement.`,
          data: { complaintId: updatedComplaint._id },
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
  async updateComplaint(id: string, data: Partial<IComplaint>, organizationId: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await ComplaintModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('assignedTeamId', 'name specialization')
      .populate('technicianId', 'firstName lastName email')
      .populate('assetId', 'name code category criticality');

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  }

  /**
   * Delete a complaint
   */
  async deleteComplaint(id: string, organizationId: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await ComplaintModel.findOneAndDelete({ _id: id, organizationId });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return complaint;
  }

  /**
   * Get complaint statistics
   */
  async getComplaintStats(organizationId: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    const total = await ComplaintModel.countDocuments({ organizationId });
    const byStatus = await ComplaintModel.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byPriority = await ComplaintModel.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPriority: byPriority.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Approve a complaint (change status to 'en cours')
   */
  async approveComplaint(id: string, organizationId: string, approvedBy: string, conn?: Connection) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await ComplaintModel.findOne({ _id: id, organizationId });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status !== 'nouvelle') {
      throw new Error('Only new complaints can be approved');
    }

    complaint.status = 'en cours';
    await complaint.save();

    // Populate for return
    await complaint.populate('assignedTeamId', 'name specialization');
    await complaint.populate('technicianId', 'firstName lastName email');

    // Send notification if assigned
    if (complaint.assignedTeamId) {
      try {
        const teamId = complaint.assignedTeamId._id
          ? complaint.assignedTeamId._id.toString()
          : complaint.assignedTeamId.toString();

        const team = await Team.findById(teamId).select('members');
        const memberIds = team?.members.map((m) => m.toString()) || [];

        await notificationService.notifyComplaintAssigned(teamId, complaint, memberIds);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    if (complaint.technicianId) {
      try {
        const techId = complaint.technicianId._id
          ? complaint.technicianId._id.toString()
          : complaint.technicianId.toString();

        await notificationService.sendToUser(techId, {
          type: 'complaint_assigned',
          title: 'Réclamation Approuvée et Assignée',
          message: `La réclamation "${complaint.title}" a été approuvée et vous est assignée.`,
          data: { complaintId: complaint._id },
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
    rejectedBy: string,
    conn?: Connection
  ) {
    const ComplaintModel = conn ? getModel<IComplaint>(conn, 'Complaint', ComplaintSchema) : Complaint;
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const complaint = await ComplaintModel.findOne({ _id: id, organizationId });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status !== 'nouvelle') {
      throw new Error('Only new complaints can be rejected');
    }

    complaint.status = 'rejetée';
    complaint.rejectionReason = rejectionReason;
    await complaint.save();

    // Populate for return
    await complaint.populate('assignedTeamId', 'name specialization');
    await complaint.populate('technicianId', 'firstName lastName email');

    return complaint;
  }
}

export const complaintService = new ComplaintService();
