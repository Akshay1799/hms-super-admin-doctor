import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { searchDrugs } from '../controllers/drugs.controller';

const router = Router();
router.use(authenticate);

// Allow any clinical or pharmacy staff to search the drug database
router.get('/search', authorize('DOCTOR', 'NURSE', 'PHARMACIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), searchDrugs);

export default router;
