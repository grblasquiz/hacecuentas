/**
 * Purga selectiva de CF cache post-deploy (v2).
 *
 * Modo full: purge_everything como antes.
 * Modo incremental: lee INCREMENTAL_CHANGES (JSON) y purga solo las URLs
 * de los content types cambiados.
 *
 * Env:
 *   - CF_TOKEN, CF_ZONE
 *   - INCREMENTAL_MODE = 'full' | 'incremental' | 'assets'
 *   - INCREMENTAL_CHANGES = JSON con la estructura de Changes (ver incremental.ts)
 */

const CF_TOKEN = process.env.CF_TOKEN || '';
const CF_ZONE = process.env.CF_ZONE || '';
const MODE = (process.env.INCREMENTAL_MODE || 'full') as 'assets' | 'full' | 'incremental';
const CHANGES_RAW = process.env.INCREMENTAL_CHANGES || '';

const BASE = 'https://hacecuentas.com';

interface ContentChanges {
  slugs: string[];
}

interface Changes {
  assets?: { paths: string[] };
  calcs?: ContentChanges;
  calcs_en?: ContentChanges;
  calcs_pt?: ContentChanges;
  calcs_mx?: ContentChanges;
  calcs_cl?: ContentChanges;
  calcs_co?: ContentChanges;
  calcs_es?: ContentChanges;
  blog?: ContentChanges;
  guias?: ContentChanges;
  tablas?: ContentChanges;
  comparaciones?: ContentChanges;
  glosario?: ContentChanges;
  argentina?: ContentChanges;
  iibb?: boolean;
  categories?: string[];
  provincias?: string[];
}

type CalcBucketKey = 'calcs' | 'calcs_en' | 'calcs_pt' | 'calcs_mx' | 'calcs_cl' | 'calcs_co' | 'calcs_es';
const CALC_BUCKETS: Array<{ key: CalcBucketKey; prefix: string }> = [
  { key: 'calcs', prefix: '' },          // AR root
  { key: 'calcs_en', prefix: '/en' },
  { key: 'calcs_pt', prefix: '/pt' },
  { key: 'calcs_mx', prefix: '/mx' },
  { key: 'calcs_cl', prefix: '/cl' },
  { key: 'calcs_co', prefix: '/co' },
  { key: 'calcs_es', prefix: '/es' },
];

if (!CF_TOKEN || !CF_ZONE) {
  console.error('[purge] CF_TOKEN o CF_ZONE no seteados — skip');
  process.exit(0);
}

async function purgeEverything(): Promise<void> {
  console.log('[purge] purge_everything');
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
    },
  );
  const data: any = await res.json();
  if (!data.success) {
    console.error('[purge] FAIL', JSON.stringify(data.errors));
    process.exit(1);
  }
  console.log('[purge] ok');
}

async function purgeFiles(urls: string[]): Promise<void> {
  const CHUNK = 30;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const slice = urls.slice(i, i + CHUNK);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: slice }),
      },
    );
    const data: any = await res.json();
    if (!data.success) {
      console.error('[purge] FAIL chunk', i, JSON.stringify(data.errors));
      process.exit(1);
    }
    console.log(`[purge] ok chunk ${i}-${i + slice.length} (${slice.length})`);
  }
}

function buildUrls(changes: Changes): string[] {
  const set = new Set<string>();

  if (changes.assets) {
    for (const path of changes.assets.paths) {
      set.add(`${BASE}/${path.replace(/^public\//, '')}`);
    }
    if (MODE === 'assets') return Array.from(set);
  }

  // Sitemaps + feeds + search-index siempre cambian al editar contenido
  set.add(`${BASE}/sitemap.xml`);
  set.add(`${BASE}/sitemap-core.xml`);
  set.add(`${BASE}/sitemap-priority.xml`);
  set.add(`${BASE}/sitemap-fresh.xml`);
  set.add(`${BASE}/rss.xml`);
  set.add(`${BASE}/feed.json`);
  set.add(`${BASE}/search-index.json`);

  // Calcs: cada locale tiene su propio bucket. /embed/<slug> solo existe
  // para slugs AR (la ruta /embed glob-ea solo src/content/calcs/*).
  for (const { key, prefix } of CALC_BUCKETS) {
    const bucket = changes[key];
    if (!bucket) continue;
    for (const slug of bucket.slugs) {
      set.add(`${BASE}${prefix}/${slug}`);
      if (key === 'calcs') set.add(`${BASE}/embed/${slug}`);
    }
  }

  if (changes.blog) {
    for (const slug of changes.blog.slugs) set.add(`${BASE}/blog/${slug}`);
    set.add(`${BASE}/blog`);
  }
  if (changes.guias) {
    for (const slug of changes.guias.slugs) set.add(`${BASE}/guia/${slug}`);
    set.add(`${BASE}/guias`);
  }
  if (changes.tablas) {
    for (const slug of changes.tablas.slugs) set.add(`${BASE}/tabla/${slug}`);
  }
  if (changes.comparaciones) {
    for (const slug of changes.comparaciones.slugs) set.add(`${BASE}/comparar/${slug}`);
  }
  if (changes.glosario) {
    for (const slug of changes.glosario.slugs) set.add(`${BASE}/glosario/${slug}`);
  }
  if (changes.argentina && changes.provincias) {
    // Cada calc × cada provincia con datos
    for (const calcSlug of changes.argentina.slugs) {
      for (const prov of changes.provincias) {
        set.add(`${BASE}/argentina/${prov}/${calcSlug}`);
      }
    }
  }
  if (changes.provincias) {
    for (const prov of changes.provincias) set.add(`${BASE}/argentina/${prov}`);
  }
  if (changes.categories) {
    for (const cat of changes.categories) {
      set.add(`${BASE}/categoria/${cat}`);
      set.add(`${BASE}/categoria/${cat}/top`);
      set.add(`${BASE}/categoria/${cat}/rss.xml`);
    }
  }

  return Array.from(set);
}

async function main(): Promise<void> {
  if (MODE === 'full' || !CHANGES_RAW) {
    await purgeEverything();
    return;
  }

  let changes: Changes;
  try {
    changes = JSON.parse(CHANGES_RAW);
  } catch (err) {
    console.log('[purge] INCREMENTAL_CHANGES no parseable → fallback purge_everything');
    await purgeEverything();
    return;
  }

  const urls = buildUrls(changes);
  if (urls.length === 0) {
    console.log('[purge] no URLs to purge → fallback purge_everything');
    await purgeEverything();
    return;
  }

  console.log(`[purge] incremental → ${urls.length} URLs`);
  await purgeFiles(urls);
}

main().catch((err) => {
  console.error('[purge] error inesperado', err);
  process.exit(1);
});
