import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  getImagingCatalog,
  createRadiologyOrder,
  getRadiologyOrder,
  updateRadiologyOrder,
  cancelRadiologyOrder,
  searchRadiologyOrders
} from '../controllers/radiology.controller';

import {
  createSchedule,
  getSchedules,
  updateSchedule,
  cancelSchedule,
  getMachineAvailability,
  getStaffAvailability
} from '../controllers/radiology-scheduling.controller';

import {
  uploadStudy,
  getStudy,
  searchStudies,
  launchViewer,
  getStudyMetadata
} from '../controllers/pacs.controller';

import {
  createReport,
  updateReport,
  getReport,
  submitReport,
  getReportVersions,
  getTemplates
} from '../controllers/radiology-report.controller';

import {
  deliverReport,
  resendReport,
  getDeliveryStatus,
  downloadReport,
  downloadStudy,
  getAccessHistory
} from '../controllers/radiology-delivery.controller';

const router = Router();

// Require authentication for all radiology routes
router.use(authenticate);

// Get the imaging catalog (Available to all authorized clinical and administrative roles)
router.get(
  '/imaging-catalog',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getImagingCatalog
);

// Create a new radiology order (Only doctors)
router.post(
  '/orders',
  authorize('DOCTOR'),
  createRadiologyOrder
);

// Search/list radiology orders
router.get(
  '/orders',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  searchRadiologyOrders
);

// Get a specific radiology order
router.get(
  '/orders/:orderId',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getRadiologyOrder
);

// Update a radiology order (Only doctors, before scheduling)
router.patch(
  '/orders/:orderId',
  authorize('DOCTOR'),
  updateRadiologyOrder
);

// Cancel a radiology order (Only doctors)
router.post(
  '/orders/:orderId/cancel',
  authorize('DOCTOR'),
  cancelRadiologyOrder
);

// --- Scheduling Routes ---

// Get machine availability (Receptionist, Technician, Admin)
router.get(
  '/machines/availability',
  authorize('RECEPTIONIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getMachineAvailability
);

// Get staff availability (Receptionist, Admin)
router.get(
  '/staff/availability',
  authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getStaffAvailability
);

// Create a schedule (Receptionist, Technician, Admin)
router.post(
  '/schedules',
  authorize('RECEPTIONIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  createSchedule
);

// Get schedules (Doctor, Radiologist, Technician, Receptionist, Admin)
router.get(
  '/schedules',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getSchedules
);

// Update schedule (Receptionist, Technician, Admin)
router.patch(
  '/schedules/:scheduleId',
  authorize('RECEPTIONIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  updateSchedule
);

// Cancel schedule (Receptionist, Admin)
router.post(
  '/schedules/:scheduleId/cancel',
  authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  cancelSchedule
);

// --- PACS Integration Routes ---

// Register uploaded study (Technician)
router.post(
  '/studies/upload',
  authorize('RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  uploadStudy
);

// Search studies (Doctor, Radiologist, Technician)
router.get(
  '/studies',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  searchStudies
);

// Retrieve study details (Doctor, Radiologist, Technician)
router.get(
  '/studies/:studyId',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getStudy
);

// Launch image viewer (Doctor, Radiologist, Technician)
router.get(
  '/studies/:studyId/viewer',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  launchViewer
);

// Retrieve study metadata (Doctor, Radiologist, Technician)
router.get(
  '/studies/:studyId/metadata',
  authorize('DOCTOR', 'RADIOLOGIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getStudyMetadata
);

// --- Radiology Reporting Routes ---

// Get report templates (Radiologist)
router.get(
  '/reports/templates',
  authorize('RADIOLOGIST', 'SUPER_ADMIN'),
  getTemplates
);

// Create a report draft (Radiologist)
router.post(
  '/reports',
  authorize('RADIOLOGIST', 'SUPER_ADMIN'),
  createReport
);

// Update a report draft (Radiologist)
router.patch(
  '/reports/:reportId',
  authorize('RADIOLOGIST', 'SUPER_ADMIN'),
  updateReport
);

// Retrieve a report (Doctor, Radiologist)
router.get(
  '/reports/:reportId',
  authorize('DOCTOR', 'RADIOLOGIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getReport
);

// Submit/Approve/Amend a report (Radiologist, Senior Radiologist)
router.post(
  '/reports/:reportId/submit',
  authorize('RADIOLOGIST', 'SUPER_ADMIN'),
  submitReport
);

// Retrieve report versions (Doctor, Radiologist)
router.get(
  '/reports/:reportId/versions',
  authorize('DOCTOR', 'RADIOLOGIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getReportVersions
);

// --- Radiology Delivery Routes ---

// Deliver Report (Receptionist, Technician, Admin)
router.post(
  '/reports/:reportId/deliver',
  authorize('RECEPTIONIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  deliverReport
);

// Resend Report (Receptionist, Technician, Admin)
router.post(
  '/reports/:reportId/resend',
  authorize('RECEPTIONIST', 'RADIOLOGY_TECHNICIAN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  resendReport
);

// Get Delivery Status (Receptionist, Admin)
router.get(
  '/reports/:reportId/delivery-status',
  authorize('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getDeliveryStatus
);

// Download Report (Patient, Doctor, Admin)
router.get(
  '/reports/:reportId/download',
  authorize('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  downloadReport
);

// Download Study / Export DICOM ref (Patient, Doctor, Admin)
router.get(
  '/studies/:studyId/download',
  authorize('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  downloadStudy
);

// Get Access History (Admin, Doctor)
router.get(
  '/reports/:reportId/access-history',
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  getAccessHistory
);

export default router;
