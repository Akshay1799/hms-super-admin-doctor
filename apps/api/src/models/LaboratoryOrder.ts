import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratoryOrderItem {
  testId?: mongoose.Types.ObjectId;
  panelId?: mongoose.Types.ObjectId;
  preparationInstructions?: string;
}

export interface ILaboratoryOrderHistory {
  action: string;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  details?: string;
}

export interface ILaboratoryOrder extends Document {
  orderNumber: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  status: 'Draft' | 'Requested' | 'Billing Pending' | 'Billing Completed' | 'Sample Pending' | 'Sample Collected' | 'Processing' | 'Completed' | 'Reported' | 'Cancelled' | 'Archived';
  priority: 'Routine' | 'Urgent' | 'Emergency' | 'STAT';
  items: ILaboratoryOrderItem[];
  clinicalInformation?: {
    notes?: string;
    provisionalDiagnosis?: string;
    symptoms?: string;
  };
  history: ILaboratoryOrderHistory[];
  billingStatus?: 'Not Required' | 'Pending' | 'Completed' | 'Failed';
  invoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratoryOrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    status: {
      type: String,
      enum: ['Draft', 'Requested', 'Billing Pending', 'Billing Completed', 'Sample Pending', 'Sample Collected', 'Processing', 'Completed', 'Reported', 'Cancelled', 'Archived'],
      default: 'Requested',
      index: true
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency', 'STAT'],
      default: 'Routine'
    },
    items: [
      {
        testId: { type: Schema.Types.ObjectId, ref: 'TestCatalog' },
        panelId: { type: Schema.Types.ObjectId, ref: 'LaboratoryPanel' },
        preparationInstructions: { type: String }
      }
    ],
    clinicalInformation: {
      notes: String,
      provisionalDiagnosis: String,
      symptoms: String
    },
    history: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        details: String
      }
    ],
    billingStatus: {
      type: String,
      enum: ['Not Required', 'Pending', 'Completed', 'Failed'],
      default: 'Not Required'
    },
    invoiceId: { type: Schema.Types.ObjectId } // Refer to Billing Module's Invoice if applicable
  },
  {
    timestamps: true,
  }
);

// Ensure orderNumber is unique per hospital
LaboratoryOrderSchema.index({ orderNumber: 1, hospitalId: 1 }, { unique: true });

export const LaboratoryOrder = mongoose.model<ILaboratoryOrder>('LaboratoryOrder', LaboratoryOrderSchema);
