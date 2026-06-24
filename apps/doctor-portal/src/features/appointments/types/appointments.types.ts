export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "Consultation" | "Follow-up" | "Diagnostic" | "Therapy";
  status: "Scheduled" | "Waiting" | "Completed" | "Cancelled";
  symptoms: string;
  notes?: string;
}
