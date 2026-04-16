import { useKpis, useFunnel, useBySource, useByProvince } from '../../api/stats';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { STATUS_COLORS } from '../../lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const SOURCE_COLORS: Record<string, string> = {
  'Idealista': '#dcfc03',
  'Google Maps': '#3b82f6',
  'Pisos.com': '#10b981',
  'Presencial': '#7c3aed',
  'Otro': '#6b7280',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#151515',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  labelStyle: { color: '#fff' },
  itemStyle: { color: 'rgba(255,255,255,0.7)' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

export function StatsPage() {
  const { data: kpis, isLoading } = useKpis();
  const { data: funnel } = useFunnel();
  const { data: bySource } = useBySource();
  const { data: byProvince } = useByProvince();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  const funnelFiltered = funnel?.filter((f) => f.count > 0) ?? [];

  // Build conversion funnel data with percentages
  const totalLeads = kpis?.totalLeads ?? 0;
  const conversionData = funnelFiltered.map((f) => ({
    ...f,
    pct: totalLeads > 0 ? Math.round((f.count / totalLeads) * 100) : 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis && Object.entries(kpis.byStatus).map(([status, count]) => (
          <div
            key={status}
            className="glass-card p-4"
            style={{ borderColor: `${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}30` }}
          >
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-xs text-muted mt-1">{status}</p>
            <div className="mt-2 h-1 rounded-full bg-surface-600">
              <div
                className="h-full rounded-full"
                style={{
                  width: totalLeads > 0 ? `${(count / totalLeads) * 100}%` : '0%',
                  backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-5">Funnel de conversión</h2>
          {conversionData.length > 0 ? (
            <div className="space-y-3">
              {conversionData.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted">{item.status}</span>
                    <span className="text-xs font-medium text-white">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-5 bg-surface-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos suficientes</p>
          )}
        </Card>

        {/* Source breakdown */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-5">Leads por fuente</h2>
          {bySource && bySource.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bySource}>
                  <XAxis dataKey="source" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {bySource.map((entry) => (
                      <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </Card>

        {/* Province */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-5">Leads por provincia (top 10)</h2>
          {byProvince && byProvince.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byProvince.slice(0, 10)} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="province"
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </Card>

        {/* KPI summary */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-5">Resumen general</h2>
          <div className="space-y-4">
            <StatRow label="Total de leads" value={kpis?.totalLeads ?? 0} />
            <StatRow label="Pipeline activo" value={kpis?.activePipeline ?? 0} />
            <StatRow label="Clientes cerrados" value={kpis?.byStatus?.['Cliente cerrado'] ?? 0} accent="#dcfc03" />
            <StatRow label="No interesados" value={kpis?.byStatus?.['No interesado'] ?? 0} accent="#ef4444" />
            <StatRow label="Tasa de conversión" value={`${kpis?.conversionRate ?? 0}%`} accent="#10b981" />
            <StatRow label="Leads esta semana" value={kpis?.leadsThisWeek ?? 0} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold" style={{ color: accent || '#fff' }}>{value}</span>
    </div>
  );
}
