import mongoose from 'mongoose';
import { Tenant } from '../models/Tenant';
import { Hospital } from '../models/Hospital';
import { Department, DepartmentType } from '../models/Department';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';

export interface IDepartmentSpec {
  name: string;
  code: string;
  type: DepartmentType;
  description: string;
  location: string;
  totalBeds: number;
  is24Hours: boolean;
}

export const DEPARTMENTS_SPEC: IDepartmentSpec[] = [
  { name: 'General Medicine OPD', code: 'GEN-OPD', type: 'opd', description: 'Outpatient consultation for general health and fever', location: 'Ground Floor, Block A', totalBeds: 0, is24Hours: false },
  { name: 'General Medicine Ward', code: 'GEN-WARD', type: 'ipd', description: 'Inpatient ward for general internal medicine', location: 'Floor 1, Block A', totalBeds: 30, is24Hours: true },
  { name: 'Cardiology OPD', code: 'CARD-OPD', type: 'opd', description: 'Cardiac consultation & non-invasive diagnostic clinic', location: 'Floor 1, Block B', totalBeds: 0, is24Hours: false },
  { name: 'Cardiology ICU (CCU)', code: 'CARD-ICU', type: 'icu', description: 'Coronary Care Unit for acute cardiac patients', location: 'Floor 2, Block B', totalBeds: 8, is24Hours: true },
  { name: 'Neurology Department', code: 'NEURO-OPD', type: 'opd', description: 'Neurological evaluation and consultation', location: 'Floor 2, Block A', totalBeds: 0, is24Hours: false },
  { name: 'Neurology Inpatient Ward', code: 'NEURO-WARD', type: 'ipd', description: 'Stroke unit and general neurology ward', location: 'Floor 2, Block A', totalBeds: 12, is24Hours: true },
  { name: 'Orthopaedics OPD', code: 'ORTHO-OPD', type: 'opd', description: 'Bone, joint & trauma consultation', location: 'Ground Floor, Block B', totalBeds: 0, is24Hours: false },
  { name: 'Orthopaedics Ward', code: 'ORTHO-WARD', type: 'ipd', description: 'Post-surgical orthopaedic recovery ward', location: 'Floor 3, Block B', totalBeds: 15, is24Hours: true },
  { name: 'Paediatrics Ward & OPD', code: 'PAED-DEPT', type: 'paediatrics', description: 'Child care, vaccination and paediatric ward', location: 'Floor 1, Block C', totalBeds: 10, is24Hours: true },
  { name: 'Obstetrics & Gynaecology', code: 'OBGY-DEPT', type: 'maternity', description: 'Maternity care, labour room, and gynaecology ward', location: 'Floor 2, Block C', totalBeds: 15, is24Hours: true },
  { name: 'ENT Clinic', code: 'ENT-OPD', type: 'opd', description: 'Ear, Nose, Throat diagnosis & minor procedures', location: 'Ground Floor, Block C', totalBeds: 0, is24Hours: false },
  { name: 'Dermatology Clinic', code: 'DERM-OPD', type: 'opd', description: 'Skin, hair and cosmetic treatment center', location: 'Floor 1, Block B', totalBeds: 0, is24Hours: false },
  { name: 'Psychiatry & Behavioural Health', code: 'PSYCH-DEPT', type: 'psychiatry', description: 'Mental health and counselling unit', location: 'Floor 3, Block A', totalBeds: 8, is24Hours: true },
  { name: 'Nephrology & Dialysis', code: 'NEPHRO-OPD', type: 'opd', description: 'Kidney care & outpatient dialysis services', location: 'Ground Floor, Block D', totalBeds: 6, is24Hours: true },
  { name: 'Pulmonology Clinic', code: 'PULMO-OPD', type: 'opd', description: 'Chest, asthma and sleep apnea consultation', location: 'Floor 2, Block B', totalBeds: 0, is24Hours: false },
  { name: 'Oncology Unit', code: 'ONCO-WARD', type: 'ipd', description: 'Daycare chemotherapy & oncology inpatient ward', location: 'Floor 4, Block B', totalBeds: 10, is24Hours: true },
  { name: 'Emergency & Casualty', code: 'EMERGENCY', type: 'emergency', description: '24/7 Trauma, acute emergency triage and resuscitation', location: 'Ground Floor, Emergency Gate', totalBeds: 15, is24Hours: true },
  { name: 'Medical Intensive Care (MICU)', code: 'MICU', type: 'icu', description: 'Multi-disciplinary intensive care unit', location: 'Floor 2, Emergency Block', totalBeds: 12, is24Hours: true },
  { name: 'Operation Theatre Complex', code: 'OT-COMPLEX', type: 'surgical', description: 'Modular operation theatres for major surgeries', location: 'Floor 3, Surgical Block', totalBeds: 0, is24Hours: true },
  { name: 'Radiology & Imaging', code: 'RADIOLOGY', type: 'diagnostic', description: 'X-Ray, 128-Slice CT Scan, 3T MRI, Ultrasound', location: 'Basement 1, Main Building', totalBeds: 0, is24Hours: true },
  { name: 'Central Pathology Laboratory', code: 'PATHOLOGY', type: 'laboratory', description: 'Haematology, Biochemistry, Microbiology, Histopathology', location: 'Basement 1, Main Building', totalBeds: 0, is24Hours: true },
  { name: 'Central Pharmacy', code: 'PHARMACY', type: 'pharmacy', description: '24/7 Retail & IPD inpatient medicine counter', location: 'Ground Floor Lobby', totalBeds: 0, is24Hours: true },
  { name: 'Physiotherapy & Rehab', code: 'PHYSIO-DEPT', type: 'physiotherapy', description: 'Physical rehabilitation, electrotherapy and exercise gym', location: 'Ground Floor, Block D', totalBeds: 5, is24Hours: false },
  { name: 'Dental Surgery Unit', code: 'DENTAL-OPD', type: 'opd', description: 'Comprehensive oral healthcare & maxillofacial surgery', location: 'Floor 1, Block D', totalBeds: 0, is24Hours: false },
  { name: 'Hospital Administration & HR', code: 'ADMIN-DEPT', type: 'other', description: 'Executive admin offices, billing counters, and HR', location: 'Floor 4, Block A', totalBeds: 0, is24Hours: false },
];

export async function seedTenantsHospitalsAndDepartments() {
  console.log('Seeding Tenants, Hospitals, and Departments...');

  for (const config of HOSPITALS_CONFIG) {
    // 1. Tenant
    let tenant = await Tenant.findOne({ code: config.code });
    if (!tenant) {
      tenant = await Tenant.create({
        name: config.name + ' Group',
        code: config.code,
        plan: config.code === 'MEDIPLUS' ? 'enterprise' : 'professional',
        status: 'Active',
        contactEmail: config.contactEmail,
        contactPhone: config.phone,
        website: config.website,
        address: `${config.address.street}, ${config.address.city}, ${config.address.state}`,
        domain: config.domain,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
        featureFlags: {
          emr: true,
          appointments: true,
          billing: true,
          pharmacy: true,
          inventory: true,
          laboratory: true,
          radiology: true,
          insurance: true,
          telemedicine: true,
          notifications: true,
          reports: true,
        },
        quotas: {
          maxHospitals: 3,
          maxBranches: 5,
          maxDoctors: 50,
          maxStaff: 150,
          maxPatients: 5000,
          maxStorageGb: 100,
          maxApiCallsPerDay: 50000,
        },
      });
      console.log(`Created Tenant: ${tenant.name}`);
    } else {
      console.log(`Preserved existing Tenant: ${tenant.name}`);
    }
    idMap.tenants.set(config.code, tenant._id);

    // 2. Hospital
    let hospital = await Hospital.findOne({ tenantId: tenant._id, code: config.code });
    if (!hospital) {
      hospital = await Hospital.create({
        tenantId: tenant._id,
        name: config.name,
        code: config.code,
        type: config.type,
        status: 'Active',
        email: config.contactEmail,
        phone: config.phone,
        website: config.website,
        address: config.address,
        capacity: config.capacity,
        accreditation: config.accreditation,
        settings: {
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          language: 'en',
          workingHours: { open: '00:00', close: '23:59' },
        },
      });
      console.log(`Created Hospital: ${hospital.name} (${hospital.type}) in ${config.city}`);
    } else {
      console.log(`Preserved existing Hospital: ${hospital.name}`);
    }
    idMap.hospitals.set(config.code, hospital._id);

    // 3. Departments
    const deptIds: mongoose.Types.ObjectId[] = [];
    for (const spec of DEPARTMENTS_SPEC) {
      let dept = await Department.findOne({ hospitalId: hospital._id, code: spec.code });
      if (!dept) {
        dept = await Department.create({
          tenantId: tenant._id,
          hospitalId: hospital._id,
          name: spec.name,
          code: spec.code,
          type: spec.type,
          description: spec.description,
          location: spec.location,
          status: 'Active',
          totalBeds: spec.totalBeds,
          occupiedBeds: Math.floor(spec.totalBeds * 0.6), // Realistic 60% occupancy
          workingHours: {
            open: '08:00',
            close: '20:00',
            is24Hours: spec.is24Hours,
          },
          extension: String(100 + deptIds.length),
          email: `${spec.code.toLowerCase()}@${config.emailDomain}`,
        });
      }
      deptIds.push(dept._id);
      idMap.departmentByCode.set(`${config.code}:${spec.code}`, dept._id);
    }
    idMap.departments.set(config.code, deptIds);
    console.log(`Synced 25 departments for ${config.name}`);

    // Update Hospital denormalized counts
    hospital.departmentCount = DEPARTMENTS_SPEC.length;
    hospital.bedCount = DEPARTMENTS_SPEC.reduce((sum, d) => sum + d.totalBeds, 0);
    await hospital.save();
  }
}
