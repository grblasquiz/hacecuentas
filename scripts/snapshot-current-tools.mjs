import { readFile, writeFile } from 'node:fs/promises';

const sitemap = await readFile(new URL('../public/sitemap-hubs.xml', import.meta.url), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const localePrefixes = new Set(['en', 'es', 'mx', 'co', 'cl', 'pe', 'ec', 've', 'py', 'uy', 'do', 'pt', 'pt-pt']);

function decode(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .trim();
}

function localeFor(prefix) {
  return {
    en: 'en',
    es: 'es-ES',
    mx: 'es-MX',
    co: 'es-CO',
    cl: 'es-CL',
    pe: 'es-PE',
    ec: 'es-EC',
    ve: 'es-VE',
    py: 'es-PY',
    uy: 'es-UY',
    do: 'es-DO',
    pt: 'pt-BR',
    'pt-pt': 'pt-PT',
  }[prefix] || 'es';
}

async function inspect(url) {
  const html = await fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.text();
  });
  const path = new URL(url).pathname.replace(/^\/|\/$/g, '');
  const parts = path.split('/');
  const prefix = localePrefixes.has(parts[0]) ? parts[0] : '';
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s*\|\s*Hacé Cuentas\s*$/i, ''));
  // Los tags inline separan palabras visualmente (<br>, <strong>, etc.).
  // Reemplazarlos por vacío concatena tokens al generar tarjetas relacionadas.
  const h1 = decode(
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]);
  return {
    slug: path,
    url,
    title: title || h1 || path,
    h1: h1 || title || path,
    description,
    category: prefix ? (parts[1] || prefix) : parts[0],
    locale: localeFor(prefix),
    audience: prefix ? prefix.toUpperCase() : 'AR',
  };
}

const tools = [];
for (let offset = 0; offset < urls.length; offset += 25) {
  tools.push(...(await Promise.all(urls.slice(offset, offset + 25).map(inspect))));
}
tools.sort((a, b) => a.slug.localeCompare(b.slug));
await writeFile(
  new URL('../src/lib/current-tools-index.json', import.meta.url),
  `${JSON.stringify(tools, null, 2)}\n`,
);
console.log(`current-tools-index.json: ${tools.length} herramientas canónicas`);
