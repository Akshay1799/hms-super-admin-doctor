"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Loader2,
  Search,
  Plus,
  Bed,
  Heart,
  ChevronRight,
  ClipboardList,
  X,
  Calendar,
  Shield,
  Activity,
  FileText,
  Edit3,
  LayoutGrid,
  List,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { maskEmail, maskPhone } from "@/utils/masking";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  bedNumber?: string;
  ward?: string;
  assignedDoctorId?: {
    _id: string;
    name: string;
    email?: string;
    specialty?: string;
  };
  createdAt: string;
}

export default function PatientsPage() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState<{
    name: string;
    age: string;
    gender: string;
    status: string;
    ward: string;
    bedNumber: string;
    assignedDoctorId: string;
    email: string;
    phone: string;
    bloodGroup?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    chronicDiseasesStr?: string;
    allergiesStr?: string;
  }>({
    name: "",
    age: "",
    gender: "Male",
    status: "Active",
    ward: "",
    bedNumber: "",
    assignedDoctorId: "",
    email: "",
    phone: "",
    bloodGroup: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    chronicDiseasesStr: "",
    allergiesStr: "",
  });
  const [customWard, setCustomWard] = useState("");
  const [customDoctor, setCustomDoctor] = useState("");
  const [patientDeleteConfirmId, setPatientDeleteConfirmId] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  async function fetchDoctorsAndDepts() {
    try {
      const [docRes, deptRes] = await Promise.all([
        apiClient.get("/users?limit=100"),
        apiClient.get("/departments"),
      ]);
      setDoctors(docRes.data.data.filter((u: any) => u.role === "DOCTOR"));
      setDepartments(deptRes.data.data);
    } catch {}
  }

  async function fetchPatients() {
    try {
      const res = await apiClient.get(`/patients?search=${searchQuery}`);
      setPatients(res.data.data);
    } catch {
      toast.error("Failed to fetch patient records");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const handleDeletePatient = async (id: string) => {
    try {
      await apiClient.delete(`/patients/${id}`);
      toast.error("Patient record successfully deleted.");
      fetchPatients();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete patient record");
    }
  };

  useEffect(() => {
    fetchDoctorsAndDepts();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age) {
      toast.error("Please fill in name and age");
      return;
    }

    const finalWard = newPatient.ward === "CUSTOM_WARD" ? customWard : newPatient.ward;
    const finalDoctor = newPatient.assignedDoctorId === "CUSTOM_DOC" ? customDoctor : newPatient.assignedDoctorId;

    // Resolve departmentId based on selected ward if it matches a department
    let finalDeptId = undefined;
    if (newPatient.ward !== "CUSTOM_WARD" && newPatient.ward !== "") {
      const selectedDept = departments.find(d => d.name === newPatient.ward);
      if (selectedDept) {
        finalDeptId = selectedDept._id;
      }
    } else if (newPatient.ward === "CUSTOM_WARD" && customWard !== "") {
      const selectedDept = departments.find(d => d.name.toLowerCase() === customWard.toLowerCase());
      if (selectedDept) {
        finalDeptId = selectedDept._id;
      }
    }

    const chronicArr = newPatient.chronicDiseasesStr ? newPatient.chronicDiseasesStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const allergiesArr = newPatient.allergiesStr ? newPatient.allergiesStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    try {
      await apiClient.post("/patients", {
        ...newPatient,
        ward: finalWard,
        assignedDoctorId: finalDoctor || undefined,
        departmentId: finalDeptId || (user?.role === "DEPT_ADMIN" ? user?.departmentId : undefined),
        age: parseInt(newPatient.age) || 0,
        address: newPatient.address || undefined,
        bloodGroup: newPatient.bloodGroup || undefined,
        emergencyContact: (newPatient.emergencyContactName || newPatient.emergencyContactPhone) ? {
          name: newPatient.emergencyContactName || "Emergency Contact",
          phone: newPatient.emergencyContactPhone || ""
        } : undefined,
        chronicDiseases: chronicArr.length > 0 ? chronicArr : undefined,
        allergies: allergiesArr.length > 0 ? allergiesArr : undefined,
        hospitalId: user?.hospitalId,
        tenantId: user?.tenantId,
      });

      toast.success("Patient record created successfully!");
      setIsAddOpen(false);
      setRegStep(1);
      setNewPatient({
        name: "",
        age: "",
        gender: "Male",
        status: "Active",
        ward: "",
        bedNumber: "",
        assignedDoctorId: "",
        email: "",
        phone: "",
        bloodGroup: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        chronicDiseasesStr: "",
        allergiesStr: "",
      });
      setCustomWard("");
      setCustomDoctor("");
      fetchPatients();
    } catch (err: any) {
      toast.error(err.message || "Failed to create patient");
    }
  };

  if (isLoading && patients.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient registry..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Layout View Toggle */}
          <div className="flex items-center border border-border bg-card rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === "card"
                  ? "bg-muted text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card Layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "bg-muted text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List Layout"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Admit Patient
          </button>
        </div>
      </div>

      {/* Add Modal (2-Step Wizard) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Wizard Header & Step Indicator */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Register Patient Record</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {regStep === 1 ? "Step 1 of 2: Demographics & Contact Info" : "Step 2 of 2: Medical History & Ward Admission"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-8 rounded-full transition-all ${regStep === 1 ? "bg-primary" : "bg-primary/30"}`} />
                <span className={`h-2.5 w-8 rounded-full transition-all ${regStep === 2 ? "bg-primary" : "bg-primary/30"}`} />
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* STEP 1: Demographics & Contact */}
              {regStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 9988776655"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Age *</label>
                      <input
                        type="number"
                        required
                        placeholder="32"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Gender *</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Blood Group</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        value={newPatient.bloodGroup || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                      >
                        <option value="">Unknown</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Residential Address</label>
                    <input
                      type="text"
                      placeholder="123 Main St, Sector 4"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={newPatient.address || ""}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 border-t border-border pt-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Karan Sharma (Spouse)"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.emergencyContactName || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Emergency Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.emergencyContactPhone || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPatient.name || !newPatient.email || !newPatient.age) {
                          toast.error("Please fill in Name, Email, and Age to proceed.");
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      Next: Medical & Admission →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Medical History & Ward Admission */}
              {regStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-150">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Chronic Diseases</label>
                      <input
                        type="text"
                        placeholder="e.g. Diabetes, Hypertension"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.chronicDiseasesStr || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, chronicDiseasesStr: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Known Drug Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Penicillin, Sulfa"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.allergiesStr || ""}
                        onChange={(e) => setNewPatient({ ...newPatient, allergiesStr: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Ward / Department Scope</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        value={newPatient.ward}
                        onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                      >
                        <option value="">None / Outpatient</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                        <option value="CUSTOM_WARD">Other (Type custom...)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Bed Assignment</label>
                      <input
                        type="text"
                        placeholder="e.g. B-12"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPatient.bedNumber}
                        onChange={(e) => setNewPatient({ ...newPatient, bedNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {newPatient.ward === "CUSTOM_WARD" && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type Custom Ward Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Isolation Ward C"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={customWard}
                        onChange={(e) => setCustomWard(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Attending Physician</label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      value={newPatient.assignedDoctorId}
                      onChange={(e) => setNewPatient({ ...newPatient, assignedDoctorId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.name} ({doc.specialty || "Physician"})
                        </option>
                      ))}
                      <option value="CUSTOM_DOC">Other (Type custom...)</option>
                    </select>
                  </div>

                  {newPatient.assignedDoctorId === "CUSTOM_DOC" && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type Custom Physician Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Jane Doe"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        value={customDoctor}
                        onChange={(e) => setCustomDoctor(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Admission Triage Status</label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      value={newPatient.status}
                      onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                    >
                      <option value="Active">Outpatient (Active OPD)</option>
                      <option value="Admitted">Inpatient (Admitted IPD)</option>
                      <option value="ICU">Emergency (ICU Triage)</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="h-10 px-4 border border-border hover:bg-muted text-foreground rounded-lg text-xs font-bold cursor-pointer"
                    >
                      ← Back to Step 1
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-6 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-all active:scale-95 shadow-md shadow-primary/20"
                    >
                      Complete Registration
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Patient Layout Content */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {patients.map((pat) => (
            <div key={pat._id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 hover:border-primary transition-all duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <button
                    onClick={() => setSelectedPatient(pat)}
                    className="text-left group focus:outline-hidden cursor-pointer"
                  >
                    <h4 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">{pat.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {(pat as any).uhid || "UHID-PENDING"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {pat.age} Yrs • {pat.gender}
                      </p>
                    </div>
                  </button>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      pat.status === "Admitted"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : pat.status === "ICU"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-green-500/10 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {pat.status}
                  </span>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg space-y-2 text-xs text-muted-foreground">
                  {pat.ward ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4" />
                        Ward / Bed
                      </span>
                      <span className="font-bold text-foreground">
                        {pat.ward} / Bed {pat.bedNumber}
                      </span>
                    </div>
                  ) : (
                    <p className="italic text-center py-1">No bed assigned (Outpatient)</p>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-500" />
                      Primary Physician
                    </span>
                    <span className="font-bold text-foreground">
                      {pat.assignedDoctorId?.name || "Pending Allocation"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border mt-3 relative">
                <button
                  onClick={() => setSelectedPatient(pat)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold focus:outline-hidden"
                >
                  <ClipboardList className="h-4 w-4" />
                  View EMR Details
                </button>
                <div className="relative text-left">
                  <button
                    onClick={() => setActiveDropdownId(activeDropdownId === pat._id ? null : pat._id)}
                    className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors ml-auto"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {activeDropdownId === pat._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-36 rounded-lg border border-border bg-card shadow-lg z-20 py-1 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                        <button
                          onClick={() => {
                            setActiveDropdownId(null);
                            setEditingPatient({
                              _id: pat._id,
                              name: pat.name,
                              age: pat.age.toString(),
                              gender: pat.gender,
                              bloodGroup: (pat as any).bloodGroup || "O+",
                              email: (pat as any).email || "",
                              phone: (pat as any).phone || "",
                              status: pat.status,
                              ward: pat.ward || "",
                              bedNumber: pat.bedNumber || "",
                              assignedDoctorId: pat.assignedDoctorId?._id || "",
                              departmentId: typeof (pat as any).departmentId === "string" ? (pat as any).departmentId : ((pat as any).departmentId as any)?._id || "",
                            });
                            setIsEditOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-foreground flex items-center gap-2 cursor-pointer"
                        >
                          Edit Registry
                        </button>
                        <button
                          onClick={() => {
                            setActiveDropdownId(null);
                            setPatientDeleteConfirmId(pat._id);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-red-600 flex items-center gap-2 cursor-pointer border-t border-border mt-1 pt-2"
                        >
                          Delete Patient
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Age / Gender</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location (Ward & Bed)</th>
                  <th className="p-4">Attending Physician</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-foreground">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold">
                      <button
                        onClick={() => setSelectedPatient(pat)}
                        className="hover:text-blue-600 transition-colors text-left font-bold focus:outline-hidden"
                      >
                        <div>{pat.name}</div>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {(pat as any).uhid || "UHID-PENDING"}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {pat.age} Yrs • {pat.gender}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          pat.status === "Admitted"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : pat.status === "ICU"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {pat.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {pat.ward ? `${pat.ward} / Bed ${pat.bedNumber}` : "Outpatient"}
                    </td>
                    <td className="p-4 text-foreground font-semibold">
                      {pat.assignedDoctorId?.name || "Pending Allocation"}
                    </td>
                    <td className="p-4 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === pat._id ? null : pat._id)}
                          className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors ml-auto"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeDropdownId === pat._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                            <div className="absolute right-0 mt-1 w-36 rounded-lg border border-border bg-card shadow-lg z-20 py-1 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedPatient(pat);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-blue-600 flex items-center gap-2 cursor-pointer"
                              >
                                EMR Details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setEditingPatient({
                                    _id: pat._id,
                                    name: pat.name,
                                    age: pat.age.toString(),
                                    gender: pat.gender,
                                    bloodGroup: (pat as any).bloodGroup || "O+",
                                    email: (pat as any).email || "",
                                    phone: (pat as any).phone || "",
                                    status: pat.status,
                                    ward: pat.ward || "",
                                    bedNumber: pat.bedNumber || "",
                                    assignedDoctorId: pat.assignedDoctorId?._id || "",
                                    departmentId: typeof (pat as any).departmentId === "string" ? (pat as any).departmentId : ((pat as any).departmentId as any)?._id || "",
                                  });
                                  setIsEditOpen(true);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-foreground flex items-center gap-2 cursor-pointer border-t border-border mt-1 pt-2"
                              >
                                Edit Registry
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setPatientDeleteConfirmId(pat._id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-red-600 flex items-center gap-2 cursor-pointer border-t border-border mt-1 pt-2"
                              >
                                Delete Patient
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient EMR Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4 items-center">
              <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-2xl uppercase">
                {selectedPatient.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{selectedPatient.name}</h3>
                <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase">
                  EMR Case File: {selectedPatient.status}
                </span>
              </div>
            </div>

            {/* Patient demographics */}
            <div className="grid grid-cols-2 gap-3.5 text-xs bg-muted/30 p-3.5 rounded-xl text-muted-foreground">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Age / Gender</p>
                <p className="font-bold text-foreground mt-0.5">{selectedPatient.age} Yrs • {selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Admission Location</p>
                <p className="font-bold text-foreground mt-0.5">
                  {selectedPatient.ward ? `${selectedPatient.ward} (Bed ${selectedPatient.bedNumber})` : "General Outpatient"}
                </p>
              </div>
              <div className="border-t border-border pt-2 col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Email Contact</p>
                  <p className="font-mono font-bold text-foreground mt-0.5">{maskEmail((selectedPatient as any).email || "patient@hms.com")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Phone Contact</p>
                  <p className="font-mono font-bold text-foreground mt-0.5">{maskPhone((selectedPatient as any).phone || "+91 9988776655")}</p>
                </div>
              </div>
            </div>

            {/* Assigned Doctor Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" />
                Primary Attending Physician
              </h4>
              <div className="bg-background border border-border p-3.5 rounded-xl text-xs space-y-2">
                {selectedPatient.assignedDoctorId ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{selectedPatient.assignedDoctorId.name}</span>
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 px-2 py-0.5 rounded font-semibold uppercase">
                        {selectedPatient.assignedDoctorId.specialty || "Physician Specialist"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground border-t border-border pt-2 mt-1">
                      <span>Shift Hours</span>
                      <span className="font-bold text-foreground">Day Shift (09:00 AM - 05:00 PM)</span>
                    </div>
                    {selectedPatient.assignedDoctorId.email && (
                      <div className="flex justify-between text-muted-foreground border-t border-border pt-2">
                        <span>Email Contact</span>
                        <span className="font-bold font-mono text-foreground">{maskEmail(selectedPatient.assignedDoctorId.email)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-1">No doctor allocated to this patient yet.</p>
                )}
              </div>
            </div>

            {/* EMR Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600" />
                Clinical Case History Events
              </h4>
              <div className="border border-border rounded-lg bg-background p-3.5 space-y-3.5 text-xs">
                <div className="flex gap-3">
                  <div className="w-1.5 bg-blue-600 rounded-full my-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Initial Assessment Consultation</p>
                    <p className="text-[10px] text-muted-foreground">General wellness evaluation, blood pressure vitals logged.</p>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-border pt-2.5">
                  <div className="w-1.5 bg-green-500 rounded-full my-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Admission Setup completed</p>
                    <p className="text-[10px] text-muted-foreground">Ward allocation and primary physician contact assigned.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1.5">
              <button
                onClick={() => setSelectedPatient(null)}
                className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close EMR Case
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Patient Modal */}
      {isEditOpen && editingPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">Edit Patient EMR Registry</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingPatient.name || !editingPatient.age) {
                  toast.error("Please fill in name and age");
                  return;
                }
                try {
                  await apiClient.patch(`/patients/${editingPatient._id}`, {
                    name: editingPatient.name,
                    age: parseInt(editingPatient.age) || 0,
                    gender: editingPatient.gender,
                    bloodGroup: editingPatient.bloodGroup,
                    email: editingPatient.email || null,
                    phone: editingPatient.phone || null,
                    status: editingPatient.status,
                    ward: editingPatient.ward || null,
                    bedNumber: editingPatient.bedNumber || null,
                    assignedDoctorId: editingPatient.assignedDoctorId || null,
                    departmentId: editingPatient.departmentId || null,
                  });
                  toast.success("Patient record updated successfully!");
                  setIsEditOpen(false);
                  setEditingPatient(null);
                  fetchPatients();
                } catch (err: any) {
                  toast.error(err.message || "Failed to update record");
                }
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="32"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.age}
                    onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Gender</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.gender}
                    onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Blood Group</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.bloodGroup}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="patient@medichain.com"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9988776655"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none disabled:opacity-60"
                    disabled={user?.role === "DEPT_ADMIN"}
                    value={editingPatient.departmentId}
                    onChange={(e) => setEditingPatient({ ...editingPatient, departmentId: e.target.value })}
                  >
                    <option value="">Select Division</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Physician</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.assignedDoctorId}
                    onChange={(e) => setEditingPatient({ ...editingPatient, assignedDoctorId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} ({doc.specialty || "General Medicine"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Ward Name</label>
                  <input
                    type="text"
                    placeholder="Emergency ICU"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.ward}
                    onChange={(e) => setEditingPatient({ ...editingPatient, ward: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Bed Number</label>
                  <input
                    type="text"
                    placeholder="Bed B-04"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                    value={editingPatient.bedNumber}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bedNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Registry Status</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                  value={editingPatient.status}
                  onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value })}
                >
                  <option value="Outpatient">Outpatient</option>
                  <option value="Admitted">Admitted</option>
                  <option value="ICU">ICU</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingPatient(null);
                  }}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Delete Confirmation Modal */}
      {patientDeleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Confirm Patient Deletion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this patient record? This action cannot be undone and will purge all EMR details.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setPatientDeleteConfirmId(null)}
                className="h-9 px-4 border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = patientDeleteConfirmId;
                  setPatientDeleteConfirmId(null);
                  handleDeletePatient(id);
                }}
                className="h-9 px-4 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
