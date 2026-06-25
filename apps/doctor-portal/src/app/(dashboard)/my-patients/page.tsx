"use client";

import React, { useState } from "react";
import { 
  usePatients, 
  useCreatePatient, 
  useUpdatePatient, 
  useDeletePatient 
} from "@/features/patients/hooks/usePatients";
import { useAuthStore } from "@/store/auth.store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { 
  Search, 
  User, 
  LayoutGrid, 
  List, 
  HeartPulse, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { Patient } from "@/features/patients/types/patients.types";

export default function MyPatientsPage() {
  const { user } = useAuthStore();
  const { data: patients, isLoading, error } = usePatients(user?.id);

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [status, setStatus] = useState<"Active" | "Admitted" | "ICU" | "Follow-up Due">("Active");
  const [allergiesText, setAllergiesText] = useState("");
  const [historyText, setHistoryText] = useState("");
  const [nurse, setNurse] = useState("");
  const [compounder, setCompounder] = useState("");
  const [shift, setShift] = useState("Day Shift");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-4 items-center">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !patients) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load patient records</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Open Handlers
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedPatient(null);
    setName("");
    setAge(30);
    setGender("Male");
    setWard("General Ward A");
    setBedNumber("A-12");
    setStatus("Active");
    setAllergiesText("");
    setHistoryText("");
    setNurse("Nurse Clara");
    setCompounder("Pharmacist Leo");
    setShift("Day Shift");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pat: Patient) => {
    setModalMode("edit");
    setSelectedPatient(pat);
    setName(pat.name);
    setAge(pat.age);
    setGender(pat.gender);
    setWard(pat.ward);
    setBedNumber(pat.bedNumber);
    setStatus(pat.status);
    setAllergiesText(pat.allergies.join(", "));
    setHistoryText(pat.medicalHistory.join(", "));
    setNurse(pat.assignedNurse || "");
    setCompounder(pat.assignedCompounder || "");
    setShift(pat.shift || "Day Shift");
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ward || !bedNumber) {
      toast.error("Please fill in Name, Ward, and Bed Number.");
      return;
    }

    const allergies = allergiesText
      ? allergiesText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const medicalHistory = historyText
      ? historyText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const patientData = {
      name,
      age: Number(age),
      gender,
      ward,
      bedNumber,
      status,
      allergies,
      medicalHistory,
      assignedDoctorId: user?.id || "doc-1",
      assignedNurse: nurse || "Nurse Clara",
      assignedCompounder: compounder || "Pharmacist Leo",
      shift,
    };

    if (modalMode === "create") {
      createMutation.mutate(patientData, {
        onSuccess: () => {
          toast.success("Patient registered successfully!");
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error("Failed to register patient: " + err.message);
        }
      });
    } else if (modalMode === "edit" && selectedPatient) {
      updateMutation.mutate(
        { id: selectedPatient.id, updates: patientData },
        {
          onSuccess: () => {
            toast.success("Patient details updated successfully!");
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            toast.error("Failed to update patient: " + err.message);
          }
        }
      );
    }
  };

  // Delete Handler
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: () => {
        toast.success("Patient discharged and record removed.");
        setDeleteConfirmId(null);
      },
      onError: (err: any) => {
        toast.error("Failed to discharge patient: " + err.message);
      }
    });
  };

  // Search and Filter Logic
  const filteredPatients = patients.filter((pat) => {
    const matchesSearch =
      pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || pat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Patients</h1>
          <p className="text-sm text-muted-foreground">Physician panel for assigned patients and active clinical charts.</p>
        </div>

        {/* Actions & View Mode Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleOpenCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-xs font-bold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Patient
          </button>

          <div className="flex items-center gap-1.5 border border-border p-0.5 rounded-lg bg-muted/40">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name, ward, or bed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter Tab Selector */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {["All", "Active", "Admitted", "ICU", "Follow-up Due"].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                statusFilter === statusOption
                  ? "bg-primary border-primary text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Content */}
      {filteredPatients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No patients found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try registering a patient or modifying your search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((pat) => (
            <Card key={pat.id} className="hover:shadow-md transition-shadow relative">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-start justify-between">
                <div>
                  <Link href={ROUTES.patient360(pat.id)} className="text-base font-bold text-foreground hover:underline">
                    {pat.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pat.age} yrs · {pat.gender}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={pat.status} />
                  <button 
                    onClick={() => handleOpenEdit(pat)} 
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Edit details"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(pat.id)} 
                    className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="Discharge patient"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {/* Location */}
                <div className="grid grid-cols-2 text-xs font-semibold">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Ward</span>
                    <span className="text-foreground">{pat.ward}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Bed</span>
                    <span className="text-foreground">{pat.bedNumber}</span>
                  </div>
                </div>

                {/* Critical Allergies Alerts */}
                {pat.allergies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Allergies</span>
                    <div className="flex flex-wrap gap-1">
                      {pat.allergies.map((alg) => (
                        <span 
                          key={alg} 
                          className="px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive flex items-center gap-1"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Chart Link */}
                <div className="border-t border-border pt-3.5 flex justify-end">
                  <Link 
                    href={ROUTES.patient360(pat.id)} 
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Open Patient Chart <HeartPulse className="h-4 w-4 text-emerald-600" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Demographics</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Allergies</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <Link href={ROUTES.patient360(pat.id)} className="hover:underline">
                        {pat.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {pat.age} yrs · {pat.gender}
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {pat.ward} ({pat.bedNumber})
                    </td>
                    <td className="p-4">
                      {pat.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pat.allergies.map((alg) => (
                            <span 
                              key={alg} 
                              className="px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive inline-flex items-center gap-1"
                            >
                              <ShieldAlert className="h-2.5 w-2.5" />
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pat.status} />
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2.5">
                      <Link 
                        href={ROUTES.patient360(pat.id)} 
                        className="text-primary font-bold hover:underline"
                      >
                        Chart
                      </Link>
                      <button 
                        onClick={() => handleOpenEdit(pat)} 
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(pat.id)} 
                        className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        title="Discharge Patient"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Form Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <h2 className="text-base font-bold text-foreground">
                {modalMode === "create" ? "Register Attending Patient" : "Edit Patient Profile"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel Jackson"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Age *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Admitted">Admitted</option>
                    <option value="ICU">ICU</option>
                    <option value="Follow-up Due">Follow-up Due</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Ward Name *</label>
                  <input
                    type="text"
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. ICU Ward B"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Bed Number *</label>
                  <input
                    type="text"
                    required
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. B-09"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Assigned Nurse</label>
                  <input
                    type="text"
                    value={nurse}
                    onChange={(e) => setNurse(e.target.value)}
                    placeholder="e.g. Nurse Clara"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Shift Schedule</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="On-Call">On-Call</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Clinical Notes / History (comma-separated)</label>
                <textarea
                  value={historyText}
                  onChange={(e) => setHistoryText(e.target.value)}
                  placeholder="e.g. Type II Diabetes, Hypertension history"
                  className="h-16 w-full rounded-md border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Register Patient"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Discharge Patient</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Are you sure you want to remove this patient?</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded border border-border">
              This action will remove the patient record from your active attending queue and set their discharge timestamp.
            </p>
            <div className="flex items-center gap-3 border-t border-border pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-destructive text-white text-xs font-bold hover:bg-destructive/95 transition-colors cursor-pointer"
              >
                {deleteMutation.isPending ? "Discharging..." : "Yes, Discharge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
