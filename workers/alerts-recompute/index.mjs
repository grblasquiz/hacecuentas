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
import { sendPush } from './webpush.mjs';

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
  let hubVersions = null;
  let checked = 0, changed = 0, sent = 0, failed = 0;
  const changes = [];

  for (const a of rows) {
    checked++;
    if (String(a.slug).startsWith('hub:')) {
      if (!hubVersions) {
        try {
          const response = await fetch(`${siteBase}/api/hub-alert-versions.json`, { cache: 'no-store' });
          hubVersions = response.ok ? await response.json() : {};
        } catch { hubVersions = {}; }
      }
      const path = String(a.slug).slice(4);
      const current = hubVersions[path];
      const newVersion = current?.version || '';
      if (!newVersion || newVersion === a.last_headline) {
        if (!dry) await env.DB.prepare('UPDATE result_alerts SET last_checked_at = ? WHERE id = ?').bind(now, a.id).run();
        continue;
      }
      changed++;
      changes.push({ id: a.id, slug: a.slug, from: a.last_headline, to: newVersion });
      if (dry) continue;
      const calcUrl = `${siteBase}${path}?utm_source=alert&utm_medium=email&utm_campaign=hub-update`;
      const unsubUrl = `${siteBase}/api/alerts/unsubscribe?token=${encodeURIComponent(a.unsub_token)}`;
      const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:500px;margin:auto;color:#1e293b">
        <p style="color:#0f766e;font-weight:700">🔔 Hacé Cuentas — actualización</p>
        <h2>Se actualizaron los números de ${esc(a.headline_label || 'esta calculadora')}</h2>
        <p>Cambiaron valores, reglas o datos de referencia. Volvé a calcular para ver el resultado actualizado.</p>
        <p><a href="${esc(calcUrl)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">Ver números actualizados →</a></p>
        <p style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px">Recibís este aviso porque lo activaste en Hacé Cuentas. <a href="${esc(unsubUrl)}" style="color:#64748b">Dar de baja</a>.</p>
      </div>`;
      try {
        if (env.EMAIL) await env.EMAIL.send({
          from, to: a.email, subject: `🔔 Se actualizaron los números de ${a.headline_label || 'tu calculadora'}`, html,
        });
        sent++;
      } catch (e) {
        failed++;
        console.error('[alerts] hub send fail', a.email, String(e).slice(0, 160));
        continue;
      }
      await env.DB.prepare(
        'UPDATE result_alerts SET last_result = ?, last_headline = ?, last_checked_at = ?, last_changed_at = ? WHERE id = ?',
      ).bind(JSON.stringify({ version: newVersion }), newVersion, now, now, a.id).run();
      continue;
    }
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
    // UTM: sin esto GA4 cuenta el click como Direct (o lo pierde) y el canal
    // Email queda invisible — higiene de medición del plan de tráfico directo.
    const calcUrl = `${siteBase}/${a.slug}?utm_source=alert&utm_medium=email&utm_campaign=result-alert&utm_content=${encodeURIComponent(a.slug)}`;
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

// ── Web Push: topics 'valores' (dólar) y 'mundial' (partidos AR / final) ─────
// Corre en los crons intradía además del diario. Sólo notifica cuando hay
// novedad real (umbral de cambio / partido próximo) y nunca repite la misma.

const LIVE_FIXTURE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

async function getTopicState(env, topic) {
  const row = await env.DB.prepare(
    'SELECT last_value, last_sent_at FROM push_topic_state WHERE topic = ?').bind(topic).first();
  let value = null;
  try { value = row?.last_value ? JSON.parse(row.last_value) : null; } catch { /* corrupto → null */ }
  return { value, sentAt: row?.last_sent_at ?? null };
}

async function setTopicState(env, topic, value) {
  await env.DB.prepare(
    `INSERT INTO push_topic_state (topic, last_value, last_sent_at) VALUES (?, ?, ?)
     ON CONFLICT(topic) DO UPDATE SET last_value = excluded.last_value, last_sent_at = excluded.last_sent_at`,
  ).bind(topic, JSON.stringify(value), Date.now()).run();
}

/** Manda `payload` a todas las suscripciones activas del topic. Poda endpoints muertos. */
async function broadcast(env, topic, payload, { ttl = 3 * 3600, collapse } = {}) {
  const rows = (await env.DB.prepare(
    "SELECT id, endpoint, p256dh, auth, topics FROM push_subscriptions WHERE status = 'active'",
  ).all()).results || [];
  const targets = rows.filter((s) => String(s.topics || '').split(',').includes(topic));
  const opts = {
    vapidPublicKey: env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT || 'mailto:novedades@hacecuentas.com',
    ttl,
    topic: collapse, // header Topic: colapsa avisos pendientes del mismo tema
  };
  let sent = 0, gone = 0, failed = 0;
  for (const s of targets) {
    try {
      const r = await sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, opts);
      if (r.ok) {
        sent++;
        await env.DB.prepare('UPDATE push_subscriptions SET last_ok_at = ?, fail_count = 0 WHERE id = ?')
          .bind(Date.now(), s.id).run();
      } else if (r.gone) {
        gone++;
        await env.DB.prepare("UPDATE push_subscriptions SET status = 'gone' WHERE id = ?").bind(s.id).run();
      } else {
        failed++;
        await env.DB.prepare('UPDATE push_subscriptions SET fail_count = fail_count + 1 WHERE id = ?')
          .bind(s.id).run();
      }
    } catch { failed++; }
  }
  return { targets: targets.length, sent, gone, failed };
}

/** Dólar: notifica si oficial o blue (venta) se movieron ≥ $5 desde el último aviso. */
async function checkDolarTopic(env) {
  const resp = await fetch('https://dolarapi.com/v1/dolares', { headers: { accept: 'application/json' } });
  if (!resp.ok) return { skip: `dolarapi ${resp.status}` };
  const arr = await resp.json().catch(() => null);
  if (!Array.isArray(arr)) return { skip: 'respuesta inválida' };
  const venta = (casa) => Math.round(Number(arr.find((d) => d.casa === casa)?.venta) || 0);
  const oficial = venta('oficial'), blue = venta('blue');
  if (!oficial || !blue) return { skip: 'sin cotizaciones' };

  const st = await getTopicState(env, 'dolar');
  const prev = st.value;
  if (!prev) { await setTopicState(env, 'dolar', { oficial, blue }); return { skip: 'baseline inicial' }; }
  const dOf = oficial - prev.oficial, dBl = blue - prev.blue;
  if (Math.abs(dOf) < 5 && Math.abs(dBl) < 5) return { skip: 'sin cambio relevante' };

  const arrow = (d) => (d > 0 ? `subió $${fmtNum(d)}` : `bajó $${fmtNum(-d)}`);
  const lead = Math.abs(dBl) >= Math.abs(dOf)
    ? `Blue $${fmtNum(blue)} (${arrow(dBl)})` : `Oficial $${fmtNum(oficial)} (${arrow(dOf)})`;
  const r = await broadcast(env, 'valores', {
    title: `💵 Dólar hoy: ${lead}`,
    body: `Oficial $${fmtNum(oficial)} · Blue $${fmtNum(blue)}`,
    url: '/dolar-hoy?utm_source=push&utm_medium=push&utm_campaign=valores',
    tag: 'hc-valores',
  }, { ttl: 3 * 3600, collapse: 'hc-valores' });
  await setTopicState(env, 'dolar', { oficial, blue });
  return { oficial, blue, ...r };
}

/** Kickoff a Date UTC (misma lógica que el sitio: sin offset → UTC-6 fallback). */
function kickoffUTC(date, time) {
  if (!date) return null;
  const t = String(time || '00:00').match(/^(\d{1,2}):(\d{2})(?:\s*UTC([+-]\d{1,2}))?/);
  if (!t) return null;
  const off = t[3] !== undefined && t[3] !== null ? Number(t[3]) : -6;
  const sign = off >= 0 ? '+' : '-';
  return new Date(`${date}T${t[1].padStart(2, '0')}:${t[2]}:00${sign}${String(Math.abs(off)).padStart(2, '0')}:00`);
}

/** Mundial: avisa una vez por partido de Argentina (o la final), hasta 4 h antes. */
async function checkMundialTopic(env) {
  if (Date.now() > Date.parse('2026-07-20T12:00:00Z')) return { skip: 'mundial terminado' };
  const resp = await fetch(LIVE_FIXTURE_URL, { headers: { accept: 'application/json' } });
  if (!resp.ok) return { skip: `fixture ${resp.status}` };
  const raw = await resp.json().catch(() => null);
  if (!raw || !Array.isArray(raw.rounds)) return { skip: 'fixture inválido' };

  const st = await getTopicState(env, 'mundial');
  const notified = Array.isArray(st.value?.notified) ? st.value.notified : [];
  const now = Date.now();

  for (const round of raw.rounds) {
    for (const m of round.matches || []) {
      const team1 = typeof m.team1 === 'string' ? m.team1 : m.team1?.name;
      const team2 = typeof m.team2 === 'string' ? m.team2 : m.team2?.name;
      if (!team1 || !team2) continue;
      const isAR = team1 === 'Argentina' || team2 === 'Argentina';
      const isFinal = /^final$/i.test(String(round.name || ''));
      if (!isAR && !isFinal) continue;
      const ko = kickoffUTC(m.date, m.time);
      if (!ko) continue;
      const msTo = ko.getTime() - now;
      if (msTo < 0 || msTo > 4 * 3600 * 1000) continue; // sólo ventana de 4 h pre-partido
      const key = `${m.date}|${team1}|${team2}`;
      if (notified.includes(key)) continue;

      const hhART = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(ko);
      const r = await broadcast(env, 'mundial', {
        title: isAR ? `⚽ Hoy juega Argentina vs ${team2 === 'Argentina' ? team1 : team2}` : `⚽ Hoy es la final del Mundial`,
        body: `${round.name || 'Mundial 2026'} · ${hhART} h (hora argentina)`,
        url: '/fixture-mundial-2026?utm_source=push&utm_medium=push&utm_campaign=mundial',
        tag: 'hc-mundial',
      }, { ttl: 4 * 3600, collapse: 'hc-mundial' });
      await setTopicState(env, 'mundial', { notified: [...notified, key].slice(-10) });
      return { match: key, ...r };
    }
  }
  return { skip: 'sin partido próximo' };
}

/** Pasada de push: barata si no hay suscriptores. Nunca tira — reporta errores. */
async function pushPass(env) {
  if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY) return { skip: 'sin claves VAPID' };
  const n = (await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM push_subscriptions WHERE status = 'active'").first())?.n ?? 0;
  if (!n) return { subs: 0 };
  const out = { subs: n };
  try { out.dolar = await checkDolarTopic(env); } catch (e) { out.dolar = { error: String(e).slice(0, 160) }; }
  try { out.mundial = await checkMundialTopic(env); } catch (e) { out.mundial = { error: String(e).slice(0, 160) }; }
  return out;
}

async function status(env) {
  const active = (await env.DB.prepare("SELECT COUNT(*) AS n FROM result_alerts WHERE status = 'active'").first())?.n ?? 0;
  const total = (await env.DB.prepare('SELECT COUNT(*) AS n FROM result_alerts').first())?.n ?? 0;
  const lastChanged = (await env.DB.prepare('SELECT MAX(last_changed_at) AS t FROM result_alerts').first())?.t ?? null;
  let pushSubs = 0;
  try {
    pushSubs = (await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM push_subscriptions WHERE status = 'active'").first())?.n ?? 0;
  } catch { /* tabla aún no creada */ }
  return {
    active_alerts: active, total_alerts: total, last_change_at: lastChanged,
    tiene_email_binding: !!env.EMAIL, push_subs: pushSubs, tiene_vapid: !!env.VAPID_PRIVATE_KEY,
  };
}

export default {
  async scheduled(event, env, _ctx) {
    // El cron diario (14:30 UTC) corre alertas por email + push; los crons
    // intradía (12/15/18/21 UTC) sólo chequean los topics de push.
    if (event.cron === '30 14 * * *') {
      try {
        const r = await runPass(env, { dry: false });
        console.log('[alerts] pass', JSON.stringify(r));
      } catch (e) {
        console.error('[alerts] pass error', String(e));
      }
    }
    try {
      const p = await pushPass(env);
      console.log('[push] pass', JSON.stringify(p));
    } catch (e) {
      console.error('[push] pass error', String(e));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    try {
      const provided = url.searchParams.get('run');
      if (provided && env.ALERTS_RUN_TOKEN && safeEqual(provided, env.ALERTS_RUN_TOKEN)) {
        if (url.searchParams.get('push') === '1') {
          const p = await pushPass(env);
          return new Response(JSON.stringify(p, null, 2), { headers: H });
        }
        const r = await runPass(env, { dry: url.searchParams.get('dry') === '1' });
        return new Response(JSON.stringify(r, null, 2), { headers: H });
      }
      return new Response(JSON.stringify({ ok: true, ...(await status(env)) }, null, 2), { headers: H });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: H });
    }
  },
};
