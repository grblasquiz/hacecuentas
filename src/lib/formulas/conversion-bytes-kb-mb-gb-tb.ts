/** Convert between B, KB, MB, GB, TB in binary (1024) or decimal (1000). */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n !== 0 && (Math.abs(n) < 1e-4 || Math.abs(n) >= 1e15)) {
    return n.toExponential(4);
  }
  // Up to 6 significant decimals, trimming trailing zeros, thousands separator.
  const rounded = Number(n.toFixed(6));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

export function conversionBytesKbMbGbTb(i: Inputs): Outputs {
  const valor = Number(i.valor) || 0;
  const desde = String(i.desde || 'GB');
  const a = String(i.a || 'MB');
  const sistema = String(i.sistema || 'bin');
  const base = sistema === 'dec' ? 1000 : 1024;

  const fromIdx = UNITS.indexOf(desde);
  const toIdx = UNITS.indexOf(a);
  const fi = fromIdx < 0 ? 3 : fromIdx;
  const ti = toIdx < 0 ? 2 : toIdx;

  // Normalise to bytes, then divide into the target unit.
  const bytes = valor * Math.pow(base, fi);
  const result = bytes / Math.pow(base, ti);

  const sysLabel = base === 1024 ? 'binary (1024)' : 'decimal (1000)';
  const resultado = `${fmt(result)} ${UNITS[ti]}`;
  const resumen = `${fmt(valor)} ${UNITS[fi]} = ${fmt(result)} ${UNITS[ti]} using the ${sysLabel} system. That is ${fmt(bytes)} bytes in total.`;

  return { resultado, resumen };
}
