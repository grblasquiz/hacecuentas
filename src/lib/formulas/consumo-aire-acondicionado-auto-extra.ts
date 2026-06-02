export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function consumoAireAcondicionadoAutoExtra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.rend)||12; const h=Number(i.horas)||1; const p=Number(i.precio)||1;
  const lHora=0.3;
  const dia=lHora*h; const mes=dia*30*p;
  const litrosMes = dia * 30;
  const extra = __lang === 'en' ? `${dia.toFixed(2)} L/day` : `${dia.toFixed(2)} L/día`;
  const resumen = __lang === 'en' ? `A/C ${h}h/day: ~$${mes.toFixed(0)}/month extra fuel.` : `A/A ${h}h/día: ~$${mes.toFixed(0)}/mes extra combustible.`;
  const _insight = {
    title: __lang === 'en' ? 'Cost of using A/C' : 'Lo que cuesta el aire',
    text: __lang === 'en'
      ? `Running the A/C **${h} h/day** burns about **${dia.toFixed(2)} L** of extra fuel daily — roughly **${litrosMes.toFixed(0)} L** and **$${mes.toFixed(0)}** a month. Cracking the windows at low speed avoids it.`
      : `Usar el aire **${h} h/día** quema unos **${dia.toFixed(2)} L** de nafta extra por día: cerca de **${litrosMes.toFixed(0)} L** y **$${mes.toFixed(0)}** al mes. A baja velocidad, abrir las ventanas te lo ahorra.`,
    tone: 'neutral',
    icon: '❄️'
  };
  return { extra, costoMes:`$${mes.toFixed(2)}`, resumen, _insight };
}
