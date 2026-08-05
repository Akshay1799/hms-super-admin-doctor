import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DoctorAssignment } from './models/DoctorAssignment';
import { Encounter } from './models/Encounter';
import { Tenant } from './models/Tenant';
import { Hospital } from './models/Hospital';
import { Department } from './models/Department';
import { User } from './models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hms_super_admin';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    // Setup Context
    let tenant = await Tenant.findOne();
    if (!tenant) tenant = await Tenant.create({ name: 'Test Health', code: 'TH01' });
    
    let hospital = await Hospital.findOne({ tenantId: tenant._id });
    if (!hospital) hospital = await Hospital.create({ name: 'Test Hospital', tenantId: tenant._id, type: 'General' });

    let department = await Department.findOne({ tenantId: tenant._id });
    if (!department) department = await Department.create({ name: 'Cardiology', hospitalId: hospital._id, tenantId: tenant._id });

    let drPrimary = await User.findOne({ email: 'dr.primary@hms.com' });
    if (!drPrimary) {
      drPrimary = await User.create({
        name: 'Dr. Primary',
        email: 'dr.primary@hms.com',
        password: 'password',
        role: 'DOCTOR',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
    }

    let drSpecialist = await User.findOne({ email: 'dr.specialist@hms.com' });
    if (!drSpecialist) {
      drSpecialist = await User.create({
        name: 'Dr. Specialist',
        email: 'dr.specialist@hms.com',
        password: 'password',
        role: 'DOCTOR',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
    }

    let patient = await User.findOne({ role: 'PATIENT' });
    if (!patient) patient = await User.create({ name: 'Patient X', email: 'x@x.com', password: '1', role: 'PATIENT', tenantId: tenant._id });

    // Clean previous runs
    await Encounter.deleteMany({ patientId: patient._id });
    await DoctorAssignment.deleteMany({ patientId: patient._id });

    // Create Encounter
    console.log('Creating Encounter...');
    const encounter = await Encounter.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      patientId: patient._id,
      encounterType: 'OPD',
      category: 'New Visit',
      status: 'Checked-In'
    });

    console.log(`Encounter created: ${encounter._id}`);

    // Create Primary Assignment (Simulating the API call logic)
    console.log('Assigning Primary Doctor (autoAccept = false)...');
    let assignment = await DoctorAssignment.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      encounterId: encounter._id,
      doctorId: drPrimary._id,
      patientId: patient._id,
      role: 'Primary',
      status: 'Pending',
      assignedBy: drPrimary._id // Mock assigned by self for test
    });

    console.log(`Assignment Created with status: ${assignment.status}`);

    // Accept Assignment
    assignment.status = 'Accepted';
    await assignment.save();
    console.log(`Doctor accepted assignment. Status: ${assignment.status}`);

    // Transfer Assignment
    console.log('Transferring Assignment to Specialist...');
    const newAssignment = await DoctorAssignment.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      encounterId: encounter._id,
      doctorId: drSpecialist._id,
      patientId: patient._id,
      role: 'Primary',
      status: 'Accepted',
      assignedBy: drPrimary._id
    });

    assignment.status = 'Transferred';
    assignment.transferredTo = newAssignment._id;
    await assignment.save();

    console.log(`Old Assignment Status: ${assignment.status} (Transferred to ${assignment.transferredTo})`);
    console.log(`New Assignment Status: ${newAssignment.status} (Assigned to ${newAssignment.doctorId})`);

    // Verify Constraint
    const activePrimaryCount = await DoctorAssignment.countDocuments({
      encounterId: encounter._id,
      role: 'Primary',
      status: { $in: ['Pending', 'Accepted', 'In Progress'] }
    });

    if (activePrimaryCount === 1) {
      console.log('Verification Success: Only 1 active Primary assignment exists.');
    } else {
      console.error(`Verification Failed: Expected 1 active Primary assignment, found ${activePrimaryCount}`);
    }

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

runTest();
