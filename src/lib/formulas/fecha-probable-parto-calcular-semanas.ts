export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fechaProbablePartoCalcularSemanas(i: Inputs): Outputs {
  const f=String(i.fum||''); if (!f) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const fpp=new Date(d.getTime()+280*86400000);
  const hoy=new Date();
  const sem=Math.floor((hoy.getTime()-d.getTime())/(7*86400000));
  const tri=sem<=13?'Primer':sem<=27?'Segundo':'Tercer';
  return { fpp:fpp.toISOString().slice(0,10), semanasHoy:sem+' semanas', trimestre:tri, resumen:`FPP: ${fpp.toISOString().slice(0,10)}. Hoy ${sem} semanas (${tri} trimestre).` };
}
