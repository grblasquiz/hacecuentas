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
  const fmtSheets = hAño.toLocaleString(__lang === 'es' || __lang === 'pt' ? 'es-AR' : 'en-US', { maximumFractionDigits: 0 });
  const _insight = __lang === 'en'
    ? {
        title: 'Your paper savings',
        text: `Going double-sided cuts your paper use roughly in half: **${fmtSheets} fewer sheets a year**, the equivalent of about **${arb.toFixed(2)} trees** spared.`,
        tone: 'good',
        icon: '🌳',
      }
    : __lang === 'pt'
    ? {
        title: 'Sua economia de papel',
        text: `Imprimir frente e verso corta o consumo de papel quase pela metade: **${fmtSheets} folhas a menos por ano**, o equivalente a cerca de **${arb.toFixed(2)} árvores** poupadas.`,
        tone: 'good',
        icon: '🌳',
      }
    : {
        title: 'Tu ahorro de papel',
        text: `Imprimir a doble faz recorta tu consumo casi a la mitad: **${fmtSheets} hojas menos por año**, el equivalente a unos **${arb.toFixed(2)} árboles** que te ahorrás.`,
        tone: 'good',
        icon: '🌳',
      };
  return { hojasAño: hAño.toFixed(0), arboles: arb.toFixed(2), resumen, _insight };
}
