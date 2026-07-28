import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  uhid: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  appointmentId?: mongoose.Types.ObjectId;
  visitType: 'OPD' | 'IPD' | 'Emergency' | 'Follow-up';
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    pulse?: number;
    temperature?: number;
    weight?: number;
    spo2?: number;
  };
  symptoms: string[];
  diagnoses: Array<{
    code?: string; // ICD-10 code
    description: string;
    type: 'Primary' | 'Secondary' | 'Differential';
  }>;
  medicines: Array<{
    name: string; // Drug Name
    category?: string; // Tablet, Syrup, Injection, Capsule
    dosage: string; // e.g. 500mg, 10ml
    frequency: string; // 1-0-1, 1-1-1, Once Daily, BD, TDS
    duration: string; // e.g. 5 Days
    instructions?: string; // After food, Before sleep
  }>;
  labTestsRequested?: string[];
  radiologyRequested?: string[];
  consultationNotes?: string;
  treatmentPlan?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    patientName: { type: String, required: true },
    uhid: { type: String, required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorName: { type: String, required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', index: true },
    visitType: {
      type: String,
      enum: ['OPD', 'IPD', 'Emergency', 'Follow-up'],
      default: 'OPD',
    },
    vitals: {
      bpSystolic: Number,
      bpDiastolic: Number,
      pulse: Number,
      temperature: Number,
      weight: Number,
      spo2: Number,
    },
    symptoms: [{ type: String }],
    diagnoses: [
      {
        code: String,
        description: { type: String, required: true },
        type: { type: String, enum: ['Primary', 'Secondary', 'Differential'], default: 'Primary' },
      },
    ],
    medicines: [
      {
        name: { type: String, required: true },
        category: String,
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],
    labTestsRequested: [{ type: String }],
    radiologyRequested: [{ type: String }],
    consultationNotes: String,
    treatmentPlan: String,
    followUpDate: Date,
  },
  { timestamps: true }
);

PrescriptionSchema.index({ tenantId: 1, hospitalId: 1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
