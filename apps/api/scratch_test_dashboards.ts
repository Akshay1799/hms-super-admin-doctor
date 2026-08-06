import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { RadiologyReport } from './src/models/RadiologyReport';
import { RadiologyAppointment } from './src/models/RadiologyAppointment';
import { Machine } from './src/models/Machine';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import crypto from 'crypto';
import { getTechnicianDashboard, getRadiologistDashboard, getAdminDashboard, getExecutiveReports } from './src/controllers/radiology-dashboard.controller';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyDashboards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Setup Data
    const doctor = await User.findOne({ role: 'DOCTOR' });
    if (!doctor) throw new Error('No doctor found');

    const patient = await Patient.findOne({ tenantId: doctor.tenantId });
    if (!patient) throw new Error('No patient found');

    const department = await Department.findOne({ tenantId: doctor.tenantId });
    if (!department) throw new Error('No department found');

    let catalog = await ImagingCatalog.findOne({ tenantId: doctor.tenantId });
    if (!catalog) throw new Error('No catalog found');

    // Create 1 Machine
    const machine = await Machine.create({
      machineName: 'Test X-Ray Machine',
      modality: 'X-Ray',
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      status: 'Active',
      dailyCapacity: 20,
      createdBy: doctor._id
    });

    // Create 1 Pending Order first so we have IDs for appointment
    const order1 = await RadiologyOrder.create({
      orderNumber: `RAD-ORD-1-${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Requested',
      items: [{ catalogId: catalog._id, status: 'Requested' }],
      createdBy: doctor._id
    });

    // Create 1 Appointment for today
    const appointment = await RadiologyAppointment.create({
      appointmentNumber: `APT-RAD-${Date.now()}`,
      patientId: patient._id,
      orderId: order1._id,
      orderItemId: order1.items[0]._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // +1 hour
      examinationDuration: 60,
      status: 'Confirmed',
      machineId: machine._id,
      createdBy: doctor._id
    });

    // Create 1 Study Completed Order
    const order2 = await RadiologyOrder.create({
      orderNumber: `RAD-ORD-2-${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Study Completed',
      items: [{ catalogId: catalog._id, status: 'Study Completed' }],
      createdBy: doctor._id
    });

    // Create 1 Published Report (Order is Delivered)
    const order3 = await RadiologyOrder.create({
      orderNumber: `RAD-ORD-3-${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Delivered',
      items: [{ catalogId: catalog._id, status: 'Delivered' }],
      createdBy: doctor._id,
      createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
    });

    const report = await RadiologyReport.create({
      reportNumber: `REP-RAD-${Date.now()}`,
      studyId: new mongoose.Types.ObjectId(), // Dummy
      orderId: order3._id,
      patientId: patient._id,
      radiologistId: doctor._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      findings: 'Lungs clear',
      impression: 'Normal',
      status: 'Published',
      version: 1,
      createdBy: doctor._id,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date() // Just published
    });

    // Mock Express Req/Res
    const reqMock: any = {
      user: {
        id: doctor._id.toString(),
        tenantId: doctor.tenantId!.toString(),
        hospitalId: doctor.hospitalId!.toString(),
        role: 'SUPER_ADMIN'
      }
    };

    const resMock: any = {
      status: function (code: number) { this.statusCode = code; return this; },
      json: function (data: any) { this.data = data; }
    };

    const nextMock = (err?: any) => { if (err) console.error(err); };

    console.log('\n--- Technician Dashboard ---');
    await getTechnicianDashboard(reqMock, resMock, nextMock);
    console.log(resMock.data);

    console.log('\n--- Radiologist Dashboard ---');
    await getRadiologistDashboard(reqMock, resMock, nextMock);
    console.log(resMock.data);

    console.log('\n--- Admin Dashboard ---');
    await getAdminDashboard(reqMock, resMock, nextMock);
    console.log(resMock.data);

    console.log('\n--- Executive Reports ---');
    await getExecutiveReports(reqMock, resMock, nextMock);
    console.log(resMock.data);

    // Cleanup
    await Machine.findByIdAndDelete(machine._id);
    await RadiologyAppointment.findByIdAndDelete(appointment._id);
    await RadiologyOrder.findByIdAndDelete(order1._id);
    await RadiologyOrder.findByIdAndDelete(order2._id);
    await RadiologyOrder.findByIdAndDelete(order3._id);
    await RadiologyReport.findByIdAndDelete(report._id);

    console.log('\nCleanup complete.');
    console.log('Dashboard Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyDashboards();
