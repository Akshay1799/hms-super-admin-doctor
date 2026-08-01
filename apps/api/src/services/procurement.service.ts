import mongoose from 'mongoose';
import { PurchaseOrder, GoodsReceiptNote, IGRNItem, SupplierReturn, Supplier } from '../models/Procurement';
import { InventoryBatch, InventoryTransaction } from '../models/Pharmacy';
import { InventoryService } from './inventory.service';
import { eventBus } from '../utils/DomainEventBus';

export class ProcurementService {
  /**
   * Processes a verified GRN.
   * 1. Updates PO received quantities.
   * 2. Creates/Finds InventoryBatch records for the accepted stock.
   * 3. Commits an atomic inventory transaction (ledger + stock increase).
   */
  static async processVerifiedGRN(
    session: mongoose.ClientSession,
    grnId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const grn = await GoodsReceiptNote.findById(grnId).session(session);
    if (!grn) throw new Error('GRN not found');
    if (grn.status !== 'verified') throw new Error('GRN is not in a verified state');

    const po = await PurchaseOrder.findById(grn.poId).session(session);
    if (!po) throw new Error('Associated PO not found');

    let allItemsFullyReceived = true;

    // Process each item in the GRN
    for (const item of grn.receivedItems) {
      if (item.acceptedQuantity <= 0) continue;

      // 1. Update PO quantities
      const poItem = po.items.find((i) => i.medicineId.toString() === item.medicineId.toString());
      if (poItem) {
        poItem.quantityReceived += item.acceptedQuantity;
        if (poItem.quantityReceived < poItem.quantityOrdered) {
          allItemsFullyReceived = false;
        }
      } else {
        throw new Error(`Medicine ${item.medicineId} in GRN was not found in PO ${po.poNumber}`);
      }

      // 2. Find or create an InventoryBatch
      let batch = await InventoryBatch.findOne({
        tenantId: grn.tenantId,
        pharmacyId: grn.pharmacyId,
        medicineId: item.medicineId,
        batchNumber: item.batchNumber
      }).session(session);

      if (!batch) {
        batch = new InventoryBatch({
          tenantId: grn.tenantId,
          pharmacyId: grn.pharmacyId,
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          manufacturingDate: item.manufacturingDate,
          quantity: 0, // Will be incremented by the atomic transaction
          reservedQuantity: 0
        });
        await batch.save({ session });
      }

      // 3. Commit atomic transaction to increase stock
      await InventoryService.commitTransaction(
        session,
        grn.tenantId,
        grn.pharmacyId,
        item.medicineId,
        batch._id as mongoose.Types.ObjectId,
        'purchase',
        item.acceptedQuantity,
        userId,
        grn._id.toString(),
        `GRN Received against PO ${po.poNumber}`
      );
    }

    // 4. Update PO Status
    po.status = allItemsFullyReceived ? 'completed' : 'partially_received';
    await po.save({ session });

    // Emit Domain Event
    eventBus.emitEvent('GoodsReceived', {
      grnId: grn._id.toString(),
      tenantId: grn.tenantId.toString(),
      poId: po._id.toString()
    });

    // Background task: update supplier KPI
    ProcurementService.updateSupplierKPI(grn.tenantId, grn.supplierId, grn._id as mongoose.Types.ObjectId).catch(err => {
      console.error('Failed to update supplier KPI:', err);
    });
  }

  static async updateSupplierKPI(tenantId: mongoose.Types.ObjectId, supplierId: mongoose.Types.ObjectId, grnId: mongoose.Types.ObjectId) {
    const grn = await GoodsReceiptNote.findById(grnId).populate<{ poId: import('../models/Procurement').IPurchaseOrder }>('poId');
    if (!grn || !grn.poId) return;

    const po = grn.poId;
    const expectedDelivery = new Date(po.items[0]?.expectedDeliveryDate || Date.now()).getTime();
    const actualDelivery = new Date(grn.createdAt).getTime();

    // Calculate delay in days
    const delayDays = Math.max(0, (actualDelivery - expectedDelivery) / (1000 * 60 * 60 * 24));
    
    // Simple KPI logic: drop score by 2 points per delayed day
    const penalty = delayDays * 2;
    if (penalty > 0) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { performanceScore: -penalty }
      });
    }
  }

  static async processSupplierReturn(
    tenantId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    returnPayload: any
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const supplierReturn = new SupplierReturn({
        ...returnPayload,
        tenantId,
        createdBy: userId,
        status: 'approved'
      });

      await supplierReturn.save({ session });

      // Deduct inventory
      for (const item of supplierReturn.items) {
        await InventoryBatch.findOneAndUpdate(
          { _id: item.batchId, quantity: { $gte: item.returnQuantity } },
          { $inc: { quantity: -item.returnQuantity } },
          { session, new: true }
        );

        const transaction = new InventoryTransaction({
          tenantId,
          pharmacyId: supplierReturn.pharmacyId,
          medicineId: item.medicineId,
          batchId: item.batchId,
          transactionType: 'supplier_return',
          previousQuantity: item.returnQuantity,
          quantityChanged: -item.returnQuantity,
          newQuantity: 0,
          referenceDocumentId: supplierReturn._id.toString(),
          userId
        });
        await transaction.save({ session });
      }

      await session.commitTransaction();
      return supplierReturn;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
