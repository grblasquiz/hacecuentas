export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function millajeFrecuenteAerolineasArgentinasProgramas(i: Inputs): Outputs {
  const p=String(i.programa||'smiles'); const k=Number(i.kmVuelo)||0; const c=String(i.clase||'economica');
  const multPrograma={'aerolineas_plus':0.5,'smiles':0.5,'latam_pass':0.6,'american':0.7}[p];
  const multClase=c==='business'?2.5:1;
  const millas=k*multPrograma*multClase;
  const valor=millas*0.015;
  const nombreProg={'aerolineas_plus':'Aerolíneas Plus','smiles':'Smiles','latam_pass':'LATAM Pass','american':'AAdvantage'}[p] || p;
  const millasFmt=Math.round(millas).toLocaleString('es-AR');
  const _insight = c==='business'
    ? { title:'Multiplicador business activo', text:`Con **${nombreProg}** en business acreditás **${millasFmt} millas** por estos ${k.toLocaleString('es-AR')} km (2,5×). Valen unos **USD ${valor.toFixed(0)}** para canjear.`, tone:'good', icon:'✈️' }
    : { title:'Millas en económica', text:`Por estos ${k.toLocaleString('es-AR')} km en **${nombreProg}** sumás **${millasFmt} millas** (~**USD ${valor.toFixed(0)}** de valor). Con estatus elite podrías ganar 2-3× más.`, tone:'neutral', icon:'✈️' };
  return { millasGanadas:`${Math.round(millas).toLocaleString('en-US')}`, valorEstimado:`USD ${valor.toFixed(0)}`, categoria:'Económica estándar. Elite: 2-3x.', _insight };
}
