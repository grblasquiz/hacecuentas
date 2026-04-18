export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadAutoRpmMarchaRelacion(i: Inputs): Outputs {
  const r=Number(i.rpm)||0; const rel=Number(i.rel)||1; const dif=Number(i.diff)||1; const c=Number(i.circ)||2;
  const rueda_rpm=r/(rel*dif);
  const v_m_min=rueda_rpm*c;
  const v_kmh=v_m_min*60/1000;
  return { velocidad:`${v_kmh.toFixed(0)} km/h`, resumen:`${r}rpm en esa marcha = ${v_kmh.toFixed(0)} km/h.` };
}
