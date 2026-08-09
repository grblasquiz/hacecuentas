import type { APIRoute } from 'astro';
import { footballMarkets } from '../../lib/football-markets';
import { footballEventAllowed, footballNameAllowed } from '../../lib/football-policy';

export const prerender = false;

const ESPN = 'https://site.api.espn.com/apis';
const argentina = {
  key: 'ar',
  country: 'Argentina',
  timeZone: 'America/Argentina/Buenos_Aires',
  leagues: ['Primera', 'Nacional'],
  codes: ['arg.1', 'arg.2'],
};

const markets = new Map([
  ['ar', argentina],
  ...footballMarkets.map((market) => [market.key, {
    key: market.key,
    country: market.country,
    timeZone: market.tz,
    leagues: [...market.leagues],
    codes: [...market.codes],
  }] as const),
]);

const dateKey = (value: Date, timeZone: string) => new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(value).replaceAll('-', '');

const fetchJson = async (url: string) => {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`ESPN ${response.status}`);
  return response.json();
};

const cleanStandings = (payload: any) => (payload?.children || []).map((group: any) => ({
  ...group,
  standings: {
    ...group.standings,
    entries: (group.standings?.entries || []).filter((entry: any) =>
      footballNameAllowed(entry.team?.displayName) && footballNameAllowed(entry.team?.shortDisplayName),
    ),
  },
}));

const fetchLeague = async (code: string, start: string, end: string) => {
  const [scoreboard, standings] = await Promise.all([
    fetchJson(`${ESPN}/site/v2/sports/soccer/${code}/scoreboard?dates=${start}-${end}&limit=100`),
    fetchJson(`${ESPN}/v2/sports/soccer/${code}/standings?season=${new Date().getFullYear()}`),
  ]);

  return {
    code,
    events: (scoreboard.events || []).filter(footballEventAllowed),
    groups: cleanStandings(standings),
  };
};

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('market') || 'ar';
  const market = markets.get(key);

  if (!market) {
    return new Response(JSON.stringify({ error: 'mercado de fútbol inválido' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  if (!market.codes.length) {
    return new Response(JSON.stringify({ error: 'mercado sin fuente de datos disponible' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(start.getDate() - 3);
  end.setDate(end.getDate() + 14);

  try {
    const leagues = await Promise.all(market.codes.map((code) => fetchLeague(
      code,
      dateKey(start, market.timeZone),
      dateKey(end, market.timeZone),
    )));
    const payload = {
      fetchedAt: now.toISOString(),
      timeZone: market.timeZone,
      startKey: dateKey(start, market.timeZone),
      endKey: dateKey(end, market.timeZone),
      ...(key === 'ar'
        ? { first: leagues[0], national: leagues[1] }
        : { leagues }),
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'cdn-cache-control': 'max-age=60',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'fuente de fútbol temporalmente no disponible' }), {
      status: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }
};
