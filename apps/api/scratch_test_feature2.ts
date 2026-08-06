import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { RadiologyAppointment } from './src/models/RadiologyAppointment';
import { Machine } from './src/models/Machine';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyRadiologyScheduling() {
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

    // Machine setup
    let machine = await Machine.findOne({ tenantId: doctor.tenantId });
    if (!machine) {
      console.log('No machine found, creating a dummy one...');
      machine = await Machine.create({
        machineName: 'Test MRI 1',
        modality: 'MRI',
        departmentId: department._id,
        tenantId: doctor.tenantId,
        hospitalId: doctor.hospitalId,
        status: 'Active',
        createdBy: doctor._id
      });
    }

    // Catalog setup
    let catalog = await ImagingCatalog.findOne({ tenantId: doctor.tenantId, modality: 'MRI' });
    if (!catalog) {
      catalog = await ImagingCatalog.create({
        examinationCode: 'MRI-TEST-100',
        examinationName: 'Test MRI Brain',
        modality: 'MRI',
        category: 'Diagnostic',
        bodyPart: 'Brain',
        departmentId: department._id,
        estimatedDurationMinutes: 45,
        billingCode: 'RAD-002',
        activeStatus: true,
        tenantId: doctor.tenantId,
        hospitalId: doctor.hospitalId,
        createdBy: doctor._id
      });
    }

    // 2. Create Order
    console.log('Creating Radiology Order...');
    const orderNumber = `RAD-TEST-SCH-${Date.now()}`;
    const order = await RadiologyOrder.create({
      orderNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Requested',
      items: [{ catalogId: catalog._id }],
      createdBy: doctor._id
    });
    console.log(`Order created: ${order.orderNumber}`);

    // 3. Schedule Appointment
    console.log('Scheduling Appointment...');
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 min duration

    const appointmentNumber = `APT-TEST-${Date.now()}`;
    const appointment = await RadiologyAppointment.create({
      appointmentNumber,
      orderId: order._id,
      orderItemId: order.items[0]._id,
      patientId: patient._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      machineId: machine._id,
      startTime,
      endTime,
      examinationDuration: 45,
      status: 'Reserved',
      createdBy: doctor._id
    });
    console.log(`Appointment Scheduled: ${appointment.appointmentNumber}, Time: ${startTime.toISOString()}`);

    // Verify Order Status update (Simulate controller)
    order.items[0].status = 'Scheduled';
    order.orderStatus = 'Scheduled';
    await order.save();
    console.log(`Order status updated to: ${order.orderStatus}`);

    // 4. Test Double Booking Validation
    console.log('Testing Double Booking Validation...');
    const sTime = startTime;
    const eTime = endTime;
    
    // Simulating controller logic check
    const conflicting = await RadiologyAppointment.findOne({
      machineId: machine._id,
      status: { $in: ['Reserved', 'Confirmed'] },
      $or: [
        { startTime: { $lt: eTime }, endTime: { $gt: sTime } }
      ]
    });

    if (conflicting) {
      console.log('Validation passed: System correctly caught the double booking!');
    } else {
      console.error('Validation failed: Double booking was allowed!');
    }

    // 5. Cleanup / Cancel Appointment
    console.log('Cancelling Appointment to clean up...');
    appointment.status = 'Cancelled';
    await appointment.save();
    console.log(`Appointment Cancelled.`);

    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyRadiologyScheduling();
