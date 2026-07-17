import { apiClient } from "@/lib/api-client";
import { DashboardData, AppointmentTrendItem, PatientTrendItem } from "../types/dashboard.types";
import { MOCK_WEEKLY_APPOINTMENTS_TREND, MOCK_ADMISSIONS_TREND } from "../mocks/dashboard.mock";

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const res = await apiClient.get('/dashboard/doctor');
    const { appointmentsToday, waitingPatients, criticalPatients, followUpDue } = res.data.data;

    // Fetch the list of patients under this doctor to generate real telemetry alerts and prescriptions
    const patRes = await apiClient.get('/patients');
    const patientList = patRes.data.data || [];

    // Generate real alerts from patients
    const alerts = patientList
      .filter((p: any) => (p.allergies && p.allergies.length > 0) || p.status === 'ICU')
      .map((p: any, idx: number) => ({
        id: `a-${p._id || idx}`,
        patientName: p.name,
        patientId: p._id,
        alertText: p.status === 'ICU' 
          ? 'Patient in Intensive Care Unit'
          : `Allergies: ${p.allergies.join(', ')}`,
        severity: p.status === 'ICU' ? 'critical' : 'warning',
      }));

    // Generate real prescriptions from patients
    const prescriptions: any[] = [];
    patientList.forEach((p: any) => {
      if (p.medications && p.medications.length > 0) {
        p.medications.slice(0, 2).forEach((med: any, medIdx: number) => {
          prescriptions.push({
            id: `pr-${p._id}-${medIdx}`,
            patientName: p.name,
            patientId: p._id,
            medication: med.name,
            dosage: `${med.dose}, ${med.frequency}`,
            date: med.startDate ? new Date(med.startDate).toLocaleDateString() : "Active",
          });
        });
      }
    });

    return {
      metrics: {
        todaysAppointments: appointmentsToday || 0,
        waitingPatients: waitingPatients || 0,
        criticalPatients: criticalPatients || 0,
        followUpsCount: followUpDue || 0,
      },
      alerts: alerts.length > 0 ? alerts.slice(0, 5) : [
        {
          id: "no-alerts",
          patientName: "No alerts",
          patientId: "",
          alertText: "All patients are in stable condition.",
          severity: "info"
        }
      ],
      prescriptions: prescriptions.slice(0, 5),
    };
  },

  async getWeeklyAppointmentTrend(): Promise<AppointmentTrendItem[]> {
    // Keep standard UI charts mockup
    return [...MOCK_WEEKLY_APPOINTMENTS_TREND];
  },

  async getAdmissionTrend(): Promise<PatientTrendItem[]> {
    // Keep standard UI charts mockup
    return [...MOCK_ADMISSIONS_TREND];
  },
};
