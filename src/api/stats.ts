import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import type { KpiData, FunnelData } from '../types';

export function useKpis() {
  return useQuery({
    queryKey: ['stats', 'kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get<KpiData>('/stats/kpis');
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useFunnel() {
  return useQuery({
    queryKey: ['stats', 'funnel'],
    queryFn: async () => {
      const { data } = await apiClient.get<FunnelData[]>('/stats/funnel');
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useBySource() {
  return useQuery({
    queryKey: ['stats', 'by-source'],
    queryFn: async () => {
      const { data } = await apiClient.get<Array<{ source: string; count: number }>>('/stats/by-source');
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useByProvince() {
  return useQuery({
    queryKey: ['stats', 'by-province'],
    queryFn: async () => {
      const { data } = await apiClient.get<Array<{ province: string; count: number }>>('/stats/by-province');
      return data;
    },
    refetchInterval: 30000,
  });
}
