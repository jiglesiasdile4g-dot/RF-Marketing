import type { Lead, UserRole } from '../types/index.js';
export declare function getLeads(filters?: {
    status?: string;
    fuente?: string;
    provincia?: string;
    search?: string;
}): Promise<Lead[]>;
export declare function getLead(recordId: string): Promise<Lead | null>;
export declare function getAgenciasBase(search?: string): Promise<Lead[]>;
export declare function exportAgenciasFromBase(sourceRecordIds: string[]): Promise<{
    created: number;
    failed: Array<{
        id: string;
        error: string;
    }>;
}>;
export declare function updateLead(recordId: string, updates: Record<string, unknown>): Promise<Lead>;
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
export declare function updateUser(recordId: string, updates: Record<string, unknown>): Promise<void>;
export declare function deleteUser(recordId: string): Promise<void>;
export declare function clearCache(): void;
export {};
