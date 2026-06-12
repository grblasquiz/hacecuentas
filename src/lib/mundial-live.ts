// Cómputos en vivo del Mundial 2026 derivados del MISMO feed que el fixture
// (src/lib/data/mundial-2026.ts → openfootball). Posiciones, goleadores, próximo
// partido y bracket salen de fixture.matches; el refresh client-side recalcula
// con la data fresca (LIVE_FIXTURE_URL) sin redeploy.
import type { RawMatch } from './data/mundial-2026';
import { TEAMS } from './data/mundial-2026';

export interface StandingRow {
  team: string; es: string; flag: string;
  pj: number; g: number; e: number; p: number;
  gf: number; gc: number; dg: number; pts: number;
}

function esFlag(team: string | null): { es: string; flag: string } {
  if (!team) return { es: '—', flag: '🏳️' };
  const t = TEAMS[team];
  return { es: t?.es || team, flag: t?.flag || '⚽' };
}

/** Tabla de posiciones por grupo (solo partidos de grupos con resultado final). */
export function computeStandings(matches: RawMatch[]): { group: string; rows: StandingRow[] }[] {
  const groups = new Map<string, Map<string, StandingRow>>();
  const ensure = (group: string, team: string) => {
    if (!groups.has(group)) groups.set(group, new Map());
    const g = groups.get(group)!;
    if (!g.has(team)) {
      const { es, flag } = esFlag(team);
      g.set(team, { team, es, flag, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    }
    return g.get(team)!;
  };
  for (const m of matches) {
    if (!m.group || !m.team1 || !m.team2) continue;
    // Registrar equipos aunque no haya jugado (tabla aparece desde el sorteo)
    const a = ensure(m.group, m.team1);
    const b = ensure(m.group, m.team2);
    if (!m.score || !m.score.ft) continue;
    const [ga, gb] = m.score.ft;
    a.pj++; b.pj++; a.gf += ga; a.gc += gb; b.gf += gb; b.gc += ga;
    if (ga > gb) { a.g++; b.p++; a.pts += 3; }
    else if (ga < gb) { b.g++; a.p++; b.pts += 3; }
    else { a.e++; b.e++; a.pts++; b.pts++; }
  }
  const out: { group: string; rows: StandingRow[] }[] = [];
  for (const [group, teamMap] of [...groups.entries()].sort(([x], [y]) => x.localeCompare(y))) {
    const rows = [...teamMap.values()].map((r) => ({ ...r, dg: r.gf - r.gc }));
    rows.sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.es.localeCompare(y.es));
    out.push({ group, rows });
  }
  return out;
}

export interface ScorerRow { name: string; team: string; es: string; flag: string; goles: number; penales: number }

/** Tabla de goleadores (botín de oro). Excluye autogoles. */
export function topScorers(matches: RawMatch[], limit = 30): ScorerRow[] {
  const map = new Map<string, ScorerRow>();
  const add = (team: string | null, goals: RawMatch['goals1']) => {
    for (const g of goals || []) {
      if (g.owngoal) continue;
      const key = `${g.name}|${team}`;
      if (!map.has(key)) {
        const { es, flag } = esFlag(team);
        map.set(key, { name: g.name, team: team || '—', es, flag, goles: 0, penales: 0 });
      }
      const row = map.get(key)!;
      row.goles++;
      if (g.penalty) row.penales++;
    }
  };
  for (const m of matches) { add(m.team1, m.goals1); add(m.team2, m.goals2); }
  return [...map.values()].sort((a, b) => b.goles - a.goles || a.name.localeCompare(b.name)).slice(0, limit);
}

/** Partidos de un equipo (próximos sin jugar + último jugado). */
export function teamMatches(matches: RawMatch[], team: string) {
  const mine = matches.filter((m) => m.team1 === team || m.team2 === team);
  const played = mine.filter((m) => m.score && m.score.ft);
  const upcoming = mine.filter((m) => !m.score || !m.score.ft);
  return { mine, played, upcoming, last: played[played.length - 1] || null, next: upcoming[0] || null };
}

/** Rondas de eliminación directa en orden. */
const KO_ORDER = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Match for third place', 'Final'];
export function bracketRounds(matches: RawMatch[]): { round: string; matches: RawMatch[] }[] {
  const byRound = new Map<string, RawMatch[]>();
  for (const m of matches) {
    if (m.group) continue; // solo knockout
    const r = m.round || 'Knockout';
    if (!byRound.has(r)) byRound.set(r, []);
    byRound.get(r)!.push(m);
  }
  const ordered: { round: string; matches: RawMatch[] }[] = [];
  for (const r of KO_ORDER) if (byRound.has(r)) ordered.push({ round: r, matches: byRound.get(r)!.sort((a, b) => a.num - b.num) });
  // cualquier ronda no listada, al final
  for (const [r, ms] of byRound) if (!KO_ORDER.includes(r)) ordered.push({ round: r, matches: ms });
  return ordered;
}

export { esFlag };
