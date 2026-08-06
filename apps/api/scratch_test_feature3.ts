import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { ImagingStudy } from './src/models/ImagingStudy';
import { PACSReference } from './src/models/PACSReference';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import crypto from 'crypto';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyPACSIntegration() {
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

    // 2. Create Order in Scheduled state
    console.log('Creating Radiology Order (Scheduled)...');
    const orderNumber = `RAD-PACS-${Date.now()}`;
    const order = await RadiologyOrder.create({
      orderNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Scheduled',
      items: [{ catalogId: catalog._id, status: 'Scheduled' }],
      createdBy: doctor._id
    });
    console.log(`Order created: ${order.orderNumber}`);

    // 3. Simulate PACS Upload (Controller Logic)
    console.log('Simulating PACS Upload...');
    const studyUid = crypto.randomUUID();
    const accessionNumber = `ACC-${order.orderNumber}-${order.items[0]._id?.toString().slice(-4)}`;

    const study = await ImagingStudy.create({
      studyUid,
      accessionNumber,
      patientId: patient._id,
      orderId: order._id,
      orderItemId: order.items[0]._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      modality: 'X-Ray',
      studyDate: new Date(),
      status: 'Available',
      dicomMetadata: {
        seriesCount: 2,
        instanceCount: 15,
        bodyPart: 'Chest',
      },
      createdBy: doctor._id
    });
    console.log(`Imaging Study Created with UID: ${study.studyUid}`);

    const viewerUrl = `https://pacs.example.com/viewer?studyUid=${studyUid}`;
    const pacsRef = await PACSReference.create({
      studyId: study._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      pacsServerId: 'DEFAULT_PACS_01',
      storagePath: `/archival/${new Date().getFullYear()}/${studyUid}`,
      viewerUrl,
      syncStatus: 'Synced',
      lastSyncedAt: new Date(),
      createdBy: doctor._id
    });
    console.log(`PACS Reference Created, Viewer URL: ${pacsRef.viewerUrl}`);

    // Verify Order Status update
    order.items[0].status = 'Study Completed';
    order.orderStatus = 'Study Completed';
    await order.save();
    console.log(`Order status updated to: ${order.orderStatus}`);

    // 4. Retrieve Study Information
    console.log('Retrieving Study Info...');
    const fetchedStudy = await ImagingStudy.findById(study._id).populate('patientId', 'firstName lastName uhid');
    const fetchedPacsRef = await PACSReference.findOne({ studyId: study._id });

    if (!fetchedStudy || !fetchedPacsRef) {
      throw new Error('Could not fetch study or PACS reference');
    }
    console.log(`Fetched Study: Accession: ${fetchedStudy.accessionNumber}, Status: ${fetchedStudy.status}`);
    console.log(`Fetched Viewer URL: ${fetchedPacsRef.viewerUrl}`);

    // 5. Cleanup
    console.log('Cleaning up...');
    await ImagingStudy.findByIdAndDelete(study._id);
    await PACSReference.findByIdAndDelete(pacsRef._id);
    console.log(`Cleanup complete.`);

    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyPACSIntegration();
