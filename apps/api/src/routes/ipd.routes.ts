import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { createIPDBill, runDailyAccrual } from '../controllers/ipd.controller';

const router = Router();
router.use(authenticate);

const billingAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST');

router.post('/bills', billingAuth, createIPDBill);
router.post('/accrual', billingAuth, runDailyAccrual);

export default router;
