import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DoctorProfile } from './models/DoctorProfile';
import { Tenant } from './models/Tenant';
import { Hospital } from './models/Hospital';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hms_super_admin';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    // 1. Get or create a Tenant & Hospital
    let tenant = await Tenant.findOne();
    if (!tenant) {
      tenant = await Tenant.create({ name: 'Global Health', code: 'GH01' });
    }
    
    let hospital = await Hospital.findOne({ tenantId: tenant._id });
    if (!hospital) {
      hospital = await Hospital.create({ name: 'GH City Hospital', tenantId: tenant._id, type: 'General' });
    }
    
    // 2. Clean previous test runs
    await DoctorProfile.deleteMany({ email: 'test.doctor@example.com' });
    
    console.log('Creating new Doctor Profile...');
    
    // 3. Create Draft Profile
    const profile = new DoctorProfile({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      title: 'Dr.',
      firstName: 'Test',
      lastName: 'Doctor',
      gender: 'Male',
      dateOfBirth: new Date('1985-05-15'),
      mobileNumber: '+1234567890',
      email: 'test.doctor@example.com',
      status: 'Draft'
    });
    
    await profile.save();
    console.log(`Created Profile ID: ${profile._id}`);
    
    // 4. Add Qualification
    profile.qualifications.push({
      degree: 'MBBS',
      specialization: 'General Medicine',
      university: 'Oxford University',
      institution: 'Oxford Medical College',
      country: 'UK',
      completionYear: 2010,
      qualificationStatus: 'Active'
    });
    
    // 5. Add Specialization
    profile.specializations.push({
      primarySpecialization: 'Cardiology',
      yearsOfExperience: 10,
      activeStatus: true
    });
    
    // 6. Add Experience
    profile.experience.push({
      hospitalName: 'Apollo Hospital',
      organization: 'Apollo Group',
      position: 'Senior Consultant',
      department: 'Cardiology',
      startDate: new Date('2015-01-01')
    });
    
    // 7. Add Registration
    profile.registrations.push({
      medicalRegistrationNumber: 'REG-12345',
      registrationCouncil: 'Medical Council',
      registrationDate: new Date('2011-01-01')
    });
    
    // 8. Update Status
    profile.status = 'Pending Verification';
    
    await profile.save();
    console.log('Successfully appended nested records and updated status.');
    
    // 9. Fetch Profile
    const savedProfile = await DoctorProfile.findById(profile._id);
    if (!savedProfile) throw new Error('Profile not found after saving.');
    
    console.log('Verification Success!');
    console.log('Qualifications:', savedProfile.qualifications.length);
    console.log('Specializations:', savedProfile.specializations.length);
    console.log('Experience:', savedProfile.experience.length);
    console.log('Status:', savedProfile.status);
    
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

runTest();
