// Superficie NFL 2026 en español (hub + calendario semana a semana + posiciones).
// Datos: src/data/live/nfl-2026.json, refrescado por scripts/fetch-nfl-data.mjs (cron).
// Regla: números y horarios salen SIEMPRE del JSON; acá sólo se ordena y formatea.
// La página inglesa hermana es src/pages/en/nfl-2026.astro (mismo snapshot).
import data from '../../data/live/nfl-2026.json';

export type NflGame = (typeof data)['games'][number];
export type NflTeam = (typeof data)['teams'][number];
export type NflStanding = (typeof data)['standings'][number];

export const nfl = data;

export const games: NflGame[] = [...(data.games ?? [])].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
);
export const regularGames = games.filter((g) => Number(g.seasonType) === 2);
export const preseasonGames = games.filter((g) => Number(g.seasonType) === 1);
export const internationalGames = regularGames.filter((g) => g.country !== 'USA');

// Zonas horarias LATAM (México primero: es el mercado #1 de la página).
export const MX_ZONE = 'America/Mexico_City';
export const CO_ZONE = 'America/Bogota';
export const AR_ZONE = 'America/Argentina/Buenos_Aires';
export const TZ_OPTIONS = [
  { tz: MX_ZONE, flag: '🇲🇽', name: 'México', label: 'Hora de México' },
  { tz: CO_ZONE, flag: '🇨🇴', name: 'Colombia', label: 'Hora de Colombia' },
  { tz: AR_ZONE, flag: '🇦🇷', name: 'Argentina', label: 'Hora de Argentina' },
  { tz: 'America/Lima', flag: '🇵🇪', name: 'Perú', label: 'Hora de Perú' },
  { tz: 'America/Santiago', flag: '🇨🇱', name: 'Chile', label: 'Hora de Chile' },
  { tz: 'America/Guayaquil', flag: '🇪🇨', name: 'Ecuador', label: 'Hora de Ecuador' },
  { tz: 'America/Caracas', flag: '🇻🇪', name: 'Venezuela', label: 'Hora de Venezuela' },
  { tz: 'America/Montevideo', flag: '🇺🇾', name: 'Uruguay', label: 'Hora de Uruguay' },
  { tz: 'America/New_York', flag: '🇺🇸', name: 'EE.UU. (Este)', label: 'Hora del Este (EE.UU.)' },
  { tz: 'America/Los_Angeles', flag: '🇺🇸', name: 'EE.UU. (Pacífico)', label: 'Hora del Pacífico (EE.UU.)' },
];

const clean = (value: string) => value.replace(/\./g, '').replace(/\s+/g, ' ').trim();

/** "18:20" en la zona pedida (24 h, formato neutro LATAM). */
export const fmtTime = (iso: string, tz: string = MX_ZONE) =>
  new Intl.DateTimeFormat('es-MX', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

/** "jue 10 sep" en la zona pedida. */
export const fmtDay = (iso: string, tz: string = MX_ZONE) =>
  clean(new Intl.DateTimeFormat('es-MX', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso)));

/** "jueves 10 de septiembre" en la zona pedida. */
export const fmtLongDay = (iso: string, tz: string = MX_ZONE) =>
  clean(new Intl.DateTimeFormat('es-MX', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso)).replace(',', ''));

/** Clave YYYY-MM-DD del día civil en la zona pedida (para comparar días). */
export const dateKey = (iso: string | Date, tz: string = MX_ZONE) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));

/** Hora local + marcador "+1" si el día civil cambia respecto de la zona base (México). */
export const fmtTimeShifted = (iso: string, tz: string, baseTz: string = MX_ZONE) => {
  const time = fmtTime(iso, tz);
  return dateKey(iso, tz) > dateKey(iso, baseTz) ? `${time} +1` : time;
};

export const gameTitle = (g: NflGame) => `${g.away.name} vs ${g.home.name}`;
export const gameFragment = (g: NflGame) =>
  `partido-${gameTitle(g).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${g.id}`;

/** Entradas de semanas de temporada regular según el calendario oficial del JSON. */
export const regularWeekEntries =
  (data.calendar ?? []).find((phase: any) => Number(phase.value) === 2)?.entries ?? [];

export const weekGames = (week: number) => regularGames.filter((g) => Number(g.week) === week);

export const standingsOf = (conference: 'AFC' | 'NFC', division: string): NflStanding[] =>
  (data.standings ?? [])
    .filter((t) => t.conference === conference && t.division === division)
    .sort((a, b) => Number(a.rank ?? 99) - Number(b.rank ?? 99) || String(a.team).localeCompare(String(b.team)));

export const DIVISIONS = ['East', 'North', 'South', 'West'] as const;
export const DIVISION_ES: Record<string, string> = { East: 'Este', North: 'Norte', South: 'Sur', West: 'Oeste' };
export const COUNTRY_ES: Record<string, string> = {
  USA: 'Estados Unidos', Mexico: 'México', Brazil: 'Brasil', England: 'Inglaterra',
  France: 'Francia', Germany: 'Alemania', Spain: 'España', Australia: 'Australia',
};
