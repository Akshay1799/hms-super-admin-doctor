import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { RadiologyOrder } from './src/models/RadiologyOrder';
import { ImagingCatalog } from './src/models/ImagingCatalog';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Department } from './src/models/Department';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyRadiologyFeature() {
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

    // 2. Fetch Catalog (and trigger default creation)
    let catalog = await ImagingCatalog.findOne({ tenantId: doctor.tenantId });
    if (!catalog) {
      // Simulate controller ensuring catalog
      console.log('No catalog found, creating a dummy one...');
      catalog = await ImagingCatalog.create({
        examinationCode: 'XR-TEST-100',
        examinationName: 'Test X-Ray',
        modality: 'X-Ray',
        category: 'Diagnostic',
        bodyPart: 'Chest',
        departmentId: department._id,
        contrastRequired: false,
        preparationInstructions: ['None'],
        estimatedDurationMinutes: 15,
        billingCode: 'RAD-001',
        activeStatus: true,
        tenantId: doctor.tenantId,
        hospitalId: doctor.hospitalId,
        createdBy: doctor._id
      });
    }

    // 3. Create Radiology Order
    console.log('Creating Radiology Order...');
    const orderNumber = `RAD-TEST-${Date.now()}`;
    const order = await RadiologyOrder.create({
      orderNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      departmentId: department._id,
      tenantId: doctor.tenantId,
      hospitalId: doctor.hospitalId,
      orderStatus: 'Requested',
      priority: 'Routine',
      items: [{ catalogId: catalog._id }],
      clinicalInformation: {
        clinicalNotes: 'Test order for verification',
      },
      createdBy: doctor._id
    });
    console.log(`Order created successfully: ${order.orderNumber}`);

    // 4. Retrieve Order
    const fetchedOrder = await RadiologyOrder.findById(order._id).populate('items.catalogId');
    if (!fetchedOrder) throw new Error('Order could not be fetched');
    console.log(`Fetched Order: ${fetchedOrder.orderNumber}, Status: ${fetchedOrder.orderStatus}`);

    // 5. Update Order
    console.log('Updating Order Priority to Urgent...');
    fetchedOrder.priority = 'Urgent';
    await fetchedOrder.save();
    console.log('Order Updated successfully');

    // 6. Cancel Order
    console.log('Cancelling Order...');
    fetchedOrder.orderStatus = 'Cancelled';
    fetchedOrder.cancellationReason = 'Test completion';
    fetchedOrder.items.forEach((item: any) => {
      item.status = 'Cancelled';
      item.cancellationReason = 'Test completion';
    });
    await fetchedOrder.save();
    console.log(`Order Cancelled, Status: ${fetchedOrder.orderStatus}`);

    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyRadiologyFeature();
