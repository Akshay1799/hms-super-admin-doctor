import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  getSuperAdminDashboard,
  getHospitalDashboard,
  getDoctorDashboard,
} from '../controllers/dashboard.controller';

const router = Router();
router.use(authenticate);

router.get('/super-admin', authorize('SUPER_ADMIN'), getSuperAdminDashboard);
router.get('/hospital-admin', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), getHospitalDashboard);
router.get('/doctor', authorize('SUPER_ADMIN', 'DOCTOR'), getDoctorDashboard);

export default router;
