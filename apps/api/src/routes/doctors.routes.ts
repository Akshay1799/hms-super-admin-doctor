import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  createPrescription,
  listPrescriptions,
  getPrescription,
  assignDoctorVisit,
  getDoctorPatientHistory,
} from '../controllers/doctors.controller';

const router = Router();
router.use(authenticate);

// Public clinical routes
router.get('/', listDoctors);
router.get('/:id', getDoctorProfile);
router.patch('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR'), updateDoctorProfile);

// E-Prescription & Consultation Notes
router.post('/prescriptions', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'), createPrescription);
router.get('/prescriptions/list', listPrescriptions);
router.get('/prescriptions/:id', getPrescription);

// OPD/IPD Visit Assignment & Patient History
router.post('/assign-visit', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR'), assignDoctorVisit);
router.get('/:doctorId/history', getDoctorPatientHistory);

export default router;
