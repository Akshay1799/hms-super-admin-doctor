import { Router } from 'express';
import {
  getControlledDrugRegister,
  performAudit,
  disposeControlledDrug
} from '../controllers/controlledDrugs.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// ── Controlled Drug Register ────────────────────────────────
// Strict access: Only Pharmacy Managers and Admins can view the compliance register
router.get('/register', authorize('PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), getControlledDrugRegister);

// ── Audits & Adjustments ────────────────────────────────────
// Audits must be performed by authorized personnel
router.post('/audit', authorize('PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), performAudit);

// ── Secure Disposal ─────────────────────────────────────────
// Disposals strictly require Pharmacy Manager level access
router.post('/dispose', authorize('PHARMACY_MANAGER', 'SUPER_ADMIN'), disposeControlledDrug);

export default router;
