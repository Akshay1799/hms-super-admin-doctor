export interface DashboardMetrics {
  todaysAppointments: number;
  waitingPatients: number;
  criticalPatients: number;
  followUpsCount: number;
}

export interface CriticalAlert {
  id: string;
  patientName: string;
  patientId: string;
  alertText: string;
  severity: "critical" | "warning";
}

export interface RecentPrescription {
  id: string;
  patientName: string;
  patientId: string;
  medication: string;
  dosage: string;
  date: string;
}

export interface AppointmentTrendItem {
  name: string;
  appointments: number;
}

export interface PatientTrendItem {
  name: string;
  admitted: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  alerts: CriticalAlert[];
  prescriptions: RecentPrescription[];
  appointmentsTrend?: AppointmentTrendItem[];
  patientsTrend?: PatientTrendItem[];
}
