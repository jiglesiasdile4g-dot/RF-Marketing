import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'fallback-secret';
export function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}
export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
