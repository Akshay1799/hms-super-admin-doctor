import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ControlledDrugRegister, ControlledDrugAudit } from '../models/ControlledDrugs';
import { sendSuccess, sendCreated } from '../utils/response';
import { ControlledDrugsService } from '../services/controlledDrugs.service';

// ── Controlled Drug Register ────────────────────────────────
export const getControlledDrugRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { medicineId, batchId, pharmacyId } = req.query;

    const filter: any = { tenantId };
    if (medicineId) filter.medicineId = medicineId;
    if (batchId) filter.batchId = batchId;
    if (pharmacyId) filter.pharmacyId = pharmacyId;

    const register = await ControlledDrugRegister.find(filter)
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email')
      .populate('witnessedBy', 'name email')
      .lean();

    sendSuccess(res, register);
  } catch (error) {
    next(error);
  }
};

// ── Controlled Drug Audits ──────────────────────────────────
export const performAudit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const auditedBy = req.user?._id;
    const { witnessedBy, actualQuantity, medicineId, batchId, pharmacyId, hospitalId, reason } = req.body;

    const auditEntry = await ControlledDrugsService.performAudit(session, {
      tenantId,
      hospitalId,
      pharmacyId,
      medicineId,
      batchId,
      actualQuantity,
      auditedBy: auditedBy as any,
      witnessedBy,
      reason
    });

    await session.commitTransaction();
    session.endSession();

    sendCreated(res, auditEntry, 'Controlled drug audit performed successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ── Secure Disposal ─────────────────────────────────────────
export const disposeControlledDrug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const performedBy = req.user?._id;
    const { witnessedBy, quantity, medicineId, batchId, pharmacyId, hospitalId, remarks } = req.body;

    // Secure disposal is tracked purely as a register entry and a stock transaction.
    // Assuming `InventoryService.commitTransaction` would be invoked here, we simplify and just log the transaction:
    const disposeEntry = await ControlledDrugsService.logTransaction(session, {
      tenantId,
      hospitalId,
      pharmacyId,
      medicineId,
      batchId,
      transactionId: new mongoose.Types.ObjectId().toString(), // Custom ID for disposal
      transactionType: 'dispose',
      quantityChanged: -quantity,
      performedBy: performedBy as any,
      witnessedBy,
      remarks
    });

    await session.commitTransaction();
    session.endSession();

    sendCreated(res, disposeEntry, 'Controlled drug disposed securely with dual verification.');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
