import React, { useState, useEffect } from "react";
import { useRoles, useUpdateRole } from "../hooks/useIam";
import { MOCK_PERMISSIONS } from "../mocks/iam.mocks";
import { Check, Save, ShieldAlert, ShieldCheck } from "lucide-react";

const ACTIONS = [
  { key: "create", label: "Create" },
  { key: "read", label: "Read" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

export function PermissionMatrix() {
  const { data: roles = [], isLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const updateRoleMutation = useUpdateRole(selectedRoleId);

  // Initialize selected role
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const activeRole = roles.find((r) => r.id === selectedRoleId);

  // Sync role permissions to state
  useEffect(() => {
    if (activeRole) {
      setPermissions(activeRole.permissions);
    }
  }, [activeRole]);

  const togglePermission = (module: string, action: string) => {
    const key = `${module.toLowerCase()}:${action}`;
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    if (!activeRole) return;
    updateRoleMutation.mutate({
      permissions,
    });
  };

  const isSuperAdmin = activeRole?.name === "SUPER_ADMIN";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
        <p className="text-sm font-semibold">Loading Permission Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Global Permission Matrix</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Toggle CRUD gates directly for each system role.</p>
          </div>
          {/* Role selector dropdown */}
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-input)] border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={updateRoleMutation.isPending || isSuperAdmin}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          {updateRoleMutation.isPending ? "Saving Matrix..." : "Save Configuration"}
        </button>
      </div>

      {isSuperAdmin && (
        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-primary text-sm font-semibold">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div>
            <p>SUPER_ADMIN Role Override Active</p>
            <p className="text-xs font-normal mt-0.5">
              The SUPER_ADMIN role holds wildcard permissions (`*`) bypassing the permission gate.
            </p>
          </div>
        </div>
      )}

      {/* Grid Matrix Table */}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Clinical / Operational Module</th>
              {ACTIONS.map((act) => (
                <th key={act.key} className="px-6 py-4 text-center">
                  {act.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_PERMISSIONS.map((module) => {
              return (
                <tr key={module} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground align-middle">{module}</td>
                  {ACTIONS.map((act) => {
                    const permKey = `${module.toLowerCase()}:${act.key}`;
                    const isChecked = isSuperAdmin || permissions.includes(permKey);

                    return (
                      <td key={act.key} className="px-6 py-4 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isSuperAdmin}
                          onChange={() => togglePermission(module, act.key)}
                          className="h-4.5 w-4.5 rounded border-input text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
