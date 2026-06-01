export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }
export function paceNatacion100mRitmo(i: Inputs): Outputs {
  const d=Number(i.distanciaM)||0; const t=Number(i.tiempoMinutos)||0;
  const paceSegPor100=d>0?(t*60/d*100):0;
  const min=Math.floor(paceSegPor100/60); const seg=Math.round(paceSegPor100%60);
  const v=d/(t*60);
  let clas='';
  if(paceSegPor100<65) clas='Elite';
  else if(paceSegPor100<90) clas='Avanzado';
  else if(paceSegPor100<120) clas='Intermedio';
  else clas='Principiante';
  const markerSeg=Math.round(paceSegPor100);
  const chart={
    type:'scale' as const,
    marker:markerSeg,
    markerLabel:`Tu pace: ${min}:${String(seg).padStart(2,'0')}/100m`,
    min:45,
    unit:'s',
    segments:[
      { nombre:'Elite', max:65, color:'#bbf7d0', colorDark:'#166534' },
      { nombre:'Avanzado', max:90, color:'#fef9c3', colorDark:'#854d0e' },
      { nombre:'Intermedio', max:120, color:'#fed7aa', colorDark:'#9a3412' },
      { nombre:'Principiante', max:Math.max(160,markerSeg+10), color:'#fecaca', colorDark:'#b91c1c' },
    ],
    ariaLabel:'Escala de pace de natación por nivel (segundos por 100m)',
  };
  return { pace:`${min}:${String(seg).padStart(2,'0')}/100m`, velocidadMs:`${v.toFixed(2)} m/s`, clasificacion:clas, _chart:chart };
}
