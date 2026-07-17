"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface RosterItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    specialty?: string;
  };
  date: string;
  shiftType: "Day" | "Night" | "On-Call";
  notes?: string;
}

export default function RostersPage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rosters, setRosters] = useState<RosterItem[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [formInput, setFormInput] = useState({
    userId: "",
    date: "",
    shiftType: "Day" as "Day" | "Night" | "On-Call",
    notes: "",
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const fetchRostersAndStaff = async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month, getDaysInMonth(year, month), 23, 59, 59).toISOString();

      const [rosterRes, staffRes] = await Promise.all([
        apiClient.get(`/rosters?startDate=${startDate}&endDate=${endDate}`),
        apiClient.get("/users?limit=100"),
      ]);

      setRosters(rosterRes.data.data || []);
      // Filter staff: only DOCTOR or NURSE roles
      const filteredStaff = (staffRes.data.data || []).filter(
        (u: any) => u.role === "DOCTOR" || u.role === "NURSE"
      );
      setStaff(filteredStaff);

      if (filteredStaff.length > 0) {
        setFormInput((prev) => ({ ...prev, userId: filteredStaff[0]._id }));
      }
    } catch {
      toast.error("Failed to load scheduling data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRostersAndStaff();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.userId || !formInput.date) {
      toast.error("Please select a staff member and date");
      return;
    }

    try {
      await apiClient.post("/rosters", {
        userId: formInput.userId,
        date: formInput.date,
        shiftType: formInput.shiftType,
        notes: formInput.notes,
        departmentId: user?.role === "DEPT_ADMIN" ? user?.departmentId : undefined,
      });

      toast.success("Shift scheduled successfully!");
      setIsScheduleOpen(false);
      setFormInput((prev) => ({ ...prev, notes: "" }));
      fetchRostersAndStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to save schedule shift");
    }
  };

  if (isLoading && rosters.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar cells generation
  const calendarCells: any[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // Helper to match roster items to date
  const getRostersForDate = (date: Date) => {
    return rosters.filter((r) => {
      const rosterDate = new Date(r.date);
      return (
        rosterDate.getUTCFullYear() === date.getFullYear() &&
        rosterDate.getUTCMonth() === date.getMonth() &&
        rosterDate.getUTCDate() === date.getDate()
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Shift Roster & Schedules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure monthly shift schedules and duty rosters for doctors and nurses.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-border bg-card rounded-lg p-1 shadow-sm gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-foreground px-1 min-w-[100px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule Shift
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-muted/40 border-b border-border text-center text-xs font-bold text-muted-foreground p-3.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-border min-h-[500px]">
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="bg-muted/10 p-2 border-b border-r border-border" />;
            }

            const dayRosters = getRostersForDate(cell);
            const isToday = new Date().toDateString() === cell.toDateString();

            return (
              <div
                key={cell.toISOString()}
                className={`p-3 min-h-[100px] border-b border-r border-border flex flex-col justify-between hover:bg-muted/5 transition-colors relative ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? "h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center font-black"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cell.getDate()}
                  </span>
                  {isToday && <span className="text-[9px] font-bold text-primary tracking-wider uppercase">Today</span>}
                </div>

                <div className="mt-2 space-y-1.5 flex-1">
                  {dayRosters.map((roster) => {
                    const isDoctor = roster.userId.role === "DOCTOR";
                    const badgeColor =
                      roster.shiftType === "Day"
                        ? "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400"
                        : roster.shiftType === "Night"
                        ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400";

                    return (
                      <div
                        key={roster._id}
                        className={`p-1.5 rounded-lg border border-border/40 text-[10px] space-y-0.5 shadow-sm bg-card hover:border-primary/30 transition-all cursor-pointer`}
                        title={`${roster.userId.name} - ${roster.shiftType} Shift\n${roster.notes || ""}`}
                      >
                        <p className="font-bold truncate text-foreground flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {roster.userId.name}
                        </p>
                        <div className="flex justify-between items-center gap-1 flex-wrap">
                          <span className="text-muted-foreground text-[8px] truncate">
                            {isDoctor ? "Doctor" : "Nurse"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${badgeColor}`}>
                            {roster.shiftType}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Schedule Shift Allocation
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Staff Member *</label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formInput.userId}
                  onChange={(e) => setFormInput({ ...formInput, userId: e.target.value })}
                >
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role === "DOCTOR" ? `Dr. - ${s.specialty || "Physician"}` : "Nurse"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formInput.date}
                  onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Shift Type *</label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formInput.shiftType}
                  onChange={(e) => setFormInput({ ...formInput, shiftType: e.target.value as any })}
                >
                  <option value="Day">Day Shift (09:00 AM - 05:00 PM)</option>
                  <option value="Night">Night Shift (09:00 PM - 05:00 AM)</option>
                  <option value="On-Call">On-Call Shift (Emergency standby)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Notes / Description</label>
                <textarea
                  placeholder="Cardiac ICU Duty, ER Backup shift, etc."
                  className="w-full h-20 p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  value={formInput.notes}
                  onChange={(e) => setFormInput({ ...formInput, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Shift Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
