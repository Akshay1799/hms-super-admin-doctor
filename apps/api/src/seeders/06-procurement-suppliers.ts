import mongoose from 'mongoose';
import { PurchaseRequisition, PurchaseOrder, GoodsReceiptNote } from '../models/Procurement';
import { Medicine } from '../models/Pharmacy';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import { getRandomElement, getRandomNumber, getRandomDateInPast } from './helpers';

export async function seedProcurementChain() {
  console.log('Seeding Procurement Requisitions, Purchase Orders, and GRNs...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const supplierIds = idMap.suppliers.get(config.code)!;
    const pharmacyLocId = idMap.pharmacyLocations.get(config.code)![0];
    const adminUserId = idMap.users.get(`${config.code}:HOSPITAL_ADMIN:admin@${config.emailDomain}`)!;

    const medicines = await Medicine.find({ tenantId }).limit(10);
    if (medicines.length === 0) continue;

    for (let p = 1; p <= 12; p++) {
      const supplierId = getRandomElement(supplierIds);
      const reqNo = `PR-${config.code}-${String(p).padStart(4, '0')}`;
      const poNo = `PO-${config.code}-${String(p).padStart(4, '0')}`;
      const grnNo = `GRN-${config.code}-${String(p).padStart(4, '0')}`;

      // 1. Purchase Requisition
      let req = await PurchaseRequisition.findOne({ tenantId, requisitionNumber: reqNo });
      if (!req) {
        req = await PurchaseRequisition.create({
          tenantId,
          hospitalId,
          requisitionNumber: reqNo,
          items: [
            {
              medicineId: medicines[p % medicines.length]._id,
              requestedQuantity: 200,
              urgency: p % 4 === 0 ? 'high' : 'normal',
              remarks: 'Monthly pharmacy stock replenishment',
            },
          ],
          status: 'fulfilled',
          requestedBy: adminUserId,
          approvedBy: adminUserId,
        });
      }

      // 2. Purchase Order
      let po = await PurchaseOrder.findOne({ tenantId, poNumber: poNo });
      if (!po) {
        po = await PurchaseOrder.create({
          tenantId,
          hospitalId,
          poNumber: poNo,
          supplierId,
          requisitionId: req._id,
          status: p <= 10 ? 'completed' : 'approved',
          items: [
            {
              medicineId: medicines[p % medicines.length]._id,
              quantityOrdered: 200,
              quantityReceived: p <= 10 ? 200 : 0,
              purchasePrice: 45,
              gstPercent: 12,
              discountPercent: 5,
              expectedDeliveryDate: getRandomDateInPast(5),
            },
          ],
          totalValue: 200 * 45 * 1.12 * 0.95,
          createdBy: adminUserId,
          approvedBy: adminUserId,
        });
      }

      // 3. Goods Receipt Note (GRN) for completed POs
      if (p <= 10) {
        let grn = await GoodsReceiptNote.findOne({ tenantId, grnNumber: grnNo });
        if (!grn) {
          await GoodsReceiptNote.create({
            tenantId,
            hospitalId,
            poId: po._id,
            supplierId,
            pharmacyId: pharmacyLocId,
            grnNumber: grnNo,
            receivedItems: [
              {
                medicineId: medicines[p % medicines.length]._id,
                batchNumber: `GRN-BAT-${p}`,
                manufacturingDate: new Date(2026, 0, 1),
                expiryDate: new Date(2028, 0, 1),
                receivedQuantity: 200,
                acceptedQuantity: 200,
                rejectedQuantity: 0,
                purchasePrice: 45,
                mrp: 65,
              },
            ],
            receivedBy: adminUserId,
            verifiedBy: adminUserId,
            status: 'verified',
          });
        }
      }
    }
    console.log(`Synced 12 Procurement workflows for ${config.name}`);
  }
}
