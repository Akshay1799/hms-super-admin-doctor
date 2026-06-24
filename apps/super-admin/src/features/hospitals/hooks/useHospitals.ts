import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalService } from "../services/hospital.service";
import { CreateHospitalInput } from "../schemas/hospital.schema";
import { Branch, Department, HospitalCapacity, HospitalAccreditation, HospitalSettings } from "../types/hospital.types";

export function useHospitals(filters?: {
  search?: string;
  tenantId?: string;
  type?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["hospitals", filters],
    queryFn: () => hospitalService.getHospitals(filters),
  });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ["hospital", id],
    queryFn: () => hospitalService.getHospital(id),
    enabled: !!id,
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.createHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useUpdateHospital(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateHospitalInput>) => hospitalService.updateHospital(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["hospital", id] });
    },
  });
}

export function useSuspendHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.suspendHospital,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["hospital", data.id] });
    },
  });
}

export function useActivateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.activateHospital,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["hospital", data.id] });
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.deleteHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

// Branch hooks
export function useBranches(hospitalId: string) {
  return useQuery({
    queryKey: ["hospital", hospitalId, "branches"],
    queryFn: () => hospitalService.getBranches(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useCreateBranch(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Branch, "id" | "hospitalId" | "doctorCount" | "patientCount" | "departmentCount">) =>
      hospitalService.createBranch(hospitalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId, "branches"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId] });
    },
  });
}

export function useUpdateBranch(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, input }: { branchId: string; input: Partial<Branch> }) =>
      hospitalService.updateBranch(hospitalId, branchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId, "branches"] });
    },
  });
}

export function useDeleteBranch(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => hospitalService.deleteBranch(hospitalId, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId, "branches"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId] });
    },
  });
}

// Department hooks
export function useDepartments(branchId: string) {
  return useQuery({
    queryKey: ["departments", branchId],
    queryFn: () => hospitalService.getDepartments(branchId),
    enabled: !!branchId,
  });
}

export function useCreateDepartment(branchId: string, hospitalId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; status: string }) => hospitalService.createDepartment(branchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", branchId] });
      if (hospitalId) {
        queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId, "branches"] });
      }
    },
  });
}

export function useUpdateDepartment(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ depId, input }: { depId: string; input: Partial<Department> }) =>
      hospitalService.updateDepartment(branchId, depId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", branchId] });
    },
  });
}

export function useDeleteDepartment(branchId: string, hospitalId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (depId: string) => hospitalService.deleteDepartment(branchId, depId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", branchId] });
      if (hospitalId) {
        queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId, "branches"] });
      }
    },
  });
}

// Capacity & Accreditation Updates
export function useUpdateCapacity(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HospitalCapacity) => hospitalService.updateCapacity(hospitalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}

export function useUpdateAccreditation(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HospitalAccreditation) => hospitalService.updateAccreditation(hospitalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId] });
    },
  });
}

export function useUpdateSettings(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HospitalSettings) => hospitalService.updateSettings(hospitalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", hospitalId] });
    },
  });
}
