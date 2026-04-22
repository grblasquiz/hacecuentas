/**
 * GET /admin?k=<passcode>
 *
 * Panel admin con tablas de newsletter subs, votos agregados, error reports.
 * Auth: passcode en env var ADMIN_PASSCODE (setear en CF Pages → Settings →
 * Environment Variables → Encrypted).
 */
import { Env } from './_utils';

function fmtDate(ts: number): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(ts); }
}

function escapeHtml(s: string): string {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const providedKey = url.searchParams.get('k') || '';
  const expectedKey = context.env.ADMIN_PASSCODE || '';
  const authorized = expectedKey && providedKey === expectedKey;

  const baseHead = `<!doctype html><html lang="es"><head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Admin — Hacé Cuentas</title>
<style>
body{font-family:system-ui,sans-serif;margin:2rem auto;max-width:1100px;padding:0 1rem;color:#1a202c;}
h1{font-size:1.25rem;margin-bottom:1.5rem;}
h2{font-size:1rem;margin:2rem 0 .75rem;padding-bottom:.25rem;border-bottom:1px solid #e2e8f0;}
table{width:100%;border-collapse:collapse;font-size:.8125rem;margin-bottom:1rem;}
th,td{text-align:left;padding:.5rem .625rem;border-bottom:1px solid #edf2f7;vertical-align:top;}
th{background:#f7fafc;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;}
.muted{color:#718096;font-size:.75rem;}
.err{background:#fff5f5;color:#c53030;padding:.75rem 1rem;border-radius:4px;border-left:3px solid #c53030;margin:1rem 0;font-size:.875rem;}
.empty{color:#a0aec0;font-style:italic;padding:1rem .625rem;}
.unauth{text-align:center;padding:4rem 1rem;color:#718096;}
code{background:#f7fafc;padding:.125rem .375rem;border-radius:3px;font-size:.875rem;}
.stat{display:inline-block;padding:.125rem .5rem;border-radius:999px;font-size:.75rem;font-weight:600;}
.stat-up{background:#c6f6d5;color:#22543d;}
.stat-down{background:#fed7d7;color:#742a2a;}
.status-new{background:#fef3c7;color:#92400e;padding:.125rem .5rem;border-radius:999px;font-size:.6875rem;font-weight:600;}
.slug{color:#3182ce;text-decoration:none;}
.slug:hover{text-decoration:underline;}
.message-cell{max-width:400px;word-wrap:break-word;}
</style></head><body>`;

  const baseEnd = '</body></html>';

  if (!authorized) {
    const html = baseHead + `
<div class="unauth">
  <h1>Admin — Hacé Cuentas</h1>
  <p>Acceso restringido. Pasá la key en el query string: <code>/admin?k=TU_PASSCODE</code></p>
  ${expectedKey ? '' : '<p class="muted">(ADMIN_PASSCODE no está seteado en CF Pages env)</p>'}
</div>` + baseEnd;
    return new Response(html, {
      status: 401,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  if (!context.env.DB) {
    return new Response(baseHead + '<div class="err">D1 binding no configurado.</div>' + baseEnd, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  let subsHtml = '';
  let votesHtml = '';
  let errorsHtml = '';
  let dbError = '';

  try {
    const subs = await context.env.DB
      .prepare('SELECT email, created_at, source, referer FROM newsletter_subs ORDER BY created_at DESC LIMIT 100')
      .all();
    const subsRows = (subs.results as any[]) || [];
    if (subsRows.length === 0) {
      subsHtml = '<div class="empty">Sin suscripciones todavía.</div>';
    } else {
      subsHtml = '<table><thead><tr><th>Email</th><th>Fecha</th><th>Origen</th><th>Desde</th></tr></thead><tbody>';
      for (const s of subsRows) {
        const fromPath = s.referer ? (() => { try { return new URL(s.referer).pathname; } catch { return '—'; } })() : '—';
        subsHtml += `<tr><td><code>${escapeHtml(s.email)}</code></td><td class="muted">${fmtDate(s.created_at)}</td><td class="muted">${escapeHtml(s.source || '')}</td><td class="muted">${escapeHtml(fromPath)}</td></tr>`;
      }
      subsHtml += '</tbody></table>';
    }

    const votes = await context.env.DB
      .prepare('SELECT slug, upvotes, downvotes, total, last_vote_at FROM calc_votes_summary ORDER BY total DESC LIMIT 50')
      .all();
    const voteRows = (votes.results as any[]) || [];
    if (voteRows.length === 0) {
      votesHtml = '<div class="empty">Sin votos todavía.</div>';
    } else {
      votesHtml = '<table><thead><tr><th>Calculadora</th><th>👍</th><th>👎</th><th>Total</th><th>% pos</th><th>Último</th></tr></thead><tbody>';
      for (const v of voteRows) {
        const pct = v.total ? Math.round((v.upvotes / v.total) * 100) : 0;
        votesHtml += `<tr><td><a class="slug" href="${escapeHtml(v.slug)}" target="_blank">${escapeHtml(v.slug)}</a></td><td><span class="stat stat-up">${v.upvotes}</span></td><td><span class="stat stat-down">${v.downvotes}</span></td><td>${v.total}</td><td>${pct}%</td><td class="muted">${fmtDate(v.last_vote_at)}</td></tr>`;
      }
      votesHtml += '</tbody></table>';
    }

    const errs = await context.env.DB
      .prepare('SELECT id, slug, message, email, created_at, status FROM error_reports ORDER BY created_at DESC LIMIT 100')
      .all();
    const errRows = (errs.results as any[]) || [];
    if (errRows.length === 0) {
      errorsHtml = '<div class="empty">Sin reportes todavía.</div>';
    } else {
      errorsHtml = '<table><thead><tr><th>Calc</th><th>Mensaje</th><th>Email</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>';
      for (const e of errRows) {
        errorsHtml += `<tr><td><a class="slug" href="${escapeHtml(e.slug)}" target="_blank">${escapeHtml(e.slug)}</a></td><td class="message-cell">${escapeHtml(e.message)}</td><td class="muted">${escapeHtml(e.email || '—')}</td><td class="muted">${fmtDate(e.created_at)}</td><td><span class="status-new">${escapeHtml(e.status)}</span></td></tr>`;
      }
      errorsHtml += '</tbody></table>';
    }
  } catch (err: any) {
    dbError = String(err?.message || err);
  }

  const html = baseHead +
    '<h1>Panel Admin · Hacé Cuentas</h1>' +
    (dbError ? `<div class="err"><strong>Error DB:</strong> ${escapeHtml(dbError)}</div>` : '') +
    '<h2>📧 Newsletter subs (últimas 100)</h2>' + subsHtml +
    '<h2>👍👎 Votos por calculadora (top 50)</h2>' + votesHtml +
    '<h2>🐛 Reportes de error/mejora (últimos 100)</h2>' + errorsHtml +
    baseEnd;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex,nofollow',
    },
  });
};
