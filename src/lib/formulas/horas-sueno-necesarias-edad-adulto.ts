export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasSuenoNecesariasEdadAdulto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `From **${v1}** and **${v2}** the result is **${r.toFixed(2)}**. As a reference, most healthy adults do best with **7 to 9 hours** of sleep per night, kept consistent across the week.`
      : `A partir de **${v1}** y **${v2}** el resultado es **${r.toFixed(2)}**. Como referencia, la mayoría de los adultos sanos rinde mejor durmiendo **entre 7 y 9 horas** por noche, manteniendo un horario parejo toda la semana.`,
    tone: 'neutral',
    icon: '😴',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
