import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { Department } from '../models/Department';
import { Invoice } from '../models/Billing';
import { sendSuccess } from '../utils/response';

export async function getSuperAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalHospitals,
      totalDoctors,
      totalPatients,
      totalStaff,
      revenueResult,
      appointmentsToday,
      activeHospitals,
    ] = await Promise.all([
      Hospital.countDocuments(),
      User.countDocuments({ role: 'DOCTOR', status: 'Active' }),
      Patient.countDocuments(),
      User.countDocuments({ role: { $in: ['NURSE', 'STAFF', 'RECEPTIONIST'] }, status: 'Active' }),
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Hospital.countDocuments({ status: 'Active' }),
    ]);

    sendSuccess(res, {
      totalHospitals,
      activeHospitals,
      totalDoctors,
      totalPatients,
      totalStaff,
      totalRevenue: revenueResult[0]?.total ?? 0,
      appointmentsToday,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHospitalDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;

    const [
      deptCount,
      doctorCount,
      nurseCount,
      patientCount,
      appointmentsToday,
      bedStats,
    ] = await Promise.all([
      Department.countDocuments({ hospitalId }),
      User.countDocuments({ hospitalId, role: 'DOCTOR', status: 'Active' }),
      User.countDocuments({ hospitalId, role: 'NURSE', status: 'Active' }),
      Patient.countDocuments({ hospitalId }),
      Appointment.countDocuments({
        hospitalId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Department.aggregate([
        { $match: { hospitalId } },
        { $group: { _id: null, totalBeds: { $sum: '$totalBeds' }, occupiedBeds: { $sum: '$occupiedBeds' } } },
      ]),
    ]);

    const beds = bedStats[0] || { totalBeds: 0, occupiedBeds: 0 };

    sendSuccess(res, {
      deptCount,
      doctorCount,
      nurseCount,
      patientCount,
      appointmentsToday,
      totalBeds: beds.totalBeds,
      occupiedBeds: beds.occupiedBeds,
      availableBeds: beds.totalBeds - beds.occupiedBeds,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDoctorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctorId = req.user?._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      appointmentsToday,
      waitingPatients,
      criticalPatients,
      followUpDue,
    ] = await Promise.all([
      Patient.countDocuments({ assignedDoctorId: doctorId }),
      Appointment.countDocuments({
        doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: { $ne: 'Cancelled' },
      }),
      Appointment.countDocuments({
        doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: 'Waiting',
      }),
      Patient.countDocuments({ assignedDoctorId: doctorId, status: 'ICU' }),
      Patient.countDocuments({ assignedDoctorId: doctorId, status: 'Follow-up Due' }),
    ]);

    sendSuccess(res, {
      totalPatients,
      appointmentsToday,
      waitingPatients,
      criticalPatients,
      followUpDue,
    });
  } catch (err) {
    next(err);
  }
}
