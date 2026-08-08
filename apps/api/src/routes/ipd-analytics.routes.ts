import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  getKpis, 
  getBedOccupancy, 
  getDoctorDashboard, 
  getNurseDashboard 
} from '../controllers/ipd-analytics.controller';

const router = express.Router();

router.use(authenticate);

// Admin/Executive routes
router.get('/kpis', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), getKpis);
router.get('/bed-occupancy', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), getBedOccupancy);

// Role-specific dashboard routes
router.get('/doctor-dashboard', authorize('DOCTOR'), getDoctorDashboard);
router.get('/nurse-dashboard', authorize('NURSE'), getNurseDashboard);

export default router;
