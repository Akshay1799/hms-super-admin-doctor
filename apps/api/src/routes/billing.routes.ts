import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  cancelInvoice,
  payInvoice,
  getRevenueSummary,
  listPayments,
  createPayment,
} from '../controllers/billing.controller';

const router = Router();
router.use(authenticate);

const billingAuth = authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST');

// Invoices
router.get('/invoices', listInvoices);
router.get('/invoices/revenue-summary', getRevenueSummary);
router.get('/invoices/:id', getInvoice);
router.post('/invoices', billingAuth, createInvoice);
router.patch('/invoices/:id', billingAuth, updateInvoice);
router.post('/invoices/:id/cancel', billingAuth, cancelInvoice);
router.post('/invoices/:id/pay', payInvoice);

// Payments
router.get('/payments', listPayments);
router.post('/payments', billingAuth, createPayment);

export default router;
