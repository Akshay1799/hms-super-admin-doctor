import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  tenantId: string;
  entityName: string; // e.g., 'Invoice', 'Patient', 'CreditNote'
  financialYear?: string; // e.g., '2627' for 2026-2027
  seq: number;
}

const CounterSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  entityName: { type: String, required: true },
  financialYear: { type: String, default: 'ALL' },
  seq: { type: Number, default: 0 },
});

// Unique index to prevent duplicate counters
CounterSchema.index({ tenantId: 1, entityName: 1, financialYear: 1 }, { unique: true });

export default mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
