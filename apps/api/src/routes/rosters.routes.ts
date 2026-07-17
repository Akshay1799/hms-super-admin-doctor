import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { listRosters, upsertRoster } from '../controllers/rosters.controller';

const router = Router();
router.use(authenticate);

// Department Admins, Hospital Admins, and Super Admins can configure schedules
const schedulerRoles = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN');

router.get('/', listRosters);
router.post('/', schedulerRoles, upsertRoster);

export default router;
