import { Request, Response, NextFunction } from 'express';
import { Leave } from '../models/Leave';
import { AuditLog } from '../models/AuditLog';
import { ShiftAssignment } from '../models/ShiftAssignment';

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    const leave = new Leave({
      ...req.body,
      tenantId,
      hospitalId,
      userId: req.user?._id,
      status: 'Pending'
    });
    
    await leave.save();

    res.status(201).json({ message: 'Leave application submitted successfully', leave });
  } catch (error: any) {
    res.status(500).json({ message: 'Error applying for leave', error: error.message });
  }
};

export const approveLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!leave) return res.status(404).json({ message: 'Leave record not found.' });

    leave.status = 'Approved';
    leave.approvedBy = req.user?._id as any;
    leave.approvalNotes = req.body.notes;
    await leave.save();

    // Side effect: Any existing shift assignments during this leave period should be marked as "Leave" or "Cancelled"
    // For simplicity, we'll mark them as 'Leave'
    await ShiftAssignment.updateMany(
      {
        doctorId: leave.userId,
        date: { $gte: leave.startDate, $lte: leave.endDate },
        tenantId: req.user?.tenantId
      },
      {
        $set: { status: 'Leave' }
      }
    );

    await AuditLog.create({
      tenantId: leave.tenantId,
      userId: req.user?._id,
      action: 'APPROVE_LEAVE',
      resource: 'Leave',
      ipAddress: req.ip,
      metadata: { leaveId: leave._id },
    });

    res.status(200).json({ message: 'Leave approved successfully', leave });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving leave', error: error.message });
  }
};

export const listLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!;
    const filter: any = { tenantId };
    
    if (req.user?.role === 'DOCTOR' || req.user?.role === 'NURSE') {
      filter.userId = req.user._id;
    }

    const leaves = await Leave.find(filter).populate('userId', 'name email role');
    res.status(200).json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
};
