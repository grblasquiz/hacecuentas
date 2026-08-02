import { mkdir, readFile, writeFile } from 'node:fs/promises';

const TZ = 'America/Argentina/Buenos_Aires';
const OUT = new URL('../src/data/live/futbol-argentino.json', import.meta.url);
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const blockedTerms = ['independiente','diablo','diablos','demonio','demonios','demon','demons','devil','devils','satan','satanas','lucifer'];
const blockedClubs = ['manchester united','toluca','america de cali','nublense','crawley town','kaiserslautern'];
const visibleName = (name = '') => { const value=normalize(name); return !blockedTerms.some(x=>value.includes(x))&&!blockedClubs.some(x=>value.includes(x)); };
const dateKey = (value) => new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value)).replaceAll('-', '');
const json = async (url) => {
  let error;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'hacecuentas-data-refresh/2.0' } });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response.json();
    } catch (cause) {
      error = cause;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw error;
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
if (process.argv.includes('--final-only')) {
  const finished = (payload) => [...(payload.first?.events || []), ...(payload.national?.events || [])]
    .filter((event) => event.competitions?.[0]?.status?.type?.completed || event.competitions?.[0]?.status?.type?.state === 'post')
    .map((event) => `${event.id}:${(event.competitions?.[0]?.competitors || []).map((team) => `${team.id}:${team.score}`).sort().join(',')}`);
  let previous = null;
  try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
  const oldFinals = new Set(finished(previous || {}));
  const newFinals = finished(snapshot);
  const newlyFinished = newFinals.filter((result) => !oldFinals.has(result));
  if (previous && newlyFinished.length === 0) {
    console.log('Sin partidos nuevos en estado Final; no se modifica el snapshot.');
    process.exit(0);
  }
  console.log(`${newlyFinished.length} partido(s) nuevo(s) en estado Final.`);
}
await mkdir(new URL('../src/data/live/', import.meta.url), { recursive: true });
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Fútbol argentino: ${first.events.length + national.events.length} partidos, ${first.groups.length + national.groups.length} tablas.`);
