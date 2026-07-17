import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

interface AuditOptions {
  module: string;
  action: string;
  entityType?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  description?: string;
}

/**
 * Audit log middleware factory
 * Usage: router.post('/path', authenticate, auditLog({ module: 'patients', action: 'CREATE' }), handler)
 */
export function auditLog(options: AuditOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // We use res.on('finish') to log AFTER the response is sent
    _res.on('finish', async () => {
      try {
        const isSuccess = _res.statusCode < 400;
        await AuditLog.create({
          tenantId: req.user?.tenantId,
          hospitalId: req.user?.hospitalId,
          userId: req.user?._id,
          userName: req.user?.name,
          userRole: req.user?.role,
          module: options.module,
          action: options.action,
          entityType: options.entityType,
          entityId: req.params.id,
          description: options.description || `${options.action} on ${options.entityType || options.module}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          severity: options.severity || 'info',
          status: isSuccess ? 'success' : 'failure',
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: _res.statusCode,
          },
        });
      } catch (err) {
        logger.error('Failed to write audit log:', err);
      }
    });
    next();
  };
}
