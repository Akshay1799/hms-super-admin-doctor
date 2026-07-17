import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listTenants, getTenant, createTenant, updateTenant,
  deleteTenant, updateFeatureFlags, updateQuotas,
} from '../controllers/tenants.controller';

const router = Router();
router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/', listTenants);
router.post('/', createTenant);
router.get('/:id', getTenant);
router.patch('/:id', updateTenant);
router.delete('/:id', deleteTenant);
router.patch('/:id/feature-flags', updateFeatureFlags);
router.patch('/:id/quotas', updateQuotas);

export default router;
