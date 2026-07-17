import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { sendSuccess, sendCreated, NotFoundError, ConflictError } from '../utils/response';

export async function listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, plan, search, page = '1', limit = '20' } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [tenants, total] = await Promise.all([
      Tenant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Tenant.countDocuments(filter),
    ]);

    sendSuccess(res, tenants, 'Tenants retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) throw new NotFoundError('Tenant not found');
    sendSuccess(res, tenant);
  } catch (err) {
    next(err);
  }
}

export async function createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await Tenant.findOne({ code: req.body.code?.toUpperCase() });
    if (existing) throw new ConflictError(`Tenant code "${req.body.code}" already exists`);

    const tenant = await Tenant.create(req.body);
    sendCreated(res, tenant, 'Tenant created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tenant) throw new NotFoundError('Tenant not found');
    sendSuccess(res, tenant, 'Tenant updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) throw new NotFoundError('Tenant not found');
    sendSuccess(res, null, 'Tenant deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { featureFlags: req.body },
      { new: true }
    );
    if (!tenant) throw new NotFoundError('Tenant not found');
    sendSuccess(res, tenant.featureFlags, 'Feature flags updated');
  } catch (err) {
    next(err);
  }
}

export async function updateQuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { quotas: req.body },
      { new: true }
    );
    if (!tenant) throw new NotFoundError('Tenant not found');
    sendSuccess(res, tenant.quotas, 'Quotas updated');
  } catch (err) {
    next(err);
  }
}
