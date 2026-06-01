export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tasaCompresionArchivoZip(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Original no puede ser 0.' },
    en: { error: 'Original size cannot be 0.' },
  } as const)[__lang];
  const o=Number(i.original)||0; const c=Number(i.comprimido)||0;
  if (o===0) return { tasa:'—', ratio:'—', ahorro:'—', resumen: T.error };
  const tasa=(1-c/o)*100; const ratio=o/c;
  const resumen = __lang === 'en'
    ? `Compression ${tasa.toFixed(1)}%, savings ${(o-c).toFixed(1)} MB.`
    : `Compresión ${tasa.toFixed(1)}%, ahorro ${(o-c).toFixed(1)} MB.`;
  return { tasa:`${tasa.toFixed(1)}%`, ratio:`${ratio.toFixed(2)}:1`, ahorro:`${(o-c).toFixed(2)} MB`, resumen };
}
