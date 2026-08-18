/**
 * Orquestador de prebuild paralelo.
 *
 * Dependencias reales:
 *   validate:data   → gate (falla rápido si hay datos inválidos)
 *   related, og, sitemap, stamp-sw → independientes entre sí
 *   og-manifest     → lee public/og/, necesita `og` terminado
 *
 * Serial equivalente (npm run prebuild anterior):
 *   ~125s sin cache, ~2s con cache.
 * Paralelo: max(og) domina, resto corre en background → ~100s sin cache.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

type Task = { name: string; cmd: string; args: string[] };

const NODE = 'node';
const FLAGS = ['--experimental-strip-types'];

function task(name: string, script: string): Task {
  return { name, cmd: NODE, args: [...FLAGS, `scripts/${script}.ts`] };
}

// Scripts que importan módulos de `src/` con imports SIN extensión: node
// --experimental-strip-types no los resuelve (ERR_MODULE_NOT_FOUND) y tumba el
// prebuild entero. tsx sí resuelve la cadena completa.
function tsxTask(name: string, script: string): Task {
  return { name, cmd: 'npx', args: ['tsx', `scripts/${script}.ts`] };
}

// .mjs no necesita --experimental-strip-types
function mjsTask(name: string, script: string): Task {
  return { name, cmd: NODE, args: [`scripts/${script}.mjs`] };
}

// Scripts python (sin build step).
function pyTask(name: string, script: string): Task {
  return { name, cmd: 'python3', args: [`scripts/${script}.py`] };
}

/**
 * ¿Los gates abortan el build o sólo avisan?
 *
 * Por defecto AVISAN. Cada gate se agregó después de un incidente real y
 * siguen corriendo y reportando, pero dejaron de frenar: entre el 25 y el 27
 * de julio bloquearon cuatro deploys seguidos y en tres de esos casos lo que
 * marcaban era deuda anterior, no el cambio que se estaba subiendo.
 *
 * Para que vuelvan a bloquear: HC_GATES=block npm run deploy
 */
const GATES_BLOQUEAN = process.env.HC_GATES === 'block';
const fallidos: string[] = [];

function run(t: Task): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(t.cmd, t.args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const prefix = `[${t.name}]`;
    const relay = (stream: NodeJS.ReadableStream, out: NodeJS.WriteStream) => {
      let buf = '';
      stream.on('data', (chunk: Buffer) => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) out.write(`${prefix} ${line}\n`);
      });
      stream.on('end', () => {
        if (buf) out.write(`${prefix} ${buf}\n`);
      });
    };
    relay(child.stdout!, process.stdout);
    relay(child.stderr!, process.stderr);
    child.on('error', reject);
    child.on('exit', (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`${prefix} ✓ ${secs}s`);
        resolve();
      } else if (GATES_BLOQUEAN) {
        reject(new Error(`${t.name} falló con código ${code} (${secs}s)`));
      } else {
        // Gates en modo aviso (decisión de Martin, 2026-07-27): frenaban cada
        // deploy y varios marcaban deuda vieja, no el cambio que se estaba
        // subiendo. Siguen corriendo y siguen logueando todo — sólo dejan de
        // abortar. Para volver atrás: HC_GATES=block npm run deploy, o poner
        // el default de GATES_BLOQUEAN en true.
        console.warn(`${prefix} ⚠ falló con código ${code} (${secs}s) — NO bloquea (HC_GATES=warn)`);
        fallidos.push(t.name);
        resolve();
      }
    });
  });
}

function resumenGates() {
  if (!fallidos.length) return;
  console.warn('');
  console.warn(`[prebuild] ⚠ ${fallidos.length} gate(s) fallaron sin bloquear: ${fallidos.join(', ')}`);
  console.warn('[prebuild]   Revisá el log de arriba. Para que vuelvan a frenar: HC_GATES=block npm run deploy');
  console.warn('');
}

async function main() {
  const t0 = Date.now();

  // En build incremental, skip compute-related — recompute TF-IDF tarda
  // 60-90s y mejora marginal: el related-auto.json del último deploy se
  // mantiene válido (afecta solo los related blocks de calcs vecinos al
  // slug modificado, y solo hasta el próximo full rebuild).
  const incremental = Boolean(process.env.INCREMENTAL_CHANGES);

  console.log(`[prebuild] mode=${incremental ? 'incremental' : 'full'}`);
  // Primero materializamos contenido temporal desde su snapshot único. Los
  // gates que siguen nunca deben leer tablas/FAQ de una versión anterior.
  await run(task('sync-ipc-derived', 'sync-ipc-derived-content'));
  console.log('[prebuild] fase 1: validate:data + editorial-gate + temporal-gate + fiscal-gate + placeholder-gate + link-guard + regenerate-formula-index + converter-tables + bcra-indices');
  await Promise.all([
    run(task('validate', 'validate-data-updates')),
    run(task('derived-integrity', 'check-derived-data-consistency')),
    // Bloquea publicación indexable de cualquier calc bajo el piso editorial.
    // La salida segura es completar revisión o marcarla draft/noindex.
    run({ name: 'editorial-gate', cmd: NODE, args: [...FLAGS, 'scripts/quarantine-editorial-risk.ts', '--strict'] }),
    run({ name: 'adsense-gate', cmd: NODE, args: [...FLAGS, 'scripts/audit-adsense.ts', '--gate'] }),
    run({ name: 'blog-adsense-gate', cmd: NODE, args: [...FLAGS, 'scripts/audit-blog-adsense.ts', '--gate'] }),
    run(task('temporal-gate', 'check-temporal-claims')),
    // Gate anti-hardcode fiscal: falla rápido si una fórmula re-introduce un
    // valor fiscal viejo conocido (teto INSS 2025, SM 1518, etc.) en vez de
    // importar la fuente única de src/lib/data/.
    run(task('fiscal-gate', 'check-fiscal-hardcode')),
    // Gate anti-placeholder (plan AdSense): falla el build si una calc VISIBLE
    // conserva una frase/campo de plantilla ("fórmula estándar del tema",
    // "Input 1/2", "Ingresá consultar", ejemplo stub, output genérico de
    // info-selector). Impide PUBLICAR una calc a medio hacer. Para publicarla:
    // completá el contenido o marcala "status":"draft". Ver lint-calc-quality.mjs.
    run({ name: 'placeholder-gate', cmd: NODE, args: ['scripts/lint-calc-quality.mjs', '--gate'] }),
    // Gate de links/slugs hardcodeados (Header/Footer/home/pillars): falla si
    // un slug a mano no resuelve a ruta viva o apunta a un 410.
    run(task('link-guard', 'validate-hardcoded-slugs')),
    run(task('formula-index', 'regenerate-formula-index')),
    run(mjsTask('converter-tables', 'generate-converter-tables')),
    run(mjsTask('bcra-indices', 'fetch-bcra-indices')),
    run(mjsTask('mundial-fixture', 'fetch-mundial-fixture')),
    run(mjsTask('nba-data', 'fetch-nba-data')),
    run(mjsTask('nfl-data', 'fetch-nfl-data')),
  ]);

  const phase2Tasks: Task[] = [
    tsxTask('hub-research', 'generate-hub-citable-research'),
    task('og', 'generate-og-images'),
    tsxTask('sitemap', 'generate-sitemap'),
    task('search-index', 'generate-search-index'),
    // Índice slim {slug, clusterKey} de los 14 locales para hreflang recíproco.
    // Reemplaza los import.meta.glob eager y excluye URLs no distribuibles.
    // DEBE existir antes del build.
    task('hreflang-index', 'generate-hreflang-index'),
    task('stamp-sw', 'stamp-sw'),
    // API para LLMs: catálogo /api/calcs-index.json + índice slim que consume
    // el endpoint SSR /api/calc/[slug]/compute.ts. Ambos fs-only y rápidos.
    // compute-index DEBE existir antes del build de Vite (lo importa el Worker).
    task('calcs-api', 'generate-calc-api-index'),
    // Índice de frescura /api/freshness.json — lo consume el workflow de GitHub
    // Actions (check-stale-data --from-url) para detectar datos vencidos leyendo
    // de PROD, sin depender del checkout de origin (forkeado) ni de la Mac.
    task('freshness-index', 'generate-freshness-index'),
    task('monotributo-data', 'generate-monotributo-dataset'),
    task('compute-index', 'generate-compute-index'),
    // Índice inverso profileKey → calcs que lo usan, para /mi-hacecuentas.
    task('profile-usage', 'generate-profile-usage'),
    mjsTask('hub-alert-versions', 'generate-hub-alert-versions'),
    // Conteo de calcs en los estáticos de public/ (llms.txt, ai.txt, openapi,
    // ai-plugin) — no pueden importar calc-counts.ts, así que se patchean acá.
    task('calc-counts', 'sync-calc-counts'),
  ];
  // Skip compute-related solo si estamos en incremental Y el output cacheado
  // ya existe. Si no existe (primer build de la rama, cache invalidado, etc.)
  // correlo igual para no romper el import del JSON desde los componentes.
  const relatedExists = existsSync('src/lib/related-auto.json');
  if (!incremental || !relatedExists) {
    phase2Tasks.unshift(task('related', 'compute-related'));
    if (incremental) {
      console.log('[prebuild] incremental pero related-auto.json no existe → corre compute-related igual');
    }
  } else {
    console.log('[prebuild] incremental: skip compute-related (related-auto.json del último deploy se reutiliza)');
  }

  console.log(`[prebuild] fase 2: ${phase2Tasks.map((t) => t.name).join(', ')} (paralelo)`);
  await Promise.all(phase2Tasks.map((t) => run(t)));

  console.log('[prebuild] fase 3: og-manifest + page-feed');
  // optimize-images sacado del prebuild 2026-04-27. Generaba webp+avif de
  // 2786 OG PNGs (5572 conversiones, sharp+avif effort:4). En CI no hay
  // cache de webp/avif (están en .gitignore) → cada deploy regeneraba todo
  // y tardaba 10+ min, haciendo timeout al job de 15min. Ningún consumidor
  // (HTML, src/) referencia los .webp/.avif: og:image apunta a .png.
  // Si en el futuro se quiere servir <picture> con webp/avif, correr
  // `node scripts/optimize-images.mjs` manualmente y commitear los
  // resultados, o agregar un actions/cache step al workflow.
  //
  // page-feed (CSV de Google Ads DSA) parsea los sitemap-*.xml de fase 2, así
  // que corre acá, después de generate-sitemap. og-manifest es independiente.
  const phase3Tasks: Task[] = [
    task('og-manifest', 'generate-og-manifest'),
    task('page-feed', 'generate-page-feed'),
  ];
  // llms-full.txt (~1.5MB) refleja el contenido de TODAS las calcs para que los
  // LLMs lo ingieran fresco (#59). Solo tiene sentido regenerarlo en full build;
  // en incremental se reutiliza el del último deploy.
  if (!incremental) {
    phase3Tasks.push(pyTask('llms-full', 'generate-llms-full'));
  }
  await Promise.all(phase3Tasks.map((t) => run(t)));

  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[prebuild] ✓ total ${total}s`);
  resumenGates();
}

main().catch((err) => {
  console.error('[prebuild] ✗', err.message);
  process.exit(1);
});
