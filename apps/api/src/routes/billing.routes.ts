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
  refundPayment,
  createCreditNote,
  openShift,
  closeShift,
  closeDailyLedger,
  closeFinancialYear,
  reconcilePayment
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

// Credit Notes
router.post('/credit-notes', billingAuth, createCreditNote);

// Payments
router.get('/payments', listPayments);
router.post('/payments', billingAuth, createPayment);
router.post('/payments/:id/refund', billingAuth, refundPayment);
router.post('/payments/:id/reconcile', billingAuth, reconcilePayment);

// Shifts
router.post('/shifts/open', billingAuth, openShift);
router.post('/shifts/:id/close', billingAuth, closeShift);

// Ledger
router.post('/ledger/close-daily', billingAuth, closeDailyLedger);
router.post('/ledger/close-fy', billingAuth, closeFinancialYear);

export default router;
