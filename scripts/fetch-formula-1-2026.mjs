/** Genera el snapshot SEO del calendario, resultados y tabla F1 2026.
 * OpenF1 es una API pública: https://openf1.org/docs/
 */
import { writeFile } from 'node:fs/promises';

const API = 'https://api.openf1.org/v1';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// OpenF1 limita las consultas públicas. Serializamos y reintentamos para que el
// refresh diario no falle ni deje un snapshot vacío cuando coincide con un GP.
const get = async (path, attempt = 0) => {
  const res = await fetch(`${API}${path}`, { headers: { accept: 'application/json' } });
  if (res.ok) { await pause(1250); return res.json(); }
  // La cuota pública puede bajar durante un GP. Preferimos esperar hasta un
  // minuto antes que publicar un snapshot parcial o dejar de actualizarse.
  if (res.status === 429 && attempt < 12) { await pause(5000); return get(path, attempt + 1); }
  throw new Error(`${path}: HTTP ${res.status}`);
};

const races = (await get('/sessions?year=2026&session_name=Race'))
  .map(({ session_key, meeting_key, circuit_short_name, country_name, country_code, location, date_start, date_end, is_cancelled }) => ({
    sessionKey: session_key, meetingKey: meeting_key, circuit: circuit_short_name, country: country_name,
    countryCode: country_code, location, start: date_start, end: date_end, cancelled: Boolean(is_cancelled),
  }))
  .sort((a, b) => a.start.localeCompare(b.start));

const allSessions = await get('/sessions?year=2026');
const completed = races.filter((r) => new Date(r.end) < new Date() && !r.cancelled);
// Además de la carrera, incluimos sprint y clasificación: son los tres momentos
// que cambian esta superficie. La quali sprint también se guarda como referencia.
const resultSessions = allSessions.filter((s) =>
  !s.is_cancelled && new Date(s.date_end) < new Date() &&
  ['Race', 'Sprint', 'Qualifying', 'Sprint Qualifying'].includes(s.session_name)
).sort((a, b) => a.date_start.localeCompare(b.date_start));
const driverMap = new Map();
const standings = new Map();
const driversLoaded = new Set();
const sessionResults = [];
for (const session of resultSessions) {
  const results = await get(`/session_result?session_key=${session.session_key}`);
  if (!driversLoaded.has(session.meeting_key)) {
    const drivers = await get(`/drivers?session_key=${session.session_key}`);
    for (const d of drivers) driverMap.set(d.driver_number, { name: d.full_name, team: d.team_name, acronym: d.name_acronym });
    driversLoaded.add(session.meeting_key);
  }
  const rows = results.sort((a, b) => a.position - b.position).slice(0, 10).map((r) => ({
    position: r.position, driverNumber: r.driver_number, points: r.points, dnf: r.dnf, dsq: r.dsq,
  }));
  sessionResults.push({ sessionKey: session.session_key, meetingKey: session.meeting_key, name: session.session_name, start: session.date_start, results: rows });
  const race = races.find((r) => r.sessionKey === session.session_key);
  if (race) race.results = rows;
  // Sólo carrera y sprint otorgan puntos para el campeonato.
  if (!['Race', 'Sprint'].includes(session.session_name)) continue;
  for (const r of results) {
    const row = standings.get(r.driver_number) || { driverNumber: r.driver_number, points: 0, wins: 0 };
    row.points += Number(r.points || 0); if (r.position === 1) row.wins++;
    standings.set(r.driver_number, row);
  }
}

const drivers = Object.fromEntries(driverMap);
const table = [...standings.values()].map((r) => ({ ...r, ...drivers[r.driverNumber] }))
  .sort((a, b) => b.points - a.points || b.wins - a.wins || String(a.name).localeCompare(String(b.name)));
const output = { fetchedAt: new Date().toISOString(), source: `${API}/sessions?year=2026`, races, sessions: sessionResults, drivers, standings: table };
await writeFile(new URL('../src/data/live/formula-1-2026.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`F1 snapshot: ${races.length} GPs, ${completed.length} carreras; ${sessionResults.length} sesiones con resultados.`);
