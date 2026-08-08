import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { 
  getOperationTheatres, 
  getSurgeryRequests, 
  createSurgeryRequest, 
  scheduleSurgery, 
  updateSurgeryStatus, 
  updatePreOpChecklist 
} from '../controllers/ot.controller';

const router = express.Router();

// Require authentication for all OT routes
router.use(authenticate);

// Get all Operation Theatres
router.get('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'), getOperationTheatres);

// Surgery Requests Routes
router.get('/surgeries', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'), getSurgeryRequests);
router.post('/surgeries', authorize('DOCTOR'), createSurgeryRequest);
router.patch('/surgeries/:id/schedule', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), scheduleSurgery);
router.patch('/surgeries/:id/status', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'), updateSurgeryStatus);
router.patch('/surgeries/:id/checklist', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'), updatePreOpChecklist);

export default router;
