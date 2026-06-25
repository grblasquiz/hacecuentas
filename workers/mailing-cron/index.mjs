/**
 * hacecuentas-mailing-cron — newsletter 2×/semana de calculadoras.
 *
 * Cron (martes y jueves 13:00 UTC = 10:00 ART): manda a los suscriptores un mail
 * con 2 calculadoras NO repetidas antes (anti-join contra mailing_log) y su
 * explicación corta. Comparte la D1 del sitio (hacecuentas-forms).
 *
 * Worker aparte del sitio (igual que fx-cron): corre 100% en Cloudflare, no
 * depende del build de Astro ni del repo local.
 *
 * Tablas: mailing_pool (pool curado, seedeado por scripts/build-mailing-pool.mjs),
 *         mailing_log (qué se mandó), newsletter_subs (destinatarios + baja).
 *
 * Endpoints (workers.dev):
 *   GET /                          → status (pool, enviadas, restantes, suscriptores)
 *   GET /?preview=1                → HTML del próximo envío (NO manda, no consume pool)
 *   GET /?run=TOKEN&test=mail@x    → manda una PRUEBA solo a esa dirección (no loguea)
 *   GET /?run=TOKEN                → fuerza una edición real YA (go-live / catch-up)
 *   GET /unsubscribe?e=..&t=..     → baja (verifica HMAC, setea unsubscribed=1)
 */

const RUN_TOKEN = 'hc-mail-9Kp4wZ';            // dispara run manual; no es dato sensible
const TEST_SOURCES = ['smoketest', 'post-ci']; // direcciones de test que NUNCA reciben

// ── utilidades ─────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** "Calculadora de Aguinaldo (SAC)" → "Aguinaldo (SAC)" para asunto/encabezado. */
function shortName(title) {
  return String(title || '')
    .replace(/^(Calculadora|Conversor|Simulador)\s+(de\s+|del\s+)?/i, '')
    .trim() || title;
}

/** HMAC-SHA256(secret, msg) en hex (truncado a 32) — token del link de baja. */
async function hmacToken(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function unsubUrl(base, email, token) {
  return `${base.replace(/\/+$/, '')}/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`;
}

// ── selección de calcs ──────────────────────────────────────────────────────
/**
 * Elige n calcs: primero las NO enviadas (por rank), y si el pool se agotó,
 * completa con las menos-recientemente enviadas. Nunca repite hasta agotar.
 */
async function pickCalcs(env, n = 2) {
  const fresh = await env.DB.prepare(
    `SELECT slug, title, answer_snippet, category, icon, url FROM mailing_pool
     WHERE slug NOT IN (SELECT slug FROM mailing_log)
     ORDER BY rank ASC LIMIT ?`,
  ).bind(n).all();
  const picked = fresh.results || [];
  if (picked.length >= n) return picked;

  // Pool agotado: reciclar las más viejas que no estén ya elegidas.
  const have = picked.map((c) => c.slug);
  const placeholders = have.map(() => '?').join(',') || "''";
  const recycled = await env.DB.prepare(
    `SELECT p.slug, p.title, p.answer_snippet, p.category, p.icon, p.url
     FROM mailing_pool p
     JOIN (SELECT slug, MAX(edition_at) me FROM mailing_log GROUP BY slug) l ON l.slug = p.slug
     WHERE p.slug NOT IN (${placeholders})
     ORDER BY l.me ASC LIMIT ?`,
  ).bind(...have, n - picked.length).all();
  return picked.concat(recycled.results || []);
}

async function getRecipients(env) {
  const rows = await env.DB.prepare(
    `SELECT email FROM newsletter_subs
     WHERE (unsubscribed IS NULL OR unsubscribed = 0)
       AND source NOT IN ('${TEST_SOURCES.join("','")}')
       AND email LIKE '%_@_%_.__%'
     ORDER BY created_at ASC`,
  ).all();
  return (rows.results || []).map((r) => r.email);
}

// ── plantilla del email ─────────────────────────────────────────────────────
const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Color del ícono/chip por categoría (fondo claro + texto del mismo tono).
const CAT = {
  finanzas: { c: '#dbeafe', t: '#1e40af' }, salud: { c: '#ccfbf1', t: '#0f766e' },
  vida: { c: '#ede9fe', t: '#5b21b6' }, construccion: { c: '#fef3c7', t: '#92400e' },
  automotor: { c: '#e0e7ff', t: '#3730a3' }, viajes: { c: '#cffafe', t: '#155e75' },
  deportes: { c: '#dcfce7', t: '#15803d' }, cocina: { c: '#ffedd5', t: '#9a3412' },
  mascotas: { c: '#fce7f3', t: '#9d174d' }, tecnologia: { c: '#e0e7ff', t: '#3730a3' },
  educacion: { c: '#fef9c3', t: '#854d0e' }, impuestos: { c: '#ede9fe', t: '#5b21b6' },
};
const catColor = (k) => CAT[k] || { c: '#dbeafe', t: '#1e40af' };

function calcCard(c) {
  const col = catColor(c.category);
  const name = esc(shortName(c.title));
  const icon = c.icon || '🧮';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#ffffff;border:1px solid #e8edf3;border-radius:14px;">
    <tr><td style="padding:20px 20px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="52" valign="top" style="width:52px;">
          <div style="width:46px;height:46px;line-height:46px;text-align:center;font-size:24px;background:${col.c};border-radius:12px;">${icon}</div>
        </td>
        <td valign="top" style="padding-left:14px;">
          <span style="display:inline-block;font:600 11px ${FONT};letter-spacing:.04em;text-transform:uppercase;color:${col.t};background:${col.c};padding:3px 9px;border-radius:6px;">${esc(c.category)}</span>
          <h2 style="margin:8px 0 0;font:700 17px ${FONT};line-height:1.35;color:#0f172a;">
            <a href="${esc(c.url)}" style="color:#0f172a;text-decoration:none;">${name}</a>
          </h2>
        </td>
      </tr></table>
      <p style="margin:12px 0 16px;font:400 14px/1.6 ${FONT};color:#475569;">${esc(c.answer_snippet)}</p>
      <a href="${esc(c.url)}" style="display:inline-block;background:#2563eb;color:#ffffff;font:600 14px ${FONT};text-decoration:none;padding:11px 20px;border-radius:9px;">Abrir calculadora →</a>
    </td></tr>
  </table>`;
}

function renderEmail(calcs, unsubLink) {
  const cards = calcs.map(calcCard).join('');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>Hacé Cuentas</title></head>
<body style="margin:0;padding:0;background:#eef2f7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Dos calculadoras para arrancar la semana.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;">
 <tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
   <tr><td style="background:#2563eb;border-radius:16px 16px 0 0;padding:22px 28px;">
     <table role="presentation" width="100%"><tr>
       <td style="font:700 21px ${FONT};color:#ffffff;">🧮 Hacé Cuentas</td>
       <td align="right" style="font:500 13px ${FONT};color:#bfdbfe;">Boletín de calculadoras</td>
     </tr></table>
   </td></tr>
   <tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:26px 26px 20px;">
     <p style="margin:0 0 4px;font:700 18px ${FONT};color:#0f172a;">Dos calculadoras para vos 👇</p>
     <p style="margin:0 0 22px;font:400 15px ${FONT};color:#64748b;">Elegidas entre las más usadas esta semana.</p>
     ${cards}
     <table role="presentation" width="100%"><tr><td align="center" style="padding:10px 0 2px;">
       <a href="https://hacecuentas.com" style="font:600 14px ${FONT};color:#2563eb;text-decoration:none;">Ver las 4.000+ calculadoras →</a>
     </td></tr></table>
   </td></tr>
   <tr><td style="padding:18px 28px 4px;">
     <p style="margin:0 0 6px;font:400 12px/1.6 ${FONT};color:#94a3b8;">Recibís esto porque dejaste tu mail en hacecuentas.com · Calculadoras gratis, sin registro · Argentina.</p>
     <p style="margin:0;font:400 12px ${FONT};color:#94a3b8;"><a href="${esc(unsubLink)}" style="color:#64748b;text-decoration:underline;">Darme de baja</a></p>
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>`;
}

// ── envío vía Cloudflare Email Service (binding env.EMAIL) ───────────────────
// 1 mensaje por destinatario (cada uno con su link de baja). 100% Cloudflare,
// sin terceros. Devuelve {sent, failed}.
async function sendAll(env, recipients, { from, subject, calcs, unsubBase, secret }) {
  let sent = 0, failed = 0;
  for (const email of recipients) {
    try {
      const link = unsubUrl(unsubBase, email, await hmacToken(secret, email));
      // Solo HTML (sin parte text/plain): Cloudflare ordenaba el multipart de
      // forma que Gmail mostraba el texto plano y se perdía el diseño.
      await env.EMAIL.send({
        from,
        to: email,
        subject,
        html: renderEmail(calcs, link),
      });
      sent++;
    } catch (e) {
      failed++;
      const code = e?.message || String(e);
      console.error('[mailing] send fail', email, code.slice(0, 140));
      // Límite diario: no tiene sentido seguir martillando.
      if (/E_DAILY_LIMIT_EXCEEDED/.test(code)) { console.error('[mailing] daily limit — abort'); break; }
    }
  }
  return { sent, failed };
}

// ── edición: arma y manda (o devuelve dryRun) ───────────────────────────────
async function runEdition(env, { dryRun = false, testTo = null } = {}) {
  const from = env.MAILING_FROM || 'Hacé Cuentas <novedades@hacecuentas.com>';
  const unsubBase = env.UNSUB_BASE || 'https://hacecuentas-mailing-cron.workers.dev';
  const secret = env.UNSUB_SECRET || RUN_TOKEN;

  const calcs = await pickCalcs(env, 2);
  if (calcs.length < 2) return { ok: false, reason: 'pool vacío', calcs: calcs.length };

  const a = shortName(calcs[0].title), b = shortName(calcs[1].title);
  const subject = `🧮 ${a} y ${b}`;

  // Preview puro: devolver HTML sin mandar nada.
  if (dryRun) {
    const link = unsubUrl(unsubBase, 'vos@ejemplo.com', await hmacToken(secret, 'vos@ejemplo.com'));
    return { ok: true, dryRun: true, subject, html: renderEmail(calcs, link), calcs: calcs.map((c) => c.slug) };
  }

  if (!env.EMAIL) return { ok: false, reason: 'falta binding EMAIL (Cloudflare Email Service no onboardeado)' };

  // Destinatarios: prueba (1) o lista real.
  const recipients = testTo ? [testTo] : await getRecipients(env);
  if (!recipients.length) return { ok: false, reason: 'sin destinatarios' };

  const { sent, failed } = await sendAll(env, recipients, { from, subject, calcs, unsubBase, secret });

  // Las pruebas NO se loguean ni consumen el pool.
  if (!testTo) {
    const now = Date.now();
    await env.DB.batch(calcs.map((c) => env.DB.prepare(
      `INSERT INTO mailing_log (slug, edition_at, recipients, resend_ok) VALUES (?, ?, ?, ?)`,
    ).bind(c.slug, now, sent, failed === 0 ? 1 : 0)));
  }

  return { ok: sent > 0, test: !!testTo, subject, enviados: sent, fallidos: failed, calcs: calcs.map((c) => c.slug) };
}

// ── handler de baja ─────────────────────────────────────────────────────────
async function handleUnsubscribe(env, url) {
  const email = (url.searchParams.get('e') || '').toLowerCase();
  const token = url.searchParams.get('t') || '';
  const secret = env.UNSUB_SECRET || RUN_TOKEN;
  const page = (title, msg) => new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
     <body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f1f5f9;margin:0;padding:48px 16px;text-align:center;color:#0f172a;">
       <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
         <div style="font-size:22px;font-weight:800;color:#2563eb;margin-bottom:16px;">Hacé Cuentas</div>
         <p style="font-size:16px;line-height:1.6;color:#334155;">${msg}</p>
         <a href="https://hacecuentas.com" style="color:#2563eb;font-size:14px;">Ir al sitio</a>
       </div></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } });

  if (!email || !token) return page('Baja', 'Link de baja inválido.');
  const expected = await hmacToken(secret, email);
  if (token !== expected) return page('Baja', 'Link de baja inválido o vencido.');

  await env.DB.prepare(
    `UPDATE newsletter_subs SET unsubscribed = 1, unsub_at = ? WHERE email = ?`,
  ).bind(Date.now(), email).run();
  return page('Listo', `Listo, diste de baja a <strong>${esc(email)}</strong>. No vas a recibir más estos mails. 👋`);
}

// ── status ──────────────────────────────────────────────────────────────────
async function status(env) {
  const pool = await env.DB.prepare('SELECT COUNT(*) n FROM mailing_pool').first();
  const sent = await env.DB.prepare('SELECT COUNT(DISTINCT slug) n FROM mailing_log').first();
  const subs = await env.DB.prepare(
    `SELECT COUNT(*) n FROM newsletter_subs WHERE (unsubscribed IS NULL OR unsubscribed = 0)
       AND source NOT IN ('${TEST_SOURCES.join("','")}') AND email LIKE '%_@_%_.__%'`,
  ).first();
  const last = await env.DB.prepare('SELECT MAX(edition_at) t FROM mailing_log').first();
  return {
    pool_size: pool?.n ?? 0,
    enviadas: sent?.n ?? 0,
    restantes_sin_repetir: Math.max(0, (pool?.n ?? 0) - (sent?.n ?? 0)),
    suscriptores_activos: subs?.n ?? 0,
    ultima_edicion: last?.t ? new Date(last.t).toISOString() : null,
    tiene_email_binding: !!env.EMAIL,
  };
}

// ── entrypoints ─────────────────────────────────────────────────────────────
export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil((async () => {
      if (!env.EMAIL) { console.log('[mailing] sin binding EMAIL — skip'); return; }
      // Anti doble-disparo: si hubo edición en las últimas 12h, no repetir.
      const last = await env.DB.prepare('SELECT MAX(edition_at) t FROM mailing_log').first();
      if (last?.t && Date.now() - last.t < 12 * 3600 * 1000) {
        console.log('[mailing] edición reciente (<12h) — skip'); return;
      }
      const r = await runEdition(env, {});
      console.log('[mailing] scheduled', JSON.stringify(r));
    })());
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    try {
      if (url.pathname === '/unsubscribe') return handleUnsubscribe(env, url);

      if (url.searchParams.get('preview') === '1') {
        const r = await runEdition(env, { dryRun: true });
        if (!r.ok) return new Response(JSON.stringify(r), { status: 409, headers: H });
        return new Response(r.html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
      }

      if (url.searchParams.get('run') === RUN_TOKEN) {
        const testTo = url.searchParams.get('test');
        const r = await runEdition(env, { testTo: testTo || null });
        return new Response(JSON.stringify(r), { status: r.ok ? 200 : 409, headers: H });
      }

      return new Response(JSON.stringify({ ok: true, ...(await status(env)) }, null, 2), { headers: H });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: H });
    }
  },
};
