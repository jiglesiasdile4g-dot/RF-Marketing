import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { getUsers, createUser, updateUser, deleteUser } from '../services/airtable.js';
import { hashPassword } from '../utils/password.js';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  nombre: z.string().min(1),
  role: z.enum(['admin', 'comercial', 'demo', 'onboarding']),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(4).optional(),
  nombre: z.string().min(1).optional(),
  role: z.enum(['admin', 'comercial', 'demo', 'onboarding']).optional(),
});

router.get('/', requireRole('admin'), async (_req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(data.password);
    const user = await createUser({
      email: data.email,
      passwordHash,
      nombre: data.nombre,
      role: data.role,
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: err.errors });
      return;
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.patch('/:id', requireRole('admin'), async (req, res) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const updates: Record<string, unknown> = {};

    if (data.email) updates.email = data.email;
    if (data.nombre) updates.nombre = data.nombre;
    if (data.role) updates.role = data.role;
    if (data.password) updates.passwordHash = await hashPassword(data.password);

    await updateUser(req.params.id, updates);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: err.errors });
      return;
    }
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
