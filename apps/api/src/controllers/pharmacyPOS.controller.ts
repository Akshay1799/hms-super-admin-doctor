import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PharmacyPrescription, PharmacySale, PatientReturn, DamageDisposal } from '../models/PharmacyPOS';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { PharmacyPOSService } from '../services/pharmacyPOS.service';

// ── Prescriptions ───────────────────────────────────────────
export const createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const doctorId = req.user?._id;
    const rx = new PharmacyPrescription({ ...req.body, tenantId, doctorId, status: 'approved' });
    await rx.save();
    sendCreated(res, rx, 'Prescription created successfully');
  } catch (error) {
    next(error);
  }
};

// ── POS Sales ───────────────────────────────────────────────
export const createSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    
    const saleData = { ...req.body, tenantId };
    
    // 1. Create Sale and RESERVE stock (does not deduct yet)
    const sale = await PharmacyPOSService.createSale(session, saleData, userId as any);
    
    await session.commitTransaction();
    session.endSession();
    
    sendCreated(res, sale, 'Sale created and stock reserved. Pending payment.');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const confirmDispense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    // Simulate payment completion in this endpoint for demonstration
    // (In reality, this would be a webhook or a separate payment flow)
    const sale = await mongoose.model('PharmacySale').findById(id).session(session);
    if (!sale) throw new NotFoundError('Sale not found');
    sale.paymentStatus = 'paid';
    await sale.save({ session });

    // Confirm dispensing and commit atomic deduction
    await PharmacyPOSService.confirmDispense(session, sale._id as any, userId as any);

    await session.commitTransaction();
    session.endSession();

    sendSuccess(res, sale, 'Payment successful. Stock physically deducted and dispensed.');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const cancelSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    await PharmacyPOSService.cancelSale(session, id as any, userId as any);

    await session.commitTransaction();
    session.endSession();

    sendSuccess(res, null, 'Sale voided successfully. Reserved stock released.');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ── Returns & Damage ────────────────────────────────────────
export const requestPatientReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    
    const returnRecord = new PatientReturn({ ...req.body, tenantId, requestedBy: userId, status: 'requested' });
    await returnRecord.save();
    sendCreated(res, returnRecord, 'Patient return requested. Pending inspection.');
  } catch (error) {
    next(error);
  }
};

export const approvePatientReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    const { id } = req.params;

    // First inspect
    const returnRecord = await PatientReturn.findOneAndUpdate(
      { _id: id, tenantId, status: 'requested' },
      { status: 'inspected', approvedBy: userId },
      { new: true, session }
    );
    if (!returnRecord) throw new NotFoundError('Pending return not found');

    // Process refund and restore stock
    await PharmacyPOSService.processPatientReturn(session, returnRecord._id as any, userId as any);

    await session.commitTransaction();
    session.endSession();

    sendSuccess(res, returnRecord, 'Return approved, stock restored, and refunded');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const reportDamageDisposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    
    const damage = new DamageDisposal({ ...req.body, tenantId, reportedBy: userId });
    await damage.save();
    sendCreated(res, damage, 'Damage/Disposal reported successfully');
  } catch (error) {
    next(error);
  }
};

// ── Dashboard, Search, and Reports (Gaps Fixed) ─────────────
export const getPOSDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const pharmacyId = req.query.pharmacyId; // Optional filter

    const match: any = { tenantId };
    if (pharmacyId) match.pharmacyId = pharmacyId;

    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [salesToday, pendingRx, pendingReturns] = await Promise.all([
      PharmacySale.aggregate([
        { $match: { ...match, paymentStatus: 'paid', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      PharmacyPrescription.countDocuments({ tenantId, status: 'approved' }),
      PatientReturn.countDocuments({ ...match, status: 'requested' })
    ]);

    sendSuccess(res, {
      salesToday: salesToday[0] || { totalRevenue: 0, count: 0 },
      pendingPrescriptions: pendingRx,
      pendingReturns
    });
  } catch (error) {
    next(error);
  }
};

export const searchPOS = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { query } = req.query; // Could be saleNumber or patientId

    const filter: any = { tenantId };
    if (query) {
      filter.$or = [
        { saleNumber: { $regex: query as string, $options: 'i' } }
      ];
      if (mongoose.Types.ObjectId.isValid(query as string)) {
        filter.$or.push({ patientId: query as string });
      }
    }

    const sales = await PharmacySale.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, sales);
  } catch (error) {
    next(error);
  }
};

export const exportDailySales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await PharmacySale.find({ tenantId, paymentStatus: 'paid', createdAt: { $gte: startOfDay } })
      .populate('items.medicineId', 'genericName')
      .lean();

    // Naive CSV generation for MVP
    let csv = 'Sale Number,Sale Type,Total Amount,Created At\n';
    sales.forEach((s) => {
      csv += `${s.saleNumber},${s.saleType},${s.totalAmount},${s.createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="daily_sales.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
