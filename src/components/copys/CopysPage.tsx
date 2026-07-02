import { useState } from 'react';
import { useCopys } from '../../api/copys';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import type { Copy } from '../../types';

export function CopysPage() {
  const { data: copys, isLoading } = useCopys();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white">Copys</h2>
        <p className="text-sm text-muted mt-1">
          Plantillas de email usadas por el envío automático semanal.
        </p>
      </div>

      {!copys || copys.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p>No hay copys en la hoja.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {copys.map((copy) => (
            <CopyCard key={copy.id} copy={copy} />
          ))}
        </div>
      )}
    </div>
  );
}

function CopyCard({ copy }: { copy: Copy }) {
  const [expanded, setExpanded] = useState(false);
  const meta = [copy.tipo, copy.angulo, copy.objetivo].filter(Boolean).join(' · ');

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">{copy.nombre}</h3>
            <Badge color={copy.activo ? '#10b981' : '#6b7280'}>
              {copy.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          {meta && <p className="text-xs text-muted mt-1">{meta}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted">Conversion rate</p>
          <p className="text-sm font-semibold text-white">
            {copy.conversionRate != null ? `${copy.conversionRate}%` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted mb-1">Asunto</p>
        <p className="text-sm text-white">{copy.asuntoEmail || '—'}</p>
      </div>

      {copy.cuerpoEmail && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            {expanded ? 'Ocultar cuerpo' : 'Ver cuerpo'}
          </button>
          {expanded && (
            <p className="text-sm text-muted whitespace-pre-wrap mt-2 border-t border-border pt-3">
              {copy.cuerpoEmail}
            </p>
          )}
        </div>
      )}

      {copy.notas && (
        <p className="text-xs text-muted mt-3 border-t border-border pt-3">{copy.notas}</p>
      )}
    </Card>
  );
}
