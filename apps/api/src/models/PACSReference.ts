import mongoose, { Document, Schema } from 'mongoose';

export interface IPACSReference extends Document {
  studyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  pacsServerId: string; // Identifier for the configured PACS server
  storagePath: string; // Internal PACS path or reference ID
  viewerUrl: string; // URL for web viewer
  syncStatus: 'Synced' | 'Pending' | 'Failed';
  lastSyncedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PACSReferenceSchema = new Schema<IPACSReference>(
  {
    studyId: { type: Schema.Types.ObjectId, ref: 'ImagingStudy', required: true, unique: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    pacsServerId: { type: String, required: true },
    storagePath: { type: String, required: true },
    viewerUrl: { type: String, required: true },
    syncStatus: {
      type: String,
      enum: ['Synced', 'Pending', 'Failed'],
      default: 'Synced'
    },
    lastSyncedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PACSReferenceSchema.index({ tenantId: 1, hospitalId: 1, pacsServerId: 1 });
PACSReferenceSchema.index({ syncStatus: 1 });

export const PACSReference = mongoose.model<IPACSReference>('PACSReference', PACSReferenceSchema);
