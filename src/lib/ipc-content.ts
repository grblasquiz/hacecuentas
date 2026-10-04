/** Textos derivados del mismo merge de IPC que usa la calculadora.
 * Compone tasas mensuales publicadas, redondeadas a un decimal: el resultado
 * es aproximado y puede diferir del cociente de índices sin redondear.
 */
export const IPC_CALENDAR_URL = 'https://www.indec.gob.ar/indec/web/Calendario-Fecha-0';
const SOURCE = 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31';
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const num = (n: number, digits = 1) => n.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const money = (n: number) => '$' + num(n, 2);
const label = (key: string) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;

export function ipcContentSeries(base: any, live: any): Record<string, number> {
  const series: Record<string, number> = {};
  for (const row of base.serie ?? []) {
    if (/^\d{4}-\d{2}$/.test(String(row.mes)) && Number.isFinite(Number(row.pct))) series[row.mes] = Number(row.pct);
  }
  for (const row of live.last_12_months ?? []) {
    const key = String(row.fecha).slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(key) && Number.isFinite(Number(row.valor))) series[key] = Number(row.valor);
  }
  return series;
}

/** Intervalo inclusivo, con control de continuidad para no publicar un período incompleto. */
export function ipcContentFactor(series: Record<string, number>, from: string, to: string): number {
  if (to < from) throw new Error(`[sync-ipc] período invertido ${from}–${to}`);
  let factor = 1;
  let key = from;
  while (key <= to) {
    if (!Number.isFinite(series[key])) throw new Error(`[sync-ipc] falta IPC ${key}`);
    factor *= 1 + series[key] / 100;
    const [year, month] = key.split('-').map(Number);
    key = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
  }
  return factor;
}

export function syncIpcContent(input: any, base: any, live: any): any {
  const calc = structuredClone(input);
  const series = ipcContentSeries(base, live);
  const keys = Object.keys(series).sort();
  const latest = keys.at(-1);
  if (!latest) throw new Error('[sync-ipc] no hay meses válidos');
  const year = latest.slice(0, 4);
  const latestMonth = MONTHS[Number(latest.slice(5, 7)) - 1];
  const factor = ipcContentFactor(series, `${year}-01`, latest);
  const ytd = (factor - 1) * 100;
  const yearKeys = keys.filter(k => k.startsWith(year));
  const tableRows = yearKeys.map(k => [cap(MONTHS[Number(k.slice(5, 7)) - 1]), `${num(series[k])}%`, `${num((ipcContentFactor(series, `${year}-01`, k) - 1) * 100)}%`]);
  const monthsSummary = yearKeys.map(k => `${MONTHS[Number(k.slice(5, 7)) - 1]} +${num(series[k])}%`).join(', ');
  const periodNote = 'El mes inicial y el final están incluidos. Los acumulados se aproximan componiendo las tasas mensuales publicadas, redondeadas a un decimal; pueden diferir del cociente de los índices sin redondear.';
  calc.title = `IPC ${latestMonth} ${year}: calculadora de inflación INDEC`;
  calc.answerSnippet = `El IPC del INDEC mide la inflación mensual oficial de Argentina: en ${latestMonth} ${year} fue +${num(series[latest])}%. Componiendo las tasas mensuales redondeadas, la variación enero-${latestMonth} es aproximadamente +${num(ytd)}% (${latestMonth} +${num(series[latest])}%), un factor de ${num(factor, 3)}. Con esta calculadora actualizás cualquier monto entre dos meses y obtenés el valor a hoy, el factor de ajuste y la pérdida real de poder adquisitivo, con datos IPC ${year} al día.`;
  calc.keyTakeaway = `**Fórmula**: Monto × (1 + inflación/100). **Factor ${num(factor, 3)}** (${num(ytd)}% YTD ${year}). **Período inclusivo**: $100 multiplicados por los IPC de enero a ${latestMonth} dan ${money(100 * factor)}. Acumulado aproximado por tasas mensuales redondeadas.`;
  const monthlyTable = (calc.referenceTables ?? []).find((t: any) => String(t.title).startsWith('IPC mes a mes'));
  if (!monthlyTable) throw new Error('[sync-ipc] falta tabla mensual');
  monthlyTable.title = `IPC mes a mes ${year} (Argentina, INDEC)`;
  monthlyTable.caption = `Variación mensual del IPC Nacional y acumulado del año, mes a mes. Último dato publicado: ${latestMonth} ${year} (${num(series[latest])}%).`;
  monthlyTable.headers = [`Mes ${year}`, 'IPC mensual', 'Acumulado del año'];
  monthlyTable.rows = tableRows;

  const historyEnds = Array.from({ length: Number(year) - 2020 }, (_, i) => `${2020 + i}-12`);
  historyEnds.push(latest);
  const history = [
    '## Inflación acumulada — ejemplos desde 2020', '',
    '| Período inclusivo | IPC acumulado aprox. | Factor | $100 × factor |',
    '|---|---|---|---|',
    ...historyEnds.map(end => {
      const f = ipcContentFactor(series, '2020-01', end);
      return `| Enero 2020 – ${cap(label(end))} | ${num((f - 1) * 100, 2)}% | ${num(f, 4)} | ${money(100 * f)} |`;
    }), '', `*${periodNote} Fuente: [IPC Nacional del INDEC](${SOURCE}).*`, '',
  ].join('\n');
  const tableBlock = /## Inflación acumulada — ejemplos[^\n]*\n[\s\S]*?(?=## Índices y coeficientes)/;
  if (!tableBlock.test(calc.explanation ?? '')) throw new Error('[sync-ipc] falta bloque histórico');
  calc.explanation = calc.explanation.replace(tableBlock, history + '\n');

  for (const faq of calc.faq ?? []) {
    const q = String(faq.q ?? '');
    if (q.startsWith('¿Cuál fue el IPC mensual de ')) {
      faq.q = `¿Cuál fue el IPC mensual de ${year}?`;
      faq.a = `**El IPC mensual de Argentina en ${year} (INDEC) fue: ${monthsSummary}**, último dato publicado. El **acumulado enero-${latestMonth} ${year} es ${num(ytd)}%** (componiendo los factores mensuales). Tenés el detalle completo en la tabla **IPC mes a mes ${year}** de esta página.`;
    } else if (q.includes('Dónde veo el IPC mes a mes')) {
      faq.q = `¿Dónde veo el IPC mes a mes ${year}?`;
      faq.a = `**Acá mismo**: la tabla **"IPC mes a mes ${year}"** lista la variación desde enero hasta ${latestMonth} y el acumulado compuesto de **${num(ytd)}%**, con el último dato publicado por el INDEC. La fuente oficial es **[indec.gob.ar](https://www.indec.gob.ar)**, sección IPC.`;
    } else if (q.includes('inflación interanual y la acumulada')) {
      faq.a = `**No son lo mismo**. La inflación interanual compara un mes con el mismo mes del año anterior. La acumulada reúne las variaciones desde una fecha base: enero a ${latestMonth} de ${year} acumula **${num(ytd)}%**. Para períodos personalizados hay que multiplicar los factores mensuales del período exacto.`;
    } else if (q.includes('eligiendo mes de origen')) {
      faq.a = `Sí. Elegí el mes inicial y final entre enero de 2017 y el último dato publicado (${latestMonth} ${year}); la calculadora compone los IPC mensuales oficiales del INDEC. ${periodNote} Para un período todavía no publicado, usá la opción manual únicamente si contás con una fuente verificable.`;
    } else if (q.includes('Cuándo publica el INDEC')) {
      faq.a = `El INDEC publica el IPC según su **[calendario anticipado de difusión](${IPC_CALENDAR_URL})**. Consultá allí la fecha de cada informe; no se presupone un día fijo del mes. El último período disponible en esta calculadora es **${label(latest)}** (+${num(series[latest])}%). Un mes todavía no publicado no se presenta como dato observado.`;
    } else if (q.includes('Cómo actualizar un sueldo o alquiler usando IPC')) {
      const f = ipcContentFactor(series, '2026-02', '2026-04');
      faq.a = `Para comparar el poder de compra de un monto, multiplicalo por el factor acumulado del período elegido. **Ejemplo numérico: febrero–abril de 2026**, con ambos meses incluidos: febrero ${num(series['2026-02'])}%, marzo ${num(series['2026-03'])}% y abril ${num(series['2026-04'])}%. El factor es **${num(f, 9)}**, un acumulado aproximado de **${num((f - 1) * 100, 4)}%**. **$400.000 × ${num(f, 9)} = ${money(400000 * f)}**, que el simulador muestra redondeado a pesos como **$${num(Math.round(400000 * f), 0)}**. Este ejemplo explica la aritmética; para un ajuste contractual verificá el índice, el período y la frecuencia pactados. ${periodNote}`;
    } else if (q.includes('Cómo paso de IPC mensual')) {
      const f = ipcContentFactor(series, '2026-01', '2026-03');
      faq.a = `**Multiplicá los factores mensuales y restá 1 al final**: IPC acumulado = (Π(1 + IPC mensual/100) − 1) × 100. **Enero–marzo de 2026**, ambos incluidos: ${num(series['2026-01'])}%, ${num(series['2026-02'])}% y ${num(series['2026-03'])}%. El producto da un factor de **${num(f, 9)}** y un acumulado aproximado de **${num((f - 1) * 100, 4)}%**. No se suman porcentajes: cada mes se aplica sobre el monto ya actualizado. ${periodNote}`;
    } else if (q.includes('Cuánta plata de hace 5 años') || q.includes('Cómo comparo $100 de enero de 2020')) {
      const f = ipcContentFactor(series, '2020-01', latest);
      faq.q = '¿Cómo comparo $100 de enero de 2020 con el último IPC disponible?';
      faq.a = `Componiendo los IPC de **enero de 2020 a ${label(latest)}**, ambos incluidos, el acumulado aproximado es **${num((f - 1) * 100, 2)}%**, factor **${num(f, 4)}**. **$100 × factor = ${money(100 * f)}**. A la inversa, $100 divididos por ese factor dan **${money(100 / f)}**. ${periodNote} Podés elegir otras ventanas en la calculadora.`;
    } else if (q.includes('inflación acumulada 2018-2026') || q.includes('inflación acumulada desde enero de 2018')) {
      const f = ipcContentFactor(series, '2018-01', latest);
      faq.q = '¿Cuál fue la inflación acumulada desde enero de 2018?';
      faq.a = `Desde **enero de 2018 hasta ${label(latest)}**, ambos incluidos, la composición de tasas mensuales del IPC Nacional da aproximadamente **${num((f - 1) * 100, 2)}%**, factor **${num(f, 4)}**: $100 × factor = **${money(100 * f)}**. ${periodNote} El resultado usa meses publicados; no es una proyección anual ni una comparación con el dólar. Consultá la [serie oficial INDEC](${SOURCE}).`;
    } else if (q.includes('inflación argentina está bajando')) {
      const previous = keys.at(-2)!;
      faq.a = `El último IPC mensual disponible es **${label(latest)}: ${num(series[latest])}%**, frente a **${num(series[previous])}% en ${label(previous)}**. Comparar estos dos meses no permite garantizar una tendencia futura. El acumulado enero–${latestMonth} de ${year} es aproximadamente **${num(ytd)}%**, componiendo tasas mensuales. Esta calculadora no presenta proyecciones privadas como inflación observada; consultá la [serie oficial INDEC](${SOURCE}).`;
    }
  }
  calc.example = {
    title: 'Ejemplo hipotético: $200.000 con una inflación acumulada supuesta del 85%',
    steps: ['Monto inicial supuesto: $200.000.', 'Inflación acumulada supuesta: 85%; no corresponde a un período fechado de la serie INDEC.', 'Factor = 1 + 85/100 = 1,85.', '$200.000 × 1,85 = $370.000.', 'Incremento: $170.000. Pérdida de poder adquisitivo: (1 − 1/1,85) × 100 ≈ 45,9%.'],
    result: 'Con ese supuesto, $370.000 conservan el poder de compra del monto inicial. Para un período real, seleccioná los meses publicados en la calculadora.',
  };
  for (const field of calc.fields ?? []) {
    if (field.id === 'mesHasta' && typeof field.help === 'string') field.help = `Último IPC publicado disponible: ${label(latest)}. Ambos meses elegidos se incluyen.`;
  }
  calc.dataUpdate.lastUpdated = String(live?._meta?.fetchedAt ?? '').slice(0, 10) || calc.dataUpdate.lastUpdated;
  calc.dataUpdate.notes = `Serie histórica: src/data/ipc-indec-serie.json, con meses recientes de src/data/live/inflacion.json. Último período disponible: ${latest}; tablas, snippets y FAQ se derivan automáticamente con scripts/sync-ipc-derived-content.ts. Acumulados aproximados por tasas mensuales redondeadas, extremos incluidos.`;
  return calc;
}
