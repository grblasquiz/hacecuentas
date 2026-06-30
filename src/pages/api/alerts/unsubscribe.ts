/**
 * GET /api/alerts/unsubscribe?token=... — baja de una alerta desde el link del
 * mail. Marca la alerta como 'unsubscribed' por su token opaco. Devuelve una
 * página HTML de confirmación.
 */
import type { APIRoute } from 'astro';
import { getEnv, escapeHtml } from '../../../lib/api-utils';

export const prerender = false;

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} — Hacé Cuentas</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:10vh auto;padding:0 1.25rem;color:#1e293b;line-height:1.55}
h1{font-size:1.35rem}a{color:#2563eb}.box{border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem}</style>
</head><body><div class="box"><h1>${escapeHtml(title)}</h1>${body}
<p style="margin-top:1.25rem"><a href="https://hacecuentas.com/">← Volver a Hacé Cuentas</a></p></div></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export const GET: APIRoute = async ({ url }) => {
  const token = (url.searchParams.get('token') || '').trim();
  if (!token) return page('Link inválido', '<p>El link de baja no es válido.</p>', 400);

  const db = getEnv().DB;
  if (!db) return page('Error', '<p>No pudimos procesar la baja. Probá más tarde.</p>', 500);

  const res = await db
    .prepare("UPDATE result_alerts SET status = 'unsubscribed' WHERE unsub_token = ? AND status = 'active'")
    .bind(token)
    .run();
  const changes = (res as any).meta?.changes ?? 0;

  if (!changes) {
    return page('Alerta no encontrada', '<p>Esta alerta ya estaba dada de baja o el link venció.</p>');
  }
  return page(
    'Listo, te diste de baja',
    '<p>No vas a recibir más avisos de cambios para ese resultado. Podés volver a crear la alerta cuando quieras desde la calculadora.</p>',
  );
};
