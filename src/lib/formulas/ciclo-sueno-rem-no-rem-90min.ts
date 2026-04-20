export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cicloSuenoRemNoRem90min(i: Inputs): Outputs {
  const h=String(i.horaDormir||'22:00'); const c=Number(i.ciclosObjetivo)||5;
  const [hh,mm]=h.split(':').map(Number);
  const minutos=(hh*60+mm+c*90+15)%1440; // +15 min fall asleep
  const hd=Math.floor(minutos/60); const md=minutos%60;
  return { horaDespertar:`${String(hd).padStart(2,'0')}:${String(md).padStart(2,'0')}`, horasSueno:`${(c*90/60).toFixed(1)} h`, interpretacion:`Dormí a las ${h}, levantate a las ${String(hd).padStart(2,'0')}:${String(md).padStart(2,'0')} tras ${c} ciclos de 90 min.` };
}
