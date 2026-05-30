import type { APIRoute } from 'astro';
import { runCompute, buildMeta } from '../../../../lib/calc-compute';

// ─────────────────────────────────────────────────────────────────────────────
// LIVE COMPUTE API — GET/POST /api/calc/{slug}/compute
//
// Ejecuta la fórmula de un calc en el server (Worker CF) y devuelve el resultado
// en JSON. Para tool use / function calling de LLMs (Grok, ChatGPT, Claude,
// Gemini) y agentes/devs. La lógica vive en src/lib/calc-compute.ts (compartida
// con el servidor MCP). Determinístico → cache duro por URL.
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...extra },
  });
}

async function respond(slug: string, provided: Record<string, unknown>, lang?: string) {
  const r = await runCompute(slug, provided, lang);
  if (!r.ok) {
    const cache = r.status === 422 ? 'no-store' : 'public, max-age=3600';
    return json(
      {
        ok: false,
        error: r.error,
        message: r.message,
        slug,
        ...(r.missingFields ? { missingFields: r.missingFields, requiredFields: r.requiredFields } : {}),
        ...(r.status !== 404 ? { spec: `https://hacecuentas.com/api/calc/${slug}.json` } : {}),
      },
      r.status,
      { 'Cache-Control': cache },
    );
  }
  return json(
    {
      ok: true,
      slug: r.slug,
      formulaId: r.formulaId,
      h1: r.h1,
      category: r.category,
      audience: r.audience,
      locale: r.locale,
      inputs: r.inputs,
      result: r.result,
      meta: buildMeta(r.slug, new Date().toISOString()),
    },
    200,
    // Determinístico por inputs → cache largo en edge (mismo URL = misma respuesta).
    { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  );
}

export const GET: APIRoute = ({ params, url }) => {
  const provided: Record<string, unknown> = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === 'lang') continue;
    provided[k] = v;
  }
  return respond(params.slug || '', provided, url.searchParams.get('lang') || undefined);
};

export const POST: APIRoute = async ({ params, request, url }) => {
  const provided: Record<string, unknown> = {};
  let lang: string | undefined = url.searchParams.get('lang') || undefined;
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
  return respond(params.slug || '', provided, lang);
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
