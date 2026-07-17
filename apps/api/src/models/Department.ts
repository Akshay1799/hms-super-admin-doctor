import mongoose, { Document, Schema } from 'mongoose';

export type DepartmentType = 
  | 'opd'        // Outpatient Department
  | 'ipd'        // Inpatient Department
  | 'icu'        // Intensive Care Unit
  | 'surgical'   // Operation Theatre / Surgical
  | 'diagnostic' // Radiology, Pathology, etc.
  | 'emergency'  // Emergency / Casualty
  | 'pharmacy'
  | 'laboratory'
  | 'maternity'  // Obstetrics & Gynaecology
  | 'paediatrics'
  | 'psychiatry'
  | 'physiotherapy'
  | 'other';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  name: string;               // e.g. "Cardiology OPD", "ICU", "Maternity Ward"
  code: string;               // e.g. "CARD-OPD-001"
  type: DepartmentType;
  description?: string;
  location?: string;          // e.g. "Block B, Floor 2"
  adminId?: mongoose.Types.ObjectId;   // DEPT_ADMIN — the person managing this department
  status: 'Active' | 'Inactive';
  // Capacity
  totalBeds: number;
  occupiedBeds: number;
  // Computed counts (denormalized)
  doctorCount: number;
  nurseCount: number;
  staffCount: number;
  patientCount: number;
  // Working hours
  workingHours?: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  // Contact
  extension?: string;   // internal phone extension
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: [
        'opd', 'ipd', 'icu', 'surgical', 'diagnostic', 'emergency',
        'pharmacy', 'laboratory', 'maternity', 'paediatrics',
        'psychiatry', 'physiotherapy', 'other',
      ],
      required: true,
    },
    description: String,
    location: String,
    adminId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    totalBeds: { type: Number, default: 0 },
    occupiedBeds: { type: Number, default: 0 },
    doctorCount: { type: Number, default: 0 },
    nurseCount: { type: Number, default: 0 },
    staffCount: { type: Number, default: 0 },
    patientCount: { type: Number, default: 0 },
    workingHours: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false },
    },
    extension: String,
    email: String,
  },
  { timestamps: true }
);

DepartmentSchema.index({ hospitalId: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ adminId: 1 });

// Virtual: available beds
DepartmentSchema.virtual('availableBeds').get(function () {
  return this.totalBeds - this.occupiedBeds;
});

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
