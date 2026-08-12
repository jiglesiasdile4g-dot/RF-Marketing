import type { LeadStatus } from '../types/index.js';

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

/**
 * Normaliza un string crudo de Sheets a un LeadStatus canónico (case-insensitive,
 * normaliza tildes, espacios, números adjuntos como "contactado1 → Contactado 1").
 * Si no reconoce el valor, devuelve null.
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
    .replace(/([a-zñ])\s*(\d)\b/gi, '$1 $2');
  if (STATUS_NORMALIZATION_MAP[base]) return STATUS_NORMALIZATION_MAP[base];

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

/** Normaliza un estado para usarlo como clave de mapa (siempre devuelve string). */
export function normalizeLeadStatusKey(raw: string | null | undefined): string {
  return resolveLeadStatus(raw) ?? (raw ? String(raw) : '');
}

/** Compara dos estados tras normalizarlos. Ignora mayúsculas, tildes y espacios. */
export function sameLeadStatus(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeLeadStatusKey(a) === normalizeLeadStatusKey(b);
}

export const TERMINAL_STATUSES: LeadStatus[] = ['Cliente cerrado', 'No interesado'];

export function isTerminalLeadStatus(raw: string | null | undefined): boolean {
  const known = resolveLeadStatus(raw);
  return known ? TERMINAL_STATUSES.includes(known) : false;
}
