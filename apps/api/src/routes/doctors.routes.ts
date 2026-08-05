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
  createDoctorProfile,
  getEnterpriseDoctorProfile,
  updateEnterpriseDoctorProfile,
  addQualification,
  addSpecialization,
  addExperience,
  addRegistration,
  updateProfileStatus,
  assignClinicalPrivileges,
  addProfessionalMembership,
  getLicensesExpiringSoon,
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

// Enterprise Doctor Profile Routes (Feature 1)
router.post('/profile', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN'), createDoctorProfile);
router.get('/profile/:id', getEnterpriseDoctorProfile);
router.put('/profile/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DOCTOR'), updateEnterpriseDoctorProfile);
router.post('/profile/:id/qualification', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), addQualification);
router.post('/profile/:id/specialization', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), addSpecialization);
router.post('/profile/:id/experience', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), addExperience);
router.post('/profile/:id/registration', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN'), addRegistration);
router.put('/profile/:id/status', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), updateProfileStatus);
router.put('/profile/:id/privileges', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), assignClinicalPrivileges);
router.post('/profile/:id/membership', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN', 'DEPT_ADMIN'), addProfessionalMembership);

// License Expiry Monitoring
router.get('/licenses/expiring', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_ADMIN'), getLicensesExpiringSoon);

export default router;
