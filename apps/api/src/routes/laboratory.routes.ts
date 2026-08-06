import { Router } from 'express';
import {
  createOrder,
  getOrder,
  updateOrder,
  cancelOrder,
  searchOrders,
  getTestCatalog,
  createSpecimen,
  collectSpecimen,
  receiveSpecimen,
  rejectSpecimen,
  recollectSpecimen,
  getSpecimen,
  searchSpecimens,
  getPackages,
  getBillingStatus,
  validateBilling,
  enterResult,
  generateReport,
  getReport,
  downloadReportPdf,
  getReportVersions,
  createReferenceRange,
  getReferenceRanges,
  submitReportForReview,
  approveReport,
  rejectReport,
  publishReport,
  deliverReport,
  resendReport,
  getDeliveryStatus,
  getAccessHistory
} from '../controllers/laboratory.controller';
import { authorize } from '../middleware/authorize';

const router = Router();

// Test Catalog & Packages
router.get('/test-catalog', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getTestCatalog);
router.get('/packages', authorize('DOCTOR', 'RECEPTIONIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getPackages);

// Laboratory Orders
router.post('/orders', authorize('DOCTOR'), createOrder);
router.get('/orders', authorize('DOCTOR', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'RECEPTIONIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), searchOrders);
router.get('/orders/:orderId', authorize('DOCTOR', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'RECEPTIONIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getOrder);
router.patch('/orders/:orderId', authorize('DOCTOR'), updateOrder);
router.post('/orders/:orderId/cancel', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), cancelOrder);

// Billing Validation
router.get('/orders/:orderId/billing-status', authorize('RECEPTIONIST', 'BILLING_EXECUTIVE', 'LAB_TECHNICIAN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getBillingStatus);
router.post('/orders/:orderId/billing-validation', authorize('RECEPTIONIST', 'BILLING_EXECUTIVE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), validateBilling);

// Specimen Management
router.post('/specimens', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), createSpecimen);
router.post('/specimens/:id/collect', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), collectSpecimen);
router.post('/specimens/:id/receive', authorize('LAB_TECHNICIAN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), receiveSpecimen);
router.post('/specimens/:id/reject', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), rejectSpecimen);
router.post('/specimens/:id/recollect', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), recollectSpecimen);
router.get('/specimens/:id', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getSpecimen);
router.get('/specimens', authorize('LAB_TECHNICIAN', 'NURSE', 'DOCTOR', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), searchSpecimens);

// Results & Reporting
router.post('/results', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), enterResult);
router.post('/reports/generate', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), generateReport);
router.get('/reports/:reportId', authorize('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getReport);
router.get('/reports/:reportId/pdf', authorize('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), downloadReportPdf);
router.get('/reports/:reportId/versions', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getReportVersions);

// Reference Ranges
router.post('/reference-ranges', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), createReferenceRange);
router.get('/reference-ranges', authorize('DOCTOR', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getReferenceRanges);

// Report Approval Workflow
router.post('/reports/:reportId/submit', authorize('LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), submitReportForReview);
router.post('/reports/:reportId/approve', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), approveReport);
router.post('/reports/:reportId/reject', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), rejectReport);
router.post('/reports/:reportId/publish', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), publishReport);

// Report Delivery (Feature 7)
router.post('/reports/:reportId/deliver', authorize('RECEPTIONIST', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), deliverReport);
router.post('/reports/:deliveryId/resend', authorize('RECEPTIONIST', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), resendReport);
router.get('/reports/:reportId/delivery-status', authorize('RECEPTIONIST', 'LAB_TECHNICIAN', 'PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getDeliveryStatus);
router.get('/reports/:reportId/access-history', authorize('PATHOLOGIST', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), getAccessHistory);

export default router;
