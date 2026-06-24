import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "../services/patients.service";

export function usePatients(doctorId?: string) {
  return useQuery({
    queryKey: ["patients", { doctorId }],
    queryFn: () => patientsService.getPatients(doctorId),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientsService.getPatientById(id),
    enabled: !!id,
  });
}

export function useAddSoapNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      patientId: string;
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
      author: string;
    }) =>
      patientsService.addSoapNote(
        variables.patientId,
        variables.subjective,
        variables.objective,
        variables.assessment,
        variables.plan,
        variables.author
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["patients", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useAddDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { patientId: string; code: string; description: string }) =>
      patientsService.addDiagnosis(variables.patientId, variables.code, variables.description),
    onSuccess: (data) => {
      queryClient.setQueryData(["patients", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      patientId: string;
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      timing: string;
      foodInstructions: string;
      prescribedBy: string;
    }) =>
      patientsService.addPrescription(
        variables.patientId,
        variables.medication,
        variables.dosage,
        variables.frequency,
        variables.duration,
        variables.timing,
        variables.foodInstructions,
        variables.prescribedBy
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["patients", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useAddLabOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      patientId: string;
      name: string;
      type: "X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound";
      prescribedBy: string;
    }) =>
      patientsService.addLabOrder(
        variables.patientId,
        variables.name,
        variables.type,
        variables.prescribedBy
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["patients", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
