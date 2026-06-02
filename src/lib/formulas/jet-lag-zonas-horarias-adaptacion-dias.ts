export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function jetLagZonasHorariasAdaptacionDias(i: Inputs): Outputs {
  const h=Math.abs(Number(i.diferenciaHoras)||0); const d=String(i.direccion||'este');
  const dias=d==='este'?Math.ceil(h/1.25):Math.ceil(h/2);
  const severidad=h<=3?'Leve':h<=6?'Medio':h<=9?'Alto':'Muy alto';
  const _insight = {
    title: `~${dias} ${dias === 1 ? 'día' : 'días'} para adaptarte`,
    text: `Con **${h} h** de diferencia volando al **${d}**, tu cuerpo tarda unos **${dias} ${dias === 1 ? 'día' : 'días'}** en sincronizarse. ${d === 'este' ? 'El **este** es más duro: hay que adelantar el reloj interno.' : 'El **oeste** es más llevadero: alargás el día.'}`,
    tone: severidad === 'Muy alto' || severidad === 'Alto' ? 'warn' : severidad === 'Medio' ? 'neutral' : 'good',
    icon: severidad === 'Muy alto' ? '😵' : severidad === 'Alto' ? '😴' : severidad === 'Medio' ? '🥱' : '🙂',
  };
  const topMax = Math.max(12, Math.ceil(h) + 1);
  const _chart = {
    type: 'scale',
    marker: h,
    markerLabel: `${h} h`,
    min: 0,
    segments: [
      { nombre: 'Leve', max: 3, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Medio', max: 6, color: '#fde047', colorDark: '#eab308' },
      { nombre: 'Alto', max: 9, color: '#fdba74', colorDark: '#f97316' },
      { nombre: 'Muy alto', max: topMax, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: `Severidad del jet lag: ${h} horas de diferencia, nivel ${severidad}`,
  };
  return { diasAdaptacion:`${dias} días`, severidad:severidad, tips:`${d==='este'?'Este: más duro':'Oeste: más fácil'}. Melatonina 0.5-1 mg 30 min antes hora objetivo. Luz solar AM destino. Ayunar vuelo + comer horario nuevo.`, _insight, _chart };
}
