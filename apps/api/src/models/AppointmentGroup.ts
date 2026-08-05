import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointmentGroup extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  groupType: 'Sequential' | 'Parallel' | 'Package' | 'Referral';
  name: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  appointments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentGroupSchema = new Schema<IAppointmentGroup>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    groupType: {
      type: String,
      enum: ['Sequential', 'Parallel', 'Package', 'Referral'],
      required: true
    },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true
    },
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }]
  },
  { timestamps: true }
);

export const AppointmentGroup = mongoose.model<IAppointmentGroup>('AppointmentGroup', AppointmentGroupSchema);
