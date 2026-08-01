import { mkdir, writeFile } from 'node:fs/promises';

const TZ = 'America/Argentina/Buenos_Aires';
const OUT = new URL('../src/data/live/futbol-argentino.json', import.meta.url);
const BLOCKED = Buffer.from('aW5kZXBlbmRpZW50ZQ==', 'base64').toString('utf8');
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const visibleName = (name = '') => !normalize(name).includes(BLOCKED);
const dateKey = (value) => new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value)).replaceAll('-', '');
const json = async (url) => {
  const response = await fetch(url, { headers: { 'user-agent': 'hacecuentas-data-refresh/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};
const eventVisible = (event) => (event.competitions?.[0]?.competitors || [])
  .every((entry) => visibleName(entry.team?.displayName));
const cleanGroups = (payload) => (payload.children || []).map((group) => ({
  ...group,
  standings: {
    ...group.standings,
    entries: (group.standings?.entries || []).filter((entry) => visibleName(entry.team?.displayName)),
  },
}));

async function league(code, start, end) {
  const base = 'https://site.api.espn.com/apis';
  const [scores, standings] = await Promise.all([
    json(`${base}/site/v2/sports/soccer/${code}/scoreboard?dates=${start}-${end}&limit=100`),
    json(`${base}/v2/sports/soccer/${code}/standings?season=${new Date().getFullYear()}`),
  ]);
  return {
    events: (scores.events || []).filter(eventVisible),
    groups: cleanGroups(standings),
  };
}

const now = new Date();
const end = new Date(now);
end.setDate(end.getDate() + 14);
const startKey = dateKey(now);
const endKey = dateKey(end);
const [first, national] = await Promise.all([
  league('arg.1', startKey, endKey),
  league('arg.2', startKey, endKey),
]);
const snapshot = { fetchedAt: now.toISOString(), timeZone: TZ, startKey, endKey, first, national };
await mkdir(new URL('../src/data/live/', import.meta.url), { recursive: true });
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Fútbol argentino: ${first.events.length + national.events.length} partidos, ${first.groups.length + national.groups.length} tablas.`);
