import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  createTreatmentOrder, 
  getTreatmentOrders, 
  recordMedicationAdministration, 
  getMedicationAdministrations 
} from '../controllers/ipdTreatment.controller';

const router = express.Router();

// All IPD Treatment routes require authentication
router.use(authenticate);

// Doctors can create treatment orders
router.post('/patients/:patientId/orders', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), createTreatmentOrder);

// Clinical staff can view treatment orders
router.get('/patients/:patientId/orders', authorize('DOCTOR', 'NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getTreatmentOrders);

// Nurses can record administration (MAR)
router.post('/orders/:orderId/administer', authorize('NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), recordMedicationAdministration);

// Clinical staff can view MAR
router.get('/patients/:patientId/mar', authorize('DOCTOR', 'NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getMedicationAdministrations);

export default router;
