import { Request, Response, NextFunction } from 'express';
import { Admission } from '../models/Admission';
import { Bed } from '../models/Bed';
import { DischargeSummary } from '../models/DischargeSummary';
import { Patient } from '../models/Patient';
import { sendSuccess } from '../utils/response';
import mongoose from 'mongoose';

// GET /api/ipd/analytics/kpis
export async function getKpis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = new mongoose.Types.ObjectId(req.user?.hospitalId as unknown as string);

    // 1. Total Active Admissions
    const activeAdmissions = await Admission.countDocuments({ hospitalId, status: 'Admitted' });

    // 2. Bed Occupancy Rate
    const totalBeds = await Bed.countDocuments({ hospitalId, status: { $ne: 'Maintenance' } });
    const occupiedBeds = await Bed.countDocuments({ hospitalId, status: 'Occupied' });
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // 3. Average Length of Stay (ALOS) in days (for discharged patients)
    const discharges = await DischargeSummary.aggregate([
      { $match: { hospitalId, status: 'Published' } },
      { 
        $project: { 
          lengthOfStay: { 
            $divide: [ { $subtract: ["$publishedAt", "$createdAt"] }, 1000 * 60 * 60 * 24 ] 
          }
        }
      },
      { $group: { _id: null, avgLos: { $avg: "$lengthOfStay" } } }
    ]);
    const alos = discharges.length > 0 ? parseFloat(discharges[0].avgLos.toFixed(1)) : 0;

    // 4. Discharges Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dischargesToday = await DischargeSummary.countDocuments({
      hospitalId,
      status: 'Published',
      publishedAt: { $gte: today }
    });

    sendSuccess(res, {
      activeAdmissions,
      occupancyRate,
      alos,
      dischargesToday,
      totalBeds
    }, 'KPIs fetched successfully');
  } catch (error) {
    next(error);
  }
}

// GET /api/ipd/analytics/bed-occupancy
export async function getBedOccupancy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = new mongoose.Types.ObjectId(req.user?.hospitalId as unknown as string);

    const occupancyData = await Bed.aggregate([
      { $match: { hospitalId, status: { $ne: 'Maintenance' } } },
      {
        $group: {
          _id: "$wardCategory", // e.g., 'ICU', 'General', 'Private'
          total: { $sum: 1 },
          occupied: { $sum: { $cond: [{ $eq: ["$status", "Occupied"] }, 1, 0] } }
        }
      }
    ]);

    // Format for Recharts
    const chartData = occupancyData.map(d => ({
      name: d._id || 'Unknown',
      total: d.total,
      occupied: d.occupied,
      available: d.total - d.occupied
    }));

    sendSuccess(res, chartData, 'Bed occupancy fetched successfully');
  } catch (error) {
    next(error);
  }
}

// GET /api/ipd/analytics/doctor-dashboard
export async function getDoctorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;
    const doctorId = req.user?.id;

    const myPatients = await Patient.find({ hospitalId, assignedDoctorId: doctorId, status: 'Admitted' })
      .select('name mrn age gender ward bedNumber admissionDate')
      .limit(10);

    const pendingDischarges = await DischargeSummary.find({ hospitalId, treatingDoctorId: doctorId, status: 'Draft' })
      .populate('patientId', 'name mrn')
      .limit(10);

    sendSuccess(res, { myPatients, pendingDischarges }, 'Doctor dashboard fetched successfully');
  } catch (error) {
    next(error);
  }
}

// GET /api/ipd/analytics/nurse-dashboard
export async function getNurseDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.hospitalId;

    // A simple mock for patients needing vitals or notes
    const patientsNeedingVitals = await Patient.find({ hospitalId, status: 'Admitted' })
      .select('name mrn ward bedNumber')
      .limit(5); // In reality, filter by last vital check time

    sendSuccess(res, { patientsNeedingVitals }, 'Nurse dashboard fetched successfully');
  } catch (error) {
    next(error);
  }
}
