import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  getDischargeSummaries, 
  createDischargeSummary, 
  updateDischargeSummary, 
  approveDischargeSummary, 
  clearBilling, 
  publishDischargeSummary 
} from '../controllers/discharge.controller';

const router = express.Router();

// Require authentication for all discharge routes
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'), getDischargeSummaries);
router.post('/', authorize('DOCTOR'), createDischargeSummary);
router.patch('/:id', authorize('DOCTOR'), updateDischargeSummary);
router.post('/:id/approve', authorize('DOCTOR'), approveDischargeSummary);
router.post('/:id/clear-billing', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), clearBilling);
router.post('/:id/publish', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), publishDischargeSummary);

export default router;
