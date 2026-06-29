/**
 * POST /api/auth/request-code
 * Body: { email }
 *
 * Genera un código OTP de 6 dígitos, guarda su HASH (no el plano) con expiry
 * y lo manda al mail vía Resend. Si no hay RESEND_API_KEY (dev), NO envía y
 * devuelve el código en la respuesta para poder testear el flujo localmente.
 */
import type { APIRoute } from 'astro';
import {
  json, isValidEmail, sanitizeText, parseBody, getEnv, escapeHtml,
} from '../../../lib/api-utils';
import { generateCode, sha256Hex, CODE_TTL_MS, RESEND_COOLDOWN_MS } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  if (!isValidEmail(email)) return json({ error: 'Email inválido' }, { status: 400 });

  const env = getEnv();
  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const now = Date.now();

  // Anti-spam: si ya mandamos un código hace menos del cooldown, no reenviar.
  const recent = await db
    .prepare('SELECT created_at FROM auth_codes WHERE email = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1')
    .bind(email)
    .first<{ created_at: number }>();
  if (recent && now - recent.created_at < RESEND_COOLDOWN_MS) {
    return json({ error: 'Ya te mandamos un código recién. Esperá unos segundos.' }, { status: 429 });
  }

  const code = generateCode();
  const codeHash = await sha256Hex(code);

  // Invalida códigos previos del mismo mail y guarda el nuevo.
  await db.prepare('DELETE FROM auth_codes WHERE email = ?').bind(email).run();
  await db
    .prepare('INSERT INTO auth_codes (email, code_hash, created_at, expires_at, attempts, consumed) VALUES (?, ?, ?, ?, 0, 0)')
    .bind(email, codeHash, now, now + CODE_TTL_MS)
    .run();

  // Envío vía Cloudflare Email Sending (binding EMAIL) — mismo mecanismo que el
  // newsletter (workers/mailing-cron), 100% Cloudflare, sin terceros. En dev
  // (astro dev) devolvemos el código para testear sin mandar mail real; en prod
  // import.meta.env.DEV es false y se envía de verdad.
  if (import.meta.env.DEV || !env.EMAIL) {
    console.log(`[auth] OTP para ${email}: ${code} (dev fallback)`);
    return json({ ok: true, dev: true, devCode: code });
  }

  const from = env.AUTH_EMAIL_FROM || 'Hacé Cuentas <cuenta@hacecuentas.com>';
  try {
    await env.EMAIL.send({
      from,
      to: email,
      subject: `${code} es tu código para Hacé Cuentas`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto">
        <h2 style="color:#1e293b">Tu código de acceso</h2>
        <p>Usá este código para entrar a <strong>Mi Hacé Cuentas</strong>:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#2563eb;margin:24px 0">${escapeHtml(code)}</p>
        <p style="color:#64748b;font-size:14px">Vence en 10 minutos. Si no fuiste vos, ignorá este mail.</p>
      </div>`,
    });
  } catch (e) {
    console.error('[auth] email send fail:', String((e as Error)?.message || e).slice(0, 160));
    return json({ error: 'No pudimos enviar el código, probá de nuevo.' }, { status: 502 });
  }

  return json({ ok: true });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
