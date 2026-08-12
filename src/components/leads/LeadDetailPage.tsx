import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Globe, ExternalLink, Edit3, Save, X,
  MapPin, Building2, Calendar, FileText,
} from 'lucide-react';
import { useLead, useLeadHistorial, useUpdateLead } from '../../api/leads';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Rating } from '../ui/Rating';
import { Spinner } from '../ui/Spinner';
import { Card } from '../ui/Card';
import {
  LEAD_STATUSES,
  getLeadStatusColor,
  getLeadStatusLabel,
  resolveLeadStatus,
} from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import type { HistorialEntry, LeadStatus } from '../../types';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const { canEditLead, canTransitionTo } = useRoleGuard();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16 text-muted">
        <p>Lead no encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/leads')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>
    );
  }

  const canEdit = canEditLead(lead.estado);

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!canTransitionTo(newStatus)) return;
    updateLead.mutate({ id: lead.id, updates: { estado: newStatus } });
  };

  const handleSaveNotes = () => {
    updateLead.mutate({ id: lead.id, updates: { notas: notesValue } });
    setEditingNotes(false);
  };

  const handlePriority = (v: number) => {
    if (canEdit) updateLead.mutate({ id: lead.id, updates: { prioridad: v } });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{lead.nombre || 'Sin nombre'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={13} className="text-muted" />
            <span className="text-sm text-muted">{lead.provincia}{lead.zona ? ` · ${lead.zona}` : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Rating value={lead.prioridad} onChange={canEdit ? handlePriority : undefined} size={18} />
          <Badge color={getLeadStatusColor(lead.estado)}>{getLeadStatusLabel(lead.estado)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info grid */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-primary" /> Información
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} icon={<Mail size={14} />} />
              <InfoField label="Teléfono" value={lead.telefono} href={lead.telefono ? `tel:${lead.telefono}` : undefined} icon={<Phone size={14} />} />
              <InfoField label="Web" value={lead.web} href={lead.web} external icon={<Globe size={14} />} />
              <InfoField label="Perfil Idealista" value={lead.perfilIdealista ? 'Ver perfil' : undefined} href={lead.perfilIdealista} external icon={<ExternalLink size={14} />} />
              <InfoField label="Fuente" value={lead.fuente} />
              <InfoField label="Validado" value={formatDate(lead.validado)} icon={<Calendar size={14} />} />
              <InfoField label="Nº Anuncios" value={lead.numAnuncios} />
              <InfoField label="Nivel volumen" value={lead.nivelVolumen} />
              {lead.tipoAlquiler?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted mb-2">Tipo alquiler</p>
                  <div className="flex flex-wrap gap-1">
                    {lead.tipoAlquiler.map((t) => (
                      <Badge key={t} color="#7c3aed">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-muted" /> Notas
              </h3>
              {canEdit && !editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setNotesValue(lead.notas); setEditingNotes(true); }}
                >
                  <Edit3 size={14} /> Editar
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  className="w-full bg-surface-700 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  rows={5}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} disabled={updateLead.isPending}>
                    <Save size={14} /> Guardar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>
                    <X size={14} /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted whitespace-pre-wrap">
                {lead.notas || 'Sin notas.'}
              </p>
            )}
          </Card>

          {/* Historial de contacto (envíos registrados por n8n) */}
          <HistorialCard leadId={lead.id} />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Status changer */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Estado del lead</h3>
            <div className="space-y-1.5">
              {LEAD_STATUSES.map((status) => {
                // Marca "Actual" si el estado del lead (normalizado) coincide con el botón.
                const isCurrent =
                  status === (resolveLeadStatus(lead.estado) ?? String(lead.estado));
                const canGoTo = canTransitionTo(status);
                const color = getLeadStatusColor(status);
                const label = getLeadStatusLabel(status);
                return (
                  <button
                    key={status}
                    disabled={!canGoTo || isCurrent || updateLead.isPending}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : canGoTo
                        ? 'text-muted hover:text-white hover:bg-white/5'
                        : 'text-muted/40 cursor-not-allowed'
                    }`}
                    style={isCurrent ? {
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}40`,
                    } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                      {isCurrent && <span className="ml-auto text-[10px] opacity-70">Actual</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              {lead.telefono && (
                <a
                  href={`tel:${lead.telefono}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <Phone size={16} className="text-secondary" />
                  <span className="text-sm text-secondary">Llamar</span>
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Mail size={16} className="text-primary" />
                  <span className="text-sm text-primary">Enviar email</span>
                </a>
              )}
              {lead.web && (
                <a
                  href={lead.web.startsWith('http') ? lead.web : `https://${lead.web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                >
                  <Globe size={16} className="text-muted" />
                  <span className="text-sm text-muted">Ver web</span>
                </a>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">Detalles</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">ID</span>
                <span className="font-mono text-white">#{lead.autoId}</span>
              </div>
              {lead.agencias && (
                <div className="flex justify-between">
                  <span className="text-muted">Agencias</span>
                  <span className="text-white">{lead.agencias}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HistorialCard({ leadId }: { leadId: string }) {
  const { data: entries, isLoading } = useLeadHistorial(leadId);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Historial de contacto</h3>
        {entries && entries.length > 0 && entries[0].fechaEnvioIso && (
          <span className="text-xs text-muted">
            Último contacto: {formatDate(entries[0].fechaEnvioIso)}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size={20} />
        </div>
      ) : !entries || entries.length === 0 ? (
        <p className="text-sm text-muted">Sin envíos registrados.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <HistorialItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}

function HistorialItem({ entry }: { entry: HistorialEntry }) {
  const [expanded, setExpanded] = useState(false);
  const meta = [entry.tipo, entry.angulo, entry.objetivo].filter(Boolean).join(' · ');

  return (
    <div className="rounded-xl bg-surface-700 border border-border px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{entry.asuntoEmail || 'Sin asunto'}</p>
          <p className="text-xs text-muted mt-0.5">
            {entry.nombreCopy}
            {meta ? ` — ${meta}` : ''}
          </p>
        </div>
        <span className="text-xs text-muted shrink-0">
          {entry.fechaEnvioIso ? formatDate(entry.fechaEnvioIso) : entry.fechaEnvio || '—'}
        </span>
      </div>
      {entry.cuerpoEmail && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            {expanded ? 'Ocultar email' : 'Ver email'}
          </button>
          {expanded && (
            <p className="text-xs text-muted whitespace-pre-wrap mt-2 border-t border-border pt-2">
              {entry.cuerpoEmail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InfoField({
  label, value, href, external, icon
}: {
  label: string;
  value?: string;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      {href && value ? (
        <a
          href={href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') ? href : `https://${href}`}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors"
        >
          {icon}
          <span className="truncate">{value}</span>
          {external && <ExternalLink size={11} />}
        </a>
      ) : (
        <p className="text-sm text-white flex items-center gap-1.5">
          {icon && <span className="text-muted">{icon}</span>}
          {value || <span className="text-muted">—</span>}
        </p>
      )}
    </div>
  );
}
