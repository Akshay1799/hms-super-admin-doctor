import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  checkInAppointment,
  cancelAppointment,
} from '../controllers/appointments.controller';

const router = Router();
router.use(authenticate);

// Receptionists, doctors, and admins can handle appointments
const scheduleAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR', 'RECEPTIONIST');

router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', scheduleAuth, createAppointment);
router.patch('/:id', scheduleAuth, updateAppointment);
router.post('/:id/check-in', scheduleAuth, checkInAppointment);
router.post('/:id/cancel', scheduleAuth, cancelAppointment);

export default router;
