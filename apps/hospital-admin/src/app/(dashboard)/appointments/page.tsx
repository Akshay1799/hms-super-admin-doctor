"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  CalendarDays,
  Clock,
  Loader2,
  AlertCircle,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  _id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: "Scheduled" | "Waiting" | "In Progress" | "Completed" | "Cancelled";
  symptoms?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAppointments() {
    try {
      const res = await apiClient.get("/appointments");
      setAppointments(res.data.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/appointments/${id}`, { status: newStatus });
      toast.success("Appointment status updated");
      fetchAppointments();
    } catch {
      toast.error("Failed to update appointment status");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Track schedules, check patients waiting times, update consultation statuses, or manage cancellations.
      </p>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Patient Name</th>
                <th className="p-4">Assigned Doctor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-foreground">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-muted/30">
                  <td className="p-4 font-bold text-foreground">{appt.patientName}</td>
                  <td className="p-4 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span>{appt.doctorName}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5 text-muted-foreground">
                      <p className="flex items-center gap-1.5 font-semibold text-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(appt.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </p>
                      <p className="flex items-center gap-1.5 text-[10px]">
                        <Clock className="h-3.5 w-3.5" />
                        {appt.time}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase text-muted-foreground">
                      {appt.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        appt.status === "Completed"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : appt.status === "Cancelled"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {appt.status === "Scheduled" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "Waiting")}
                          className="px-2 h-7 bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground rounded cursor-pointer"
                        >
                          Check In
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "Cancelled")}
                          className="px-2 h-7 border border-border text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appt.status === "Waiting" && (
                      <button
                        onClick={() => handleStatusUpdate(appt._id, "Completed")}
                        className="px-2.5 h-7 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white rounded cursor-pointer"
                      >
                        Complete Consultation
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
