import type { LeadStatus, LeadSource, UserRole } from '../types';

export const LEAD_STATUSES: LeadStatus[] = [
  'Sin iniciar',
  'Contactado',
  'Contactado 1',
  'Contactado 2',
  'Responde',
  'No responde',
  'Llamada breve agendada',
  'Reunión agendada',
  'Demo realizada',
  'Cliente cerrado',
  'No interesado',
];

export const LEAD_SOURCES: LeadSource[] = [
  'Idealista',
  'Google Maps',
  'Pisos.com',
  'Presencial',
  'Otro',
];

export const RENTAL_TYPES = [
  'Alquiler Completo',
  'Habitaciones',
  'Temporal',
  'Vacacional',
] as const;

export const STATUS_COLORS: Record<LeadStatus, string> = {
  'Sin iniciar': '#6b7280',
  'Contactado': '#3b82f6',
  'Contactado 1': '#2563eb',
  'Contactado 2': '#1d4ed8',
  'Responde': '#06b6d4',
  'No responde': '#f97316',
  'Llamada breve agendada': '#7c3aed',
  'Reunión agendada': '#6366f1',
  'Demo realizada': '#10b981',
  'Cliente cerrado': '#dcfc03',
  'No interesado': '#ef4444',
};

export const STATUS_ORDER: Record<LeadStatus, number> = {
  'Sin iniciar': 0,
  'Contactado': 1,
  'Contactado 1': 2,
  'Contactado 2': 3,
  'Responde': 4,
  'No responde': 5,
  'Llamada breve agendada': 6,
  'Reunión agendada': 7,
  'Demo realizada': 8,
  'Cliente cerrado': 9,
  'No interesado': 10,
};

export const PIPELINE_STATUSES: LeadStatus[] = [
  'Sin iniciar',
  'Contactado',
  'Contactado 1',
  'Contactado 2',
  'Responde',
  'No responde',
  'Llamada breve agendada',
  'Reunión agendada',
  'Demo realizada',
  'Cliente cerrado',
  'No interesado',
];

// Stages each role can manage
export const ROLE_STAGES: Record<UserRole, LeadStatus[]> = {
  admin: LEAD_STATUSES,
  comercial: ['Sin iniciar', 'Contactado', 'Contactado 1', 'Contactado 2', 'Responde', 'No responde', 'Llamada breve agendada'],
  demo: ['Reunión agendada', 'Demo realizada', 'Cliente cerrado'],
  onboarding: ['Cliente cerrado'],
};

// Stages each role can transition leads INTO
export const ROLE_TRANSITIONS: Record<UserRole, LeadStatus[]> = {
  admin: LEAD_STATUSES,
  comercial: ['Sin iniciar', 'Contactado', 'Contactado 1', 'Contactado 2', 'Responde', 'No responde', 'Llamada breve agendada', 'No interesado'],
  demo: ['Reunión agendada', 'Demo realizada', 'Cliente cerrado', 'No interesado'],
  onboarding: ['Cliente cerrado'],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  comercial: 'Comercial',
  demo: 'Demo',
  onboarding: 'Onboarding',
};

export const ONBOARDING_CHECKLIST_TEMPLATE = [
  { id: 'kickoff', label: 'Reunión de kickoff' },
  { id: 'portal', label: 'Acceso al portal configurado' },
  { id: 'training1', label: 'Formación sesión 1' },
  { id: 'training2', label: 'Formación sesión 2' },
  { id: 'whatsapp', label: 'WhatsApp IA configurado' },
  { id: 'golive', label: 'Go-live completado' },
  { id: 'review30', label: 'Revisión 30 días' },
];
