import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicalService } from "../services/clinical.service";

export function useDoctors(filters?: {
  search?: string;
  hospitalId?: string;
  specialization?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => clinicalService.getDoctors(filters),
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => clinicalService.getDoctor(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clinicalService.createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function usePatients(filters?: {
  search?: string;
  hospitalId?: string;
  gender?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["patients", filters],
    queryFn: () => clinicalService.getPatients(filters),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => clinicalService.getPatient(id),
    enabled: !!id,
  });
}

export function useNurses(filters?: { hospitalId?: string; shift?: string }) {
  return useQuery({
    queryKey: ["nurses", filters],
    queryFn: () => clinicalService.getNurses(filters),
  });
}

export function useStaff(filters?: { hospitalId?: string; type?: string }) {
  return useQuery({
    queryKey: ["staff", filters],
    queryFn: () => clinicalService.getStaff(filters),
  });
}

export function useAppointments(filters?: { status?: string; hospitalId?: string }) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => clinicalService.getAppointments(filters),
  });
}

export function useAdmissions() {
  return useQuery({
    queryKey: ["admissions"],
    queryFn: clinicalService.getAdmissions,
  });
}

export function useOccupancy() {
  return useQuery({
    queryKey: ["bed-occupancy"],
    queryFn: clinicalService.getOccupancy,
  });
}

export function useClinicalAnalytics() {
  return useQuery({
    queryKey: ["clinical-analytics"],
    queryFn: clinicalService.getClinicalAnalytics,
  });
}
