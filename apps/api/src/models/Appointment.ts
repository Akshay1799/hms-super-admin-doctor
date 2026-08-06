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
  bookingReference: string;
  bookingSource: 'Online' | 'Offline' | 'Front Desk' | 'Call Center' | 'Doctor Referral';
  duration: number;  // minutes
  type: 'New Consultation' | 'Follow-up' | 'Review Visit' | 'Teleconsultation' | 'Preventive Health Check' | 'Executive Health Package' | 'Specialist Referral' | 'Corporate Appointment' | 'Insurance Appointment' | 'VIP Appointment' | 'Walk-in';
  status: 'Draft' | 'Reserved' | 'Scheduled' | 'Confirmed' | 'Checked-In' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show' | 'Rescheduled' | 'Archived';
  priorityLevel?: 'Normal' | 'VIP' | 'Emergency' | 'Senior Citizen';
  symptoms?: string;
  notes?: string;
  reservationExpiresAt?: Date;
  checkInTime?: Date;
  consultationStartTime?: Date;
  consultationEndTime?: Date;
  cancelReason?: string;
  rescheduledFrom?: mongoose.Types.ObjectId;
  appointmentGroupId?: mongoose.Types.ObjectId;
  dependsOnAppointmentId?: mongoose.Types.ObjectId; // For sequential appointments
  referralId?: mongoose.Types.ObjectId;
  remindersStatus?: {
    twentyFourHour?: boolean;
    twoHour?: boolean;
  };
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
    bookingReference: { type: String, unique: true, index: true },
    bookingSource: { 
      type: String, 
      enum: ['Online', 'Offline', 'Front Desk', 'Call Center', 'Doctor Referral'], 
      default: 'Offline' 
    },
    duration: { type: Number, default: 15 },
    type: {
      type: String,
      enum: ['New Consultation', 'Follow-up', 'Review Visit', 'Teleconsultation', 'Preventive Health Check', 'Executive Health Package', 'Specialist Referral', 'Corporate Appointment', 'Insurance Appointment', 'VIP Appointment', 'Walk-in'],
      default: 'New Consultation',
    },
    status: {
      type: String,
      enum: ['Draft', 'Reserved', 'Scheduled', 'Confirmed', 'Checked-In', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show', 'Rescheduled', 'Archived'],
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
    appointmentGroupId: { type: Schema.Types.ObjectId, ref: 'AppointmentGroup', index: true },
    dependsOnAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    reservationExpiresAt: Date,
    remindersStatus: {
      twentyFourHour: { type: Boolean, default: false },
      twoHour: { type: Boolean, default: false },
    },
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
    const seq = String(count + 1).padStart(6, '0');
    this.appointmentNumber = `APT-${year}-${seq}`;
  }
  if (!this.bookingReference) {
    this.bookingReference = this.appointmentNumber;
  }
  next();
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
