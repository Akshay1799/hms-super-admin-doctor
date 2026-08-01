import { Router } from 'express';
import {
  createPrescription,
  createSale,
  confirmDispense,
  requestPatientReturn,
  approvePatientReturn,
  reportDamageDisposal,
  cancelSale,
  getPOSDashboard,
  searchPOS,
  exportDailySales
} from '../controllers/pharmacyPOS.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// ── Dashboard & Analytics ───────────────────────────────────
router.get('/dashboard', authorize('PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), getPOSDashboard);
router.get('/search', authorize('PHARMACIST', 'PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), searchPOS);
router.get('/reports/daily-sales', authorize('PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), exportDailySales);

// ── Prescriptions ───────────────────────────────────────────
// Usually created by DOCTOR from EMR, but mocking here for Pharmacy scope
router.post('/prescriptions', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), createPrescription);

// ── POS Sales & Dispensing ──────────────────────────────────
router.post('/sales', authorize('PHARMACIST', 'PHARMACY_MANAGER', 'SUPER_ADMIN'), createSale);
router.post('/sales/:id/dispense', authorize('PHARMACIST', 'PHARMACY_MANAGER', 'SUPER_ADMIN'), confirmDispense);
router.post('/sales/:id/cancel', authorize('PHARMACY_MANAGER', 'SUPER_ADMIN'), cancelSale);

// ── Returns ─────────────────────────────────────────────────
router.post('/returns', authorize('PHARMACIST', 'PHARMACY_MANAGER'), requestPatientReturn);
router.post('/returns/:id/approve', authorize('PHARMACY_MANAGER', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), approvePatientReturn);

// ── Damages & Disposal ──────────────────────────────────────
router.post('/damages', authorize('PHARMACIST', 'PHARMACY_MANAGER'), reportDamageDisposal);

export default router;
