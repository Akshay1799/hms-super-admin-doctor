import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  getDoctorAvailability, 
  blockTime, 
  unblockTime, 
  getDepartmentAvailability 
} from '../controllers/availability.controller';

const router = Router();
router.use(authenticate);

router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.post('/doctors/:doctorId/block', authorize('DOCTOR', 'DEPT_ADMIN', 'HOSPITAL_ADMIN'), blockTime);
router.delete('/doctors/:doctorId/block/:blockId', authorize('DOCTOR', 'DEPT_ADMIN', 'HOSPITAL_ADMIN'), unblockTime);

router.get('/departments/:departmentId/availability', getDepartmentAvailability);

export default router;
