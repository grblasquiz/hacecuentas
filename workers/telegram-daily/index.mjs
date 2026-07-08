/**
 * hacecuentas-telegram-daily — canal de Telegram "valores hoy".
 *
 * Cada día hábil (14:00 UTC = 11:00 ART) postea al canal las cotizaciones del
 * dólar con la variación contra el último posteo, y el link al sitio. Cada
 * mensaje es una visita directa potencial (plan de tráfico directo 7-08).
 *
 * Patrón worker-cron (como fx-cron/alerts-recompute): 100% Cloudflare, lee
 * DolarAPI y guarda el último estado en push_topic_state (D1 del sitio) para
 * calcular deltas.
 *
 * Setup (una vez, requiere el bot creado en @BotFather y admin del canal):
 *   cd workers/telegram-daily
 *   npx wrangler secret put TELEGRAM_BOT_TOKEN --config ./wrangler.toml
 *   npx wrangler secret put RUN_TOKEN --config ./wrangler.toml   (disparo manual)
 *   → ajustar TELEGRAM_CHAT_ID en wrangler.toml (@canal o id numérico)
 *
 * Endpoints (workers.dev):
 *   GET /            → status
 *   GET /?run=TOKEN  → postea YA (para probar)
 */

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const fmt = (n) => '$' + Math.round(n).toLocaleString('es-AR');

function delta(now, prev) {
  if (!prev || !Number.isFinite(prev)) return '';
  const d = Math.round(now) - Math.round(prev);
  if (d === 0) return ' (=)';
  return d > 0 ? ` (+$${d.toLocaleString('es-AR')})` : ` (−$${Math.abs(d).toLocaleString('es-AR')})`;
}

async function getState(env) {
  try {
    const row = await env.DB.prepare(
      "SELECT last_value FROM push_topic_state WHERE topic = 'telegram-dolar'").first();
    return row?.last_value ? JSON.parse(row.last_value) : null;
  } catch { return null; }
}

async function setState(env, value) {
  await env.DB.prepare(
    `INSERT INTO push_topic_state (topic, last_value, last_sent_at) VALUES ('telegram-dolar', ?, ?)
     ON CONFLICT(topic) DO UPDATE SET last_value = excluded.last_value, last_sent_at = excluded.last_sent_at`,
  ).bind(JSON.stringify(value), Date.now()).run();
}

async function buildMessage(env) {
  const resp = await fetch('https://dolarapi.com/v1/dolares', { headers: { accept: 'application/json' } });
  if (!resp.ok) throw new Error(`dolarapi ${resp.status}`);
  const arr = await resp.json();
  const by = {};
  for (const q of arr) by[q.casa] = q;
  const v = (casa) => Number(by[casa]?.venta) || 0;
  if (!v('oficial') || !v('blue')) throw new Error('sin cotizaciones');

  const prev = (await getState(env)) || {};
  const hoy = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());
  const brecha = Math.round((v('blue') / v('oficial') - 1) * 1000) / 10;

  const lines = [
    `💵 <b>Dólar hoy</b> — ${hoy}`,
    '',
    `Blue: <b>${fmt(v('blue'))}</b>${delta(v('blue'), prev.blue)}`,
    `Oficial: <b>${fmt(v('oficial'))}</b>${delta(v('oficial'), prev.oficial)}`,
  ];
  if (v('bolsa')) lines.push(`MEP: <b>${fmt(v('bolsa'))}</b>${delta(v('bolsa'), prev.mep)}`);
  if (v('contadoconliqui')) lines.push(`CCL: <b>${fmt(v('contadoconliqui'))}</b>${delta(v('contadoconliqui'), prev.ccl)}`);
  if (v('tarjeta')) lines.push(`Tarjeta: <b>${fmt(v('tarjeta'))}</b>`);
  lines.push(`Brecha blue/oficial: <b>${String(brecha).replace('.', ',')}%</b>`);
  lines.push('');
  lines.push('📊 Cotizaciones en vivo, UVA, ICL y tasas → https://hacecuentas.com/valores-bcra?utm_source=telegram&utm_medium=social&utm_campaign=valores-diarios');

  const state = { blue: v('blue'), oficial: v('oficial'), mep: v('bolsa'), ccl: v('contadoconliqui') };
  return { text: lines.join('\n'), state };
}

async function postDaily(env) {
  if (!env.TELEGRAM_BOT_TOKEN) return { skip: 'sin TELEGRAM_BOT_TOKEN (pendiente BotFather)' };
  if (!env.TELEGRAM_CHAT_ID) return { skip: 'sin TELEGRAM_CHAT_ID' };
  const { text, state } = await buildMessage(env);
  const resp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) return { ok: false, status: resp.status, error: data.description || 'telegram error' };
  await setState(env, state);
  return { ok: true, message_id: data.result?.message_id };
}

export default {
  async scheduled(_event, env, _ctx) {
    try {
      const r = await postDaily(env);
      console.log('[telegram] daily', JSON.stringify(r));
    } catch (e) {
      console.error('[telegram] error', String(e));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    try {
      const provided = url.searchParams.get('run');
      if (provided && env.RUN_TOKEN && safeEqual(provided, env.RUN_TOKEN)) {
        const r = await postDaily(env);
        return new Response(JSON.stringify(r, null, 2), { headers: H });
      }
      return new Response(JSON.stringify({
        ok: true,
        configurado: !!env.TELEGRAM_BOT_TOKEN && !!env.TELEGRAM_CHAT_ID,
        chat: env.TELEGRAM_CHAT_ID || null,
      }, null, 2), { headers: H });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: H });
    }
  },
};
