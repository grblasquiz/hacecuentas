export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function uberDidiCabifyComparativaCiudad(i: Inputs): Outputs {
  const k=Number(i.distanciaKm)||0; const m=Number(i.minutos)||0; const hp=String(i.horaPico||'no');
  const mult=hp==='si'?1.4:1;
  const uber=Math.round((500+k*350+m*25)*mult);
  const didi=Math.round(uber*0.85);
  const cabify=Math.round(uber*1.2);
  return { uber:uber, didi:didi, cabify:cabify };
}
