import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
