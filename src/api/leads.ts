import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { Lead } from '../types';

interface LeadFilters {
  status?: string;
  fuente?: string;
  provincia?: string;
  search?: string;
}

interface ExportAgenciasResponse {
  requested: number;
  created: number;
  failed: Array<{ id: string; error: string }>;
}

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.fuente) params.set('fuente', filters.fuente);
      if (filters?.provincia) params.set('provincia', filters.provincia);
      if (filters?.search) params.set('search', filters.search);
      const { data } = await apiClient.get<Lead[]>(`/leads?${params}`);
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Lead>(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAgenciasBase(search?: string, enabled = true) {
  return useQuery({
    queryKey: ['agencias-base', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await apiClient.get<Lead[]>(`/leads/agencias-base?${params}`);
      return data;
    },
    enabled,
  });
}

export function useExportAgencias() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      const { data } = await apiClient.post<ExportAgenciasResponse>('/leads/export-agencias', { ids });
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias-base'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data } = await apiClient.patch<Lead>(`/leads/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads', undefined]);

      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(['leads', undefined], (old) =>
          old?.map((l) => (l.id === id ? { ...l, ...updates } as Lead : l))
        );
      }

      return { previousLeads };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', undefined], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
