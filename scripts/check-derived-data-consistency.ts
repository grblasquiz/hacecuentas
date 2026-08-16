/** Gate de integridad para contenido derivado de snapshots vivos. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const calc = JSON.parse(readFileSync(join(root, 'src/content/calcs/inflacion-ipc.json'), 'utf8'));
const live = JSON.parse(readFileSync(join(root, 'src/data/live/inflacion.json'), 'utf8'));
const rows = (live.last_12_months ?? []).filter((row: any) => /^\d{4}-\d{2}/.test(String(row.fecha)));
const latest = rows.at(-1);
if (!latest) throw new Error('[derived-integrity] IPC sin snapshot mensual');

const key = String(latest.fecha).slice(0, 7);
const [year, monthRaw] = key.split('-');
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const month = months[Number(monthRaw) - 1];
const yearRows = rows.filter((row: any) => String(row.fecha).startsWith(year));
const ytd = (yearRows.reduce((factor: number, row: any) => factor * (1 + Number(row.valor) / 100), 1) - 1) * 100;
const expectedYtd = ytd.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const serialized = JSON.stringify({
  answerSnippet: calc.answerSnippet,
  keyTakeaway: calc.keyTakeaway,
  referenceTables: calc.referenceTables,
  faq: calc.faq,
});
const failures: string[] = [];
if (!serialized.toLowerCase().includes(`${month} ${year}`)) failures.push(`falta último período ${month} ${year}`);
if (!serialized.includes(`${expectedYtd}%`)) failures.push(`falta acumulado compuesto ${expectedYtd}%`);
const table = (calc.referenceTables ?? []).find((item: any) => String(item.title).startsWith('IPC mes a mes'));
if (!table || table.rows?.length !== yearRows.length) failures.push(`tabla mensual tiene ${table?.rows?.length ?? 0} filas; snapshot tiene ${yearRows.length}`);
if (calc.dataUpdate?.updateType === 'auto-live' && !calc.dataUpdate?.liveSource) failures.push('auto-live sin liveSource');

if (failures.length) {
  console.error('[derived-integrity] ❌ ' + failures.join('; '));
  process.exit(1);
}
console.log(`[derived-integrity] ✓ IPC consistente con ${month} ${year} y ${expectedYtd}% YTD`);
