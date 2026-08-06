import { Request, Response, NextFunction } from 'express';
import { RadiologyOrder } from '../models/RadiologyOrder';
import { ImagingCatalog } from '../models/ImagingCatalog';
import { sendSuccess, sendCreated, NotFoundError, ValidationError } from '../utils/response';
import mongoose from 'mongoose';

/**
 * Ensures some dummy catalog exists for testing.
 */
async function ensureDummyCatalog(tenantId: mongoose.Types.ObjectId, hospitalId: mongoose.Types.ObjectId, departmentId: mongoose.Types.ObjectId) {
  const count = await ImagingCatalog.countDocuments({ tenantId, hospitalId });
  if (count === 0) {
    const dummyExams = [
      {
        examinationCode: 'XR-CHEST-01',
        examinationName: 'Chest X-Ray PA View',
        modality: 'X-Ray',
        category: 'Diagnostic Imaging',
        bodyPart: 'Chest',
        departmentId,
        contrastRequired: false,
        preparationInstructions: ['Remove metallic objects'],
        estimatedDurationMinutes: 15,
        billingCode: 'RAD-XR-001',
        activeStatus: true,
        tenantId,
        hospitalId,
        createdBy: new mongoose.Types.ObjectId() // Dummy user
      },
      {
        examinationCode: 'CT-BRAIN-C',
        examinationName: 'CT Brain with Contrast',
        modality: 'CT Scan',
        category: 'Computed Tomography',
        bodyPart: 'Brain',
        departmentId,
        contrastRequired: true,
        preparationInstructions: ['Fast for 4 hours', 'Kidney function test required'],
        estimatedDurationMinutes: 30,
        billingCode: 'RAD-CT-002',
        activeStatus: true,
        tenantId,
        hospitalId,
        createdBy: new mongoose.Types.ObjectId() // Dummy user
      }
    ];
    await ImagingCatalog.insertMany(dummyExams);
  }
}

/**
 * Get active imaging catalog
 */
export async function getImagingCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const defaultDept = new mongoose.Types.ObjectId(); 
    await ensureDummyCatalog(tenantId!, hospitalId!, defaultDept);

    const exams = await ImagingCatalog.find({ tenantId, hospitalId, activeStatus: true });

    sendSuccess(res, exams, 'Imaging catalog retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create Radiology Order
 */
export async function createRadiologyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, departmentId, priority, items, clinicalInformation, contrastInformation, billingStatus } = req.body;
    const { tenantId, hospitalId, id: doctorId } = req.user!;

    if (!items || items.length === 0) {
      throw new ValidationError('Radiology order must contain at least one examination item');
    }

    const timestamp = Date.now().toString().slice(-6);
    const orderNumber = `RAD-${new Date().getFullYear()}-${timestamp}`;

    const order = new RadiologyOrder({
      orderNumber,
      patientId,
      doctorId,
      departmentId,
      tenantId,
      hospitalId,
      orderStatus: billingStatus === 'Pending' ? 'Billing Pending' : 'Requested',
      priority: priority || 'Routine',
      items,
      clinicalInformation,
      contrastInformation,
      createdBy: doctorId
    });

    await order.save();

    sendCreated(res, order, 'Radiology order created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Radiology Order
 */
export async function getRadiologyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const order = await RadiologyOrder.findOne({
      _id: req.params.orderId,
      tenantId,
      hospitalId
    })
      .populate('patientId', 'firstName lastName uhid')
      .populate('doctorId', 'firstName lastName')
      .populate('items.catalogId');

    if (!order) throw new NotFoundError('Radiology order not found');

    sendSuccess(res, order, 'Radiology order retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Update Radiology Order (Only before scheduling / study begins)
 */
export async function updateRadiologyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { clinicalInformation, items, priority, contrastInformation } = req.body;

    const order = await RadiologyOrder.findOne({ _id: req.params.orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Radiology order not found');

    // Business rule: Cannot modify if study has started or is scheduled 
    // Allowing modifications for Draft, Requested, Billing Pending, Billing Completed
    const allowedStatuses = ['Draft', 'Requested', 'Billing Pending', 'Billing Completed'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      throw new ValidationError(`Cannot modify order in ${order.orderStatus} state`);
    }

    if (clinicalInformation) order.clinicalInformation = clinicalInformation;
    if (items) order.items = items;
    if (priority) order.priority = priority;
    if (contrastInformation) order.contrastInformation = contrastInformation;

    await order.save();

    sendSuccess(res, order, 'Radiology order updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel Radiology Order
 */
export async function cancelRadiologyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      throw new ValidationError('Cancellation reason is required');
    }

    const order = await RadiologyOrder.findOne({ _id: req.params.orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Radiology order not found');

    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Study Completed' || order.orderStatus === 'Archived') {
      throw new ValidationError(`Cannot cancel order in ${order.orderStatus} state`);
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = cancellationReason;
    order.items.forEach(item => {
      if (item.status !== 'Study Completed' && item.status !== 'Approved' && item.status !== 'Delivered') {
        item.status = 'Cancelled';
        item.cancellationReason = cancellationReason;
      }
    });

    await order.save();

    sendSuccess(res, order, 'Radiology order cancelled successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Search Radiology Orders
 */
export async function searchRadiologyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { patientId, doctorId, status, priority } = req.query;

    const query: any = { tenantId, hospitalId };
    
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.orderStatus = status;
    if (priority) query.priority = priority;

    const orders = await RadiologyOrder.find(query)
      .populate('patientId', 'firstName lastName uhid')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendSuccess(res, orders, 'Radiology orders retrieved');
  } catch (err) {
    next(err);
  }
}
