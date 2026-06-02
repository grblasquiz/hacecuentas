export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ccaBateriaAutoTemperaturaMotor(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cc=Number(i.cc)||0; const t=String(i.tipo||'nafta');
  const mult=t==='diesel'?2:1;
  const min=Math.round(cc/1000*300*mult); const rec=Math.round(min*1.2);
  const resumen = __lang === 'en'
    ? `${cc}cc ${t}: min CCA ${min}, recommended ${rec}.`
    : `${cc}cc ${t}: CCA mín ${min}, recomendado ${rec}.`;
  const esDiesel = t==='diesel';
  const _insight = {
    title: __lang === 'en' ? 'Battery to buy' : 'Batería a comprar',
    text: __lang === 'en'
      ? `For a **${cc}cc ${esDiesel ? 'diesel' : 'petrol'}** engine, do not go below **${min} CCA**; aim for **${rec} CCA**${esDiesel ? ' — diesels need nearly double the cranking power to fire up' : ''} so it still cranks on cold mornings.`
      : `Para un motor **${cc}cc ${esDiesel ? 'diésel' : 'nafta'}**, no bajes de **${min} CCA**; apuntá a **${rec} CCA**${esDiesel ? ' — los diésel piden casi el doble de arranque para encender' : ''} y así arranca igual las mañanas frías.`,
    tone: 'neutral',
    icon: '🔋',
  };
  return { ccaMin:`${min} CCA`, ccaRecom:`${rec} CCA`, resumen, _insight };
}
