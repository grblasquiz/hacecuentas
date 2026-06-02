export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function proteinaDiariaFisicoculturismoGanarMusculo(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const pg=(Number(i.pctGrasa)||20)/100; const ob=String(i.objetivo||'gn');
  const magra=p*(1-pg);
  const mult: Record<string,number> = { gn:2.0, cn:2.5, mantener:1.6 };
  const prot=magra*mult[ob];

  const m = mult[ob] ?? 2.0;
  const objLabel: Record<string,string> = { gn:'ganar músculo', cn:'definir (cutting)', mantener:'mantener' };
  const objTxt = objLabel[ob] || 'ganar músculo';
  const gPorComida = Math.round(prot/4);
  const _insight = {
    title: 'Tu proteína diaria',
    text: `Sobre **${Math.round(magra)} kg** de masa magra (${p} kg al ${Math.round(pg*100)}% de grasa) y objetivo **${objTxt}**, apuntá a **${prot.toFixed(0)} g** de proteína por día: unos **${gPorComida} g** en cada una de 4 comidas. Eso son **${m.toFixed(1)} g por kg** de masa magra.`,
    tone: 'good' as const,
    icon: '💪',
  };

  return { proteinaDia:prot.toFixed(0)+'g', porComida:gPorComida+'g (x4 comidas)', resumen:`${p}kg (${pg*100}% grasa) ${ob}: ${prot.toFixed(0)}g proteína/día.`, _insight };
}
