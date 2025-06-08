import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Patient, InsertPatient } from "@shared/schema";

export function usePatients() {
  const queryClient = useQueryClient();

  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: Omit<InsertPatient, 'userId'>) => {
      const res = await apiRequest("POST", "/api/patients", patientData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPatient> }) => {
      const res = await apiRequest("PUT", `/api/patients/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });

  return {
    patients,
    isLoading,
    error,
    createPatient: createPatientMutation.mutateAsync,
    updatePatient: updatePatientMutation.mutateAsync,
    deletePatient: deletePatientMutation.mutateAsync,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,
  };
}

export function usePatient(id: number) {
  return useQuery<Patient>({
    queryKey: ["/api/patients", id],
    enabled: !!id,
  });
}
