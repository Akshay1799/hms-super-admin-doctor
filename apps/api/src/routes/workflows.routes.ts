import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { requestFinancialAdjustment, approveFinancialRequest } from '../controllers/workflows.controller';

const router = Router();
router.use(authenticate);

const requestAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST');
const approvalAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN');

router.post('/requests', requestAuth, requestFinancialAdjustment);
router.post('/requests/:id/approve', approvalAuth, approveFinancialRequest);

export default router;
