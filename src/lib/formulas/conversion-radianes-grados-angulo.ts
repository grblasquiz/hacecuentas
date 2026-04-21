export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionRadianesGradosAngulo(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 57.29577951308232;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'rad' : '°';
  const toU = u === 'a' ? '°' : 'rad';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
