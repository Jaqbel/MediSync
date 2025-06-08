import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TreatmentHistory, InsertTreatmentHistory } from "@shared/schema";

export function useTreatmentHistory(patientId: number) {
  return useQuery({
    queryKey: ["/api/patients", patientId, "treatments"],
    queryFn: async (): Promise<TreatmentHistory[]> => {
      const response = await fetch(`/api/patients/${patientId}/treatments`);
      if (!response.ok) {
        throw new Error('Failed to fetch treatment history');
      }
      return response.json();
    },
    enabled: !!patientId,
  });
}

export function useTreatment(id: number) {
  return useQuery({
    queryKey: ["/api/treatments", id],
    queryFn: async (): Promise<TreatmentHistory> => {
      const response = await fetch(`/api/treatments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch treatment');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTreatment(patientId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (treatment: Omit<InsertTreatmentHistory, 'patientId' | 'userId'>) => {
      const response = await fetch(`/api/patients/${patientId}/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treatment),
      });
      if (!response.ok) throw new Error('Failed to create treatment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients", patientId, "treatments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...treatment }: Partial<InsertTreatmentHistory> & { id: number }) => {
      const response = await fetch(`/api/treatments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treatment),
      });
      if (!response.ok) throw new Error('Failed to update treatment');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/treatments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete treatment');
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });
}

export function useUploadTreatmentPhotos() {
  return useMutation({
    mutationFn: async (photoCount: number): Promise<{ photoUrls: string[] }> => {
      const response = await fetch("/api/treatments/upload-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoCount }),
      });
      if (!response.ok) throw new Error('Failed to upload photos');
      return response.json();
    },
  });
}