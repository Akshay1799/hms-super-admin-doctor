import { Router } from 'express';
import {
  createMedicine,
  searchMedicines,
  createPharmacyLocation,
  requestStockAdjustment,
  approveStockAdjustment,
  getDashboardMetrics
} from '../controllers/pharmacy.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// ── Dashboard ────────────────────────────────────────────────
// Roles: Hospital Admin, Pharmacy Manager, Pharmacist
router.get('/dashboard', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'), getDashboardMetrics);

// ── Pharmacy Locations ───────────────────────────────────────
// Roles: Super Admin, Hospital Admin
router.post('/locations', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), createPharmacyLocation);

// ── Medicine Master ──────────────────────────────────────────
// Roles: Super Admin, Pharmacy Manager
router.post('/medicines', authorize('SUPER_ADMIN', 'PHARMACY_MANAGER'), createMedicine);
// Search is open to any authenticated user in the pharmacy workflow
router.get('/medicines', searchMedicines);

// ── Inventory Adjustments ────────────────────────────────────
// Request: Pharmacist or Manager
router.post('/inventory/adjust', authorize('PHARMACIST', 'PHARMACY_MANAGER'), requestStockAdjustment);
// Approve: Pharmacy Manager or higher
router.post('/inventory/adjust/:id/approve', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER'), approveStockAdjustment);

export default router;
