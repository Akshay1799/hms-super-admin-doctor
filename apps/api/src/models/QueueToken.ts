import mongoose, { Document, Schema } from 'mongoose';

export interface IQueueToken extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  tokenNumber: string;
  queuePosition: number;
  category: 'Normal' | 'Emergency' | 'Senior Citizen' | 'Child' | 'VIP' | 'Staff' | 'Corporate' | 'Follow-up' | 'Disabled' | 'High Risk';
  status: 'Waiting' | 'Called' | 'In Consultation' | 'Completed' | 'Skipped' | 'Cancelled' | 'Transferred' | 'Archived';
  date: Date;
  estimatedWaitTimeMinutes: number;
  transferredTo?: mongoose.Types.ObjectId; // If transferred to another doctor
  createdAt: Date;
  updatedAt: Date;
}

const QueueTokenSchema = new Schema<IQueueToken>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    tokenNumber: { type: String, unique: true, index: true },
    queuePosition: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Normal', 'Emergency', 'Senior Citizen', 'Child', 'VIP', 'Staff', 'Corporate', 'Follow-up', 'Disabled', 'High Risk'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Waiting', 'Called', 'In Consultation', 'Completed', 'Skipped', 'Cancelled', 'Transferred', 'Archived'],
      default: 'Waiting',
    },
    date: { type: Date, required: true, index: true },
    estimatedWaitTimeMinutes: { type: Number, default: 15 },
    transferredTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

QueueTokenSchema.index({ doctorId: 1, date: 1, status: 1 });
QueueTokenSchema.index({ departmentId: 1, date: 1, status: 1 });

QueueTokenSchema.pre('save', async function (next) {
  if (!this.tokenNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('QueueToken').countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
    });
    this.tokenNumber = `OPD-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const QueueToken = mongoose.model<IQueueToken>('QueueToken', QueueTokenSchema);
