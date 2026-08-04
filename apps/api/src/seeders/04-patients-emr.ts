import mongoose from 'mongoose';
import { Patient } from '../models/Patient';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import {
  INDIAN_MALE_FIRST_NAMES,
  INDIAN_FEMALE_FIRST_NAMES,
  INDIAN_LAST_NAMES,
  getRandomElement,
  getRandomNumber,
  generateIndianPhone,
  generateIndoreAddress,
  getRandomDateInPast,
} from './helpers';

export const COMMON_DIAGNOSES = [
  { code: 'I10', desc: 'Essential (primary) hypertension' },
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
  { code: 'J44.9', desc: 'Chronic obstructive pulmonary disease, unspecified' },
  { code: 'K29.7', desc: 'Gastritis, unspecified' },
  { code: 'M25.561', desc: 'Pain in right knee' },
  { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified' },
  { code: 'N39.0', desc: 'Urinary tract infection, site not specified' },
  { code: 'A91', desc: 'Dengue haemorrhagic fever' },
  { code: 'E03.9', desc: 'Hypothyroidism, unspecified' },
  { code: 'I25.10', desc: 'Atherosclerotic heart disease of native coronary artery' },
  { code: 'K35.80', desc: 'Unspecified acute appendicitis' },
  { code: 'O80', desc: 'Encounter for full-term uncomplicated delivery' },
];

export async function seedPatientsAndEMR() {
  console.log('Seeding Patients with EMR History...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const doctorIds = idMap.doctors.get(config.code)!;
    const deptIds = idMap.departments.get(config.code)!;
    const patientIds: mongoose.Types.ObjectId[] = [];

    // Check count of existing patients for this tenant/hospital to preserve existing data
    const existingCount = await Patient.countDocuments({ tenantId, hospitalId });
    const countToSeed = Math.max(0, 100 - existingCount);

    if (countToSeed === 0) {
      console.log(`Preserving ${existingCount} existing Patients for ${config.name}`);
      const existingPatients = await Patient.find({ tenantId, hospitalId }).select('_id uhid');
      existingPatients.forEach((p) => {
        patientIds.push(p._id);
        idMap.patientByUhid.set(p.uhid, p._id);
      });
      idMap.patients.set(config.code, patientIds);
      continue;
    }

    const year = new Date().getFullYear();

    for (let i = 1; i <= countToSeed; i++) {
      const idx = existingCount + i;
      const gender = i % 2 === 0 ? 'Female' : 'Male';
      const firstName = gender === 'Female' ? getRandomElement(INDIAN_FEMALE_FIRST_NAMES) : getRandomElement(INDIAN_MALE_FIRST_NAMES);
      const lastName = getRandomElement(INDIAN_LAST_NAMES);
      const assignedDoctorId = getRandomElement(doctorIds);
      const assignedDeptId = getRandomElement(deptIds);
      const uhid = `HMS-${year}-${config.code.substring(0, 3)}-${String(idx).padStart(5, '0')}`;

      let patientStatus: 'Active' | 'Admitted' | 'ICU' | 'Follow-up Due' | 'Discharged' = 'Active';
      if (i <= 15) patientStatus = 'Admitted';
      else if (i <= 20) patientStatus = 'ICU';
      else if (i <= 35) patientStatus = 'Discharged';
      else if (i <= 50) patientStatus = 'Follow-up Due';

      const diag = getRandomElement(COMMON_DIAGNOSES);
      const address = generateIndoreAddress();

      let patient = await Patient.findOne({ uhid });
      if (!patient) {
        patient = await Patient.create({
          tenantId,
          hospitalId,
          departmentId: assignedDeptId,
          uhid,
          name: firstName,
          lastName,
          age: getRandomNumber(18, 78),
          dateOfBirth: getRandomDateInPast(365 * 40),
          gender,
          bloodGroup: getRandomElement(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']),
          maritalStatus: getRandomElement(['Married', 'Single']),
          occupation: getRandomElement(['Engineer', 'Teacher', 'Business', 'Homemaker', 'Retired', 'Student', 'Accountant']),
          nationality: 'Indian',
          preferredLanguage: 'Hindi',
          phone: generateIndianPhone(),
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
          address,
          emergencyContact: {
            name: `${getRandomElement(INDIAN_MALE_FIRST_NAMES)} ${lastName}`,
            relation: getRandomElement(['Spouse', 'Father', 'Brother', 'Son']),
            phone: generateIndianPhone(),
          },
          status: patientStatus,
          ward: patientStatus === 'ICU' ? 'ICU Ward' : patientStatus === 'Admitted' ? 'General Ward' : undefined,
          bedNumber: (patientStatus === 'Admitted' || patientStatus === 'ICU') ? `Bed-${100 + i}` : undefined,
          assignedDoctorId,
          allergies: i % 4 === 0 ? [getRandomElement(['Penicillin', 'Sulfa Drugs', 'Dust', 'Peanuts'])] : [],
          medicalHistory: [diag.desc],
          vitals: [
            {
              timestamp: getRandomDateInPast(5),
              bpSystolic: getRandomNumber(110, 140),
              bpDiastolic: getRandomNumber(70, 90),
              temperature: getRandomNumber(98, 100),
              pulse: getRandomNumber(68, 88),
              spo2: getRandomNumber(95, 99),
              weight: getRandomNumber(52, 85),
              recordedBy: 'Staff Nurse',
            },
          ],
          diagnoses: [
            {
              code: diag.code,
              description: diag.desc,
              date: getRandomDateInPast(10),
              status: 'Active',
              diagnosedBy: 'Assigned Doctor',
            },
          ],
          medications: [
            {
              name: getRandomElement(['Dolo 650', 'Pan 40', 'Amlokind 5', 'Glycomet 500']),
              dose: '1 Tablet',
              frequency: '1-0-1',
              duration: '5 Days',
              timing: 'After Food',
              status: 'Active',
              prescribedBy: 'Dr. Specialist',
              startDate: getRandomDateInPast(5),
            },
          ],
          soapNotes: [
            {
              date: getRandomDateInPast(3),
              author: 'Consultant Doctor',
              subjective: `Patient complains of mild weakness and ${diag.desc.toLowerCase()}.`,
              objective: 'Vitals stable. Chest clear. No acute distress observed.',
              assessment: diag.desc,
              plan: 'Continue current medications. Review after 5 days with lab reports.',
            },
          ],
          timeline: [
            {
              title: 'Patient Registration',
              description: 'Registered at Indore Front Desk',
              date: getRandomDateInPast(15),
              type: 'registration',
            },
            {
              title: 'Consultation & Diagnosis',
              description: `Diagnosed with ${diag.desc}`,
              date: getRandomDateInPast(10),
              type: 'diagnosis',
            },
          ],
          admissionDate: (patientStatus === 'Admitted' || patientStatus === 'ICU') ? getRandomDateInPast(4) : undefined,
        });
      }
      patientIds.push(patient._id);
      idMap.patientByUhid.set(uhid, patient._id);
    }
    idMap.patients.set(config.code, patientIds);
    console.log(`Synced 100 Patient EMR records for ${config.name}`);
  }
}
