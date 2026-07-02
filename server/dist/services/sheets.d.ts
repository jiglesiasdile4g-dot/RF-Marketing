import type { Copy, HistorialEntry, Lead, UserRole } from '../types/index.js';
export declare function getLeads(filters?: {
    status?: string;
    fuente?: string;
    provincia?: string;
    search?: string;
}): Promise<Lead[]>;
export declare function getLead(id: string): Promise<Lead | null>;
export declare function getAgenciasBase(search?: string): Promise<Lead[]>;
export declare function exportAgenciasFromBase(sourceIds: string[]): Promise<{
    created: number;
    failed: Array<{
        id: string;
        error: string;
    }>;
}>;
export declare function updateLead(id: string, updates: Record<string, unknown>): Promise<Lead>;
export declare function getHistorial(idag?: string): Promise<HistorialEntry[]>;
export declare function getCopys(): Promise<Copy[]>;
interface UserRecord {
    id: string;
    email: string;
    nombre: string;
    role: UserRole;
    passwordHash: string;
}
export declare function getUserByEmail(email: string): Promise<UserRecord | null>;
export declare function getUsers(): Promise<Array<{
    id: string;
    email: string;
    nombre: string;
    role: UserRole;
}>>;
export declare function createUser(data: {
    email: string;
    passwordHash: string;
    nombre: string;
    role: UserRole;
}): Promise<{
    id: string;
    email: string;
    nombre: string;
    role: UserRole;
}>;
export declare function deleteUser(id: string): Promise<void>;
export declare function updateUser(id: string, updates: Record<string, unknown>): Promise<void>;
export declare function clearCache(): void;
export {};
