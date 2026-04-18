export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fechaProbablePartoUltimaMenstruacion(i: Inputs): Outputs {
  const f=String(i.fum||''); const c=Number(i.cicloDias)||28;
  if (!f) return { fpp:'—', semanaHoy:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { fpp:'—', semanaHoy:'—', resumen:'Fecha inválida.' };
  const fpp=new Date(d.getTime()+(280+(c-28))*86400000);
  const hoy=new Date();
  const sem=Math.floor((hoy.getTime()-d.getTime())/(7*86400000));
  return { fpp:fpp.toISOString().slice(0,10), semanaHoy:`Semana ${sem}`, resumen:`FPP: ${fpp.toISOString().slice(0,10)} (semana ${sem} hoy).` };
}
