import mongoose from 'mongoose';
import { InventoryBatch, InventoryTransaction } from '../models/Pharmacy';

export class InventoryService {
  /**
   * Commits an atomic inventory transaction and updates the batch quantity.
   * Throws if the quantity drops below zero due to concurrent modifications.
   */
  static async commitTransaction(
    session: mongoose.ClientSession,
    tenantId: mongoose.Types.ObjectId,
    pharmacyId: mongoose.Types.ObjectId,
    medicineId: mongoose.Types.ObjectId,
    batchId: mongoose.Types.ObjectId,
    transactionType: 'purchase' | 'dispense' | 'patient_return' | 'supplier_return' | 'damage' | 'expiry' | 'transfer' | 'manual_adjustment' | 'opening_stock' | 'stock_audit',
    quantityChange: number,
    userId: mongoose.Types.ObjectId,
    referenceDocumentId?: string,
    remarks?: string
  ): Promise<void> {
    // We use findOneAndUpdate with $inc to ensure atomic increment/decrement without race conditions
    // The query includes a condition to ensure quantity doesn't drop below zero for deductions
    const query: any = { _id: batchId, tenantId, pharmacyId };
    if (quantityChange < 0) {
      query.quantity = { $gte: Math.abs(quantityChange) };
    }

    const updatedBatch = await InventoryBatch.findOneAndUpdate(
      query,
      { $inc: { quantity: quantityChange } },
      { new: true, session }
    );

    if (!updatedBatch) {
      throw new Error(`Insufficient stock or batch not found for batchId ${batchId}`);
    }

    // Now record the immutable ledger transaction
    const previousQuantity = updatedBatch.quantity - quantityChange;
    
    await InventoryTransaction.create(
      [{
        tenantId,
        pharmacyId,
        medicineId,
        batchId,
        transactionType,
        previousQuantity,
        quantityChanged: quantityChange,
        newQuantity: updatedBatch.quantity,
        referenceDocumentId,
        userId,
        remarks
      }],
      { session }
    );
  }

  /**
   * Automates FEFO (First-Expiry-First-Out) batch allocation.
   * Finds the batches that expire soonest that have sufficient stock.
   */
  static async allocateFEFOStock(
    tenantId: mongoose.Types.ObjectId,
    pharmacyId: mongoose.Types.ObjectId,
    medicineId: mongoose.Types.ObjectId,
    requestedQuantity: number
  ) {
    const batches = await InventoryBatch.find({
      tenantId,
      pharmacyId,
      medicineId,
      quantity: { $gt: 0 },
      expiryDate: { $gt: new Date() } // exclude already expired
    })
    .sort({ expiryDate: 1 }) // FEFO sort
    .exec();

    let remainingQty = requestedQuantity;
    const allocation = [];

    for (const batch of batches) {
      if (remainingQty <= 0) break;
      
      const availableInBatch = batch.quantity - batch.reservedQuantity;
      if (availableInBatch <= 0) continue;

      const takeQty = Math.min(availableInBatch, remainingQty);
      allocation.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        takeQty
      });
      remainingQty -= takeQty;
    }

    if (remainingQty > 0) {
      throw new Error('Insufficient FEFO stock available to fulfill the requested quantity.');
    }

    return allocation;
  }
}
