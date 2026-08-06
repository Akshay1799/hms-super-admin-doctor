import mongoose, { Document, Schema } from 'mongoose';

export interface IRadiologyAppointment extends Document {
  appointmentNumber: string;
  orderId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId; // Reference to the specific catalog item within the order
  patientId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  machineId: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  radiologistId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  examinationDuration: number;
  status: 'Reserved' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Blocked';
  preparationChecklist: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyAppointmentSchema = new Schema<IRadiologyAppointment>(
  {
    appointmentNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'RadiologyOrder', required: true },
    orderItemId: { type: Schema.Types.ObjectId, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    machineId: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    radiologistId: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    examinationDuration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Reserved', 'Confirmed', 'Completed', 'Cancelled', 'Blocked'],
      default: 'Reserved'
    },
    preparationChecklist: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RadiologyAppointmentSchema.index({ tenantId: 1, hospitalId: 1, appointmentNumber: 1 }, { unique: true });
RadiologyAppointmentSchema.index({ machineId: 1, startTime: 1, endTime: 1 });
RadiologyAppointmentSchema.index({ patientId: 1 });
RadiologyAppointmentSchema.index({ orderId: 1 });
RadiologyAppointmentSchema.index({ status: 1 });
RadiologyAppointmentSchema.index({ startTime: 1 });

export const RadiologyAppointment = mongoose.model<IRadiologyAppointment>('RadiologyAppointment', RadiologyAppointmentSchema);
