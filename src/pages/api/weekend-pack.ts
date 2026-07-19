/**
 * POST /api/weekend-pack
 *
 * Captura el tráfico estacional del Mundial en un segmento evergreen de fin
 * de semana, entrega el pack en el momento y deja al contacto únicamente en la
 * edición de los viernes. Todo corre en D1 + Cloudflare Email Sending.
 */
import type { APIRoute } from 'astro';
import {
  enforceRateLimit,
  getClientIP,
  getD1FromLocals,
  hashIP,
  isValidEmail,
  json,
  parseBody,
  sanitizeText,
  sendHostingEmail,
} from '../../lib/api-utils';

export const prerender = false;

const TOPIC = 'fin-de-semana';
const CONSENT_VERSION = 'weekend-pack-v1';

const PACK_LINKS = [
  {
    emoji: '🥩',
    title: 'Cuánto comprar para el asado',
    text: 'Calculá kilos de carne y cortes según adultos y chicos.',
    slug: 'calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo',
  },
  {
    emoji: '🍻',
    title: 'Bebidas para una juntada',
    text: 'Cerveza, vino y bebidas sin alcohol según invitados y duración.',
    slug: 'calculadora-bebidas-evento-litros-por-persona',
  },
  {
    emoji: '🧾',
    title: 'Dividir gastos entre amigos',
    text: 'Quién pagó qué y cuánto tiene que transferir cada persona.',
    slug: 'calculadora-split-gastos-grupo-amigos',
  },
  {
    emoji: '🚗',
    title: 'Combustible para un viaje',
    text: 'Estimá litros, costo total y gasto por pasajero.',
    slug: 'calculadora-combustible-viaje-auto',
  },
  {
    emoji: '📅',
    title: 'Próximos feriados y findes largos',
    text: 'Calendario 2026 para organizar una escapada o una reunión.',
    slug: 'calculadora-feriados-argentina-2026-calendario',
  },
];

function utm(slug: string): string {
  return `https://hacecuentas.com/${slug}?utm_source=weekend-pack&utm_medium=email&utm_campaign=pack-salvavidas-finde&utm_content=${slug}`;
}

function packEmail(): { subject: string; html: string } {
  const cards = PACK_LINKS.map((item) => `
    <tr><td style="padding:0 0 12px">
      <a href="${utm(item.slug)}" style="display:block;padding:16px 18px;border:1px solid #dbe5f4;border-radius:14px;background:#ffffff;color:#0f172a;text-decoration:none">
        <span style="font-size:22px;vertical-align:middle;margin-right:8px">${item.emoji}</span>
        <strong style="font-size:16px;vertical-align:middle">${item.title}</strong>
        <span style="display:block;margin:7px 0 0 34px;color:#64748b;font-size:14px;line-height:1.45">${item.text}</span>
      </a>
    </td></tr>`).join('');

  return {
    subject: '🎁 Tu Pack salvavidas del finde — Hacé Cuentas',
    html: `<!doctype html>
      <html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;background:#eef3f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
            <tr><td align="center" style="padding:0 0 20px">
              <img src="https://hacecuentas.com/brand-email-v3.png" width="210" alt="Hacé Cuentas" style="display:block;width:210px;height:auto;border:0">
            </td></tr>
            <tr><td style="padding:24px;background:#0b1b3a;border-radius:18px 18px 0 0;color:#ffffff">
              <p style="margin:0 0 6px;color:#93c5fd;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase">Tu regalo</p>
              <h1 style="margin:0 0 8px;font-size:26px;line-height:1.2">Pack salvavidas del finde</h1>
              <p style="margin:0;color:#dbeafe;font-size:15px;line-height:1.55">Cinco cuentas para organizar la juntada, repartir gastos y salir sin sorpresas.</p>
            </td></tr>
            <tr><td style="padding:20px 18px 8px;background:#f8fbff;border-left:1px solid #dbe5f4;border-right:1px solid #dbe5f4">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards}</table>
            </td></tr>
            <tr><td style="padding:18px 22px 22px;background:#f8fbff;border:1px solid #dbe5f4;border-top:0;border-radius:0 0 18px 18px">
              <p style="margin:0 0 8px;color:#334155;font-size:14px;line-height:1.55"><strong>¿Qué sigue?</strong> Cada viernes te mandamos una cuenta útil para el finde. Nada del Mundial, nada de spam.</p>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5">Recibiste este pack porque lo pediste en hacecuentas.com. Cada edición incluye un enlace para darte de baja con un clic.</p>
            </td></tr>
          </table>
        </td></tr></table>
      </body></html>`,
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const limited = await enforceRateLimit(request, 'weekend-pack', 5, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const rawSource = sanitizeText(body.source, 24).toLowerCase();
  const sourcePage = rawSource.replace(/[^a-z0-9-]/g, '') || 'mundial';
  const source = `mundial-finde:${sourcePage}`.slice(0, 40);
  if (!isValidEmail(email)) return json({ error: 'Email inválido' }, { status: 400 });

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const now = Date.now();
  const ref = (request.headers.get('referer') || '').slice(0, 200);
  const ua = (request.headers.get('user-agent') || '').slice(0, 200);
  const country = (request.headers.get('cf-ipcountry') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  const ipHash = hashIP(getClientIP(request));

  try {
    const [sub, interest] = await Promise.all([
      db.prepare('SELECT source, unsubscribed FROM newsletter_subs WHERE email = ?').bind(email).first<{ source?: string; unsubscribed?: number }>(),
      db.prepare('SELECT active FROM newsletter_interests WHERE email = ? AND topic = ?').bind(email, TOPIC).first<{ active?: number }>(),
    ]);

    const statements = [];
    if (!sub) {
      statements.push(db.prepare(
        `INSERT INTO newsletter_subs
         (email, created_at, user_agent, referer, ip_hash, source, confirmed, unsubscribed)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
      ).bind(email, now, ua, ref, ipHash, source));
    } else if (Number(sub.unsubscribed || 0) === 1) {
      // Pedido explícito nuevo: reactiva la suscripción y la deja en el segmento
      // de viernes, sin arrastrarla a las ediciones generales.
      statements.push(db.prepare(
        `UPDATE newsletter_subs
         SET unsubscribed = 0, unsub_at = NULL, source = ?, referer = ?, user_agent = ?, ip_hash = ?
         WHERE email = ?`,
      ).bind(source, ref, ua, ipHash, email));
    }

    statements.push(db.prepare(
      `INSERT INTO newsletter_interests
       (email, topic, created_at, updated_at, source, referer, country, consent_version, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(email, topic) DO UPDATE SET
         updated_at = excluded.updated_at,
         source = excluded.source,
         referer = excluded.referer,
         country = excluded.country,
         consent_version = excluded.consent_version,
         active = 1`,
    ).bind(email, TOPIC, now, now, source, ref, country, CONSENT_VERSION));

    await db.batch(statements);

    // No reenviar el pack en cada submit si ya tenía este interés activo.
    const shouldSend = !interest || Number(interest.active || 0) !== 1;
    let sent = true;
    if (shouldSend) {
      const pack = packEmail();
      sent = await sendHostingEmail({
        from: 'Hacé Cuentas <novedades@hacecuentas.com>',
        to: email,
        subject: pack.subject,
        html: pack.html,
      });
    }

    return json({ ok: true, sent, already: !shouldSend });
  } catch (err) {
    console.error('weekend-pack signup failed:', err);
    return json({ error: 'No se pudo guardar, intentá de nuevo.' }, { status: 500 });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
