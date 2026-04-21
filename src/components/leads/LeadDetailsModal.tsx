import { useState } from 'react';
import { X, ChevronRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead } from '../../api/leads';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { OutreachActivityTab } from './OutreachActivityTab';
import { STATUS_COLORS, LEAD_STATUSES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { Lead, LeadStatus } from '../../types';

interface LeadDetailsModalProps {
  leadId: string;
  fromAgenciasBase?: boolean;
  onExportClick?: () => void;
  onClose?: () => void;
}

type TabType = 'info' | 'journey' | 'notes' | 'outreach' | 'filters';

const TABS: { id: TabType; label: string }[] = [
  { id: 'info', label: 'Información' },
  { id: 'outreach', label: 'Outreach & Actividad' },
  { id: 'journey', label: 'Viaje del Lead' },
  { id: 'notes', label: 'Notas' },
  { id: 'filters', label: 'Filtros Favoritos' },
];

export function LeadDetailsModal({
  leadId,
  fromAgenciasBase,
  onExportClick,
  onClose,
}: LeadDetailsModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [nextStatusEdit, setNextStatusEdit] = useState(false);
  const [nextStatus, setNextStatus] = useState<LeadStatus | ''>('');
  const [nextStatusDate, setNextStatusDate] = useState('');

  const { data: lead, isLoading } = useLead(leadId);
  const updateLead = useUpdateLead();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleStateChange = (newState: LeadStatus) => {
    if (lead) {
      updateLead.mutate({
        id: lead.id,
        updates: { estado: newState },
      });
    }
  };

  const handleNotesChange = (newNotes: string) => {
    if (lead) {
      updateLead.mutate({
        id: lead.id,
        updates: { notas: newNotes },
      });
    }
  };

  const handleSaveNextStatus = () => {
    if (nextStatus && lead) {
      const updates: Record<string, unknown> = {};
      updates.estado = nextStatus as LeadStatus;
      if (nextStatusDate) {
        updates.proximaAccionFecha = nextStatusDate;
      }
      updateLead.mutate({ id: lead.id, updates });
      setNextStatusEdit(false);
      setNextStatus('');
      setNextStatusDate('');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-card p-6 text-center">
          <p className="text-muted mb-4">Lead no encontrado</p>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center" onClick={handleClose}>
      <div className="glass-card h-full max-h-[90vh] max-w-[1200px] w-full mx-auto flex flex-col overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-border p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{lead.nombre}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted text-sm">{lead.provincia}</span>
              <span className="text-muted text-sm">•</span>
              <Badge color={STATUS_COLORS[lead.estado]}>{lead.estado}</Badge>
              <span className="text-muted text-sm">•</span>
              <span className="text-muted text-sm">Prioridad: {lead.prioridad}/3</span>
            </div>
          </div>

          <div className="flex gap-2">
            {fromAgenciasBase && onExportClick && (
              <Button variant="primary" size="sm" onClick={onExportClick}>
                <Save size={16} /> Exportar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-border px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted hover:text-white border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'info' && (
            <InformationTab
              lead={lead}
              onStateChange={handleStateChange}
            />
          )}

          {activeTab === 'outreach' && (
            <OutreachActivityTab
              lead={lead}
              onUpdate={(updates) => updateLead.mutate({ id: lead.id, updates })}
            />
          )}

          {activeTab === 'journey' && (
            <JourneyTab
              lead={lead}
              nextStatusEdit={nextStatusEdit}
              nextStatus={nextStatus}
              nextStatusDate={nextStatusDate}
              onNextStatusChange={setNextStatus}
              onNextStatusDateChange={setNextStatusDate}
              onEditToggle={() => setNextStatusEdit(!nextStatusEdit)}
              onSaveNextStatus={handleSaveNextStatus}
            />
          )}

          {activeTab === 'notes' && (
            <NotesTab lead={lead} onNotesChange={handleNotesChange} />
          )}

          {activeTab === 'filters' && <FiltersTab />}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function InformationTab({
  lead,
  onStateChange,
}: {
  lead: Lead;
  onStateChange: (state: LeadStatus) => void;
}) {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Básicos */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Datos Básicos</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-dim uppercase">Nombre</p>
              <p className="text-white font-medium">{lead.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Provincia</p>
              <p className="text-white">{lead.provincia}</p>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Zona</p>
              <p className="text-white">{lead.zona || '-'}</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Contacto</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-dim uppercase">Email</p>
              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                {lead.email || '-'}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Teléfono</p>
              <a href={`tel:${lead.telefono}`} className="text-primary hover:underline">
                {lead.telefono || '-'}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Web</p>
              <a href={lead.web} target="_blank" rel="noopener" className="text-primary hover:underline">
                {lead.web ? 'Visitar' : '-'}
              </a>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Detalles</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-dim uppercase">Perfil Idealista</p>
              <a
                href={lead.perfilIdealista}
                target="_blank"
                rel="noopener"
                className="text-primary hover:underline"
              >
                {lead.perfilIdealista ? 'Ver perfil' : '-'}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Tipo de Alquiler</p>
              <p className="text-white text-sm">{lead.tipoAlquiler?.join(', ') || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Nº Anuncios Activos</p>
              <p className="text-white font-semibold">{lead.numAnuncios}</p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Estado</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-dim uppercase">Estado Actual</p>
              <select
                value={lead.estado}
                onChange={(e) => onStateChange(e.target.value as LeadStatus)}
                className="w-full bg-surface-700 border border-border rounded-lg px-2 py-1 text-sm text-white"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Nivel Volumen</p>
              <p className="text-white">{lead.nivelVolumen}</p>
            </div>
            <div>
              <p className="text-xs text-muted-dim uppercase">Validado</p>
              <p className="text-white">{lead.validado ? new Date(lead.validado).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyTab({
  lead,
  nextStatusEdit,
  nextStatus,
  nextStatusDate,
  onNextStatusChange,
  onNextStatusDateChange,
  onEditToggle,
  onSaveNextStatus,
}: {
  lead: Lead;
  nextStatusEdit: boolean;
  nextStatus: LeadStatus | '';
  nextStatusDate: string;
  onNextStatusChange: (status: LeadStatus | '') => void;
  onNextStatusDateChange: (date: string) => void;
  onEditToggle: () => void;
  onSaveNextStatus: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Estado Actual */}
      <div className="glass-card-hover p-4 border border-border rounded-xl">
        <p className="text-xs text-muted-dim uppercase mb-2">Estado Actual</p>
        <div className="flex items-center gap-3">
          <Badge color={STATUS_COLORS[lead.estado]} className="text-base">
            {lead.estado}
          </Badge>
          {lead.validado && (
            <span className="text-sm text-muted">
              desde {new Date(lead.validado).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Timeline de Estados */}
      <div className="space-y-3">
        <p className="text-xs text-muted-dim uppercase font-semibold">Timeline de Estados</p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Sin iniciar</span>
          <ChevronRight size={16} />
          <span>{lead.estado}</span>
        </div>
      </div>

      {/* Próxima Acción */}
      <div className="glass-card-hover p-4 border border-border rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-dim uppercase font-semibold">Próxima Acción Esperada</p>
          {!nextStatusEdit && (
            <Button variant="ghost" size="sm" onClick={onEditToggle}>
              Editar
            </Button>
          )}
        </div>

        {nextStatusEdit ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Estado Esperado</label>
              <select
                value={nextStatus}
                onChange={(e) => onNextStatusChange(e.target.value as LeadStatus | '')}
                className="w-full bg-surface-700 border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">Seleccionar estado...</option>
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Fecha Esperada</label>
              <input
                type="date"
                value={nextStatusDate}
                onChange={(e) => onNextStatusDateChange(e.target.value)}
                className="w-full bg-surface-700 border border-border rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={onSaveNextStatus}>
                Guardar
              </Button>
              <Button variant="secondary" size="sm" onClick={onEditToggle}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Por definir</p>
        )}
      </div>
    </div>
  );
}

function NotesTab({ lead, onNotesChange }: { lead: Lead; onNotesChange: (notes: string) => void }) {
  const [notes, setNotes] = useState(lead.notas);

  const handleSave = () => {
    onNotesChange(notes);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Añade notas sobre este lead..."
        className="w-full h-48 bg-surface-700 border border-border rounded-xl p-3 text-white placeholder:text-muted-dim resize-none focus:outline-none focus:border-primary"
      />
      <Button variant="primary" onClick={handleSave}>
        Guardar Notas
      </Button>
    </div>
  );
}

function FiltersTab() {
  return (
    <div className="space-y-4">
      <div className="text-muted text-sm">
        <p className="mb-4">Los filtros favoritos te permiten crear búsquedas rápidas y guardarlas para reutilizarlas.</p>
        <p className="text-xs text-muted-dim">
          Esta funcionalidad estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
