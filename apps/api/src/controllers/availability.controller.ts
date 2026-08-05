import { Request, Response, NextFunction } from 'express';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { ShiftTemplate } from '../models/ShiftTemplate';
import { Appointment } from '../models/Appointment';
import { CalendarBlock } from '../models/CalendarBlock';
import { DoctorProfile } from '../models/DoctorProfile';
import { Leave } from '../models/Leave';

export const getDoctorAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // e.g. YYYY-MM-DD
    const tenantId = req.user?.tenantId;

    if (!date) return res.status(400).json({ message: 'Date is required.' });

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    // 1. Check if doctor is on approved leave
    const leave = await Leave.findOne({
      userId: doctorId,
      tenantId,
      status: 'Approved',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate }
    });

    if (leave) {
      return res.status(200).json({ 
        date: targetDate, 
        status: 'On Leave', 
        slots: [] 
      });
    }

    // 2. Fetch Shift Assignments for the date
    const assignments = await ShiftAssignment.find({
      doctorId,
      tenantId,
      date: targetDate,
      status: { $in: ['Scheduled', 'Completed'] }
    }).populate<{shiftTemplateId: any}>('shiftTemplateId');

    if (assignments.length === 0) {
      return res.status(200).json({ 
        date: targetDate, 
        status: 'Not Scheduled', 
        slots: [] 
      });
    }

    // 3. Get Consultation Duration (Fallback to 15 mins)
    const profile = await DoctorProfile.findOne({ userId: doctorId, tenantId });
    const defaultDuration = profile?.consultationDuration || 15;

    // 4. Fetch Appointments and Blocks
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      tenantId,
      date: { $gte: targetDate, $lt: nextDay },
      status: { $in: ['Scheduled', 'Confirmed', 'Checked-In'] } // Not cancelled
    });

    const blocks = await CalendarBlock.find({
      doctorId,
      tenantId,
      startTime: { $gte: targetDate },
      endTime: { $lt: nextDay }
    });

    // 5. Calculate Slots
    const allSlots: any[] = [];

    for (const assignment of assignments) {
      const template = assignment.shiftTemplateId;
      if (!template) continue;

      const duration = template.consultationDurationMinutes || defaultDuration;

      // Parse start time (e.g. "08:00")
      const [startH, startM] = template.startTime.split(':').map(Number);
      const [endH, endM] = template.endTime.split(':').map(Number);

      let currentTime = new Date(targetDate);
      currentTime.setHours(startH, startM, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(endH, endM, 0, 0);

      if (endTime < currentTime) {
        // Night shift crossing midnight - simplify for this iteration by just adding 24h
        endTime.setDate(endTime.getDate() + 1);
      }

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        if (slotEnd > endTime) break; // Don't overflow shift

        // Check if slot overlaps with an appointment
        const isBooked = appointments.some(appt => {
          const apptTime = new Date(appt.date);
          // Assuming appointments take the duration time
          const apptEnd = new Date(apptTime.getTime() + duration * 60000);
          return (currentTime < apptEnd && slotEnd > apptTime);
        });

        // Check if slot overlaps with a block
        const isBlocked = blocks.some(block => {
          return (currentTime < block.endTime && slotEnd > block.startTime);
        });

        allSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          status: isBooked ? 'Booked' : (isBlocked ? 'Blocked' : 'Available')
        });

        // Advance to next slot
        currentTime = slotEnd;
      }
    }

    res.status(200).json({
      date: targetDate,
      status: 'Scheduled',
      slots: allSlots
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Error calculating availability', error: error.message });
  }
};

export const blockTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { doctorId } = req.params;

    const block = new CalendarBlock({
      ...req.body,
      doctorId,
      tenantId,
      hospitalId,
      blockedBy: req.user?._id
    });
    
    await block.save();
    res.status(201).json({ message: 'Time blocked successfully', block });
  } catch (error: any) {
    res.status(500).json({ message: 'Error blocking time', error: error.message });
  }
};

export const unblockTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blockId } = req.params;
    const block = await CalendarBlock.findOneAndDelete({ _id: blockId, tenantId: req.user?.tenantId });
    if (!block) return res.status(404).json({ message: 'Block not found.' });

    res.status(200).json({ message: 'Time unblocked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error unblocking time', error: error.message });
  }
};

export const getDepartmentAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // A simplified aggregate view: returns who is available today
    const { departmentId } = req.params;
    const tenantId = req.user?.tenantId;
    
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);

    const assignments = await ShiftAssignment.find({
      departmentId,
      tenantId,
      date: targetDate,
      status: 'Scheduled'
    }).populate('doctorId', 'name specialty');

    res.status(200).json({
      date: targetDate,
      scheduledDoctors: assignments.map(a => a.doctorId)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching department availability', error: error.message });
  }
};

// Search Available Doctors by date, specialty, department
export const searchAvailableDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, specialty, departmentId } = req.query;
    const tenantId = req.user?.tenantId;

    if (!date) return res.status(400).json({ message: 'date query param is required.' });

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    // Find all shift assignments for the target date
    const filter: Record<string, any> = { tenantId, date: targetDate, status: 'Scheduled' };
    if (departmentId) filter.departmentId = departmentId;

    const assignments = await ShiftAssignment.find(filter)
      .populate<{ doctorId: any }>('doctorId', 'name email specialty role');

    // Filter doctors who are NOT on leave
    const doctorIds = assignments.map(a => a.doctorId?._id?.toString()).filter(Boolean);
    const { Leave } = await import('../models/Leave');
    const leaveDoctors = await Leave.find({
      userId: { $in: doctorIds },
      tenantId,
      status: 'Approved',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate }
    }).distinct('userId');

    const leaveDoctorSet = new Set(leaveDoctors.map(id => id.toString()));

    let availableDoctors = assignments
      .filter(a => a.doctorId && !leaveDoctorSet.has(a.doctorId._id.toString()))
      .map(a => a.doctorId);

    // Further filter by specialty if requested
    if (specialty) {
      availableDoctors = availableDoctors.filter(
        (d: any) => d?.specialty?.toLowerCase().includes((specialty as string).toLowerCase())
      );
    }

    // Deduplicate by doctor ID
    const seen = new Set<string>();
    const unique = availableDoctors.filter((d: any) => {
      const id = d?._id?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.status(200).json({ date: targetDate, availableDoctors: unique, total: unique.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching available doctors', error: error.message });
  }
};
