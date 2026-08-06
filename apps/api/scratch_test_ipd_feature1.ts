import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Ward } from './src/models/Ward';
import { Room } from './src/models/Room';
import { Bed } from './src/models/Bed';
import { Admission } from './src/models/Admission';
import { BedAllocation } from './src/models/BedAllocation';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import {
  createAdmission,
  allocateBed,
  reserveBed,
  releaseBed,
  getAvailableBeds,
  getOccupancyStatus
} from './src/controllers/ipd-bed-allocation.controller';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyIPDFeature1() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Setup Test Data
    const doctor = await User.findOne({ role: 'DOCTOR' });
    if (!doctor) throw new Error('No doctor found');

    const patient = await Patient.findOne({ tenantId: doctor.tenantId });
    if (!patient) throw new Error('No patient found');

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

    // 2. Create Hierarchy (Ward -> Room -> Bed)
    console.log('\n--- Creating Hierarchy ---');
    const ward = await Ward.create({
      name: 'General Ward A',
      wardType: 'General',
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId
    });

    const room = await Room.create({
      roomNumber: `RM-A1-${Date.now()}`,
      wardId: ward._id,
      roomType: 'Twin Sharing',
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId
    });

    const bed1 = await Bed.create({
      bedNumber: `BED-A1-1-${Date.now()}`,
      roomId: room._id,
      wardId: ward._id,
      bedCategory: 'General Bed',
      status: 'Available',
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId
    });

    const bed2 = await Bed.create({
      bedNumber: `BED-A1-2-${Date.now()}`,
      roomId: room._id,
      wardId: ward._id,
      bedCategory: 'General Bed',
      status: 'Available',
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId
    });
    console.log(`Created Ward, Room, and 2 Beds`);

    // 3. Create Admission
    console.log('\n--- Testing createAdmission ---');
    reqMock.body = {
      patientId: patient._id.toString(),
      admittingDoctorId: doctor._id.toString()
    };
    await createAdmission(reqMock, resMock, nextMock);
    console.log(resMock.data);
    const admissionId = resMock.data.data._id;

    // 4. Check Available Beds
    console.log('\n--- Testing getAvailableBeds ---');
    reqMock.query = {};
    reqMock.body = {};
    await getAvailableBeds(reqMock, resMock, nextMock);
    console.log(`Available Beds count: ${resMock.data.data.length}`);

    // 5. Reserve Bed 1
    console.log('\n--- Testing reserveBed ---');
    reqMock.body = {
      admissionId: admissionId,
      bedId: bed1._id.toString()
    };
    await reserveBed(reqMock, resMock, nextMock);
    console.log(resMock.data);

    // 6. Allocate Bed 1
    console.log('\n--- Testing allocateBed (Moving from Reserved to Occupied) ---');
    await allocateBed(reqMock, resMock, nextMock);
    console.log(resMock.data);
    const allocationId = resMock.data.data._id;

    // 7. Check Occupancy
    console.log('\n--- Testing getOccupancyStatus ---');
    reqMock.body = {};
    await getOccupancyStatus(reqMock, resMock, nextMock);
    console.log(resMock.data);

    // 8. Release Bed
    console.log('\n--- Testing releaseBed ---');
    reqMock.params = { allocationId: allocationId };
    await releaseBed(reqMock, resMock, nextMock);
    console.log(resMock.data);

    // 9. Check Occupancy Again (Bed should be Cleaning)
    console.log('\n--- Testing getOccupancyStatus (Post-Release) ---');
    await getOccupancyStatus(reqMock, resMock, nextMock);
    console.log(resMock.data);

    // Cleanup
    await BedAllocation.deleteMany({ admissionId });
    await Admission.findByIdAndDelete(admissionId);
    await Bed.deleteMany({ roomId: room._id });
    await Room.findByIdAndDelete(room._id);
    await Ward.findByIdAndDelete(ward._id);

    console.log('\nCleanup complete.');
    console.log('IPD Feature 1 Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyIPDFeature1();
