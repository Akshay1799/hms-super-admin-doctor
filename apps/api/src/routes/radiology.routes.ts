import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  getImagingCatalog,
  createRadiologyOrder,
  getRadiologyOrder,
  updateRadiologyOrder,
  cancelRadiologyOrder,
  searchRadiologyOrders
} from '../controllers/radiology.controller';

const router = Router();

// Require authentication for all radiology routes
router.use(authenticate);

// Get the imaging catalog (Available to all authorized clinical and administrative roles)
router.get(
  '/imaging-catalog',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getImagingCatalog
);

// Create a new radiology order (Only doctors)
router.post(
  '/orders',
  authorize('DOCTOR'),
  createRadiologyOrder
);

// Search/list radiology orders
router.get(
  '/orders',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  searchRadiologyOrders
);

// Get a specific radiology order
router.get(
  '/orders/:orderId',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getRadiologyOrder
);

// Update a radiology order (Only doctors, before scheduling)
router.patch(
  '/orders/:orderId',
  authorize('DOCTOR'),
  updateRadiologyOrder
);

// Cancel a radiology order (Only doctors)
router.post(
  '/orders/:orderId/cancel',
  authorize('DOCTOR'),
  cancelRadiologyOrder
);

export default router;
