"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import {
  Building2,
  Plus,
  Loader2,
  UserCheck,
  Bed,
  MapPin,
  Clock,
  PhoneCall,
  Check,
  Edit3,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";

interface Department {
  _id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  location?: string;
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
  status: "Active" | "Inactive";
  totalBeds: number;
  occupiedBeds: number;
  doctorCount: number;
  nurseCount: number;
  staffCount: number;
  patientCount: number;
  extension?: string;
}

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DEPT_ADMIN'].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    name: "",
    code: "",
    type: "opd",
    description: "",
    location: "",
    totalBeds: 10,
    extension: "",
  });

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [assigningDeptId, setAssigningDeptId] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  async function fetchDepartments() {
    try {
      const res = await apiClient.get("/departments");
      setDepartments(res.data.data);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAvailableAdmins() {
    try {
      // Fetch users with doctor/staff roles who could be dept admins
      const res = await apiClient.get("/users?limit=100");
      setAvailableUsers(res.data.data);
    } catch {}
  }

  useEffect(() => {
    fetchDepartments();
    fetchAvailableAdmins();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await apiClient.post("/departments", {
        ...newDept,
        hospitalId: user?.hospitalId,
        tenantId: user?.tenantId,
        status: "Active",
      });
      toast.success("Department created successfully!");
      setIsAddOpen(false);
      setNewDept({
        name: "",
        code: "",
        type: "opd",
        description: "",
        location: "",
        totalBeds: 10,
        extension: "",
      });
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editingDept.name || !editingDept.code) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await apiClient.patch(`/departments/${editingDept._id}`, {
        name: editingDept.name,
        code: editingDept.code,
        type: editingDept.type,
        description: editingDept.description,
        location: editingDept.location,
        totalBeds: editingDept.totalBeds,
        occupiedBeds: editingDept.occupiedBeds,
        extension: editingDept.extension,
      });
      toast.success("Department updated successfully!");
      setIsEditOpen(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to update department");
    }
  };

  const handleAssignAdmin = async (deptId: string, userId: string) => {
    try {
      await apiClient.post(`/departments/${deptId}/assign-admin`, { userId });
      toast.success("Department administrator assigned!");
      setAssigningDeptId(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign admin");
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
          Manage clinical divisions, bed distributions, and assign department managers.
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

          {user?.role === "HOSPITAL_ADMIN" && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Create Department</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Cardiology Unit"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="CARD-01"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Type *</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newDept.type}
                    onChange={(e) => setNewDept({ ...newDept, type: e.target.value })}
                  >
                    <option value="opd">OPD</option>
                    <option value="ipd">IPD</option>
                    <option value="icu">ICU</option>
                    <option value="emergency">Emergency</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Block B, Floor 2"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={newDept.location}
                  onChange={(e) => setNewDept({ ...newDept, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Total Beds</label>
                  <input
                    type="number"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newDept.totalBeds}
                    onChange={(e) => setNewDept({ ...newDept, totalBeds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Extension</label>
                  <input
                    type="text"
                    placeholder="Ext 124"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newDept.extension}
                    onChange={(e) => setNewDept({ ...newDept, extension: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layout Content */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                  <p className="text-[10px] bg-muted px-2 py-0.5 text-muted-foreground rounded uppercase font-bold inline-block">
                    {dept.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                    {dept.type.toUpperCase()}
                  </span>
                  {(user?.role === "HOSPITAL_ADMIN" || user?.role === "DEPT_ADMIN") && (
                    <button
                      onClick={() => {
                        setEditingDept({ ...dept });
                        setIsEditOpen(true);
                      }}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer transition-all"
                      title="Edit Department"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground min-h-[32px] line-clamp-2">
                {dept.description || "No description provided."}
              </p>

              <div className="border-t border-border pt-3.5 space-y-2.5 text-xs text-muted-foreground">
                {dept.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{dept.location}</span>
                  </div>
                )}
                {dept.extension && (
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>Extension {dept.extension}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Beds: {dept.occupiedBeds || 0} / {dept.totalBeds || 0} Occupied</span>
                </div>
              </div>

              <div className="border-t border-border pt-3.5 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Department Head</p>
                  <p className="font-bold text-foreground">{dept.adminId?.name || "Unassigned"}</p>
                </div>

                {user?.role === "HOSPITAL_ADMIN" && (
                  <div>
                    {assigningDeptId === dept._id ? (
                      <select
                        className="h-8 border border-border rounded bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary px-1"
                        onChange={(e) => handleAssignAdmin(dept._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select User</option>
                        {availableUsers.map((u: any) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setAssigningDeptId(dept._id)}
                        className="h-8 px-2.5 bg-muted hover:bg-muted/80 text-foreground rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Assign Head
                      </button>
                    )}
                  </div>
                )}
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
                  <th className="p-4">Code</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Extension</th>
                  <th className="p-4">Beds (Occupied / Total)</th>
                  <th className="p-4">Department Head</th>
                  {(user?.role === "HOSPITAL_ADMIN" || user?.role === "DEPT_ADMIN") && (
                    <th className="p-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-foreground">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold">{dept.name}</td>
                    <td className="p-4">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-foreground">
                        {dept.code}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-semibold text-[10px] text-muted-foreground">
                      {dept.type}
                    </td>
                    <td className="p-4 text-muted-foreground">{dept.location || "N/A"}</td>
                    <td className="p-4 text-muted-foreground">{dept.extension || "N/A"}</td>
                    <td className="p-4 text-muted-foreground">
                      {dept.occupiedBeds || 0} / {dept.totalBeds || 0}
                    </td>
                    <td className="p-4 text-foreground font-semibold">
                      {dept.adminId?.name || "Unassigned"}
                    </td>
                    {(user?.role === "HOSPITAL_ADMIN" || user?.role === "DEPT_ADMIN") && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingDept({ ...dept });
                            setIsEditOpen(true);
                          }}
                          className="px-2.5 h-7 border border-border text-[10px] font-bold text-primary hover:bg-primary/10 rounded cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editingDept && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Edit Department</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Cardiology Unit"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="CARD-01"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingDept.code}
                    onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Type *</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingDept.type}
                    onChange={(e) => setEditingDept({ ...editingDept, type: e.target.value })}
                  >
                    <option value="opd">OPD</option>
                    <option value="ipd">IPD</option>
                    <option value="icu">ICU</option>
                    <option value="emergency">Emergency</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Block B, Floor 2"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingDept.location || ""}
                  onChange={(e) => setEditingDept({ ...editingDept, location: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                <textarea
                  placeholder="Provide general division guidelines..."
                  className="w-full min-h-[80px] py-2 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingDept.description || ""}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Total Beds</label>
                  <input
                    type="number"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingDept.totalBeds || 0}
                    onChange={(e) => setEditingDept({ ...editingDept, totalBeds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Occupied Beds</label>
                  <input
                    type="number"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingDept.occupiedBeds || 0}
                    onChange={(e) => setEditingDept({ ...editingDept, occupiedBeds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Extension</label>
                  <input
                    type="text"
                    placeholder="Ext 124"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editingDept.extension || ""}
                    onChange={(e) => setEditingDept({ ...editingDept, extension: e.target.value })}
                  />
                </div>
              </div>

              {/* Scoped Capacity Metrics Summary */}
              <div className="p-3.5 bg-muted/40 rounded-lg text-xs space-y-2 border border-border">
                <p className="font-bold text-foreground">Department Scoped Capacity Metrics</p>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-card border border-border rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Available Beds</p>
                    <p className="text-base font-black text-foreground mt-0.5">
                      {Math.max(0, (editingDept.totalBeds || 0) - (editingDept.occupiedBeds || 0))}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Doctors</p>
                    <p className="text-base font-black text-foreground mt-0.5">{editingDept.doctorCount || 0}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Active Patients</p>
                    <p className="text-base font-black text-foreground mt-0.5">{editingDept.patientCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingDept(null);
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
    </div>
  );
}
