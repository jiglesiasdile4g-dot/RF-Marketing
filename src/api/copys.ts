import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import type { Copy } from '../types';

export function useCopys() {
  return useQuery({
    queryKey: ['copys'],
    queryFn: async () => {
      const { data } = await apiClient.get<Copy[]>('/copys');
      return data;
    },
  });
}
