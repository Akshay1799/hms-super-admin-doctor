import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { DoctorProfile } from '../models/DoctorProfile';
import { HOSPITALS_CONFIG, DEFAULT_DEMO_PASSWORD } from './seed.config';
import { idMap } from './id-map';
import {
  INDIAN_MALE_FIRST_NAMES,
  INDIAN_FEMALE_FIRST_NAMES,
  INDIAN_LAST_NAMES,
  QUALIFICATIONS_LIST,
  getRandomElement,
  getRandomNumber,
  generateIndianPhone,
} from './helpers';

export const DOCTOR_SPECIALTIES = [
  { name: 'Dr. Rajesh Kulkarni', deptCode: 'CARD-OPD', spec: 'Cardiology', fee: 1200, exp: 18, gender: 'Male' as const },
  { name: 'Dr. Priya Sharma', deptCode: 'GEN-OPD', spec: 'General Medicine', fee: 800, exp: 12, gender: 'Female' as const },
  { name: 'Dr. Suresh Nambiar', deptCode: 'NEURO-OPD', spec: 'Neurology', fee: 1500, exp: 15, gender: 'Male' as const },
  { name: 'Dr. Anita Desai', deptCode: 'OBGY-DEPT', spec: 'Obstetrics & Gynaecology', fee: 1000, exp: 14, gender: 'Female' as const },
  { name: 'Dr. Vikram Patil', deptCode: 'ORTHO-OPD', spec: 'Orthopaedics', fee: 1100, exp: 10, gender: 'Male' as const },
  { name: 'Dr. Meera Joshi', deptCode: 'PAED-DEPT', spec: 'Paediatrics', fee: 900, exp: 9, gender: 'Female' as const },
  { name: 'Dr. Arun Bhosale', deptCode: 'EMERGENCY', spec: 'Emergency Medicine', fee: 1000, exp: 7, gender: 'Male' as const },
  { name: 'Dr. Sangeeta Rao', deptCode: 'DERM-OPD', spec: 'Dermatology', fee: 850, exp: 11, gender: 'Female' as const },
  { name: 'Dr. Deepak Srivastava', deptCode: 'PULMO-OPD', spec: 'Pulmonology', fee: 950, exp: 13, gender: 'Male' as const },
  { name: 'Dr. Kavita Menon', deptCode: 'PSYCH-DEPT', spec: 'Psychiatry', fee: 1200, exp: 8, gender: 'Female' as const },
  { name: 'Dr. Rohit Mehta', deptCode: 'NEPHRO-OPD', spec: 'Nephrology', fee: 1400, exp: 16, gender: 'Male' as const },
  { name: 'Dr. Sunita Agarwal', deptCode: 'ONCO-WARD', spec: 'Oncology', fee: 1600, exp: 12, gender: 'Female' as const },
  { name: 'Dr. Pratap Shinde', deptCode: 'ENT-OPD', spec: 'ENT Surgery', fee: 800, exp: 9, gender: 'Male' as const },
  { name: 'Dr. Nalini Iyer', deptCode: 'RADIOLOGY', spec: 'Radio-Diagnosis', fee: 1300, exp: 14, gender: 'Female' as const },
  { name: 'Dr. Ajay Khedkar', deptCode: 'DENTAL-OPD', spec: 'Dental Surgery', fee: 750, exp: 8, gender: 'Male' as const },
];

export async function seedUsersAndDoctorProfiles() {
  console.log('Seeding Users and DoctorProfiles...');

  // 0. SUPER_ADMIN (Platform Super Admin)
  const superAdminEmail = 'superadmin@medichain.com';
  let superAdmin = await User.findOne({ email: superAdminEmail });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: 'MediChain System Super Admin',
      email: superAdminEmail,
      password: DEFAULT_DEMO_PASSWORD, // Mongoose pre-save hook will hash this ONCE
      role: 'SUPER_ADMIN',
      status: 'Active',
      tenantId: null,
      hospitalId: null,
      phone: '+91 9900000000',
    });
    console.log(`Created Super Admin account: ${superAdminEmail}`);
  }

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const doctorUserIds: mongoose.Types.ObjectId[] = [];

    // A1. TENANT_ADMIN (Tenant Level Admin)
    const tenantAdminEmail = `tenant.admin@${config.emailDomain}`;
    let tenantAdminUser = await User.findOne({ email: tenantAdminEmail });
    if (!tenantAdminUser) {
      tenantAdminUser = await User.create({
        name: `${config.name} Group Tenant Admin`,
        email: tenantAdminEmail,
        password: DEFAULT_DEMO_PASSWORD,
        role: 'TENANT_ADMIN',
        status: 'Active',
        tenantId,
        hospitalId: null,
        phone: config.phone,
      });
    }
    idMap.users.set(`${config.code}:TENANT_ADMIN:${tenantAdminEmail}`, tenantAdminUser._id);

    // A2. HOSPITAL_ADMIN (Hospital Branch Level Admin)
    const adminEmail = `admin@${config.emailDomain}`;
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: `${config.name} Hospital Admin`,
        email: adminEmail,
        password: DEFAULT_DEMO_PASSWORD,
        role: 'HOSPITAL_ADMIN',
        status: 'Active',
        tenantId,
        hospitalId,
        phone: config.phone,
      });
    }
    idMap.users.set(`${config.code}:HOSPITAL_ADMIN:${adminEmail}`, adminUser._id);

    // B. HR_ADMIN
    const hrEmail = `hr@${config.emailDomain}`;
    let hrUser = await User.findOne({ email: hrEmail });
    if (!hrUser) {
      hrUser = await User.create({
        name: `HR Manager (${config.code})`,
        email: hrEmail,
        password: DEFAULT_DEMO_PASSWORD,
        role: 'STAFF', // HR Staff
        status: 'Active',
        tenantId,
        hospitalId,
        phone: generateIndianPhone(),
      });
    }

    // C. PHARMACY_MANAGER & PHARMACISTS
    const pharmMgrEmail = `pharmacy.manager@${config.emailDomain}`;
    let pharmMgr = await User.findOne({ email: pharmMgrEmail });
    if (!pharmMgr) {
      pharmMgr = await User.create({
        name: `Pharmacy Head (${config.code})`,
        email: pharmMgrEmail,
        password: DEFAULT_DEMO_PASSWORD,
        role: 'STAFF',
        status: 'Active',
        tenantId,
        hospitalId,
        phone: generateIndianPhone(),
      });
    }

    // D. 15 DOCTORS + DoctorProfiles
    for (let i = 0; i < DOCTOR_SPECIALTIES.length; i++) {
      const spec = DOCTOR_SPECIALTIES[i];
      const deptId = idMap.departmentByCode.get(`${config.code}:${spec.deptCode}`);
      const doctorEmail = `${spec.name.toLowerCase().replace(/dr\.\s*/, '').replace(/\s+/, '.')}@${config.emailDomain}`;

      let docUser = await User.findOne({ email: doctorEmail });
      if (!docUser) {
        docUser = await User.create({
          name: spec.name,
          email: doctorEmail,
          password: DEFAULT_DEMO_PASSWORD,
          role: 'DOCTOR',
          status: 'Active',
          tenantId,
          hospitalId,
          departmentId: deptId,
          specialty: spec.spec,
          qualifications: QUALIFICATIONS_LIST[i % QUALIFICATIONS_LIST.length],
          experience: spec.exp,
          consultationFee: spec.fee,
          consultationRoom: `Room ${101 + i}`,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          shiftStartTime: '09:00',
          shiftEndTime: '17:00',
          phone: generateIndianPhone(),
          bio: `Senior Specialist in ${spec.spec} with ${spec.exp} years of clinical excellence in Indore.`,
        });
      }
      doctorUserIds.push(docUser._id);
      idMap.users.set(`${config.code}:DOCTOR:${doctorEmail}`, docUser._id);

      // DoctorProfile document
      const nameParts = spec.name.replace('Dr. ', '').split(' ');
      let docProf = await DoctorProfile.findOne({ userId: docUser._id });
      if (!docProf) {
        docProf = await DoctorProfile.create({
          userId: docUser._id,
          tenantId,
          hospitalId,
          title: 'Dr.',
          firstName: nameParts[0],
          lastName: nameParts[1] || 'Sharma',
          gender: spec.gender,
          dateOfBirth: new Date(1975 + (i % 15), 4, 12),
          mobileNumber: docUser.phone,
          email: docUser.email,
          qualifications: [
            {
              degree: docUser.qualifications![0],
              specialization: spec.spec,
              university: 'MGM Medical College, Indore',
              institution: 'Devi Ahilya Vishwavidyalaya',
              country: 'India',
              completionYear: 2005 + (i % 10),
              registrationNumber: `MP-MMC-${2005 + i}-${1000 + i}`,
            },
          ],
          specializations: [
            {
              primarySpecialization: spec.spec,
              yearsOfExperience: spec.exp,
              activeStatus: true,
            },
          ],
          experience: [
            {
              hospitalName: config.name,
              organization: config.name + ' Trust',
              position: 'Senior Consultant',
              department: spec.spec,
              startDate: new Date(2018, 0, 1),
            },
          ],
          registrations: [
            {
              medicalRegistrationNumber: `MP-MMC-${2005 + i}-${1000 + i}`,
              registrationCouncil: 'Madhya Pradesh Medical Council',
              registrationDate: new Date(2005, 5, 15),
            },
          ],
          languages: ['Hindi', 'English', 'Malvi'],
          clinicalPrivileges: ['Outpatient Care', 'Inpatient Rounds', 'Emergency Triage'],
          departments: deptId ? [deptId] : [],
          status: 'Active',
        });
      }
      idMap.doctorProfiles.set(docUser._id.toString(), docProf._id);
    }
    idMap.doctors.set(config.code, doctorUserIds);

    // E. 15 NURSES
    for (let i = 1; i <= 15; i++) {
      const nurseGender = i % 2 === 0 ? 'Female' : 'Male';
      const nurseName = `${nurseGender === 'Female' ? getRandomElement(INDIAN_FEMALE_FIRST_NAMES) : getRandomElement(INDIAN_MALE_FIRST_NAMES)} ${getRandomElement(INDIAN_LAST_NAMES)}`;
      const nurseEmail = `nurse${i}@${config.emailDomain}`;

      let nurseUser = await User.findOne({ email: nurseEmail });
      if (!nurseUser) {
        nurseUser = await User.create({
          name: `Nurse ${nurseName}`,
          email: nurseEmail,
          password: DEFAULT_DEMO_PASSWORD,
          role: 'NURSE',
          status: 'Active',
          tenantId,
          hospitalId,
          departmentId: idMap.departments.get(config.code)![i % 25],
          phone: generateIndianPhone(),
          shiftStartTime: i % 2 === 0 ? '07:00' : '15:00',
          shiftEndTime: i % 2 === 0 ? '15:00' : '23:00',
        });
      }
    }

    // F. 4 RECEPTIONISTS
    for (let i = 1; i <= 4; i++) {
      const recEmail = `reception${i}@${config.emailDomain}`;
      let recUser = await User.findOne({ email: recEmail });
      if (!recUser) {
        recUser = await User.create({
          name: `Receptionist ${getRandomElement(INDIAN_FEMALE_FIRST_NAMES)} ${getRandomElement(INDIAN_LAST_NAMES)}`,
          email: recEmail,
          password: DEFAULT_DEMO_PASSWORD,
          role: 'RECEPTIONIST',
          status: 'Active',
          tenantId,
          hospitalId,
          phone: generateIndianPhone(),
        });
      }
    }

    // G. 20 OTHER STAFF (Lab, Pharmacy, Security, Billing, Housekeeping)
    for (let i = 1; i <= 20; i++) {
      const staffEmail = `staff${i}@${config.emailDomain}`;
      let staffUser = await User.findOne({ email: staffEmail });
      if (!staffUser) {
        staffUser = await User.create({
          name: `Staff ${getRandomElement(INDIAN_MALE_FIRST_NAMES)} ${getRandomElement(INDIAN_LAST_NAMES)}`,
          email: staffEmail,
          password: DEFAULT_DEMO_PASSWORD,
          role: 'STAFF',
          status: 'Active',
          tenantId,
          hospitalId,
          phone: generateIndianPhone(),
        });
      }
    }

    console.log(`Synced 60 User accounts + 15 DoctorProfiles for ${config.name}`);
  }

  // FIX ALL EXISTING USERS IN THE DB: Force password reset to DEFAULT_DEMO_PASSWORD
  // to ensure any previously double-hashed passwords in the database are corrected!
  console.log('Resetting all User passwords in MongoDB to ensure single-hash validity...');
  const validSingleHash = await bcrypt.hash(DEFAULT_DEMO_PASSWORD, 12);
  const result = await User.updateMany({}, { password: validSingleHash });
  console.log(`Successfully updated password for ${result.modifiedCount || result.matchedCount} user accounts.`);
}
