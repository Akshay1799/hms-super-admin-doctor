import { Request, Response, NextFunction } from 'express';
import { DoctorAssignment } from '../models/DoctorAssignment';
import { Encounter } from '../models/Encounter';
import { AuditLog } from '../models/AuditLog';

// Assign Doctor to Encounter
export const assignDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { encounterId, doctorId, departmentId, role, autoAccept } = req.body;

    const encounter = await Encounter.findOne({ _id: encounterId, tenantId });
    if (!encounter) return res.status(404).json({ message: 'Encounter not found.' });

    // Enforce BR-033: Only one active primary consultant may exist for an encounter
    const assigningRole = role || 'Primary';
    if (assigningRole === 'Primary') {
      const activePrimary = await DoctorAssignment.findOne({
        encounterId,
        tenantId,
        role: 'Primary',
        status: { $in: ['Pending', 'Accepted', 'In Progress'] }
      });
      if (activePrimary) {
        return res.status(400).json({ message: 'An active Primary consultant is already assigned to this encounter. Transfer or close it first.' });
      }
    }

    // Default to true for autoAccept unless explicitly false
    const shouldAutoAccept = autoAccept !== undefined ? autoAccept : true;

    const assignment = new DoctorAssignment({
      tenantId,
      hospitalId,
      departmentId: departmentId || encounter.departmentId,
      encounterId,
      doctorId,
      patientId: encounter.patientId,
      role: assigningRole,
      status: shouldAutoAccept ? 'Accepted' : 'Pending',
      assignedBy: req.user?._id
    });

    await assignment.save();

    // Update encounter doctorId if it's the primary assignment (simplifies backward compatibility with other modules)
    if (assigningRole === 'Primary') {
      encounter.doctorId = doctorId;
      await encounter.save();
    }

    await AuditLog.create({
      tenantId,
      userId: req.user?._id,
      action: 'ASSIGN_DOCTOR',
      resource: 'DoctorAssignment',
      ipAddress: req.ip,
      metadata: { assignmentId: assignment._id, doctorId, encounterId, role: assigningRole },
    });

    res.status(201).json({ message: 'Doctor assigned successfully.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning doctor', error: error.message });
  }
};

// Update Assignment Details
export const updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const assignment = await DoctorAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (role && role === 'Primary' && assignment.role !== 'Primary') {
       const activePrimary = await DoctorAssignment.findOne({
          encounterId: assignment.encounterId,
          tenantId: req.user?.tenantId,
          role: 'Primary',
          status: { $in: ['Pending', 'Accepted', 'In Progress'] }
       });
       if (activePrimary) return res.status(400).json({ message: 'Another active Primary consultant exists.' });
       assignment.role = role;
    } else if (role) {
       assignment.role = role;
    }

    await assignment.save();

    res.status(200).json({ message: 'Assignment updated successfully.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

// Accept Assignment
export const acceptAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await DoctorAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (assignment.doctorId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'You can only accept your own assignments.' });
    }

    if (assignment.status !== 'Pending') {
      return res.status(400).json({ message: 'Assignment is not pending.' });
    }

    assignment.status = 'Accepted';
    await assignment.save();

    res.status(200).json({ message: 'Assignment accepted.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error accepting assignment', error: error.message });
  }
};

// Reject Assignment (Doctor can refuse)
export const rejectAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await DoctorAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (assignment.doctorId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'You can only reject your own assignments.' });
    }
    if (assignment.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending assignments can be rejected.' });
    }

    assignment.status = 'Rejected';
    assignment.rejectionReason = req.body.reason;
    await assignment.save();

    await AuditLog.create({
      tenantId: assignment.tenantId,
      userId: req.user?._id,
      action: 'REJECT_ASSIGNMENT',
      resource: 'DoctorAssignment',
      ipAddress: req.ip,
      metadata: { assignmentId: assignment._id, reason: assignment.rejectionReason },
    });

    res.status(200).json({ message: 'Assignment rejected.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error rejecting assignment', error: error.message });
  }
};

// Get All Assignments for an Encounter
export const getEncounterAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { encounterId } = req.params;
    const assignments = await DoctorAssignment.find({
      encounterId,
      tenantId: req.user?.tenantId
    })
      .populate('doctorId', 'name specialty role')
      .sort({ createdAt: 1 });

    res.status(200).json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching encounter assignments', error: error.message });
  }
};

// Complete Assignment
export const completeAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await DoctorAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    assignment.status = 'Completed';
    await assignment.save();

    res.status(200).json({ message: 'Assignment marked as completed.', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error completing assignment', error: error.message });
  }
};

// Transfer Assignment
export const transferAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transferToDoctorId, transferNotes, autoAccept } = req.body;
    const assignment = await DoctorAssignment.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (!['Pending', 'Accepted', 'In Progress'].includes(assignment.status)) {
      return res.status(400).json({ message: 'Cannot transfer a completed, closed, or already transferred assignment.' });
    }

    const shouldAutoAccept = autoAccept !== undefined ? autoAccept : false; // Transfers usually require manual accept by default for safety

    // Create the new assignment for the receiving doctor
    const newAssignment = new DoctorAssignment({
      tenantId: assignment.tenantId,
      hospitalId: assignment.hospitalId,
      departmentId: assignment.departmentId,
      encounterId: assignment.encounterId,
      doctorId: transferToDoctorId,
      patientId: assignment.patientId,
      role: assignment.role, // Inherit role
      status: shouldAutoAccept ? 'Accepted' : 'Pending',
      assignedBy: req.user?._id
    });

    await newAssignment.save();

    // Mark current as transferred
    assignment.status = 'Transferred';
    assignment.transferNotes = transferNotes;
    assignment.transferredTo = newAssignment._id;
    await assignment.save();
    
    if (assignment.role === 'Primary') {
      await Encounter.updateOne({ _id: assignment.encounterId }, { $set: { doctorId: transferToDoctorId } });
    }

    await AuditLog.create({
      tenantId: assignment.tenantId,
      userId: req.user?._id,
      action: 'TRANSFER_ASSIGNMENT',
      resource: 'DoctorAssignment',
      ipAddress: req.ip,
      metadata: { oldAssignmentId: assignment._id, newAssignmentId: newAssignment._id, transferToDoctorId },
    });

    res.status(200).json({ message: 'Assignment transferred successfully.', assignment: newAssignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error transferring assignment', error: error.message });
  }
};

// Retrieve Assigned Patients (Doctor Queue)
export const getAssignedPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;
    const assignments = await DoctorAssignment.find({
      doctorId,
      tenantId: req.user?.tenantId,
      status: { $in: ['Pending', 'Accepted', 'In Progress'] }
    })
      .populate('encounterId')
      .populate('patientId', 'name email phone dob gender')
      .sort({ createdAt: 1 });

    res.status(200).json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching assigned patients', error: error.message });
  }
};
