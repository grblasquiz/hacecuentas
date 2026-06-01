export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ayunoIntermitente168VentanaHorario(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h=String(i.horaComienzoAyuno||'20:00'); const p=String(i.protocolo||'16_8');
  const horas={'16_8':16,'18_6':18,'20_4_omad':20}[p] ?? 16;
  const [hh,mm]=h.split(':').map(Number);
  const totalMin=(hh*60+mm+horas*60)%1440;
  const nh=Math.floor(totalMin/60); const nm=totalMin%60;
  const endTime=`${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
  const ventana=24-horas;
  const horasAyuno = __lang === 'en' ? `${horas} hours` : `${horas} horas`;
  const observacion = __lang === 'en'
    ? `Fast from ${h} to ${endTime}. Eating window: ${ventana}h.`
    : `Ayuná desde ${h} hasta ${endTime}. Ventana comida: ${ventana}h.`;
  const insight = __lang === 'en'
    ? { title: 'Your daily schedule', text: `Starting your fast at **${h}**, you can break it at **${endTime}** after **${horas} hours**. That leaves a **${ventana}h eating window** to fit all your meals.`, tone: 'neutral', icon: '🕗' }
    : { title: 'Tu horario del día', text: `Si arrancás el ayuno a las **${h}**, podés romperlo a las **${endTime}** tras **${horas} horas**. Te queda una **ventana de comida de ${ventana}h** para distribuir todas tus comidas.`, tone: 'neutral', icon: '🕗' };
  const chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Fasting' : 'Ayuno', value: horas },
      { label: __lang === 'en' ? 'Eating window' : 'Ventana comida', value: ventana },
    ],
    suffix: 'h',
    centerValue: `${horas}h`,
    centerLabel: __lang === 'en' ? 'Fasting' : 'Ayuno',
    ariaLabel: __lang === 'en'
      ? `Day split: ${horas} hours fasting and ${ventana} hours eating window.`
      : `Reparto del día: ${horas} horas de ayuno y ${ventana} horas de ventana de comida.`,
  };
  return { horaRomper: endTime, horasAyuno, observacion, _insight: insight, _chart: chart };
}
