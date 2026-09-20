import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { getJson as get, scoreboard } from './lib/espn-football.mjs';
const policy=JSON.parse(await readFile(new URL('../src/data/football-policy.json',import.meta.url),'utf8'));
const markets=[
 ['mx','America/Mexico_City',['mex.1','mex.2']],['co','America/Bogota',['col.1','col.2']],['cl','America/Santiago',['chi.1','chi.2']],['pe','America/Lima',['per.1','per.2']],['ec','America/Guayaquil',['ecu.1','ecu.2']],['ve','America/Caracas',['ven.1','ven.2']],['py','America/Asuncion',['par.1','par.2']],['uy','America/Montevideo',['uru.1','uru.2']],['do','America/Santo_Domingo',[]],['es','Europe/Madrid',['esp.1','esp.2']],['pt','America/Sao_Paulo',['bra.1','bra.2']],['pt-pt','Europe/Lisbon',['por.1']],['en','Europe/London',['eng.1','eng.2']]
];
const norm=(v='')=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const allowed=v=>{const n=norm(v);return !policy.terms.some(x=>n.includes(x))&&!policy.clubs.some(x=>n.includes(x))};
const visible=e=>{const competitors=e.competitions?.[0]?.competitors||[];return competitors.length>=2&&competitors.every(x=>allowed(x.team?.displayName||'')&&allowed(x.team?.shortDisplayName||''));};
const key=(d,tz)=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replaceAll('-','');
async function league(code, start, end) {
  const [scores, table] = await Promise.all([
    scoreboard(code, start, end),
    get(`https://site.api.espn.com/apis/v2/sports/soccer/${code}/standings?season=${new Date().getFullYear()}`),
  ]);
  return {
    events: scores.events.filter(visible),
    groups: (table.children || []).map(group => ({
      ...group,
      standings: {
        ...group.standings,
        entries: (group.standings?.entries || []).filter(entry => allowed(entry.team?.displayName || '') && allowed(entry.team?.shortDisplayName || '')),
      },
    })),
  };
}

// Fetch every market before writing: a failed source must not publish a partial batch.
const pending = [];
for (const [id, timeZone, codes] of markets) {
  try {
    const now = new Date(), startDate = new Date(now), endDate = new Date(now);
    startDate.setDate(startDate.getDate() - 3);
    endDate.setDate(endDate.getDate() + 14);
    const startKey = key(startDate, timeZone), endKey = key(endDate, timeZone);
    const leagues = await Promise.all(codes.map(code => league(code, startKey, endKey)));
    const snapshot = { fetchedAt: now.toISOString(), timeZone, startKey, endKey, leagues };
    const out = new URL(`../src/data/live/football/${id}.json`, import.meta.url);
    let previous = null;
    try { previous = JSON.parse(await readFile(out, 'utf8')); } catch {}
    if (process.argv.includes('--final-only') && previous && JSON.stringify(previous.leagues) === JSON.stringify(leagues)) {
      console.log(`${id}: sin cambios en partidos, agenda o tablas`);
      continue;
    }
    pending.push({ id, out, snapshot });
  } catch (error) {
    console.error(`${id}: error; se conservan los snapshots anteriores`, error.message);
    process.exitCode = 1;
  }
}
if (!process.exitCode) {
  await mkdir(new URL('../src/data/live/football/', import.meta.url), { recursive: true });
  for (const { id, out, snapshot } of pending) {
    await writeFile(out, `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(`${id}: actualizado`);
  }
}
