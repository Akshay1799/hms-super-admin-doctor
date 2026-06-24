"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { UserFilters } from "@/features/iam/components/UserFilters";
import { UserTable } from "@/features/iam/components/UserTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useActivateUser,
  useEnableMfa,
  useDisableMfa,
} from "@/features/iam/hooks/useIam";
import { User } from "@/features/iam/types/iam.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  // Dialog triggers
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [userToActivate, setUserToActivate] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [userToEnableMfa, setUserToEnableMfa] = useState<User | null>(null);
  const [mfaMethod, setMfaMethod] = useState<"Email OTP" | "Authenticator App" | "SMS OTP">("Email OTP");

  // Queries & Mutations
  const { data: users = [], isLoading } = useUsers({
    search,
    role: role || undefined,
    status: status || undefined,
  });

  const deleteMutation = useDeleteUser();
  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();
  
  // Custom actions
  const enableMfaMutation = useEnableMfa(userToEnableMfa?.id || "");

  const handleResetPassword = (user: User) => {
    toast.success(`Password reset link dispatched to ${user.email}.`);
    setUserToResetPassword(null);
  };

  const handleSendInvite = (user: User) => {
    toast.success(`Invitation link dispatched successfully to ${user.email}.`);
  };

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Users" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="User Administration"
          description="Administer and authenticate system admins, tenant clients, and clinical practitioners."
        />

        <UserFilters
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
        />

        <UserTable
          data={users}
          isLoading={isLoading}
          onEdit={(user) => router.push(`/users/${user.id}`)} // Redirect to details settings tab
          onSuspend={setUserToSuspend}
          onActivate={setUserToActivate}
          onDelete={setUserToDelete}
          onResetPassword={setUserToResetPassword}
          onSendInvite={handleSendInvite}
          onEnableMfa={setUserToEnableMfa}
        />
      </div>

      {/* Suspend Confirmation */}
      {userToSuspend && (
        <ConfirmDialog
          isOpen={!!userToSuspend}
          onClose={() => setUserToSuspend(null)}
          onConfirm={() => {
            suspendMutation.mutate(userToSuspend.id, {
              onSuccess: () => setUserToSuspend(null),
            });
          }}
          title="Suspend User Access"
          description={`Are you sure you want to suspend "${userToSuspend.firstName} ${userToSuspend.lastName}"? This will block their system entry.`}
          confirmText={suspendMutation.isPending ? "Suspending..." : "Suspend"}
          cancelText="Cancel"
          type="destructive"
        />
      )}

      {/* Activate Confirmation */}
      {userToActivate && (
        <ConfirmDialog
          isOpen={!!userToActivate}
          onClose={() => setUserToActivate(null)}
          onConfirm={() => {
            activateMutation.mutate(userToActivate.id, {
              onSuccess: () => setUserToActivate(null),
            });
          }}
          title="Activate User Access"
          description={`Are you sure you want to restore access for "${userToActivate.firstName} ${userToActivate.lastName}"?`}
          confirmText={activateMutation.isPending ? "Activating..." : "Activate"}
          cancelText="Cancel"
          type="info"
        />
      )}

      {/* Reset Password Confirmation */}
      {userToResetPassword && (
        <ConfirmDialog
          isOpen={!!userToResetPassword}
          onClose={() => setUserToResetPassword(null)}
          onConfirm={() => handleResetPassword(userToResetPassword)}
          title="Reset Password Credentials"
          description={`Are you sure you want to reset password for "${userToResetPassword.firstName} ${userToResetPassword.lastName}"?`}
          confirmText="Send Link"
          cancelText="Cancel"
        />
      )}

      {/* Configure MFA Dialog */}
      {userToEnableMfa && (
        <ConfirmDialog
          isOpen={!!userToEnableMfa}
          onClose={() => setUserToEnableMfa(null)}
          onConfirm={() => {
            enableMfaMutation.mutate(mfaMethod, {
              onSuccess: () => setUserToEnableMfa(null),
            });
          }}
          title={`Configure MFA - ${userToEnableMfa.firstName} ${userToEnableMfa.lastName}`}
          confirmText={enableMfaMutation.isPending ? "Enabling..." : "Enable"}
          cancelText="Cancel"
        >
          <div className="space-y-4 pt-2">
            <select
              value={mfaMethod}
              onChange={(e) => setMfaMethod(e.target.value as any)}
              className="h-10 w-full rounded-[var(--radius-input)] border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Email OTP">Email OTP</option>
              <option value="Authenticator App">Authenticator App (TOTP)</option>
              <option value="SMS OTP">SMS OTP</option>
            </select>
          </div>
        </ConfirmDialog>
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <DeleteDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(userToDelete.id, {
              onSuccess: () => setUserToDelete(null),
            });
          }}
          title="Delete User Account"
          description="Are you sure you want to permanently delete this user account? This cannot be undone."
          itemName={`${userToDelete.firstName} ${userToDelete.lastName}`}
        />
      )}
    </PageContainer>
  );
}
