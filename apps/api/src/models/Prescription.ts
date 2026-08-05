import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  encounterId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  uhid: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  appointmentId?: mongoose.Types.ObjectId;
  visitType: 'OPD' | 'IPD' | 'Emergency' | 'Follow-up';
  
  // Status Lifecycle
  status: 'Draft' | 'Under Review' | 'Signed' | 'Issued' | 'Received by Pharmacy' | 'Partially Dispensed' | 'Fully Dispensed' | 'Completed' | 'Cancelled' | 'Archived';
  
  // Validation flags
  allergiesVerified: boolean;
  interactionsVerified: boolean;
  
  // Vitals
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
  
  // Structured Medicines
  medicines: Array<{
    drugId?: mongoose.Types.ObjectId; // Reference to Pharmacy Medicine (optional for ad-hoc)
    brandName: string;
    genericName: string;
    category?: string; // Tablet, Syrup, Injection, Capsule
    strength: string; // e.g. 500mg
    dose: string; // e.g. 1 tablet
    route: string; // e.g. Oral, IV
    frequency: string; // 1-0-1, 1-1-1, Once Daily, BD, TDS
    duration: string; // e.g. 5 Days
    quantity: number; // e.g. 10
    timing?: string; // e.g. Morning, Night
    foodInstructions?: string; // After food, Before sleep
    specialInstructions?: string; 
    substitutionAllowed: boolean;
    refillCount: number;
  }>;
  
  labTestsRequested?: string[];
  radiologyRequested?: string[];
  consultationNotes?: string;
  treatmentPlan?: string;
  followUpDate?: Date;
  
  // Cancellation details
  cancellationReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter', required: true, index: true },
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
    status: {
      type: String,
      enum: ['Draft', 'Under Review', 'Signed', 'Issued', 'Received by Pharmacy', 'Partially Dispensed', 'Fully Dispensed', 'Completed', 'Cancelled', 'Archived'],
      default: 'Draft',
    },
    allergiesVerified: { type: Boolean, default: false },
    interactionsVerified: { type: Boolean, default: false },
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
        drugId: { type: Schema.Types.ObjectId, ref: 'Medicine' },
        brandName: { type: String, required: true },
        genericName: { type: String, required: true },
        category: String,
        strength: { type: String, required: true },
        dose: { type: String, required: true },
        route: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        quantity: { type: Number, required: true },
        timing: String,
        foodInstructions: String,
        specialInstructions: String,
        substitutionAllowed: { type: Boolean, default: false },
        refillCount: { type: Number, default: 0 },
      },
    ],
    labTestsRequested: [{ type: String }],
    radiologyRequested: [{ type: String }],
    consultationNotes: String,
    treatmentPlan: String,
    followUpDate: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

PrescriptionSchema.index({ tenantId: 1, hospitalId: 1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ status: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
