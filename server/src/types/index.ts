export type LeadStatus =
  | 'Sin iniciar'
  | 'Contactado'
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

export interface LeadFields {
  'Nombre agencia'?: string;
  'Provincia'?: string;
  'Zona'?: string;
  'Fuente'?: LeadSource;
  'Tipo alquiler'?: RentalType[];
  'Nº anuncios activos'?: string;
  'Nivel volumen'?: string;
  'Email'?: string;
  'Teléfono'?: string;
  'Web'?: string;
  'Perfil Idealista'?: string;
  'Validado'?: string;
  'Prioridad'?: number;
  'Notas'?: string;
  'Estado'?: LeadStatus;
  'Agencias'?: string;
  'ID'?: number;
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
}

export interface UserFields {
  'Email': string;
  'PasswordHash': string;
  'Nombre': string;
  'Role': UserRole;
}

export interface JwtPayload {
  userId: string;
  email: string;
  nombre: string;
  role: UserRole;
}
