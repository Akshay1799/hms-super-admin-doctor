import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone?: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  tokenNumber?: number;
  queuePosition?: number;
  date: Date;
  time: string;   // HH:MM
  slotStartTime?: string;
  slotEndTime?: string;
  appointmentNumber: string;
  duration: number;  // minutes
  type: 'New Consultation' | 'Follow-up' | 'Emergency Consultation' | 'Online Consultation' | 'Walk-in' | 'Health Checkup' | 'Procedure Consultation' | 'Specialist Referral' | 'Second Opinion';
  status: 'Scheduled' | 'Confirmed' | 'Checked-In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show' | 'Rescheduled' | 'Archived';
  priorityLevel?: 'Normal' | 'VIP' | 'Emergency' | 'Senior Citizen';
  symptoms?: string;
  notes?: string;
  checkInTime?: Date;
  consultationStartTime?: Date;
  consultationEndTime?: Date;
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
    patientPhone: String,
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorName: { type: String, required: true },
    appointmentNumber: { type: String, unique: true, index: true },
    tokenNumber: { type: Number, index: true },
    queuePosition: { type: Number, default: 0 },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    slotStartTime: String,
    slotEndTime: String,
    duration: { type: Number, default: 15 },
    type: {
      type: String,
      enum: ['New Consultation', 'Follow-up', 'Emergency Consultation', 'Online Consultation', 'Walk-in', 'Health Checkup', 'Procedure Consultation', 'Specialist Referral', 'Second Opinion'],
      default: 'New Consultation',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Checked-In', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show', 'Rescheduled', 'Archived'],
      default: 'Scheduled',
    },
    priorityLevel: {
      type: String,
      enum: ['Normal', 'VIP', 'Emergency', 'Senior Citizen'],
      default: 'Normal',
    },
    symptoms: String,
    notes: String,
    checkInTime: Date,
    consultationStartTime: Date,
    consultationEndTime: Date,
    cancelReason: String,
    rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, date: 1 });
AppointmentSchema.index({ hospitalId: 1, date: 1, status: 1 });

AppointmentSchema.pre('save', async function (next) {
  if (!this.appointmentNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Appointment').countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
    });
    this.appointmentNumber = `APT-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
