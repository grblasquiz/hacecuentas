export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function biodegradacionResiduoTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tiempos: Record<string, { es: string; en: string }> = {
    'papel':         { es: '2-5 meses',   en: '2-5 months' },
    'cascara-fruta': { es: '2-4 semanas', en: '2-4 weeks' },
    'algodon':       { es: '1-5 meses',   en: '1-5 months' },
    'vidrio':        { es: '~4000 años',  en: '~4000 years' },
    'lata':          { es: '10-500 años', en: '10-500 years' },
    'plastico':      { es: '450+ años',   en: '450+ years' },
    'tetra':         { es: '30-40 años',  en: '30-40 years' },
    'pañal':         { es: '500+ años',   en: '500+ years' },
    'neumatico':     { es: '1000+ años',  en: '1000+ years' },
  };
  const T = ({
    es: { unknown: 'Desconocido', suffix: 'para biodegradarse completamente.' },
    en: { unknown: 'Unknown',     suffix: 'to fully biodegrade.' },
  } as const)[__lang];
  const m = String(i.material);
  const entry = tiempos[m];
  const t = entry ? entry[__lang] : T.unknown;
  const resumen = `${m}: ${t} ${T.suffix}`;
  return { tiempoEstimado: t, resumen };
}
