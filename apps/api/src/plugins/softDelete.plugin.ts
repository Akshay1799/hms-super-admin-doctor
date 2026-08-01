import { Schema, Document } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  });

  const typesFindQueryMiddleware = [
    'countDocuments',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'update',
    'updateOne',
    'updateMany',
  ];

  const excludeDeleted = function (this: any, next: Function) {
    // Only exclude deleted if not explicitly requested
    if (this.getQuery().isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
    next();
  };

  typesFindQueryMiddleware.forEach((type) => {
    schema.pre(type as any, excludeDeleted);
  });

  // Add a softDelete method to the document
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };

  // Add a restore method
  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
  };
}
