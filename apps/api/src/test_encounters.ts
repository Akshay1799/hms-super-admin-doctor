import mongoose from 'mongoose';
import 'dotenv/config';
import { Encounter } from './models/Encounter';
import { Patient } from './models/Patient';
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

    let patient = await Patient.findOne({ tenantId: tenant._id });
    if (!patient) {
      patient = await Patient.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        name: 'Encounter Test Patient',
        phone: '9998887776',
        gender: 'Male',
        dateOfBirth: new Date('1990-01-01'),
        status: 'Active'
      });
    }

    console.log(`Using Patient: ${patient.uhid}`);

    // Test OPD
    const opdEncounter = await Encounter.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      patientId: patient._id,
      encounterType: 'OPD',
      category: 'Walk-in',
      status: 'Checked-In'
    });
    console.log(`✅ OPD Encounter created: ${opdEncounter.visitNumber}`);

    // Test IPD
    const ipdEncounter = await Encounter.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      patientId: patient._id,
      encounterType: 'IPD',
      category: 'Scheduled Appointment',
      status: 'Scheduled'
    });
    console.log(`✅ IPD Encounter created: ${ipdEncounter.visitNumber}`);

    // Test ER
    const erEncounter = await Encounter.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      patientId: patient._id,
      encounterType: 'Emergency',
      category: 'Emergency Visit',
      status: 'Checked-In'
    });
    console.log(`✅ ER Encounter created: ${erEncounter.visitNumber}`);

    console.log('🎉 Feature 3 test passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
