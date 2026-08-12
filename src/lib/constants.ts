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

// ---------------------------------------------------------------------------
// Helpers para normalizar estados (Lead.estado` proveniente de Google Sheets.
// La hoja admite strings libres: typos, espacios, mayúsculas distintas, etc.
// Siempre devolvemos un valor seguro para no romper Badge/colores.
// ---------------------------------------------------------------------------

const STATUS_NORMALIZATION_MAP: Record<string, LeadStatus> = /*#__PURE__*/ (() => {
  const map: Record<string, LeadStatus> = {};
  for (const s of LEAD_STATUSES) {
    const key = s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    map[key] = s;
  }
  return map;
})();

const FALLBACK_COLOR = '#6b7280';

/**
 * Dado un string crudo de Sheets, intenta casarlo con un LeadStatus conocido.
 * Acepta diferencias de mayúsculas, tildes, espacios múltiples/sobrantes y
 * números romanos/arabigos (ej: "Contactado   1 " → "Contactado 1").
 * Si no reconoce el valor devuelve null.
 */
export function resolveLeadStatus(raw: string | null | undefined): LeadStatus | null {
  if (!raw) return null;
  const base = String(raw)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // "Contactado1" → "Contactado 1"
    .replace(/([a-zñ])\s*(\d)\b/gi, '$1 $2');
  if (STATUS_NORMALIZATION_MAP[base]) return STATUS_NORMALIZATION_MAP[base];

  // Segunda oportunidad: números romanos y variantes
  for (const s of LEAD_STATUSES) {
    const canon = s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (canon === base || canon.includes(base) || base.includes(canon)) {
      return s;
    }
  }

  return null;
}

/**
 * Devuelve el color hex para un estado. Acepta strings crudos (con typos/espacios)
 * y devuelve gris neutro si no reconoce el valor. Nunca undefined.
 */
export function getLeadStatusColor(estado: string | null | undefined): string {
  const known = resolveLeadStatus(estado);
  if (known) return STATUS_COLORS[known];
  return FALLBACK_COLOR;
}

/**
 * Devuelve la etiqueta "canónica" para mostrar en la UI.
 * Si el string de Sheets no se reconoce, devolvemos el valor canónico; si no,
 * el string crudo (para que nunca se pierda el texto).
 */
export function getLeadStatusLabel(estado: string | null | undefined): string {
  if (!estado) return '';
  const known = resolveLeadStatus(estado);
  return known ?? String(estado);
}

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
