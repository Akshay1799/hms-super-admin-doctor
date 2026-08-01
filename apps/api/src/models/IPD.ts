import mongoose, { Schema, Document } from 'mongoose';

export interface IIPDBill extends Document {
  tenantId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  admissionId: mongoose.Types.ObjectId;
  roomCharges: number;
  nursingCharges: number;
  consultationCharges: number;
  pharmacyCharges: number;
  totalAccrued: number;
  status: 'ACTIVE' | 'DISCHARGED' | 'BILLED';
  lastAccrualDate: Date;
}

const IPDBillSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    admissionId: { type: Schema.Types.ObjectId, required: true }, // Ref to Admission module
    roomCharges: { type: Number, default: 0 },
    nursingCharges: { type: Number, default: 0 },
    consultationCharges: { type: Number, default: 0 },
    pharmacyCharges: { type: Number, default: 0 },
    totalAccrued: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISCHARGED', 'BILLED'],
      default: 'ACTIVE'
    },
    lastAccrualDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Pre-save to calculate totalAccrued automatically
IPDBillSchema.pre('save', function (this: IIPDBill, next) {
  this.totalAccrued = this.roomCharges + this.nursingCharges + this.consultationCharges + this.pharmacyCharges;
  next();
});

export const IPDBill = mongoose.models.IPDBill || mongoose.model<IIPDBill>('IPDBill', IPDBillSchema);
