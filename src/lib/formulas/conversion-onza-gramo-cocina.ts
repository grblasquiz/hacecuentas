export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionOnzaGramoCocina(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 28.3495;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'oz' : 'g';
  const toU = u === 'a' ? 'g' : 'oz';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
