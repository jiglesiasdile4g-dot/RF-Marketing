import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload, UserRole } from '../types/index.js';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare function authMiddleware(_req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
