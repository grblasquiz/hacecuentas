export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function indiceCinturaCaderaSaludCardiovascular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const insight = __lang === 'en'
    ? {
        title: 'Your result',
        text: `With **${v1}** and **${v2}** the result is **${r.toFixed(2)}**. Compare it against the reference ranges for your sex to read your cardiovascular risk.`,
        tone: 'neutral',
        icon: '❤️',
      }
    : {
        title: 'Tu resultado',
        text: `Con **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. Compará el valor con los rangos de referencia según tu sexo para interpretar el riesgo cardiovascular.`,
        tone: 'neutral',
        icon: '❤️',
      };
  return { resultado:r.toFixed(2), resumen: __lang === 'en' ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.` : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`, _insight: insight };
}
