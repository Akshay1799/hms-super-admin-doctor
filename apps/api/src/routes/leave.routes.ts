import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { applyLeave, approveLeave, rejectLeave, listLeaves } from '../controllers/leave.controller';

const router = Router();
router.use(authenticate);

router.post('/apply', applyLeave);
router.put('/:id/approve', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), approveLeave);
router.put('/:id/reject', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), rejectLeave);
router.get('/', listLeaves);

export default router;
