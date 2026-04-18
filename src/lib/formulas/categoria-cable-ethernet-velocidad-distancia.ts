export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function categoriaCableEthernetVelocidadDistancia(i: Inputs): Outputs {
  const c=String(i.cat||'cat5e');
  const t:Record<string,[string,string,string]>={cat5e:['1 Gbps','100m','100 MHz'],cat6:['1 Gbps / 10 Gbps <37m','100m','250 MHz'],cat6a:['10 Gbps','100m','500 MHz'],cat7:['10 Gbps','100m','600 MHz'],cat8:['40 Gbps','30m','2000 MHz']};
  const [v,d,f]=t[c]||t.cat5e;
  return { velocidad:v, distancia:d, frecuencia:f, resumen:`${c}: ${v} hasta ${d}.` };
}
