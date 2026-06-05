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
  // Platform-specific recommended bitrates (Mbps) based on official encoder guidelines
  // YouTube: support.google.com/youtube/answer/2853702
  // Twitch: help.twitch.tv/s/article/broadcasting-guidelines
  // Kick: allows up to 8 Mbps for 1080p60
  const bitrateTable: Record<string, Record<string, number>> = {
    youtube:  { '720p': 5.0, '1080p_30': 6.0, '1080p_60': 8.0, '1440p': 13.0, '4k': 40.0 },
    twitch:   { '720p': 4.5, '1080p_30': 4.5, '1080p_60': 6.0, '1440p': 6.0,  '4k': 6.0  },
    kick:     { '720p': 4.5, '1080p_30': 5.0, '1080p_60': 8.0, '1440p': 8.0,  '4k': 8.0  },
  };
  const platformKey = p in bitrateTable ? p : 'youtube';
  const resolKey = r in bitrateTable[platformKey] ? r : '1080p_60';
  const br = bitrateTable[platformKey][resolKey];
  // Required upload = video bitrate + 320 kbps audio + 20% overhead buffer
  const upMin = Math.ceil((br + 0.32) * 1.2 * 10) / 10;
  const insightText = ({
    es: `Para transmitir en **${r.replace('_',' ')}** en ${p} necesitás un bitrate de **${br.toFixed(1)} Mbps**, así que tu conexión de subida debería ser de al menos **${upMin.toFixed(1)} Mbps** estables (20% de margen para no cortar). Hacé un test de velocidad de *subida*, no de bajada.`,
    en: `To stream **${r.replace('_',' ')}** on ${p} you need a **${br.toFixed(1)} Mbps** bitrate, so your upload connection should be at least **${upMin.toFixed(1)} Mbps** stable (20% headroom + audio overhead to avoid drops). Test your *upload* speed, not download.`,
    pt: `Para transmitir em **${r.replace('_',' ')}** no ${p} você precisa de um bitrate de **${br.toFixed(1)} Mbps**, então sua conexão de upload deve ter ao menos **${upMin.toFixed(1)} Mbps** estáveis (20% de folga mais áudio para não cair). Teste a velocidade de *upload*, não de download.`,
  } as const)[__lang];
  const _insight = { title: T.insightTitle, text: insightText, tone: 'neutral', icon: T.insightIcon };
  return { bitrateMbps:`${br.toFixed(1)} Mbps`, uploadMinimo:`${upMin.toFixed(1)} Mbps`, codec:T.codec, _insight };
}
