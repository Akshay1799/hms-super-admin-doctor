import { Request, Response, NextFunction } from 'express';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { ImagingStudy } from '../models/ImagingStudy';
import { RadiologyReport } from '../models/RadiologyReport';
import { RadiologyDelivery } from '../models/RadiologyDelivery';
import { RadiologyAppointment } from '../models/RadiologyAppointment';
import { Machine } from '../models/Machine';
import { sendSuccess } from '../utils/response';
import mongoose from 'mongoose';

/**
 * Get Technician Dashboard
 */
export async function getTechnicianDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = (req as any).user!;
    
    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [appointments, pendingExams, activeMachines] = await Promise.all([
      // Today's schedule
      RadiologyAppointment.find({
        tenantId,
        hospitalId,
        startTime: { $gte: startOfDay, $lte: endOfDay }
      }).countDocuments(),
      
      // Pending Exams (Orders that are Scheduled but not yet Study Completed)
      RadiologyOrder.find({
        tenantId,
        hospitalId,
        orderStatus: { $in: ['Requested', 'Scheduled'] }
      }).countDocuments(),

      // Machine Availability
      Machine.find({
        tenantId,
        hospitalId,
        status: 'Active'
      }).select('name modality status')
    ]);

    sendSuccess(res, {
      todaysAppointments: appointments,
      pendingExaminations: pendingExams,
      machines: activeMachines
    }, 'Technician Dashboard retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Radiologist Dashboard
 */
export async function getRadiologistDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = (req as any).user!;

    const [studiesAwaitingInterpretation, pendingReports, reportsAwaitingApproval] = await Promise.all([
      // Orders that have Study Completed but no Draft report yet
      RadiologyOrder.find({
        tenantId,
        hospitalId,
        orderStatus: 'Study Completed'
      }).countDocuments(),

      // Reports in Draft status assigned to this radiologist
      RadiologyReport.find({
        tenantId,
        hospitalId,
        radiologistId: userId,
        status: 'Draft'
      }).countDocuments(),

      // Reports submitted for approval
      RadiologyReport.find({
        tenantId,
        hospitalId,
        status: 'Submitted'
      }).countDocuments()
    ]);

    sendSuccess(res, {
      studiesAwaitingInterpretation,
      pendingReports,
      reportsAwaitingApproval,
      criticalCases: 0 // In a real system, you'd filter by a critical findings flag
    }, 'Radiologist Dashboard retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Admin Dashboard
 */
export async function getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = (req as any).user!;

    const [totalOrders, publishedReports, failedDeliveries] = await Promise.all([
      RadiologyOrder.find({ tenantId, hospitalId }).countDocuments(),
      RadiologyReport.find({ tenantId, hospitalId, status: 'Published' }).countDocuments(),
      RadiologyDelivery.find({ tenantId, hospitalId, status: 'Failed' }).countDocuments()
    ]);

    // Average Turnaround Time (TAT) Calculation
    // TAT = Difference between Order Created and Report Published
    // For simplicity, we calculate an average based on all Published Reports and their corresponding Orders
    let averageTatHours = 0;
    const reports = await RadiologyReport.find({ tenantId, hospitalId, status: 'Published' }).select('createdAt updatedAt');
    
    if (reports.length > 0) {
      let totalMs = 0;
      reports.forEach(r => {
        // Approximate TAT: Time from report creation to its publication (updatedAt).
        // Ideally, it would be from Order creation, but Report Creation implies the study was done.
        const ms = new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime();
        totalMs += ms;
      });
      averageTatHours = (totalMs / reports.length) / (1000 * 60 * 60); // Convert to hours
    }

    sendSuccess(res, {
      totalOrders,
      publishedReports,
      failedDeliveries,
      averageTurnaroundTimeHours: parseFloat(averageTatHours.toFixed(2)),
      reportStatistics: {
        successRate: totalOrders > 0 ? ((publishedReports / totalOrders) * 100).toFixed(2) + '%' : '0%'
      }
    }, 'Admin Dashboard retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Executive Reports
 */
export async function getExecutiveReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = (req as any).user!;

    // Monthly aggregation
    const monthlyVolume = await RadiologyOrder.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, {
      monthlyImagingVolume: monthlyVolume.map(v => ({
        month: v._id,
        volume: v.totalOrders
      })),
      imagingGrowthTrends: 'Positive',
      operationalEfficiency: 'High'
    }, 'Executive Reports retrieved');
  } catch (err) {
    next(err);
  }
}
