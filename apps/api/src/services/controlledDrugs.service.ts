import mongoose from 'mongoose';
import { ControlledDrugRegister, ControlledDrugAudit } from '../models/ControlledDrugs';
import { InventoryBatch } from '../models/Pharmacy';
import { eventBus } from '../utils/DomainEventBus';

export class ControlledDrugsService {
  /**
   * Logs a transaction to the strictly immutable Controlled Drug Register.
   * Enforces Chain of Custody (Dual Verification via witnessId).
   */
  static async logTransaction(
    session: mongoose.ClientSession,
    data: {
      tenantId: mongoose.Types.ObjectId;
      hospitalId: mongoose.Types.ObjectId;
      pharmacyId: mongoose.Types.ObjectId;
      medicineId: mongoose.Types.ObjectId;
      batchId: mongoose.Types.ObjectId;
      transactionId: string;
      transactionType: 'receive' | 'dispense' | 'dispose' | 'return' | 'audit_adjustment';
      quantityChanged: number;
      performedBy: mongoose.Types.ObjectId;
      witnessedBy: mongoose.Types.ObjectId;
      patientId?: mongoose.Types.ObjectId;
      doctorId?: mongoose.Types.ObjectId;
      remarks?: string;
    }
  ) {
    if (!data.witnessedBy) {
      throw new Error('Dual verification failed: A witness is strictly required for controlled drug transactions.');
    }
    if (data.performedBy.toString() === data.witnessedBy.toString()) {
      throw new Error('Dual verification failed: The performer and witness cannot be the same user.');
    }

    const batch = await InventoryBatch.findById(data.batchId).session(session);
    if (!batch) throw new Error('Batch not found');

    const registerEntry = new ControlledDrugRegister({
      ...data,
      balanceQuantity: batch.quantity // This assumes physical inventory was already updated via commitTransaction
    });

    await registerEntry.save({ session });
    
    // Domain event for compliance tracking
    eventBus.emit('ControlledDrugTransactionLogged', {
      registerId: registerEntry._id,
      medicineId: data.medicineId,
      transactionType: data.transactionType
    });

    return registerEntry;
  }

  /**
   * Performs a blind physical audit of a controlled drug batch.
   * If a variance is found, fires high-risk alerts.
   */
  static async performAudit(
    session: mongoose.ClientSession,
    data: {
      tenantId: mongoose.Types.ObjectId;
      hospitalId: mongoose.Types.ObjectId;
      pharmacyId: mongoose.Types.ObjectId;
      medicineId: mongoose.Types.ObjectId;
      batchId: mongoose.Types.ObjectId;
      actualQuantity: number;
      auditedBy: mongoose.Types.ObjectId;
      witnessedBy: mongoose.Types.ObjectId;
      reason?: string;
    }
  ) {
    if (!data.witnessedBy) {
      throw new Error('Dual verification failed: Audits of controlled drugs require a witness.');
    }

    const batch = await InventoryBatch.findById(data.batchId).session(session);
    if (!batch) throw new Error('Batch not found');

    const expectedQuantity = batch.quantity;
    const variance = data.actualQuantity - expectedQuantity;

    const auditStatus = variance === 0 ? 'resolved' : 'investigating';

    const auditEntry = new ControlledDrugAudit({
      ...data,
      expectedQuantity,
      variance,
      status: auditStatus
    });

    await auditEntry.save({ session });

    if (variance !== 0) {
      // High-risk alert! Discrepancy in Narcotics!
      eventBus.emit('ControlledDrugVarianceDetected', {
        auditId: auditEntry._id,
        tenantId: data.tenantId,
        medicineId: data.medicineId,
        variance,
        auditedBy: data.auditedBy
      });
    }

    return auditEntry;
  }
}
