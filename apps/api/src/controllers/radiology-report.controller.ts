import { Request, Response, NextFunction } from 'express';
import { RadiologyReport } from '../models/RadiologyReport';
import { ReportVersion } from '../models/ReportVersion';
import { ImagingStudy } from '../models/ImagingStudy';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { sendSuccess, sendCreated, NotFoundError, ValidationError, ForbiddenError } from '../utils/response';
import mongoose from 'mongoose';

/**
 * Helper to save a version snapshot
 */
async function saveReportVersion(report: any, userId: mongoose.Types.ObjectId) {
  const version = new ReportVersion({
    reportId: report._id,
    tenantId: report.tenantId,
    hospitalId: report.hospitalId,
    versionNumber: report.version,
    clinicalIndication: report.clinicalIndication,
    technique: report.technique,
    findings: report.findings,
    impression: report.impression,
    recommendations: report.recommendations,
    status: report.status,
    savedBy: userId,
    savedAt: new Date()
  });
  await version.save();
}

/**
 * Create Draft Report
 */
export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { studyId, clinicalIndication, technique, findings, impression, recommendations } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;

    // 1. Verify Study
    const study = await ImagingStudy.findOne({ _id: studyId, tenantId, hospitalId });
    if (!study) throw new NotFoundError('Imaging study not found');

    // 2. Prevent duplicate report for the same study
    const existing = await RadiologyReport.findOne({ studyId });
    if (existing) throw new ValidationError('A report already exists for this study');

    // 3. Create Report
    const timestamp = Date.now().toString().slice(-6);
    const reportNumber = `REP-RAD-${new Date().getFullYear()}-${timestamp}`;

    const report = new RadiologyReport({
      reportNumber,
      studyId,
      orderId: study.orderId,
      patientId: study.patientId,
      radiologistId: userId, // Assuming the one creating is the assigned radiologist
      tenantId,
      hospitalId,
      clinicalIndication,
      technique,
      findings: findings || '',
      impression: impression || '',
      recommendations,
      status: 'Draft',
      version: 1,
      createdBy: userId
    });

    await report.save();

    // 4. Save Version 1 Snapshot
    await saveReportVersion(report, new mongoose.Types.ObjectId(userId));

    // 5. Update Order Status
    const order = await RadiologyOrder.findOne({ _id: study.orderId, tenantId, hospitalId });
    if (order) {
      const orderItem = order.items.find(i => i._id?.toString() === study.orderItemId.toString());
      if (orderItem) {
        orderItem.status = 'Reporting';
        
        const allReportingOrAbove = order.items.every(
          i => i.status === 'Reporting' || i.status === 'Approved' || i.status === 'Delivered'
        );
        if (allReportingOrAbove) {
          order.orderStatus = 'Reporting';
        }
        await order.save();
      }
    }

    sendCreated(res, report, 'Draft radiology report created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Update Draft Report
 */
export async function updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clinicalIndication, technique, findings, impression, recommendations } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;

    const report = await RadiologyReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });
    if (!report) throw new NotFoundError('Radiology report not found');

    if (report.status === 'Published' || report.status === 'Approved') {
      throw new ValidationError(`Cannot update a report that is already ${report.status}. Use amendment workflow.`);
    }

    if (report.radiologistId.toString() !== userId) {
      throw new ForbiddenError('You can only edit reports assigned to you');
    }

    if (clinicalIndication !== undefined) report.clinicalIndication = clinicalIndication;
    if (technique !== undefined) report.technique = technique;
    if (findings !== undefined) report.findings = findings;
    if (impression !== undefined) report.impression = impression;
    if (recommendations !== undefined) report.recommendations = recommendations;

    await report.save();

    // Optionally update the current draft version snapshot (or wait until explicitly saved/submitted)
    // For simplicity, we just save the final draft snapshot when they submit.

    sendSuccess(res, report, 'Draft radiology report updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Submit Report for Approval / Publish
 */
export async function submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId, role } = req.user!;
    const { action } = req.body; // 'SUBMIT', 'APPROVE', 'AMEND'

    const report = await RadiologyReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });
    if (!report) throw new NotFoundError('Radiology report not found');

    if (action === 'SUBMIT') {
      if (report.status !== 'Draft' && report.status !== 'Amended') {
        throw new ValidationError('Only Draft or Amended reports can be submitted');
      }
      report.status = 'Submitted';
      report.version += 1;
      await report.save();
      await saveReportVersion(report, new mongoose.Types.ObjectId(userId));

    } else if (action === 'APPROVE') {
      if (report.status !== 'Submitted' && report.status !== 'Draft') {
        throw new ValidationError('Cannot approve this report in its current state');
      }
      // If Senior Radiologist, they can approve directly.
      report.status = 'Approved';
      report.approvedBy = new mongoose.Types.ObjectId(userId);
      report.approvedAt = new Date();
      report.version += 1;
      await report.save();
      await saveReportVersion(report, new mongoose.Types.ObjectId(userId));

      // Update Order Status
      const order = await RadiologyOrder.findById(report.orderId);
      if (order) {
        const study = await ImagingStudy.findById(report.studyId);
        if (study) {
          const orderItem = order.items.find(i => i._id?.toString() === study.orderItemId.toString());
          if (orderItem) {
            orderItem.status = 'Approved';
            const allApproved = order.items.every(i => i.status === 'Approved' || i.status === 'Delivered');
            if (allApproved) order.orderStatus = 'Approved';
            await order.save();
          }
        }
      }

    } else if (action === 'AMEND') {
      if (report.status !== 'Approved' && report.status !== 'Published') {
        throw new ValidationError('Can only amend Approved or Published reports');
      }
      report.status = 'Amended';
      // Do not increment version until submitted again.
      await report.save();
    } else {
      throw new ValidationError('Invalid action');
    }

    sendSuccess(res, report, `Report status updated to ${report.status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Report
 */
export async function getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const report = await RadiologyReport.findOne({ _id: req.params.reportId, tenantId, hospitalId })
      .populate('patientId', 'firstName lastName uhid')
      .populate('studyId', 'accessionNumber modality studyDate')
      .populate('radiologistId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!report) throw new NotFoundError('Radiology report not found');

    sendSuccess(res, report, 'Radiology report retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Report Versions
 */
export async function getReportVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    
    // Validate report exists and belongs to tenant
    const report = await RadiologyReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });
    if (!report) throw new NotFoundError('Radiology report not found');

    const versions = await ReportVersion.find({ reportId: report._id, tenantId, hospitalId })
      .populate('savedBy', 'firstName lastName role')
      .sort({ versionNumber: -1 });

    sendSuccess(res, versions, 'Report versions retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Templates
 */
export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // In a real system, these would be fetched from a ReportTemplate collection.
    // Simulating configurable templates.
    const templates = [
      {
        id: 'TPL-XRAY-CHEST',
        modality: 'X-Ray',
        name: 'Standard Chest X-Ray',
        content: {
          technique: 'PA and Lateral views of the chest.',
          findings: 'The heart size is normal. The lungs are clear. No pleural effusion or pneumothorax.',
          impression: 'Normal chest x-ray.'
        }
      },
      {
        id: 'TPL-MRI-BRAIN',
        modality: 'MRI',
        name: 'Standard Brain MRI',
        content: {
          technique: 'Multiplanar multisequence MR imaging of the brain without IV contrast.',
          findings: 'The ventricles and sulci are prominent for age. No acute infarct, hemorrhage, or mass.',
          impression: 'No acute intracranial abnormality.'
        }
      }
    ];

    sendSuccess(res, templates, 'Report templates retrieved');
  } catch (err) {
    next(err);
  }
}
