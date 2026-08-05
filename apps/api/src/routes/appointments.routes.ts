import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  reserveSlot,
  releaseSlot,
  confirmBooking,
  updateAppointment,
  checkInAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorSchedule,
  getPatientAppointments,
  bulkCancelAppointments,
  getAppointmentHistory,
  getCancellationReasons,
  getReschedulePolicies,
  getPendingReferrals,
  getAvailableDepartments
} from '../controllers/appointments.controller';

const router = Router();
router.use(authenticate);

// Receptionists, doctors, and admins can handle appointments
const scheduleAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR', 'RECEPTIONIST');

router.get('/', listAppointments);
router.get('/search', listAppointments); // Uses q param for text search

router.get('/referrals/pending', scheduleAuth, getPendingReferrals);
router.get('/departments/available', scheduleAuth, getAvailableDepartments);

router.get('/config/cancellation-reasons', scheduleAuth, getCancellationReasons);
router.get('/config/reschedule-policies', scheduleAuth, getReschedulePolicies);
router.post('/bulk-cancel', scheduleAuth, bulkCancelAppointments);
router.get('/:id', getAppointment);
router.get('/:id/history', scheduleAuth, getAppointmentHistory);
router.post('/', scheduleAuth, createAppointment);
router.post('/reserve-slot', scheduleAuth, reserveSlot);
router.delete('/release-slot/:id', scheduleAuth, releaseSlot);
router.post('/:id/confirm', scheduleAuth, confirmBooking);
router.patch('/:id', scheduleAuth, updateAppointment);
router.post('/:id/check-in', scheduleAuth, checkInAppointment);
router.post('/:id/cancel', scheduleAuth, cancelAppointment);
router.post('/:id/reschedule', scheduleAuth, rescheduleAppointment);
router.get('/doctor/:doctorId', scheduleAuth, getDoctorSchedule);
router.get('/patient/:patientId', scheduleAuth, getPatientAppointments);

export default router;
