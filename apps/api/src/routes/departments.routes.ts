import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listDepartments, getDepartment, createDepartment, updateDepartment,
  deleteDepartment, assignDeptAdmin, listDeptStaff,
} from '../controllers/departments.controller';

const router = Router();
router.use(authenticate);

router.get('/', listDepartments);
router.post('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), createDepartment);
router.get('/:id', getDepartment);
router.patch('/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'), updateDepartment);
router.delete('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), deleteDepartment);
router.post('/:id/assign-admin', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), assignDeptAdmin);
router.get('/:id/staff', listDeptStaff);

export default router;
