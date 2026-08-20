/**
 * Materializa el contrato keyword + intención para cada URL indexable del
 * último render auditado. No consulta APIs ni inventa volumen: usa el title
 * canónico como target estable y marca dónde el H1 necesita refuerzo visible.
 *
 * Input:  reports/seo-audit.csv (salida de npm run seo:audit)
 * Output: reports/seo-target-map.{csv,json}
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolveSearchTarget, keywordAlignment } from '../src/lib/search-target.ts';

const ROOT = process.cwd();
const INPUT = `${ROOT}/reports/seo-audit.csv`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function decodeHtml(value: string): string {
  return String(value || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

const parsed = parseCsv(readFileSync(INPUT, 'utf8'));
const headers = parsed.shift() || [];
const sourceRows = parsed.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])));

const targets = sourceRows
  .filter((row) => row.indexable === 'true' && row.status_code === '200')
  .map((row) => {
    const path = new URL(row.url).pathname;
    const pageType = /\/(?:calculadora|simulador|conversor)/.test(path) ? 'calculator'
      : path.startsWith('/blog/') ? 'guide'
      : undefined;
    const title = decodeHtml(row.title);
    const h1 = decodeHtml(row.h1);
    const metaDescription = decodeHtml(row.meta_description);
    const target = resolveSearchTarget({ path, title, description: metaDescription, pageType });
    const h1Alignment = keywordAlignment(target.primaryKeyword, h1);
    const descriptionAlignment = keywordAlignment(target.primaryKeyword, metaDescription);
    return {
      url: row.url,
      primary_keyword: target.primaryKeyword,
      search_intent: target.searchIntent,
      title,
      h1,
      meta_description: metaDescription,
      h1_alignment: Number(h1Alignment.toFixed(2)),
      description_alignment: Number(descriptionAlignment.toFixed(2)),
      on_page_action: h1Alignment === 0 && target.searchIntent !== 'navegacional' ? 'refuerzo-visible-automatico' : 'alineado',
      target_source: 'title-canonico',
    };
  })
  .sort((a, b) => a.url.localeCompare(b.url));

const summary = {
  generatedAt: new Date().toISOString(),
  source: 'reports/seo-audit.csv',
  totalIndexableUrls: targets.length,
  intents: Object.fromEntries([...new Set(targets.map((row) => row.search_intent))].sort().map((intent) => [intent, targets.filter((row) => row.search_intent === intent).length])),
  h1Aligned: targets.filter((row) => row.on_page_action === 'alineado').length,
  h1Reinforced: targets.filter((row) => row.on_page_action === 'refuerzo-visible-automatico').length,
  methodology: 'Una keyword primaria por URL derivada del title canónico; intención clasificada por tipo de tarea. Sin datos query→URL confiables, no se atribuye volumen.',
};

writeFileSync(`${ROOT}/reports/seo-target-map.json`, `${JSON.stringify({ summary, targets }, null, 2)}\n`);
const columns = Object.keys(targets[0] || {});
writeFileSync(`${ROOT}/reports/seo-target-map.csv`, [columns.join(','), ...targets.map((row) => columns.map((column) => csvCell((row as any)[column])).join(','))].join('\n') + '\n');
console.log(`[seo-targets] URLs=${targets.length} alineadas=${summary.h1Aligned} refuerzo=${summary.h1Reinforced}`);
