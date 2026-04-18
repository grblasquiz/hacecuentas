export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function papelAhorradoImpresionDobleCara(i: Inputs): Outputs {
  const h = Number(i.hojasSem) || 0;
  const hAño = h * 52 * 0.5;
  const arb = hAño / 10000;
  return { hojasAño: hAño.toFixed(0), arboles: arb.toFixed(2), resumen: `Ahorrás ${hAño.toFixed(0)} hojas/año imprimiendo doble faz = ${arb.toFixed(2)} árboles.` };
}
