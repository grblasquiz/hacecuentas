// ────────────────────────────────────────────────────────────────────────────
// fetch-mundial-fixture.mjs
// Trae el fixture + resultados del Mundial 2026 desde openfootball/worldcup.json
// (dominio público, sin API key) y escribe src/lib/data/mundial-2026-fixture.json,
// que /fixture-mundial-2026 importa y server-renderea (snapshot crawleable).
//
// La página ADEMÁS refetchea el mismo JSON client-side en cada carga, así que se
// "llena sola" día a día sin redeploy. Este snapshot es el baseline que ven los
// crawlers (Bing/AEO) y se refresca en cada build (o vía cron diario que corra
// este script + deploy).
//
// Si la fuente falla, CONSERVA el último JSON bueno (no pierde el fixture por un
// transitorio). Corre en prebuild fase 1.
// ────────────────────────────────────────────────────────────────────────────
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src', 'lib', 'data');
const OUT = join(OUT_DIR, 'mundial-2026-fixture.json');
const SOURCE = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

async function fetchSource() {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(SOURCE, {
        headers: { 'User-Agent': 'hacecuentas.com/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (d && Array.isArray(d.matches) && d.matches.length > 0) return d;
    } catch { /* retry */ }
  }
  return null;
}

function normalize(raw) {
  // openfootball ordena los partidos por número oficial FIFA (1..104). Usamos el
  // índice como num estable si no viene explícito.
  const matches = raw.matches.map((m, i) => ({
    num: m.num ?? i + 1,
    round: m.round || '',
    group: m.group || null,
    date: m.date || null,
    time: m.time || null,
    team1: m.team1 || null,
    team2: m.team2 || null,
    // score: { ft:[a,b], ht:[...], et:[...], p:[...] } o null si no se jugó
    score: m.score || null,
    goals1: Array.isArray(m.goals1) ? m.goals1 : [],
    goals2: Array.isArray(m.goals2) ? m.goals2 : [],
    ground: m.ground || null,
  }));
  return {
    name: raw.name || 'World Cup 2026',
    source: SOURCE,
    fetchedAt: new Date().toISOString(),
    played: matches.filter((m) => m.score && m.score.ft).length,
    total: matches.length,
    matches,
  };
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  return fetchSource().then((raw) => {
    if (!raw) {
      if (existsSync(OUT)) {
        console.log('[mundial-fixture] fuente no disponible → conservo snapshot previo');
        return;
      }
      // Sin snapshot previo: escribimos un esqueleto vacío para que el build no rompa.
      writeFileSync(OUT, JSON.stringify({ name: 'World Cup 2026', source: SOURCE, fetchedAt: new Date().toISOString(), played: 0, total: 0, matches: [] }, null, 0));
      console.log('[mundial-fixture] fuente no disponible y sin snapshot previo → esqueleto vacío');
      return;
    }
    const data = normalize(raw);
    writeFileSync(OUT, JSON.stringify(data, null, 0));
    console.log(`[mundial-fixture] OK — ${data.total} partidos, ${data.played} jugados → ${OUT.replace(ROOT + '/', '')}`);
  });
}

await main();
