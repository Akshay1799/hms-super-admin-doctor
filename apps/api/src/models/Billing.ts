import mongoose, { Document, Schema } from 'mongoose';
import { auditPlugin } from '../plugins/audit.plugin';
import { softDeletePlugin } from '../plugins/softDelete.plugin';

// ── Invoice ──────────────────────────────────────────────────
export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  invoiceNumber?: string;   // auto-generated e.g. INV-2026-0001
  invoiceType: 'OPD' | 'IPD' | 'Lab' | 'Pharmacy' | 'Package' | 'General';
  billingMode: 'Self-Pay' | 'Insurance' | 'Corporate';
  insuranceDetails?: {
    provider: string;
    claimId: string;
    approvedAmount: number;
    patientResponsibility: number;
  };
  tenantName: string;
  patientName?: string;
  amount: number;
  taxAmount?: number;
  taxBreakup?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  discountAmount?: number;
  discountReason?: string;
  totalAmount: number;
  patientResponsibilityAmount?: number;
  insuranceLiabilityAmount?: number;
  currency: string;
  exchangeRate?: number;
  baseCurrencyAmount?: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'draft' | 'partially_paid';
  locked: boolean;
  issuedDate: Date;
  dueDate: Date;
  versions?: any[]; // Snapshot version history
  paidDate?: Date;
  paidAmount?: number;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }>;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    patientName: String,
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceType: {
      type: String,
      enum: ['OPD', 'IPD', 'Lab', 'Pharmacy', 'Package', 'General'],
      default: 'General',
    },
    billingMode: {
      type: String,
      enum: ['Self-Pay', 'Insurance', 'Corporate'],
      default: 'Self-Pay',
    },
    insuranceDetails: {
      provider: String,
      claimId: String,
      approvedAmount: Number,
      patientResponsibility: Number,
    },
    tenantName: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    taxBreakup: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    discountAmount: { type: Number, default: 0 },
    discountReason: String,
    totalAmount: { type: Number, required: true },
    patientResponsibilityAmount: { type: Number },
    insuranceLiabilityAmount: { type: Number },
    currency: { type: String, default: 'INR' },
    exchangeRate: { type: Number, default: 1 },
    baseCurrencyAmount: { type: Number },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'overdue', 'cancelled', 'draft', 'partially_paid'],
      default: 'draft',
    },
    locked: { type: Boolean, default: false },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    versions: [{ type: Schema.Types.Mixed }], // Stores snapshots when invoice is modified
    paidDate: Date,
    paidAmount: Number,
    items: [
      {
        itemId: { type: String, required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

InvoiceSchema.plugin(auditPlugin, { module: 'billing' });
InvoiceSchema.plugin(softDeletePlugin);

// Auto-generate invoice number using Counter
InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    try {
      const Counter = mongoose.model('Counter');
      
      const today = new Date();
      const currentYear = today.getFullYear();
      const nextYear = currentYear + 1;
      // Simple FY logic (April to March). If month < 3, it's prev year to current year.
      const isNewFY = today.getMonth() >= 3;
      const startYear = isNewFY ? currentYear : currentYear - 1;
      const endYear = startYear + 1;
      const financialYear = `${String(startYear).slice(2)}${String(endYear).slice(2)}`; // e.g. '2627'

      const counter = await Counter.findOneAndUpdate(
        { tenantId: this.tenantId, entityName: 'Invoice', financialYear },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.invoiceNumber = `INV-${financialYear}-${String(counter.seq).padStart(5, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

// ── Credit Note ──────────────────────────────────────────────
export interface ICreditNote extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  noteNumber: string;
  amount: number;
  reason: string;
  status: 'draft' | 'issued' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CreditNoteSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  noteNumber: { type: String, unique: true, required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['draft', 'issued', 'cancelled'], default: 'draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

CreditNoteSchema.plugin(auditPlugin, { module: 'billing' });
CreditNoteSchema.plugin(softDeletePlugin);

// ── Payment ──────────────────────────────────────────────────
export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'advance';
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'insurance' | 'upi' | 'wallet' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  referenceId?: string;
  idempotencyKey?: string;
  gateway?: string;
  paymentDate: Date;
  isReconciled: boolean;
  settlementId?: string;
  settlementDate?: Date;
  allocations?: { itemId: string; amount: number }[]; // Granular line-item allocation
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: {
      type: String,
      enum: ['payment', 'refund', 'advance'],
      default: 'payment',
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'insurance', 'upi', 'wallet', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'pending',
    },
    referenceId: String,
    idempotencyKey: { type: String, unique: true, sparse: true },
    gateway: String,
    paymentDate: { type: Date, default: Date.now },
    isReconciled: { type: Boolean, default: false },
    settlementId: String,
    settlementDate: Date,
    allocations: [{
      itemId: { type: Schema.Types.Mixed, required: true },
      amount: { type: Number, required: true }
    }]
  },
  { timestamps: true }
);

PaymentSchema.plugin(auditPlugin, { module: 'billing' });
PaymentSchema.plugin(softDeletePlugin);

// ── Debit Note ───────────────────────────────────────────────
export interface IDebitNote extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  noteNumber: string;
  amount: number;
  reason: string;
  status: 'draft' | 'issued' | 'applied';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DebitNoteSchema = new Schema<IDebitNote>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    noteNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'issued', 'applied'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DebitNoteSchema.plugin(auditPlugin, { module: 'billing' });
DebitNoteSchema.plugin(softDeletePlugin);

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export const CreditNote = mongoose.models.CreditNote || mongoose.model<ICreditNote>('CreditNote', CreditNoteSchema);
export const DebitNote = mongoose.models.DebitNote || mongoose.model<IDebitNote>('DebitNote', DebitNoteSchema);
