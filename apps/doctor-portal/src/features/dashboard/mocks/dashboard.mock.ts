import { DashboardData } from "../types/dashboard.types";

export const MOCK_DASHBOARD_DATA: DashboardData = {
  metrics: {
    todaysAppointments: 12,
    waitingPatients: 4,
    criticalPatients: 2,
    followUpsCount: 5,
  },
  alerts: [
    {
      id: "a-1",
      patientName: "John Doe",
      patientId: "pat-1",
      alertText: "Penicillin Allergy (High Risk)",
      severity: "critical",
    },
    {
      id: "a-2",
      patientName: "Sarah Connor",
      patientId: "pat-2",
      alertText: "Critical Potassium Value: 6.2 mEq/L",
      severity: "critical",
    },
    {
      id: "a-3",
      patientName: "Bruce Wayne",
      patientId: "pat-3",
      alertText: "Cardiology Follow-up Due in 2 days",
      severity: "warning",
    },
  ],
  prescriptions: [
    {
      id: "pr-1",
      patientName: "John Doe",
      patientId: "pat-1",
      medication: "Amoxicillin (Substituted due to allergy check)",
      dosage: "500mg, twice daily",
      date: "Today, 09:30 AM",
    },
    {
      id: "pr-2",
      patientName: "Bruce Wayne",
      patientId: "pat-3",
      medication: "Atorvastatin",
      dosage: "20mg, once daily at night",
      date: "Today, 10:15 AM",
    },
    {
      id: "pr-3",
      patientName: "Clark Kent",
      patientId: "pat-4",
      medication: "Metformin",
      dosage: "1000mg, with breakfast",
      date: "Yesterday, 04:00 PM",
    },
  ],
  appointmentsTrend: [
    { name: "Mon", appointments: 8 },
    { name: "Tue", appointments: 14 },
    { name: "Wed", appointments: 12 },
    { name: "Thu", appointments: 10 },
    { name: "Fri", appointments: 15 },
    { name: "Sat", appointments: 5 },
  ],
  patientsTrend: [
    { name: "Jan", admitted: 24 },
    { name: "Feb", admitted: 30 },
    { name: "Mar", admitted: 45 },
    { name: "Apr", admitted: 35 },
    { name: "May", admitted: 50 },
    { name: "Jun", admitted: 65 },
  ],
};

export const MOCK_WEEKLY_APPOINTMENTS_TREND = [
  { name: "Mon", appointments: 8 },
  { name: "Tue", appointments: 14 },
  { name: "Wed", appointments: 12 },
  { name: "Thu", appointments: 10 },
  { name: "Fri", appointments: 15 },
  { name: "Sat", appointments: 5 },
];

export const MOCK_ADMISSIONS_TREND = [
  { name: "Jan", admitted: 24 },
  { name: "Feb", admitted: 30 },
  { name: "Mar", admitted: 45 },
  { name: "Apr", admitted: 35 },
  { name: "May", admitted: 50 },
  { name: "Jun", admitted: 65 },
];
