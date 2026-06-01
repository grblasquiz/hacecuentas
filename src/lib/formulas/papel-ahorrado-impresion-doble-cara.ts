export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function papelAhorradoImpresionDobleCara(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const h = Number(i.hojasSem) || 0;
  const hAño = h * 52 * 0.5;
  const arb = hAño / 10000;
  const resumen = __lang === 'en'
    ? `You save ${hAño.toFixed(0)} sheets/year printing double-sided = ${arb.toFixed(2)} trees.`
    : __lang === 'pt'
    ? `Você economiza ${hAño.toFixed(0)} folhas/ano imprimindo frente e verso = ${arb.toFixed(2)} árvores.`
    : `Ahorrás ${hAño.toFixed(0)} hojas/año imprimiendo doble faz = ${arb.toFixed(2)} árboles.`;
  return { hojasAño: hAño.toFixed(0), arboles: arb.toFixed(2), resumen };
}
