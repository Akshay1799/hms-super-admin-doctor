import { Router } from 'express';
import {
  createSupplier,
  getSuppliers,
  createRequisition,
  approveRequisition,
  createPurchaseOrder,
  approvePurchaseOrder,
  submitGRN
} from '../controllers/procurement.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// ── Suppliers ───────────────────────────────────────────────
// Roles: Super Admin, Hospital Admin, Pharmacy Manager
router.post('/suppliers', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER'), createSupplier);
router.get('/suppliers', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'), getSuppliers);

// ── Purchase Requisitions ───────────────────────────────────
// Request: Pharmacist or Manager
router.post('/requisitions', authorize('PHARMACIST', 'PHARMACY_MANAGER'), createRequisition);
// Approve PR: Pharmacy Manager or Admin
router.post('/requisitions/:id/approve', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER'), approveRequisition);

// ── Purchase Orders ─────────────────────────────────────────
// Create PO: Pharmacy Manager
router.post('/purchase-orders', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER'), createPurchaseOrder);
// Approve PO: Hospital Admin or Super Admin (High value approvals usually)
router.post('/purchase-orders/:id/approve', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), approvePurchaseOrder);

// ── Goods Receipt Note (GRN) ────────────────────────────────
// Submit GRN: Pharmacist or Manager
router.post('/grn', authorize('PHARMACY_MANAGER', 'PHARMACIST', 'SUPER_ADMIN'), submitGRN);

export default router;
