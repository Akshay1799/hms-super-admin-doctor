import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatmentOrder extends Document {
  patientId: mongoose.Types.ObjectId;
  admissionId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  
  type: 'Medication' | 'IVFluid' | 'NursingInstruction' | 'Procedure';
  
  // For Medication/IVFluid
  medicineName?: string;
  dosage?: string;
  route?: string;
  frequency?: string; // e.g. "OD", "BD", "TDS", "SOS", "Q6H"
  
  // For IV Fluids or specifics
  volume?: string;
  infusionRate?: string;
  
  instructions?: string;
  
  startDate: Date;
  endDate?: Date;
  
  status: 'Active' | 'Discontinued' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentOrderSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  admissionId: { type: Schema.Types.ObjectId, ref: 'Admission', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },

  type: { 
    type: String, 
    enum: ['Medication', 'IVFluid', 'NursingInstruction', 'Procedure'], 
    required: true 
  },

  medicineName: { type: String },
  dosage: { type: String },
  route: { type: String },
  frequency: { type: String },
  
  volume: { type: String },
  infusionRate: { type: String },
  
  instructions: { type: String },

  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },

  status: { 
    type: String, 
    enum: ['Active', 'Discontinued', 'Completed'], 
    default: 'Active' 
  },
}, { timestamps: true });

export const TreatmentOrder = mongoose.models.TreatmentOrder || mongoose.model<ITreatmentOrder>('TreatmentOrder', TreatmentOrderSchema);

export interface IMedicationAdministration extends Document {
  treatmentOrderId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  nurseId: mongoose.Types.ObjectId; // The user who administered it
  hospitalId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  
  scheduledTime: Date;
  actualTime?: Date;
  
  status: 'Administered' | 'Missed' | 'Delayed';
  reason?: string; // Reason if Missed or Delayed
  remarks?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const MedicationAdministrationSchema: Schema = new Schema({
  treatmentOrderId: { type: Schema.Types.ObjectId, ref: 'TreatmentOrder', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  nurseId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },

  scheduledTime: { type: Date, required: true },
  actualTime: { type: Date },

  status: {
    type: String,
    enum: ['Administered', 'Missed', 'Delayed'],
    required: true
  },
  
  reason: { type: String },
  remarks: { type: String },
}, { timestamps: true });

export const MedicationAdministration = mongoose.models.MedicationAdministration || mongoose.model<IMedicationAdministration>('MedicationAdministration', MedicationAdministrationSchema);
