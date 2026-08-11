import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
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
const CLIENT_INDEX_HTML = path.join(CLIENT_DIST_DIR, 'index.html');

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

// Health check (siempre accesible, incluso sin auth)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    clientDist: CLIENT_DIST_DIR,
    clientIndexExists: fs.existsSync(CLIENT_INDEX_HTML),
  });
});

const clientDistExists = fs.existsSync(CLIENT_DIST_DIR) && fs.existsSync(CLIENT_INDEX_HTML);
if (clientDistExists) {
  console.log(`[static] Serving frontend from ${CLIENT_DIST_DIR} (NODE_ENV=${NODE_ENV})`);
  app.use(express.static(CLIENT_DIST_DIR, { index: false, maxAge: '1y' }));

  // Fallback SPA: cualquier ruta que no sea /api* sirve index.html
  app.get(/^\/(?!api).*/i, (_req, res) => {
    res.sendFile(CLIENT_INDEX_HTML);
  });
} else {
  console.warn(
    `[static] Frontend build NOT found at ${CLIENT_DIST_DIR}. ` +
      `API-only mode (NODE_ENV=${NODE_ENV}). Use "npm run build" in the project root.`
  );
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RF Marketing API running on http://0.0.0.0:${PORT} (${NODE_ENV})`);
});
