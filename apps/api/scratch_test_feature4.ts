import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { ImagingStudy } from './src/models/ImagingStudy';
import { RadiologyReport } from './src/models/RadiologyReport';
import { ReportVersion } from './src/models/ReportVersion';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import crypto from 'crypto';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyReporting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Setup Data
    const radiologist = await User.findOne({ role: 'RADIOLOGIST' });
    if (!radiologist) {
      console.log('No radiologist found. Test might fail if no user has RADIOLOGIST role. Attempting to fallback to DOCTOR.');
    }
    const doctor = radiologist || await User.findOne({ role: 'DOCTOR' });
    if (!doctor) throw new Error('No valid doctor/radiologist found');

    const patient = await Patient.findOne({ tenantId: doctor.tenantId });
    if (!patient) throw new Error('No patient found');

    const department = await Department.findOne({ tenantId: doctor.tenantId });
    if (!department) throw new Error('No department found');

    let catalog = await ImagingCatalog.findOne({ tenantId: doctor.tenantId });
    if (!catalog) throw new Error('No catalog found');

    // 2. Create Order & Study (Simulating previous steps)
    console.log('Creating Order and Study...');
    const orderNumber = `RAD-REP-${Date.now()}`;
    const order = await RadiologyOrder.create({
      orderNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Study Completed',
      items: [{ catalogId: catalog._id, status: 'Study Completed' }],
      createdBy: doctor._id
    });

    const studyUid = crypto.randomUUID();
    const study = await ImagingStudy.create({
      studyUid,
      accessionNumber: `ACC-${order.orderNumber}-001`,
      patientId: patient._id,
      orderId: order._id,
      orderItemId: order.items[0]._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      modality: 'X-Ray',
      studyDate: new Date(),
      status: 'Available',
      createdBy: doctor._id
    });

    // 3. Create Draft Report
    console.log('Creating Draft Report...');
    const reportNumber = `REP-RAD-2026-${Date.now().toString().slice(-6)}`;
    const report = await RadiologyReport.create({
      reportNumber,
      studyId: study._id,
      orderId: order._id,
      patientId: patient._id,
      radiologistId: doctor._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      clinicalIndication: 'Chest pain',
      technique: 'PA chest X-Ray',
      findings: 'Lungs are clear',
      impression: 'Normal study',
      status: 'Draft',
      version: 1,
      createdBy: doctor._id
    });
    
    // Save Initial Version
    await ReportVersion.create({
      reportId: report._id,
      tenantId: report.tenantId,
      hospitalId: report.hospitalId,
      versionNumber: report.version,
      clinicalIndication: report.clinicalIndication,
      findings: report.findings,
      impression: report.impression,
      status: report.status,
      savedBy: doctor._id,
      savedAt: new Date()
    });
    console.log(`Draft Created: ${report.reportNumber}, Version: ${report.version}`);

    // Update Order Status manually to reflect controller logic
    order.items[0].status = 'Reporting';
    order.orderStatus = 'Reporting';
    await order.save();
    console.log(`Order status updated to: ${order.orderStatus}`);

    // 4. Update Report (Draft)
    console.log('Updating Draft Report...');
    report.findings = 'Lungs are clear. Heart size is normal.';
    await report.save();

    // 5. Submit & Approve Report
    console.log('Submitting & Approving Report...');
    report.status = 'Approved';
    report.approvedBy = doctor._id;
    report.approvedAt = new Date();
    report.version += 1;
    await report.save();

    await ReportVersion.create({
      reportId: report._id,
      tenantId: report.tenantId,
      hospitalId: report.hospitalId,
      versionNumber: report.version,
      clinicalIndication: report.clinicalIndication,
      findings: report.findings,
      impression: report.impression,
      status: report.status,
      savedBy: doctor._id,
      savedAt: new Date()
    });

    order.items[0].status = 'Approved';
    order.orderStatus = 'Approved';
    await order.save();

    console.log(`Report Approved. Current Version: ${report.version}`);
    console.log(`Order status updated to: ${order.orderStatus}`);

    // 6. Verify Versions
    console.log('Fetching Report Versions...');
    const versions = await ReportVersion.find({ reportId: report._id }).sort({ versionNumber: 1 });
    console.log(`Found ${versions.length} versions.`);
    versions.forEach(v => {
      console.log(`- Version ${v.versionNumber}: Status [${v.status}], Findings [${v.findings}]`);
    });

    // 7. Cleanup
    console.log('Cleaning up...');
    await RadiologyReport.findByIdAndDelete(report._id);
    await ReportVersion.deleteMany({ reportId: report._id });
    await ImagingStudy.findByIdAndDelete(study._id);
    console.log(`Cleanup complete.`);

    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyReporting();
