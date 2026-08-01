import mongoose from 'mongoose';
import { PharmacyPrescription, PharmacySale, PatientReturn } from '../models/PharmacyPOS';
import { InventoryBatch, Medicine } from '../models/Pharmacy';
import { InventoryService } from './inventory.service';
import { eventBus } from '../utils/DomainEventBus';
import { ControlledDrugsService } from './controlledDrugs.service';

export class PharmacyPOSService {
  /**
   * Creates a Sale (Invoice) and safely *reserves* stock. 
   * It does NOT deduct physical inventory yet.
   */
  static async createSale(
    session: mongoose.ClientSession,
    saleData: any,
    userId: mongoose.Types.ObjectId
  ) {
    // 1. Idempotency Check
    const existingSale = await PharmacySale.findOne({
      tenantId: saleData.tenantId,
      idempotencyKey: saleData.idempotencyKey
    }).session(session);

    if (existingSale) {
      return existingSale;
    }

    // 2. Validate Prescription (if applicable)
    if (saleData.saleType === 'prescription') {
      const rx = await PharmacyPrescription.findOne({
        _id: saleData.prescriptionId,
        tenantId: saleData.tenantId,
        status: { $in: ['approved', 'partially_dispensed'] }
      }).session(session);

      if (!rx) throw new Error('Valid, approved prescription not found');
      
      // Update dispensed quantities
      let fullyDispensed = true;
      for (const item of saleData.items) {
        const rxItem = rx.items.find((i) => i.medicineId.toString() === item.medicineId.toString());
        if (!rxItem) throw new Error(`Medicine ${item.medicineId} not in prescription`);
        
        if (rxItem.remainingQuantity < item.quantity) {
          throw new Error(`Cannot dispense more than remaining prescribed quantity for medicine ${item.medicineId}`);
        }
        
        rxItem.dispensedQuantity += item.quantity;
        rxItem.remainingQuantity -= item.quantity;

        if (rxItem.remainingQuantity > 0) {
          fullyDispensed = false;
        }
      }

      rx.status = fullyDispensed ? 'completed' : 'partially_dispensed';
      await rx.save({ session });
    }

    // 3. Reserve Stock (FEFO is handled before calling this, batchId is pre-selected)
    for (const item of saleData.items) {
      const batch = await InventoryBatch.findOne({
        _id: item.batchId,
        tenantId: saleData.tenantId,
        quantity: { $gte: item.quantity } // Ensure physical stock is available
      }).session(session);

      if (!batch) {
        throw new Error(`Insufficient stock for batch ${item.batchId}`);
      }

      // We don't deduct quantity here. We only increase reservedQuantity.
      batch.reservedQuantity += item.quantity;
      if (batch.reservedQuantity > batch.quantity) {
        throw new Error(`Cannot reserve more than physical stock for batch ${item.batchId}`);
      }
      
      await batch.save({ session });
    }

    // 4. Create Sale Record
    const sale = new PharmacySale({
      ...saleData,
      createdBy: userId,
      paymentStatus: 'pending',
      dispensingStatus: 'pending'
    });

    await sale.save({ session });
    
    // Domain Event for Notification / Analytics sync
    eventBus.emit('PharmacyInvoiceGenerated', { saleId: sale._id, tenantId: sale.tenantId, totalAmount: sale.totalAmount });

    return sale;
  }

  /**
   * Confirms dispensing after payment.
   * This permanently deducts the reserved stock and writes to the immutable ledger.
   */
  static async confirmDispense(
    session: mongoose.ClientSession,
    saleId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    witnessId?: mongoose.Types.ObjectId
  ) {
    const sale = await PharmacySale.findById(saleId).session(session);
    if (!sale) throw new Error('Sale not found');
    if (sale.paymentStatus !== 'paid') throw new Error('Cannot dispense unpaid items');
    if (sale.dispensingStatus === 'dispensed') throw new Error('Already dispensed');

    for (const item of sale.items) {
      // 1. Release the reservation
      const batch = await InventoryBatch.findById(item.batchId).session(session);
      if (!batch) throw new Error('Batch not found');
      
      batch.reservedQuantity -= item.quantity;
      await batch.save({ session });

      // 2. Commit the atomic deduction from physical stock (which creates the ledger entry)
      await InventoryService.commitTransaction(
        session,
        sale.tenantId,
        sale.pharmacyId,
        item.medicineId,
        item.batchId,
        'dispense',
        -item.quantity, // Negative for deduction
        userId,
        sale._id.toString(),
        `Dispensed for Sale ${sale.saleNumber}`
      );
      // 3. Controlled Drug Dual Verification
      const medicine = await Medicine.findById(item.medicineId).session(session);
      if (medicine && medicine.controlledDrugFlag) {
        if (!witnessId) throw new Error(`Dual verification required: Medicine ${medicine.genericName} is a controlled drug. Please provide a witness PIN/ID.`);
        await ControlledDrugsService.logTransaction(session, {
          tenantId: sale.tenantId,
          hospitalId: sale.hospitalId,
          pharmacyId: sale.pharmacyId,
          medicineId: item.medicineId,
          batchId: item.batchId,
          transactionId: sale._id.toString(),
          transactionType: 'dispense',
          quantityChanged: -item.quantity,
          performedBy: userId,
          witnessedBy: witnessId,
          patientId: sale.patientId
        });
      }
    }

    sale.dispensingStatus = 'dispensed';
    await sale.save({ session });

    // Domain Event for cross-module sync
    eventBus.emit('PharmacyMedicineDispensed', { saleId: sale._id, tenantId: sale.tenantId });
  }

  /**
   * Cancels a sale. 
   * If unpaid, it simply voids it and releases reserved stock.
   * If paid, it throws an error (requiring a return instead) to maintain financial integrity.
   */
  static async cancelSale(
    session: mongoose.ClientSession,
    saleId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const sale = await PharmacySale.findById(saleId).session(session);
    if (!sale) throw new Error('Sale not found');
    if (sale.paymentStatus === 'paid') throw new Error('Paid invoices cannot be cancelled directly. Please initiate a return.');
    if (sale.dispensingStatus === 'dispensed') throw new Error('Dispensed items cannot be cancelled. Initiate a return.');

    // Release reservations
    for (const item of sale.items) {
      const batch = await InventoryBatch.findById(item.batchId).session(session);
      if (batch) {
        batch.reservedQuantity -= item.quantity;
        if (batch.reservedQuantity < 0) batch.reservedQuantity = 0;
        await batch.save({ session });
      }
    }

    // Since it's unpaid, we don't need a ledger transaction, just void it.
    sale.paymentStatus = 'refunded'; // Mark as dead
    // (Ideally a 'cancelled' enum would be added to paymentStatus, but we will reuse refunded to denote void)
    await sale.save({ session });

    eventBus.emit('PharmacySaleCancelled', { saleId: sale._id, tenantId: sale.tenantId });
  }

  /**
   * Processes an approved patient return, restoring stock.
   */
  static async processPatientReturn(
    session: mongoose.ClientSession,
    returnId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    witnessId?: mongoose.Types.ObjectId
  ) {
    const returnRecord = await PatientReturn.findById(returnId).session(session);
    if (!returnRecord) throw new Error('Return record not found');
    if (returnRecord.status !== 'inspected') throw new Error('Return must be inspected before processing');

    // Return Fraud Detection (Point 65)
    // Find how many returns this patient has made in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReturns = await PatientReturn.countDocuments({
      tenantId: returnRecord.tenantId,
      patientId: returnRecord.patientId,
      createdAt: { $gte: thirtyDaysAgo }
    }).session(session);

    if (recentReturns > 3) {
      // Flag as high risk in audit log / notification (we won't block it outright to prevent clinical issues, but we alert)
      eventBus.emit('HighRiskReturnDetected', { 
        returnId: returnRecord._id, 
        patientId: returnRecord.patientId, 
        count: recentReturns 
      });
    }

    // Restore stock and write ledger
    for (const item of returnRecord.items) {
      // Only restore sealed goods to physical inventory
      if (item.condition === 'sealed') {
        await InventoryService.commitTransaction(
          session,
          returnRecord.tenantId,
          returnRecord.pharmacyId,
          item.medicineId,
          item.batchId,
          'patient_return',
          item.returnQuantity, // Positive to increase stock back
          userId,
          returnRecord._id.toString(),
          `Patient return for ${returnRecord.returnNumber}`
        );

        // 3. Controlled Drug Dual Verification
        const medicine = await Medicine.findById(item.medicineId).session(session);
        if (medicine && medicine.controlledDrugFlag) {
          if (!witnessId) throw new Error(`Dual verification required: Returning controlled drug ${medicine.genericName} requires a witness.`);
          await ControlledDrugsService.logTransaction(session, {
            tenantId: returnRecord.tenantId,
            hospitalId: returnRecord.hospitalId,
            pharmacyId: returnRecord.pharmacyId,
            medicineId: item.medicineId,
            batchId: item.batchId,
            transactionId: returnRecord._id.toString(),
            transactionType: 'return',
            quantityChanged: item.returnQuantity,
            performedBy: userId,
            witnessedBy: witnessId,
            patientId: returnRecord.patientId
          });
        }
      }
    }

    returnRecord.status = 'refunded';
    await returnRecord.save({ session });

    eventBus.emit('PatientReturnApproved', { 
      returnId: returnRecord._id, 
      tenantId: returnRecord.tenantId,
      patientId: returnRecord.patientId
    });
  }
}
