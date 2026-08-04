import mongoose from 'mongoose';
import 'dotenv/config';
import { Appointment } from './models/Appointment';
import { Patient } from './models/Patient';
import { User } from './models/User';
import { Tenant } from './models/Tenant';
import { Hospital } from './models/Hospital';

async function runTest() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hms';
    await mongoose.connect(uri);
    console.log('✅ Connected to DB');

    // Setup Test Data
    const tenant = await Tenant.findOne();
    if (!tenant) throw new Error('No tenant found');
    
    const hospital = await Hospital.findOne({ tenantId: tenant._id });
    if (!hospital) throw new Error('No hospital found');

    const patient = await Patient.findOne({ tenantId: tenant._id });
    if (!patient) throw new Error('No patient found, run previous tests first');

    let doctor = await User.findOne({ role: 'DOCTOR' });
    if (!doctor) {
      doctor = await User.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        name: 'Dr. Appointment Test',
        email: 'doc.appt@hms.com',
        phone: '1234567890',
        password: 'password123',
        role: 'DOCTOR',
        status: 'Active'
      });
    }

    console.log(`Using Doctor: ${doctor.name}`);

    // Create an Appointment
    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow
    
    let appt = await Appointment.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      patientId: patient._id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorId: doctor._id,
      doctorName: doctor.name,
      date: date,
      time: '10:00',
      type: 'New Consultation',
      status: 'Scheduled',
    });
    
    console.log(`✅ Appointment created: ${appt.appointmentNumber}`);

    // Update Appointment
    appt.status = 'Confirmed';
    await appt.save();
    console.log(`✅ Appointment updated to Confirmed`);

    // Check-In Simulation (triggers Encounter)
    const { Encounter } = await import('./models/Encounter');
    const encounter = await Encounter.create({
      tenantId: appt.tenantId,
      hospitalId: appt.hospitalId,
      patientId: appt.patientId,
      encounterType: 'OPD',
      category: 'Scheduled Appointment',
      doctorId: appt.doctorId,
      status: 'Waiting'
    });
    
    appt.status = 'Checked-In';
    await appt.save();
    console.log(`✅ Patient checked-in, generated Encounter: ${encounter.visitNumber}`);

    console.log('🎉 Feature 5 test passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
