import { MOCK_APPOINTMENTS } from "../mocks/appointments.mock";
import { Appointment } from "../types/appointments.types";

let localAppointments = [...MOCK_APPOINTMENTS];

export const appointmentsService = {
  async getAppointments(): Promise<Appointment[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [...localAppointments];
  },

  async createAppointment(data: Omit<Appointment, "id">): Promise<Appointment> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const newApp: Appointment = {
      id: `ap-${Date.now()}`,
      ...data,
    };
    localAppointments = [...localAppointments, newApp];
    return newApp;
  },

  async rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const appIndex = localAppointments.findIndex((a) => a.id === id);
    if (appIndex === -1) throw new Error("Appointment not found.");

    const updatedApp = {
      ...localAppointments[appIndex],
      date,
      time,
      status: "Scheduled" as const,
    };

    localAppointments[appIndex] = updatedApp;
    return updatedApp;
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const appIndex = localAppointments.findIndex((a) => a.id === id);
    if (appIndex === -1) throw new Error("Appointment not found.");

    const updatedApp = {
      ...localAppointments[appIndex],
      status: "Cancelled" as const,
    };

    localAppointments[appIndex] = updatedApp;
    return updatedApp;
  },
};
