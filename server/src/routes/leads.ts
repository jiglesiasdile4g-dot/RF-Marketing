import { Router } from 'express';
import { exportAgenciasFromBase, getAgenciasBase, getLeads, getLead, updateLead } from '../services/airtable.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, fuente, provincia, search } = req.query;
    const leads = await getLeads({
      status: status as string | undefined,
      fuente: fuente as string | undefined,
      provincia: provincia as string | undefined,
      search: search as string | undefined,
    });
    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Error al obtener leads' });
  }
});

router.get('/agencias-base', async (req, res) => {
  try {
    const { search } = req.query;
    const agenciasBase = await getAgenciasBase(search as string | undefined);
    res.json(agenciasBase);
  } catch (err) {
    console.error('Error fetching agencias base:', err);
    res.status(500).json({ error: 'Error al obtener Agencias Base' });
  }
});

router.post('/export-agencias', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const sanitizedIds = ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0);

    if (sanitizedIds.length === 0) {
      res.status(400).json({ error: 'Debes seleccionar al menos una fila para exportar' });
      return;
    }

    const result = await exportAgenciasFromBase(sanitizedIds);
    res.json({
      requested: sanitizedIds.length,
      created: result.created,
      failed: result.failed,
    });
  } catch (err) {
    console.error('Error exporting agencias:', err);
    res.status(500).json({ error: 'Error al exportar agencias' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lead = await getLead(req.params.id);
    if (!lead) {
      res.status(404).json({ error: 'Lead no encontrado' });
      return;
    }
    res.json(lead);
  } catch (err) {
    console.error('Error fetching lead:', err);
    res.status(500).json({ error: 'Error al obtener lead' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const lead = await updateLead(req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Error al actualizar lead' });
  }
});

export default router;
