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
  tokenNumber?: number;
  queuePosition?: number;
  date: string;
  time: string;
  type: string;
  status: "Scheduled" | "Waiting" | "In Progress" | "Completed" | "Cancelled";
  priorityLevel?: "Normal" | "VIP" | "Emergency" | "Senior Citizen";
  symptoms?: string;
}

import { useAuthStore } from "@/store/auth.store";

export default function AppointmentsPage() {
  const { user } = useAuthStore();
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

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookingForm, setBookingForm] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 AM",
    type: "Consultation",
    priorityLevel: "Normal",
    symptoms: "",
  });

  async function fetchDropdownData() {
    try {
      const [patRes, docRes] = await Promise.all([
        apiClient.get("/patients"),
        apiClient.get("/users?role=DOCTOR"),
      ]);
      setPatients(patRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch {
      // Fallback silently if lookup fails
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.patientName || !bookingForm.doctorName) {
      toast.error("Please select or enter both Patient and Doctor.");
      return;
    }

    try {
      await apiClient.post("/appointments", {
        ...bookingForm,
        hospitalId: user?.hospitalId,
        tenantId: user?.tenantId,
        status: "Scheduled",
      });
      toast.success("Appointment scheduled & Queue Token generated!");
      setIsBookOpen(false);
      setBookingForm({
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00 AM",
        type: "Consultation",
        priorityLevel: "Normal",
        symptoms: "",
      });
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule appointment");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      if (newStatus === "Waiting") {
        await apiClient.post(`/appointments/${id}/check-in`);
        toast.success("Patient checked in! Generated Queue Token.");
      } else {
        await apiClient.patch(`/appointments/${id}`, { status: newStatus });
        toast.success("Appointment status updated");
      }
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">OPD Appointments & Queue Tokens</h2>
          <p className="text-xs text-muted-foreground">
            Track schedules, monitor live OPD Queue tokens, check patient waiting times, update consultation statuses, or manage cancellations.
          </p>
        </div>
        <button
          onClick={() => setIsBookOpen(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20 transition-all active:scale-95"
        >
          + Schedule Consultation
        </button>
      </div>

      {/* Book Appointment Modal */}
      {isBookOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-foreground">Schedule OPD Consultation</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Registered Patient *</label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  value={bookingForm.patientId}
                  onChange={(e) => {
                    const selPat = patients.find(p => p._id === e.target.value);
                    setBookingForm({
                      ...bookingForm,
                      patientId: e.target.value,
                      patientName: selPat ? selPat.name : "",
                    });
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || "UHID-PENDING"})
                    </option>
                  ))}
                </select>
              </div>

              {!bookingForm.patientId && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Or Type Patient Name *</label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={bookingForm.patientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value, patientId: `pat-${Date.now()}` })}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Attending Doctor *</label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  value={bookingForm.doctorId}
                  onChange={(e) => {
                    const selDoc = doctors.find(d => d._id === e.target.value);
                    setBookingForm({
                      ...bookingForm,
                      doctorId: e.target.value,
                      doctorName: selDoc ? selDoc.name : "",
                    });
                  }}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialty || "Physician"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="09:30 AM"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Priority Level</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={bookingForm.priorityLevel}
                    onChange={(e) => setBookingForm({ ...bookingForm, priorityLevel: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Consultation Type</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                  >
                    <option value="Consultation">OPD Consultation</option>
                    <option value="Follow-up">Follow-up Visit</option>
                    <option value="Emergency">Emergency Triage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Chief Symptoms / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Fever, Cough for 3 days"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={bookingForm.symptoms}
                  onChange={(e) => setBookingForm({ ...bookingForm, symptoms: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookOpen(false)}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save & Assign Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List / Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No OPD Appointments Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no active appointments. Click "+ Schedule Consultation" above to book an OPD visit and generate a live queue token.
            </p>
            <button
              onClick={() => setIsBookOpen(true)}
              className="mt-2 h-9 px-4 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              + Schedule First Consultation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Token / Queue</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Priority & Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-foreground">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <span className="font-extrabold text-xs px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800/50">
                        #{appt.tokenNumber || "N/A"}
                      </span>
                    </td>
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
                    <td className="p-4 space-y-1">
                      <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase text-muted-foreground block w-max">
                        {appt.type}
                      </span>
                      {appt.priorityLevel && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border block w-max ${
                          appt.priorityLevel === "Emergency" ? "bg-red-500/10 text-red-600 border-red-200" :
                          appt.priorityLevel === "VIP" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                          "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {appt.priorityLevel}
                        </span>
                      )}
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
        )}
      </div>
    </div>
  );
}
