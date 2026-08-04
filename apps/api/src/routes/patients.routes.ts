import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listPatients,
  getPatientProfileMe,
  getPatient,
  registerNewPatient,
  registerReturningPatient,
  searchPatients,
  updatePatient,
  deletePatient,
  addVitals,
  addSoapNote,
  addDiagnosis,
  addMedication,
  addLabOrder,
} from '../controllers/patients.controller';

const router = Router();
router.use(authenticate);

// Clinical roles can perform all operations
const clinicalAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'DOCTOR');

router.get('/profile/me', getPatientProfileMe);
router.get('/', listPatients);
router.get('/:id', getPatient);
router.post('/register', clinicalAuth, registerNewPatient);
router.post('/register-returning', clinicalAuth, registerReturningPatient);
router.post('/search', clinicalAuth, searchPatients);
router.patch('/:id', clinicalAuth, updatePatient);
router.delete('/:id', clinicalAuth, deletePatient);

// EMR additions (scoped to clinical staff)
router.post('/:id/vitals', clinicalAuth, addVitals);
router.post('/:id/soap-notes', clinicalAuth, addSoapNote);
router.post('/:id/diagnoses', clinicalAuth, addDiagnosis);
router.post('/:id/medications', clinicalAuth, addMedication);
router.post('/:id/scans', clinicalAuth, addLabOrder);

export default router;
