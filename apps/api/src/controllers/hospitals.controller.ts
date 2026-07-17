import { Request, Response, NextFunction } from 'express';
import { Hospital } from '../models/Hospital';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError } from '../utils/response';

function buildHospitalFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  // Non-super-admins are automatically scoped to their tenant
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.tenantId) {
    filter.tenantId = req.user.tenantId;
  } else if (req.query.tenantId) {
    filter.tenantId = req.query.tenantId;
  }
  // HOSPITAL_ADMIN and DEPT_ADMIN can only see their hospital
  if (req.user?.role === 'HOSPITAL_ADMIN' || req.user?.role === 'DEPT_ADMIN') {
    filter._id = req.user.hospitalId;
  }
  return filter;
}

export async function listHospitals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, search, page = '1', limit = '20' } = req.query;
    const filter = buildHospitalFilter(req);

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [hospitals, total] = await Promise.all([
      Hospital.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Hospital.countDocuments(filter),
    ]);

    sendSuccess(res, hospitals, 'Hospitals retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getHospital(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('adminId', 'name email');
    if (!hospital) throw new NotFoundError('Hospital not found');

    // Scope check
    if (
      (req.user?.role === 'HOSPITAL_ADMIN' || req.user?.role === 'DEPT_ADMIN') &&
      hospital._id.toString() !== req.user.hospitalId?.toString()
    ) {
      throw new ForbiddenError('Access denied to this hospital');
    }

    sendSuccess(res, hospital);
  } catch (err) {
    next(err);
  }
}

export async function createHospital(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospital = await Hospital.create({
      ...req.body,
      tenantId: req.body.tenantId,
    });
    sendCreated(res, hospital, 'Hospital created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateHospital(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) throw new NotFoundError('Hospital not found');
    sendSuccess(res, hospital, 'Hospital updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteHospital(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) throw new NotFoundError('Hospital not found');
    sendSuccess(res, null, 'Hospital deleted successfully');
  } catch (err) {
    next(err);
  }
}

// ── Departments within a Hospital ─────────────────────────────
export async function listHospitalDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await Department.find({ hospitalId: req.params.id })
      .populate('adminId', 'name email role')
      .sort({ name: 1 });
    sendSuccess(res, departments);
  } catch (err) {
    next(err);
  }
}

export async function getHospitalStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) throw new NotFoundError('Hospital not found');

    const [departmentCount, staffCount] = await Promise.all([
      Department.countDocuments({ hospitalId: req.params.id }),
      User.countDocuments({ hospitalId: req.params.id }),
    ]);

    sendSuccess(res, {
      ...hospital.toJSON(),
      departmentCount,
      staffCount,
    });
  } catch (err) {
    next(err);
  }
}
