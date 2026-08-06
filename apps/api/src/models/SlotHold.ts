import mongoose, { Document, Schema } from 'mongoose';

export interface ISlotHold extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  type: 'CHECKOUT' | 'WAITLIST';
  expireAt: Date;
  createdAt: Date;
}

const SlotHoldSchema = new Schema<ISlotHold>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['CHECKOUT', 'WAITLIST'], default: 'CHECKOUT' },
  },
  { timestamps: true }
);

// TTL Index: Automatically delete documents 900 seconds (15 minutes) after creation.
// For waitlist (30 mins), we can override the expiration manually, or we can just use 30 minutes 
// for all holds, or create an expireAt field. Let's use expireAt for explicit control.
SlotHoldSchema.add({ expireAt: { type: Date, required: true } } as any);
SlotHoldSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Compound index to quickly find if a slot is held
SlotHoldSchema.index({ doctorId: 1, date: 1, time: 1 });

export const SlotHold = mongoose.model<ISlotHold>('SlotHold', SlotHoldSchema);
