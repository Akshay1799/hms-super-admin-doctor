import { Request, Response, NextFunction } from 'express';
import { LaboratoryOrder } from '../models/LaboratoryOrder';
import { TestCatalog } from '../models/TestCatalog';
import { LaboratoryPanel } from '../models/LaboratoryPanel';
import { LaboratorySpecimen } from '../models/LaboratorySpecimen';
import { LaboratoryPackage } from '../models/LaboratoryPackage';
import { LaboratoryResult } from '../models/LaboratoryResult';
import { LaboratoryReport } from '../models/LaboratoryReport';
import { ReportDelivery } from '../models/ReportDelivery';
import { ReferenceRange } from '../models/ReferenceRange';
import { Patient } from '../models/Patient';
import { Invoice } from '../models/Billing';
import { generateBarcodeBase64 } from '../utils/barcode';
import { generatePdfReport } from '../utils/pdfGenerator';
import { sendEmail } from '../utils/email';
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

    const order = await LaboratoryOrder.findById(specimen.laboratoryOrderId);
    if (!order) throw new NotFoundError('Laboratory order not found');

    if (!['Completed', 'Deferred', 'Not Required'].includes(order.billingStatus || 'Not Required')) {
      throw new ValidationError('Cannot collect sample: Billing validation is incomplete.');
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
    if (order.status === 'Sample Pending') {
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

// ----------------------------------------------------------------------
// Billing & Packages (Feature 3)
// ----------------------------------------------------------------------

/**
 * Get Laboratory Packages
 */
export async function getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const packages = await LaboratoryPackage.find({ tenantId, hospitalId, isActive: true })
      .populate('tests')
      .populate('panels');

    sendSuccess(res, packages, 'Laboratory packages retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Billing Status
 */
export async function getBillingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const order = await LaboratoryOrder.findOne({ _id: req.params.orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Laboratory order not found');

    let invoice = null;
    if (order.invoiceId) {
      invoice = await Invoice.findById(order.invoiceId);
    }

    sendSuccess(res, {
      billingStatus: order.billingStatus,
      invoiceId: order.invoiceId,
      invoiceStatus: invoice ? invoice.status : null
    }, 'Billing status retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Validate Billing
 */
export async function validateBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { overrideReason, isEmergency } = req.body;

    const order = await LaboratoryOrder.findOne({ _id: req.params.orderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Laboratory order not found');

    if (order.billingStatus === 'Completed' || order.billingStatus === 'Not Required') {
      sendSuccess(res, order, 'Billing is already validated');
      return;
    }

    if (isEmergency) {
      if (!overrideReason) throw new ValidationError('Override reason is required for emergency billing override');
      
      // Create deferred invoice
      const timestamp = Date.now().toString().slice(-6);
      const invoice = new Invoice({
        tenantId,
        hospitalId,
        patientId: order.patientId,
        invoiceNumber: `INV-${new Date().getFullYear()}-${timestamp}`,
        invoiceType: 'Lab',
        billingMode: 'Self-Pay',
        tenantName: 'Emergency Deferred',
        amount: 0,
        totalAmount: 0,
        status: 'draft',
        locked: false,
        issuedDate: new Date(),
        dueDate: new Date(),
        createdBy: new mongoose.Types.ObjectId(userId.toString())
      });
      await invoice.save();
      
      order.invoiceId = invoice._id as mongoose.Types.ObjectId;
      order.billingStatus = 'Deferred';
      order.history.push({
        action: 'Billing Override',
        timestamp: new Date(),
        userId: new mongoose.Types.ObjectId(userId.toString()),
        details: `Emergency Override: ${overrideReason} - Deferred Invoice Created`
      });

      if (order.status === 'Requested' || order.status === 'Billing Pending') {
        order.status = 'Sample Pending';
      }

      await order.save();
      sendSuccess(res, order, 'Emergency billing override applied successfully');
      return;
    }

    if (!order.invoiceId) {
      throw new ValidationError('No invoice linked to this order for validation');
    }

    const invoice = await Invoice.findOne({ _id: order.invoiceId, tenantId });
    if (!invoice) throw new NotFoundError('Invoice not found in Billing module');

    if (invoice.status === 'paid') {
      order.billingStatus = 'Completed';
      order.history.push({
        action: 'Billing Validated',
        timestamp: new Date(),
        userId: new mongoose.Types.ObjectId(userId.toString()),
        details: 'Invoice confirmed paid by Billing module'
      });

      if (order.status === 'Requested' || order.status === 'Billing Pending') {
        order.status = 'Sample Pending';
      }

      await order.save();
      sendSuccess(res, order, 'Billing validated successfully');
    } else {
      throw new ValidationError(`Billing validation failed: Invoice status is ${invoice.status}`);
    }
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Results & Reporting (Feature 4)
// ----------------------------------------------------------------------

/**
 * Enter Laboratory Result
 */
export async function enterResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { laboratoryOrderId, testId, specimenId, value, unit } = req.body;

    const order = await LaboratoryOrder.findOne({ _id: laboratoryOrderId, tenantId, hospitalId });
    if (!order) throw new NotFoundError('Laboratory order not found');

    if (!['Sample Collected', 'Processing', 'Reported'].includes(order.status)) {
      throw new ValidationError('Order must be in Processing or Sample Collected state to enter results');
    }

    const test = await TestCatalog.findOne({ _id: testId, tenantId });
    if (!test) throw new NotFoundError('Test catalog item not found');

    const patient = await Patient.findById(order.patientId);
    if (!patient) throw new NotFoundError('Patient not found');

    // Auto-calculate classification
    let isAbnormal = false;
    let isCritical = false;
    let isPanic = false;
    let deltaWarning = false;
    let classification = 'Normal';
    let referenceRangeStr = '';

    const ageDays = patient.dateOfBirth 
      ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const ranges = await ReferenceRange.find({
      testId,
      tenantId,
      hospitalId,
      isActive: true,
      minAgeDays: { $lte: ageDays },
      maxAgeDays: { $gte: ageDays }
    });

    // Find a matching gender or 'All'
    let matchingRange = ranges.find(r => r.gender === patient.gender);
    if (!matchingRange) {
      matchingRange = ranges.find(r => r.gender === 'All');
    }

    if (matchingRange && typeof value === 'number') {
      referenceRangeStr = `${matchingRange.normalMinValue} - ${matchingRange.normalMaxValue} ${matchingRange.unit || ''}`;
      const numVal = Number(value);

      if (matchingRange.panicMinValue !== undefined && numVal < matchingRange.panicMinValue) {
        isPanic = true;
        classification = 'Panic Low';
      } else if (matchingRange.panicMaxValue !== undefined && numVal > matchingRange.panicMaxValue) {
        isPanic = true;
        classification = 'Panic High';
      } else if (matchingRange.criticalMinValue !== undefined && numVal < matchingRange.criticalMinValue) {
        isCritical = true;
        classification = 'Critical Low';
      } else if (matchingRange.criticalMaxValue !== undefined && numVal > matchingRange.criticalMaxValue) {
        isCritical = true;
        classification = 'Critical High';
      } else if (numVal < matchingRange.normalMinValue) {
        isAbnormal = true;
        classification = 'Low';
      } else if (numVal > matchingRange.normalMaxValue) {
        isAbnormal = true;
        classification = 'High';
      }
    }

    // Delta check: fetch the last validated result for the same patient and test
    const previousResult = await LaboratoryResult.findOne({
      patientId: order.patientId,
      testId,
      tenantId,
      status: 'Validated'
    }).sort({ enteredAt: -1 });

    if (previousResult && typeof value === 'number' && typeof previousResult.value === 'number') {
      const prev = Number(previousResult.value);
      const curr = Number(value);
      // Example Delta Check: If variance is > 20%
      if (prev > 0) {
        const variance = Math.abs((curr - prev) / prev);
        if (variance > 0.20) {
          deltaWarning = true;
        }
      }
    }

    const result = new LaboratoryResult({
      laboratoryOrderId,
      patientId: order.patientId,
      testId,
      specimenId,
      value,
      unit: unit || (matchingRange ? matchingRange.unit : undefined),
      referenceRange: referenceRangeStr,
      isAbnormal,
      isCritical,
      isPanic,
      deltaWarning,
      classification,
      enteredBy: new mongoose.Types.ObjectId(userId.toString()),
      tenantId,
      hospitalId,
      status: 'Entered'
    });

    await result.save();

    if (order.status !== 'Processing') {
      order.status = 'Processing';
      await order.save();
    }

    sendCreated(res, result, 'Laboratory result entered');
  } catch (err) {
    next(err);
  }
}

/**
 * Generate Report (PDF)
 */
export async function generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { laboratoryOrderId } = req.body;

    const order = await LaboratoryOrder.findOne({ _id: laboratoryOrderId, tenantId, hospitalId })
      .populate('patientId', 'firstName lastName uhid dateOfBirth gender')
      .populate('doctorId', 'firstName lastName');

    if (!order) throw new NotFoundError('Laboratory order not found');

    const results = await LaboratoryResult.find({ laboratoryOrderId, tenantId, hospitalId }).populate('testId');
    
    if (!results || results.length === 0) {
      throw new ValidationError('Cannot generate report: No results entered for this order');
    }

    // Check if an existing report is there
    let existingReport = await LaboratoryReport.findOne({ laboratoryOrderId, tenantId, hospitalId }).sort({ version: -1 });
    let newVersion = 1;
    let previousVersionId = undefined;

    if (existingReport) {
      if (existingReport.status === 'Draft') {
        // Just overwrite draft
        newVersion = existingReport.version;
        await LaboratoryReport.deleteOne({ _id: existingReport._id });
      } else {
        newVersion = existingReport.version + 1;
        previousVersionId = existingReport._id;
      }
    }

    // Prepare PDF Data
    const patientInfo: any = order.patientId;
    const doctorInfo: any = order.doctorId;
    const age = patientInfo.dateOfBirth 
      ? new Date().getFullYear() - new Date(patientInfo.dateOfBirth).getFullYear() 
      : 0;

    const pdfData = {
      reportNumber: `REP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
      patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
      uhid: patientInfo.uhid || 'N/A',
      age,
      gender: patientInfo.gender || 'N/A',
      doctorName: doctorInfo ? `${doctorInfo.firstName} ${doctorInfo.lastName}` : 'Self / N/A',
      collectionDate: order.createdAt,
      reportingDate: new Date(),
      results: results.map((r: any) => ({
        testName: r.testId.testName,
        value: r.value,
        unit: r.unit || r.testId.unit || '',
        referenceRange: r.referenceRange || r.testId.referenceRange || '',
        isAbnormal: r.isAbnormal,
        isCritical: r.isCritical,
        isPanic: r.isPanic,
        classification: r.classification
      }))
    };

    const pdfBase64 = await generatePdfReport(pdfData);

    const report = new LaboratoryReport({
      reportNumber: pdfData.reportNumber,
      laboratoryOrderId,
      patientId: order.patientId,
      status: 'Draft',
      version: newVersion,
      previousVersionId,
      results: results.map(r => r._id),
      pdfBase64,
      generatedBy: new mongoose.Types.ObjectId(userId.toString()),
      tenantId,
      hospitalId
    });

    await report.save();

    // Update order status if not already reported
    if (order.status !== 'Reported') {
      order.status = 'Reported';
      await order.save();
    }

    sendCreated(res, report, 'Report generated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Report
 */
export async function getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId })
      .populate({
        path: 'results',
        populate: { path: 'testId', select: 'testName unit referenceRange' }
      })
      .populate('generatedBy', 'firstName lastName');

    if (!report) throw new NotFoundError('Report not found');

    // Log the view event for Feature 7
    await ReportDelivery.create({
      reportId: report._id,
      patientId: report.patientId,
      channel: 'Patient Portal',
      status: 'Viewed',
      accessedAt: new Date(),
      accessedBy: new mongoose.Types.ObjectId(userId.toString()),
      tenantId,
      hospitalId
    });

    sendSuccess(res, report, 'Report retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Download Report PDF
 */
export async function downloadReportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');
    if (!report.pdfBase64) throw new ValidationError('PDF not available for this report');

    // Log the download event for Feature 7
    await ReportDelivery.create({
      reportId: report._id,
      patientId: report.patientId,
      channel: 'Patient Portal',
      status: 'Downloaded',
      accessedAt: new Date(),
      accessedBy: new mongoose.Types.ObjectId(userId.toString()),
      tenantId,
      hospitalId
    });

    sendSuccess(res, { pdfBase64: report.pdfBase64 }, 'PDF retrieved');
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
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');

    const versions = await LaboratoryReport.find({
      laboratoryOrderId: report.laboratoryOrderId,
      tenantId,
      hospitalId
    }).sort({ version: -1 });

    sendSuccess(res, versions, 'Report versions retrieved');
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Reference Ranges (Feature 5)
// ----------------------------------------------------------------------

/**
 * Create Reference Range
 */
export async function createReferenceRange(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    
    const range = new ReferenceRange({
      ...req.body,
      tenantId,
      hospitalId
    });

    await range.save();

    sendCreated(res, range, 'Reference range created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get Reference Ranges
 */
export async function getReferenceRanges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { testId } = req.query;

    const query: any = { tenantId, hospitalId, isActive: true };
    if (testId) query.testId = testId;

    const ranges = await ReferenceRange.find(query).populate('testId', 'testName testCode');

    sendSuccess(res, ranges, 'Reference ranges retrieved');
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Report Approval Workflow (Feature 6)
// ----------------------------------------------------------------------

/**
 * Submit Report For Review
 */
export async function submitReportForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'Draft' && report.status !== 'Correction Required') {
      throw new ValidationError('Only Draft or Correction Required reports can be submitted for review');
    }

    report.status = 'Pending Review';
    report.submittedAt = new Date();
    await report.save();

    sendSuccess(res, report, 'Report submitted for review');
  } catch (err) {
    next(err);
  }
}

/**
 * Approve Report
 */
export async function approveReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { approvalRemarks } = req.body;
    
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'Pending Review' && report.status !== 'Under Review') {
      throw new ValidationError('Report is not pending review');
    }

    report.status = 'Approved';
    report.reviewedBy = new mongoose.Types.ObjectId(userId.toString());
    report.reviewedAt = new Date();
    report.approvalRemarks = approvalRemarks;
    
    await report.save();

    sendSuccess(res, report, 'Report approved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Reject Report
 */
export async function rejectReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId, id: userId } = req.user!;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) throw new ValidationError('Rejection reason is required');

    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'Pending Review' && report.status !== 'Under Review') {
      throw new ValidationError('Report is not pending review');
    }

    report.status = 'Correction Required';
    report.reviewedBy = new mongoose.Types.ObjectId(userId.toString());
    report.reviewedAt = new Date();
    report.rejectionReason = rejectionReason;
    
    await report.save();

    sendSuccess(res, report, 'Report rejected and returned for correction');
  } catch (err) {
    next(err);
  }
}

/**
 * Publish Report
 */
export async function publishReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId });

    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'Approved') {
      throw new ValidationError('Only approved reports can be published');
    }

    report.status = 'Published';
    await report.save();

    sendSuccess(res, report, 'Report published successfully');
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Report Delivery (Feature 7)
// ----------------------------------------------------------------------

/**
 * Deliver Report
 */
export async function deliverReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { channel, recipientDetails } = req.body;

    const report = await LaboratoryReport.findOne({ _id: req.params.reportId, tenantId, hospitalId })
      .populate('patientId', 'firstName lastName email');

    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'Published') throw new ValidationError('Only Published reports can be delivered');

    const patientInfo: any = report.patientId;
    const emailToUse = recipientDetails || patientInfo.email;

    if (channel === 'Email' && !emailToUse) {
      throw new ValidationError('Email address is required for Email delivery');
    }

    const delivery = new ReportDelivery({
      reportId: report._id,
      patientId: report.patientId,
      channel,
      status: 'Pending',
      recipientDetails: emailToUse,
      tenantId,
      hospitalId
    });

    await delivery.save();

    // Simulate sending email
    if (channel === 'Email') {
      try {
        const subject = `Your Laboratory Report from MediChain Hospital`;
        const html = `
          <h3>Hello ${patientInfo.firstName} ${patientInfo.lastName},</h3>
          <p>Your laboratory report (No: ${report.reportNumber}) has been published and is ready.</p>
          <p>Please log in to your patient portal to view and download it securely.</p>
        `;
        
        await sendEmail({ to: emailToUse, subject, html });
        
        delivery.status = 'Delivered';
        delivery.deliveredAt = new Date();
        await delivery.save();
      } catch (error) {
        delivery.status = 'Failed';
        await delivery.save();
        throw new ValidationError('Email delivery failed. Delivery record saved as Failed.');
      }
    } else {
      // Patient Portal notification logic would go here
      delivery.status = 'Delivered';
      delivery.deliveredAt = new Date();
      await delivery.save();
    }

    sendSuccess(res, delivery, `Report delivered via ${channel}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Re-send Report
 */
export async function resendReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const delivery = await ReportDelivery.findOne({ _id: req.params.deliveryId, tenantId, hospitalId });

    if (!delivery) throw new NotFoundError('Delivery record not found');

    const report = await LaboratoryReport.findById(delivery.reportId).populate('patientId', 'firstName lastName');
    const patientInfo: any = report?.patientId;

    delivery.retryCount += 1;
    delivery.status = 'Pending';
    await delivery.save();

    if (delivery.channel === 'Email') {
      try {
        const subject = `[Resend] Your Laboratory Report from MediChain Hospital`;
        const html = `
          <h3>Hello ${patientInfo.firstName} ${patientInfo.lastName},</h3>
          <p>Your laboratory report is ready to be downloaded from the patient portal.</p>
        `;
        
        await sendEmail({ to: delivery.recipientDetails!, subject, html });
        
        delivery.status = 'Delivered';
        delivery.deliveredAt = new Date();
        await delivery.save();
      } catch (error) {
        delivery.status = 'Failed';
        await delivery.save();
        throw new ValidationError('Email re-delivery failed.');
      }
    }

    sendSuccess(res, delivery, `Report re-delivered via ${delivery.channel}`);
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
    const statuses = await ReportDelivery.find({ reportId: req.params.reportId, tenantId, hospitalId }).sort({ createdAt: -1 });

    sendSuccess(res, statuses, 'Delivery status retrieved');
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
    const history = await ReportDelivery.find({ 
      reportId: req.params.reportId, 
      status: { $in: ['Viewed', 'Downloaded'] },
      tenantId, 
      hospitalId 
    }).populate('accessedBy', 'firstName lastName role').sort({ accessedAt: -1 });

    sendSuccess(res, history, 'Access history retrieved');
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// Dashboards & Analytics
// ----------------------------------------------------------------------

/**
 * Get Laboratory Dashboard Metrics
 */
export async function getLaboratoryDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Orders Metrics
    const totalOrdersToday = await LaboratoryOrder.countDocuments({ tenantId, hospitalId, createdAt: { $gte: today } });
    const pendingOrders = await LaboratoryOrder.countDocuments({ tenantId, hospitalId, status: 'Pending' });
    const processingOrders = await LaboratoryOrder.countDocuments({ tenantId, hospitalId, status: 'Processing' });
    const completedOrdersToday = await LaboratoryOrder.countDocuments({ tenantId, hospitalId, status: 'Completed', updatedAt: { $gte: today } });

    // Specimens Metrics
    const pendingSpecimens = await LaboratorySpecimen.countDocuments({ tenantId, hospitalId, status: 'Pending' });
    const collectedSpecimensToday = await LaboratorySpecimen.countDocuments({ tenantId, hospitalId, status: 'Collected', collectionTime: { $gte: today } });
    const rejectedSpecimens = await LaboratorySpecimen.countDocuments({ tenantId, hospitalId, status: 'Rejected' });

    // Results Metrics
    const criticalResultsToday = await LaboratoryResult.countDocuments({ tenantId, hospitalId, isCritical: true, createdAt: { $gte: today } });
    const panicResultsToday = await LaboratoryResult.countDocuments({ tenantId, hospitalId, isPanic: true, createdAt: { $gte: today } });
    const abnormalResultsToday = await LaboratoryResult.countDocuments({ tenantId, hospitalId, isAbnormal: true, createdAt: { $gte: today } });

    // Reports / Approvals Metrics
    const reportsPendingReview = await LaboratoryReport.countDocuments({ tenantId, hospitalId, status: 'Pending Review' });
    const reportsApprovedToday = await LaboratoryReport.countDocuments({ tenantId, hospitalId, status: 'Approved', reviewedAt: { $gte: today } });

    // Delivery Metrics
    const deliveriesToday = await ReportDelivery.countDocuments({ tenantId, hospitalId, status: 'Delivered', deliveredAt: { $gte: today } });
    const failedDeliveries = await ReportDelivery.countDocuments({ tenantId, hospitalId, status: 'Failed' });

    sendSuccess(res, {
      orders: { totalToday: totalOrdersToday, pending: pendingOrders, processing: processingOrders, completedToday: completedOrdersToday },
      specimens: { pending: pendingSpecimens, collectedToday: collectedSpecimensToday, rejected: rejectedSpecimens },
      results: { criticalToday: criticalResultsToday, panicToday: panicResultsToday, abnormalToday: abnormalResultsToday },
      approvals: { pendingReview: reportsPendingReview, approvedToday: reportsApprovedToday },
      deliveries: { deliveredToday: deliveriesToday, failed: failedDeliveries }
    }, 'Dashboard metrics retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Export Laboratory Data
 */
export async function exportLaboratoryData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tenantId, hospitalId } = req.user!;
    const { type } = req.query; // 'orders' or 'results'

    if (type === 'orders') {
      const orders = await LaboratoryOrder.find({ tenantId, hospitalId }).populate('patientId', 'firstName lastName uhid').sort({ createdAt: -1 }).limit(1000);
      
      let csv = 'Order ID,Patient Name,UHID,Status,Total Amount,Created At\n';
      orders.forEach((o: any) => {
        csv += `${o.orderNumber},"${o.patientId?.firstName} ${o.patientId?.lastName}",${o.patientId?.uhid},${o.status},${o.totalAmount},${o.createdAt.toISOString()}\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.attachment('laboratory_orders.csv');
      res.send(csv);
      return;
    } 
    else if (type === 'results') {
      const results = await LaboratoryResult.find({ tenantId, hospitalId }).populate('patientId', 'firstName lastName uhid').populate('testId', 'testName').sort({ createdAt: -1 }).limit(1000);
      
      let csv = 'Test Name,Patient Name,UHID,Value,Unit,Classification,Status,Entered At\n';
      results.forEach((r: any) => {
        csv += `"${r.testId?.testName}","${r.patientId?.firstName} ${r.patientId?.lastName}",${r.patientId?.uhid},${r.value},${r.unit},${r.classification},${r.status},${r.createdAt.toISOString()}\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.attachment('laboratory_results.csv');
      res.send(csv);
      return;
    }

    throw new ValidationError('Invalid export type. Use ?type=orders or ?type=results');
  } catch (err) {
    next(err);
  }
}
