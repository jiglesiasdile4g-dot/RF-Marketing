import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { generateId } from '../lib/utils';
import type { Lead, LeadStatus } from '../types';

export function useLeadSync(leads: Lead[] | undefined) {
  const previousRef = useRef<Map<string, LeadStatus>>(new Map());
  const addNotification = useNotificationStore((s) => s.addNotification);
  const initialized = useRef(false);

  useEffect(() => {
    if (!leads) return;

    const currentMap = new Map(leads.map((l) => [l.id, l.estado]));
    const prevMap = previousRef.current;

    if (initialized.current) {
      for (const lead of leads) {
        const prev = prevMap.get(lead.id);
        if (prev && prev !== lead.estado) {
          addNotification({
            id: generateId(),
            leadId: lead.id,
            leadName: lead.nombre,
            oldStatus: prev,
            newStatus: lead.estado,
            timestamp: Date.now(),
            read: false,
          });
        }
      }
    }

    previousRef.current = currentMap;
    initialized.current = true;
  }, [leads, addNotification]);
}
