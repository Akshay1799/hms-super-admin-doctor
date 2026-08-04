import mongoose from 'mongoose';

export interface IHospitalConfig {
  code: string;
  name: string;
  type: 'General' | 'Specialty' | 'Teaching' | 'Clinic' | 'Diagnostic';
  domain: string;
  emailDomain: string;
  city: string;
  state: string;
  pincode: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  phone: string;
  contactEmail: string;
  website: string;
  gstin: string;
  registrationNumber: string;
  capacity: {
    totalBeds: number;
    icuBeds: number;
    otRooms: number;
    ambulances: number;
    emergencyBeds: number;
  };
  accreditation: {
    nabh: boolean;
    jci: boolean;
    iso: boolean;
  };
}

export const HOSPITALS_CONFIG: IHospitalConfig[] = [
  {
    code: 'MEDIPLUS',
    name: 'MediPlus Hospital',
    type: 'Teaching',
    domain: 'mediplus.hospital.com',
    emailDomain: 'med.hospital.com',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    address: {
      street: 'Plot 45-48, AB Road, Near Vijay Nagar Square',
      city: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
      pincode: '452010',
    },
    phone: '+91 731 4256700',
    contactEmail: 'info@med.hospital.com',
    website: 'https://mediplus.hospital.com',
    gstin: '23AABCM1234A1Z5',
    registrationNumber: 'MP-IND-2010-0042',
    capacity: {
      totalBeds: 250,
      icuBeds: 20,
      otRooms: 4,
      ambulances: 4,
      emergencyBeds: 15,
    },
    accreditation: {
      nabh: true,
      jci: true,
      iso: true,
    },
  },
  {
    code: 'VIVEKMEM',
    name: 'Vivek Memorial Hospital',
    type: 'Clinic', // Tagged / working as separate Clinic as requested
    domain: 'vivekmemorial.hospital.com',
    emailDomain: 'vmh.hospital.com',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    address: {
      street: '12/1 Old Palasia, Main Road',
      city: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
      pincode: '452001',
    },
    phone: '+91 731 2548900',
    contactEmail: 'contact@vmh.hospital.com',
    website: 'https://vivekmemorial.hospital.com',
    gstin: '23AADVH5678B1Z9',
    registrationNumber: 'MP-IND-2014-0117',
    capacity: {
      totalBeds: 45,
      icuBeds: 4,
      otRooms: 2,
      ambulances: 2,
      emergencyBeds: 6,
    },
    accreditation: {
      nabh: true,
      jci: false,
      iso: true,
    },
  },
  {
    code: 'RKHOSPITAL',
    name: 'R K Hospital',
    type: 'Specialty',
    domain: 'rkhospital.com',
    emailDomain: 'rkh.hospital.com',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452012',
    address: {
      street: 'Sector B, Scheme 54, Near Ring Road',
      city: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
      pincode: '452012',
    },
    phone: '+91 731 4981200',
    contactEmail: 'care@rkh.hospital.com',
    website: 'https://rkhospital.com',
    gstin: '23AACRK9012C1Z3',
    registrationNumber: 'MP-IND-2017-0203',
    capacity: {
      totalBeds: 160,
      icuBeds: 12,
      otRooms: 3,
      ambulances: 3,
      emergencyBeds: 10,
    },
    accreditation: {
      nabh: true,
      jci: false,
      iso: true,
    },
  },
];

export const INDORE_LOCALITIES = [
  'Vijay Nagar',
  'Old Palasia',
  'New Palasia',
  'Bhanwarkuan',
  'Saket Nagar',
  'Annapurna Road',
  'MG Road',
  'Super Corridor',
  'Rau',
  'Khajrana',
  'Tilak Nagar',
  'Manorama Ganj',
  'Geeta Bhavan',
  'Scheme 78',
  'Sudama Nagar',
  'LIG Colony',
  'Mahalaxmi Nagar',
];

export const DEFAULT_DEMO_PASSWORD = 'HmsDemo@2026';
