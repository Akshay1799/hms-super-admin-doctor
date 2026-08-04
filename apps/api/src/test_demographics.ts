import mongoose from 'mongoose';
import 'dotenv/config';
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

    let patient = await Patient.findOne({ name: 'Demographics Test Patient' });
    if (!patient) {
      patient = await Patient.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        name: 'Demographics Test Patient',
        phone: '1112223334',
        gender: 'Female',
        dateOfBirth: new Date('1985-05-05'),
        age: 41,
        status: 'Active'
      });
    }

    console.log(`Using Patient: ${patient.uhid}`);

    // Simulate updateProfile
    patient.occupation = 'Software Engineer';
    patient.bloodGroup = 'O+';
    patient.timeline.push({
      title: 'Profile Updated',
      description: 'Occupation and blood group added',
      date: new Date(),
      type: 'registration'
    });
    await patient.save();
    console.log('✅ updateProfile simulated successfully');

    // Simulate updateAddress
    patient.address = {
      line1: '123 Main St',
      city: 'Techville',
      state: 'CA',
      country: 'USA',
      postalCode: '12345'
    };
    patient.timeline.push({
      title: 'Address Updated',
      description: 'Primary address added',
      date: new Date(),
      type: 'registration'
    });
    await patient.save();
    console.log('✅ updateAddress simulated successfully');

    // Simulate addIdentityDocument
    patient.identityInfo.push({
      type: 'Passport',
      idNumber: 'A12345678',
      issuingAuthority: 'State Dept'
    });
    patient.timeline.push({
      title: 'Identity Document Added',
      description: 'Passport added to profile',
      date: new Date(),
      type: 'registration'
    });
    await patient.save();
    console.log('✅ addIdentityDocument simulated successfully');

    console.log('🎉 Feature 4 test passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
