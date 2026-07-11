/**
 * hacecuentas-fx-cron — Worker independiente con Cron Trigger.
 *
 * Una vez al día (cron) baja datos FX/indicadores de fuentes públicas y los
 * guarda en la tabla D1 `fx_live` (DB = hacecuentas-forms, la misma del sitio).
 * Las landings SSR /dolar-hoy-{chile,colombia,mexico,peru,uruguay,paraguay,venezuela}
 * leen esa tabla.
 *
 * No depende del build de Astro ni del repo local → corre 100% en Cloudflare,
 * sin procesos en la máquina de nadie. Sortea la divergencia origin↔local
 * (prod se deploya desde local; este cron escribe datos, no rebuildea el sitio).
 *
 * Endpoints (workers.dev):
 *   GET /            → status (qué países y cuándo se actualizaron)
 *   GET /?run=TOKEN  → fuerza un refresh manual (para seed/test)
 */

const MINDICADOR = 'https://mindicador.cl/api';
const SOCRATA = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1';
const ERAPI = 'https://open.er-api.com/v6/latest/USD';
const VE_DOLARAPI = 'https://ve.dolarapi.com/v1/dolares';
const UA = { 'User-Agent': 'hacecuentas-fx-cron/1.0' };

// Token simple para el run manual (no es dato sensible: solo dispara un refetch).
const RUN_TOKEN = 'hc-fx-7Qm2xR';

// Bounds de sanidad — si el valor headline cae fuera, NO se escribe ese país
// (se conserva el último valor bueno). Mismo criterio que validate-data-sanity.
const BOUNDS = {
  'chile.uf': [25000, 90000], 'chile.dolar': [500, 1600], 'chile.utm': [40000, 130000], 'chile.euro': [550, 1800],
  'colombia.trm': [1500, 9000],
  'mexico.usdmxn': [8, 40],
  'peru.usdpen': [2, 7],
  'uruguay.usduyu': [20, 100],
  'paraguay.usdpyg': [3000, 15000],
  'venezuela.bcv': [100, 20000],
};
const ok = (key, v) => {
  const b = BOUNDS[key];
  return typeof v === 'number' && isFinite(v) && (!b || (v >= b[0] && v <= b[1]));
};

async function fetchJson(url) {
  const res = await fetch(url, { headers: UA, cf: { cacheTtl: 0 } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function buildSnapshots(now) {
  const out = {};

  // Chile — mindicador.cl (UF, dólar observado, UTM, euro)
  try {
    const d = await fetchJson(MINDICADOR);
    const uf = d?.uf?.valor, dolar = d?.dolar?.valor, utm = d?.utm?.valor, euro = d?.euro?.valor;
    if (ok('chile.uf', uf) && ok('chile.dolar', dolar)) {
      out.chile = {
        uf: { valor: uf }, dolar: { valor: dolar },
        utm: { valor: ok('chile.utm', utm) ? utm : null },
        euro: { valor: ok('chile.euro', euro) ? euro : null },
        _meta: { source: 'mindicador.cl (Banco Central / SII)', fetchedAt: now },
      };
    }
  } catch (e) { console.error('[chile]', e.message); }

  // Colombia — datos.gov.co (TRM)
  try {
    const rows = await fetchJson(SOCRATA);
    const r = Array.isArray(rows) ? rows[0] || {} : {};
    const trm = Number(r.valor);
    if (ok('colombia.trm', trm)) {
      out.colombia = {
        trm: { valor: trm, vigenciaDesde: r.vigenciadesde ?? null },
        _meta: { source: 'datos.gov.co (Superintendencia Financiera)', fetchedAt: now },
      };
    }
  } catch (e) { console.error('[colombia]', e.message); }

  // México + Perú + Uruguay + Paraguay — open.er-api.com (una sola llamada USD→{MXN,PEN,UYU,PYG,...})
  try {
    const d = await fetchJson(ERAPI);
    const mxn = d?.rates?.MXN, pen = d?.rates?.PEN, uyu = d?.rates?.UYU, pyg = d?.rates?.PYG;
    const eur = d?.rates?.EUR, brl = d?.rates?.BRL, ars = d?.rates?.ARS;
    const r4 = (n) => Math.round(n * 10000) / 10000;
    const r2 = (n) => Math.round(n * 100) / 100;
    if (ok('mexico.usdmxn', mxn)) {
      out.mexico = { usdmxn: { valor: r4(mxn) }, _meta: { source: 'open.er-api.com (mercado USD/MXN)', fetchedAt: now } };
    }
    if (ok('peru.usdpen', pen)) {
      out.peru = { usdpen: { valor: r4(pen) }, _meta: { source: 'open.er-api.com (mercado USD/PEN)', fetchedAt: now } };
    }
    if (ok('uruguay.usduyu', uyu)) {
      // Misma forma que scripts/data-sources/fetch-uruguay.mjs (cross-rates desde base USD)
      out.uruguay = {
        usduyu: { valor: r4(uyu) },
        eurouyu: { valor: eur ? r4(uyu / eur) : null },
        brluyu: { valor: brl ? r4(uyu / brl) : null },
        _meta: { source: 'open.er-api.com (mercado USD/UYU)', fetchedAt: now },
      };
    }
    if (ok('paraguay.usdpyg', pyg)) {
      // Misma forma que scripts/data-sources/fetch-paraguay.mjs
      out.paraguay = {
        usdpyg: { valor: r2(pyg) },
        brlpyg: { valor: brl ? r2(pyg / brl) : null },
        arspyg1000: { valor: ars ? r2((pyg / ars) * 1000) : null },
        _meta: { source: 'open.er-api.com (mercado USD/PYG)', fetchedAt: now },
      };
    }
  } catch (e) { console.error('[mx/pe/uy/py]', e.message); }

  // Venezuela — ve.dolarapi.com (BCV oficial + paralelo). Misma forma que
  // scripts/data-sources/fetch-venezuela.mjs → la landing /dolar-hoy-venezuela
  // lee bcv/paralelo tanto de D1 como del snapshot de build.
  try {
    const rows = await fetchJson(VE_DOLARAPI);
    const pick = (fuente) => (Array.isArray(rows) ? rows.find((r) => r?.fuente === fuente) : null);
    const oficial = pick('oficial');
    const paralelo = pick('paralelo');
    const bcv = Number(oficial?.promedio) || null;
    const par = Number(paralelo?.promedio) || null;
    if (ok('venezuela.bcv', bcv)) {
      out.venezuela = {
        bcv: { valor: bcv, fecha: oficial?.fechaActualizacion?.slice(0, 10) ?? null },
        paralelo: { valor: par, fecha: paralelo?.fechaActualizacion?.slice(0, 10) ?? null },
        _meta: { source: 'BCV (oficial) + Monitor Dólar (paralelo) vía ve.dolarapi.com', fetchedAt: now },
      };
    }
  } catch (e) { console.error('[venezuela]', e.message); }

  return out;
}

async function refresh(env) {
  if (!env.DB) throw new Error('no DB binding');
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS fx_live (pais TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)'
  ).run();

  const now = new Date().toISOString();
  const snaps = await buildSnapshots(now);
  const entries = Object.entries(snaps);
  if (entries.length) {
    const stmts = entries.map(([pais, data]) =>
      env.DB.prepare(
        'INSERT INTO fx_live (pais, data, updated_at) VALUES (?, ?, ?) ' +
        'ON CONFLICT(pais) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
      ).bind(pais, JSON.stringify(data), now)
    );
    await env.DB.batch(stmts);
  }
  return { updated: entries.map(([p]) => p), at: now };
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refresh(env).then((r) => console.log('[fx-cron] scheduled', JSON.stringify(r))));
  },
  async fetch(req, env) {
    const url = new URL(req.url);
    const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    try {
      if (url.searchParams.get('run') === RUN_TOKEN) {
        const r = await refresh(env);
        return new Response(JSON.stringify({ ok: true, ...r }), { headers });
      }
      const rows = await env.DB.prepare('SELECT pais, updated_at FROM fx_live ORDER BY pais').all();
      return new Response(JSON.stringify({ ok: true, rows: rows.results || [] }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers });
    }
  },
};
