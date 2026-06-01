export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function azucaresAnadidosDiariosOmsMgGramos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Your result',
        text: `Combining **${v1}** and **${v2}** gives **${r.toFixed(2)}**. The WHO advises keeping added sugars under **25 g/day** (about 6 teaspoons) for extra health benefits.`,
        tone: 'neutral',
        icon: '🍬',
      }
    : {
        title: 'Tu resultado',
        text: `Combinando **${v1}** y **${v2}** obtenés **${r.toFixed(2)}**. La OMS recomienda mantener los azúcares añadidos por debajo de **25 g/día** (unas 6 cucharaditas) para un beneficio extra de salud.`,
        tone: 'neutral',
        icon: '🍬',
      };
  return { resultado:r.toFixed(2), resumen, _insight };
}
