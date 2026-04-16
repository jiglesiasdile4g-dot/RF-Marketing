import { Router } from 'express';
import { z } from 'zod';
import { getUserByEmail } from '../services/airtable.js';
import { comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    console.log(`🔐 Login attempt for: ${email}`);

    const user = await getUserByEmail(email);
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    console.log(`✓ User found: ${email}, checking password...`);
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      console.log(`❌ Invalid password for: ${email}`);
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    console.log(`✓ Login successful for: ${email}`);

    const token = signToken({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: err.errors });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
