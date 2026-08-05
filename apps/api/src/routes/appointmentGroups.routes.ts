import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  createGroupAppointment,
  getGroupAppointment,
  rescheduleGroup,
  cancelGroup
} from '../controllers/appointmentGroups.controller';

const router = Router();
router.use(authenticate);

const groupAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST');

router.post('/', groupAuth, createGroupAppointment);
router.get('/:id', groupAuth, getGroupAppointment);
router.post('/:id/reschedule', groupAuth, rescheduleGroup);
router.post('/:id/cancel', groupAuth, cancelGroup);

export default router;
