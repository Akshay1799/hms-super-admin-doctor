import mongoose, { Schema, Document } from 'mongoose';

// ── Patient Wallet ─────────────────────────────────────────────
export interface IPatientWallet extends Document {
  tenantId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  balance: number;
  bedDepositBalance: number;
  lastUpdated: Date;
}

const PatientWalletSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    bedDepositBalance: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Wallet Transaction Ledger ────────────────────────────────
export interface IWalletTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BED_DEPOSIT' | 'BED_REFUND' | 'ALLOCATION';
  referenceId?: mongoose.Types.ObjectId; // E.g., Invoice ID
  description: string;
  createdAt: Date;
}

const WalletTransactionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'PatientWallet', required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'BED_DEPOSIT', 'BED_REFUND', 'ALLOCATION'],
      required: true
    },
    referenceId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const PatientWallet = mongoose.models.PatientWallet || mongoose.model<IPatientWallet>('PatientWallet', PatientWalletSchema);
export const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
