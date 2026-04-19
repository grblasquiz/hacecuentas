export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function percentilEstaturaPesoBebeOms(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0; const e=Number(i.estaturaCm)||0; const s=String(i.sexo||'m');
  const medM: Record<number,number> = { 0:50, 3:61, 6:67.5, 9:72, 12:76, 18:82.5, 24:87.5, 36:96 };
  const medF: Record<number,number> = { 0:49.5, 3:59.5, 6:65.5, 9:70, 12:74, 18:80, 24:85, 36:94 };
  const tabla=s==='m'?medM:medF;
  const keys=Object.keys(tabla).map(Number).sort((a,b)=>a-b);
  let closest=keys[0]; for (const k of keys) if (k<=m) closest=k;
  const med=tabla[closest];
  const desv=(e-med)/med*100;
  let p='P50';
  if (desv>8) p='>P97'; else if (desv>3) p='P85-97'; else if (desv<-8) p='<P3'; else if (desv<-3) p='P3-15';
  return { percentil:p, medianaCm:med+' cm', resumen:`${m}m ${s}: ${e}cm (mediana ${med}cm) → ${p}.` };
}
