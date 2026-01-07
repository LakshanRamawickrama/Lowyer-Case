import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CaseWithClient, InsertCase } from "@shared/schema";

export function useCases() {
  return useQuery<CaseWithClient[]>({
    queryKey: ["/api/cases"],
  });
}

export function useCase(id: number) {
  return useQuery<CaseWithClient>({
    queryKey: ["/api/cases", id],
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertCase) => {
      const response = await apiRequest("POST", "/api/cases", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCase> }) => {
      const response = await apiRequest("PUT", `/api/cases/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cases/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, title, file }: { caseId: number; title: string; file: File }) => {
      const formData = new FormData();
      formData.append("case", caseId.toString());
      formData.append("title", title);
      formData.append("file", file);

      const response = await fetch("/api/case-documents", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header, fetch will do it with boundary
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases", variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, caseId }: { id: number; caseId: number }) => {
      const response = await apiRequest("DELETE", `/api/case-documents/${id}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases", variables.caseId] });
    },
  });
}
