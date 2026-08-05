import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  generateToken,
  getToken,
  callToken,
  skipToken,
  transferToken,
  getDoctorQueue,
  getDepartmentQueue
} from '../controllers/queues.controller';

const router = Router();
router.use(authenticate);

const queueAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE');

router.post('/tokens', queueAuth, generateToken);
router.get('/tokens/:id', queueAuth, getToken);
router.post('/tokens/:id/call', queueAuth, callToken);
router.post('/tokens/:id/skip', queueAuth, skipToken);
router.post('/tokens/:id/transfer', queueAuth, transferToken);

router.get('/queues/doctor/:doctorId', queueAuth, getDoctorQueue);
router.get('/queues/department/:departmentId', queueAuth, getDepartmentQueue);

export default router;
