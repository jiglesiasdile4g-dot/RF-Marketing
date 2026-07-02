import { Router } from 'express';
import { getLeads } from '../services/sheets.js';
import type { LeadStatus } from '../types/index.js';

const router = Router();

const PIPELINE_ORDER: LeadStatus[] = [
  'Sin iniciar',
  'Contactado',
  'Contactado 1',
  'Contactado 2',
  'Responde',
  'No responde',
  'Llamada breve agendada',
  'Reunión agendada',
  'Demo realizada',
  'Cliente cerrado',
  'No interesado',
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  'Sin iniciar': '#6b7280',
  'Contactado': '#3b82f6',
  'Contactado 1': '#2563eb',
  'Contactado 2': '#1d4ed8',
  'Responde': '#06b6d4',
  'No responde': '#f97316',
  'Llamada breve agendada': '#7c3aed',
  'Reunión agendada': '#6366f1',
  'Demo realizada': '#10b981',
  'Cliente cerrado': '#dcfc03',
  'No interesado': '#ef4444',
};

router.get('/kpis', async (_req, res) => {
  try {
    const leads = await getLeads();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const byStatus: Record<string, number> = {};
    let leadsThisWeek = 0;
    let leadsLastWeek = 0;
    const terminalStates: LeadStatus[] = ['Cliente cerrado', 'No interesado'];

    for (const lead of leads) {
      byStatus[lead.estado] = (byStatus[lead.estado] || 0) + 1;

      if (lead.validado) {
        const d = new Date(lead.validado);
        if (d >= weekAgo) leadsThisWeek++;
        else if (d >= twoWeeksAgo) leadsLastWeek++;
      }
    }

    const closed = byStatus['Cliente cerrado'] || 0;
    const total = leads.length;
    const activePipeline = leads.filter((l) => !terminalStates.includes(l.estado)).length;

    res.json({
      totalLeads: total,
      leadsThisWeek,
      leadsLastWeek,
      conversionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
      activePipeline,
      byStatus,
    });
  } catch (err) {
    console.error('Error computing KPIs:', err);
    res.status(500).json({ error: 'Error al calcular KPIs' });
  }
});

router.get('/funnel', async (_req, res) => {
  try {
    const leads = await getLeads();
    const byStatus: Record<string, number> = {};

    for (const lead of leads) {
      byStatus[lead.estado] = (byStatus[lead.estado] || 0) + 1;
    }

    const funnel = PIPELINE_ORDER.map((status) => ({
      status,
      count: byStatus[status] || 0,
      color: STATUS_COLORS[status],
    }));

    res.json(funnel);
  } catch (err) {
    console.error('Error computing funnel:', err);
    res.status(500).json({ error: 'Error al calcular funnel' });
  }
});

router.get('/by-source', async (_req, res) => {
  try {
    const leads = await getLeads();
    const bySource: Record<string, number> = {};

    for (const lead of leads) {
      const src = lead.fuente || 'Otro';
      bySource[src] = (bySource[src] || 0) + 1;
    }

    const result = Object.entries(bySource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (err) {
    console.error('Error computing by-source:', err);
    res.status(500).json({ error: 'Error al calcular por fuente' });
  }
});

router.get('/by-province', async (_req, res) => {
  try {
    const leads = await getLeads();
    const byProvince: Record<string, number> = {};

    for (const lead of leads) {
      const prov = lead.provincia || 'Sin provincia';
      byProvince[prov] = (byProvince[prov] || 0) + 1;
    }

    const result = Object.entries(byProvince)
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (err) {
    console.error('Error computing by-province:', err);
    res.status(500).json({ error: 'Error al calcular por provincia' });
  }
});

export default router;
