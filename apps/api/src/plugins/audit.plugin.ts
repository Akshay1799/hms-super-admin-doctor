import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog } from '../models/AuditLog';

export interface AuditOptions {
  module: string;
}

export function auditPlugin(schema: Schema, options: AuditOptions) {
  schema.pre('save', function (next) {
    if (this.isNew) {
      (this as any)._auditAction = 'CREATE';
    } else if (this.isModified()) {
      (this as any)._auditAction = 'UPDATE';
      (this as any)._auditOldValue = this.$locals.oldDocument; 
    }
    next();
  });

  schema.post('save', async function (doc: Document) {
    try {
      const action = (doc as any)._auditAction;
      if (!action) return;

      const userId = (doc as any)._auditUserId || null;
      const tenantId = (doc as any).tenantId || null;

      const modelName = (doc.constructor as mongoose.Model<any>).modelName;

      await AuditLog.create({
        tenantId,
        userId,
        module: options.module,
        action,
        entityType: modelName,
        entityId: doc._id.toString(),
        description: `${action} operation on ${modelName}`,
        severity: 'info',
        status: 'success',
        metadata: {
          newValue: doc.toJSON(),
          oldValue: (doc as any)._auditOldValue
        }
      });
    } catch (err) {
      console.error('AuditLog Error (post save):', err);
    }
  });

  schema.post('findOneAndDelete', async function (doc: Document) {
    if (!doc) return;
    try {
      const tenantId = (doc as any).tenantId || null;
      const modelName = (doc.constructor as mongoose.Model<any>).modelName;
      await AuditLog.create({
        tenantId,
        module: options.module,
        action: 'DELETE',
        entityType: modelName,
        entityId: doc._id.toString(),
        description: `DELETE operation on ${modelName}`,
        severity: 'warning',
        status: 'success',
        metadata: {
          oldValue: doc.toJSON()
        }
      });
    } catch (err) {
      console.error('AuditLog Error (post delete):', err);
    }
  });
}
