import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Supplier, PurchaseRequisition, PurchaseOrder, GoodsReceiptNote } from '../models/Procurement';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { ProcurementService } from '../services/procurement.service';

// ── Suppliers ───────────────────────────────────────────────
export const createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const supplier = new Supplier({ ...req.body, tenantId });
    await supplier.save();
    sendCreated(res, supplier, 'Supplier onboarded successfully');
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const suppliers = await Supplier.find({ tenantId }).lean();
    sendSuccess(res, suppliers);
  } catch (error) {
    next(error);
  }
};

// ── Purchase Requisitions ───────────────────────────────────
export const createRequisition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    const requisition = new PurchaseRequisition({ ...req.body, tenantId, requestedBy: userId });
    await requisition.save();
    sendCreated(res, requisition, 'Purchase Requisition created successfully');
  } catch (error) {
    next(error);
  }
};

export const approveRequisition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    const { id } = req.params;

    const pr = await PurchaseRequisition.findOneAndUpdate(
      { _id: id, tenantId, status: 'pending_approval' },
      { status: 'approved', approvedBy: userId },
      { new: true }
    );
    if (!pr) throw new NotFoundError('Pending Requisition not found');
    sendSuccess(res, pr, 'Purchase Requisition approved');
  } catch (error) {
    next(error);
  }
};

// ── Purchase Orders ─────────────────────────────────────────
export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    const po = new PurchaseOrder({ ...req.body, tenantId, createdBy: userId });
    await po.save();
    sendCreated(res, po, 'Purchase Order created successfully');
  } catch (error) {
    next(error);
  }
};

export const approvePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    const { id } = req.params;

    const po = await PurchaseOrder.findOneAndUpdate(
      { _id: id, tenantId, status: { $in: ['draft', 'pending_approval'] } },
      { status: 'approved', approvedBy: userId },
      { new: true }
    );
    if (!po) throw new NotFoundError('Eligible PO not found');
    sendSuccess(res, po, 'Purchase Order approved');
  } catch (error) {
    next(error);
  }
};

// ── Goods Receipt Note ──────────────────────────────────────
export const submitGRN = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const userId = req.user?._id;
    
    // 1. Save GRN
    const grn = new GoodsReceiptNote({ ...req.body, tenantId, receivedBy: userId });
    
    // Auto-verify if requested (simplified logic for demonstration)
    if (req.body.autoVerify) {
      grn.status = 'verified';
      grn.verifiedBy = userId;
    }
    
    await grn.save({ session });

    // 2. If verified, process the GRN and update inventory atomically
    if (grn.status === 'verified') {
      await ProcurementService.processVerifiedGRN(session, grn._id as any, userId as any);
    }

    await session.commitTransaction();
    session.endSession();

    sendCreated(res, grn, 'GRN submitted and processed successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
