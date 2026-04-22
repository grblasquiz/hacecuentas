/**
 * POST /api/error-report
 * Guarda un reporte de error/mejora sobre una calculadora.
 *
 * Body: { slug: string, message: string, email?: string }
 */
import type { APIRoute } from 'astro';
import {
  getD1, getClientIP, hashIP, json, sanitizeText, isValidEmail,
} from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  let body: Record<string, unknown> = {};
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Body inválido' }, { status: 400 });
  }

  const slug = sanitizeText(body.slug, 200);
  const message = sanitizeText(body.message, 2000);
  const email = sanitizeText(body.email, 254).toLowerCase();

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (!message || message.length < 5) {
    return json({ error: 'Contanos un poco más qué está mal (mín 5 caracteres).' }, { status: 400 });
  }
  // Email es opcional; si viene, validamos.
  if (email && !isValidEmail(email)) {
    return json({ error: 'Email inválido (dejalo vacío si no querés dar mail).' }, { status: 400 });
  }

  const db = getD1(context);
  const ipH = hashIP(getClientIP(context.request));
  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await db
      .prepare(
        `INSERT INTO error_reports
         (slug, message, email, created_at, user_agent, ip_hash)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(slug, message, email || null, Date.now(), ua, ipH)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('error-report insert failed:', err);
    return json({ error: 'No se pudo enviar el reporte, intentá en un rato.' }, { status: 500 });
  }
};
