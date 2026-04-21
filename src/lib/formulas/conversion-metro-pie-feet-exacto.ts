export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionMetroPieFeetExacto(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 3.28084;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'm' : 'ft';
  const toU = u === 'a' ? 'ft' : 'm';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
