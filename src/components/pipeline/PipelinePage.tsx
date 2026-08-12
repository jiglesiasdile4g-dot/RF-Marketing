import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useLeads, useUpdateLead } from '../../api/leads';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useLeadSync } from '../../hooks/useLeadSync';
import { Rating } from '../ui/Rating';
import { Spinner } from '../ui/Spinner';
import {
  PIPELINE_STATUSES,
  ROLE_STAGES,
  getLeadStatusColor,
  getLeadStatusLabel,
  resolveLeadStatus,
} from '../../lib/constants';
import type { Lead, LeadStatus } from '../../types';

export function PipelinePage() {
  const { data: leads, isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const { role, canTransitionTo } = useRoleGuard();
  const navigate = useNavigate();

  useLeadSync(leads);

  const visibleStatuses = role === 'admin' ? PIPELINE_STATUSES : ROLE_STAGES[role];

  // Agrupamos por estado CANÓNICO (tras normalizar typos/espacios/mayúsculas de Sheets).
  // Así ningún lead se pierde aunque su estado venga escrito de forma irregular.
  const grouped = (leads ?? []).reduce<Record<string, Lead[]>>((acc, lead) => {
    const s = resolveLeadStatus(lead.estado) ?? String(lead.estado || 'Sin iniciar');
    if (!acc[s]) acc[s] = [];
    acc[s].push(lead);
    return acc;
  }, {});

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    const leadId = result.draggableId;
    if (!canTransitionTo(newStatus)) return;
    updateLead.mutate({ id: leadId, updates: { estado: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
          {visibleStatuses.map((status) => {
            const cards = grouped[status] ?? [];
            const color = getLeadStatusColor(status);
            const label = getLeadStatusLabel(status);
            const canDrop = canTransitionTo(status);

            return (
              <div key={status} className="flex-shrink-0 w-[260px] flex flex-col">
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2"
                  style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-semibold text-white">{label}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {cards.length}
                  </span>
                </div>

                {/* Droppable column */}
                <Droppable droppableId={status} isDropDisabled={!canDrop}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-xl p-2 space-y-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-white/5 border border-dashed border-white/20' : 'bg-transparent'
                      }`}
                    >
                      {cards.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              className={`glass-card p-3 cursor-pointer transition-all ${
                                dragSnapshot.isDragging ? 'shadow-2xl shadow-black/50 rotate-1 scale-105' : 'hover:border-white/15'
                              }`}
                            >
                              <p className="text-sm font-medium text-white mb-1 leading-tight">
                                {lead.nombre || '—'}
                              </p>
                              {lead.provincia && (
                                <p className="text-xs text-muted mb-2">{lead.provincia}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                                  style={{
                                    backgroundColor:
                                      lead.fuente === 'Idealista'
                                        ? `${getLeadStatusColor('Cliente cerrado')}15`
                                        : `${getLeadStatusColor('Sin iniciar')}15`,
                                    color: 'rgba(255,255,255,0.5)',
                                  }}
                                >
                                  {lead.fuente || 'Otro'}
                                </span>
                                <Rating value={lead.prioridad} size={12} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {cards.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-20 flex items-center justify-center text-muted/30 text-xs border border-dashed border-white/5 rounded-xl">
                          Vacío
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
