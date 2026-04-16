import { useState } from 'react';
import { useLeads } from '../../api/leads';
import { Spinner } from '../ui/Spinner';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Phone, Mail, CheckSquare, Square, Rocket } from 'lucide-react';
import { ONBOARDING_CHECKLIST_TEMPLATE } from '../../lib/constants';
import type { Lead } from '../../types';

type ChecklistState = Record<string, boolean>;

// Store checklist in localStorage keyed by lead ID
function getChecklist(leadId: string): ChecklistState {
  try {
    const raw = localStorage.getItem(`checklist:${leadId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecklist(leadId: string, state: ChecklistState) {
  localStorage.setItem(`checklist:${leadId}`, JSON.stringify(state));
}

export function OnboardingPage() {
  const { data: leads, isLoading } = useLeads({ status: 'Cliente cerrado' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  const clients = leads ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} en onboarding
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted">
          <Rocket size={40} className="mb-3 opacity-30" />
          <p>No hay clientes en onboarding</p>
          <p className="text-xs mt-1">Los leads con estado "Cliente cerrado" aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((lead) => (
            <OnboardingCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingCard({ lead }: { lead: Lead }) {
  const [checklist, setChecklist] = useState<ChecklistState>(() => getChecklist(lead.id));

  const toggleItem = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    saveChecklist(lead.id, updated);
  };

  const completed = ONBOARDING_CHECKLIST_TEMPLATE.filter((item) => checklist[item.id]).length;
  const total = ONBOARDING_CHECKLIST_TEMPLATE.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <Card hover className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white leading-tight">{lead.nombre}</h3>
          <Badge color="#dcfc03">Cliente</Badge>
        </div>
        <p className="text-xs text-muted mt-1">{lead.provincia}{lead.zona ? ` · ${lead.zona}` : ''}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">Progreso</span>
          <span className="text-xs font-semibold" style={{ color: pct === 100 ? '#dcfc03' : pct > 50 ? '#10b981' : '#7c3aed' }}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: pct === 100 ? '#dcfc03' : pct > 50 ? '#10b981' : '#7c3aed',
            }}
          />
        </div>
        <p className="text-xs text-muted mt-1">{completed}/{total} completados</p>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {ONBOARDING_CHECKLIST_TEMPLATE.map((item) => {
          const done = !!checklist[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              {done ? (
                <CheckSquare size={15} className="text-secondary shrink-0" />
              ) : (
                <Square size={15} className="text-muted/50 shrink-0" />
              )}
              <span className={`text-xs ${done ? 'text-muted line-through' : 'text-white'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contact actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        {lead.telefono && (
          <a
            href={`tel:${lead.telefono}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors text-xs text-secondary"
          >
            <Phone size={13} /> Llamar
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-xs text-primary"
          >
            <Mail size={13} /> Email
          </a>
        )}
      </div>
    </Card>
  );
}
