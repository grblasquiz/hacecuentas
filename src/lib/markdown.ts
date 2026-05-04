// Simple markdown parser compartido por todas las [...slug].astro
// Soporta: headings (## ###), bold (**), em (*), inline code (`), fenced code blocks (```),
// tables (| | |), lists (- item), links [text](url), paragraphs, line breaks.

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url: string): string {
  const trimmed = url.trim();
  // Permitir solo http(s), mailto, tel y rutas relativas/absolutas internas
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return escHtml(trimmed);
  if (/^\/[^/]/.test(trimmed) || /^#/.test(trimmed)) return escHtml(trimmed);
  return '#';
}

// Acrónimos/tecnicismos comunes. Cuando aparecen sueltos en texto plano (no
// dentro de un link / code / strong existente), los wrappamos en <abbr title>
// para mejorar a11y (lectores de pantalla expanden la abreviatura) + UX
// (tooltip nativo) + SEO leve (semántica de glossario implícita).
const ABBREVIATIONS: Record<string, string> = {
  TNA: 'Tasa Nominal Anual',
  TEA: 'Tasa Efectiva Anual',
  TEM: 'Tasa Efectiva Mensual',
  CFT: 'Costo Financiero Total',
  IMC: 'Índice de Masa Corporal',
  RCC: 'Relación Cintura-Cadera',
  TDEE: 'Total Daily Energy Expenditure (gasto calórico diario)',
  BMR: 'Basal Metabolic Rate (metabolismo basal)',
  IPC: 'Índice de Precios al Consumidor',
  ICL: 'Índice de Contratos de Locación',
  UVA: 'Unidad de Valor Adquisitivo',
  SAC: 'Sueldo Anual Complementario (aguinaldo)',
  LCT: 'Ley de Contrato de Trabajo (20.744)',
  ANSES: 'Administración Nacional de la Seguridad Social',
  AFIP: 'Administración Federal de Ingresos Públicos',
  ARCA: 'Administración de Recursos del Comercio y Aduanas',
  PAMI: 'Programa de Atención Médica Integral',
  BCRA: 'Banco Central de la República Argentina',
  INDEC: 'Instituto Nacional de Estadística y Censos',
  IRPF: 'Impuesto sobre la Renta de las Personas Físicas',
  ISR: 'Impuesto Sobre la Renta',
  UMA: 'Unidad de Medida y Actualización',
  DCA: 'Dollar Cost Averaging (compra periódica)',
  APY: 'Annual Percentage Yield (rendimiento anual)',
  APR: 'Annual Percentage Rate',
  RPM: 'Revenue Per Mille (mil impresiones)',
  CPM: 'Cost Per Mille (costo por mil impresiones)',
  CPC: 'Cost Per Click',
  CTR: 'Click-Through Rate',
  ROAS: 'Return On Ad Spend',
  LTV: 'Lifetime Value (valor de vida del cliente)',
  CAC: 'Customer Acquisition Cost',
};

const ABBR_RE = new RegExp(`\\b(${Object.keys(ABBREVIATIONS).join('|')})\\b`, 'g');

function applyAbbreviations(text: string): string {
  // Solo aplicar si el segmento NO tiene tags HTML — para evitar inyectar
  // dentro de <a>, <strong>, <code>, etc. ya formados por mdInline.
  return text.replace(ABBR_RE, (m, term) => {
    return `<abbr title="${escHtml(ABBREVIATIONS[term])}">${term}</abbr>`;
  });
}

export function mdInline(text: string): string {
  // Pase 1: tokens markdown a HTML. Cada placeholder reemplaza el rango
  // procesado para evitar que el pase de abreviaturas inyecte <abbr> dentro.
  const tokens: string[] = [];
  const place = (html: string) => {
    const i = tokens.length;
    tokens.push(html);
    return `\x00TOK${i}\x00`;
  };
  const html = text
    .replace(/\*\*(.+?)\*\*/g, (_, c) => place(`<strong>${escHtml(c)}</strong>`))
    .replace(/\*(.+?)\*/g, (_, c) => place(`<em>${escHtml(c)}</em>`))
    .replace(/`([^`\n]+)`/g, (_, c) => place(`<code>${escHtml(c)}</code>`))
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) => place(`<a href="${safeUrl(href)}" rel="noopener">${escHtml(label)}</a>`));

  // Pase 2: aplicar <abbr> solo en texto fuera de los tokens.
  const withAbbrs = applyAbbreviations(html);

  // Pase 3: restaurar tokens.
  return withAbbrs.replace(/\x00TOK(\d+)\x00/g, (_, i) => tokens[Number(i)] || '');
}

export function md(text: string): string {
  // Placeholder-based extraction to avoid regex cross-contamination.
  // Step 1: fenced code blocks (triple backtick) — MUST be first so inline backticks don't
  // eat opening/closing fences and swallow content between separate code blocks.
  const fenceBlocks: string[] = [];
  text = text.replace(/```([\s\S]*?)```/g, (_match, content: string) => {
    const idx = fenceBlocks.length;
    fenceBlocks.push(`<pre><code>${escHtml(content.replace(/^\n/, '').replace(/\n$/, ''))}</code></pre>`);
    return `\x00FENCE${idx}\x00`;
  });

  // Step 2: markdown tables
  text = text.replace(
    /^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*\|.+\|)/gm,
    (_match, headerLine: string, _sep: string, bodyBlock: string) => {
      const hCells = headerLine.slice(1, -1).split('|').map((s: string) => s.trim());
      const rows = bodyBlock.split('\n').filter(Boolean).map((row: string) => {
        const cells = row.slice(1, -1).split('|').map((s: string) => s.trim());
        return '<tr>' + cells.map((c: string) => `<td>${mdInline(c)}</td>`).join('') + '</tr>';
      });
      return '<table><thead><tr>' + hCells.map((c: string) => `<th>${escHtml(c)}</th>`).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }
  );

  // Step 3: block elements
  text = text
    .replace(/^### (.+)$/gm, (_, c) => `<h3>${escHtml(c)}</h3>`)
    .replace(/^## (.+)$/gm, (_, c) => `<h2>${escHtml(c)}</h2>`)
    .replace(/^\- (.+)$/gm, (_, c) => `<li>${mdInline(c)}</li>`);

  // Step 4: inline formatting
  // Dedup glossary links: la 1ra mención queda como <a>, las siguientes como <strong>.
  // Rationale SEO: linkear el mismo término 5 veces a /glosario/X es señal débil
  // post Core Update Abril 2026 (link spam pattern). Mantenemos UX (highlight visual
  // del término) sin spam. Solo aplica a /glosario/* — otras URLs no se afectan.
  const seenGlossary = new Set<string>();
  text = text
    .replace(/\*\*(.+?)\*\*/g, (_, c) => `<strong>${escHtml(c)}</strong>`)
    .replace(/\*(.+?)\*/g, (_, c) => `<em>${escHtml(c)}</em>`)
    .replace(/`([^`\n]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) => {
      const safe = safeUrl(href);
      if (safe.startsWith('/glosario/')) {
        if (seenGlossary.has(safe)) return `<strong>${escHtml(label)}</strong>`;
        seenGlossary.add(safe);
      }
      return `<a href="${safe}" rel="noopener">${escHtml(label)}</a>`;
    });

  // Step 5: paragraphs + breaks
  text = text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Step 6: restore fenced code blocks
  text = text.replace(/\x00FENCE(\d+)\x00/g, (_m, n) => fenceBlocks[Number(n)] || '');

  return text;
}
