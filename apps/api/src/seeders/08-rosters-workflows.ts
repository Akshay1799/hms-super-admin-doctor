import mongoose from 'mongoose';
import { Roster } from '../models/Roster';
import { ApprovalMatrix, FinancialRequest } from '../models/Workflows';
import { ControlledDrugRegister, ControlledDrugAudit } from '../models/ControlledDrugs';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { Medicine, PharmacyLocation, InventoryBatch } from '../models/Pharmacy';
import { Invoice } from '../models/Billing';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import { getRandomElement, getRandomDateInPast } from './helpers';

export async function seedRostersWorkflowsAndAuditLogs() {
  console.log('Seeding Rosters, Workflows, Controlled Drugs, and Audit Logs...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const deptIds = idMap.departments.get(config.code)!;
    const adminUserId = idMap.users.get(`${config.code}:HOSPITAL_ADMIN:admin@${config.emailDomain}`)!;

    const staffUsers = await User.find({ tenantId, hospitalId }).select('_id name role departmentId');
    if (staffUsers.length === 0) continue;

    // 1. Rosters (Duty schedules for staff for past 7 days)
    const today = new Date();
    for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
      const rosterDate = new Date(today);
      rosterDate.setDate(today.getDate() + dayOffset);
      rosterDate.setHours(0, 0, 0, 0);

      for (const u of staffUsers.slice(0, 20)) {
        let roster = await Roster.findOne({ userId: u._id, date: rosterDate });
        if (!roster) {
          await Roster.create({
            userId: u._id,
            date: rosterDate,
            shiftType: dayOffset % 2 === 0 ? 'Day' : 'Night',
            departmentId: u.departmentId || deptIds[0],
            hospitalId,
            tenantId,
            notes: 'Regular scheduled duty shift in Indore',
          });
        }
      }
    }

    // 2. Approval Matrices
    const approvalRoles = [
      { role: 'HOSPITAL_ADMIN', max: 50000 },
      { role: 'DEPT_ADMIN', max: 10000 },
      { role: 'RECEPTIONIST', max: 1000 },
    ];
    for (const app of approvalRoles) {
      let matrix = await ApprovalMatrix.findOne({ tenantId, actionType: 'DISCOUNT', role: app.role });
      if (!matrix) {
        await ApprovalMatrix.create({
          tenantId,
          actionType: 'DISCOUNT',
          role: app.role,
          maxAmount: app.max,
        });
      }
    }

    // 3. Financial Requests for Invoices
    const invoices = await Invoice.find({ tenantId }).limit(5);
    for (const inv of invoices) {
      let finReq = await FinancialRequest.findOne({ tenantId, invoiceId: inv._id });
      if (!finReq) {
        await FinancialRequest.create({
          tenantId,
          invoiceId: inv._id,
          requestType: 'DISCOUNT',
          amount: 500,
          reason: 'Senior citizen discount requested',
          status: 'APPROVED',
          requestedBy: adminUserId,
          approvedBy: adminUserId,
          resolvedAt: new Date(),
        });
      }
    }

    // 4. Controlled Drugs Register & Audit
    const controlledMed = await Medicine.findOne({ tenantId, controlledDrugFlag: true });
    const pharmacyLoc = await PharmacyLocation.findOne({ hospitalId, type: 'main' });

    if (controlledMed && pharmacyLoc) {
      const batch = await InventoryBatch.findOne({ pharmacyId: pharmacyLoc._id, medicineId: controlledMed._id });
      if (batch) {
        let reg = await ControlledDrugRegister.findOne({ tenantId, medicineId: controlledMed._id });
        if (!reg) {
          await ControlledDrugRegister.create({
            tenantId,
            hospitalId,
            pharmacyId: pharmacyLoc._id,
            medicineId: controlledMed._id,
            batchId: batch._id,
            transactionId: `TXN-CD-${config.code}-001`,
            transactionType: 'receive',
            quantityChanged: 50,
            balanceQuantity: 50,
            performedBy: adminUserId,
            witnessedBy: staffUsers[1]._id,
            remarks: 'Controlled drug stock received with dual verification',
          });
        }

        let audit = await ControlledDrugAudit.findOne({ tenantId, medicineId: controlledMed._id });
        if (!audit) {
          await ControlledDrugAudit.create({
            tenantId,
            hospitalId,
            pharmacyId: pharmacyLoc._id,
            medicineId: controlledMed._id,
            batchId: batch._id,
            expectedQuantity: 50,
            actualQuantity: 50,
            variance: 0,
            auditedBy: adminUserId,
            witnessedBy: staffUsers[1]._id,
            status: 'resolved',
          });
        }
      }
    }

    // 5. Audit Logs
    const auditActions = ['LOGIN', 'CREATE_PATIENT', 'BOOK_APPOINTMENT', 'GENERATE_INVOICE', 'DISPENSE_MEDICINE'];
    for (let i = 0; i < auditActions.length; i++) {
      await AuditLog.create({
        tenantId,
        hospitalId,
        userId: adminUserId,
        userName: `${config.name} Admin`,
        userRole: 'HOSPITAL_ADMIN',
        module: auditActions[i].split('_')[1] || 'AUTH',
        action: auditActions[i],
        description: `Executed ${auditActions[i]} operation for ${config.name}`,
        severity: 'info',
        status: 'success',
      });
    }

    // 6. Sync Denormalized Counts on Hospital Document
    const { Patient } = await import('../models/Patient');
    const { Hospital } = await import('../models/Hospital');
    const { Department } = await import('../models/Department');

    const [doctorCount, patientCount, departmentCount, bedResult] = await Promise.all([
      User.countDocuments({ hospitalId, role: 'DOCTOR' }),
      Patient.countDocuments({ hospitalId }),
      Department.countDocuments({ hospitalId }),
      Department.aggregate([
        { $match: { hospitalId } },
        { $group: { _id: null, total: { $sum: '$totalBeds' } } },
      ]),
    ]);

    const bedCount = bedResult[0]?.total || 0;

    await Hospital.updateOne(
      { _id: hospitalId },
      { $set: { doctorCount, patientCount, departmentCount, bedCount } }
    );

    console.log(`Synced Rosters, Workflows, Controlled Drugs, Audit Logs & Counts (Doctors: ${doctorCount}, Patients: ${patientCount}) for ${config.name}`);
  }
}
