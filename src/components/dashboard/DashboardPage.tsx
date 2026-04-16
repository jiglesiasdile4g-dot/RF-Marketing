import { useLeads } from '../../api/leads';
import { useKpis, useFunnel, useBySource, useByProvince } from '../../api/stats';
import { useLeadSync } from '../../hooks/useLeadSync';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { STATUS_COLORS } from '../../lib/constants';
import { TrendingUp, Users, Target, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const SOURCE_COLORS: Record<string, string> = {
  'Idealista': '#dcfc03',
  'Google Maps': '#3b82f6',
  'Pisos.com': '#10b981',
  'Presencial': '#7c3aed',
  'Otro': '#6b7280',
};

export function DashboardPage() {
  const { data: leads } = useLeads();
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: funnel } = useFunnel();
  const { data: bySource } = useBySource();
  const { data: byProvince } = useByProvince();
  const navigate = useNavigate();

  useLeadSync(leads);

  const delta = kpis
    ? kpis.leadsThisWeek - kpis.leadsLastWeek
    : 0;

  const recentLeads = leads
    ? [...leads]
        .filter((l) => l.validado)
        .sort((a, b) => new Date(b.validado!).getTime() - new Date(a.validado!).getTime())
        .slice(0, 8)
    : [];

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={kpis?.totalLeads ?? 0}
          icon={<Users size={20} className="text-primary" />}
          glow="primary"
        />
        <KpiCard
          title="Esta semana"
          value={kpis?.leadsThisWeek ?? 0}
          icon={<TrendingUp size={20} className="text-secondary" />}
          delta={delta}
          glow="secondary"
        />
        <KpiCard
          title="Tasa conversión"
          value={`${kpis?.conversionRate ?? 0}%`}
          icon={<Target size={20} className="text-accent" />}
        />
        <KpiCard
          title="Pipeline activo"
          value={kpis?.activePipeline ?? 0}
          icon={<Activity size={20} className="text-muted" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">Pipeline de leads</h2>
          {funnel && funnel.length > 0 ? (
            <div className="space-y-2">
              {funnel
                .filter(f => f.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const max = Math.max(...funnel.map(f => f.count), 1);
                  const pct = (item.count / max) * 100;
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className="w-40 text-xs text-muted text-right shrink-0">{item.status}</div>
                      <div className="flex-1 bg-surface-600 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center px-2 transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: item.color + 'cc' }}
                        >
                          <span className="text-xs font-semibold text-white">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </Card>

        {/* By source donut */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Por fuente</h2>
          {bySource && bySource.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={bySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {bySource.map((entry) => (
                      <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#151515', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {bySource.map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.source] || '#6b7280' }} />
                      <span className="text-muted">{s.source}</span>
                    </div>
                    <span className="text-white font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By province */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Por provincia</h2>
          {byProvince && byProvince.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byProvince.slice(0, 8)} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="province" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ background: '#151515', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </Card>

        {/* Recent activity */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Leads recientes</h2>
          <div className="space-y-2">
            {recentLeads.length === 0 ? (
              <p className="text-muted text-sm">Sin actividad reciente</p>
            ) : (
              recentLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-600 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-muted">
                        {lead.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{lead.nombre}</p>
                      <p className="text-xs text-muted">{lead.provincia}</p>
                    </div>
                  </div>
                  <Badge color={STATUS_COLORS[lead.estado]}>{lead.estado}</Badge>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  delta,
  glow,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: number;
  glow?: 'primary' | 'secondary';
}) {
  return (
    <Card glow={glow} className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${delta >= 0 ? 'text-secondary' : 'text-alert'}`}>
            {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta)} vs semana anterior
          </div>
        )}
      </div>
      <div className="p-2.5 rounded-xl bg-white/5">{icon}</div>
    </Card>
  );
}
