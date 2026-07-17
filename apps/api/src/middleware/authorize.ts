import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { ForbiddenError } from '../utils/response';

/**
 * RBAC middleware — checks if authenticated user has one of the allowed roles
 * Usage: router.get('/endpoint', authenticate, authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), handler)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(`Access denied. Required: ${allowedRoles.join(' or ')}, you have: ${userRole}`)
      );
    }

    next();
  };
}

// Shorthand helpers
export const superAdminOnly = authorize('SUPER_ADMIN');
export const adminRoles = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN');
export const allAdminRoles = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN');
export const clinicalRoles = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR');
export const allRoles = authorize(
  'SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN',
  'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF'
);

/**
 * Tenant scoping middleware — enforces that non-super-admins can only access their tenant data
 * Injects req.tenantId for downstream service calls
 */
export function enforceTenantScope(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new ForbiddenError('Authentication required'));

  if (req.user.role === 'SUPER_ADMIN') {
    // Super admin can optionally filter by tenantId query param
    req.tenantId = req.query.tenantId as string | undefined;
  } else {
    // All other roles are locked to their tenantId
    if (!req.user.tenantId) {
      return next(new ForbiddenError('Tenant context required'));
    }
    req.tenantId = req.user.tenantId.toString();
  }

  next();
}

/**
 * Hospital scoping — ensures HOSPITAL_ADMIN and DEPT_ADMIN can only see their hospital
 */
export function enforceHospitalScope(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new ForbiddenError('Authentication required'));

  const role = req.user.role;

  if (role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN') {
    // They can access any hospital (optionally filtered by query param)
    return next();
  }

  if (role === 'HOSPITAL_ADMIN' || role === 'DEPT_ADMIN' || role === 'DOCTOR' || role === 'NURSE' || role === 'STAFF' || role === 'RECEPTIONIST') {
    if (!req.user.hospitalId) {
      return next(new ForbiddenError('Hospital context required for your role'));
    }
    // If a hospitalId param is in the request, ensure it matches the user's hospital
    const requestedHospitalId = req.params.hospitalId || req.body?.hospitalId || req.query.hospitalId;
    if (requestedHospitalId && requestedHospitalId !== req.user.hospitalId.toString()) {
      return next(new ForbiddenError('Access denied to this hospital'));
    }
  }

  next();
}
