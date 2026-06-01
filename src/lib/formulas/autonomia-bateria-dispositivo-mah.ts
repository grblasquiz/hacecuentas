export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomiaBateriaDispositivoMah(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      consumoCero: 'Consumo no puede ser 0.',
      dias: 'días',
      continuas: 'continuas.',
      insightTitle: 'Cuánto dura la batería',
      insightText: (mah:number, ma:number, h:number, dias:number) =>
        `Una batería de **${mah} mAh** que entrega **${ma} mA** dura unas **${h.toFixed(1)} horas** de uso continuo (≈ ${dias.toFixed(1)} días). En la práctica esperá algo menos: la eficiencia real de la batería ronda el 80-90%.`,
    },
    en: {
      consumoCero: 'Consumption cannot be 0.',
      dias: 'days',
      continuas: 'continuous.',
      insightTitle: 'How long the battery lasts',
      insightText: (mah:number, ma:number, h:number, dias:number) =>
        `A **${mah} mAh** battery drawing **${ma} mA** lasts about **${h.toFixed(1)} hours** of continuous use (≈ ${dias.toFixed(1)} days). In practice expect a bit less: real battery efficiency is around 80-90%.`,
    },
  } as const)[__lang];
  const mah=Number(i.mah)||0; const ma=Number(i.ma)||0;
  if (ma===0) return { horas:'—', dias:'—', resumen: T.consumoCero };
  const h=mah/ma;
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(mah, ma, h, h/24),
    tone: 'neutral',
    icon: '🔋',
  };
  return { horas:`${h.toFixed(2)} h`, dias:`${(h/24).toFixed(2)} ${T.dias}`, resumen:`${mah}mAh / ${ma}mA = ${h.toFixed(1)}h ${T.continuas}`, _insight };
}
