import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { getCheckoutPreview, createCheckoutInvoice } from '../controllers/checkout.controller';

const router = Router();
router.use(authenticate);

const billerRoles = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST');

router.get('/preview/:patientId', billerRoles, getCheckoutPreview);
router.post('/invoice', billerRoles, createCheckoutInvoice);

export default router;
