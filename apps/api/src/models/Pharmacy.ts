import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../plugins/audit.plugin';
import { softDeletePlugin } from '../plugins/softDelete.plugin';

// ── Pharmacy Location ────────────────────────────────────────
export interface IPharmacyLocation extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  type: 'main' | 'icu' | 'ot' | 'emergency' | 'ward' | 'satellite';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const PharmacyLocationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['main', 'icu', 'ot', 'emergency', 'ward', 'satellite'], required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

PharmacyLocationSchema.plugin(auditPlugin, { module: 'pharmacy' });
PharmacyLocationSchema.plugin(softDeletePlugin);

// ── Medicine Master ──────────────────────────────────────────
export interface IMedicine extends Document {
  tenantId: mongoose.Types.ObjectId;
  genericName: string;
  brandName: string;
  manufacturer: string;
  composition: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  category: string;
  scheduleDrugType?: string;
  hsnCode?: string;
  gstCategory: number;
  storageInstructions?: string;
  unitOfMeasure: string;
  barcode?: string;
  qrCode?: string;
  internalSku: string;
  drugLicenseNumber?: string;
  prescriptionRequired: boolean;
  controlledDrugFlag: boolean;
  highRiskMedicineFlag: boolean;
  lasaFlag: boolean;
  temperatureRequirement?: string;
  status: 'active' | 'inactive' | 'discontinued' | 'recall' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    genericName: { type: String, required: true },
    brandName: { type: String, required: true },
    manufacturer: { type: String, required: true },
    composition: { type: String, required: true },
    dosageForm: { type: String, required: true },
    strength: { type: String, required: true },
    routeOfAdministration: { type: String, required: true },
    category: { type: String, required: true },
    scheduleDrugType: String,
    hsnCode: String,
    gstCategory: { type: Number, required: true },
    storageInstructions: String,
    unitOfMeasure: { type: String, required: true },
    barcode: { type: String, sparse: true },
    qrCode: String,
    internalSku: { type: String, required: true },
    drugLicenseNumber: String,
    prescriptionRequired: { type: Boolean, default: false },
    controlledDrugFlag: { type: Boolean, default: false },
    highRiskMedicineFlag: { type: Boolean, default: false },
    lasaFlag: { type: Boolean, default: false },
    temperatureRequirement: String,
    status: { type: String, enum: ['active', 'inactive', 'discontinued', 'recall', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

MedicineSchema.index({ tenantId: 1, genericName: 1, manufacturer: 1, dosageForm: 1, strength: 1 }, { unique: true });
MedicineSchema.index({ barcode: 1 }, { unique: true, sparse: true });
MedicineSchema.index({ internalSku: 1 }, { unique: true });
MedicineSchema.plugin(auditPlugin, { module: 'pharmacy' });
MedicineSchema.plugin(softDeletePlugin);

// ── Inventory Batch ──────────────────────────────────────────
export interface IInventoryBatch extends Document {
  tenantId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchNumber: string;
  expiryDate: Date;
  manufacturingDate?: Date;
  rack?: string;
  shelf?: string;
  bin?: string;
  quantity: number;          // Available physical stock
  reservedQuantity: number;  // Stock reserved for pending prescriptions
  createdAt: Date;
  updatedAt: Date;
}

const InventoryBatchSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    manufacturingDate: Date,
    rack: String,
    shelf: String,
    bin: String,
    quantity: { type: Number, required: true, min: [0, 'Inventory quantity cannot be negative'] },
    reservedQuantity: { type: Number, default: 0, min: [0, 'Reserved quantity cannot be negative'] },
  },
  { timestamps: true }
);

// Protect against duplicate batches at the exact same location
InventoryBatchSchema.index({ pharmacyId: 1, medicineId: 1, batchNumber: 1 }, { unique: true });
InventoryBatchSchema.index({ medicineId: 1, pharmacyId: 1, expiryDate: 1 });
InventoryBatchSchema.plugin(auditPlugin, { module: 'pharmacy' });

// ── Inventory Transaction Ledger ─────────────────────────────
export interface IInventoryTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  transactionType: 'purchase' | 'dispense' | 'patient_return' | 'supplier_return' | 'damage' | 'expiry' | 'transfer' | 'manual_adjustment' | 'opening_stock' | 'stock_audit';
  previousQuantity: number;
  quantityChanged: number;
  newQuantity: number;
  referenceDocumentId?: string; // e.g., InvoiceId, POId, AdjustmentId
  userId: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    transactionType: { 
      type: String, 
      enum: ['purchase', 'dispense', 'patient_return', 'supplier_return', 'damage', 'expiry', 'transfer', 'manual_adjustment', 'opening_stock', 'stock_audit'], 
      required: true 
    },
    previousQuantity: { type: Number, required: true },
    quantityChanged: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceDocumentId: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
// Transactions are immutable, no updates allowed
InventoryTransactionSchema.index({ medicineId: 1, pharmacyId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ batchId: 1 });
InventoryTransactionSchema.plugin(auditPlugin, { module: 'pharmacy' });

// ── Stock Adjustment ─────────────────────────────────────────
export interface IStockAdjustment extends Document {
  tenantId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  reason: 'physical_count_difference' | 'damaged_goods' | 'expired' | 'data_correction' | 'initial_migration';
  requestedQuantityChange: number; // e.g., -5 or +10
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  auditSessionId?: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockAdjustmentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    reason: { 
      type: String, 
      enum: ['physical_count_difference', 'damaged_goods', 'expired', 'data_correction', 'initial_migration'], 
      required: true 
    },
    requestedQuantityChange: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    auditSessionId: String,
    remarks: { type: String, required: true },
  },
  { timestamps: true }
);
StockAdjustmentSchema.plugin(auditPlugin, { module: 'pharmacy' });

// Exports
export const PharmacyLocation = mongoose.model<IPharmacyLocation>('PharmacyLocation', PharmacyLocationSchema);
export const Medicine = mongoose.model<IMedicine>('Medicine', MedicineSchema);
export const InventoryBatch = mongoose.model<IInventoryBatch>('InventoryBatch', InventoryBatchSchema);
export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
export const StockAdjustment = mongoose.model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema);
