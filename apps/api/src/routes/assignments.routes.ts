import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  assignDoctor, 
  updateAssignment, 
  transferAssignment, 
  acceptAssignment, 
  rejectAssignment,
  completeAssignment, 
  getAssignedPatients,
  getEncounterAssignments
} from '../controllers/assignments.controller';

const router = Router();
router.use(authenticate);

// Receptionist, Dept Admin, Hospital Admin, Super Admin can assign/update/transfer
const assignmentStaff: any[] = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST'];

router.post('/', authorize(...assignmentStaff), assignDoctor);
router.put('/:id', authorize(...assignmentStaff), updateAssignment);
router.post('/:id/transfer', authorize(...assignmentStaff), transferAssignment);

// Doctors handle accept, reject and complete
router.post('/:id/accept', authorize('DOCTOR'), acceptAssignment);
router.post('/:id/reject', authorize('DOCTOR'), rejectAssignment);
router.post('/:id/complete', authorize('DOCTOR'), completeAssignment);

// Queries
router.get('/doctors/:doctorId/patients', getAssignedPatients);
router.get('/encounter/:encounterId', authorize(...assignmentStaff), getEncounterAssignments);

export default router;
