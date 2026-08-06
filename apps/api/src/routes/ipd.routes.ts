import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createIPDBill, runDailyAccrual } from '../controllers/ipd.controller';
import {
  createAdmission,
  allocateBed,
  reserveBed,
  releaseBed,
  getAvailableBeds,
  getOccupancyStatus
} from '../controllers/ipd-bed-allocation.controller';

const router = Router();
router.use(authenticate);

const billingAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST');

router.post('/bills', billingAuth, createIPDBill);
router.post('/accrual', billingAuth, runDailyAccrual);

// --- Admission Routes ---
router.post(
  '/admissions',
  authorize('DOCTOR', 'RECEPTIONIST', 'WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  createAdmission
);

// --- Bed Allocation Routes ---
router.post(
  '/bed-allocations',
  authorize('RECEPTIONIST', 'WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  allocateBed
);

router.post(
  '/bed-allocations/reserve',
  authorize('RECEPTIONIST', 'WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  reserveBed
);

router.post(
  '/bed-allocations/:allocationId/release',
  authorize('WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  releaseBed
);

// --- Bed Search & Occupancy ---
router.get(
  '/beds',
  authorize('DOCTOR', 'NURSE', 'RECEPTIONIST', 'WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getAvailableBeds
);

router.get(
  '/occupancy',
  authorize('WARD_INCHARGE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getOccupancyStatus
);

export default router;
