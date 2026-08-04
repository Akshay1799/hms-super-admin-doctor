import mongoose, { Document, Schema } from 'mongoose';

export interface IEncounter extends Document {
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  
  visitNumber: string; // e.g., OPD-2026-000001
  
  encounterType: 'OPD' | 'IPD' | 'Emergency' | 'Day Care' | 'Teleconsultation' | 'Health Camp' | 'Follow-up Visit';
  category: 'New Visit' | 'Follow-up Visit' | 'Referral Visit' | 'Emergency Visit' | 'Walk-in' | 'Scheduled Appointment' | 'Corporate Visit' | 'Insurance Visit';
  
  doctorId?: mongoose.Types.ObjectId;
  referralSource?: string;
  referralDoctor?: string;
  notes?: string;

  status: 'Scheduled' | 'Checked-In' | 'Waiting' | 'In Consultation' | 'Investigation' | 'Treatment' | 'Completed' | 'Cancelled' | 'Archived';
  
  registeredBy?: mongoose.Types.ObjectId; // User who did the registration

  createdAt: Date;
  updatedAt: Date;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    
    visitNumber: { type: String, unique: true, index: true },
    
    encounterType: { 
      type: String, 
      enum: ['OPD', 'IPD', 'Emergency', 'Day Care', 'Teleconsultation', 'Health Camp', 'Follow-up Visit'],
      required: true 
    },
    category: { 
      type: String, 
      enum: ['New Visit', 'Follow-up Visit', 'Referral Visit', 'Emergency Visit', 'Walk-in', 'Scheduled Appointment', 'Corporate Visit', 'Insurance Visit'],
      default: 'New Visit'
    },
    
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    referralSource: String,
    referralDoctor: String,
    notes: String,

    status: {
      type: String,
      enum: ['Scheduled', 'Checked-In', 'Waiting', 'In Consultation', 'Investigation', 'Treatment', 'Completed', 'Cancelled', 'Archived'],
      default: 'Checked-In'
    },
    
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

EncounterSchema.pre('save', async function (next) {
  if (!this.visitNumber) {
    const year = new Date().getFullYear();
    // Use a prefix based on encounterType
    let prefix = 'OPD';
    if (this.encounterType === 'IPD') prefix = 'IPD';
    else if (this.encounterType === 'Emergency') prefix = 'ER';
    
    // Count encounters for this year & prefix
    // For simplicity, we just count all encounters of this prefix for this year.
    // In a highly concurrent environment, a robust counter collection is safer.
    const count = await mongoose.model('Encounter').countDocuments({ 
      encounterType: this.encounterType,
      createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
    });
    
    this.visitNumber = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Encounter = mongoose.model<IEncounter>('Encounter', EncounterSchema);
