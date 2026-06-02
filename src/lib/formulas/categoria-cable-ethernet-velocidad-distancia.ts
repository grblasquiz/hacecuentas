export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function categoriaCableEthernetVelocidadDistancia(i: Inputs): Outputs {
  const c=String(i.cat||'cat5e');
  const t:Record<string,[string,string,string]>={cat5e:['1 Gbps','100m','100 MHz'],cat6:['1 Gbps / 10 Gbps <37m','100m','250 MHz'],cat6a:['10 Gbps','100m','500 MHz'],cat7:['10 Gbps','100m','600 MHz'],cat8:['40 Gbps','30m','2000 MHz']};
  const [v,d,f]=t[c]||t.cat5e;
  const esCat8 = c==='cat8';
  const _insight = {
    title: `Cable ${c.toUpperCase()}`,
    text: esCat8
      ? `El **${c.toUpperCase()}** llega a **${v}** pero solo hasta **${d}**: es para datacenter o tiradas cortas entre racks, no para cablear una casa.`
      : `El **${c.toUpperCase()}** da **${v}** hasta **${d}** a **${f}**. Para tiradas largas sin pérdida de señal este es tu límite por tramo.`,
    tone: 'neutral',
    icon: '🔌',
  };
  return { velocidad:v, distancia:d, frecuencia:f, resumen:`${c}: ${v} hasta ${d}.`, _insight };
}
