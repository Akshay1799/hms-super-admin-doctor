import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../plugins/audit.plugin';

// ── Prescription ─────────────────────────────────────────────
export interface IPharmacyPrescriptionItem {
  medicineId: mongoose.Types.ObjectId;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  dosage: string;
  duration: string;
  frequency: string;
}

export interface IPharmacyPrescription extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  items: IPharmacyPrescriptionItem[];
  status: 'created' | 'approved' | 'dispensed' | 'partially_dispensed' | 'completed' | 'cancelled' | 'expired';
  refillCount: number;
  remainingRefills: number;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacyPrescriptionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        prescribedQuantity: { type: Number, required: true, min: 1 },
        dispensedQuantity: { type: Number, default: 0 },
        remainingQuantity: { type: Number, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        frequency: { type: String, required: true },
      }
    ],
    status: { 
      type: String, 
      enum: ['created', 'approved', 'dispensed', 'partially_dispensed', 'completed', 'cancelled', 'expired'], 
      default: 'created' 
    },
    refillCount: { type: Number, default: 0 },
    remainingRefills: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

PharmacyPrescriptionSchema.index({ patientId: 1, status: 1 });
PharmacyPrescriptionSchema.index({ doctorId: 1 });
PharmacyPrescriptionSchema.plugin(auditPlugin, { module: 'pharmacy_pos' });

// ── Pharmacy Sale (POS Invoice) ──────────────────────────────
export interface IPharmacySaleItem {
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number;
  gstPercent: number;
  discountPercent: number;
  totalValue: number;
}

export interface IPharmacySale extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  prescriptionId?: mongoose.Types.ObjectId;
  saleNumber: string;
  saleType: 'prescription' | 'otc';
  items: IPharmacySaleItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  dispensingStatus: 'pending' | 'dispensed';
  idempotencyKey: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacySaleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' }, // Optional for OTC
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'PharmacyPrescription' },
    saleNumber: { type: String, required: true },
    saleType: { type: String, enum: ['prescription', 'otc'], required: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
        quantity: { type: Number, required: true, min: 1 },
        sellingPrice: { type: Number, required: true },
        purchasePrice: { type: Number, required: true },
        gstPercent: { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        totalValue: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    dispensingStatus: { type: String, enum: ['pending', 'dispensed'], default: 'pending' },
    idempotencyKey: { type: String, required: true }, // Duplicate billing protection
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PharmacySaleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
PharmacySaleSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true }); // Prevent duplicate requests
PharmacySaleSchema.index({ patientId: 1, createdAt: -1 });
PharmacySaleSchema.index({ prescriptionId: 1 }, { sparse: true });
PharmacySaleSchema.plugin(auditPlugin, { module: 'pharmacy_pos' });

// ── Patient Return ───────────────────────────────────────────
export interface IPatientReturnItem {
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  returnQuantity: number;
  reason: string;
  condition: 'sealed' | 'opened' | 'damaged';
}

export interface IPatientReturn extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  returnNumber: string;
  items: IPatientReturnItem[];
  status: 'requested' | 'approved' | 'inspected' | 'refunded' | 'rejected';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientReturnSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    saleId: { type: Schema.Types.ObjectId, ref: 'PharmacySale', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    returnNumber: { type: String, required: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
        returnQuantity: { type: Number, required: true, min: 1 },
        reason: { type: String, required: true },
        condition: { type: String, enum: ['sealed', 'opened', 'damaged'], required: true },
      }
    ],
    status: { 
      type: String, 
      enum: ['requested', 'approved', 'inspected', 'refunded', 'rejected'], 
      default: 'requested' 
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PatientReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });
PatientReturnSchema.index({ patientId: 1, createdAt: -1 });
PatientReturnSchema.index({ saleId: 1 });
PatientReturnSchema.plugin(auditPlugin, { module: 'pharmacy_pos' });

// ── Damage / Disposal ────────────────────────────────────────
export interface IDamageDisposal extends Document {
  tenantId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  type: 'damage' | 'disposal';
  category: 'broken' | 'leakage' | 'expired' | 'pest' | 'temperature' | 'manufacturing_defect' | 'other';
  quantity: number;
  status: 'reported' | 'approved' | 'completed';
  reportedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  financialAdjustmentValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const DamageDisposalSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    type: { type: String, enum: ['damage', 'disposal'], required: true },
    category: { 
      type: String, 
      enum: ['broken', 'leakage', 'expired', 'pest', 'temperature', 'manufacturing_defect', 'other'], 
      required: true 
    },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['reported', 'approved', 'completed'], default: 'reported' },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    financialAdjustmentValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);
DamageDisposalSchema.plugin(auditPlugin, { module: 'pharmacy_pos' });


export const PharmacyPrescription = mongoose.model<IPharmacyPrescription>('PharmacyPrescription', PharmacyPrescriptionSchema);
export const PharmacySale = mongoose.model<IPharmacySale>('PharmacySale', PharmacySaleSchema);
export const PatientReturn = mongoose.model<IPatientReturn>('PatientReturn', PatientReturnSchema);
export const DamageDisposal = mongoose.model<IDamageDisposal>('DamageDisposal', DamageDisposalSchema);
