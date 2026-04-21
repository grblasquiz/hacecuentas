export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionPieCuadradoMetroBienesRaices(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 0.092903;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'ft²' : 'm²';
  const toU = u === 'a' ? 'm²' : 'ft²';
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`
  };
}
