export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function bandwidthStreamingBitrateResolucionYoutube(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { codec: 'H.264 (x264) compatible todo. H.265 mejor compresión.' },
    en: { codec: 'H.264 (x264) universal compatibility. H.265 better compression.' },
    pt: { codec: 'H.264 (x264) compatível com tudo. H.265 melhor compressão.' },
  } as const)[__lang];
  const r=String(i.resolucion||'1080p_60'); const p=String(i.plataforma||'youtube');
  const bitrate={'720p':3.5,'1080p_30':5,'1080p_60':6,'1440p':10,'4k':25}[r];
  const mult=p==='twitch'?1:p==='youtube'?1.1:0.8;
  const br=bitrate*mult;
  return { bitrateMbps:`${br.toFixed(1)} Mbps`, uploadMinimo:`${(br*1.5).toFixed(1)} Mbps`, codec:T.codec };
}
