export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ttlDnsRegistroCachePropagacion(i: Inputs): Outputs {
  const t=Number(i.ttl)||3600;
  let prop:string;
  if (t<=300) prop='5-15 min';
  else if (t<=3600) prop='30-60 min';
  else if (t<=86400) prop='1-24 horas';
  else prop='Puede ser días';
  let rec='OK'; if (t<60) rec='Muy bajo, más consultas DNS'; else if (t>86400) rec='Demasiado alto si cambias seguido';
  return { propagacion:prop, recomendacion:rec, resumen:`TTL ${t}s: propaga en ${prop}.` };
}
