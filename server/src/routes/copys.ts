import { Router } from 'express';
import { getCopys } from '../services/sheets.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const copys = await getCopys();
    res.json(copys);
  } catch (err) {
    console.error('Error fetching copys:', err);
    res.status(500).json({ error: 'Error al obtener copys' });
  }
});

export default router;
