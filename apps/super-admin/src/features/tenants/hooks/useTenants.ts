import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService, TenantDetails } from "../services/tenant.service";
import { CreateTenantInput } from "../schemas/tenant.schema";
import { FeatureFlags, UsageQuota, TenantSubscription } from "../types/tenant.types";

export function useTenants(filters?: { search?: string; status?: string; plan?: string }) {
  return useQuery({
    queryKey: ["tenants", filters],
    queryFn: () => tenantService.getTenants(filters),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: () => tenantService.getTenantById(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantService.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateTenantInput>) => tenantService.updateTenant(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantService.deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useSuspendTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantService.suspendTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", data.id] });
    },
  });
}

export function useActivateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantService.activateTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", data.id] });
    },
  });
}

export function useVerifyDomain(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tenantService.verifyDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    },
  });
}

export function useUpdateFeatureFlags(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (flags: FeatureFlags) => tenantService.updateFeatureFlags(id, flags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    },
  });
}

export function useUpdateQuotas(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotas: UsageQuota) => tenantService.updateQuotas(id, quotas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    },
  });
}

export function useUpdateSubscription(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscription: TenantSubscription) => tenantService.updateSubscription(id, subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    },
  });
}
