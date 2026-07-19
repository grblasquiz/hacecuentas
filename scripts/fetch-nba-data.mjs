// Snapshot NBA semanal para render estático + SEO.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const OUT = join(process.cwd(), 'src/data/live/nba.json');
const AR = 'America/Argentina/Buenos_Aires';
const dateKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: AR, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const weekRange = () => {
  const today = dateKey(new Date());
  const cursor = new Date(`${today}T12:00:00Z`);
  const daysFromMonday = (cursor.getUTCDay() + 6) % 7;
  cursor.setUTCDate(cursor.getUTCDate() - daysFromMonday);
  const start = cursor.toISOString().slice(0, 10);
  cursor.setUTCDate(cursor.getUTCDate() + 6);
  const end = cursor.toISOString().slice(0, 10);
  return { start, end, compact: `${start.replaceAll('-', '')}-${end.replaceAll('-', '')}` };
};
const api = (path, league = 'nba') => `https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/${path}`;
const json = async (url) => { const r = await fetch(url, { headers: { 'User-Agent': 'hacecuentas.com NBA hub' }, signal: AbortSignal.timeout(12000) }); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
const game = (event, league = 'NBA') => {
  const c = event.competitions?.[0] || {}; const teams = c.competitors || [];
  const away = teams.find((t) => t.homeAway === 'away') || teams[0] || {}; const home = teams.find((t) => t.homeAway === 'home') || teams[1] || {};
  const final = c.status?.type?.state === 'post';
  const side = (t) => ({ name: t.team?.displayName || 'Por confirmar', abbr: t.team?.abbreviation || '—', score: final ? t.score ?? null : null, logo: t.team?.logo || `https://a.espncdn.com/i/teamlogos/nba/500/${t.team?.abbreviation?.toLowerCase()}.png`, color: `#${t.team?.color || '52657a'}` });
  return { id: event.id, league, date: event.date, status: final ? c.status?.type?.name || 'Final' : 'Programado', detail: final ? c.status?.type?.detail || 'Final' : '', state: final ? 'post' : 'pre', away: side(away), home: side(home), venue: c.venue?.fullName || '', href: event.links?.find((link) => link.text === 'Gamecast')?.href || `https://www.espn.com/nba/game/_/gameId/${event.id}` };
};
async function main() {
  try {
    const week = weekRange();
    const [regularWeek, summerWeek, standings, leaderData] = await Promise.all([json(api(`scoreboard?dates=${week.compact}&limit=200`)), json(api(`scoreboard?dates=${week.compact}&limit=200`, 'nba-summer-las-vegas')), json('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en&contentorigin=espn&season=2026'), json('https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2026/types/2/leaders?lang=en&region=us')]);
    const events = [...(regularWeek.events || []).map((event) => game(event, 'NBA')), ...(summerWeek.events || []).map((event) => game(event, 'Summer League'))].filter((event, index, all) => all.findIndex((item) => item.id === event.id) === index).sort((a, b) => new Date(a.date) - new Date(b.date));
    const groups = standings.children || [];
    const table = groups.flatMap((group) => (group.standings?.entries || []).map((entry) => ({ entry, conference: group.abbreviation || group.name }))).map(({ entry, conference }) => ({
      rank: entry.stats?.find((s) => s.name === 'playoffSeed')?.value || entry.stats?.find((s) => s.name === 'rank')?.value || 0,
      conference, team: entry.team?.displayName, abbr: entry.team?.abbreviation, logo: entry.team?.logos?.[0]?.href, wins: entry.stats?.find((s) => s.name === 'wins')?.value || 0, losses: entry.stats?.find((s) => s.name === 'losses')?.value || 0, pct: entry.stats?.find((s) => s.name === 'winPercent')?.displayValue || '—'
    })).filter((x) => x.team);
    const requestedLeaders = [['pointsPerGame', 'Pts'], ['reboundsPerGame', 'Reb'], ['assistsPerGame', 'Ast']];
    const leaders = await Promise.all(requestedLeaders.map(async ([categoryName, label]) => {
      const category = leaderData.categories?.find((item) => item.name === categoryName);
      const first = category?.leaders?.[0];
      if (!first) return null;
      const [athlete, team] = await Promise.all([json(first.athlete.$ref.replace('http://', 'https://')), json(first.team.$ref.replace('http://', 'https://'))]);
      return { label, value: first.displayValue, name: athlete.shortName || athlete.displayName, fullName: athlete.displayName, headshot: athlete.headshot?.href, team: team.displayName, teamAbbr: team.abbreviation };
    }));
    mkdirSync(join(process.cwd(), 'src/data/live'), { recursive: true });
    writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), weekStart: week.start, weekEnd: week.end, source: 'ESPN NBA weekly scoreboard + standings + season leaders', games: events, standings: table, leaders: leaders.filter(Boolean) }, null, 2));
    console.log(`[nba] semana ${week.start} → ${week.end}: ${events.length} partidos, ${table.length} equipos y ${leaders.filter(Boolean).length} líderes`);
  } catch (error) { if (existsSync(OUT)) console.log('[nba] fuente no disponible; se conserva snapshot previo'); else throw error; }
}
await main();
