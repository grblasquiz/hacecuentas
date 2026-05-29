import type { APIRoute, GetStaticPaths } from 'astro';

// ─────────────────────────────────────────────────────────────────────────────
// CALC SPEC API — GET /api/calc/{slug}.json  (estático, prerender)
//
// Ficha machine-readable de una calculadora: qué hace, qué inputs toma, un
// ejemplo listo para llamar, y la URL del endpoint de cómputo en vivo. Pensado
// para que LLMs (Grok, ChatGPT, Claude, Gemini) y agentes descubran, citen y
// sepan exactamente cómo invocar cada calc vía /api/calc/{slug}/compute.
//
// prerender=true: se resuelve en build time -> 1 archivo estático por calc, cero
// costo de Worker. El eager glob de los JSON es seguro acá justamente porque es
// build-time (mismo patrón que search-index.json.ts / api/calcs/index.json.ts).
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = true;

const SITE = 'https://hacecuentas.com';
const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';

const calcModules = import.meta.glob<any>('../../../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules)
  .map((m: any) => m.default || m)
  .filter((c: any) => c && c.slug && c.formulaId && c.noindex !== true);

export const getStaticPaths: GetStaticPaths = () =>
  calcs.map((c: any) => ({ params: { slug: c.slug }, props: { calc: c } }));

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
  const computeBase = `${SITE}/api/calc/${c.slug}/compute`;

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    slug: c.slug,
    url: `${SITE}/${c.slug}`,
    name: c.h1 || c.title || c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    audience: c.audience || 'AR',
    locale: c.locale || 'es',
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
    attribution: `Hacé Cuentas — ${SITE}/${c.slug}`,
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
