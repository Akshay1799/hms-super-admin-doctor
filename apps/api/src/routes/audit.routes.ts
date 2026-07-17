import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { listAuditLogs, getAuditStats } from '../controllers/audit.controller';

const router = Router();
router.use(authenticate);

// Restricted to admins
router.get('/', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), listAuditLogs);
router.get('/stats', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'), getAuditStats);

export default router;
