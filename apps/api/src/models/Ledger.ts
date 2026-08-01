import mongoose, { Schema, Document } from 'mongoose';

// ── Ledger Entry (Double-Entry Accounting) ─────────────────────
export interface ILedgerEntry extends Document {
  tenantId: mongoose.Types.ObjectId;
  transactionDate: Date;
  accountId: string; // e.g. 'ACCOUNTS_RECEIVABLE', 'CASH_IN_HAND', 'REVENUE_CONSULTATION'
  accountName: string;
  debit: number;
  credit: number;
  transactionType: 'INVOICE' | 'PAYMENT' | 'REFUND' | 'DISCOUNT' | 'WRITE_OFF';
  referenceId: mongoose.Types.ObjectId; // Invoice ID or Payment ID
  referenceModel: 'Invoice' | 'Payment';
  description: string;
  financialYear: string;
  isClosed: boolean; // True if this ledger entry has been locked in Daily/FY closing
  createdBy?: mongoose.Types.ObjectId;
}

const LedgerEntrySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    transactionDate: { type: Date, default: Date.now, index: true },
    accountId: { type: String, required: true, index: true },
    accountName: { type: String, required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    transactionType: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'REFUND', 'DISCOUNT', 'WRITE_OFF'],
      required: true
    },
    referenceId: { type: Schema.Types.ObjectId, required: true, index: true },
    referenceModel: { type: String, enum: ['Invoice', 'Payment'], required: true },
    description: { type: String, required: true },
    financialYear: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Cash Drawer / Shift Management ──────────────────────────────
export interface ICashDrawerShift extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  openedAt: Date;
  closedAt?: Date;
  status: 'OPEN' | 'CLOSED';
  openingBalance: number;
  closingBalance?: number;
  systemExpectedBalance?: number;
  cashDifference?: number;
  notes?: string;
}

const CashDrawerShiftSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    openingBalance: { type: Number, required: true, min: 0 },
    closingBalance: { type: Number, min: 0 },
    systemExpectedBalance: { type: Number, min: 0 },
    cashDifference: { type: Number },
    notes: String,
  },
  { timestamps: true }
);

export const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
export const CashDrawerShift = mongoose.models.CashDrawerShift || mongoose.model<ICashDrawerShift>('CashDrawerShift', CashDrawerShiftSchema);
