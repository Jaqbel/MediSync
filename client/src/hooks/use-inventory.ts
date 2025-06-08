import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Medication, InsertMedication } from "@shared/schema";

export function useInventory() {
  const queryClient = useQueryClient();

  const {
    data: medications = [],
    isLoading,
    error,
  } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (medicationData: Omit<InsertMedication, 'userId'>) => {
      const res = await apiRequest("POST", "/api/medications", medicationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/alerts"] });
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMedication> }) => {
      const res = await apiRequest("PUT", `/api/medications/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/alerts"] });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/alerts"] });
    },
  });

  return {
    medications,
    isLoading,
    error,
    createMedication: createMedicationMutation.mutateAsync,
    updateMedication: updateMedicationMutation.mutateAsync,
    deleteMedication: deleteMedicationMutation.mutateAsync,
    isCreating: createMedicationMutation.isPending,
    isUpdating: updateMedicationMutation.isPending,
    isDeleting: deleteMedicationMutation.isPending,
  };
}

export function useMedication(id: number) {
  return useQuery<Medication>({
    queryKey: ["/api/medications", id],
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["/api/dashboard/alerts"],
  });
}
