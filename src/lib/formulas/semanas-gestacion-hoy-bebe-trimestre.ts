export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function semanasGestacionHoyBebeTrimestre(i: Inputs): Outputs {
  const f=String(i.fum||''); if (!f) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const [yy,mm,ddx]=parts;
  const d=new Date(yy,mm-1,ddx);
  if (isNaN(d.getTime())) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const h=new Date();
  const dif=(h.getTime()-d.getTime())/86400000;
  const s=Math.floor(dif/7); const dd=Math.floor(dif%7);
  const tri=s<=13?'1°':s<=27?'2°':'3°';
  return { semanas:`${s}`, dias:`${dd}d`, trimestre:tri, resumen:`${s} semanas ${dd} días (${tri} trimestre).` };
}
