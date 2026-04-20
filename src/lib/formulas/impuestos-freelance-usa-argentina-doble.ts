export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestosFreelanceUsaArgentinaDoble(i: Inputs): Outputs {
  const f=Number(i.facturacionAnualUsd)||0;
  const arsFact=f*1200;
  let imp=0;
  if(arsFact<72000000){imp=arsFact*0.08} // monotributo
  else {imp=arsFact*0.3} // IVA + ganancias + IIBB aprox
  const tasa=arsFact>0?(imp/arsFact*100):0;
  return { impuestoAr:`USD ${Math.round(imp/1200).toLocaleString('en-US')}`, tasaEfectiva:`${tasa.toFixed(1)}%`, observacion:arsFact<72000000?'Monotributo Categoría alta.':'Responsable Inscripto. Consultá contador.' };
}
