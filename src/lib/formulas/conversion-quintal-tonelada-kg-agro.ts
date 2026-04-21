export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionQuintalToneladaKgAgro(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 0.1;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'qq' : 'tn';
  const toU = u === 'a' ? 'tn' : 'qq';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
