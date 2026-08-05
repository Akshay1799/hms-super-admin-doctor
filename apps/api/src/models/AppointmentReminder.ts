import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointmentReminder extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  type: 'Initial Confirmation' | '24-Hour Reminder' | 'Same-Day Reminder' | 'One-Hour Reminder' | 'Follow-up Reminder' | 'Cancellation Notification' | 'Rescheduled Appointment Notification';
  scheduledTime: Date;
  status: 'Scheduled' | 'Queued' | 'Processing' | 'Delivered' | 'Failed' | 'Retried' | 'Completed' | 'Archived' | 'Cancelled';
  channel: 'Email' | 'SMS' | 'WhatsApp';
  deliveryStatus?: string; // Information regarding external provider state, e.g. "Sent to Twilio"
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentReminderSchema = new Schema<IAppointmentReminder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    type: {
      type: String,
      enum: ['Initial Confirmation', '24-Hour Reminder', 'Same-Day Reminder', 'One-Hour Reminder', 'Follow-up Reminder', 'Cancellation Notification', 'Rescheduled Appointment Notification'],
      required: true
    },
    scheduledTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Queued', 'Processing', 'Delivered', 'Failed', 'Retried', 'Completed', 'Archived', 'Cancelled'],
      default: 'Scheduled',
      index: true
    },
    channel: {
      type: String,
      enum: ['Email', 'SMS', 'WhatsApp'],
      default: 'Email'
    },
    deliveryStatus: String
  },
  { timestamps: true }
);

export const AppointmentReminder = mongoose.model<IAppointmentReminder>('AppointmentReminder', AppointmentReminderSchema);
