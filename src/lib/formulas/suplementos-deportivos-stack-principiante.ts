export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function suplementosDeportivosStackPrincipiante(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `The calculated value is **${r.toFixed(1)}**. A solid beginner stack rarely needs more than creatine, protein and caffeine — start with the basics before adding anything else.`
      : `El valor calculado es **${r.toFixed(1)}**. Un buen stack de principiante casi nunca necesita más que creatina, proteína y cafeína: arrancá por lo básico antes de sumar nada más.`,
    tone: 'neutral',
    icon: '💊',
  };
  return { resultado:r.toFixed(1), resumen, _insight };
}
