import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ShiftTemplate } from './models/ShiftTemplate';
import { DutyRoster } from './models/DutyRoster';
import { ShiftAssignment } from './models/ShiftAssignment';
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

    let doctor = await User.findOne({ role: 'DOCTOR', tenantId: tenant._id });
    if (!doctor) {
      doctor = await User.create({
        name: 'Dr. Test',
        email: 'dr.test@hms.com',
        password: 'password',
        role: 'DOCTOR',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
    }

    let admin = await User.findOne({ role: 'DEPT_ADMIN', tenantId: tenant._id });
    if (!admin) {
      admin = await User.create({
        name: 'Admin Test',
        email: 'admin.test@hms.com',
        password: 'password',
        role: 'DEPT_ADMIN',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
    }

    // Clean previous runs
    await ShiftTemplate.deleteMany({ name: 'Test Morning OPD' });
    await DutyRoster.deleteMany({ name: 'Test Duty Roster' });
    await ShiftAssignment.deleteMany({ doctorId: doctor._id });

    console.log('Creating Shift Template...');
    const template = await ShiftTemplate.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      name: 'Test Morning OPD',
      shiftType: 'Morning',
      startTime: '08:00',
      endTime: '14:00',
      breakDurationMinutes: 30,
      maxPatients: 40
    });
    console.log(`Template created: ${template._id}`);

    console.log('Creating Duty Roster...');
    const roster = await DutyRoster.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      name: 'Test Duty Roster',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
      status: 'Draft'
    });
    console.log(`Roster created: ${roster._id}`);

    console.log('Assigning Shift...');
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const assignment = await ShiftAssignment.create({
      tenantId: tenant._id,
      hospitalId: hospital._id,
      departmentId: department._id,
      dutyRosterId: roster._id,
      shiftTemplateId: template._id,
      doctorId: doctor._id,
      date: date,
      assignedBy: admin._id
    });
    console.log(`Assignment created: ${assignment._id}`);

    console.log('Testing Overlapping Shift Prevention...');
    try {
      await ShiftAssignment.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id,
        dutyRosterId: roster._id,
        shiftTemplateId: template._id, // Exact same template and date
        doctorId: doctor._id,
        date: date,
        assignedBy: admin._id
      });
      throw new Error('Overlapping shift should have failed!');
    } catch (err: any) {
      if (err.code === 11000) {
        console.log('Success: Prevented overlapping shift (E11000 duplicate key error).');
      } else {
        throw err;
      }
    }

    console.log('Verification Success!');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

runTest();
