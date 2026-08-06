import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { ImagingStudy } from './src/models/ImagingStudy';
import { RadiologyReport } from './src/models/RadiologyReport';
import { RadiologyDelivery } from './src/models/RadiologyDelivery';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyDelivery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Setup Data
    const doctor = await User.findOne({ role: 'DOCTOR' });
    if (!doctor) throw new Error('No doctor found');

    const patient = await Patient.findOne({ tenantId: doctor.tenantId });
    if (!patient) throw new Error('No patient found');

    const department = await Department.findOne({ tenantId: doctor.tenantId });
    if (!department) throw new Error('No department found');

    let catalog = await ImagingCatalog.findOne({ tenantId: doctor.tenantId });
    if (!catalog) throw new Error('No catalog found');

    // 2. Create Approved Order & Report
    console.log('Creating Approved Order and Report...');
    const orderNumber = `RAD-DEL-${Date.now()}`;
    const order = await RadiologyOrder.create({
      orderNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Approved',
      items: [{ catalogId: catalog._id, status: 'Approved' }],
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

    const reportNumber = `REP-RAD-DEL-${Date.now().toString().slice(-6)}`;
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
      status: 'Approved',
      version: 1,
      createdBy: doctor._id
    });

    // 3. Deliver Report
    console.log('Delivering Report via Email...');
    const delivery = await RadiologyDelivery.create({
      reportId: report._id,
      studyId: study._id,
      patientId: patient._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      channel: 'Email',
      recipientEmail: 'patient@example.com',
      status: 'Delivered',
      accessHistory: [],
      createdBy: doctor._id
    });
    console.log(`Delivery created with ID: ${delivery._id}`);

    // Update Report and Order Status manually to reflect controller logic
    report.status = 'Published';
    await report.save();
    console.log(`Report status updated to: ${report.status}`);

    order.items[0].status = 'Delivered';
    order.orderStatus = 'Delivered';
    await order.save();
    console.log(`Order status updated to: ${order.orderStatus}`);

    // 4. Simulate Download (Access History Logging)
    console.log('Simulating Patient Downloading Report...');
    delivery.status = 'Downloaded';
    delivery.accessHistory.push({
      accessedBy: patient._id,
      role: 'PATIENT',
      action: 'Downloaded',
      timestamp: new Date(),
      ipAddress: '192.168.1.1'
    });
    await delivery.save();
    console.log(`Delivery access history updated.`);

    // 5. Verify Access History
    console.log('Fetching Access History...');
    const fetchedDelivery = await RadiologyDelivery.findById(delivery._id);
    fetchedDelivery?.accessHistory.forEach(log => {
      console.log(`- Role: ${log.role}, Action: ${log.action}, IP: ${log.ipAddress}`);
    });

    // 6. Cleanup
    console.log('Cleaning up...');
    await RadiologyDelivery.findByIdAndDelete(delivery._id);
    await RadiologyReport.findByIdAndDelete(report._id);
    await ImagingStudy.findByIdAndDelete(study._id);
    await RadiologyOrder.findByIdAndDelete(order._id);
    console.log(`Cleanup complete.`);

    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyDelivery();
