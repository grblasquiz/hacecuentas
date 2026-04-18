export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function kilosEquipajeViajeBebeDias(i: Inputs): Outputs {
  const d=Number(i.dias)||0; const m=Number(i.edadMes)||0;
  const base=5; const porDia=m<12?1.5:1;
  const kg=base+d*porDia;
  return { kg:`${kg.toFixed(1)} kg`, items:'Pañales, ropa, fórmula, cochecito, silla auto', resumen:`${d} días con bebé ${m}m: ~${kg.toFixed(0)}kg.` };
}
