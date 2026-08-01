import mongoose from 'mongoose';
import { PurchaseOrder, GoodsReceiptNote, IGRNItem } from '../models/Procurement';
import { InventoryBatch } from '../models/Pharmacy';
import { InventoryService } from './inventory.service';

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
  }
}
