import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { HOSPITALS_CONFIG } from './seed.config';
import { idMap } from './id-map';
import { getRandomElement, getRandomNumber, getRandomDateInPast, getRandomDateInFuture } from './helpers';

export async function seedAppointmentsEncountersAndPrescriptions() {
  console.log('Seeding Appointments, Encounters, and Prescriptions...');

  for (const config of HOSPITALS_CONFIG) {
    const tenantId = idMap.tenants.get(config.code)!;
    const hospitalId = idMap.hospitals.get(config.code)!;
    const doctorUserIds = idMap.doctors.get(config.code)!;
    const patientIds = idMap.patients.get(config.code)!;
    const deptIds = idMap.departments.get(config.code)!;

    const aptIds: mongoose.Types.ObjectId[] = [];
    const year = new Date().getFullYear();

    // Fetch details for doctor & patient mapping
    const doctors = await User.find({ _id: { $in: doctorUserIds } }).select('_id name specialty');
    const patients = await Patient.find({ _id: { $in: patientIds } }).select('_id name lastName uhid phone');

    // 1. Appointments (150 per hospital)
    const existingApts = await Appointment.countDocuments({ tenantId, hospitalId });
    const aptsToSeed = Math.max(0, 150 - existingApts);

    for (let a = 1; a <= aptsToSeed; a++) {
      const doctor = getRandomElement(doctors);
      const patient = getRandomElement(patients);
      const deptId = getRandomElement(deptIds);
      const isPast = a <= 100;
      const aptDate = isPast ? getRandomDateInPast(25) : getRandomDateInFuture(10);
      const aptNumber = `APT-${year}-${config.code.substring(0, 3)}-${String(existingApts + a).padStart(6, '0')}`;

      let status: 'Completed' | 'Scheduled' | 'Confirmed' | 'Checked-In' | 'Cancelled' | 'In Consultation' = 'Completed';
      if (!isPast) {
        status = a % 3 === 0 ? 'Confirmed' : a % 4 === 0 ? 'Checked-In' : 'Scheduled';
      } else if (a % 10 === 0) {
        status = 'Cancelled';
      }

      let appointment = await Appointment.findOne({ appointmentNumber: aptNumber });
      if (!appointment) {
        appointment = await Appointment.create({
          tenantId,
          hospitalId,
          departmentId: deptId,
          patientId: patient._id,
          patientName: `${patient.name} ${patient.lastName || ''}`.trim(),
          patientPhone: patient.phone,
          doctorId: doctor._id,
          doctorName: doctor.name,
          appointmentNumber: aptNumber,
          tokenNumber: (a % 30) + 1,
          queuePosition: (a % 10) + 1,
          date: aptDate,
          time: `${String(9 + (a % 8)).padStart(2, '0')}:${(a % 2 === 0 ? '00' : '30')}`,
          duration: 15,
          type: getRandomElement(['New Consultation', 'Follow-up', 'Emergency Consultation', 'Walk-in', 'Procedure Consultation']),
          status,
          priorityLevel: a % 15 === 0 ? 'Emergency' : a % 8 === 0 ? 'Senior Citizen' : 'Normal',
          symptoms: getRandomElement(['Fever and cough', 'Knee joint pain', 'High blood pressure review', 'Chest tightness', 'Skin rash', 'Stomach ache']),
        });
      }
      aptIds.push(appointment._id);

      // 2. Encounter for each past non-cancelled appointment
      if (isPast && status === 'Completed') {
        const visitNumber = `OPD-${year}-${config.code.substring(0, 3)}-${String(a).padStart(6, '0')}`;
        let encounter = await Encounter.findOne({ visitNumber });
        if (!encounter) {
          await Encounter.create({
            tenantId,
            hospitalId,
            departmentId: deptId,
            patientId: patient._id,
            visitNumber,
            encounterType: 'OPD',
            category: 'New Visit',
            doctorId: doctor._id,
            status: 'Completed',
            notes: `Completed consultation with ${doctor.name}`,
          });
        }

        // 3. Prescription for past consultation
        if (a <= 95) {
          let rx = await Prescription.findOne({ tenantId, patientId: patient._id, doctorId: doctor._id, appointmentId: appointment._id });
          if (!rx) {
            await Prescription.create({
              tenantId,
              hospitalId,
              departmentId: deptId,
              patientId: patient._id,
              patientName: `${patient.name} ${patient.lastName || ''}`.trim(),
              uhid: patient.uhid,
              doctorId: doctor._id,
              doctorName: doctor.name,
              appointmentId: appointment._id,
              visitType: 'OPD',
              vitals: {
                bpSystolic: getRandomNumber(115, 135),
                bpDiastolic: getRandomNumber(75, 85),
                pulse: getRandomNumber(70, 84),
                temperature: 98.6,
                spo2: 98,
              },
              symptoms: [appointment.symptoms || 'General weakness'],
              diagnoses: [
                {
                  code: 'I10',
                  description: 'Essential Primary Hypertension',
                  type: 'Primary',
                },
              ],
              medicines: [
                {
                  name: 'Augmentin 625 Duo',
                  category: 'Tablet',
                  dosage: '625mg',
                  frequency: '1-0-1',
                  duration: '5 Days',
                  instructions: 'After Food',
                },
                {
                  name: 'Pan 40',
                  category: 'Tablet',
                  dosage: '40mg',
                  frequency: '1-0-0',
                  duration: '5 Days',
                  instructions: 'Before Breakfast',
                },
              ],
              consultationNotes: 'Patient advised warm saline gargles, adequate rest and follow-up after 5 days.',
              followUpDate: getRandomDateInFuture(5),
            });
          }
        }
      }
    }
    idMap.appointments.set(config.code, aptIds);
    console.log(`Synced 150 Appointments, Encounters, and Prescriptions for ${config.name}`);
  }
}
