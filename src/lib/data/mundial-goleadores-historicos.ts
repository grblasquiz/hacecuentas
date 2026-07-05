// ────────────────────────────────────────────────────────────────────────────
// Máximos goleadores históricos de la Copa del Mundo (goles en Mundiales hasta
// Qatar 2022 INCLUSIVE). Fuente: FIFA / RSSSF. Verificado 2026-07-04.
//
// Los jugadores que siguen activos en 2026 llevan `matchName` (su nombre en el
// feed de openfootball): allTimeScorers() les SUMA en vivo sus goles del Mundial
// 2026, así el ranking histórico se reescribe solo a medida que juegan (Messi y
// Mbappé ya pasaron el récord de Klose). Los demás son totales finales de
// jugadores retirados (no suman).
// ────────────────────────────────────────────────────────────────────────────
import type { RawMatch } from './mundial-2026';
import { topScorers } from '../mundial-live';

export interface HistoricScorer {
  name: string;
  country: string;
  flag: string;
  pre2026: number;    // goles en Mundiales hasta 2022 inclusive
  matchName?: string; // nombre en el fixture openfootball si sigue activo en 2026
}

// Ordená de mayor a menor por pre2026; allTimeScorers re-ordena por total en vivo.
export const WC_HISTORIC_SCORERS: HistoricScorer[] = [
  { name: 'Miroslav Klose',    country: 'Alemania',   flag: '🇩🇪', pre2026: 16 },
  { name: 'Ronaldo Nazário',   country: 'Brasil',     flag: '🇧🇷', pre2026: 15 },
  { name: 'Gerd Müller',       country: 'Alemania',   flag: '🇩🇪', pre2026: 14 },
  { name: 'Just Fontaine',     country: 'Francia',    flag: '🇫🇷', pre2026: 13 },
  { name: 'Lionel Messi',      country: 'Argentina',  flag: '🇦🇷', pre2026: 13, matchName: 'Lionel Messi' },
  { name: 'Pelé',              country: 'Brasil',     flag: '🇧🇷', pre2026: 12 },
  { name: 'Kylian Mbappé',     country: 'Francia',    flag: '🇫🇷', pre2026: 12, matchName: 'Kylian Mbappé' },
  { name: 'Sándor Kocsis',     country: 'Hungría',    flag: '🇭🇺', pre2026: 11 },
  { name: 'Jürgen Klinsmann',  country: 'Alemania',   flag: '🇩🇪', pre2026: 11 },
  { name: 'Gabriel Batistuta', country: 'Argentina',  flag: '🇦🇷', pre2026: 10 },
  { name: 'Gary Lineker',      country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pre2026: 10 },
  { name: 'Teófilo Cubillas',  country: 'Perú',       flag: '🇵🇪', pre2026: 10 },
  { name: 'Thomas Müller',     country: 'Alemania',   flag: '🇩🇪', pre2026: 10 },
  { name: 'Grzegorz Lato',     country: 'Polonia',    flag: '🇵🇱', pre2026: 10 },
  { name: 'Harry Kane',        country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pre2026: 8, matchName: 'Harry Kane' },
  { name: 'Cristiano Ronaldo', country: 'Portugal',   flag: '🇵🇹', pre2026: 8, matchName: 'Cristiano Ronaldo' },
  { name: 'Neymar',            country: 'Brasil',     flag: '🇧🇷', pre2026: 8, matchName: 'Neymar' },
  { name: 'Luis Suárez',       country: 'Uruguay',    flag: '🇺🇾', pre2026: 7, matchName: 'Luis Suárez' },
];

export interface AllTimeRow {
  name: string; country: string; flag: string;
  total: number; pre2026: number; en2026: number; active: boolean;
}

const norm = (s: string): string =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** Ranking histórico all-time = goles hasta 2022 + goles del Mundial 2026 en vivo. */
export function allTimeScorers(matches: RawMatch[], limit = 12): AllTimeRow[] {
  const now = topScorers(matches, 999);
  const by = new Map<string, number>();
  for (const s of now) by.set(norm(s.name), s.goles);
  const rows: AllTimeRow[] = WC_HISTORIC_SCORERS.map((h) => {
    const en2026 = h.matchName ? (by.get(norm(h.matchName)) || 0) : 0;
    return {
      name: h.name, country: h.country, flag: h.flag,
      pre2026: h.pre2026, en2026, total: h.pre2026 + en2026, active: !!h.matchName,
    };
  });
  rows.sort((a, b) => b.total - a.total || b.en2026 - a.en2026 || a.name.localeCompare(b.name));
  return rows.slice(0, limit);
}
