import { Request, Response, NextFunction } from 'express';
import { ImagingStudy } from '../models/ImagingStudy';
import { PACSReference } from '../models/PACSReference';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { sendSuccess, sendCreated, NotFoundError, ValidationError } from '../utils/response';
import crypto from 'crypto';

/**
 * Register Uploaded Study (Simulate PACS Upload hook)
 */
export async function uploadStudy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, orderItemId, machineId, technicianId, modality, dicomMetadata, pacsServerId, storagePath } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;

    // Validate Order
    const order = await RadiologyOrder.findOne({ _id: orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Radiology order not found');

    const orderItem = order.items.find(i => i._id?.toString() === orderItemId);
    if (!orderItem) throw new NotFoundError('Radiology order item not found');

    if (orderItem.status !== 'Scheduled' && orderItem.status !== 'Requested') {
      throw new ValidationError(`Order item is in ${orderItem.status} status and cannot receive new images.`);
    }

    // 1. Create Study UID (globally unique)
    const studyUid = crypto.randomUUID();
    const accessionNumber = `ACC-${order.orderNumber}-${orderItemId.slice(-4)}`;

    // 2. Create Imaging Study Metadata
    const study = new ImagingStudy({
      studyUid,
      accessionNumber,
      patientId: order.patientId,
      orderId,
      orderItemId,
      machineId,
      technicianId: technicianId || userId,
      tenantId,
      hospitalId,
      modality,
      studyDate: new Date(),
      status: 'Available',
      dicomMetadata,
      createdBy: userId
    });

    await study.save();

    // 3. Create PACS Reference (Configured for real storage integration)
    const viewerUrl = `${process.env.PACS_VIEWER_BASE_URL || 'https://pacs.example.com/viewer'}?studyUid=${studyUid}`;
    
    const pacsRef = new PACSReference({
      studyId: study._id,
      tenantId,
      hospitalId,
      pacsServerId: pacsServerId || 'DEFAULT_PACS_01',
      storagePath: storagePath || `/archival/${new Date().getFullYear()}/${studyUid}`,
      viewerUrl,
      syncStatus: 'Synced',
      lastSyncedAt: new Date(),
      createdBy: userId
    });

    await pacsRef.save();

    // 4. Update Order Status
    orderItem.status = 'Study Completed';
    
    const allCompleted = order.items.every(i => i.status === 'Study Completed' || i.status === 'Reporting' || i.status === 'Approved' || i.status === 'Delivered');
    if (allCompleted) {
      order.orderStatus = 'Study Completed';
    } else if (order.orderStatus === 'Scheduled' || order.orderStatus === 'Scheduling Pending') {
      order.orderStatus = 'Study Pending';
    }

    await order.save();

    sendCreated(res, { study, pacsRef }, 'Imaging study successfully registered and linked to PACS');
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve Study
 */
export async function getStudy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const study = await ImagingStudy.findOne({
      _id: req.params.studyId,
      tenantId,
      hospitalId
    })
      .populate('patientId', 'firstName lastName uhid')
      .populate('orderId', 'orderNumber priority')
      .populate('machineId', 'machineName modality');

    if (!study) throw new NotFoundError('Imaging study not found');

    const pacsRef = await PACSReference.findOne({ studyId: study._id });

    sendSuccess(res, { study, pacsRef }, 'Imaging study retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Search Studies
 */
export async function searchStudies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { patientId, accessionNumber, modality, date } = req.query;

    const query: any = { tenantId, hospitalId };
    
    if (patientId) query.patientId = patientId;
    if (accessionNumber) query.accessionNumber = accessionNumber;
    if (modality) query.modality = modality;
    
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.studyDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const studies = await ImagingStudy.find(query)
      .populate('patientId', 'firstName lastName uhid')
      .sort({ studyDate: -1 });

    sendSuccess(res, studies, 'Imaging studies retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Launch Image Viewer
 */
export async function launchViewer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const study = await ImagingStudy.findOne({ _id: req.params.studyId, tenantId, hospitalId });
    if (!study) throw new NotFoundError('Imaging study not found');

    const pacsRef = await PACSReference.findOne({ studyId: study._id, tenantId, hospitalId });
    if (!pacsRef) throw new NotFoundError('PACS reference not found for this study');

    sendSuccess(res, { viewerUrl: pacsRef.viewerUrl }, 'Viewer launched successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve Study Metadata
 */
export async function getStudyMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const study = await ImagingStudy.findOne({ _id: req.params.studyId, tenantId, hospitalId });
    if (!study) throw new NotFoundError('Imaging study not found');

    sendSuccess(res, { dicomMetadata: study.dicomMetadata, studyUid: study.studyUid, accessionNumber: study.accessionNumber }, 'Study metadata retrieved');
  } catch (err) {
    next(err);
  }
}
