import { Router } from 'express';
import {
  createOrder,
  getOrder,
  updateOrder,
  cancelOrder,
  searchOrders,
  getTestCatalog,
  createSpecimen,
  collectSpecimen,
  receiveSpecimen,
  rejectSpecimen,
  recollectSpecimen,
  getSpecimen,
  searchSpecimens
} from '../controllers/laboratory.controller';
import { authorize } from '../middleware/authorize';

const router = Router();

// Test Catalog
router.get('/test-catalog', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getTestCatalog);

// Laboratory Orders
router.post('/orders', authorize('DOCTOR'), createOrder);
router.get('/orders', authorize('DOCTOR', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'RECEPTIONIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), searchOrders);
router.get('/orders/:orderId', authorize('DOCTOR', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'RECEPTIONIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getOrder);
router.patch('/orders/:orderId', authorize('DOCTOR'), updateOrder);
router.post('/orders/:orderId/cancel', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), cancelOrder);

// Specimen Management
router.post('/specimens', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), createSpecimen);
router.post('/specimens/:id/collect', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), collectSpecimen);
router.post('/specimens/:id/receive', authorize('LAB_TECHNICIAN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), receiveSpecimen);
router.post('/specimens/:id/reject', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), rejectSpecimen);
router.post('/specimens/:id/recollect', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), recollectSpecimen);
router.get('/specimens/:id', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getSpecimen);
router.get('/specimens', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), searchSpecimens);

export default router;
