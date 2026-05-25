/**
 * Purga selectiva de CF cache post-deploy.
 *
 * Modo full (INCREMENTAL_SLUGS vacío): purge_everything como antes.
 * Modo incremental: solo purga las URLs que cambiaron (slugs en sus locales
 * respectivas + variantes /embed/<slug> + sitemaps que siempre cambian).
 *
 * Lee de env:
 *   - CF_TOKEN (Cloudflare API token con permiso Zone.Cache.Purge)
 *   - CF_ZONE  (zone ID)
 *   - INCREMENTAL_MODE = 'full' | 'incremental'
 *   - INCREMENTAL_SLUGS  (CSV)
 *   - INCREMENTAL_LOCALES (CSV, '' = AR root)
 */

const CF_TOKEN = process.env.CF_TOKEN || '';
const CF_ZONE = process.env.CF_ZONE || '';
const MODE = (process.env.INCREMENTAL_MODE || 'full') as 'full' | 'incremental';
const SLUGS = (process.env.INCREMENTAL_SLUGS || '').split(',').filter(Boolean);
const LOCALES = (process.env.INCREMENTAL_LOCALES || '').split(',');

const BASE = 'https://hacecuentas.com';

if (!CF_TOKEN || !CF_ZONE) {
  console.error('[purge] CF_TOKEN o CF_ZONE no seteados — skip');
  process.exit(0);
}

async function purgeEverything(): Promise<void> {
  console.log('[purge] mode=full → purge_everything');
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
  // CF acepta hasta 30 URLs por request. Lo manejamos en chunks.
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
    console.log(`[purge] ok chunk ${i}-${i + slice.length} (${slice.length} URLs)`);
  }
}

function buildUrls(): string[] {
  const set = new Set<string>();

  // Sitemaps + RSS + search-index siempre cambian al editar un calc
  set.add(`${BASE}/sitemap.xml`);
  set.add(`${BASE}/sitemap-calcs-1.xml`);
  set.add(`${BASE}/sitemap-calcs-2.xml`);
  set.add(`${BASE}/sitemap-core.xml`);
  set.add(`${BASE}/sitemap-priority.xml`);
  set.add(`${BASE}/sitemap-fresh.xml`);
  set.add(`${BASE}/rss.xml`);
  set.add(`${BASE}/feed.json`);
  set.add(`${BASE}/search-index.json`);

  // Calc URLs por slug × locale. 'ar' es el root sin prefijo, los demás
  // usan /<locale>/<slug>.
  for (const slug of SLUGS) {
    for (const locale of LOCALES) {
      const prefix = locale === 'ar' ? '' : `/${locale}`;
      set.add(`${BASE}${prefix}/${slug}`);
    }
    // Embed siempre cuelga del root (no por locale)
    set.add(`${BASE}/embed/${slug}`);
  }

  return Array.from(set);
}

async function main(): Promise<void> {
  if (MODE === 'full') {
    await purgeEverything();
    return;
  }

  if (SLUGS.length === 0) {
    console.log('[purge] mode=incremental pero sin slugs → fallback purge_everything');
    await purgeEverything();
    return;
  }

  const urls = buildUrls();
  console.log(`[purge] mode=incremental → ${urls.length} URLs`);
  await purgeFiles(urls);
}

main().catch((err) => {
  console.error('[purge] error inesperado', err);
  process.exit(1);
});
