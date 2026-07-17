import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  date: Date;
  time: string;   // HH:MM
  duration: number;  // minutes
  type: 'Consultation' | 'Follow-up' | 'Diagnostic' | 'Therapy' | 'Emergency';
  status: 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  symptoms?: string;
  notes?: string;
  cancelReason?: string;
  rescheduledFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorName: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 30 },
    type: {
      type: String,
      enum: ['Consultation', 'Follow-up', 'Diagnostic', 'Therapy', 'Emergency'],
      default: 'Consultation',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Waiting', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    symptoms: String,
    notes: String,
    cancelReason: String,
    rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, date: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
