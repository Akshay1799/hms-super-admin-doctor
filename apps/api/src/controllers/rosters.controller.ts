import { Request, Response, NextFunction } from 'express';
import { ShiftTemplate } from '../models/ShiftTemplate';
import { DutyRoster } from '../models/DutyRoster';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { AuditLog } from '../models/AuditLog';
import { Leave } from '../models/Leave';

// --- Shift Templates ---
export const createShiftTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    if (!tenantId || !hospitalId) return res.status(403).json({ message: 'User must belong to a tenant and hospital.' });

    const template = new ShiftTemplate({
      ...req.body,
      tenantId,
      hospitalId
    });
    await template.save();

    await AuditLog.create({
      tenantId,
      userId: req.user?._id,
      action: 'CREATE_SHIFT_TEMPLATE',
      resource: 'ShiftTemplate',
      ipAddress: req.ip,
      metadata: { templateId: template._id },
    });

    res.status(201).json({ message: 'Shift template created successfully', template });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating shift template', error: error.message });
  }
};

export const listShiftTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!;
    const templates = await ShiftTemplate.find({ tenantId });
    res.status(200).json(templates);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching shift templates', error: error.message });
  }
};

// --- Duty Rosters ---
export const createDutyRoster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    const roster = new DutyRoster({
      ...req.body,
      tenantId,
      hospitalId,
      createdBy: req.user?._id,
      status: 'Draft'
    });
    await roster.save();

    res.status(201).json({ message: 'Duty roster created successfully', roster });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating duty roster', error: error.message });
  }
};

export const publishDutyRoster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roster = await DutyRoster.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!roster) return res.status(404).json({ message: 'Duty roster not found.' });

    roster.status = 'Published';
    roster.approvedBy = req.user?._id as any;
    await roster.save();

    await AuditLog.create({
      tenantId: roster.tenantId,
      userId: req.user?._id,
      action: 'PUBLISH_DUTY_ROSTER',
      resource: 'DutyRoster',
      ipAddress: req.ip,
      metadata: { rosterId: roster._id },
    });

    res.status(200).json({ message: 'Duty roster published successfully', roster });
  } catch (error: any) {
    res.status(500).json({ message: 'Error publishing duty roster', error: error.message });
  }
};

// --- Shift Assignments ---
export const assignShift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { doctorId, date, shiftTemplateId, dutyRosterId, departmentId } = req.body;

    // Fetch the template to check hours
    const template = await ShiftTemplate.findById(shiftTemplateId);
    if (!template) return res.status(404).json({ message: 'Shift template not found.' });

    // Conflict Check 1: Exact overlapping shift
    const existingExact = await ShiftAssignment.findOne({ doctorId, date, shiftTemplateId });
    if (existingExact) {
      return res.status(400).json({ message: 'Doctor is already assigned to this shift template on this date.' });
    }

    // Leave Validation Check: Prevent assigning shift if doctor is on approved leave
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const leave = await Leave.findOne({
      userId: doctorId,
      tenantId,
      status: 'Approved',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate }
    });

    if (leave) {
      return res.status(400).json({ message: 'Cannot assign shift: Doctor is on approved leave during this date.' });
    }

    // Conflict Check 2: Max consecutive hours (24h)
    // Basic implementation: prevent assigning if they have another shift on the same date and the total duration exceeds 24h
    // (A real production system would do cross-date interval checks, but this satisfies the immediate PRD requirement).
    const dailyShifts = await ShiftAssignment.find({ doctorId, date }).populate<{shiftTemplateId: any}>('shiftTemplateId');
    let totalMinutes = template.endTime < template.startTime 
      ? (24 - parseInt(template.startTime.split(':')[0]) + parseInt(template.endTime.split(':')[0])) * 60 
      : (parseInt(template.endTime.split(':')[0]) - parseInt(template.startTime.split(':')[0])) * 60;
    
    for (const shift of dailyShifts) {
      const t = shift.shiftTemplateId;
      if (!t || !t.startTime || !t.endTime) continue;
      const mins = t.endTime < t.startTime 
        ? (24 - parseInt(t.startTime.split(':')[0]) + parseInt(t.endTime.split(':')[0])) * 60 
        : (parseInt(t.endTime.split(':')[0]) - parseInt(t.startTime.split(':')[0])) * 60;
      totalMinutes += mins;
    }

    if (totalMinutes > 24 * 60) {
      return res.status(400).json({ message: 'Shift assignment violates maximum consecutive work hours (24h).' });
    }

    const assignment = new ShiftAssignment({
      tenantId,
      hospitalId,
      departmentId,
      dutyRosterId,
      shiftTemplateId,
      doctorId,
      date,
      assignedBy: req.user?._id
    });
    await assignment.save();

    res.status(201).json({ message: 'Shift assigned successfully', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning shift', error: error.message });
  }
};

// --- Shift Swapping ---
export const requestShiftSwap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { swapRequestedWith, notes } = req.body;
    const assignment = await ShiftAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    
    if (!assignment) return res.status(404).json({ message: 'Shift assignment not found.' });
    if (assignment.doctorId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'You can only request to swap your own shifts.' });
    }

    assignment.status = 'Swap_Requested';
    assignment.swapRequestedWith = swapRequestedWith;
    assignment.swapRequestedBy = req.user?._id as any;
    assignment.swapNotes = notes;
    await assignment.save();

    res.status(200).json({ message: 'Shift swap requested.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error requesting shift swap', error: error.message });
  }
};

export const doctorApproveShiftSwap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await ShiftAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Shift assignment not found.' });

    if (assignment.swapRequestedWith?.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'You are not the requested swap partner.' });
    }

    assignment.status = 'Swap_Doctor_Approved';
    await assignment.save();

    res.status(200).json({ message: 'Swap approved by requested doctor. Pending Dept Admin approval.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving shift swap', error: error.message });
  }
};

export const adminExecuteShiftSwap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await ShiftAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Shift assignment not found.' });

    if (assignment.status !== 'Swap_Doctor_Approved') {
      return res.status(400).json({ message: 'Swap must be approved by the requested doctor first.' });
    }

    // Execute swap: replace the doctor and reset status
    assignment.doctorId = assignment.swapRequestedWith!;
    assignment.status = 'Scheduled';
    assignment.swapAdminApprovedBy = req.user?._id as any;
    await assignment.save();

    await AuditLog.create({
      tenantId: assignment.tenantId,
      userId: req.user?._id,
      action: 'ADMIN_APPROVE_SHIFT_SWAP',
      resource: 'ShiftAssignment',
      ipAddress: req.ip,
      metadata: { assignmentId: assignment._id, newDoctorId: assignment.doctorId },
    });

    res.status(200).json({ message: 'Shift swap officially executed by Admin.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error executing shift swap', error: error.message });
  }
};

// --- Retrieval ---
export const getDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await ShiftAssignment.find({ doctorId: req.params.doctorId, tenantId: req.user?.tenantId })
      .populate('shiftTemplateId')
      .populate('dutyRosterId')
      .sort({ date: 1 });
    res.status(200).json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching doctor schedule', error: error.message });
  }
};

export const getDepartmentRoster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await ShiftAssignment.find({ departmentId: req.params.departmentId, tenantId: req.user?.tenantId })
      .populate('shiftTemplateId')
      .populate('doctorId', 'name email specialty')
      .sort({ date: 1 });
    res.status(200).json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching department roster', error: error.message });
  }
};
