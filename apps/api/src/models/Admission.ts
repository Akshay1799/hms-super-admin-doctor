import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IAdmission extends Document {
  admissionNumber: string;
  patientId: mongoose.Types.ObjectId;
  admittingDoctorId: mongoose.Types.ObjectId;
  status: 'Approved' | 'Admitted' | 'Discharge Planned' | 'Discharged';
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    admissionNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      default: () => `ADM-${crypto.randomUUID()}` 
    },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    admittingDoctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Approved', 'Admitted', 'Discharge Planned', 'Discharged'],
      default: 'Approved'
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

AdmissionSchema.index({ tenantId: 1, hospitalId: 1, admissionNumber: 1 }, { unique: true });
AdmissionSchema.index({ patientId: 1 });
AdmissionSchema.index({ status: 1 });

export const Admission = mongoose.model<IAdmission>('Admission', AdmissionSchema);
