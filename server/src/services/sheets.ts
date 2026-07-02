import { google } from 'googleapis';
import NodeCache from 'node-cache';
import { parse, isValid } from 'date-fns';
import type { ActivityItem, Copy, HistorialEntry, Lead, LeadSource, LeadStatus, RentalType, UserRole } from '../types/index.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;

const TAB_AGENCIAS = process.env.SHEETS_TAB_AGENCIAS ?? 'Agencias-Grid view';
const TAB_AGENCIAS_BASE = process.env.SHEETS_TAB_AGENCIAS_BASE ?? 'Agencias BASE-Grid view';
const TAB_COPYS = process.env.SHEETS_TAB_COPYS ?? 'Copys-Grid view';
const TAB_HISTORIAL = process.env.SHEETS_TAB_HISTORIAL ?? 'Historial';
const TAB_USUARIOS = process.env.SHEETS_TAB_USUARIOS ?? 'Usuarios';

const cache = new NodeCache({ stdTTL: 15, checkperiod: 20 });

// ===== Lector genérico =====

interface SheetRow {
  rowNumber: number; // fila real en la hoja (1-based, headers en fila 1)
  values: Record<string, string>;
}

interface TabData {
  headers: string[];
  rows: SheetRow[];
}

function sanitizeCell(v: unknown): string {
  const s = String(v ?? '').trim();
  return s === '#ERROR!' ? '' : s;
}

async function readTab(tab: string, useCache = true): Promise<TabData> {
  const cacheKey = `tab:${tab}`;
  if (useCache) {
    const cached = cache.get<TabData>(cacheKey);
    if (cached) return cached;
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A1:Z`,
  });

  const raw = res.data.values ?? [];
  const headers = (raw[0] ?? []).map((h) => String(h ?? '').trim());
  const rows: SheetRow[] = [];

  for (let i = 1; i < raw.length; i++) {
    const values: Record<string, string> = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      const cell = sanitizeCell(raw[i][c]);
      values[headers[c]] = cell;
      if (cell !== '') hasData = true;
    }
    if (hasData) rows.push({ rowNumber: i + 1, values });
  }

  const data: TabData = { headers, rows };
  cache.set(cacheKey, data);
  return data;
}

function colLetter(index: number): string {
  return String.fromCharCode(65 + index); // 0 → A (máx 26 columnas, suficiente)
}

// gid por título de pestaña (para deleteDimension)
const gidCache = new Map<string, number>();

async function getSheetGid(tab: string): Promise<number> {
  if (gidCache.has(tab)) return gidCache.get(tab)!;
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties',
  });
  for (const s of res.data.sheets ?? []) {
    const p = s.properties;
    if (p?.title && p.sheetId != null) gidCache.set(p.title, p.sheetId);
  }
  const gid = gidCache.get(tab);
  if (gid == null) throw new Error(`Pestaña no encontrada en la hoja: ${tab}`);
  return gid;
}

// ===== Fechas =====

// La hoja usa formato español día/mes: "12/6/2026 6:08pm" = 12 de junio
const DATE_PATTERNS = ['d/M/yyyy h:mma', 'd/M/yyyy H:mm', 'd/M/yyyy'];

function parseSheetDate(s: string): string | null {
  if (!s) return null;
  const normalized = s.replace(/\s+(am|pm)$/i, '$1');
  for (const pattern of DATE_PATTERNS) {
    const d = parse(normalized, pattern, new Date());
    if (isValid(d)) return d.toISOString();
  }
  return null;
}

// ===== Escrituras =====

async function updateRowCells(
  tab: string,
  rowNumber: number,
  headers: string[],
  cellUpdates: Record<string, string | number>
): Promise<void> {
  const data = Object.entries(cellUpdates)
    .map(([column, value]) => {
      const idx = headers.indexOf(column);
      if (idx === -1) return null;
      return {
        range: `'${tab}'!${colLetter(idx)}${rowNumber}`,
        values: [[value]],
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  if (data.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
}

async function appendRow(tab: string, headers: string[], rowValues: Record<string, string | number>): Promise<void> {
  const row = headers.map((h) => (h in rowValues ? rowValues[h] : ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

async function deleteRows(tab: string, rowNumbers: number[]): Promise<void> {
  if (rowNumbers.length === 0) return;
  const gid = await getSheetGid(tab);
  const sorted = [...rowNumbers].sort((a, b) => b - a); // descendente: índices previos siguen válidos
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: sorted.map((rowNumber) => ({
        deleteDimension: {
          range: {
            sheetId: gid,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      })),
    },
  });
}

// ===== Mapeo de leads =====

// camelCase → columna de la hoja (mismos nombres que usaba Airtable)
const FIELD_TO_COLUMN: Record<string, string> = {
  nombre: 'Nombre agencia',
  provincia: 'Provincia',
  zona: 'Zona',
  fuente: 'Fuente',
  tipoAlquiler: 'Tipo alquiler',
  numAnuncios: 'Nº anuncios activos',
  nivelVolumen: 'Nivel volumen',
  email: 'Email',
  telefono: 'Teléfono',
  web: 'Web',
  perfilIdealista: 'Perfil Idealista',
  prioridad: 'Prioridad',
  notas: 'Notas',
  estado: 'Estado',
  // 'Validado' se lee pero nunca se escribe (lo gestiona n8n/manual)
};

function mapRowToLead(row: SheetRow, idColumn: string): Lead {
  const v = row.values;
  const id = v[idColumn] ?? '';
  return {
    id,
    autoId: Number(id) || 0,
    nombre: v['Nombre agencia'] ?? '',
    provincia: v['Provincia'] ?? '',
    zona: v['Zona'] ?? '',
    fuente: (v['Fuente'] || 'Otro') as LeadSource,
    tipoAlquiler: (v['Tipo alquiler'] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as RentalType[],
    numAnuncios: v['Nº anuncios activos'] ?? '',
    nivelVolumen: v['Nivel volumen'] ?? '',
    email: v['Email'] ?? '',
    telefono: v['Teléfono'] ?? '',
    web: v['Web'] ?? '',
    perfilIdealista: v['Perfil Idealista'] ?? '',
    validado: parseSheetDate(v['Validado'] ?? ''),
    prioridad: parseInt(v['Prioridad'] ?? '', 10) || 0,
    notas: v['Notas'] ?? '',
    estado: (v['Estado'] || 'Sin iniciar') as LeadStatus,
    agencias: v['Agencias'] ?? '',
  };
}

function camelToCellUpdates(updates: Record<string, unknown>): Record<string, string | number> {
  const mapped: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(updates)) {
    const column = FIELD_TO_COLUMN[key];
    if (!column) continue;
    if (key === 'tipoAlquiler' && Array.isArray(value)) {
      mapped[column] = value.join(', ');
    } else if (key === 'prioridad') {
      const n = Number(value);
      mapped[column] = Number.isFinite(n) ? n : '';
    } else {
      mapped[column] = String(value ?? '');
    }
  }
  return mapped;
}

// ===== Leads =====

export async function getLeads(filters?: {
  status?: string;
  fuente?: string;
  provincia?: string;
  search?: string;
}): Promise<Lead[]> {
  const { rows } = await readTab(TAB_AGENCIAS);
  let leads = rows.map((r) => mapRowToLead(r, 'idag'));

  if (filters?.status) {
    leads = leads.filter((l) => l.estado === filters.status);
  }
  if (filters?.fuente) {
    leads = leads.filter((l) => l.fuente === filters.fuente);
  }
  if (filters?.provincia) {
    const p = filters.provincia.toLowerCase();
    leads = leads.filter((l) => l.provincia.toLowerCase().includes(p));
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.nombre.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.provincia.toLowerCase().includes(s)
    );
  }

  return leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;

  // Derivar actividad desde Historial
  const entries = await getHistorial(id);
  lead.actividades = entries.map(
    (h): ActivityItem => ({
      id: h.id,
      tipo: 'email',
      fecha: h.fechaEnvioIso ?? h.fechaEnvio,
      resultado: h.asuntoEmail,
      notas: `Copy: ${h.nombreCopy}${h.objetivo ? ` — ${h.objetivo}` : ''}`,
      realizadoPor: 'n8n',
    })
  );
  lead.ultimoContacto = entries[0]?.fechaEnvioIso ?? undefined;

  return lead;
}

export async function getAgenciasBase(search?: string): Promise<Lead[]> {
  const { rows } = await readTab(TAB_AGENCIAS_BASE);
  let agencias = rows.map((r) => mapRowToLead(r, 'ID'));

  if (search) {
    const s = search.toLowerCase();
    agencias = agencias.filter(
      (l) =>
        l.nombre.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.provincia.toLowerCase().includes(s)
    );
  }

  return agencias;
}

export async function exportAgenciasFromBase(
  sourceIds: string[]
): Promise<{ created: number; failed: Array<{ id: string; error: string }> }> {
  const failed: Array<{ id: string; error: string }> = [];
  let created = 0;

  const base = await readTab(TAB_AGENCIAS_BASE, false);
  const agencias = await readTab(TAB_AGENCIAS, false);

  let nextIdag =
    agencias.rows.reduce((max, r) => Math.max(max, Number(r.values['idag']) || 0), 0) + 1;

  const exportedRowNumbers: number[] = [];

  for (const sourceId of sourceIds) {
    try {
      const sourceRow = base.rows.find((r) => (r.values['ID'] ?? '') === sourceId);
      if (!sourceRow) {
        throw new Error(`No existe la fila con ID ${sourceId} en Agencias BASE`);
      }

      const lead = mapRowToLead(sourceRow, 'ID');
      const rowValues: Record<string, string | number> = {
        idag: String(nextIdag),
        'Nombre agencia': lead.nombre,
        'Provincia': lead.provincia,
        'Zona': lead.zona,
        'Estado': lead.estado || 'Sin iniciar',
        'Fuente': lead.fuente,
        'Tipo alquiler': lead.tipoAlquiler.join(', '),
        'Nº anuncios activos': lead.numAnuncios,
        'Nivel volumen': lead.nivelVolumen,
        'Email': lead.email,
        'Teléfono': lead.telefono,
        'Web': lead.web,
        'Perfil Idealista': lead.perfilIdealista,
        'Validado': sourceRow.values['Validado'] ?? '',
        'Notas': lead.notas,
        // La columna 'Agencias' de BASE no existe en la pestaña Agencias
      };
      if (lead.prioridad >= 1 && lead.prioridad <= 3) {
        rowValues['Prioridad'] = lead.prioridad;
      }

      await appendRow(TAB_AGENCIAS, agencias.headers, rowValues);
      exportedRowNumbers.push(sourceRow.rowNumber);
      nextIdag += 1;
      created += 1;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error exportando ${sourceId}:`, errorMsg);
      failed.push({ id: sourceId, error: errorMsg });
    }
  }

  // Borrar de BASE solo las filas exportadas con éxito, en una sola llamada
  try {
    await deleteRows(TAB_AGENCIAS_BASE, exportedRowNumbers);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error borrando filas exportadas de Agencias BASE:', errorMsg);
    failed.push({ id: '(borrado en BASE)', error: errorMsg });
  }

  cache.flushAll();
  return { created, failed };
}

export async function updateLead(id: string, updates: Record<string, unknown>): Promise<Lead> {
  const { headers, rows } = await readTab(TAB_AGENCIAS, false);
  const row = rows.find((r) => (r.values['idag'] ?? '') === id);
  if (!row) {
    throw new Error(`Lead no encontrado en la hoja (idag=${id})`);
  }

  const cellUpdates = camelToCellUpdates(updates);
  await updateRowCells(TAB_AGENCIAS, row.rowNumber, headers, cellUpdates);
  cache.flushAll();

  // Merge local para devolver el lead actualizado sin otra lectura
  for (const [column, value] of Object.entries(cellUpdates)) {
    row.values[column] = String(value);
  }
  return mapRowToLead(row, 'idag');
}

// ===== Historial y Copys =====

export async function getHistorial(idag?: string): Promise<HistorialEntry[]> {
  const { rows } = await readTab(TAB_HISTORIAL);

  let entries = rows.map((r): HistorialEntry => {
    const v = r.values;
    const fechaEnvio = v['Fecha envio'] ?? '';
    return {
      id: v['ID'] || String(r.rowNumber),
      idag: v['idag'] ?? '',
      nombreAgencia: v['Nombre agencia'] ?? '',
      email: v['Email'] ?? '',
      nombreCopy: v['Nombre copy'] ?? '',
      asuntoEmail: v['Asunto email'] ?? '',
      cuerpoEmail: v['Cuerpo email'] ?? '',
      tipo: v['Tipo'] ?? '',
      angulo: v['Ángulo'] ?? '',
      objetivo: v['Objetivo'] ?? '',
      fechaEnvio,
      fechaEnvioIso: parseSheetDate(fechaEnvio),
    };
  });

  if (idag) {
    entries = entries.filter((e) => e.idag === idag);
  }

  // Más reciente primero; entradas sin fecha al final
  entries.sort((a, b) => {
    if (!a.fechaEnvioIso) return 1;
    if (!b.fechaEnvioIso) return -1;
    return b.fechaEnvioIso.localeCompare(a.fechaEnvioIso);
  });

  return entries;
}

export async function getCopys(): Promise<Copy[]> {
  const { rows } = await readTab(TAB_COPYS);

  return rows.map((r): Copy => {
    const v = r.values;
    const rate = parseFloat((v['Conversion rate'] ?? '').replace('%', '').replace(',', '.'));
    return {
      id: v['Nombre copy'] || String(r.rowNumber),
      nombre: v['Nombre copy'] ?? '',
      activo: (v['Activo'] ?? '').toLowerCase() === 'checked',
      asuntoEmail: v['Asunto email'] ?? '',
      cuerpoEmail: v['Cuerpo email'] ?? '',
      angulo: v['Ángulo'] ?? '',
      tipo: v['Tipo'] ?? '',
      objetivo: v['Objetivo'] ?? '',
      conversionRate: Number.isFinite(rate) ? rate : null,
      notas: v['Notas'] ?? '',
    };
  });
}

// ===== Usuarios (pestaña Usuarios, auto-creada) =====

const USUARIOS_HEADERS = ['ID', 'Email', 'PasswordHash', 'Nombre', 'Role'];

let usuariosReady: Promise<void> | null = null;

function ensureUsuariosTab(): Promise<void> {
  if (!usuariosReady) {
    usuariosReady = (async () => {
      const res = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        fields: 'sheets.properties',
      });
      const exists = (res.data.sheets ?? []).some((s) => s.properties?.title === TAB_USUARIOS);
      if (!exists) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{ addSheet: { properties: { title: TAB_USUARIOS } } }],
          },
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TAB_USUARIOS}'!A1:E1`,
          valueInputOption: 'RAW',
          requestBody: { values: [USUARIOS_HEADERS] },
        });
        console.log(`Pestaña "${TAB_USUARIOS}" creada en la hoja`);
      }
    })().catch((err) => {
      usuariosReady = null; // permitir reintento si falló
      throw err;
    });
  }
  return usuariosReady;
}

interface UserRecord {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  passwordHash: string;
}

function mapRowToUser(row: SheetRow): UserRecord {
  const v = row.values;
  return {
    id: v['ID'] || String(row.rowNumber),
    email: v['Email'] ?? '',
    nombre: v['Nombre'] ?? '',
    role: (v['Role'] || 'comercial') as UserRole,
    passwordHash: v['PasswordHash'] ?? '',
  };
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    await ensureUsuariosTab();
    const { rows } = await readTab(TAB_USUARIOS, false);
    const target = email.trim().toLowerCase();
    const row = rows.find((r) => (r.values['Email'] ?? '').trim().toLowerCase() === target);
    return row ? mapRowToUser(row) : null;
  } catch (err) {
    console.error('Error obteniendo usuario por email:', err);
    return null;
  }
}

export async function getUsers(): Promise<Array<{ id: string; email: string; nombre: string; role: UserRole }>> {
  await ensureUsuariosTab();
  const { rows } = await readTab(TAB_USUARIOS, false);
  return rows.map((r) => {
    const u = mapRowToUser(r);
    return { id: u.id, email: u.email, nombre: u.nombre, role: u.role };
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  nombre: string;
  role: UserRole;
}): Promise<{ id: string; email: string; nombre: string; role: UserRole }> {
  await ensureUsuariosTab();
  const { headers, rows } = await readTab(TAB_USUARIOS, false);

  const nextId =
    rows.reduce((max, r) => Math.max(max, Number(r.values['ID']) || 0), 0) + 1;

  await appendRow(TAB_USUARIOS, headers.length > 0 ? headers : USUARIOS_HEADERS, {
    ID: String(nextId),
    Email: data.email,
    PasswordHash: data.passwordHash,
    Nombre: data.nombre,
    Role: data.role,
  });

  return {
    id: String(nextId),
    email: data.email,
    nombre: data.nombre,
    role: data.role,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await ensureUsuariosTab();
  const { rows } = await readTab(TAB_USUARIOS, false);
  const row = rows.find((r) => (r.values['ID'] ?? '') === id);
  if (!row) {
    throw new Error(`Usuario no encontrado (ID=${id})`);
  }
  await deleteRows(TAB_USUARIOS, [row.rowNumber]);
}

export async function updateUser(id: string, updates: Record<string, unknown>): Promise<void> {
  await ensureUsuariosTab();

  const fieldMap: Record<string, string> = {
    email: 'Email',
    nombre: 'Nombre',
    role: 'Role',
    passwordHash: 'PasswordHash',
  };

  const cellUpdates: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(updates)) {
    const column = fieldMap[key];
    if (column) cellUpdates[column] = String(value ?? '');
  }

  const { headers, rows } = await readTab(TAB_USUARIOS, false);
  const row = rows.find((r) => (r.values['ID'] ?? '') === id);
  if (!row) {
    throw new Error(`Usuario no encontrado (ID=${id})`);
  }
  await updateRowCells(TAB_USUARIOS, row.rowNumber, headers, cellUpdates);
}

export function clearCache(): void {
  cache.flushAll();
}
