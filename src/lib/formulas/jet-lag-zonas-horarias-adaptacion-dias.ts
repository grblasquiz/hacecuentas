export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jetLagZonasHorariasAdaptacionDias(i: Inputs): Outputs {
  const h=Math.abs(Number(i.diferenciaHoras)||0); const d=String(i.direccion||'este');
  const dias=d==='este'?Math.ceil(h/1.25):Math.ceil(h/2);
  const severidad=h<=3?'Leve':h<=6?'Medio':h<=9?'Alto':'Muy alto';
  return { diasAdaptacion:`${dias} días`, severidad:severidad, tips:`${d==='este'?'Este: más duro':'Oeste: más fácil'}. Melatonina 0.5-1 mg 30 min antes hora objetivo. Luz solar AM destino. Ayunar vuelo + comer horario nuevo.` };
}
