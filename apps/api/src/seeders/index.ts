import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from apps/api/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { seedTenantsHospitalsAndDepartments } from './01-tenants-hospitals-depts';
import { seedUsersAndDoctorProfiles } from './02-users-doctors';
import { seedMedicinesAndInventory } from './03-medicines-inventory';
import { seedPatientsAndEMR } from './04-patients-emr';
import { seedAppointmentsEncountersAndPrescriptions } from './05-appointments-encounters';
import { seedProcurementChain } from './06-procurement-suppliers';
import { seedBillingLedgerAndFinance } from './07-billing-ledger';
import { seedRostersWorkflowsAndAuditLogs } from './08-rosters-workflows';

async function runMasterSeeder() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI is not defined in environment variables!');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('  MediChain HMS Master Production Seed Generator   ');
  console.log('====================================================');
  console.log(`Connecting to MongoDB...`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.\n');

    const startTime = Date.now();

    // Step 1: Tenants, Hospitals (Indore), Departments
    await seedTenantsHospitalsAndDepartments();

    // Step 2: Users (Staff/Nurses/Admins) & Doctor Profiles (@med.hospital.com, @vmh.hospital.com, @rkh.hospital.com)
    await seedUsersAndDoctorProfiles();

    // Step 3: Medicines, Suppliers, Pharmacy Locations, Batches
    await seedMedicinesAndInventory();

    // Step 4: Patients with EMR histories (Vitals, Diagnoses, Medications, SOAP notes)
    await seedPatientsAndEMR();

    // Step 5: Appointments, Encounters, Prescriptions
    await seedAppointmentsEncountersAndPrescriptions();

    // Step 6: Procurement (Requisitions, POs, GRNs)
    await seedProcurementChain();

    // Step 7: Billing, Payments, Ledger Entries, TPA, IPD, Wallets
    await seedBillingLedgerAndFinance();

    // Step 8: Rosters, Workflows, Controlled Drugs, Audit Logs
    await seedRostersWorkflowsAndAuditLogs();

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n====================================================');
    console.log(`  Seeding Completed Successfully in ${elapsedSec}s!  `);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding execution:', error);
    process.exit(1);
  }
}

runMasterSeeder();
