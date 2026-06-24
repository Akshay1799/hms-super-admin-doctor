import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments.service";
import { Appointment } from "../types/appointments.types";

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsService.getAppointments,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: Omit<Appointment, "id">) =>
      appointmentsService.createAppointment(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; date: string; time: string }) =>
      appointmentsService.rescheduleAppointment(variables.id, variables.date, variables.time),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
