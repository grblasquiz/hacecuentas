export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ttlDnsRegistroCachePropagacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      horas: '1-24 horas',
      dias: 'Puede ser días',
      muybajo: 'Muy bajo, más consultas DNS',
      muyalto: 'Demasiado alto si cambias seguido',
    },
    en: {
      horas: '1-24 hours',
      dias: 'Can be days',
      muybajo: 'Too low, more DNS queries',
      muyalto: 'Too high if you change records often',
    },
  } as const)[__lang];
  const t=Number(i.ttl)||3600;
  let prop:string;
  if (t<=300) prop='5-15 min';
  else if (t<=3600) prop='30-60 min';
  else if (t<=86400) prop=T.horas;
  else prop=T.dias;
  let rec='OK'; if (t<60) rec=T.muybajo; else if (t>86400) rec=T.muyalto;
  return { propagacion:prop, recomendacion:rec, resumen:__lang==='en'?`TTL ${t}s: propagates in ${prop}.`:`TTL ${t}s: propaga en ${prop}.` };
}
