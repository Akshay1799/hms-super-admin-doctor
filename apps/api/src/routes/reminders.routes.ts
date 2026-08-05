import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  createReminder,
  getReminders,
  cancelReminder,
  retryReminder,
  getPendingReminders
} from '../controllers/reminders.controller';

const router = Router();
router.use(authenticate);

// System/Worker route
router.get('/pending', authorize('SUPER_ADMIN'), getPendingReminders);

// Standard routes for Appointment reminders
const reminderAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST');

router.post('/appointments/:appointmentId', reminderAuth, createReminder);
router.get('/appointments/:appointmentId', reminderAuth, getReminders);
router.delete('/appointments/:appointmentId/:reminderId', reminderAuth, cancelReminder);
router.post('/appointments/:appointmentId/:reminderId/retry', reminderAuth, retryReminder);

export default router;
