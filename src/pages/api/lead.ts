/**
 * POST /api/lead
 * Body: { slug: string, name: string, phone: string, result?: string, offer_id?: string }
 *
 * Recibe leads del mini-form de las ofertas kind:'lead' (src/lib/offers.ts,
 * vertical legal). Guarda en D1 (tabla legal_leads) y, si está configurada
 * RESEND_API_KEY, reenvía por email a Martin (mismo patrón que feedback.ts).
 *
 * Diseño:
 *   - `result` es el valor primario que calculó el usuario (ej. el monto de
 *     la indemnización) — contexto que vale oro para el partner legal.
 *   - Validación estricta de phone: el lead sin teléfono contactable no vale.
 *   - ip_hash (FNV-1a, sin IP real) para poder detectar spam/dedupe.
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals, getEnv, escapeHtml, isValidCalcSlug, sendResendEmail } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  // Validar SIEMPRE sobre el valor CRUDO, antes de truncar: si truncamos
  // primero, un teléfono de 30 chars pasa amputado a 25 → lead incobrable.
  const rawName = String(body.name || '').trim();
  const rawPhone = String(body.phone || '').trim();

  const slug = sanitizeText(body.slug, 200);
  // Misma regex estricta que email-result: el slug se interpola en el href
  // del email de notificación.
  if (!isValidCalcSlug(slug)) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (rawName.length < 2 || rawName.length > 80) {
    return json({ error: 'Nombre inválido (2 a 80 caracteres)' }, { status: 400 });
  }
  // Teléfono: empieza con + o dígito, después 5-24 de dígitos/espacios/guión/
  // paréntesis (total 6-25 chars).
  if (!/^[+\d][\d\s\-()]{5,24}$/.test(rawPhone)) {
    return json({ error: 'Teléfono inválido (6 a 25 caracteres, números/+/espacios)' }, { status: 400 });
  }

  const name = sanitizeText(rawName, 80);
  const phone = sanitizeText(rawPhone, 25);
  const result = sanitizeText(body.result, 120);
  const offerId = sanitizeText(body.offer_id, 60);

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ipH = hashIP(getClientIP(request));
  const ua = (request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await db.prepare(
      `INSERT INTO legal_leads (slug, name, phone, result, offer_id, created_at, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(slug, name, phone, result, offerId, Date.now(), ua, ipH).run();
  } catch (err) {
    console.error('lead insert failed:', err);
    return json({ error: 'No se pudo guardar el lead.' }, { status: 500 });
  }

  // Email forward via Resend (best-effort, no rompe el flow si falla)
  // Configurar secret: npx wrangler secret put RESEND_API_KEY
  const env = getEnv() as any;
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.FEEDBACK_EMAIL_TO || 'rodriguezb.martin@gmail.com';
  const fromEmail = env.FEEDBACK_EMAIL_FROM || 'feedback@hacecuentas.com';

  if (apiKey) {
    const subject = `⚖️ Lead legal en ${slug}`;
    const htmlBody = `
        <h2>Nuevo lead legal en hacecuentas.com</h2>
        <p><strong>Calc:</strong> <a href="https://hacecuentas.com${escapeHtml(slug)}">${escapeHtml(slug)}</a></p>
        <p><strong>Oferta:</strong> ${escapeHtml(offerId || '—')}</p>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Resultado calculado:</strong> ${escapeHtml(result || '—')}</p>
        <hr>
        <p style="color: #888; font-size: 0.85em;">
          User agent: ${escapeHtml(ua)}<br>
          Recibido: ${new Date().toISOString()}
        </p>
      `;

    // Notificación pura: la respuesta al user NO depende del email.
    // sendResendEmail nunca tira, así que es seguro despacharla en background.
    // Astro v6 + @astrojs/cloudflare expone el ExecutionContext del Worker en
    // locals.cfContext (locals.runtime.ctx fue REMOVIDO y su getter tira).
    const sendPromise = sendResendEmail({
      apiKey,
      from: `Hacé Cuentas Leads <${fromEmail}>`,
      to: [toEmail],
      subject,
      html: htmlBody,
    });
    const cfCtx = (locals as any)?.cfContext as ExecutionContext | undefined;
    if (cfCtx && typeof cfCtx.waitUntil === 'function') {
      cfCtx.waitUntil(sendPromise);
    } else {
      // Sin ExecutionContext (ej. dev local): mantener el await.
      await sendPromise;
    }
  }

  return json({ ok: true });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
