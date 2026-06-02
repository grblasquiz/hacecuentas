export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ttlDnsRegistroCachePropagacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      horas: '1-24 horas',
      dias: 'Puede ser días',
      muybajo: 'Muy bajo, más consultas DNS',
      muyalto: 'Demasiado alto si cambias seguido',
      insTitle: 'Qué significa este TTL',
      insLow: (s: number) => `Con un TTL de **${s}s** los cambios propagan rápido (más maniobra para migraciones), pero el resolver consulta tu DNS muy seguido: **mayor carga y latencia**.`,
      insHigh: (s: number) => `Un TTL de **${s}s** cachea fuerte y baja consultas, pero si tenés que cambiar un registro la propagación puede **tardar hasta un día o más**. Bajalo antes de migrar.`,
      insOk: (s: number, p: string) => `Un TTL de **${s}s** es un buen balance: los cambios propagan en **${p}** y el cache evita consultas innecesarias.`,
    },
    en: {
      horas: '1-24 hours',
      dias: 'Can be days',
      muybajo: 'Too low, more DNS queries',
      muyalto: 'Too high if you change records often',
      insTitle: 'What this TTL means',
      insLow: (s: number) => `With a **${s}s** TTL changes propagate fast (handy for migrations), but resolvers query your DNS very often: **more load and latency**.`,
      insHigh: (s: number) => `A **${s}s** TTL caches hard and cuts queries, but if you need to change a record propagation can **take a day or more**. Lower it before migrating.`,
      insOk: (s: number, p: string) => `A **${s}s** TTL is a good balance: changes propagate in **${p}** and caching avoids unnecessary lookups.`,
    },
  } as const)[__lang];
  const t=Number(i.ttl)||3600;
  let prop:string;
  if (t<=300) prop='5-15 min';
  else if (t<=3600) prop='30-60 min';
  else if (t<=86400) prop=T.horas;
  else prop=T.dias;
  let rec='OK'; if (t<60) rec=T.muybajo; else if (t>86400) rec=T.muyalto;
  const _insight = {
    title: T.insTitle,
    text: t < 60 ? T.insLow(t) : t > 86400 ? T.insHigh(t) : T.insOk(t, prop),
    tone: (t < 60 || t > 86400 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🌐',
  };
  return { propagacion:prop, recomendacion:rec, resumen:__lang==='en'?`TTL ${t}s: propagates in ${prop}.`:`TTL ${t}s: propaga en ${prop}.`, _insight };
}
