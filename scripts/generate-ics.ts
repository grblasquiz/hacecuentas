/**
 * generate-ics — calendarios .ics suscribibles (plan de tráfico directo 7-08).
 *
 * Cada evento en el calendario del usuario lleva link al sitio con
 * utm_source=calendar → visitas recurrentes sin depender de Google.
 *
 * Genera en public/calendarios/:
 *   feriados-argentina-2026.ics       (+ copia legacy en public/feriados-argentina-2026.ics,
 *                                      ya linkeada desde el calc feriados-argentina-2026)
 *   feriados-{mexico,colombia,chile,peru,ecuador}-2026.ics
 *   vencimientos-arca-2026.ics        (monotributo, recategorización, aguinaldo)
 *   mundial-2026-argentina.ics        (partidos de la Selección + final)
 *   mundial-2026.ics                  (todos los partidos con equipos definidos)
 *
 * Correr: npm run ics  (node --experimental-strip-types scripts/generate-ics.ts)
 * Los datos cambian poco (feriados/vencimientos son anuales; el fixture se
 * regenera si se corre tras fetch-mundial-fixture) → se corre a mano y se
 * commitean los .ics como el resto de public/.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FERIADOS_AR_2026 } from '../src/lib/data/feriados-ar-2026.ts';
import { FERIADOS_LATAM_2026 } from '../src/lib/data/feriados-latam-2026.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'calendarios');
const SITE = 'https://hacecuentas.com';
const UTM = 'utm_source=calendar&utm_medium=ics';
// DTSTAMP fijo: regenerar sin cambios de datos no debe mover los archivos.
const DTSTAMP = '20260708T000000Z';

// ── Helpers ICS ───────────────────────────────────────────────────────────────

/** Escapa texto según RFC 5545 (coma, punto y coma, backslash, saltos). */
function esc(s: string): string {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Plegado a ≤74 octetos por línea (continuación = CRLF + espacio), sin cortar chars UTF-8. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, 'utf8');
    if (bytes + b > 73) { out.push(cur); cur = ' ' + ch; bytes = 1 + b; }
    else { cur += ch; bytes += b; }
  }
  out.push(cur);
  return out.join('\r\n');
}

interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  url?: string;
  /** Evento de día completo: 'YYYY-MM-DD' */
  date?: string;
  /** Evento con horario: Date en UTC + duración en horas */
  startUTC?: Date;
  hours?: number;
}

function fmtUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function nextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function vevent(e: IcsEvent): string {
  const lines = ['BEGIN:VEVENT', `UID:${e.uid}@hacecuentas.com`, `DTSTAMP:${DTSTAMP}`];
  if (e.date) {
    lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(e.date).replace(/-/g, '')}`);
  } else if (e.startUTC) {
    lines.push(`DTSTART:${fmtUTC(e.startUTC)}`);
    lines.push(`DURATION:PT${Math.round((e.hours ?? 2) * 60)}M`);
  }
  lines.push(`SUMMARY:${esc(e.summary)}`);
  if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
  if (e.url) lines.push(`URL:${e.url}`);
  lines.push('END:VEVENT');
  return lines.map(fold).join('\r\n');
}

function vcalendar(name: string, events: IcsEvent[], tz = 'America/Argentina/Buenos_Aires'): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hacé Cuentas//Calendarios 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${esc(name)}`),
    `X-WR-TIMEZONE:${tz}`,
    'X-PUBLISHED-TTL:P1D',
    ...events.map(vevent),
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

// ── Feriados Argentina ────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  inamovible: 'Feriado inamovible',
  trasladable: 'Feriado trasladable',
  'no-laborable': 'Día no laborable',
  puente: 'Feriado puente turístico',
};

const arUrl = `${SITE}/feriados-argentina-2026?${UTM}`;
const arEvents: IcsEvent[] = FERIADOS_AR_2026.map((f) => ({
  uid: `feriado-ar-${f.fecha}-${f.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
  date: f.fecha,
  summary: `🇦🇷 ${f.nombre}`,
  description: `${TIPO_LABEL[f.tipo] || 'Feriado'}${f.trasladadoDe ? ` (trasladado del ${f.trasladadoDe})` : ''}.\nCalendario completo y cuántos días faltan: ${arUrl}`,
  url: arUrl,
}));

// ── Feriados LATAM ────────────────────────────────────────────────────────────

const LATAM_FLAGS: Record<string, string> = { MX: '🇲🇽', CO: '🇨🇴', CL: '🇨🇱', PE: '🇵🇪', EC: '🇪🇨' };
const latamCalendars: Array<{ file: string; name: string; events: IcsEvent[]; slug: string }> = [];
for (const [aud, pais] of Object.entries(FERIADOS_LATAM_2026)) {
  const flag = LATAM_FLAGS[aud] || '';
  const url = `${SITE}/${pais.slug}?${UTM}`;
  latamCalendars.push({
    file: `${pais.slug}.ics`,
    name: `Feriados ${pais.pais} 2026`,
    slug: pais.slug,
    events: pais.feriados.map((f: { fecha: string; nombre: string; tipo: string; nota?: string }) => ({
      uid: `feriado-${aud.toLowerCase()}-${f.fecha}-${f.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
      date: f.fecha,
      summary: `${flag} ${f.nombre}`,
      description: `${f.tipo}${f.nota ? ` — ${f.nota}` : ''}.\nCalendario completo: ${url}`,
      url,
    })),
  });
}

// ── Vencimientos ARCA 2026 ────────────────────────────────────────────────────
// Fechas de src/pages/vencimientos-afip-2026.astro (cuota monotributo, día ~20
// con corrimiento por inhábiles) + recategorización (monotributo-2026.ts: la de
// julio cierra el 5/8/2026) + aguinaldo (Ley 27.073: 30/6 y 18/12).

const CUOTAS_MONOTRIBUTO = [
  '2026-01-20', '2026-02-20', '2026-03-20', '2026-04-21', '2026-05-20', '2026-06-22',
  '2026-07-20', '2026-08-20', '2026-09-22', '2026-10-20', '2026-11-20', '2026-12-22',
];
const monoUrl = `${SITE}/vencimientos-afip-2026?${UTM}`;
const vencEvents: IcsEvent[] = [
  ...CUOTAS_MONOTRIBUTO.map((fecha) => ({
    uid: `venc-monotributo-cuota-${fecha}`,
    date: fecha,
    summary: '💸 Vence la cuota del monotributo',
    description: `Cuota mensual del monotributo (ARCA). Calculá tu categoría y cuánto pagás: ${SITE}/calculadora-monotributo?${UTM}`,
    url: monoUrl,
  })),
  {
    uid: 'venc-recategorizacion-2026-01',
    date: '2026-01-20',
    summary: '📋 Recategorización monotributo (1er semestre)',
    description: `Último día para recategorizarte según tu facturación del semestre. ¿Te conviene cambiar de categoría?: ${SITE}/calculadora-monotributo?${UTM}`,
    url: monoUrl,
  },
  {
    uid: 'venc-recategorizacion-2026-08',
    date: '2026-08-05',
    summary: '📋 Recategorización monotributo (2do semestre) — último día',
    description: `Cierra la recategorización de julio 2026. Revisá tu facturación de los últimos 12 meses y fijate si cambiás de categoría: ${SITE}/calculadora-monotributo?${UTM}`,
    url: monoUrl,
  },
  {
    uid: 'venc-aguinaldo-2026-06',
    date: '2026-06-30',
    summary: '💰 Aguinaldo: vence el pago de la 1ª cuota (SAC)',
    description: `Calculá cuánto te corresponde de aguinaldo: ${SITE}/calculadora-aguinaldo?${UTM}`,
    url: `${SITE}/calculadora-aguinaldo?${UTM}`,
  },
  {
    uid: 'venc-aguinaldo-2026-12',
    date: '2026-12-18',
    summary: '💰 Aguinaldo: vence el pago de la 2ª cuota (SAC)',
    description: `Calculá cuánto te corresponde de aguinaldo de diciembre: ${SITE}/calculadora-aguinaldo?${UTM}`,
    url: `${SITE}/calculadora-aguinaldo?${UTM}`,
  },
];

// ── Mundial 2026 ──────────────────────────────────────────────────────────────

interface Match {
  round?: string; date?: string | null; time?: string | null;
  team1?: string | null; team2?: string | null;
}
const fixtureRaw = JSON.parse(readFileSync(join(ROOT, 'src/lib/data/mundial-2026-fixture.json'), 'utf8'));
const matches: Match[] = fixtureRaw.matches || [];

// Nombres en español + bandera: TEAMS de mundial-2026.ts (no se puede importar
// ese módulo bajo strip-types porque importa JSON sin `with { type: 'json' }`,
// así que se parsea liviano del fuente; fallback = nombre openfootball).
const TEAMS_ES: Record<string, { es: string; flag: string }> = {};
{
  const src = readFileSync(join(ROOT, 'src/lib/data/mundial-2026.ts'), 'utf8');
  // Claves con y sin comillas: `Mexico: {...}` y `'South Africa': {...}`
  const re = /(?:'([^']+)'|(\w+)):\s*\{\s*es:\s*'([^']+)',\s*flag:\s*'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) TEAMS_ES[m[1] || m[2]] = { es: m[3], flag: m[4] };
}
const teamEs = (name: string) => TEAMS_ES[name]?.es || name;
const teamFlag = (name: string) => TEAMS_ES[name]?.flag || '';

/** Kickoff a Date UTC — misma lógica que src/lib/data/mundial-2026.ts. */
function kickoffUTC(date?: string | null, time?: string | null): Date | null {
  if (!date) return null;
  const t = String(time || '00:00').match(/^(\d{1,2}):(\d{2})(?:\s*UTC([+-]\d{1,2}))?/);
  if (!t) return null;
  const off = t[3] !== undefined && t[3] !== null ? Number(t[3]) : -6;
  const sign = off >= 0 ? '+' : '-';
  const d = new Date(`${date}T${t[1].padStart(2, '0')}:${t[2]}:00${sign}${String(Math.abs(off)).padStart(2, '0')}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fxUrl = `${SITE}/fixture-mundial-2026?${UTM}`;
function matchEvent(m: Match, prefix: string): IcsEvent | null {
  if (!m.team1 || !m.team2) return null;
  const ko = kickoffUTC(m.date, m.time);
  if (!ko) return null;
  const flags = `${teamFlag(m.team1)}${teamFlag(m.team2) ? ' vs ' + teamFlag(m.team2) : ''}`.trim();
  return {
    uid: `${prefix}-${m.date}-${m.team1}-${m.team2}`.toLowerCase().replace(/[^a-z0-9@.-]+/g, '-'),
    startUTC: ko,
    hours: 2,
    summary: `⚽ ${teamEs(m.team1)} vs ${teamEs(m.team2)}${m.round ? ` — ${m.round}` : ''}`,
    description: `Mundial 2026${flags ? ` · ${flags}` : ''}. Fixture completo, resultados en vivo y hora local: ${fxUrl}`,
    url: fxUrl,
  };
}

const mundialAR = matches
  .filter((m) => m.team1 === 'Argentina' || m.team2 === 'Argentina' || /^final$/i.test(String(m.round || '')))
  .map((m) => matchEvent(m, 'mundial-ar'))
  .filter((e): e is IcsEvent => !!e);
const mundialAll = matches
  .map((m) => matchEvent(m, 'mundial'))
  .filter((e): e is IcsEvent => !!e);

// ── Escritura ─────────────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true });
const written: string[] = [];
function write(file: string, content: string) {
  writeFileSync(join(OUT, file), content);
  written.push(`calendarios/${file} (${content.split('BEGIN:VEVENT').length - 1} eventos)`);
}

const arIcs = vcalendar('Feriados Argentina 2026 — Hacé Cuentas', arEvents);
write('feriados-argentina-2026.ics', arIcs);
// Copia legacy: el calc feriados-argentina-2026 ya linkea a /feriados-argentina-2026.ics
writeFileSync(join(ROOT, 'public', 'feriados-argentina-2026.ics'), arIcs);

for (const cal of latamCalendars) write(cal.file, vcalendar(`${cal.name} — Hacé Cuentas`, cal.events));
write('vencimientos-arca-2026.ics', vcalendar('Vencimientos ARCA/AFIP 2026 — Hacé Cuentas', vencEvents));
write('mundial-2026-argentina.ics', vcalendar('Argentina en el Mundial 2026 — Hacé Cuentas', mundialAR));
write('mundial-2026.ics', vcalendar('Mundial 2026: todos los partidos — Hacé Cuentas', mundialAll));

console.log(`[generate-ics] OK:\n  ${written.join('\n  ')}\n  + legacy public/feriados-argentina-2026.ics`);
