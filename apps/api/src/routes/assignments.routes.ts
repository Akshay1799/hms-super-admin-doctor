import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  assignDoctor, 
  updateAssignment, 
  transferAssignment, 
  acceptAssignment, 
  completeAssignment, 
  getAssignedPatients 
} from '../controllers/assignments.controller';

const router = Router();
router.use(authenticate);

// Receptionist, Dept Admin, Hospital Admin, Super Admin can assign/update/transfer
const assignmentStaff = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST');

router.post('/', assignmentStaff, assignDoctor);
router.put('/:id', assignmentStaff, updateAssignment);
router.post('/:id/transfer', assignmentStaff, transferAssignment);

// Doctors handle accept and complete
router.post('/:id/accept', authorize('DOCTOR'), acceptAssignment);
router.post('/:id/complete', authorize('DOCTOR'), completeAssignment);

router.get('/doctors/:doctorId/patients', getAssignedPatients);

export default router;
