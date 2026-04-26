/**
 * POST /api/vitals
 * Body: { url, metric, value, rating, id?, navigationType?, country? }
 *
 * Endpoint para Core Web Vitals (LCP, INP, CLS, FCP, TTFB).
 * Cliente envía via navigator.sendBeacon (best-effort, no espera respuesta).
 * Sample rate ya viene aplicado del cliente (25%).
 *
 * Guarda en D1 tabla web_vitals para análisis P75 propio + envía espejo a
 * GA4 desde el cliente vía gtag('event', 'web_vital', {...}).
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getD1FromLocals } from '../../lib/api-utils';

export const prerender = false;

const VALID_METRICS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']);
const VALID_RATINGS = new Set(['good', 'needs-improvement', 'poor']);

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    // sendBeacon manda como text/plain o application/json segun el cliente.
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json') || ct.includes('text/plain')) {
      const txt = await request.text();
      body = txt ? (JSON.parse(txt) as Record<string, unknown>) : {};
    } else {
      const fd = await request.formData();
      body = {};
      fd.forEach((v, k) => { body[k] = v; });
    }
  } catch {
    return json({ error: 'Body inválido' }, { status: 400 });
  }

  const metric = sanitizeText(body.metric, 10).toUpperCase();
  const rating = sanitizeText(body.rating, 20).toLowerCase();
  const url = sanitizeText(body.url, 500);
  const value = typeof body.value === 'number' ? body.value : Number(body.value);

  if (!VALID_METRICS.has(metric)) {
    return json({ error: 'metric inválido' }, { status: 400 });
  }
  if (!Number.isFinite(value) || value < 0 || value > 600000) {
    return json({ error: 'value inválido' }, { status: 400 });
  }
  if (rating && !VALID_RATINGS.has(rating)) {
    return json({ error: 'rating inválido' }, { status: 400 });
  }

  const db = getD1FromLocals();
  if (!db) {
    // No bloqueamos al cliente — vitals es best-effort.
    return json({ ok: true, stored: false });
  }

  // Country desde header de Cloudflare (sin tocar IP del usuario).
  const country = (request.headers.get('cf-ipcountry') || '').slice(0, 2).toUpperCase() || null;

  try {
    await db.prepare(
      `INSERT INTO web_vitals (url, metric, value, rating, country, ts)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(url, metric, value, rating || null, country, Date.now()).run();
    return json({ ok: true, stored: true });
  } catch (err) {
    console.error('vitals insert failed:', err);
    // 200 igual: el cliente no debería reintentar (es best-effort).
    return json({ ok: true, stored: false });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
