import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info('✅ MongoDB Atlas connected successfully');

    // Auto seed default super admin
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established fully');
    }
    
    // Import models dynamically to prevent circular dependencies
    const { User } = await import('../models/User');
    const { Tenant } = await import('../models/Tenant');
    const { Hospital } = await import('../models/Hospital');
    const { Department } = await import('../models/Department');
    const { Patient } = await import('../models/Patient');
    const { Invoice } = await import('../models/Billing');

    logger.info('🌱 Verifying seed credentials in database...');

    // 1. Check/Create Super Admin
    let superAdmin = await User.findOne({ email: 'admin@medichain.com' });
    if (!superAdmin) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@medichain.com',
        password: 'password123',
        role: 'SUPER_ADMIN',
        status: 'Active',
        tenantId: null,
        hospitalId: null,
        departmentId: null
      });
      logger.info('   -> Created default Super Admin account');
    }

    // 2. Check/Create Tenant
    let tenant = await Tenant.findOne({ code: 'APOLLO' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Apollo Clinics',
        code: 'APOLLO',
        plan: 'enterprise',
        status: 'Active'
      });
      logger.info('   -> Created default Tenant (APOLLO)');
    }

    // 2.5 Check/Create Tenant Admin
    let tenantAdmin = await User.findOne({ email: 'tenant@apollo.com' });
    if (!tenantAdmin) {
      await User.create({
        name: 'Apollo Group Executive',
        email: 'tenant@apollo.com',
        password: 'password123',
        role: 'TENANT_ADMIN',
        status: 'Active',
        tenantId: tenant._id,
        hospitalId: null,
        departmentId: null
      });
      logger.info('   -> Created default Tenant Admin (tenant@apollo.com)');
    }

    // 3. Check/Create Hospital
    let hospital = await Hospital.findOne({ code: 'APOLLO-DEL' });
    if (!hospital) {
      hospital = await Hospital.create({
        tenantId: tenant._id,
        name: 'Apollo Delhi',
        code: 'APOLLO-DEL',
        type: 'General',
        status: 'Active'
      });
      logger.info('   -> Created default Hospital (APOLLO-DEL)');
    }

    // 4. Check/Create Department
    let department = await Department.findOne({ code: 'CARD-01' });
    if (!department) {
      department = await Department.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        name: 'Cardiology Unit',
        code: 'CARD-01',
        type: 'opd',
        status: 'Active'
      });
      logger.info('   -> Created default Department (CARD-01)');
    }

    // 5. Check/Create Doctor
    let doctor = await User.findOne({ email: 'doctor@medichain.com' });
    if (!doctor) {
      doctor = await User.create({
        name: 'Dr. Shweta',
        email: 'doctor@medichain.com',
        password: 'password123',
        role: 'DOCTOR',
        status: 'Active',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id,
        specialty: 'Cardiologist'
      });
      logger.info('   -> Created default Doctor (doctor@medichain.com)');
    }

    // 6. Check/Create Hospital Admin
    let hospitalAdmin = await User.findOne({ email: 'admin@hospital.com' });
    if (!hospitalAdmin) {
      await User.create({
        name: 'Hospital Admin',
        email: 'admin@hospital.com',
        password: 'password123',
        role: 'HOSPITAL_ADMIN',
        status: 'Active',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: null
      });
      logger.info('   -> Created default Hospital Admin (admin@hospital.com)');
    }

    // 6.5 Check/Create Department Admin
    let deptAdmin = await User.findOne({ email: 'dept@hospital.com' });
    if (!deptAdmin) {
      await User.create({
        name: 'Cardiology Admin',
        email: 'dept@hospital.com',
        password: 'password123',
        role: 'DEPT_ADMIN',
        status: 'Active',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
      logger.info('   -> Created default Department Admin (dept@hospital.com)');
    }

    // 7. Check/Create Patient User & Patient EMR record & unpaid Invoice
    let patientUser = await User.findOne({ email: 'patient@medichain.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'Rahul Sharma',
        email: 'patient@medichain.com',
        password: 'password123',
        role: 'PATIENT',
        status: 'Active',
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id
      });
      logger.info('   -> Created default Patient User (patient@medichain.com)');
    }

    let patientRecord = await Patient.findOne({ email: 'patient@medichain.com' });
    if (!patientRecord) {
      patientRecord = await Patient.create({
        tenantId: tenant._id,
        hospitalId: hospital._id,
        departmentId: department._id,
        name: 'Rahul Sharma',
        age: 32,
        gender: 'Male',
        email: 'patient@medichain.com',
        phone: '+91 9988776655',
        status: 'Admitted',
        ward: 'Emergency ICU',
        bedNumber: 'Bed B-04',
        assignedDoctorId: doctor._id,
        bloodGroup: 'O+',
        allergies: ['Dust', 'Penicillin'],
        medicalHistory: ['Mild asthma diagnosed in 2021'],
        vitals: [
          {
            timestamp: new Date(Date.now() - 3 * 3600 * 1000),
            bpSystolic: 122,
            bpDiastolic: 80,
            temperature: 98.6,
            spo2: 99,
            pulse: 72,
            recordedBy: 'Nurse Alice'
          },
          {
            timestamp: new Date(Date.now() - 1 * 3600 * 1000),
            bpSystolic: 125,
            bpDiastolic: 82,
            temperature: 99.1,
            spo2: 98,
            pulse: 75,
            recordedBy: 'Nurse Alice'
          }
        ],
        medications: [
          {
            name: 'Amlodipine 5mg',
            dose: '1 tablet',
            frequency: 'Once Daily',
            duration: '30 Days',
            timing: 'Morning',
            foodInstructions: 'After Food',
            status: 'Active',
            prescribedBy: 'Dr. Shweta',
            startDate: new Date()
          },
          {
            name: 'Paracetamol 650mg',
            dose: '1 tablet',
            frequency: 'As needed (SOS)',
            duration: '5 Days',
            timing: 'When fever > 100F',
            foodInstructions: 'After Food',
            status: 'Active',
            prescribedBy: 'Dr. Shweta',
            startDate: new Date()
          }
        ],
        diagnoses: [
          {
            code: 'I10',
            description: 'Essential (primary) hypertension',
            date: new Date(),
            status: 'Active',
            diagnosedBy: 'Dr. Shweta'
          }
        ],
        timeline: [
          {
            title: 'Initial Consultation Assessment',
            description: 'Vitals logged, hypertension suspected.',
            date: new Date(Date.now() - 4 * 3600 * 1000),
            type: 'vital',
            createdBy: 'Dr. Shweta'
          },
          {
            title: 'Admitted to Ward ICU',
            description: 'Emergency ICU bed B-04 allocated.',
            date: new Date(Date.now() - 3 * 3600 * 1000),
            type: 'admission',
            createdBy: 'Hospital Admin'
          }
        ]
      });
      logger.info('   -> Created default Patient EMR Record');
    }

    // Check/Create Invoice
    let invoice = await Invoice.findOne({ invoiceNumber: 'INV-2026-0001', isDeleted: false });
    if (!invoice) {
      try {
        await Invoice.create({
          tenantId: tenant._id,
          hospitalId: hospital._id,
          patientId: patientRecord._id,
          invoiceNumber: 'INV-2026-0001',
          tenantName: 'Apollo Delhi',
          patientName: 'Rahul Sharma',
          amount: 1500,
          totalAmount: 1500,
          currency: 'INR',
          status: 'unpaid',
          issuedDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          items: [
            {
              itemId: 'ITEM-ICU-01',
              itemName: 'ICU Day Consultation Charges',
              quantity: 1,
              unitPrice: 1500,
              total: 1500
            }
          ]
        });
        logger.info('   -> Created default Unpaid Invoice (INV-2026-0001)');
      } catch (err: any) {
        if (err.code !== 11000) throw err;
      }
    }

    logger.info('🌱 Verification complete! Credentials:');
    logger.info('   - Super Admin: admin@medichain.com / password123');
    logger.info('   - Doctor:      doctor@medichain.com / password123');
    logger.info('   - Hospital:    admin@hospital.com / password123');
    logger.info('   - Dept Admin:  dept@hospital.com / password123');
    logger.info('   - Patient:     patient@medichain.com / password123');

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    logger.error('🔧 Make sure your MONGODB_URI in .env is correct.');
    process.exit(1);
  }
}

export function getDBStatus(): { connected: boolean; host: string | undefined } {
  return {
    connected: isConnected,
    host: mongoose.connection.host,
  };
}
// Trigger nodemon reload
