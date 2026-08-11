import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import statsRoutes from './routes/stats.js';
import usersRoutes from './routes/users.js';
import copysRoutes from './routes/copys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3006;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_DIST_DIR = path.resolve(__dirname, '..', '..', 'dist');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 240,
    message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' },
  })
);

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/copys', authMiddleware, copysRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV });
});

if (NODE_ENV === 'production') {
  app.use(express.static(CLIENT_DIST_DIR, { index: false, maxAge: '1y' }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RF Marketing API running on http://0.0.0.0:${PORT} (${NODE_ENV})`);
});
