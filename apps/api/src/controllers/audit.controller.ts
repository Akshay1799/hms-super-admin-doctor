import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess } from '../utils/response';

export async function listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { module, action, severity, status, userId, from, to, page = '1', limit = '50' } = req.query;
    const filter: Record<string, unknown> = {};

    // Scope
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) filter.tenantId = req.user.tenantId;
    if (req.user?.role === 'HOSPITAL_ADMIN') filter.hospitalId = req.user.hospitalId;
    if (req.user?.role === 'DEPT_ADMIN') filter.departmentId = req.user.departmentId;

    if (module) filter.module = module;
    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to as string);
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(200, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    sendSuccess(res, logs, 'Audit logs retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) filter.tenantId = req.user.tenantId;

    const [total, criticalCount, byModule] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.countDocuments({ ...filter, severity: 'critical' }),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    sendSuccess(res, { total, criticalCount, byModule });
  } catch (err) {
    next(err);
  }
}
