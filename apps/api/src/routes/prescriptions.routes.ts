import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  createPrescription,
  updatePrescription,
  signPrescription,
  cancelPrescription,
  getPatientPrescriptions,
} from '../controllers/prescriptions.controller';

const router = Router();
router.use(authenticate);

// Prescription Authoring (Doctors only)
router.post('/', authorize('DOCTOR'), createPrescription);
router.put('/:id', authorize('DOCTOR'), updatePrescription);
router.post('/:id/sign', authorize('DOCTOR'), signPrescription);
router.post('/:id/cancel', authorize('DOCTOR'), cancelPrescription);

// Retrieving Prescriptions
// Anyone with clinical access can view prescriptions
router.get('/patient/:patientId', authorize('DOCTOR', 'NURSE', 'PHARMACIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getPatientPrescriptions);

export default router;
