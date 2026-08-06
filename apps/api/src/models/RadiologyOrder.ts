import mongoose, { Document, Schema } from 'mongoose';

export interface IRadiologyOrderItem {
  catalogId: mongoose.Types.ObjectId;
  status: 'Requested' | 'Scheduled' | 'Study Pending' | 'Study Completed' | 'Reporting' | 'Approved' | 'Delivered' | 'Cancelled';
  clinicalNotes?: string;
  cancellationReason?: string;
}

export interface IRadiologyOrder extends Document {
  orderNumber: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  clinicalInformation?: {
    clinicalNotes?: string;
    provisionalDiagnosis?: string;
    pregnancyStatus?: string;
    allergyHistory?: string;
    previousImagingHistory?: string;
    previousSurgery?: string;
    durationOfIllness?: string;
    currentMedications?: string;
    infectionPrecautions?: string;
  };
  priority: 'Routine' | 'Urgent' | 'Emergency' | 'STAT';
  orderStatus: 'Draft' | 'Requested' | 'Billing Pending' | 'Billing Completed' | 'Scheduling Pending' | 'Scheduled' | 'Study Pending' | 'Study Completed' | 'Reporting' | 'Approved' | 'Delivered' | 'Archived' | 'Cancelled';
  contrastInformation?: {
    contrastRequired: boolean;
    contrastType?: string;
    contrastDose?: string;
    routeOfAdministration?: string;
    allergyScreening?: string;
    consentStatus?: 'Pending' | 'Obtained' | 'Refused' | 'Not Applicable';
    renalFunctionRequirement?: string;
  };
  items: IRadiologyOrderItem[];
  billingReference?: string;
  cancellationReason?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyOrderItemSchema = new Schema<IRadiologyOrderItem>({
  catalogId: { type: Schema.Types.ObjectId, ref: 'ImagingCatalog', required: true },
  status: { 
    type: String, 
    enum: ['Requested', 'Scheduled', 'Study Pending', 'Study Completed', 'Reporting', 'Approved', 'Delivered', 'Cancelled'],
    default: 'Requested'
  },
  clinicalNotes: { type: String },
  cancellationReason: { type: String }
});

const RadiologyOrderSchema = new Schema<IRadiologyOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    
    clinicalInformation: {
      clinicalNotes: { type: String },
      provisionalDiagnosis: { type: String },
      pregnancyStatus: { type: String },
      allergyHistory: { type: String },
      previousImagingHistory: { type: String },
      previousSurgery: { type: String },
      durationOfIllness: { type: String },
      currentMedications: { type: String },
      infectionPrecautions: { type: String },
    },
    
    priority: { 
      type: String, 
      enum: ['Routine', 'Urgent', 'Emergency', 'STAT'], 
      default: 'Routine' 
    },
    
    orderStatus: { 
      type: String, 
      enum: ['Draft', 'Requested', 'Billing Pending', 'Billing Completed', 'Scheduling Pending', 'Scheduled', 'Study Pending', 'Study Completed', 'Reporting', 'Approved', 'Delivered', 'Archived', 'Cancelled'],
      default: 'Requested'
    },
    
    contrastInformation: {
      contrastRequired: { type: Boolean, default: false },
      contrastType: { type: String },
      contrastDose: { type: String },
      routeOfAdministration: { type: String },
      allergyScreening: { type: String },
      consentStatus: { 
        type: String, 
        enum: ['Pending', 'Obtained', 'Refused', 'Not Applicable'],
        default: 'Not Applicable'
      },
      renalFunctionRequirement: { type: String },
    },
    
    items: [RadiologyOrderItemSchema],
    
    billingReference: { type: String },
    cancellationReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RadiologyOrderSchema.index({ tenantId: 1, hospitalId: 1, orderNumber: 1 }, { unique: true });
RadiologyOrderSchema.index({ patientId: 1 });
RadiologyOrderSchema.index({ doctorId: 1 });
RadiologyOrderSchema.index({ departmentId: 1 });
RadiologyOrderSchema.index({ orderStatus: 1 });
RadiologyOrderSchema.index({ priority: 1 });
RadiologyOrderSchema.index({ createdAt: -1 });

export const RadiologyOrder = mongoose.model<IRadiologyOrder>('RadiologyOrder', RadiologyOrderSchema);
