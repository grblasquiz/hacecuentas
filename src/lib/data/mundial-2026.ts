// ────────────────────────────────────────────────────────────────────────────
// src/lib/data/mundial-2026.ts
// Fuente única para el fixture del Mundial 2026 (USA/Canadá/México).
// El JSON lo genera scripts/fetch-mundial-fixture.mjs desde openfootball
// (dominio público). Acá van el mapa de selecciones (ES + bandera), la
// conversión a hora argentina y los helpers de resultados/etiquetas.
// ────────────────────────────────────────────────────────────────────────────
import fixtureRaw from './mundial-2026-fixture.json';
import { eventTicketOffer } from '../offer-schema';

export interface RawMatch {
  num: number;
  round: string;
  group: string | null;
  date: string | null;
  time: string | null;
  team1: string | null;
  team2: string | null;
  score: { ft?: [number, number]; ht?: [number, number]; et?: [number, number]; p?: [number, number] } | null;
  goals1: Array<{ name: string; minute?: number; penalty?: boolean; owngoal?: boolean }>;
  goals2: Array<{ name: string; minute?: number; penalty?: boolean; owngoal?: boolean }>;
  ground: string | null;
}

export interface FixtureData {
  name: string;
  source: string;
  fetchedAt: string;
  played: number;
  total: number;
  matches: RawMatch[];
}

export const fixture = fixtureRaw as FixtureData;

// URL pública del JSON vivo (para el refresh client-side). raw.githubusercontent
// envía Access-Control-Allow-Origin: * → el fetch cross-origin funciona.
export const LIVE_FIXTURE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// ── Selecciones: nombre openfootball → { es, bandera } ───────────────────────
export const TEAMS: Record<string, { es: string; flag: string }> = {
  Mexico: { es: 'México', flag: '🇲🇽' },
  'South Africa': { es: 'Sudáfrica', flag: '🇿🇦' },
  'South Korea': { es: 'Corea del Sur', flag: '🇰🇷' },
  'Czech Republic': { es: 'Rep. Checa', flag: '🇨🇿' },
  Canada: { es: 'Canadá', flag: '🇨🇦' },
  'Bosnia & Herzegovina': { es: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  Qatar: { es: 'Catar', flag: '🇶🇦' },
  Switzerland: { es: 'Suiza', flag: '🇨🇭' },
  Brazil: { es: 'Brasil', flag: '🇧🇷' },
  Morocco: { es: 'Marruecos', flag: '🇲🇦' },
  Haiti: { es: 'Haití', flag: '🇭🇹' },
  Scotland: { es: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  USA: { es: 'Estados Unidos', flag: '🇺🇸' },
  Paraguay: { es: 'Paraguay', flag: '🇵🇾' },
  Australia: { es: 'Australia', flag: '🇦🇺' },
  Turkey: { es: 'Turquía', flag: '🇹🇷' },
  Germany: { es: 'Alemania', flag: '🇩🇪' },
  'Curaçao': { es: 'Curazao', flag: '🇨🇼' },
  'Ivory Coast': { es: 'Costa de Marfil', flag: '🇨🇮' },
  Ecuador: { es: 'Ecuador', flag: '🇪🇨' },
  Netherlands: { es: 'Países Bajos', flag: '🇳🇱' },
  Japan: { es: 'Japón', flag: '🇯🇵' },
  Sweden: { es: 'Suecia', flag: '🇸🇪' },
  Tunisia: { es: 'Túnez', flag: '🇹🇳' },
  Belgium: { es: 'Bélgica', flag: '🇧🇪' },
  Egypt: { es: 'Egipto', flag: '🇪🇬' },
  Iran: { es: 'Irán', flag: '🇮🇷' },
  'New Zealand': { es: 'Nueva Zelanda', flag: '🇳🇿' },
  Spain: { es: 'España', flag: '🇪🇸' },
  'Cape Verde': { es: 'Cabo Verde', flag: '🇨🇻' },
  'Saudi Arabia': { es: 'Arabia Saudita', flag: '🇸🇦' },
  Uruguay: { es: 'Uruguay', flag: '🇺🇾' },
  France: { es: 'Francia', flag: '🇫🇷' },
  Senegal: { es: 'Senegal', flag: '🇸🇳' },
  Iraq: { es: 'Irak', flag: '🇮🇶' },
  Norway: { es: 'Noruega', flag: '🇳🇴' },
  Argentina: { es: 'Argentina', flag: '🇦🇷' },
  Algeria: { es: 'Argelia', flag: '🇩🇿' },
  Austria: { es: 'Austria', flag: '🇦🇹' },
  Jordan: { es: 'Jordania', flag: '🇯🇴' },
  Portugal: { es: 'Portugal', flag: '🇵🇹' },
  'DR Congo': { es: 'RD Congo', flag: '🇨🇩' },
  Uzbekistan: { es: 'Uzbekistán', flag: '🇺🇿' },
  Colombia: { es: 'Colombia', flag: '🇨🇴' },
  England: { es: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  Croatia: { es: 'Croacia', flag: '🇭🇷' },
  Ghana: { es: 'Ghana', flag: '🇬🇭' },
  Panama: { es: 'Panamá', flag: '🇵🇦' },
};

// Resuelve nombre de equipo o placeholder (1A, 2B, 3A/B/C/D/F, W74, L102…).
export function teamLabel(name: string | null): { es: string; flag: string; tbd: boolean } {
  if (!name) return { es: 'A definir', flag: '⚽', tbd: true };
  const t = TEAMS[name];
  if (t) return { es: t.es, flag: t.flag, tbd: false };
  // Placeholders de posición de grupo: "1A" → 1.º Grupo A
  let m = name.match(/^([123])([A-L])$/);
  if (m) return { es: `${m[1]}.º Grupo ${m[2]}`, flag: '🏳️', tbd: true };
  // Mejores terceros: "3A/B/C/D/F" → 3.º (A/B/C/D/F)
  m = name.match(/^3([A-L/]+)$/);
  if (m) return { es: `3.º (${m[1]})`, flag: '🏳️', tbd: true };
  // Ganador/perdedor de partido: "W74" / "L102"
  m = name.match(/^W(\d+)$/);
  if (m) return { es: `Ganador M${m[1]}`, flag: '🏳️', tbd: true };
  m = name.match(/^L(\d+)$/);
  if (m) return { es: `Perdedor M${m[1]}`, flag: '🏳️', tbd: true };
  return { es: name, flag: '🏳️', tbd: true };
}

// Etiqueta de ronda en español.
export function roundLabel(round: string): string {
  const md = round.match(/^Matchday (\d+)$/);
  if (md) return `Fecha ${md[1]}`;
  const map: Record<string, string> = {
    'Round of 32': 'Dieciseisavos',
    'Round of 16': 'Octavos de final',
    'Quarter-final': 'Cuartos de final',
    'Quarter-finals': 'Cuartos de final',
    'Semi-final': 'Semifinales',
    'Semi-finals': 'Semifinales',
    'Match for third place': 'Tercer puesto',
    'Third-place match': 'Tercer puesto',
    Final: 'Final',
  };
  return map[round] || round;
}

// Fase macro para agrupar / badges.
export function phaseOf(round: string): 'grupos' | 'knockout' {
  return /^Matchday/.test(round) ? 'grupos' : 'knockout';
}

// ── Tiempo: "13:00 UTC-6" + fecha ISO → Date UTC y hora argentina ────────────
export function kickoffUTC(date: string | null, time: string | null): Date | null {
  if (!date) return null;
  const t = (time || '00:00').match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/);
  if (!t) {
    // sin offset reconocible: asumimos UTC-6 (mayoría de sedes) como fallback
    const hm = (time || '00:00').match(/^(\d{1,2}):(\d{2})/);
    const hh = hm ? Number(hm[1]) : 0;
    const mm = hm ? Number(hm[2]) : 0;
    return new Date(`${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00-06:00`);
  }
  const hh = Number(t[1]);
  const mm = Number(t[2]);
  const off = t[3] ? Number(t[3]) : -6;
  const sign = off >= 0 ? '+' : '-';
  const offStr = `${sign}${String(Math.abs(off)).padStart(2, '0')}:00`;
  return new Date(`${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00${offStr}`);
}

const ART_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
const ART_DAY_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const ART_DAYKEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Hora argentina "HH:MM" del kickoff.
export function artTime(date: string | null, time: string | null): string {
  const d = kickoffUTC(date, time);
  if (!d) return '';
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

// Clave de día en hora argentina (YYYY-MM-DD) — para agrupar el fixture por jornada.
export function artDayKey(date: string | null, time: string | null): string {
  const d = kickoffUTC(date, time);
  if (!d) return date || '';
  return ART_DAYKEY.format(d); // en-CA da YYYY-MM-DD
}

// Etiqueta linda del día: "jueves 11 de junio"
export function artDayLabel(date: string | null, time: string | null): string {
  const d = kickoffUTC(date, time);
  if (!d) return date || '';
  return ART_DAY_FMT.format(d);
}

// Resultado formateado. Devuelve null si no se jugó.
export function result(m: RawMatch): {
  a: number;
  b: number;
  detail: string;
  winner: 0 | 1 | 2;
} | null {
  if (!m.score || !m.score.ft) return null;
  const [a, b] = m.score.ft;
  let A = a;
  let B = b;
  let detail = '';
  if (m.score.et) {
    detail = `tras alargue ${m.score.et[0]}-${m.score.et[1]}`;
    A = m.score.et[0];
    B = m.score.et[1];
  }
  let winner: 0 | 1 | 2 = A > B ? 1 : B > A ? 2 : 0;
  if (m.score.p) {
    detail = `${detail ? detail + ', ' : ''}penales ${m.score.p[0]}-${m.score.p[1]}`;
    winner = m.score.p[0] > m.score.p[1] ? 1 : 2;
  }
  return { a, b, detail, winner };
}

// ── Schema.org: SportsEvent enriquecido para SEO ─────────────────────────────
// Search Console marcaba "Event" sin los campos recomendados (description, image,
// location.address, offers, performer). Definimos el evento una sola vez acá y lo
// consumen el hub (/mundial-2026) y el fixture (/fixture-mundial-2026) para no
// divergir. Los `performer` salen de la fixture real (selecciones efectivamente
// sorteadas), filtrando placeholders de eliminatorias contra TEAMS.
const WORLD_CUP_PERFORMERS = [
  ...new Set(
    fixture.matches
      .flatMap((m) => [m.team1, m.team2])
      .filter((t): t is string => !!t && t in TEAMS)
  ),
].map((name) => ({ '@type': 'SportsTeam', name: TEAMS[name].es }));

export const WORLD_CUP_EVENT = {
  '@type': 'SportsEvent',
  name: 'Copa Mundial de la FIFA 2026',
  description:
    'La Copa Mundial de la FIFA 2026 es la 23.ª edición del Mundial de fútbol masculino: la primera con 48 selecciones y 104 partidos, disputada en Estados Unidos, México y Canadá del 11 de junio al 19 de julio de 2026.',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  sport: 'Football',
  image: ['https://hacecuentas.com/og-default.png'],
  location: [
    { '@type': 'Place', name: 'Estados Unidos', address: { '@type': 'PostalAddress', addressCountry: 'US' } },
    { '@type': 'Place', name: 'México', address: { '@type': 'PostalAddress', addressCountry: 'MX' } },
    { '@type': 'Place', name: 'Canadá', address: { '@type': 'PostalAddress', addressCountry: 'CA' } },
  ],
  organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
  // Antes era un AggregateOffer con lowPrice: '60' pero sin highPrice ni validFrom,
  // así que Search Console marcaba ambos como "falta campo (en offers)". Sin un
  // highPrice verificable (no inventamos precios), pasamos a un Offer simple con
  // la venta oficial + validFrom: limpia las dos advertencias sin markup dudoso.
  offers: eventTicketOffer({ url: 'https://www.fifa.com/en/tickets', priceCurrency: 'USD' }),
  performer: WORLD_CUP_PERFORMERS,
};
