import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Invitation } from '../models/AuthToken';
import { Department } from '../models/Department';
import { Hospital } from '../models/Hospital';
import {
  sendSuccess,
  sendCreated,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils/response';
import { generateInvitationToken } from '../utils/jwt';
import { sendDoctorInvitationEmail } from '../utils/email';
import { env } from '../config/env';

// Scoped filter based on caller's role
function buildUserFilter(req: Request, roleFilter?: string | string[]): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (req.user?.role !== 'SUPER_ADMIN') {
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;
  }

  if (req.user?.role === 'HOSPITAL_ADMIN') {
    filter.hospitalId = req.user.hospitalId;
  }

  if (req.user?.role === 'DEPT_ADMIN') {
    filter.departmentId = req.user.departmentId;
  }

  if (roleFilter) {
    filter.role = Array.isArray(roleFilter) ? { $in: roleFilter } : roleFilter;
  } else {
    // Exclude patients from general user lists (e.g. staff directories) by default
    filter.role = { $ne: 'PATIENT' };
  }

  return filter;
}

// ── Generic User CRUD (IAM) ───────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, status, hospitalId, search, page = '1', limit = '20' } = req.query;
    const filter = buildUserFilter(req);

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, users, 'Users retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError('Unauthorized');

    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError('User not found');

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    // HIERARCHICAL SYNC: If user is a PATIENT, sync to Patient EMR document!
    if (user.role === 'PATIENT') {
      const { Patient } = await import('../models/Patient');
      await Patient.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        { 
          name: user.name, 
          phone: user.phone 
        }
      );
    }

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError('Unauthorized');
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ForbiddenError('Incorrect current password');

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new NotFoundError('User not found');
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
function verifyAdminScope(caller: any, targetUser: any) {
  if (caller.role === 'SUPER_ADMIN') return;

  // Hospital scope check
  if (caller.role === 'HOSPITAL_ADMIN' || caller.role === 'DEPT_ADMIN') {
    if (targetUser.hospitalId?.toString() !== caller.hospitalId?.toString()) {
      throw new ForbiddenError('Access denied: User is outside your hospital scope');
    }
  }

  // Department scope check
  if (caller.role === 'DEPT_ADMIN') {
    if (!targetUser.departmentId || targetUser.departmentId.toString() !== caller.departmentId?.toString()) {
      throw new ForbiddenError('Access denied: User is outside your department scope');
    }
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    delete req.body.password;

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new NotFoundError('User not found');

    if (req.user) verifyAdminScope(req.user, targetUser);

    // Apply updates
    Object.assign(targetUser, req.body);
    await targetUser.save();

    const userRes = await User.findById(targetUser._id).select('-password');
    sendSuccess(res, userRes, 'User updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new NotFoundError('User not found');

    if (req.user) verifyAdminScope(req.user, targetUser);

    targetUser.status = 'Inactive';
    await targetUser.save();

    const userRes = await User.findById(targetUser._id).select('-password');
    sendSuccess(res, userRes, 'User deactivated successfully');
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new NotFoundError('User not found');

    if (req.user) verifyAdminScope(req.user, targetUser);

    targetUser.status = 'Suspended';
    await targetUser.save();

    const userRes = await User.findById(targetUser._id).select('-password');
    sendSuccess(res, userRes, 'User suspended');
  } catch (err) {
    next(err);
  }
}

export async function activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new NotFoundError('User not found');

    if (req.user) verifyAdminScope(req.user, targetUser);

    targetUser.status = 'Active';
    await targetUser.save();

    const userRes = await User.findById(targetUser._id).select('-password');
    sendSuccess(res, userRes, 'User activated');
  } catch (err) {
    next(err);
  }
}

// ── Doctors ───────────────────────────────────────────────────

export async function listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, hospitalId, departmentId, search, page = '1', limit = '20' } = req.query;
    const filter = buildUserFilter(req, 'DOCTOR');

    if (status) filter.status = status;
    if (hospitalId && req.user?.role === 'SUPER_ADMIN') filter.hospitalId = hospitalId;
    if (departmentId) filter.departmentId = departmentId;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, doctors, 'Doctors retrieved', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'DOCTOR' }).select('-password');
    if (!doctor) throw new NotFoundError('Doctor not found');
    sendSuccess(res, doctor);
  } catch (err) {
    next(err);
  }
}

// Create doctor record + send invitation email
export async function inviteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, specialty, hospitalId, departmentId, tenantId, qualifications, experience, phone } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('A user with this email already exists');

    // Create doctor record with Pending status
    const doctor = await User.create({
      name,
      email,
      password: 'password123',
      role: 'DOCTOR',
      status: 'Active',
      tenantId: tenantId || req.user?.tenantId,
      hospitalId,
      departmentId,
      specialty,
      qualifications,
      experience,
      phone,
    });

    // Generate invitation token
    const { token, hash } = generateInvitationToken(doctor._id.toString(), doctor.email);

    // Store invitation in DB
    await Invitation.create({
      tokenHash: hash,
      userId: doctor._id,
      email: doctor.email,
      role: 'DOCTOR',
      hospitalId,
      departmentId,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
    });

    // Send invitation email
    await sendDoctorInvitationEmail({
      to: email,
      name,
      invitationToken: token,
      portalUrl: env.frontends.doctorPortal,
      role: 'DOCTOR',
    });

    // Update department doctor count if department is assigned
    if (departmentId) {
      await Department.findByIdAndUpdate(departmentId, { $inc: { doctorCount: 1 } });
    }

    // Update hospital doctor count
    if (hospitalId) {
      await Hospital.findByIdAndUpdate(hospitalId, { $inc: { doctorCount: 1 } });
    }

    sendCreated(
      res,
      { doctor: doctor.toJSON(), token, invitationSent: true },
      'Doctor invited successfully. Activation email sent.'
    );
  } catch (err) {
    next(err);
  }
}

export async function updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    delete req.body.password;
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'DOCTOR' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!doctor) throw new NotFoundError('Doctor not found');
    sendSuccess(res, doctor, 'Doctor updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'DOCTOR' },
      { status: 'Inactive' },
      { new: true }
    ).select('-password');
    if (!doctor) throw new NotFoundError('Doctor not found');
    sendSuccess(res, doctor, 'Doctor removed successfully');
  } catch (err) {
    next(err);
  }
}

// ── Nurses ────────────────────────────────────────────────────

export async function listNurses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter = buildUserFilter(req, 'NURSE');
    if (req.query.status) filter.status = req.query.status;
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;

    const nurses = await User.find(filter).select('-password').sort({ name: 1 });
    sendSuccess(res, nurses, 'Nurses retrieved');
  } catch (err) {
    next(err);
  }
}

// ── Staff ─────────────────────────────────────────────────────

export async function listStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter = buildUserFilter(req, ['NURSE', 'RECEPTIONIST', 'STAFF']);
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;

    const staff = await User.find(filter).select('-password').sort({ name: 1 });
    sendSuccess(res, staff, 'Staff retrieved');
  } catch (err) {
    next(err);
  }
}

// Invite any non-doctor staff (nurse, receptionist, etc.)
export async function inviteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, role, hospitalId, departmentId, tenantId, phone } = req.body;

    const validRoles = ['NURSE', 'RECEPTIONIST', 'STAFF', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ForbiddenError(`Invalid role: ${role}`);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('A user with this email already exists');

    const staff = await User.create({
      name,
      email,
      password: 'password123',
      role,
      status: 'Active',
      tenantId: tenantId || req.user?.tenantId,
      hospitalId,
      departmentId,
      phone,
    });

    const { token, hash } = generateInvitationToken(staff._id.toString(), staff.email);

    await Invitation.create({
      tokenHash: hash,
      userId: staff._id,
      email: staff.email,
      role,
      hospitalId,
      departmentId,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    });

    // Determine portal URL based on role
    const portalUrl = ['HOSPITAL_ADMIN', 'DEPT_ADMIN'].includes(role)
      ? env.frontends.hospitalAdmin
      : env.frontends.doctorPortal;

    await sendDoctorInvitationEmail({ to: email, name, invitationToken: token, portalUrl, role });

    // Update department counts
    if (departmentId) {
      if (role === 'NURSE') await Department.findByIdAndUpdate(departmentId, { $inc: { nurseCount: 1 } });
      else await Department.findByIdAndUpdate(departmentId, { $inc: { staffCount: 1 } });
    }

    sendCreated(res, { staff: staff.toJSON(), token }, 'Staff invited successfully');
  } catch (err) {
    next(err);
  }
}
