import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { submitClaim, updateClaimStatus } from '../controllers/tpa.controller';

const router = Router();
router.use(authenticate);

const billingAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN');

router.post('/claims', billingAuth, submitClaim);
router.patch('/claims/:id', billingAuth, updateClaimStatus);

export default router;
