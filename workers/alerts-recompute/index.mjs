/**
 * hacecuentas-alerts-recompute — motor de "avisame cuando este resultado cambie".
 *
 * Cada día: por cada alerta activa (tabla result_alerts), reejecuta el cálculo
 * contra el endpoint de compute del sitio con los inputs guardados. Si el valor
 * headline cambió respecto del snapshot (porque se deployó una actualización
 * normativa: escala de Ganancias, ICL, paritaria, monotributo…), manda un mail
 * con el diff concreto y actualiza el snapshot. Si no cambió, no molesta.
 *
 * Worker aparte del sitio (igual que mailing-cron/fx-cron): 100% Cloudflare.
 * Comparte la D1 del sitio (hacecuentas-forms).
 *
 * Endpoints (workers.dev):
 *   GET /                 → status (alertas activas, último run)
 *   GET /?run=TOKEN       → fuerza una pasada YA (sin esperar al cron)
 *   GET /?run=TOKEN&dry=1 → pasada en seco: dice qué cambiaría, NO manda mails
 */

// Token del run manual (?run=TOKEN) — se lee de un secret, NO se hardcodea.
// Setup (una vez):  cd workers/alerts-recompute && npx wrangler secret put ALERTS_RUN_TOKEN
// El cron (scheduled) NO usa el token: si el secret no está seteado, solo se
// deshabilita el disparo manual, la pasada diaria sigue corriendo igual.
/** Comparación en tiempo constante (evita timing oracle sobre el token). */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const fmtNum = (n) => Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });

/** ¿Es número? Para decidir formato y comparación. Texto sin dígitos → null
 * (si no, "B"/"Categoría B" se strippearían a "" → Number("")=0, falso número). */
function asNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (!/\d/.test(s)) return null;
  const n = Number(s.replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Display de un headline: $ con miles si es número, si no el texto tal cual. */
function displayHeadline(v) {
  const n = asNum(v);
  return n !== null ? `$${fmtNum(Math.round(n))}` : String(v);
}

/** ¿Cambió el headline? Numérico: compara redondeado. Texto: string exacto. */
function headlineChanged(oldH, newH) {
  const a = asNum(oldH), b = asNum(newH);
  if (a !== null && b !== null) return Math.round(a) !== Math.round(b);
  return String(oldH ?? '') !== String(newH ?? '');
}

/** Reejecuta un calc en el sitio. POST no se cachea en el edge → siempre fresco. */
async function recompute(siteBase, slug, inputs) {
  const resp = await fetch(`${siteBase}/api/calc/${encodeURIComponent(slug)}/compute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs }),
  });
  if (!resp.ok) return null;
  const data = await resp.json().catch(() => null);
  return data && data.ok ? data.result : null;
}

/** Trae la atribución (qué se actualizó) del spec del calc. Cacheado por run. */
async function fetchAttribution(siteBase, slug, cache) {
  if (cache.has(slug)) return cache.get(slug);
  let attr = null;
  try {
    const resp = await fetch(`${siteBase}/api/calc/${encodeURIComponent(slug)}.json`);
    if (resp.ok) {
      const spec = await resp.json().catch(() => null);
      const du = spec && (spec.dataUpdate || spec.data_update);
      if (du) attr = { source: du.source || '', notes: du.notes || '', lastUpdated: du.lastUpdated || '' };
    }
  } catch { /* sin atribución */ }
  cache.set(slug, attr);
  return attr;
}

function renderEmail({ label, oldH, newH, calcUrl, attr, unsubUrl }) {
  const attrLine = attr && (attr.source || attr.notes)
    ? `<p style="margin:16px 0;padding:12px 14px;background:#f1f5f9;border-radius:8px;font-size:14px;color:#475569">
         La diferencia se explica por una actualización de <strong>${esc(attr.source || 'la normativa')}</strong>${attr.notes ? `. ${esc(attr.notes)}` : '.'}
       </p>`
    : '';
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
    <p style="font-size:13px;color:#64748b;margin:0 0 4px">🔔 Hacé Cuentas — cambió tu resultado</p>
    <h2 style="font-size:20px;margin:0 0 16px">Actualizamos ${esc(label)}</h2>
    <table style="width:100%;border-collapse:collapse;margin:0 0 4px">
      <tr>
        <td style="padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;text-align:center">
          <div style="font-size:12px;color:#64748b">Antes</div>
          <div style="font-size:20px;font-weight:700;color:#94a3b8;text-decoration:line-through">${esc(displayHeadline(oldH))}</div>
        </td>
        <td style="padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:0 10px 10px 0;text-align:center">
          <div style="font-size:12px;color:#2563eb">Ahora</div>
          <div style="font-size:20px;font-weight:700;color:#2563eb">${esc(displayHeadline(newH))}</div>
        </td>
      </tr>
    </table>
    ${attrLine}
    <p style="margin:20px 0"><a href="${esc(calcUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:15px">Volver a calcular →</a></p>
    <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:12px">
      Recibís este aviso porque pediste que te avisemos cuando cambie este resultado.
      <a href="${esc(unsubUrl)}" style="color:#94a3b8">Dar de baja este aviso</a>.
    </p>
  </div>`;
}

async function runPass(env, { dry = false } = {}) {
  const siteBase = (env.SITE_BASE || 'https://hacecuentas.com').replace(/\/+$/, '');
  const from = env.ALERTS_FROM || 'Hacé Cuentas <novedades@hacecuentas.com>';
  const now = Date.now();

  const rows = (await env.DB.prepare(
    `SELECT id, email, slug, inputs, headline_field, headline_label, last_headline, unsub_token
     FROM result_alerts WHERE status = 'active'`,
  ).all()).results || [];

  const attrCache = new Map();
  let checked = 0, changed = 0, sent = 0, failed = 0;
  const changes = [];

  for (const a of rows) {
    checked++;
    let inputs;
    try { inputs = JSON.parse(a.inputs); } catch { continue; }
    const result = await recompute(siteBase, a.slug, inputs);
    if (!result) continue; // calc caído o inputs inválidos → no tocar el snapshot

    const newH = result[a.headline_field];
    const newHStr = newH === undefined || newH === null ? '' : String(newH);

    if (!headlineChanged(a.last_headline, newHStr)) {
      if (!dry) await env.DB.prepare('UPDATE result_alerts SET last_checked_at = ? WHERE id = ?').bind(now, a.id).run();
      continue;
    }

    changed++;
    changes.push({ id: a.id, slug: a.slug, from: a.last_headline, to: newHStr });

    if (dry) continue;

    const attr = await fetchAttribution(siteBase, a.slug, attrCache);
    const calcUrl = `${siteBase}/${a.slug}`;
    const unsubUrl = `${siteBase}/api/alerts/unsubscribe?token=${encodeURIComponent(a.unsub_token)}`;
    const html = renderEmail({
      label: a.headline_label || 'tu resultado', oldH: a.last_headline, newH: newHStr, calcUrl, attr, unsubUrl,
    });

    if (env.EMAIL) {
      try {
        await env.EMAIL.send({ from, to: a.email, subject: `🔔 Cambió ${a.headline_label || 'tu resultado'}`, html });
        sent++;
      } catch (e) {
        failed++;
        const code = e?.message || String(e);
        console.error('[alerts] send fail', a.email, code.slice(0, 160));
        if (/E_DAILY_LIMIT_EXCEEDED/.test(code)) { console.error('[alerts] daily limit — abort'); break; }
        continue; // no actualizamos el snapshot si no se pudo avisar
      }
    }

    // Actualizar snapshot SOLO tras avisar (o si no hay binding, igual avanzamos).
    await env.DB.prepare(
      'UPDATE result_alerts SET last_result = ?, last_headline = ?, last_checked_at = ?, last_changed_at = ? WHERE id = ?',
    ).bind(JSON.stringify(result), newHStr, now, now, a.id).run();
  }

  return { ok: true, checked, changed, sent, failed, dry, changes: changes.slice(0, 50) };
}

async function status(env) {
  const active = (await env.DB.prepare("SELECT COUNT(*) AS n FROM result_alerts WHERE status = 'active'").first())?.n ?? 0;
  const total = (await env.DB.prepare('SELECT COUNT(*) AS n FROM result_alerts').first())?.n ?? 0;
  const lastChanged = (await env.DB.prepare('SELECT MAX(last_changed_at) AS t FROM result_alerts').first())?.t ?? null;
  return { active_alerts: active, total_alerts: total, last_change_at: lastChanged, tiene_email_binding: !!env.EMAIL };
}

export default {
  async scheduled(_event, env, _ctx) {
    try {
      const r = await runPass(env, { dry: false });
      console.log('[alerts] pass', JSON.stringify(r));
    } catch (e) {
      console.error('[alerts] pass error', String(e));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    try {
      const provided = url.searchParams.get('run');
      if (provided && env.ALERTS_RUN_TOKEN && safeEqual(provided, env.ALERTS_RUN_TOKEN)) {
        const r = await runPass(env, { dry: url.searchParams.get('dry') === '1' });
        return new Response(JSON.stringify(r, null, 2), { headers: H });
      }
      return new Response(JSON.stringify({ ok: true, ...(await status(env)) }, null, 2), { headers: H });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: H });
    }
  },
};
