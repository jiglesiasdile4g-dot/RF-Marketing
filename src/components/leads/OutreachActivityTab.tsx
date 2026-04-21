import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { Lead, ActivityItem, OutreachResult } from '../../types';

interface OutreachActivityTabProps {
  lead: Lead;
  onUpdate: (updates: Record<string, unknown>) => void;
}

const ACTIVITY_TYPES = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'email', label: 'Email' },
  { value: 'reunión', label: 'Reunión' },
  { value: 'demo', label: 'Demo' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'otro', label: 'Otro' },
];

const OUTREACH_TYPES = [
  { value: 'llamada', label: 'Llamada', color: '#3b82f6' },
  { value: 'email', label: 'Email', color: '#06b6d4' },
  { value: 'mensaje', label: 'Mensaje', color: '#8b5cf6' },
  { value: 'presencial', label: 'Presencial', color: '#10b981' },
  { value: 'pendiente', label: 'Pendiente', color: '#6b7280' },
];

const OUTREACH_STATES = [
  { value: 'completado', label: 'Completado', color: '#10b981' },
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'fallido', label: 'Fallido', color: '#ef4444' },
  { value: 'pospuesto', label: 'Pospuesto', color: '#6b7280' },
];

export function OutreachActivityTab({ lead, onUpdate }: OutreachActivityTabProps) {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivityType, setNewActivityType] = useState('llamada');
  const [newActivityNotes, setNewActivityNotes] = useState('');
  const [newActivityResult, setNewActivityResult] = useState('');

  const handleAddActivity = () => {
    if (!newActivityNotes.trim()) return;

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      tipo: newActivityType as any,
      fecha: new Date().toISOString().split('T')[0],
      resultado: newActivityResult,
      notas: newActivityNotes,
      realizadoPor: 'Actual User',
    };

    const activities = lead.actividades || [];
    const updated = [newActivity, ...activities];

    onUpdate({
      actividades: updated,
      ultimoContacto: new Date().toISOString().split('T')[0],
    });

    setNewActivityType('llamada');
    setNewActivityNotes('');
    setNewActivityResult('');
    setShowAddActivity(false);
  };

  const handleRemoveActivity = (id: string) => {
    const activities = (lead.actividades || []).filter(a => a.id !== id);
    onUpdate({ actividades: activities });
  };

  const handleOutreachUpdate = (field: string, value: any) => {
    const current = lead.resultadoOutreach || {};
    onUpdate({
      resultadoOutreach: { ...current, [field]: value },
    });
  };

  return (
    <div className="space-y-8">
      {/* Outreach Actual */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Estado Actual de Outreach</h3>

        <div className="glass-card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Outreach */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-2">Tipo de Contacto</label>
              <select
                value={lead.resultadoOutreach?.tipo || 'pendiente'}
                onChange={(e) => handleOutreachUpdate('tipo', e.target.value)}
                className="w-full bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              >
                {OUTREACH_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-2">Estado</label>
              <select
                value={lead.resultadoOutreach?.estado || 'pendiente'}
                onChange={(e) => handleOutreachUpdate('estado', e.target.value)}
                className="w-full bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              >
                {OUTREACH_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Resultado */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted uppercase mb-2">Resultado/Observaciones</label>
              <textarea
                value={lead.resultadoOutreach?.resultado || ''}
                onChange={(e) => handleOutreachUpdate('resultado', e.target.value)}
                placeholder="Qué pasó en el último contacto..."
                className="w-full h-20 bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
          </div>

          {/* Badges de Estado */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {lead.resultadoOutreach && (
              <>
                <Badge color={OUTREACH_TYPES.find(t => t.value === lead.resultadoOutreach?.tipo)?.color || '#6b7280'}>
                  {OUTREACH_TYPES.find(t => t.value === lead.resultadoOutreach?.tipo)?.label}
                </Badge>
                <Badge color={OUTREACH_STATES.find(s => s.value === lead.resultadoOutreach?.estado)?.color || '#6b7280'}>
                  {OUTREACH_STATES.find(s => s.value === lead.resultadoOutreach?.estado)?.label}
                </Badge>
                {lead.resultadoOutreach.fecha && (
                  <Badge color="#06b6d4">
                    {new Date(lead.resultadoOutreach.fecha).toLocaleDateString('es-ES')}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Próximos Pasos */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-wide">Próximos Pasos</h3>

        <div className="glass-card p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Próximo Contacto Previsto</label>
            <input
              type="date"
              value={lead.proximoContactoPrevisto || ''}
              onChange={(e) => onUpdate({ proximoContactoPrevisto: e.target.value })}
              className="w-full bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {lead.proximoContactoPrevisto && (
            <div className="text-sm text-secondary font-medium pt-1">
              {new Date(lead.proximoContactoPrevisto).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          )}
        </div>
      </section>

      {/* Historial de Actividades */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-accent uppercase tracking-wide">Historial de Actividades</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddActivity(!showAddActivity)}
          >
            <Plus size={14} /> Agregar
          </Button>
        </div>

        {/* Formulario para Agregar Actividad */}
        {showAddActivity && (
          <div className="glass-card p-4 space-y-3 border-2 border-accent/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase mb-2">Tipo</label>
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                  className="w-full bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                >
                  {ACTIVITY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase mb-2">Resultado</label>
                <input
                  type="text"
                  value={newActivityResult}
                  onChange={(e) => setNewActivityResult(e.target.value)}
                  placeholder="Ej: Contactado exitosamente"
                  className="w-full bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <textarea
              value={newActivityNotes}
              onChange={(e) => setNewActivityNotes(e.target.value)}
              placeholder="Notas detalladas sobre esta actividad..."
              className="w-full h-16 bg-surface-700/60 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 resize-none"
            />

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddActivity}
                disabled={!newActivityNotes.trim()}
              >
                Guardar Actividad
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddActivity(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Actividades */}
        {lead.actividades && lead.actividades.length > 0 ? (
          <div className="space-y-2">
            {lead.actividades.map((activity) => (
              <div key={activity.id} className="glass-card-hover p-4 flex gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge color="#8b5cf6">
                      {ACTIVITY_TYPES.find(t => t.value === activity.tipo)?.label || activity.tipo}
                    </Badge>
                    {activity.resultado && (
                      <span className="text-xs font-medium text-secondary">{activity.resultado}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{activity.notas}</p>
                  <div className="text-xs text-muted-dim pt-1">
                    {new Date(activity.fecha).toLocaleDateString('es-ES')}
                    {activity.realizadoPor && <span> • {activity.realizadoPor}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveActivity(activity.id)}
                  className="text-muted hover:text-alert transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-muted">
            <p className="text-sm">Sin actividades registradas</p>
          </div>
        )}
      </section>

      {/* Último Contacto */}
      {lead.ultimoContacto && (
        <section className="glass-card p-4 bg-secondary/10 border border-secondary/30">
          <div className="text-sm text-secondary font-medium">
            Último contacto: {new Date(lead.ultimoContacto).toLocaleDateString('es-ES')}
          </div>
        </section>
      )}
    </div>
  );
}
