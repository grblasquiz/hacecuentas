export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function bandwidthStreamingBitrateResolucionYoutube(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { codec: 'H.264 (x264) compatible todo. H.265 mejor compresión.', insightTitle: 'Tu subida en claro', insightIcon: '📡' },
    en: { codec: 'H.264 (x264) universal compatibility. H.265 better compression.', insightTitle: 'Your upload, explained', insightIcon: '📡' },
    pt: { codec: 'H.264 (x264) compatível com tudo. H.265 melhor compressão.', insightTitle: 'Seu upload, explicado', insightIcon: '📡' },
  } as const)[__lang];
  const r=String(i.resolucion||'1080p_60'); const p=String(i.plataforma||'youtube');
  const bitrate={'720p':3.5,'1080p_30':5,'1080p_60':6,'1440p':10,'4k':25}[r];
  const mult=p==='twitch'?1:p==='youtube'?1.1:0.8;
  const br=bitrate*mult;
  const upMin = br*1.5;
  const insightText = ({
    es: `Para transmitir en **${r.replace('_',' ')}** en ${p} necesitás un bitrate de **${br.toFixed(1)} Mbps**, así que tu conexión de subida debería ser de al menos **${upMin.toFixed(1)} Mbps** estables (50% de margen para no cortar). Hacé un test de velocidad de *subida*, no de bajada.`,
    en: `To stream **${r.replace('_',' ')}** on ${p} you need a **${br.toFixed(1)} Mbps** bitrate, so your upload connection should be at least **${upMin.toFixed(1)} Mbps** stable (50% headroom to avoid drops). Test your *upload* speed, not download.`,
    pt: `Para transmitir em **${r.replace('_',' ')}** no ${p} você precisa de um bitrate de **${br.toFixed(1)} Mbps**, então sua conexão de upload deve ter ao menos **${upMin.toFixed(1)} Mbps** estáveis (50% de folga para não cair). Teste a velocidade de *upload*, não de download.`,
  } as const)[__lang];
  const _insight = { title: T.insightTitle, text: insightText, tone: 'neutral', icon: T.insightIcon };
  return { bitrateMbps:`${br.toFixed(1)} Mbps`, uploadMinimo:`${upMin.toFixed(1)} Mbps`, codec:T.codec, _insight };
}
