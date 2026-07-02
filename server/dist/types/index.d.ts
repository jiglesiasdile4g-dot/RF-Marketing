export type LeadStatus = 'Sin iniciar' | 'Contactado' | 'Contactado 1' | 'Contactado 2' | 'Responde' | 'No responde' | 'Llamada breve agendada' | 'Reunión agendada' | 'Demo realizada' | 'Cliente cerrado' | 'No interesado';
export type LeadSource = 'Idealista' | 'Google Maps' | 'Pisos.com' | 'Presencial' | 'Otro';
export type RentalType = 'Alquiler Completo' | 'Habitaciones' | 'Temporal' | 'Vacacional';
export type UserRole = 'admin' | 'comercial' | 'demo' | 'onboarding';
export interface ActivityItem {
    id: string;
    tipo: 'llamada' | 'email' | 'reunión' | 'demo' | 'seguimiento' | 'otro';
    fecha: string;
    resultado: string;
    notas: string;
    realizadoPor?: string;
}
export interface Lead {
    id: string;
    autoId: number;
    nombre: string;
    provincia: string;
    zona: string;
    fuente: LeadSource;
    tipoAlquiler: RentalType[];
    numAnuncios: string;
    nivelVolumen: string;
    email: string;
    telefono: string;
    web: string;
    perfilIdealista: string;
    validado: string | null;
    prioridad: number;
    notas: string;
    estado: LeadStatus;
    agencias: string;
    ultimoContacto?: string;
    actividades?: ActivityItem[];
}
export interface Copy {
    id: string;
    nombre: string;
    activo: boolean;
    asuntoEmail: string;
    cuerpoEmail: string;
    angulo: string;
    tipo: string;
    objetivo: string;
    conversionRate: number | null;
    notas: string;
}
export interface HistorialEntry {
    id: string;
    idag: string;
    nombreAgencia: string;
    email: string;
    nombreCopy: string;
    asuntoEmail: string;
    cuerpoEmail: string;
    tipo: string;
    angulo: string;
    objetivo: string;
    fechaEnvio: string;
    fechaEnvioIso: string | null;
}
export interface JwtPayload {
    userId: string;
    email: string;
    nombre: string;
    role: UserRole;
}
