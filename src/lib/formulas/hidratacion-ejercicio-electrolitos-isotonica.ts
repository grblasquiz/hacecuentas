export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hidratacionEjercicioElectrolitosIsotonica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `With **${v1}** and **${v2}** the result comes to **${r.toFixed(2)}**. During long or intense exercise, replace fluids steadily and add electrolytes when you sweat heavily or train over an hour.`
      : `Con **${v1}** y **${v2}** el resultado da **${r.toFixed(2)}**. En ejercicio largo o intenso, reponé líquidos de a poco y sumá electrolitos cuando transpirás mucho o entrenás más de una hora.`,
    tone: 'neutral',
    icon: '💧',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
