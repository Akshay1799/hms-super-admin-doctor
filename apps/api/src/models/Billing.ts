import mongoose, { Document, Schema } from 'mongoose';

// ── Invoice ──────────────────────────────────────────────────
export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  invoiceNumber: string;   // auto-generated e.g. INV-2026-0001
  tenantName: string;
  patientName?: string;
  amount: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'draft' | 'partially_paid';
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paidAmount?: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
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
    invoiceNumber: { type: String, unique: true },
    tenantName: { type: String, required: true },
    patientName: String,
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'overdue', 'cancelled', 'draft', 'partially_paid'],
      default: 'unpaid',
    },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidDate: Date,
    paidAmount: Number,
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate invoice number
InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// ── Payment ──────────────────────────────────────────────────
export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'insurance' | 'upi' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  referenceId?: string;
  gateway?: string;
  paymentDate: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'insurance', 'upi', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'pending',
    },
    referenceId: String,
    gateway: String,
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
