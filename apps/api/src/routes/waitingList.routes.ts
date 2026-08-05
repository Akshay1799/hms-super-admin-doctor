import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  joinWaitingList,
  getWaitingListEntry,
  searchWaitingList,
  acceptOffer,
  rejectOffer,
  removeEntry
} from '../controllers/waitingList.controller';

const router = Router();
router.use(authenticate);

const wlAuth = authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN', 'RECEPTIONIST', 'PATIENT');

router.post('/', wlAuth, joinWaitingList);
router.get('/search', wlAuth, searchWaitingList);
router.get('/:id', wlAuth, getWaitingListEntry);
router.post('/:id/accept', wlAuth, acceptOffer);
router.post('/:id/reject', wlAuth, rejectOffer);
router.delete('/:id', wlAuth, removeEntry);

export default router;
