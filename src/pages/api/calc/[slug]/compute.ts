import type { APIRoute } from 'astro';
import calcIndex from '../../../../lib/calc-compute-index.json';

// ─────────────────────────────────────────────────────────────────────────────
// LIVE COMPUTE API — GET/POST /api/calc/{slug}/compute
//
// Ejecuta la fórmula de un calc en el server (Worker CF) y devuelve el resultado
// en JSON. Pensado para tool use / function calling de LLMs (Grok, ChatGPT,
// Claude, Gemini) y para agentes/devs.
//
// CRÍTICO — tamaño del Worker:
//   * NO importamos formulas/index.ts (eager = 3408 fórmulas en el bundle).
//   * NO globeamos los JSON de calcs (eager = ~21 MiB → revienta el límite).
//   * Importamos calc-compute-index.json (slim, ~176 KB gzip) para mapear
//     slug -> formulaId + tipos de campo, y lazy-globeamos las fórmulas (1 chunk
//     por archivo, cargado on-demand). Mismo patrón que Calculator.astro:2512.
//
// Determinístico para inputs dados -> cache duro por URL (edge de CF lo cachea
// por query string). Esto lo hace barato y resistente a abuso.
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

const SITE = 'https://hacecuentas.com';
const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';

// Lazy: 1 chunk por fórmula, NO bundlea las 3408 en el entry del Worker.
const formulaLoaders = import.meta.glob<any>('../../../../lib/formulas/*.ts');
const formulaCache = new Map<string, Function>();

const index = calcIndex as Record<
  string,
  {
    f: string;
    h?: string;
    cat?: string;
    aud?: string;
    loc?: string;
    fields: Array<{ id: string; t: string; fmt?: string; r?: 1; def?: string }>;
  }
>;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS,
      ...extraHeaders,
    },
  });
}

async function loadFormula(formulaId: string): Promise<Function | null> {
  if (formulaCache.has(formulaId)) return formulaCache.get(formulaId)!;
  const loader = formulaLoaders[`../../../../lib/formulas/${formulaId}.ts`];
  if (!loader) return null;
  const mod: any = await loader();
  // Misma heurística que el cliente: primer export de tipo function.
  const fnKey = Object.keys(mod).find((k) => typeof mod[k] === 'function');
  if (!fnKey) return null;
  formulaCache.set(formulaId, mod[fnKey]);
  return mod[fnKey];
}

// Coercion: espejo de getFormFieldValue / runWhatIfNow de Calculator.astro.
function coerce(field: { t: string; fmt?: string }, raw: unknown): string | number | boolean {
  const s = String(raw);
  if (field.t === 'number') {
    if (field.fmt === 'thousands') {
      // es-AR: "." miles, "," decimal.
      const n = Number(s.replace(/\./g, '').replace(/,/g, '.'));
      return isNaN(n) ? s : n;
    }
    const n = Number(s);
    return s !== '' && !isNaN(n) ? n : s;
  }
  if (field.t === 'boolean') {
    return s === 'true' || s === '1' || s === 'on' || s === 'yes';
  }
  // select | radio | date | datetime-local | text | textarea → string
  return s;
}

// Saca claves internas (_chart, _path, etc.) que solo usa el front.
function cleanOutput(out: any): any {
  if (out == null || typeof out !== 'object') return out;
  const clean: Record<string, any> = {};
  for (const k of Object.keys(out)) {
    if (k.startsWith('_')) continue;
    clean[k] = out[k];
  }
  return clean;
}

async function handle(slug: string, provided: Record<string, unknown>, lang: string): Promise<Response> {
  const entry = index[slug];
  if (!entry) {
    return json(
      {
        ok: false,
        error: 'calc_not_found',
        message: `No existe una calculadora con slug "${slug}". Mirá el catálogo en ${SITE}/api/calcs-index.json`,
        slug,
      },
      404,
      { 'Cache-Control': 'public, max-age=3600' },
    );
  }

  // Armar inputs según el schema de campos.
  const inputs: Record<string, string | number | boolean> = {};
  const missing: string[] = [];
  for (const field of entry.fields) {
    const got = provided[field.id];
    const hasValue = got !== undefined && got !== null && String(got) !== '';
    if (hasValue) {
      inputs[field.id] = coerce(field, got);
    } else if (field.r) {
      missing.push(field.id);
    } else if (field.def !== undefined) {
      // Campo opcional sin valor: usamos el default declarado (igual que el front
      // que cae al placeholder). Así llamadas parciales siguen funcionando.
      inputs[field.id] = coerce(field, field.def);
    }
  }

  if (missing.length) {
    return json(
      {
        ok: false,
        error: 'missing_required_fields',
        message: `Faltan campos obligatorios: ${missing.join(', ')}.`,
        missingFields: missing,
        requiredFields: entry.fields.filter((f) => f.r).map((f) => f.id),
        spec: `${SITE}/api/calc/${slug}.json`,
      },
      400,
      { 'Cache-Control': 'public, max-age=3600' },
    );
  }

  // Las fórmulas leen el idioma vía i.__lang (las que no, lo ignoran).
  (inputs as any).__lang = lang;

  const fn = await loadFormula(entry.f);
  if (!fn) {
    return json(
      { ok: false, error: 'formula_unavailable', message: 'La fórmula no está disponible.', slug, formulaId: entry.f },
      501,
    );
  }

  let result: any;
  try {
    result = fn(inputs);
  } catch (err: any) {
    // Las fórmulas tiran mensajes amigables en español (ej. "Ingresá un peso válido").
    return json(
      {
        ok: false,
        error: 'computation_error',
        message: err?.message || 'No se pudo calcular con esos valores.',
        slug,
        inputs: stripLang(inputs),
      },
      422,
      { 'Cache-Control': 'no-store' },
    );
  }

  return json(
    {
      ok: true,
      slug,
      formulaId: entry.f,
      h1: entry.h,
      category: entry.cat,
      audience: entry.aud,
      locale: lang,
      inputs: stripLang(inputs),
      result: cleanOutput(result),
      meta: {
        calculator: `${SITE}/${slug}`,
        spec: `${SITE}/api/calc/${slug}.json`,
        source: 'Hacé Cuentas',
        license: LICENSE,
        attribution: `Hacé Cuentas — ${SITE}/${slug}`,
        disclaimer:
          'Resultado orientativo con fines educativos. Verificá con fuentes oficiales antes de tomar decisiones.',
        computedAt: new Date().toISOString(),
      },
    },
    200,
    // Determinístico por inputs → cache largo en edge (mismo URL = misma respuesta).
    { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  );
}

function stripLang(inputs: Record<string, any>): Record<string, any> {
  const { __lang, ...rest } = inputs;
  return rest;
}

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug || '';
  const provided: Record<string, unknown> = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === 'lang') continue;
    provided[k] = v;
  }
  const lang = url.searchParams.get('lang') || 'es';
  return handle(slug, provided, lang);
};

export const POST: APIRoute = async ({ params, request, url }) => {
  const slug = params.slug || '';
  let provided: Record<string, unknown> = {};
  let lang = url.searchParams.get('lang') || 'es';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body: any = await request.json();
      if (body && typeof body === 'object') {
        if (typeof body.lang === 'string') lang = body.lang;
        const src = body.inputs && typeof body.inputs === 'object' ? body.inputs : body;
        for (const [k, v] of Object.entries(src)) {
          if (k === 'lang' || k === 'inputs') continue;
          provided[k] = v;
        }
      }
    } else {
      const form = await request.formData();
      for (const [k, v] of form.entries()) {
        if (k === 'lang') {
          lang = String(v);
          continue;
        }
        provided[k] = v;
      }
    }
  } catch {
    return json({ ok: false, error: 'invalid_body', message: 'El body no es JSON válido.' }, 400);
  }
  return handle(slug, provided, lang);
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
