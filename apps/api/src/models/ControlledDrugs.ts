import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../plugins/audit.plugin';

// ── Controlled Drug Register ────────────────────────────────
export interface IControlledDrugRegister extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  transactionId: string; // Links to POS sale, GRN, or Return
  transactionType: 'receive' | 'dispense' | 'dispose' | 'return' | 'audit_adjustment';
  quantityChanged: number;
  balanceQuantity: number;
  performedBy: mongoose.Types.ObjectId;
  witnessedBy: mongoose.Types.ObjectId; // Dual verification mandatory
  patientId?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ControlledDrugRegisterSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    transactionId: { type: String, required: true },
    transactionType: { 
      type: String, 
      enum: ['receive', 'dispense', 'dispose', 'return', 'audit_adjustment'], 
      required: true 
    },
    quantityChanged: { type: Number, required: true },
    balanceQuantity: { type: Number, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    witnessedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Crucial for Chain of Custody
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
  },
  { timestamps: true }
);

ControlledDrugRegisterSchema.plugin(auditPlugin, { module: 'controlled_drugs' });

// ── Controlled Drug Audit ───────────────────────────────────
export interface IControlledDrugAudit extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  reason?: string;
  auditedBy: mongoose.Types.ObjectId;
  witnessedBy: mongoose.Types.ObjectId;
  status: 'resolved' | 'investigating';
  createdAt: Date;
  updatedAt: Date;
}

const ControlledDrugAuditSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    expectedQuantity: { type: Number, required: true },
    actualQuantity: { type: Number, required: true, min: 0 },
    variance: { type: Number, required: true },
    reason: String,
    auditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    witnessedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['resolved', 'investigating'], default: 'investigating' },
  },
  { timestamps: true }
);

ControlledDrugAuditSchema.plugin(auditPlugin, { module: 'controlled_drugs' });

export const ControlledDrugRegister = mongoose.model<IControlledDrugRegister>('ControlledDrugRegister', ControlledDrugRegisterSchema);
export const ControlledDrugAudit = mongoose.model<IControlledDrugAudit>('ControlledDrugAudit', ControlledDrugAuditSchema);
