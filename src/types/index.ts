export type LeadStatus =
  | 'Sin iniciar'
  | 'Contactado'
  | 'Contactado 1'
  | 'Contactado 2'
  | 'Responde'
  | 'No responde'
  | 'Llamada breve agendada'
  | 'Reunión agendada'
  | 'Demo realizada'
  | 'Cliente cerrado'
  | 'No interesado';

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

export interface Lead {
  // id = valor de la columna `idag` de la hoja de Google Sheets
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

  // Derivados de la pestaña Historial (solo en detalle de lead)
  ultimoContacto?: string;
  actividades?: ActivityItem[];
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
}

export interface SavedFilter {
  id: string;
  nombre: string;
  filters: {
    [key: string]: string | number | string[];
  };
}

export interface AuthUser extends User {
  token: string;
  filtrosFavoritos?: SavedFilter[];
}

export interface Notification {
  id: string;
  leadId: string;
  leadName: string;
  oldStatus: LeadStatus;
  newStatus: LeadStatus;
  timestamp: number;
  read: boolean;
}

export interface KpiData {
  totalLeads: number;
  leadsThisWeek: number;
  leadsLastWeek: number;
  conversionRate: number;
  activePipeline: number;
  byStatus: Record<LeadStatus, number>;
}

export interface FunnelData {
  status: LeadStatus;
  count: number;
  color: string;
}

export interface OnboardingItem {
  id: string;
  label: string;
  completed: boolean;
  date?: string;
}

export interface OnboardingClient extends Lead {
  checklist: OnboardingItem[];
  startDate: string;
  progress: number;
}
