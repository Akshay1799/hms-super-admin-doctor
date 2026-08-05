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

const doctorRoles: any[] = ['DOCTOR'];
const readRoles: any[] = ['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'];

// *** CRITICAL: specific routes MUST come before parameterized /:id routes ***

// Patient consultations list - MUST be before /:id to avoid collision
router.get('/patient/:patientId', authorize(...readRoles), getPatientConsultations);

// Authoring routes
router.post('/', authorize(...doctorRoles), createConsultation);
router.put('/:id', authorize(...doctorRoles), updateDraft);
router.post('/:id/finalize', authorize(...doctorRoles), finalizeConsultation);
router.post('/:id/sign', authorize(...doctorRoles), signConsultation);

// Single consultation read - AFTER specific routes
router.get('/:id', authorize(...readRoles), getConsultation);

export default router;
