import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../plugins/audit.plugin';
import { softDeletePlugin } from '../plugins/softDelete.plugin';

// ── Supplier Master ──────────────────────────────────────────
export interface ISupplier extends Document {
  tenantId: mongoose.Types.ObjectId;
  supplierCode: string;
  name: string;
  gstin?: string;
  drugLicenseNumber?: string;
  panNumber?: string;
  contactPerson: string;
  email: string;
  mobile: string;
  address: {
    office: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  paymentTerms: string;
  creditLimit: number;
  creditPeriodDays: number;
  status: 'active' | 'inactive' | 'blacklisted' | 'suspended';
  performanceScore: number;
  averageDeliveryTimeDays: number;
  returnRatePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    supplierCode: { type: String, required: true },
    name: { type: String, required: true },
    gstin: String,
    drugLicenseNumber: String,
    panNumber: String,
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: {
      office: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    paymentTerms: { type: String, required: true },
    creditLimit: { type: Number, default: 0 },
    creditPeriodDays: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'blacklisted', 'suspended'], default: 'active' },
    performanceScore: { type: Number, default: 100 },
    averageDeliveryTimeDays: { type: Number, default: 0 },
    returnRatePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SupplierSchema.index({ tenantId: 1, supplierCode: 1 }, { unique: true });
SupplierSchema.index({ gstin: 1 }, { sparse: true });
SupplierSchema.plugin(auditPlugin, { module: 'procurement' });
SupplierSchema.plugin(softDeletePlugin);

// ── Purchase Requisition ─────────────────────────────────────
export interface IRequisitionItem {
  medicineId: mongoose.Types.ObjectId;
  requestedQuantity: number;
  urgency: 'normal' | 'high' | 'critical';
  remarks?: string;
}

export interface IPurchaseRequisition extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  requisitionNumber: string;
  items: IRequisitionItem[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'fulfilled';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseRequisitionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    requisitionNumber: { type: String, required: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        requestedQuantity: { type: Number, required: true, min: 1 },
        urgency: { type: String, enum: ['normal', 'high', 'critical'], default: 'normal' },
        remarks: String,
      }
    ],
    status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'fulfilled'], default: 'draft' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PurchaseRequisitionSchema.index({ tenantId: 1, requisitionNumber: 1 }, { unique: true });
PurchaseRequisitionSchema.plugin(auditPlugin, { module: 'procurement' });

// ── Purchase Order ───────────────────────────────────────────
export interface IPOItem {
  medicineId: mongoose.Types.ObjectId;
  quantityOrdered: number;
  quantityReceived: number;
  purchasePrice: number; // Snapshot
  gstPercent: number;    // Snapshot
  discountPercent: number; // Snapshot
  expectedDeliveryDate: Date;
}

export interface IPurchaseOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  poNumber: string;
  supplierId: mongoose.Types.ObjectId;
  requisitionId?: mongoose.Types.ObjectId;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'partially_received' | 'completed' | 'cancelled' | 'closed';
  items: IPOItem[];
  totalValue: number;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    poNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    requisitionId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequisition' },
    status: { 
      type: String, 
      enum: ['draft', 'pending_approval', 'approved', 'sent', 'partially_received', 'completed', 'cancelled', 'closed'], 
      default: 'draft' 
    },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantityOrdered: { type: Number, required: true, min: 1 },
        quantityReceived: { type: Number, default: 0 },
        purchasePrice: { type: Number, required: true },
        gstPercent: { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        expectedDeliveryDate: { type: Date, required: true },
      }
    ],
    totalValue: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ supplierId: 1, status: 1, createdAt: -1 });
PurchaseOrderSchema.plugin(auditPlugin, { module: 'procurement' });

// ── Goods Receipt Note (GRN) ─────────────────────────────────
export interface IGRNItem {
  medicineId: mongoose.Types.ObjectId;
  batchNumber: string;
  manufacturingDate?: Date;
  expiryDate: Date;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  purchasePrice: number;
  mrp: number;
}

export interface IGoodsReceiptNote extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  poId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId; // Location where stock is received
  grnNumber: string;
  receivedItems: IGRNItem[];
  receivedBy: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  status: 'pending_verification' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const GoodsReceiptNoteSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    grnNumber: { type: String, required: true },
    receivedItems: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        batchNumber: { type: String, required: true },
        manufacturingDate: Date,
        expiryDate: { type: Date, required: true },
        receivedQuantity: { type: Number, required: true, min: 1 },
        acceptedQuantity: { type: Number, required: true, min: 0 },
        rejectedQuantity: { type: Number, default: 0 },
        rejectionReason: String,
        purchasePrice: { type: Number, required: true },
        mrp: { type: Number, required: true },
      }
    ],
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending_verification', 'verified', 'rejected'], default: 'pending_verification' },
  },
  { timestamps: true }
);

GoodsReceiptNoteSchema.index({ tenantId: 1, grnNumber: 1 }, { unique: true });
GoodsReceiptNoteSchema.plugin(auditPlugin, { module: 'procurement' });

// ── Supplier Return ──────────────────────────────────────────
export interface ISupplierReturnItem {
  medicineId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  returnQuantity: number;
  reason: 'expired' | 'damaged' | 'wrong_item' | 'excess_quantity' | 'recalled';
  value: number;
}

export interface ISupplierReturn extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  grnId?: mongoose.Types.ObjectId; // Optional if returning old stock without specific GRN reference
  returnNumber: string;
  items: ISupplierReturnItem[];
  status: 'draft' | 'pending_approval' | 'approved' | 'shipped' | 'completed';
  totalValue: number;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierReturnSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyLocation', required: true },
    grnId: { type: Schema.Types.ObjectId, ref: 'GoodsReceiptNote' },
    returnNumber: { type: String, required: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
        returnQuantity: { type: Number, required: true, min: 1 },
        reason: { type: String, enum: ['expired', 'damaged', 'wrong_item', 'excess_quantity', 'recalled'], required: true },
        value: { type: Number, required: true },
      }
    ],
    status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'shipped', 'completed'], default: 'draft' },
    totalValue: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SupplierReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });
SupplierReturnSchema.plugin(auditPlugin, { module: 'procurement' });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
export const PurchaseRequisition = mongoose.model<IPurchaseRequisition>('PurchaseRequisition', PurchaseRequisitionSchema);
export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
export const GoodsReceiptNote = mongoose.model<IGoodsReceiptNote>('GoodsReceiptNote', GoodsReceiptNoteSchema);
export const SupplierReturn = mongoose.model<ISupplierReturn>('SupplierReturn', SupplierReturnSchema);
