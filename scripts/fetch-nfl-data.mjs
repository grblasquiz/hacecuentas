// NFL 2026 season snapshot for the English schedule hub.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'src/data/live/nfl-2026.json');
const SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const STANDINGS = 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings?region=us&lang=en&contentorigin=espn&season=2026';

const TEAM_META = {
  ARI:['NFC','West'], ATL:['NFC','South'], BAL:['AFC','North'], BUF:['AFC','East'],
  CAR:['NFC','South'], CHI:['NFC','North'], CIN:['AFC','North'], CLE:['AFC','North'],
  DAL:['NFC','East'], DEN:['AFC','West'], DET:['NFC','North'], GB:['NFC','North'],
  HOU:['AFC','South'], IND:['AFC','South'], JAX:['AFC','South'], KC:['AFC','West'],
  LV:['AFC','West'], LAC:['AFC','West'], LAR:['NFC','West'], MIA:['AFC','East'],
  MIN:['NFC','North'], NE:['AFC','East'], NO:['NFC','South'], NYG:['NFC','East'],
  NYJ:['AFC','East'], PHI:['NFC','East'], PIT:['AFC','North'], SEA:['NFC','West'],
  SF:['NFC','West'], TB:['NFC','South'], TEN:['AFC','South'], WAS:['NFC','East'],
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'hacecuentas.com NFL 2026 schedule hub' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const normalizeGame = (event) => {
  const competition = event.competitions?.[0] || {};
  const competitors = competition.competitors || [];
  const away = competitors.find((team) => team.homeAway === 'away') || competitors[0] || {};
  const home = competitors.find((team) => team.homeAway === 'home') || competitors[1] || {};
  const final = competition.status?.type?.state === 'post' || event.status?.type?.state === 'post';
  const team = (entry) => ({
    id: entry.team?.id || '',
    name: entry.team?.displayName || 'TBD',
    shortName: entry.team?.shortDisplayName || entry.team?.name || 'TBD',
    abbr: entry.team?.abbreviation || 'TBD',
    logo: entry.team?.logo || '',
    color: `#${entry.team?.color || '8ba39a'}`,
    score: final ? entry.score ?? null : null,
    record: entry.records?.find((record) => record.name === 'overall')?.summary || '',
  });
  const seasonType = Number(event.season?.type || 2);
  return {
    id: event.id,
    date: event.date,
    seasonType,
    phase: seasonType === 1 ? 'Preseason' : seasonType === 3 ? 'Postseason' : 'Regular Season',
    week: Number(event.week?.number || 0),
    weekLabel: seasonType === 1 && Number(event.week?.number) === 1 ? 'Hall of Fame' : `${seasonType === 1 ? 'Preseason ' : ''}Week ${event.week?.number || ''}`.trim(),
    state: final ? 'post' : 'pre',
    status: final ? competition.status?.type?.description || 'Final' : 'Scheduled',
    detail: final ? competition.status?.type?.detail || 'Final' : '',
    timeValid: competition.timeValid !== false,
    away: team(away),
    home: team(home),
    broadcasts: [...new Set((competition.broadcasts || []).flatMap((broadcast) => broadcast.names || []))],
    venue: competition.venue?.fullName || '',
    city: competition.venue?.address?.city || '',
    stateCode: competition.venue?.address?.state || '',
    country: competition.venue?.address?.country || 'USA',
    neutralSite: Boolean(competition.neutralSite),
    href: event.links?.find((link) => link.text === 'Gamecast')?.href || `https://www.espn.com/nfl/game/_/gameId/${event.id}`,
  };
};

const statValue = (entry, name, fallback = 0) => {
  const stat = entry.stats?.find((item) => item.name === name);
  return stat?.displayValue ?? stat?.value ?? fallback;
};

const normalizeStandings = (payload) => (payload.children || []).flatMap((conference) =>
  (conference.standings?.entries || []).map((entry, index) => {
    const abbr = entry.team?.abbreviation || '';
    const [fallbackConference, division] = TEAM_META[abbr] || [conference.abbreviation || '', ''];
    return {
      rank: Number(statValue(entry, 'playoffSeed', index + 1)),
      conference: conference.abbreviation || fallbackConference,
      division,
      team: entry.team?.displayName || '',
      shortName: entry.team?.shortDisplayName || '',
      abbr,
      logo: entry.team?.logos?.[0]?.href || '',
      wins: Number(statValue(entry, 'wins')),
      losses: Number(statValue(entry, 'losses')),
      ties: Number(statValue(entry, 'ties')),
      pct: String(statValue(entry, 'winPercent', '.000')),
      streak: String(statValue(entry, 'streak', '—')),
    };
  }),
);

async function main() {
  try {
    const [preseasonPayload, regularPayload, calendarPayload, standingsPayload] = await Promise.all([
      fetchJson(`${SCOREBOARD}?dates=20260806-20260909&limit=200`),
      fetchJson(`${SCOREBOARD}?dates=20260909-20270113&limit=1000`),
      fetchJson(`${SCOREBOARD}?dates=2026&limit=1000`),
      fetchJson(STANDINGS),
    ]);

    const games = [...(preseasonPayload.events || []), ...(regularPayload.events || [])]
      .filter((event, index, all) => event.season?.year === 2026 && all.findIndex((item) => item.id === event.id) === index)
      .map(normalizeGame)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const teamsByAbbr = new Map();
    for (const game of games) {
      for (const side of [game.away, game.home]) {
        const [conference, division] = TEAM_META[side.abbr] || ['', ''];
        teamsByAbbr.set(side.abbr, { ...side, score: undefined, record: undefined, conference, division });
      }
    }
    const teams = [...teamsByAbbr.values()].filter((team) => team.abbr !== 'TBD').sort((a, b) => a.name.localeCompare(b.name));
    const standings = normalizeStandings(standingsPayload);
    const calendar = (calendarPayload.leagues?.[0]?.calendar || [])
      .filter((phase) => ['1', '2', '3'].includes(String(phase.value)))
      .map((phase) => ({
        label: phase.label,
        value: Number(phase.value),
        startDate: phase.startDate,
        endDate: phase.endDate,
        entries: (phase.entries || []).map((entry) => ({
          label: entry.label,
          alternateLabel: entry.alternateLabel,
          detail: entry.detail,
          value: Number(entry.value),
          startDate: entry.startDate,
          endDate: entry.endDate,
        })),
      }));

    mkdirSync(join(process.cwd(), 'src/data/live'), { recursive: true });
    writeFileSync(OUT, JSON.stringify({
      fetchedAt: new Date().toISOString(),
      season: 2026,
      source: 'ESPN NFL scoreboard and standings; schedule verified against NFL.com',
      regularSeasonGames: games.filter((game) => game.seasonType === 2).length,
      games,
      teams,
      standings,
      calendar,
    }, null, 2));
    console.log(`[nfl] 2026: ${games.length} games (${games.filter((game) => game.seasonType === 2).length} regular season), ${teams.length} teams`);
  } catch (error) {
    if (existsSync(OUT)) console.log(`[nfl] source unavailable; keeping previous snapshot (${error.message})`);
    else throw error;
  }
}

await main();
