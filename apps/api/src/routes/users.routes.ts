import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  updateProfile,
  changePassword,
  listDoctors,
  getDoctor,
  inviteDoctor,
  updateDoctor,
  deleteDoctor,
  listNurses,
  listStaff,
  inviteStaff,
} from '../controllers/users.controller';

const router = Router();
router.use(authenticate);

// Profile
router.patch('/profile', updateProfile);
router.post('/change-password', changePassword);

// Generic Users / IAM
router.get('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), listUsers);
router.get('/info/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), getUser);
router.patch('/info/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), updateUser);
router.delete('/info/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), deleteUser);
router.patch('/info/:id/suspend', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), suspendUser);
router.patch('/info/:id/activate', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), activateUser);

// Doctors
router.get('/doctors', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST'), listDoctors);
router.post('/doctors/invite', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), inviteDoctor);
router.get('/doctors/:id', getDoctor);
router.patch('/doctors/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'), updateDoctor);
router.delete('/doctors/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), deleteDoctor);

// Nurses & Staff
router.get('/nurses', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST'), listNurses);
router.get('/staff', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST'), listStaff);
router.post('/staff/invite', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), inviteStaff);

export default router;
