import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listHospitals, getHospital, createHospital, updateHospital,
  deleteHospital, listHospitalDepartments, getHospitalStats,
} from '../controllers/hospitals.controller';

const router = Router();
router.use(authenticate);

router.get('/', listHospitals);
router.post('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN'), createHospital);
router.get('/:id', getHospital);
router.patch('/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), updateHospital);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteHospital);
router.get('/:id/departments', listHospitalDepartments);
router.get('/:id/stats', getHospitalStats);

export default router;
