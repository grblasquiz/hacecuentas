export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function biodegradacionResiduoTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const tiempos: Record<string, { es: string; en: string; pt: string }> = {
    'papel':         { es: '2-5 meses',   en: '2-5 months',  pt: '2-5 meses' },
    'cascara-fruta': { es: '2-4 semanas', en: '2-4 weeks',   pt: '2-4 semanas' },
    'algodon':       { es: '1-5 meses',   en: '1-5 months',  pt: '1-5 meses' },
    'vidrio':        { es: '~4000 años',  en: '~4000 years', pt: '~4000 anos' },
    'lata':          { es: '10-500 años', en: '10-500 years',pt: '10-500 anos' },
    'plastico':      { es: '450+ años',   en: '450+ years',  pt: '450+ anos' },
    'tetra':         { es: '30-40 años',  en: '30-40 years', pt: '30-40 anos' },
    'pañal':         { es: '500+ años',   en: '500+ years',  pt: '500+ anos' },
    'neumatico':     { es: '1000+ años',  en: '1000+ years', pt: '1000+ anos' },
  };
  const T = ({
    es: { unknown: 'Desconocido', suffix: 'para biodegradarse completamente.' },
    en: { unknown: 'Unknown',     suffix: 'to fully biodegrade.' },
    pt: { unknown: 'Desconhecido', suffix: 'para se biodegradar completamente.' },
  } as const)[__lang];
  const m = String(i.material);
  const entry = tiempos[m];
  const t = entry ? entry[__lang] : T.unknown;
  const resumen = `${m}: ${t} ${T.suffix}`;
  return { tiempoEstimado: t, resumen };
}
