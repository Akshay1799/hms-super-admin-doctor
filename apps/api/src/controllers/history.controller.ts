import { Request, Response, NextFunction } from 'express';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { Patient } from '../models/Patient';
import { ConsultationNote } from '../models/ConsultationNote';
import { sendSuccess, NotFoundError } from '../utils/response';

/**
 * Helper to fetch recent records within a 90-day timeframe as approved by user.
 */
function getRecentDateFilter() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date;
}

export async function getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    const tenantId = req.user!.tenantId;
    const { dateFrom, dateTo, type, doctorId } = req.query;

    const dateFilter: Record<string, any> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
    if (dateTo) dateFilter.$lte = new Date(dateTo as string);
    const createdAtFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Fetch encounters, prescriptions, and consultation notes
    const [encounters, prescriptions, consultationNotes] = await Promise.all([
      Encounter.find({ patientId, tenantId, ...createdAtFilter })
        .select('type status chiefComplaint doctorId createdAt updatedAt')
        .lean(),
      Prescription.find({ patientId, tenantId, ...createdAtFilter })
        .select('visitType status diagnoses medicines doctorId doctorName createdAt updatedAt')
        .lean(),
      ConsultationNote.find({ 
        patientId, 
        tenantId, 
        status: { $in: ['Finalized', 'Signed', 'Archived'] },
        ...createdAtFilter
      })
        .select('chiefComplaint assessment diagnoses status doctorId finalizedAt createdAt updatedAt')
        .lean()
    ]);

    // Map into unified timeline events
    let timeline = [
      ...encounters.map(e => ({
        type: 'Encounter',
        date: e.createdAt,
        doctorId: e.doctorId,
        data: e
      })),
      ...prescriptions.map(p => ({
        type: 'Prescription',
        date: p.createdAt,
        doctorId: p.doctorId,
        data: p
      })),
      ...consultationNotes.map(c => ({
        type: 'ConsultationNote',
        date: c.createdAt,
        doctorId: c.doctorId,
        data: c
      }))
    ];

    // Filter by type if requested
    if (type) {
      timeline = timeline.filter(e => e.type === type);
    }

    // Filter by doctor if requested
    if (doctorId) {
      timeline = timeline.filter(e => e.doctorId?.toString() === doctorId);
    }

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sendSuccess(res, timeline, 'Patient timeline retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function searchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    const tenantId = req.user!.tenantId;
    const { q } = req.query;

    if (!q) {
      sendSuccess(res, [], 'No search query provided');
      return;
    }

    const regex = { $regex: q as string, $options: 'i' };

    const [prescriptions, consultationNotes] = await Promise.all([
      Prescription.find({ patientId, tenantId, $or: [{ doctorName: regex }, { 'diagnoses.description': regex }] })
        .select('visitType status diagnoses medicines doctorName createdAt')
        .lean(),
      ConsultationNote.find({ 
        patientId, 
        tenantId, 
        status: { $in: ['Finalized', 'Signed', 'Archived'] },
        $or: [{ chiefComplaint: regex }, { assessment: regex }, { 'diagnoses.description': regex }]
      })
        .select('chiefComplaint assessment diagnoses status createdAt')
        .lean()
    ]);

    const results = [
      ...prescriptions.map(p => ({ type: 'Prescription', date: p.createdAt, data: p })),
      ...consultationNotes.map(c => ({ type: 'ConsultationNote', date: c.createdAt, data: c }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sendSuccess(res, results, 'Search results retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getVisitHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    const { limit = '20', page = '1' } = req.query;
    
    const limitNum = parseInt(limit as string, 10);
    const skipNum = (parseInt(page as string, 10) - 1) * limitNum;

    const encounters = await Encounter.find({ patientId, tenantId: req.user!.tenantId })
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    const total = await Encounter.countDocuments({ patientId, tenantId: req.user!.tenantId });

    sendSuccess(res, { encounters, total, page: parseInt(page as string, 10), limit: limitNum }, 'Visit history retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getClinicalSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    const tenantId = req.user!.tenantId;

    const patient = await Patient.findOne({ _id: patientId, tenantId }).lean();
    if (!patient) throw new NotFoundError('Patient not found');

    const recentDate = getRecentDateFilter();

    // Get recent encounters (last 90 days)
    const recentEncounters = await Encounter.find({ 
      patientId, 
      tenantId,
      createdAt: { $gte: recentDate }
    }).sort({ createdAt: -1 }).limit(5).lean();

    // Get current medications from recently issued prescriptions
    const recentPrescriptions = await Prescription.find({
      patientId,
      tenantId,
      status: { $in: ['Issued', 'Received by Pharmacy', 'Partially Dispensed', 'Fully Dispensed'] },
      createdAt: { $gte: recentDate }
    }).sort({ createdAt: -1 }).lean();

    const currentMedications = recentPrescriptions.flatMap(p => p.medicines);
    const activeProblems = recentPrescriptions.flatMap(p => p.diagnoses);

    const summary = {
      patientDetails: {
        name: `${patient.name} ${patient.lastName || ''}`.trim(),
        uhid: patient.uhid,
        gender: patient.gender,
        dob: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup
      },
      activeProblems,
      currentMedications,
      recentEncounters,
      allergies: patient.allergies || [], 
      // Placeholders for future modules
      laboratoryResults: [],
      radiologyReports: [],
      admissions: []
    };

    sendSuccess(res, summary, 'Clinical summary retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMedicationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({ 
      patientId, 
      tenantId: req.user!.tenantId 
    })
    .select('createdAt status doctorName medicines diagnoses')
    .sort({ createdAt: -1 })
    .lean();

    const medications = prescriptions.map(p => ({
      prescriptionId: p._id,
      date: p.createdAt,
      doctor: p.doctorName,
      status: p.status,
      medicines: p.medicines,
      diagnoses: p.diagnoses
    }));

    sendSuccess(res, medications, 'Medication history retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getDiagnosisHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({ 
      patientId, 
      tenantId: req.user!.tenantId 
    })
    .select('createdAt doctorName diagnoses')
    .sort({ createdAt: -1 })
    .lean();

    const diagnosesList = prescriptions.flatMap(p => 
      p.diagnoses.map(d => ({
        ...d,
        dateRecorded: p.createdAt,
        recordedBy: p.doctorName
      }))
    );

    sendSuccess(res, diagnosesList, 'Diagnosis history retrieved successfully');
  } catch (err) {
    next(err);
  }
}
