import { useAuthStore } from '../stores/authStore';
import { ROLE_STAGES, ROLE_TRANSITIONS } from '../lib/constants';
import type { LeadStatus } from '../types';

export function useRoleGuard() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'comercial';

  const canEditLead = (estado: LeadStatus) => {
    if (role === 'admin') return true;
    return ROLE_STAGES[role].includes(estado);
  };

  const canTransitionTo = (targetStatus: LeadStatus) => {
    if (role === 'admin') return true;
    return ROLE_TRANSITIONS[role].includes(targetStatus);
  };

  const allowedStatuses = ROLE_TRANSITIONS[role];

  return { role, canEditLead, canTransitionTo, allowedStatuses };
}
