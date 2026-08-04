import { Request, Response, NextFunction } from 'express';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { sendSuccess, sendCreated, NotFoundError, ForbiddenError } from '../utils/response';

function buildDeptFilter(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (req.user?.role !== 'SUPER_ADMIN') {
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
  }

  // HOSPITAL_ADMIN sees all departments in their hospital
  if (req.user?.role === 'HOSPITAL_ADMIN') {
    filter.hospitalId = req.user.hospitalId;
  }

  // DEPT_ADMIN sees only their department
  if (req.user?.role === 'DEPT_ADMIN') {
    filter._id = req.user.departmentId;
  }

  return filter;
}

export async function listDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, hospitalId, search } = req.query;
    const filter = buildDeptFilter(req);

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const departments = await Department.find(filter)
      .populate('adminId', 'name email role')
      .populate('hospitalId', 'name code')
      .sort({ name: 1 });

    sendSuccess(res, departments);
  } catch (err) {
    next(err);
  }
}

export async function getDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dept = await Department.findById(req.params.id)
      .populate('adminId', 'name email role avatar')
      .populate('hospitalId', 'name code');

    if (!dept) throw new NotFoundError('Department not found');

    // DEPT_ADMIN can only see their own department
    if (
      req.user?.role === 'DEPT_ADMIN' &&
      dept._id.toString() !== req.user.departmentId?.toString()
    ) {
      throw new ForbiddenError('Access denied to this department');
    }

    sendSuccess(res, dept);
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dept = await Department.create(req.body);

    // Update hospital department count
    await Hospital.findByIdAndUpdate(req.body.hospitalId, { $inc: { departmentCount: 1 } });

    sendCreated(res, dept, 'Department created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dept) throw new NotFoundError('Department not found');
    sendSuccess(res, dept, 'Department updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new NotFoundError('Department not found');

    // Update hospital department count
    await Hospital.findByIdAndUpdate(dept.hospitalId, { $inc: { departmentCount: -1 } });

    sendSuccess(res, null, 'Department deleted successfully');
  } catch (err) {
    next(err);
  }
}

// Assign an admin to a department
export async function assignDeptAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) throw new NotFoundError('Department not found');

    const newAdmin = await User.findById(userId);
    if (!newAdmin) throw new NotFoundError('User not found');

    // Demote the existing admin if there is one (Single Source of Truth)
    if (dept.adminId && dept.adminId.toString() !== userId) {
      const oldAdmin = await User.findById(dept.adminId);
      if (oldAdmin) {
        // Revert to a base role. If they have specialty, DOCTOR, else STAFF.
        oldAdmin.role = oldAdmin.specialty ? 'DOCTOR' : 'STAFF';
        oldAdmin.departmentId = null;
        await oldAdmin.save();
      }
    }

    // Update the department's adminId
    dept.adminId = newAdmin._id;
    await dept.save();

    // Update the new admin's role and department assignment
    newAdmin.role = 'DEPT_ADMIN';
    newAdmin.departmentId = dept._id;
    newAdmin.hospitalId = dept.hospitalId;
    await newAdmin.save();

    sendSuccess(res, { department: dept, admin: newAdmin.toJSON() }, 'Department admin assigned');
  } catch (err) {
    next(err);
  }
}

// List all staff in a department
export async function listDeptStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, status } = req.query;
    const filter: Record<string, unknown> = { departmentId: req.params.id };

    if (role) filter.role = role;
    if (status) filter.status = status;

    const staff = await User.find(filter)
      .select('-password')
      .populate('departmentId', 'name')
      .sort({ name: 1 });
    sendSuccess(res, staff);
  } catch (err) {
    next(err);
  }
}
