export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ayunoIntermitente168VentanaHorario(i: Inputs): Outputs {
  const h=String(i.horaComienzoAyuno||'20:00'); const p=String(i.protocolo||'16_8');
  const horas={'16_8':16,'18_6':18,'20_4_omad':20}[p];
  const [hh,mm]=h.split(':').map(Number);
  const totalMin=(hh*60+mm+horas*60)%1440;
  const nh=Math.floor(totalMin/60); const nm=totalMin%60;
  return { horaRomper:`${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`, horasAyuno:`${horas} horas`, observacion:`Ayuná desde ${h} hasta ${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}. Ventana comida: ${24-horas}h.` };
}
