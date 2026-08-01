import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { depositToWallet, allocateFromWallet, refundBedDeposit } from '../controllers/wallet.controller';

const router = Router();
router.use(authenticate);

const billingAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST');

router.post('/deposit', billingAuth, depositToWallet);
router.post('/allocate', billingAuth, allocateFromWallet);
router.post('/refund-bed-deposit', billingAuth, refundBedDeposit);

export default router;
