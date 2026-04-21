export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionPulgadaCentimetroScreen(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 2.54;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'in' : 'cm';
  const toU = u === 'a' ? 'cm' : 'in';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
