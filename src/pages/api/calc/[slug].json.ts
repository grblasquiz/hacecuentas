import type { APIRoute, GetStaticPaths } from 'astro';
import { canServeCalc } from '../../../lib/content-policy';

// ─────────────────────────────────────────────────────────────────────────────
// CALC SPEC API — GET /api/calc/{slug}.json  (estático, prerender)
//
// Ficha machine-readable de una calculadora: qué hace, qué inputs toma, un
// ejemplo listo para llamar, y la URL del endpoint de cómputo en vivo. Pensado
// para que LLMs (Grok, ChatGPT, Claude, Gemini) y agentes descubran, citen y
// sepan exactamente cómo invocar cada calc vía /api/calc/{slug}/compute.
//
// Multi-locale: cubre las 14 colecciones (AR + EN + 9 mercados ES + BR/PT).
// Los slugs son globalmente únicos entre colecciones (verificado, 0
// colisiones), así que la ruta sigue siendo /api/calc/{slug}.json y el prefijo
// (en/, mx/, ...) sólo reconstruye la URL pública canónica.
//
// prerender=true: se resuelve en build time -> 1 archivo estático por calc, cero
// costo de Worker. El eager glob de los JSON es seguro acá justamente porque es
// build-time (mismo patrón que search-index.json.ts / api/calcs/index.json.ts).
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = true;

const SITE = 'https://hacecuentas.com';
const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';

// Mismas colecciones/prefijos que generate-compute-index.ts y el catálogo.
const COLLECTIONS: Record<string, { prefix: string; locale: string }> = {
  calcs: { prefix: '', locale: 'es' },
  'calcs-en': { prefix: 'en/', locale: 'en' },
  'calcs-es': { prefix: 'es/', locale: 'es-ES' },
  'calcs-co': { prefix: 'co/', locale: 'es-CO' },
  'calcs-mx': { prefix: 'mx/', locale: 'es-MX' },
  'calcs-cl': { prefix: 'cl/', locale: 'es-CL' },
  'calcs-pe': { prefix: 'pe/', locale: 'es-PE' },
  'calcs-ec': { prefix: 'ec/', locale: 'es-EC' },
  'calcs-ve': { prefix: 've/', locale: 'es-VE' },
  'calcs-py': { prefix: 'py/', locale: 'es-PY' },
  'calcs-uy': { prefix: 'uy/', locale: 'es-UY' },
  'calcs-do': { prefix: 'do/', locale: 'es-DO' },
  'calcs-pt': { prefix: 'pt/', locale: 'pt-BR' },
  'calcs-pt-pt': { prefix: 'pt-pt/', locale: 'pt-PT' },
};

// calcs* matchea las 14 colecciones. El prefijo/locale sale del nombre del dir.
const calcModules = import.meta.glob<any>('../../../content/calcs*/*.json', { eager: true });

const bySlug = new Map<string, { calc: any; prefix: string; locale: string }>();
for (const [path, mod] of Object.entries(calcModules)) {
  const data = (mod as any).default || mod;
  const dir = path.match(/content\/(calcs[^/]*)\//)?.[1];
  const col = dir ? COLLECTIONS[dir] : undefined;
  if (!col) continue; // colección desconocida → ignorar
  if (!data || !data.slug || !data.formulaId || !canServeCalc(data, col.prefix)) continue;
  // Slugs únicos entre colecciones; si hubiera drift, gana la primera (orden de glob).
  if (!bySlug.has(data.slug)) bySlug.set(data.slug, { calc: data, prefix: col.prefix, locale: col.locale });
}

export const getStaticPaths: GetStaticPaths = () =>
  [...bySlug.values()].map(({ calc, prefix, locale }) => ({
    params: { slug: calc.slug },
    props: { calc, prefix, locale },
  }));

function unitOf(field: any): string | undefined {
  if (field.suffix) return String(field.suffix).trim();
  // "Peso levantado (kg)" -> "kg"
  const m = typeof field.label === 'string' ? field.label.match(/\(([^)]+)\)\s*$/) : null;
  return m ? m[1] : undefined;
}

function specField(field: any) {
  const out: any = { id: field.id, label: field.label, type: field.type };
  const unit = unitOf(field);
  if (unit) out.unit = unit;
  if (field.required) out.required = true;
  if (field.min !== undefined) out.min = field.min;
  if (field.max !== undefined) out.max = field.max;
  if (field.step !== undefined) out.step = field.step;
  if (field.default !== undefined) out.default = field.default;
  else if (field.placeholder !== undefined) out.example = field.placeholder;
  if (Array.isArray(field.options)) {
    out.options = field.options.map((o: any) =>
      typeof o === 'object' && o ? { value: o.value, label: o.label } : { value: o },
    );
  }
  if (field.help) out.help = field.help;
  return out;
}

export const GET: APIRoute = ({ props }) => {
  const c = (props as any).calc;
  const prefix = (props as any).prefix || '';
  const locale = (props as any).locale || 'es';
  const canonical = `${SITE}/${prefix}${c.slug}`;
  const fields = Array.isArray(c.fields) ? c.fields : [];

  // Ejemplo: tomamos default || placeholder de cada campo que lo tenga.
  const exampleInputs: Record<string, string | number> = {};
  for (const f of fields) {
    const v = f.default ?? f.placeholder;
    if (v !== undefined && v !== null && String(v) !== '') exampleInputs[f.id] = v;
  }
  const qs = Object.entries(exampleInputs)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  // El compute se keyea por slug (único) — sin prefijo de locale.
  const computeBase = `${SITE}/api/calc/${c.slug}/compute`;

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    slug: c.slug,
    url: canonical,
    name: c.h1 || c.title || c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    audience: c.audience || 'AR',
    locale,
    icon: c.icon,
    formulaId: c.formulaId,
    summary: typeof c.keyTakeaway === 'string' ? c.keyTakeaway.replace(/\*\*/g, '') : undefined,
    inputs: fields.map(specField),
    compute: {
      method: 'GET',
      url: computeBase,
      altMethod: 'POST',
      note: 'Pasá los inputs como query params (GET) o JSON body (POST). Agregá ?lang=en|pt para resultados en otro idioma. Respuesta determinística y cacheable.',
      example: qs ? `${computeBase}?${qs}` : computeBase,
    },
    example: Object.keys(exampleInputs).length ? { inputs: exampleInputs } : undefined,
    dataSource: c.dataUpdate
      ? {
          source: c.dataUpdate.source,
          sourceUrl: c.dataUpdate.sourceUrl,
          lastUpdated: c.dataUpdate.lastUpdated,
          frequency: c.dataUpdate.frequency,
        }
      : undefined,
    lastReviewed: c.lastReviewed,
    license: LICENSE,
    attribution: `Hacé Cuentas — ${canonical}`,
    disclaimer:
      'Resultado orientativo con fines educativos. Verificá con fuentes oficiales antes de tomar decisiones.',
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
