/**
 * Indexa las calculadoras en Cloudflare Vectorize para la búsqueda semántica del
 * intérprete de problemas (/api/interpret). Embebe con Workers AI (bge-m3, 1024
 * dims, multilingüe) y hace upsert al índice `hacecuentas-calcs`.
 *
 * Por qué: el retrieval por palabras clave no salva la brecha semántica entre el
 * problema en lenguaje natural ("me queda en mano") y el nombre de la calc
 * ("sueldo en mano"/"neto"). Embeddings sí.
 *
 * Auth: usa getPlatformProxy (OAuth de wrangler) para AI + VECTORIZE remotos, vía
 * un config mínimo (scripts/vectorize.wrangler.jsonc) que evita cargar ./dist.
 *
 * Incremental: guarda un manifiesto slug→hash; en reruns sólo re-embebe lo que
 * cambió. Setup del índice (una vez):
 *   wrangler vectorize create hacecuentas-calcs --dimensions=1024 --metric=cosine
 *
 * Uso:  node --experimental-strip-types scripts/build-calc-embeddings.ts [--full]
 */
import { getPlatformProxy } from 'wrangler';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const CONFIG = 'scripts/vectorize.wrangler.jsonc';
const MANIFEST = join(ROOT, 'scripts/.calc-embeddings-manifest.json');
const EMBED_MODEL = '@cf/baai/bge-m3';
const EMBED_BATCH = 90; // bge-m3 acepta hasta 100 textos por llamada
const UPSERT_BATCH = 500;
const FULL = process.argv.includes('--full');

interface CalcMeta {
  slug: string;
  text: string;
  audience: string;
  category: string;
}

// ── Fuente: índice slim (calcs computables) + descripción/keywords del content ─
function loadCalcs(): CalcMeta[] {
  const slim = JSON.parse(readFileSync(join(ROOT, 'src/lib/calc-compute-index.json'), 'utf8')) as Record<string, any>;

  // Mapa slug → {description, keywords} desde los JSON de content (todas las colecciones).
  const contentDirs = readdirSync(join(ROOT, 'src/content')).filter((d) => d.startsWith('calcs'));
  const enrich = new Map<string, { d?: string; kw?: string[] }>();
  for (const dir of contentDirs) {
    const dirPath = join(ROOT, 'src/content', dir);
    for (const f of readdirSync(dirPath)) {
      if (!f.endsWith('.json')) continue;
      try {
        const j = JSON.parse(readFileSync(join(dirPath, f), 'utf8'));
        if (j.slug) enrich.set(j.slug, { d: j.description, kw: j.seoKeywords });
      } catch {
        /* ignorar JSON roto */
      }
    }
  }

  const out: CalcMeta[] = [];
  for (const slug of Object.keys(slim)) {
    const e = slim[slug];
    const ex = enrich.get(slug) || {};
    const parts = [e.h || slug];
    if (ex.d) parts.push(ex.d);
    if (ex.kw?.length) parts.push(ex.kw.slice(0, 12).join(', '));
    if (e.cat) parts.push(`Categoría: ${e.cat}`);
    const text = parts.join('. ').replace(/\s+/g, ' ').trim().slice(0, 600);
    out.push({ slug, text, audience: e.aud || 'AR', category: e.cat || '' });
  }
  return out;
}

function hashText(s: string): string {
  return createHash('sha1').update(s).digest('hex').slice(0, 12);
}

async function main() {
  const calcs = loadCalcs();
  console.log(`[embeddings] ${calcs.length} calcs en el catálogo`);

  const manifest: Record<string, string> = FULL || !existsSync(MANIFEST) ? {} : JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const todo = calcs.filter((c) => manifest[c.slug] !== hashText(c.text));
  console.log(`[embeddings] ${todo.length} a (re)indexar${FULL ? ' (full)' : ' (incremental)'}`);
  if (!todo.length) {
    console.log('[embeddings] nada que hacer.');
    return;
  }

  const { env, dispose } = await getPlatformProxy({ configPath: CONFIG });
  try {
    const vectors: Array<{ id: string; values: number[]; metadata: Record<string, string> }> = [];
    for (let i = 0; i < todo.length; i += EMBED_BATCH) {
      const batch = todo.slice(i, i + EMBED_BATCH);
      const res: any = await (env as any).AI.run(EMBED_MODEL, { text: batch.map((c) => c.text) });
      const data: number[][] = res?.data || [];
      if (data.length !== batch.length) throw new Error(`embed mismatch: ${data.length} vs ${batch.length}`);
      batch.forEach((c, j) => {
        // El id de Vectorize tiene tope de 64 bytes y algunos slugs lo superan →
        // usamos el hash del slug como id y guardamos el slug real en metadata.
        const id = createHash('sha1').update(c.slug).digest('hex');
        vectors.push({ id, values: data[j], metadata: { slug: c.slug, audience: c.audience, cat: c.category } });
        manifest[c.slug] = hashText(c.text);
      });
      process.stdout.write(`\r[embeddings] embebidos ${Math.min(i + EMBED_BATCH, todo.length)}/${todo.length}   `);
    }
    console.log('');

    // Upsert en lotes.
    for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
      const slice = vectors.slice(i, i + UPSERT_BATCH);
      await (env as any).VECTORIZE.upsert(slice);
      process.stdout.write(`\r[embeddings] upsert ${Math.min(i + UPSERT_BATCH, vectors.length)}/${vectors.length}   `);
    }
    console.log('');
  } finally {
    await dispose();
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0));
  console.log(`[embeddings] listo. manifiesto: ${MANIFEST}`);
}

main().catch((e) => {
  console.error('[embeddings] ERROR:', e);
  process.exit(1);
});
