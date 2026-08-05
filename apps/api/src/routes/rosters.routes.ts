import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  createShiftTemplate, 
  listShiftTemplates,
  createDutyRoster,
  publishDutyRoster,
  assignShift,
  requestShiftSwap,
  doctorApproveShiftSwap,
  adminExecuteShiftSwap,
  rejectShiftSwap,
  getDoctorSchedule,
  getDepartmentRoster
} from '../controllers/rosters.controller';

const router = Router();
router.use(authenticate);

// Department Admins, Hospital Admins, HR Admin, and Super Admins can configure schedules
const schedulerRoles = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'HR_ADMIN');

// Shift Templates
router.post('/templates', schedulerRoles, createShiftTemplate);
router.get('/templates', listShiftTemplates);

// Duty Rosters
router.post('/', schedulerRoles, createDutyRoster);
router.post('/:id/publish', schedulerRoles, publishDutyRoster);

// Shift Assignments
router.post('/shifts/assign', schedulerRoles, assignShift);

// Shift Swapping
router.post('/shifts/:id/swap-request', authorize('DOCTOR'), requestShiftSwap);
router.post('/shifts/:id/swap-approve', authorize('DOCTOR'), doctorApproveShiftSwap);
router.post('/shifts/:id/swap-execute', schedulerRoles, adminExecuteShiftSwap);
router.post('/shifts/:id/swap-reject', schedulerRoles, rejectShiftSwap);

// Retrieval
router.get('/doctor/:doctorId', getDoctorSchedule);
router.get('/department/:departmentId', getDepartmentRoster);

export default router;
