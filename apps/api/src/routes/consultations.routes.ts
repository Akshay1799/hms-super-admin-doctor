import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  createConsultation,
  updateDraft,
  finalizeConsultation,
  signConsultation,
  getConsultation,
  getPatientConsultations
} from '../controllers/consultations.controller';

const router = Router();
router.use(authenticate);

// We are mapping Resident roles to DOCTOR as per user approval for now.
const doctorRoles: any[] = ['DOCTOR'];
const readRoles: any[] = ['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'];

// Authoring routes
router.post('/', authorize(...doctorRoles), createConsultation);
router.put('/:id', authorize(...doctorRoles), updateDraft);
router.post('/:id/finalize', authorize(...doctorRoles), finalizeConsultation);
router.post('/:id/sign', authorize(...doctorRoles), signConsultation);

// Read routes
router.get('/:id', authorize(...readRoles), getConsultation);
router.get('/patient/:patientId', authorize(...readRoles), getPatientConsultations);

export default router;
