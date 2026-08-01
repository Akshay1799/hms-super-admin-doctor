import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Medicine, PharmacyLocation, InventoryBatch, StockAdjustment } from '../models/Pharmacy';
import { sendSuccess, sendCreated, NotFoundError } from '../utils/response';
import { InventoryService } from '../services/inventory.service';

// ── Medicine Master ─────────────────────────────────────────
export const createMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const medicine = new Medicine({ ...req.body, tenantId });
    await medicine.save();
    sendCreated(res, medicine, 'Medicine master created successfully');
  } catch (error) {
    next(error);
  }
};

export const searchMedicines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { query } = req.query; // Search text
    
    const filter: any = { tenantId, status: 'active' };
    if (query) {
      filter.$or = [
        { genericName: { $regex: query, $options: 'i' } },
        { brandName: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
        { barcode: query },
        { internalSku: query }
      ];
    }
    
    const medicines = await Medicine.find(filter).limit(50).lean();
    sendSuccess(res, medicines);
  } catch (error) {
    next(error);
  }
};

// ── Pharmacy Locations ──────────────────────────────────────
export const createPharmacyLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.body.tenantId;
    const location = new PharmacyLocation({ ...req.body, tenantId });
    await location.save();
    sendCreated(res, location, 'Pharmacy location created successfully');
  } catch (error) {
    next(error);
  }
};

// ── Inventory Adjustments ───────────────────────────────────
export const requestStockAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    const { pharmacyId, medicineId, batchId, reason, requestedQuantityChange, remarks } = req.body;

    const adjustment = new StockAdjustment({
      tenantId,
      pharmacyId,
      medicineId,
      batchId,
      reason,
      requestedQuantityChange,
      remarks,
      requestedBy: userId,
      status: 'pending'
    });
    
    await adjustment.save();
    sendCreated(res, adjustment, 'Stock adjustment requested. Pending approval.');
  } catch (error) {
    next(error);
  }
};

export const approveStockAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;

    const adjustment = await StockAdjustment.findOne({ _id: id, tenantId, status: 'pending' }).session(session);
    if (!adjustment) throw new NotFoundError('Pending stock adjustment not found');

    adjustment.status = 'approved';
    adjustment.approvedBy = userId as any;
    await adjustment.save({ session });

    // Commit the atomic inventory transaction to the ledger and update quantity
    await InventoryService.commitTransaction(
      session,
      tenantId as any,
      adjustment.pharmacyId,
      adjustment.medicineId,
      adjustment.batchId,
      'manual_adjustment',
      adjustment.requestedQuantityChange,
      userId as any,
      adjustment._id.toString(),
      adjustment.remarks
    );

    await session.commitTransaction();
    session.endSession();
    
    sendSuccess(res, adjustment, 'Stock adjustment approved and ledger updated');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ── Dashboard Metrics ───────────────────────────────────────
export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const pharmacyId = req.query.pharmacyId; // Optional filter

    const matchFilter: any = { tenantId };
    if (pharmacyId) matchFilter.pharmacyId = new mongoose.Types.ObjectId(pharmacyId as string);

    // Identify low stock (example threshold: quantity < 50)
    const lowStock = await InventoryBatch.countDocuments({ ...matchFilter, quantity: { $lt: 50, $gt: 0 } });
    
    // Out of stock
    const outOfStock = await InventoryBatch.countDocuments({ ...matchFilter, quantity: 0 });

    // Near expiry (e.g., within next 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const nearExpiry = await InventoryBatch.countDocuments({ 
      ...matchFilter, 
      quantity: { $gt: 0 },
      expiryDate: { $lte: ninetyDaysFromNow, $gt: new Date() } 
    });

    sendSuccess(res, { lowStock, outOfStock, nearExpiry });
  } catch (error) {
    next(error);
  }
};
