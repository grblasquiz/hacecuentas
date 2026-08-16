/**
 * Sincroniza todos los textos temporales de la calculadora IPC desde el mismo
 * snapshot vivo que usan la fórmula y el mockup. Es idempotente: sólo escribe
 * el JSON cuando el contenido derivado realmente cambió.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CALC_FILE = join(ROOT, 'src/content/calcs/inflacion-ipc.json');
const LIVE_FILE = join(ROOT, 'src/data/live/inflacion.json');
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const pct = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const calc = JSON.parse(readFileSync(CALC_FILE, 'utf8'));
const before = JSON.stringify(calc);
const live = JSON.parse(readFileSync(LIVE_FILE, 'utf8'));
const rows = (live.last_12_months ?? [])
  .map((row: any) => ({ key: String(row.fecha).slice(0, 7), value: Number(row.valor) }))
  .filter((row: any) => /^\d{4}-\d{2}$/.test(row.key) && Number.isFinite(row.value))
  .sort((a: any, b: any) => a.key.localeCompare(b.key));

if (!rows.length) throw new Error('[sync-ipc] live/inflacion.json no contiene meses válidos');
const latest = rows.at(-1)!;
const year = latest.key.slice(0, 4);
const yearRows = rows.filter((row: any) => row.key.startsWith(year));
if (!yearRows.length) throw new Error(`[sync-ipc] no hay filas para ${year}`);

let factor = 1;
const tableRows = yearRows.map((row: any) => {
  factor *= 1 + row.value / 100;
  const monthIndex = Number(row.key.slice(5, 7)) - 1;
  return [cap(MONTHS[monthIndex]), `${pct(row.value)}%`, `${pct((factor - 1) * 100)}%`];
});
const ytd = (factor - 1) * 100;
const monthIndex = Number(latest.key.slice(5, 7)) - 1;
const latestMonth = MONTHS[monthIndex];
const monthsSummary = yearRows.map((row: any) => {
  const index = Number(row.key.slice(5, 7)) - 1;
  return `${MONTHS[index]} +${pct(row.value)}%`;
}).join(', ');

calc.answerSnippet = `El IPC del INDEC mide la inflación mensual oficial de Argentina: en ${year} acumula +${pct(ytd)}% de enero a ${latestMonth} (${latestMonth} +${pct(latest.value)}%), un factor de ${factor.toLocaleString('es-AR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}. Con esta calculadora actualizás cualquier monto entre dos meses y obtenés el valor a hoy, el factor de ajuste y la pérdida real de poder adquisitivo, con datos IPC ${year} al día.`;
calc.keyTakeaway = `**Fórmula**: Monto × (1 + inflación/100). **Factor ${factor.toLocaleString('es-AR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}** (${pct(ytd)}% YTD ${year}). **Poder adquisitivo**: $100 de enero equivalen a $${(100 * factor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en ${latestMonth}.`;

const monthlyTable = (calc.referenceTables ?? []).find((table: any) => String(table.title).startsWith('IPC mes a mes'));
if (!monthlyTable) throw new Error('[sync-ipc] falta la tabla mensual de IPC');
monthlyTable.title = `IPC mes a mes ${year} (Argentina, INDEC)`;
monthlyTable.caption = `Variación mensual del IPC Nacional y acumulado del año, mes a mes. Último dato publicado: ${latestMonth} ${year} (${pct(latest.value)}%).`;
monthlyTable.headers = [`Mes ${year}`, 'IPC mensual', 'Acumulado del año'];
monthlyTable.rows = tableRows;

for (const faq of (calc.faq ?? [])) {
  const question = String(faq.q ?? '');
  if (question.includes(`IPC mensual de ${year}`)) {
    faq.a = `**El IPC mensual de Argentina en ${year} (INDEC) fue: ${monthsSummary}**, último dato publicado. El **acumulado enero-${latestMonth} ${year} es ${pct(ytd)}%** (componiendo los factores mensuales). Tenés el detalle completo en la tabla **IPC mes a mes ${year}** de esta página.`;
  } else if (question.includes('Dónde veo el IPC mes a mes')) {
    faq.a = `**Acá mismo**: la tabla **"IPC mes a mes ${year}"** lista la variación desde enero hasta ${latestMonth} y el acumulado compuesto de **${pct(ytd)}%**, con el último dato publicado por el INDEC. La fuente oficial es **[indec.gob.ar](https://www.indec.gob.ar)**, sección IPC.`;
  } else if (question.includes('inflación interanual y la acumulada')) {
    faq.a = `**No son lo mismo**. La inflación interanual compara un mes con el mismo mes del año anterior. La acumulada reúne las variaciones desde una fecha base: enero a ${latestMonth} de ${year} acumula **${pct(ytd)}%**. Para períodos personalizados hay que multiplicar los factores mensuales del período exacto.`;
  } else if (question.includes('eligiendo mes de origen')) {
    faq.a = `Sí. Elegí el mes inicial y final entre enero de 2017 y el último dato publicado (${latestMonth} ${year}); la calculadora compone los IPC mensuales oficiales del INDEC. Para un período todavía no publicado, usá la opción manual únicamente si contás con una fuente verificable.`;
  }
}

calc.dataUpdate.lastUpdated = String(live?._meta?.fetchedAt ?? '').slice(0, 10) || calc.dataUpdate.lastUpdated;
calc.dataUpdate.notes = `Fuente editorial única para valores vigentes: src/data/live/inflacion.json. Último período disponible: ${latest.key}; tablas, snippets y FAQ se derivan automáticamente con scripts/sync-ipc-derived-content.ts.`;

const after = JSON.stringify(calc);
if (after !== before) {
  writeFileSync(CALC_FILE, JSON.stringify(calc, null, 2) + '\n');
  console.log(`[sync-ipc] ✓ textos derivados actualizados a ${latestMonth} ${year} (${pct(ytd)}% YTD)`);
} else {
  console.log(`[sync-ipc] ✓ ya estaba sincronizado a ${latestMonth} ${year}`);
}
