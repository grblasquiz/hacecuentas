export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function equivalenciaHuevosTamanoGramosClaras(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Reading the result' : 'Cómo leer el resultado',
    text: __lang === 'en'
      ? `With your values the equivalence comes to **${r.toFixed(2)}**, from ${v1} × ${v2}. Adjust the inputs to scale the recipe up or down.`
      : `Con tus valores la equivalencia da **${r.toFixed(2)}**, a partir de ${v1} × ${v2}. Ajustá los datos para escalar la receta hacia arriba o abajo.`,
    tone: 'neutral',
    icon: '🥚',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
