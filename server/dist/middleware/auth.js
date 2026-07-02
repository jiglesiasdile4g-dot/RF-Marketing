import { verifyToken } from '../utils/jwt.js';
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No autorizado — token requerido' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'No tienes permisos para esta acción' });
            return;
        }
        next();
    };
}
