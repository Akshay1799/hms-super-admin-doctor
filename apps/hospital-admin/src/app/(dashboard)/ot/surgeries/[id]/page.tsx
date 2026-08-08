"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckSquare, Settings2, Activity, Play, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const SURGERY_STATUSES = [
  "Requested", "Scheduled", "Patient Ready", "Shifted to OT", "Pre-Operative Check Completed", "In Progress", "Completed"
];

export default function SurgeryDetailsPage({ params }: { params: { id: string } }) {
  const [surgery, setSurgery] = useState<any>(null);
  const [ots, setOts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({ otId: "", scheduledTime: "" });
  const [checklist, setChecklist] = useState({
    patientIdentityConfirmed: false,
    consentAvailable: false,
    surgicalSiteMarked: false,
    allergyReview: false,
    fastingConfirmed: false,
    bloodAvailabilityConfirmed: false,
  });

  const fetchSurgery = async () => {
    try {
      // In reality, this requires a specific GET /ot/surgeries/:id route,
      // but we can fetch all and filter for the prototype, or assume the backend has it.
      // Wait, we didn't add GET /ot/surgeries/:id in the backend. 
      // For the sake of the MVP, we'll fetch all and filter on the frontend if needed, 
      // or we can just fetch all and find by ID.
      const res = await apiClient.get("/ot/surgeries");
      const found = res.data.data.find((s: any) => s._id === params.id);
      if (found) {
        setSurgery(found);
        setScheduleForm({ 
          otId: found.otId?._id || "", 
          scheduledTime: found.scheduledTime ? new Date(found.scheduledTime).toISOString().slice(0, 16) : ""
        });
        setChecklist(found.preOpChecklist);
      }
    } catch (error) {
      toast.error("Failed to fetch surgery details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOts = async () => {
    try {
      const res = await apiClient.get("/ot");
      setOts(res.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchSurgery();
    fetchOts();
  }, [params.id]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await apiClient.patch(`/ot/surgeries/${params.id}/schedule`, scheduleForm);
      toast.success("Surgery scheduled successfully");
      fetchSurgery();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChecklistSubmit = async () => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/ot/surgeries/${params.id}/checklist`, { preOpChecklist: checklist });
      toast.success("Checklist saved");
      fetchSurgery();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save checklist");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/ot/surgeries/${params.id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchSurgery();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading...</div>;
  if (!surgery) return <div className="p-12 text-center text-muted-foreground">Surgery not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/ot/surgeries`} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{surgery.surgeryName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Patient: {surgery.patientId?.name} ({surgery.patientId?.mrn})</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {surgery.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-lg border-b border-border pb-3 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Pre-Operative Checklist
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(checklist).map((key) => (
                <label key={key} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={(checklist as any)[key]} 
                    onChange={(e) => setChecklist({...checklist, [key]: e.target.checked})}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleChecklistSubmit}
                disabled={isUpdating}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-semibold text-sm hover:bg-secondary/80"
              >
                Save Checklist
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-lg border-b border-border pb-3 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Execution & Lifecycle
            </h3>
            <div className="flex flex-wrap gap-3">
              {SURGERY_STATUSES.map((s, idx) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    surgery.status === s 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                  }`}
                >
                  {idx + 1}. {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Scheduling */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-lg border-b border-border pb-3 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Scheduling
            </h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Operation Theatre</label>
                <select 
                  required
                  value={scheduleForm.otId}
                  onChange={e => setScheduleForm({...scheduleForm, otId: e.target.value})}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select OT</option>
                  {ots.map(ot => (
                    <option key={ot._id} value={ot._id}>{ot.name} ({ot.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={scheduleForm.scheduledTime}
                  onChange={e => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:bg-primary/90"
              >
                Save Schedule
              </button>
            </form>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-lg border-b border-border pb-3 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Priority</p>
                <p className="text-sm font-bold">{surgery.priority}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Primary Surgeon</p>
                <p className="text-sm font-bold">{surgery.primarySurgeonId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Est. Duration</p>
                <p className="text-sm font-bold">{surgery.estimatedDurationMins} Mins</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Notes</p>
                <p className="text-sm">{surgery.notes || "No notes provided."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
