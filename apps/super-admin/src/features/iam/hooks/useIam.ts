import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { iamService } from "../services/iam.service";
import { CreateUserInput, CreateRoleInput } from "../schemas/iam.schema";
import { MfaSettings } from "../types/iam.types";

export function useUsers(filters?: {
  search?: string;
  role?: string;
  status?: string;
  tenantId?: string;
}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => iamService.getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => iamService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateUserInput>) => iamService.updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.suspendUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.activateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Roles hooks
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: iamService.getRoles,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateRoleInput>) => iamService.updateRole(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDuplicateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.duplicateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// Permissions hook
export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: iamService.getPermissions,
  });
}

// Sessions hooks
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: iamService.getSessions,
  });
}

export function useTerminateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: iamService.terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useForceLogoutAll(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => iamService.forceLogoutAll(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}

// Login History hook
export function useLoginHistory() {
  return useQuery({
    queryKey: ["login-history"],
    queryFn: iamService.getLoginHistory,
  });
}

// MFA hooks
export function useMfa() {
  return useQuery({
    queryKey: ["mfa"],
    queryFn: iamService.getMfa,
  });
}

export function useEnableMfa(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: MfaSettings["method"]) => iamService.enableMfa(userId, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}

export function useDisableMfa(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => iamService.disableMfa(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
}
