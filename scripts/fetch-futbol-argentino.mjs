import { mkdir, readFile, writeFile } from 'node:fs/promises';

const TZ = 'America/Argentina/Buenos_Aires';
const OUT = new URL('../src/data/live/futbol-argentino.json', import.meta.url);
const policy = JSON.parse(await readFile(new URL('../src/data/football-policy.json', import.meta.url), 'utf8'));
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const visibleName = (name = '') => { const value=normalize(name); return !policy.terms.some(x=>value.includes(x))&&!policy.clubs.some(x=>value.includes(x)); };
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
const eventVisible = (event) => {
  const competitors = event.competitions?.[0]?.competitors || [];
  return competitors.length >= 2 && competitors.every((entry) => visibleName(entry.team?.displayName) && visibleName(entry.team?.shortDisplayName));
};
const cleanGroups = (payload) => (payload.children || []).map((group) => ({
  ...group,
  standings: {
    ...group.standings,
    entries: (group.standings?.entries || []).filter((entry) => visibleName(entry.team?.displayName) && visibleName(entry.team?.shortDisplayName)),
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
const start = new Date(now);
start.setDate(start.getDate() - 3);
const end = new Date(now);
end.setDate(end.getDate() + 14);
const startKey = dateKey(start);
const endKey = dateKey(end);
const [first, national] = await Promise.all([
  league('arg.1', startKey, endKey),
  league('arg.2', startKey, endKey),
]);
const snapshot = { fetchedAt: now.toISOString(), timeZone: TZ, startKey, endKey, first, national };
if (process.argv.includes('--final-only')) {
  let previous = null;
  try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
  const comparable = (payload) => JSON.stringify({ first: payload?.first, national: payload?.national });
  if (previous && comparable(previous) === comparable(snapshot)) {
    console.log('Sin cambios en partidos, agenda o tablas; no se modifica el snapshot.');
    process.exit(0);
  }
  console.log('Cambió el estado de fútbol; se actualiza el snapshot.');
}
await mkdir(new URL('../src/data/live/', import.meta.url), { recursive: true });
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Fútbol argentino: ${first.events.length + national.events.length} partidos, ${first.groups.length + national.groups.length} tablas.`);
