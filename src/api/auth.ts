import { useMutation } from '@tanstack/react-query';
import apiClient from './client';
import { useAuthStore } from '../stores/authStore';
import type { AuthUser } from '../types';

interface LoginResponse {
  token: string;
  user: { id: string; email: string; nombre: string; role: AuthUser['role'] };
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login({ ...data.user, token: data.token });
    },
  });
}
