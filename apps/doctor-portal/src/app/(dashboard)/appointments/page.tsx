"use client";

import React, { useState } from "react";
import { 
  useAppointments, 
  useCreateAppointment, 
  useRescheduleAppointment, 
  useCancelAppointment 
} from "@/features/appointments/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  CalendarDays, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Appointment } from "@/features/appointments/types/appointments.types";

export default function AppointmentsPage() {
  const { data: appointments, isLoading, error } = useAppointments();
  const createMutation = useCreateAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();

  const [activeView, setActiveView] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Appointment creation states
  const [newPatient, setNewPatient] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("09:00 AM");
  const [newType, setNewType] = useState<any>("Consultation");
  const [newSymptoms, setNewSymptoms] = useState("");

  // Reschedule states
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[450px] bg-muted animate-pulse rounded-xl" />
          <div className="h-[450px] bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !appointments) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load appointments</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Filter appointments for selected Day
  const dayAppointments = appointments.filter((app) => app.date === selectedDate);

  // Group appointments for Month View
  const getMonthDots = (dateStr: string) => {
    return appointments.filter((app) => app.date === dateStr && app.status !== "Cancelled");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient || !newSymptoms) {
      toast.error("Please fill in patient name and symptoms.");
      return;
    }

    createMutation.mutate(
      {
        patientName: newPatient,
        patientId: `pat-${Date.now().toString().slice(-4)}`,
        date: newDate,
        time: newTime,
        type: newType,
        status: "Scheduled",
        symptoms: newSymptoms,
      },
      {
        onSuccess: () => {
          toast.success("Follow-up appointment scheduled successfully.");
          setNewPatient("");
          setNewSymptoms("");
        },
      }
    );
  };

  const handleCancelClick = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Appointment has been cancelled.");
      },
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!reschedDate || !reschedTime) {
      toast.error("Please specify a new date and time.");
      return;
    }

    rescheduleMutation.mutate(
      { id, date: reschedDate, time: reschedTime },
      {
        onSuccess: () => {
          toast.success("Appointment rescheduled successfully.");
          setEditingAppId(null);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Clinical Scheduler</h1>
          <p className="text-sm text-muted-foreground">Manage consultations, triages, and follow-up schedules.</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 border border-border p-0.5 rounded-lg bg-muted/40 self-start">
          {["day", "week", "month"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                activeView === v 
                  ? "bg-card text-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Scheduler Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day View */}
          {activeView === "day" && (
            <Card>
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CalendarDays className="h-4.5 w-4.5 text-primary" />
                  Agenda for {selectedDate}
                </CardTitle>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="p-1 hover:bg-muted rounded border border-border cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="p-1 hover:bg-muted rounded border border-border cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {dayAppointments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No consultations scheduled for this date.
                  </div>
                ) : (
                  dayAppointments.map((app) => (
                    <div key={app.id} className="p-4 border border-border rounded-xl bg-card hover:shadow-xs transition-shadow relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-foreground">{app.patientName}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {app.time}</span>
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] uppercase font-bold">{app.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={app.status} />
                          {app.status === "Scheduled" && (
                            <button
                              onClick={() => {
                                setEditingAppId(app.id);
                                setReschedDate(app.date);
                                setReschedTime(app.time);
                              }}
                              className="px-2.5 py-1 rounded bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-wide cursor-pointer"
                            >
                              Reschedule
                            </button>
                          )}
                          {app.status !== "Cancelled" && app.status !== "Completed" && (
                            <button
                              onClick={() => handleCancelClick(app.id)}
                              className="p-1 hover:bg-destructive/10 text-destructive rounded border border-border cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Symptoms & Notes */}
                      <div className="pt-3 text-xs font-semibold space-y-1 text-muted-foreground">
                        <p><span className="text-foreground font-bold">Chief Complaint:</span> {app.symptoms}</p>
                        {app.notes && <p><span className="text-foreground font-bold">Clinical Notes:</span> {app.notes}</p>}
                      </div>

                      {/* Inline Reschedule Form */}
                      {editingAppId === app.id && (
                        <div className="absolute inset-0 bg-card rounded-xl p-4 flex flex-col justify-between z-10 border border-primary animate-in fade-in duration-200">
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <h4 className="text-xs font-bold text-primary uppercase">Reschedule Consultation</h4>
                            <button onClick={() => setEditingAppId(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <form onSubmit={(e) => handleRescheduleSubmit(e, app.id)} className="grid grid-cols-2 gap-3 py-3">
                            <FormField
                              id="reschedDate"
                              label="New Date"
                              type="date"
                              value={reschedDate}
                              onChange={(e) => setReschedDate(e.target.value)}
                            />
                            <FormField
                              id="reschedTime"
                              label="New Time"
                              placeholder="e.g. 10:30 AM"
                              value={reschedTime}
                              onChange={(e) => setReschedTime(e.target.value)}
                            />
                            <button
                              type="submit"
                              disabled={rescheduleMutation.isPending}
                              className="col-span-2 h-9 rounded bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer"
                            >
                              Confirm Reschedule
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Week View */}
          {activeView === "week" && (
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  Weekly Schedule Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-7 gap-1 border border-border rounded-lg bg-muted/20 overflow-hidden text-center text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                    const tempDate = new Date();
                    const dayOffset = idx - tempDate.getDay();
                    tempDate.setDate(tempDate.getDate() + dayOffset);
                    const formattedDate = tempDate.toISOString().split("T")[0];
                    const count = appointments.filter((a) => a.date === formattedDate && a.status !== "Cancelled").length;

                    return (
                      <div 
                        key={dayName}
                        onClick={() => {
                          setSelectedDate(formattedDate);
                          setActiveView("day");
                        }}
                        className={`p-3 space-y-2 border-r border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                          formattedDate === new Date().toISOString().split("T")[0] ? "bg-primary/5 text-primary" : ""
                        }`}
                      >
                        <p className="font-bold text-[10px] uppercase text-muted-foreground">{dayName}</p>
                        <p className="font-black text-sm">{tempDate.getDate()}</p>
                        {count > 0 && (
                          <span className="inline-block rounded-full bg-primary text-white font-extrabold text-[9px] px-1.5 py-0.2">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Month View */}
          {activeView === "month" && (
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  Month Calendar: June 2026
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* 7 columns grid for days */}
                <div className="grid grid-cols-7 gap-1 border border-border rounded-lg overflow-hidden bg-muted/10 text-center text-xs font-semibold">
                  {/* Days label */}
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="p-2 border-b border-border font-bold text-muted-foreground bg-muted/40">{d}</div>
                  ))}
                  {/* Generate 30 days grid for June 2026 */}
                  {/* June 1st, 2026 is Monday, so Sun is empty */}
                  <div className="p-4 border-b border-r border-border bg-muted/10" />
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `2026-06-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                    const dailyApps = getMonthDots(dateStr);

                    return (
                      <div
                        key={dayNum}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setActiveView("day");
                        }}
                        className={`p-3 border-b border-r border-border last:border-r-0 hover:bg-muted/45 transition-colors cursor-pointer text-left h-16 flex flex-col justify-between ${
                          dateStr === new Date().toISOString().split("T")[0] ? "bg-primary/5 border-primary/50" : ""
                        }`}
                      >
                        <span className="font-extrabold text-[10px] text-muted-foreground">{dayNum}</span>
                        {dailyApps.length > 0 && (
                          <div className="flex gap-0.5 flex-wrap">
                            {dailyApps.map((a) => (
                              <span 
                                key={a.id} 
                                className={`h-1.5 w-1.5 rounded-full ${
                                  a.status === "Waiting" ? "bg-warning" : "bg-primary"
                                }`} 
                                title={a.patientName} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Follow-up Form */}
        <Card className="h-fit">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              Schedule Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <FormField
                id="newPatient"
                label="Patient Name"
                placeholder="Enter patient full name"
                value={newPatient}
                onChange={(e) => setNewPatient(e.target.value)}
                disabled={createMutation.isPending}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="newDate"
                  label="Date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  disabled={createMutation.isPending}
                />
                <FormField
                  id="newTime"
                  label="Time"
                  placeholder="e.g. 09:30 AM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>

              <FormField
                id="newType"
                label="Appointment Type"
                as="select"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                disabled={createMutation.isPending}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Therapy">Therapy</option>
              </FormField>

              <FormField
                id="newSymptoms"
                label="Reason / Chief Complaint"
                placeholder="Wheezing, high BP check, etc..."
                value={newSymptoms}
                onChange={(e) => setNewSymptoms(e.target.value)}
                disabled={createMutation.isPending}
              />

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Scheduling...
                  </>
                ) : (
                  "Schedule Consultation"
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
