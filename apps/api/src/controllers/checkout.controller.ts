import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { Invoice } from '../models/Billing';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';

// Map scan types to flat pricing
const SCAN_PRICES: Record<string, number> = {
  'ECG': 800,
  'X-Ray': 1200,
  'Ultrasound': 1500,
  'CT': 3500,
  'MRI': 6500,
  'Other': 1000,
};

export async function getCheckoutPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).lean();
    if (!patient) throw new NotFoundError('Patient record not found');

    const items: Array<{ description: string; quantity: number; unitPrice: number; total: number; type: string }> = [];

    // 1. Default Consultation Fee
    items.push({
      description: 'attending Physician Consultation Fee',
      quantity: 1,
      unitPrice: 500,
      total: 500,
      type: 'consultation',
    });

    // 2. Medications pricing
    if (patient.medications && Array.isArray(patient.medications)) {
      patient.medications.forEach((med: any) => {
        items.push({
          description: `Medication: ${med.name} (${med.dose} - ${med.frequency})`,
          quantity: 1,
          unitPrice: 150,
          total: 150,
          type: 'medication',
        });
      });
    }

    // 3. Scan orders pricing
    if (patient.scans && Array.isArray(patient.scans)) {
      patient.scans.forEach((scan: any) => {
        const price = SCAN_PRICES[scan.type] || SCAN_PRICES['Other'];
        items.push({
          description: `Diagnostic Scan: ${scan.type} - ${scan.name}`,
          quantity: 1,
          unitPrice: price,
          total: price,
          type: 'scan',
        });
      });
    }

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + tax;

    sendSuccess(res, {
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
      },
      items,
      summary: {
        subtotal,
        tax,
        total,
      },
    }, 'Checkout preview calculated successfully');
  } catch (err) {
    next(err);
  }
}

export async function createCheckoutInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, items, subtotal, taxAmount, totalAmount, notes } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) throw new NotFoundError('Patient record not found');

    const tenantId = req.user?.tenantId;
    const hospitalId = req.user?.hospitalId;

    const invoice = await Invoice.create({
      tenantId,
      hospitalId,
      patientId: patient._id,
      patientName: patient.name,
      tenantName: 'Apollo Clinics Group', // default tenant descriptor
      amount: subtotal,
      taxAmount: taxAmount,
      discountAmount: 0,
      totalAmount: totalAmount,
      currency: 'INR',
      status: 'unpaid',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days due
      items: items.map((it: any) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
      notes: notes || 'Consolidated invoice generated from clinical EMR record checkout.',
      createdBy: req.user?._id,
    });

    // Optionally update patient status on checkout
    patient.status = 'Follow-up Due';
    await patient.save();

    sendCreated(res, invoice, 'Consolidated invoice created successfully');
  } catch (err) {
    next(err);
  }
}
