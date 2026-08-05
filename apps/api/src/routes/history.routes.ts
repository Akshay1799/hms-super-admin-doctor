import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  getTimeline,
  getVisitHistory,
  getClinicalSummary,
  getMedicationHistory,
  getDiagnosisHistory,
  searchHistory
} from '../controllers/history.controller';

const router = Router();
router.use(authenticate);

// All these endpoints are strictly read-only for clinical staff
const clinicalRoles: any[] = ['DOCTOR', 'NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'];

router.get('/patients/:patientId/timeline', authorize(...clinicalRoles), getTimeline);
router.get('/patients/:patientId/history', authorize(...clinicalRoles), getVisitHistory);
router.get('/patients/:patientId/summary', authorize(...clinicalRoles), getClinicalSummary);
router.get('/patients/:patientId/medications', authorize(...clinicalRoles), getMedicationHistory);
router.get('/patients/:patientId/diagnoses', authorize(...clinicalRoles), getDiagnosisHistory);
router.get('/patients/:patientId/search', authorize(...clinicalRoles), searchHistory);

export default router;
