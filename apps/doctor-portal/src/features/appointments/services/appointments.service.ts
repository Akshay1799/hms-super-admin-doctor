import { apiClient } from "@/lib/api-client";
import { Appointment } from "../types/appointments.types";

function normalizeAppointment(a: any): Appointment {
  let pid = "";
  if (a.patientId) {
    if (typeof a.patientId === "object") {
      pid = (a.patientId._id || a.patientId.id || "").toString();
    } else {
      pid = a.patientId.toString();
    }
  }

  return {
    id: (a._id || a.id).toString(),
    patientName: a.patientName || "Patient",
    patientId: pid,
    date: a.date ? new Date(a.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    time: a.time || "09:00 AM",
    type: a.type || "Consultation",
    status: a.status || "Scheduled",
    symptoms: a.symptoms || "Regular Checkup",
    notes: a.notes,
  };
}

export const appointmentsService = {
  async getAppointments(): Promise<Appointment[]> {
    const res = await apiClient.get("/appointments");
    const list = res.data?.data || [];
    return list.map(normalizeAppointment);
  },

  async createAppointment(data: Omit<Appointment, "id">): Promise<Appointment> {
    const res = await apiClient.post("/appointments", data);
    return normalizeAppointment(res.data?.data);
  },

  async rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
    const res = await apiClient.patch(`/appointments/${id}`, { date, time, status: "Scheduled" });
    return normalizeAppointment(res.data?.data);
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const res = await apiClient.patch(`/appointments/${id}`, { status: "Cancelled" });
    return normalizeAppointment(res.data?.data);
  },
};
