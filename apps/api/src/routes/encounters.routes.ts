import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  registerOpd,
  registerIpd,
  registerEmergency,
  getEncounter,
  updateEncounter,
  cancelEncounter
} from '../controllers/encounters.controller';

const router = Router();

router.use(authenticate);

router.post('/opd', authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), registerOpd);
router.post('/ipd', authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), registerIpd);
router.post('/emergency', authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'DOCTOR'), registerEmergency);

router.get('/:id', authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'), getEncounter);
router.put('/:id', authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'DOCTOR'), updateEncounter);
router.post('/:id/cancel', authorize('HOSPITAL_ADMIN', 'SUPER_ADMIN'), cancelEncounter);

export default router;
