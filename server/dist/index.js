import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import statsRoutes from './routes/stats.js';
import usersRoutes from './routes/users.js';
import copysRoutes from './routes/copys.js';
const app = express();
const PORT = 3006; // Hardcoded for now, should be read from .env
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' },
}));
// Public routes
app.use('/api/auth', authRoutes);
// Protected routes
app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/copys', authMiddleware, copysRoutes);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`RF Marketing API running on http://localhost:${PORT}`);
});
