import { Request, Response, NextFunction } from 'express';
import { LaboratoryOrder } from '../models/LaboratoryOrder';
import { TestCatalog } from '../models/TestCatalog';
import { LaboratoryPanel } from '../models/LaboratoryPanel';
import { LaboratorySpecimen } from '../models/LaboratorySpecimen';
import { generateBarcodeBase64 } from '../utils/barcode';
import { sendSuccess, sendCreated, NotFoundError, ValidationError } from '../utils/response';
import mongoose from 'mongoose';

/**
 * Ensures some dummy test catalog exists for testing.
 */
async function ensureDummyCatalog(tenantId: mongoose.Types.ObjectId, hospitalId: mongoose.Types.ObjectId, departmentId: mongoose.Types.ObjectId) {
  const count = await TestCatalog.countDocuments({ tenantId, hospitalId });
  if (count === 0) {
    const dummyTests = [
      {
        testCode: 'CBC-001',
        testName: 'Complete Blood Count',
        category: 'Hematology',
        departmentId,
        sampleType: 'Whole Blood',
        fastingRequired: false,
        turnaroundTimeHours: 12,
        billingCode: 'B-CBC-001',
        isActive: true,
        tenantId,
        hospitalId
      },
      {
        testCode: 'LFT-001',
        testName: 'Liver Function Test',
        category: 'Biochemistry',
        departmentId,
        sampleType: 'Serum',
        fastingRequired: true,
        preparationInstructions: 'Fast for 10-12 hours.',
        turnaroundTimeHours: 24,
        billingCode: 'B-LFT-001',
        isActive: true,
        tenantId,
        hospitalId
      }
    ];
    await TestCatalog.insertMany(dummyTests);
  }
}

/**
 * Get active test catalog
 */
export async function getTestCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    // Optionally fetch a default department to attach dummy data to if not provided
    const defaultDept = new mongoose.Types.ObjectId(); // Using a random object id for seed if required
    await ensureDummyCatalog(tenantId!, hospitalId!, new mongoose.Types.ObjectId(defaultDept.toString()));

    const tests = await TestCatalog.find({ tenantId, hospitalId, isActive: true });
    const panels = await LaboratoryPanel.find({ tenantId, hospitalId, isActive: true }).populate('tests');

    sendSuccess(res, { tests, panels }, 'Test catalog retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create Laboratory Order
 */
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, departmentId, priority, items, clinicalInformation, billingStatus } = req.body;
    const { tenantId, hospitalId, id: doctorId } = req.user!;

    if (!items || items.length === 0) {
      throw new ValidationError('Laboratory order must contain at least one item');
    }

    // Generate unique order number (simple generation logic for now)
    const timestamp = Date.now().toString().slice(-6);
    const orderNumber = `LAB-${new Date().getFullYear()}-${timestamp}`;

    const order = new LaboratoryOrder({
      orderNumber,
      patientId,
      doctorId,
      departmentId,
      tenantId,
      hospitalId,
      status: billingStatus === 'Pending' ? 'Billing Pending' : 'Requested',
      priority: priority || 'Routine',
      items,
      clinicalInformation,
      billingStatus: billingStatus || 'Not Required',
      history: [
        {
          action: 'Order Created',
          userId: doctorId,
          details: 'Initial order creation from doctor'
        }
      ]
    });

    await order.save();

    // Domain Event mapping can happen here
    // eventBus.publish('LaboratoryOrderCreated', order);

    sendCreated(res, order, 'Laboratory order created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Laboratory Order
 */
export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const order = await LaboratoryOrder.findOne({
      _id: req.params.orderId,
      tenantId,
      hospitalId
    })
      .populate('patientId', 'firstName lastName uhid')
      .populate('doctorId', 'firstName lastName')
      .populate('items.testId')
      .populate('items.panelId');

    if (!order) throw new NotFoundError('Laboratory order not found');

    sendSuccess(res, order, 'Laboratory order retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Update Laboratory Order (Only before sample collection)
 */
export async function updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, clinicalInformation, priority } = req.body;
    const { tenantId, hospitalId, id: userId } = req.user!;

    const order = await LaboratoryOrder.findOne({
      _id: req.params.orderId,
      tenantId,
      hospitalId
    });

    if (!order) throw new NotFoundError('Laboratory order not found');

    if (!['Draft', 'Requested', 'Billing Pending'].includes(order.status)) {
      throw new ValidationError('Order cannot be modified after sample collection has begun or billing is complete');
    }

    if (items) order.items = items;
    if (clinicalInformation) order.clinicalInformation = clinicalInformation;
    if (priority) order.priority = priority;

    order.history.push({
      action: 'Order Updated',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: 'Doctor updated the order details'
    });

    await order.save();

    sendSuccess(res, order, 'Laboratory order updated');
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel Laboratory Order
 */
export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { reason } = req.body;

    const order = await LaboratoryOrder.findOne({
      _id: req.params.orderId,
      tenantId,
      hospitalId
    });

    if (!order) throw new NotFoundError('Laboratory order not found');

    if (['Sample Collected', 'Processing', 'Completed', 'Reported', 'Cancelled', 'Archived'].includes(order.status)) {
      throw new ValidationError('Order cannot be cancelled in its current state');
    }

    order.status = 'Cancelled';
    order.history.push({
      action: 'Order Cancelled',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: reason || 'Cancelled by authorized user'
    });

    await order.save();

    sendSuccess(res, order, 'Laboratory order cancelled');
  } catch (err) {
    next(err);
  }
}

/**
 * Search Laboratory Orders
 */
export async function searchOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { patientId, doctorId, status, priority } = req.query;

    const query: any = { tenantId, hospitalId };
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const orders = await LaboratoryOrder.find(query)
      .populate('patientId', 'firstName lastName uhid')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendSuccess(res, orders, 'Laboratory orders retrieved');
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Specimen Management (Feature 2)
// ----------------------------------------------------------------------

/**
 * Create Specimen (Generate Barcode)
 */
export async function createSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { laboratoryOrderId, patientId, sampleType, containerType } = req.body;

    const order = await LaboratoryOrder.findOne({ _id: laboratoryOrderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Laboratory order not found');

    const timestamp = Date.now().toString().slice(-6);
    const barcodeStr = `SMP-${new Date().getFullYear()}-${timestamp}`;
    
    // Generate barcode image (base64)
    const barcodeImage = await generateBarcodeBase64(barcodeStr);

    const specimen = new LaboratorySpecimen({
      barcode: barcodeStr,
      laboratoryOrderId,
      patientId,
      sampleType,
      containerType,
      status: 'Collection Pending',
      history: [
        {
          status: 'Collection Pending',
          timestamp: new Date(),
          userId: new mongoose.Types.ObjectId(req.user!.id.toString()),
          details: 'Specimen generated and barcode created'
        }
      ],
      tenantId,
      hospitalId
    });

    await specimen.save();

    // Update parent order status if needed
    if (order.status === 'Requested' || order.status === 'Billing Pending') {
      order.status = 'Sample Pending';
      await order.save();
    }

    sendCreated(res, { specimen, barcodeImage }, 'Specimen created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Collect Specimen
 */
export async function collectSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const specimen = await LaboratorySpecimen.findOne({ _id: req.params.id, tenantId, hospitalId });
    if (!specimen) throw new NotFoundError('Specimen not found');

    if (specimen.status !== 'Collection Pending') {
      throw new ValidationError(`Cannot collect specimen in status: ${specimen.status}`);
    }

    specimen.status = 'Collected';
    specimen.collectorId = new mongoose.Types.ObjectId(userId.toString());
    specimen.collectionTime = new Date();
    specimen.history.push({
      status: 'Collected',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: 'Sample physically collected from patient'
    });

    await specimen.save();

    // Optionally update order status to 'Sample Collected' if all specimens are collected
    const order = await LaboratoryOrder.findById(specimen.laboratoryOrderId);
    if (order && order.status === 'Sample Pending') {
      order.status = 'Sample Collected';
      await order.save();
    }

    sendSuccess(res, specimen, 'Specimen collected');
  } catch (err) {
    next(err);
  }
}

/**
 * Receive Specimen in Lab
 */
export async function receiveSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const specimen = await LaboratorySpecimen.findOne({ _id: req.params.id, tenantId, hospitalId });
    if (!specimen) throw new NotFoundError('Specimen not found');

    if (specimen.status !== 'Collected' && specimen.status !== 'Verified') {
      throw new ValidationError(`Cannot receive specimen in status: ${specimen.status}`);
    }

    specimen.status = 'Accepted';
    specimen.receivedById = new mongoose.Types.ObjectId(userId.toString());
    specimen.receivedTime = new Date();
    specimen.history.push({
      status: 'Accepted',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: 'Specimen received and accepted by laboratory'
    });

    await specimen.save();

    // Update parent order status
    const order = await LaboratoryOrder.findById(specimen.laboratoryOrderId);
    if (order && order.status === 'Sample Collected') {
      order.status = 'Processing';
      await order.save();
    }

    sendSuccess(res, specimen, 'Specimen accepted by laboratory');
  } catch (err) {
    next(err);
  }
}

/**
 * Reject Specimen
 */
export async function rejectSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { reason } = req.body;
    const specimen = await LaboratorySpecimen.findOne({ _id: req.params.id, tenantId, hospitalId });
    if (!specimen) throw new NotFoundError('Specimen not found');

    if (['Processing', 'Completed', 'Disposed', 'Archived'].includes(specimen.status)) {
      throw new ValidationError(`Cannot reject specimen in status: ${specimen.status}`);
    }

    specimen.status = 'Rejected';
    specimen.rejectionReason = reason;
    specimen.history.push({
      status: 'Rejected',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: reason || 'Specimen rejected'
    });

    await specimen.save();

    sendSuccess(res, specimen, 'Specimen rejected');
  } catch (err) {
    next(err);
  }
}

/**
 * Request Recollection
 */
export async function recollectSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const specimen = await LaboratorySpecimen.findOne({ _id: req.params.id, tenantId, hospitalId });
    if (!specimen) throw new NotFoundError('Specimen not found');

    if (specimen.status !== 'Rejected') {
      throw new ValidationError('Only rejected specimens can trigger a recollection');
    }

    specimen.recollectionRequested = true;
    specimen.history.push({
      status: 'Recollection Requested',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(userId.toString()),
      details: 'A new sample collection was requested'
    });

    await specimen.save();

    // Generate new specimen for recollection
    const timestamp = Date.now().toString().slice(-6);
    const barcodeStr = `SMP-${new Date().getFullYear()}-${timestamp}`;
    
    const newSpecimen = new LaboratorySpecimen({
      barcode: barcodeStr,
      laboratoryOrderId: specimen.laboratoryOrderId,
      patientId: specimen.patientId,
      sampleType: specimen.sampleType,
      containerType: specimen.containerType,
      status: 'Collection Pending',
      history: [
        {
          status: 'Collection Pending',
          timestamp: new Date(),
          userId: new mongoose.Types.ObjectId(userId.toString()),
          details: 'Recollection generated from rejected specimen'
        }
      ],
      tenantId,
      hospitalId
    });

    await newSpecimen.save();

    sendCreated(res, newSpecimen, 'Recollection requested successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Specimen
 */
export async function getSpecimen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const specimen = await LaboratorySpecimen.findOne({ _id: req.params.id, tenantId, hospitalId })
      .populate('laboratoryOrderId')
      .populate('patientId', 'firstName lastName uhid')
      .populate('collectorId', 'firstName lastName')
      .populate('receivedById', 'firstName lastName');

    if (!specimen) throw new NotFoundError('Specimen not found');

    // Return the image dynamically
    const barcodeImage = await generateBarcodeBase64(specimen.barcode);

    sendSuccess(res, { specimen, barcodeImage }, 'Specimen retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Search Specimens
 */
export async function searchSpecimens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { laboratoryOrderId, status, patientId, barcode } = req.query;

    const query: any = { tenantId, hospitalId };
    if (laboratoryOrderId) query.laboratoryOrderId = laboratoryOrderId;
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (barcode) query.barcode = barcode;

    const specimens = await LaboratorySpecimen.find(query)
      .populate('patientId', 'firstName lastName uhid')
      .sort({ createdAt: -1 });

    sendSuccess(res, specimens, 'Specimens retrieved');
  } catch (err) {
    next(err);
  }
}
