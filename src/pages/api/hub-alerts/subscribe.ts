import type { APIRoute } from 'astro';
import versions from '../../../lib/alerts/hub-versions.json';
import {
  enforceRateLimit, escapeHtml, getEnv, isValidEmail, json, parseBody, sanitizeText, sendHostingEmail,
} from '../../../lib/api-utils';
import { generateSessionToken, getSessionUser, sha256Hex } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const limited = await enforceRateLimit(request, 'hub-alerts-subscribe', 12, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const path = sanitizeText(body.path, 190);
  const cfg = (versions as Record<string, { version: string; title: string }>)[path];
  if (!cfg || !/^\/[a-z0-9\-\/]+$/.test(path)) {
    return json({ error: 'Este hub todavía no admite avisos.' }, { status: 400 });
  }

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  const email = (user?.email || sanitizeText(body.email, 254)).toLowerCase();
  if (!isValidEmail(email)) return json({ error: 'Ingresá un email válido.' }, { status: 400 });

  const slug = `hub:${path}`;
  const sig = await sha256Hex(`${email}|${slug}`);
  const token = generateSessionToken();
  const now = Date.now();
  await db.prepare(
    `INSERT INTO result_alerts
       (email,user_id,slug,inputs,headline_field,headline_label,last_result,last_headline,sig,unsub_token,created_at,last_checked_at,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'active')
     ON CONFLICT(sig) DO UPDATE SET
       user_id=COALESCE(excluded.user_id,result_alerts.user_id),
       last_result=excluded.last_result,last_headline=excluded.last_headline,
       last_checked_at=excluded.last_checked_at,status='active'`,
  ).bind(
    email, user?.id ?? null, slug, '{}', '__hub_version', cfg.title,
    JSON.stringify({ version: cfg.version }), cfg.version, sig, token, now, now,
  ).run();

  const from = getEnv().RESULT_EMAIL_FROM || 'resultados@hacecuentas.com';
  const url = `https://hacecuentas.com${path}`;
  const sent = await sendHostingEmail({
    from: `Hacé Cuentas <${from}>`,
    to: email,
    subject: `🔔 Avisos activados para ${cfg.title}`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:auto;color:#1e293b">
      <p style="color:#0f766e;font-weight:700">🔔 Aviso activado</p>
      <h2>Te avisaremos cuando se actualicen los números</h2>
      <p>Quedaste suscripto a <strong>${escapeHtml(cfg.title)}</strong>. Si cambian sus valores, reglas o datos de referencia, te enviaremos un mail para que vuelvas a calcular.</p>
      <p><a href="${url}" style="display:inline-block;background:#0f766e;color:white;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:700">Volver al hub →</a></p>
    </div>`,
  });

  return json({ ok: true, sent, authed: !!user });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
