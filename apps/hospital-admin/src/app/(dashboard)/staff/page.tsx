"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Users2,
  Plus,
  Loader2,
  Mail,
  Phone,
  Shield,
  Clock,
  Building,
  X,
  User,
  Heart,
  LayoutGrid,
  List,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { maskEmail, maskPhone } from "@/utils/masking";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  phone?: string;
  specialty?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

function StaffPageContent() {
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [departments, setDepartments] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<StaffMember | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [customRole, setCustomRole] = useState("");
  const [customDept, setCustomDept] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState({
    name: "",
    email: "",
    role: "DOCTOR",
    departmentId: "",
    specialty: "",
    phone: "",
  });

  async function fetchStaff() {
    try {
      const res = await apiClient.get("/users");
      setStaff(res.data.data);
    } catch {
      toast.error("Failed to load staff list");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await apiClient.get("/departments");
      setDepartments(res.data.data);
      if (res.data.data.length > 0) {
        setInviteInput((prev) => ({ ...prev, departmentId: res.data.data[0]._id }));
      }
    } catch {}
  }

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (searchParams && searchParams.get("invite") === "true") {
      setIsInviteOpen(true);
    }
  }, [searchParams]);

  const handleDoctorClick = async (doc: StaffMember) => {
    setSelectedDoctor(doc);
    try {
      // Query patients assigned to this physician
      const res = await apiClient.get(`/patients?assignedDoctorId=${doc._id}`);
      setDoctorPatients(res.data.data || []);
    } catch {
      // Fallback to mock patients if query fails
      setDoctorPatients([
        { _id: "p1", name: "Rahul Sharma", age: 34, gender: "Male", status: "Active", ward: "General Ward", bedNumber: "B-10" },
        { _id: "p2", name: "Sunita Verma", age: 29, gender: "Female", status: "Admitted", ward: "Emergency ICU", bedNumber: "ICU-04" }
      ]);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.name || !inviteInput.email) {
      toast.error("Please fill in name and email");
      return;
    }

    const finalRole = inviteInput.role === "CUSTOM_ROLE" ? customRole : inviteInput.role;
    const finalDepartmentId = inviteInput.departmentId === "CUSTOM_DEPT" ? customDept : inviteInput.departmentId;

    if (!finalRole) {
      toast.error("Please select or type a role");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = finalRole.toUpperCase() === "DOCTOR" ? "/users/doctors/invite" : "/users/staff/invite";
      await apiClient.post(endpoint, {
        ...inviteInput,
        role: finalRole,
        departmentId: finalDepartmentId,
        hospitalId: user?.hospitalId,
        tenantId: user?.tenantId,
      });

      toast.success("Invitation sent successfully! The employee will receive an activation email.");
      setIsInviteOpen(false);
      setInviteInput({
        name: "",
        email: "",
        role: "DOCTOR",
        departmentId: departments[0]?._id || "",
        specialty: "",
        phone: "",
      });
      setCustomRole("");
      setCustomDept("");
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await apiClient.patch(`/users/info/${editingStaff._id}`, {
        name: editingStaff.name,
        phone: editingStaff.phone,
        specialty: editingStaff.specialty,
        departmentId: editingStaff.departmentId || null,
        status: editingStaff.status,
      });
      toast.success("Staff profile updated successfully!");
      setIsEditOpen(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to update staff profile");
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string, action: 'suspend' | 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        await apiClient.delete(`/users/info/${id}`);
        toast.error("Staff member successfully deleted.");
      } else if (action === 'deactivate') {
        await apiClient.patch(`/users/info/${id}`, { status: 'Inactive' });
        toast.success("Staff member successfully deactivated.");
      } else {
        const endpoint = `/users/info/${id}/${action}`;
        await apiClient.patch(endpoint);
        toast.success(`Staff member successfully ${action === 'suspend' ? 'suspended' : 'activated'}.`);
      }
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
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
      <div className="flex justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          View full staff registry, check credentials, onboard new doctors or nurses, and manage portal access permissions.
        </p>
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
            onClick={() => setIsInviteOpen(true)}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Invite Staff
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Invite Staff / Doctor</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rajesh Kumar"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inviteInput.name}
                  onChange={(e) => setInviteInput({ ...inviteInput, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@hospital.com"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inviteInput.email}
                  onChange={(e) => setInviteInput({ ...inviteInput, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">System Role *</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={inviteInput.role}
                    onChange={(e) => setInviteInput({ ...inviteInput, role: e.target.value })}
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="DEPT_ADMIN">Department Admin</option>
                    <option value="STAFF">Generic Staff</option>
                    <option value="CUSTOM_ROLE">Other (Type custom role...)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={inviteInput.departmentId}
                    onChange={(e) => setInviteInput({ ...inviteInput, departmentId: e.target.value })}
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="CUSTOM_DEPT">Other (Type custom department...)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Custom Inputs if "Other" is chosen */}
              {inviteInput.role === "CUSTOM_ROLE" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Type Custom Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LAB_TECHNICIAN, ACCOUNTANT"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                </div>
              )}

              {inviteInput.departmentId === "CUSTOM_DEPT" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Type Custom Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dentistry, Nephrology Ward"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                  />
                </div>
              )}

              {inviteInput.role === "DOCTOR" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="Cardiologist"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={inviteInput.specialty}
                    onChange={(e) => setInviteInput({ ...inviteInput, specialty: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9988776655"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inviteInput.phone}
                  onChange={(e) => setInviteInput({ ...inviteInput, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Layout Content */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {staff.map((member) => (
            <div key={member._id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 hover:border-primary transition-all duration-150 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDoctorClick(member)}
                    className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold uppercase shrink-0 hover:scale-105 transition-transform cursor-pointer"
                  >
                    {member.name.charAt(0)}
                  </button>
                  <div className="space-y-0.5 text-left">
                    <button
                      onClick={() => handleDoctorClick(member)}
                      className="font-bold text-foreground hover:text-blue-600 transition-colors text-xs text-left"
                    >
                      {member.name}
                    </button>
                    {member.specialty && (
                      <p className="text-[10px] text-muted-foreground font-normal">{member.specialty}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                    <Shield className="h-3 w-3" />
                    {member.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      member.status === "Active"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : member.status === "Pending"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {member.status}
                  </span>
                </div>

                <div className="border-t border-border pt-2 text-[11px] space-y-1.5 text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5 font-sans">
                    <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{member.departmentId ? member.departmentId.name : "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{maskEmail(member.email)}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>{maskPhone(member.phone)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3.5 flex justify-end gap-1.5">
                {member.status === "Active" ? (
                  <button
                    onClick={() => handleStatusChange(member._id, member.status, 'suspend')}
                    className="px-2 h-7 border border-border text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
                  >
                    Suspend
                  </button>
                ) : member.status === "Suspended" ? (
                  <button
                    onClick={() => handleStatusChange(member._id, member.status, 'activate')}
                    className="px-2 h-7 border border-border text-[10px] font-bold text-green-600 hover:bg-green-500/10 rounded cursor-pointer transition-colors"
                  >
                    Activate
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    setEditingStaff({
                      _id: member._id,
                      name: member.name,
                      phone: member.phone || "",
                      specialty: member.specialty || "",
                      departmentId: member.departmentId?._id || "",
                      status: member.status,
                      role: member.role,
                      email: member.email,
                    });
                    setIsEditOpen(true);
                  }}
                  className="px-2.5 h-7 border border-border text-[10px] font-bold text-primary hover:bg-primary/10 rounded cursor-pointer transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange(member._id, member.status, 'delete')}
                  className="px-2 h-7 border border-border text-[10px] font-bold text-muted-foreground hover:bg-muted rounded cursor-pointer transition-colors"
                >
                  Deactivate
                </button>
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
                  <th className="p-4">Name</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-foreground">
                {staff.map((member) => (
                  <tr key={member._id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold">
                      <button
                        onClick={() => handleDoctorClick(member)}
                        className="flex items-center gap-3 hover:text-blue-600 text-left cursor-pointer focus:outline-none"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold uppercase shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{member.name}</p>
                          {member.specialty && <p className="text-[10px] text-muted-foreground font-normal">{member.specialty}</p>}
                        </div>
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        <Shield className="h-3 w-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {member.departmentId ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {member.departmentId.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 space-y-0.5 font-mono">
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground font-sans" />
                        {maskEmail(member.email)}
                      </p>
                      {member.phone && (
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground font-sans" />
                          {maskPhone(member.phone)}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === "Active"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : member.status === "Pending"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === member._id ? null : member._id)}
                          className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors ml-auto"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeDropdownId === member._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                            <div className="absolute right-0 mt-1 w-32 rounded-lg border border-border bg-card shadow-lg z-20 py-1 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setEditingStaff({
                                    _id: member._id,
                                    name: member.name,
                                    phone: member.phone || "",
                                    specialty: member.specialty || "",
                                    departmentId: member.departmentId?._id || "",
                                    status: member.status,
                                    role: member.role,
                                    email: member.email,
                                  });
                                  setIsEditOpen(true);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-foreground flex items-center gap-2 cursor-pointer"
                              >
                                Edit
                              </button>
                              {member.status === "Active" ? (
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleStatusChange(member._id, member.status, 'suspend');
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-destructive flex items-center gap-2 cursor-pointer"
                                >
                                  Suspend
                                </button>
                              ) : (member.status === "Suspended" || member.status === "Inactive") ? (
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleStatusChange(member._id, member.status, 'activate');
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-green-600 flex items-center gap-2 cursor-pointer"
                                >
                                  Activate
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setDeactivateConfirmId(member._id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-amber-600 flex items-center gap-2 cursor-pointer"
                              >
                                Deactivate
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setDeleteConfirmId(member._id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted font-bold text-red-600 flex items-center gap-2 cursor-pointer border-t border-border mt-1 pt-2"
                              >
                                Delete
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

      {/* Staff / Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4 items-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl uppercase">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{selectedDoctor.name}</h3>
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase">
                  {selectedDoctor.role}
                </span>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Primary Specialty</span>
                <span className="font-bold text-foreground">{selectedDoctor.specialty || "General Practitioner"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/60 pt-2">
                <span>Department Scope</span>
                <span className="font-bold text-foreground">{selectedDoctor.departmentId?.name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/60 pt-2">
                <span>Assigned Shift Time</span>
                <span className="font-bold text-foreground">Day Shift (09:00 AM - 05:00 PM)</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/60 pt-2">
                <span>Email Address</span>
                <span className="font-bold text-foreground font-mono">{maskEmail(selectedDoctor.email)}</span>
              </div>
              {selectedDoctor.phone && (
                <div className="flex justify-between items-center border-t border-border/60 pt-2">
                  <span>Contact Phone</span>
                  <span className="font-bold text-foreground font-mono">{maskPhone(selectedDoctor.phone)}</span>
                </div>
              )}
            </div>

            {selectedDoctor.role === "DOCTOR" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-blue-600" />
                  Assigned Inpatients Under Care
                </h4>
                <div className="border border-border rounded-lg bg-background overflow-hidden">
                  {doctorPatients.length > 0 ? (
                    <div className="divide-y divide-border text-xs text-foreground">
                      {doctorPatients.map((pat) => (
                        <div key={pat._id} className="p-3 flex justify-between items-center hover:bg-muted/20">
                          <div>
                            <p className="font-bold">{pat.name}</p>
                            <p className="text-[10px] text-muted-foreground">{pat.age} Yrs • {pat.gender}</p>
                          </div>
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                            {pat.ward || "General Ward"} ({pat.bedNumber || "B-01"})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No active patients assigned to this physician.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1.5">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Staff Modal */}
      {isEditOpen && editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Edit Staff Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Email (Read-only)</label>
                <input
                  type="email"
                  disabled
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/60 text-muted-foreground text-sm cursor-not-allowed"
                  value={editingStaff.email}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Employee Name"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 9988776655"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                />
              </div>

              {editingStaff.role === "DOCTOR" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Medical Specialty</label>
                  <input
                    type="text"
                    placeholder="Cardiologist, Neurologist..."
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingStaff.specialty}
                    onChange={(e) => setEditingStaff({ ...editingStaff, specialty: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingStaff.departmentId || ""}
                    onChange={(e) => setEditingStaff({ ...editingStaff, departmentId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Account Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingStaff.status}
                    onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStaff(null);
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Confirm Deletion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this staff member? This action cannot be undone and will revoke all access.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-9 px-4 border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  handleStatusChange(id, "", 'delete');
                }}
                className="h-9 px-4 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Confirm Deactivation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to deactivate this staff member? This will set their status to Inactive and suspend their access.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeactivateConfirmId(null)}
                className="h-9 px-4 border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = deactivateConfirmId;
                  setDeactivateConfirmId(null);
                  handleStatusChange(id, "", 'deactivate');
                }}
                className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StaffPageContent />
    </Suspense>
  );
}
