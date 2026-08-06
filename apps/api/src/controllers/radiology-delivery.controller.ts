import { Request, Response, NextFunction } from 'express';
import { RadiologyReport } from '../models/RadiologyReport';
import { RadiologyDelivery } from '../models/RadiologyDelivery';
import { PACSReference } from '../models/PACSReference';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { sendSuccess, sendCreated, NotFoundError, ValidationError, ForbiddenError } from '../utils/response';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

/**
 * Deliver Report (Simulate Email / Portal Delivery)
 */
export async function deliverReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { channel, recipientEmail } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;
    const reportId = req.params.reportId;

    const report = await RadiologyReport.findOne({ _id: reportId, tenantId, hospitalId });
    if (!report) throw new NotFoundError('Radiology report not found');

    if (report.status !== 'Approved' && report.status !== 'Published') {
      throw new ValidationError(`Cannot deliver a report in ${report.status} status. Only Approved or Published reports can be delivered.`);
    }

    // Create delivery record
    const delivery = new RadiologyDelivery({
      reportId: report._id,
      studyId: report.studyId,
      patientId: report.patientId,
      tenantId,
      hospitalId,
      channel,
      recipientEmail,
      status: 'Delivered', // Simulating successful immediate delivery
      accessHistory: [],
      createdBy: userId
    });

    await delivery.save();

    // If first time delivered, mark as Published in Report
    if (report.status === 'Approved') {
      report.status = 'Published';
      await report.save();

      // Update Order Status to Delivered
      const order = await RadiologyOrder.findById(report.orderId);
      if (order) {
        const orderItem = order.items.find(i => i.status === 'Approved');
        if (orderItem) {
          orderItem.status = 'Delivered';
          
          const allDelivered = order.items.every(i => i.status === 'Delivered');
          if (allDelivered) {
            order.orderStatus = 'Delivered';
          }
          await order.save();
        }
      }
    }

    sendCreated(res, delivery, `Report successfully delivered via ${channel}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Resend Report
 */
export async function resendReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const reportId = req.params.reportId;

    const delivery = await RadiologyDelivery.findOne({ reportId, tenantId, hospitalId }).sort({ createdAt: -1 });
    if (!delivery) throw new NotFoundError('No previous delivery found to resend');

    // Create a new delivery record for the retry
    const newDelivery = new RadiologyDelivery({
      reportId: delivery.reportId,
      studyId: delivery.studyId,
      patientId: delivery.patientId,
      tenantId,
      hospitalId,
      channel: delivery.channel,
      recipientEmail: delivery.recipientEmail,
      status: 'Delivered', // Simulated success
      accessHistory: [],
      createdBy: userId
    });

    await newDelivery.save();

    sendCreated(res, newDelivery, `Report successfully resent via ${delivery.channel}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Delivery Status
 */
export async function getDeliveryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const deliveries = await RadiologyDelivery.find({ reportId: req.params.reportId, tenantId, hospitalId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendSuccess(res, deliveries, 'Delivery status retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Download Report (Generates PDF using pdfkit)
 */
export async function downloadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId, role } = req.user!;
    
    const report = await RadiologyReport.findOne({ _id: req.params.reportId, tenantId, hospitalId })
      .populate('patientId', 'firstName lastName uhid')
      .populate('radiologistId', 'firstName lastName');

    if (!report) {
      res.status(404).json({ message: 'Radiology report not found' });
      return;
    }

    if (report.status !== 'Approved' && report.status !== 'Published' && role === 'PATIENT') {
      res.status(403).json({ message: 'Patients can only download published reports' });
      return;
    }

    // Log Access if a delivery record exists
    const delivery = await RadiologyDelivery.findOne({ reportId: report._id, tenantId, hospitalId }).sort({ createdAt: -1 });
    if (delivery) {
      delivery.status = 'Downloaded';
      delivery.accessHistory.push({
        accessedBy: new mongoose.Types.ObjectId(userId),
        role,
        action: 'Downloaded',
        timestamp: new Date(),
        ipAddress: req.ip
      });
      await delivery.save();
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `Report_${report.reportNumber}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('Radiology Diagnostic Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Report Number: ${report.reportNumber}`);
    doc.text(`Status: ${report.status}`);
    doc.text(`Date: ${report.updatedAt.toDateString()}`);
    doc.moveDown();

    const patient: any = report.patientId;
    doc.text(`Patient: ${patient?.firstName || ''} ${patient?.lastName || ''} (UHID: ${patient?.uhid || 'N/A'})`);
    
    const rad: any = report.radiologistId;
    doc.text(`Radiologist: Dr. ${rad?.firstName || ''} ${rad?.lastName || ''}`);
    doc.moveDown();

    doc.fontSize(14).text('Clinical Indication:', { underline: true });
    doc.fontSize(12).text(report.clinicalIndication || 'None provided');
    doc.moveDown();

    doc.fontSize(14).text('Technique:', { underline: true });
    doc.fontSize(12).text(report.technique || 'Standard protocol');
    doc.moveDown();

    doc.fontSize(14).text('Findings:', { underline: true });
    doc.fontSize(12).text(report.findings || 'No findings recorded');
    doc.moveDown();

    doc.fontSize(14).text('Impression:', { underline: true });
    doc.fontSize(12).text(report.impression || 'No impression recorded');
    doc.moveDown();

    if (report.recommendations) {
      doc.fontSize(14).text('Recommendations:', { underline: true });
      doc.fontSize(12).text(report.recommendations);
      doc.moveDown();
    }

    doc.fontSize(10).text('This is a highly secure, electronically verified document.', { align: 'center' });
    
    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * Download Study (PACS proxy or reference generator)
 */
export async function downloadStudy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId, role } = req.user!;
    
    const pacsRef = await PACSReference.findOne({ studyId: req.params.studyId, tenantId, hospitalId });
    if (!pacsRef) throw new NotFoundError('PACS reference not found');

    // Log Access
    const delivery = await RadiologyDelivery.findOne({ studyId: req.params.studyId, tenantId, hospitalId }).sort({ createdAt: -1 });
    if (delivery) {
      delivery.status = 'Downloaded';
      delivery.accessHistory.push({
        accessedBy: new mongoose.Types.ObjectId(userId),
        role,
        action: 'Downloaded',
        timestamp: new Date(),
        ipAddress: req.ip
      });
      await delivery.save();
    }

    sendSuccess(res, { 
      storagePath: pacsRef.storagePath,
      pacsServerId: pacsRef.pacsServerId,
      message: 'In a production environment, this endpoint would stream the DICOM ZIP archive from the PACS storage path.'
    }, 'Study download metadata retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Access History
 */
export async function getAccessHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const deliveries = await RadiologyDelivery.find({ reportId: req.params.reportId, tenantId, hospitalId })
      .populate('accessHistory.accessedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const history = deliveries.map(d => ({
      deliveryChannel: d.channel,
      recipient: d.recipientEmail,
      deliveredAt: d.createdAt,
      accessLogs: d.accessHistory
    }));

    sendSuccess(res, history, 'Access history retrieved');
  } catch (err) {
    next(err);
  }
}
