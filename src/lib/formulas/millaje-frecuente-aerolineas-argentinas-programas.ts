export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function millajeFrecuenteAerolineasArgentinasProgramas(i: Inputs): Outputs {
  const p=String(i.programa||'smiles'); const k=Number(i.kmVuelo)||0; const c=String(i.clase||'economica');
  const multPrograma={'aerolineas_plus':0.5,'smiles':0.5,'latam_pass':0.6,'american':0.7}[p];
  const multClase=c==='business'?2.5:1;
  const millas=k*multPrograma*multClase;
  const valor=millas*0.015;
  return { millasGanadas:`${Math.round(millas).toLocaleString('en-US')}`, valorEstimado:`USD ${valor.toFixed(0)}`, categoria:'Económica estándar. Elite: 2-3x.' };
}
