/**
 * ¿Cuántas fotos/videos/canciones entran en X GB?
 * cantidad = capacidadMB / tamañoUnitarioMB  (para video: tamañoMB es POR MINUTO → tamañoMB × minutos)
 * Tamaños promedio aproximados (ver sources en el JSON).
 */
export interface Inputs {
  capacidadGB: number;
  tipoContenido?: string;
  minutosVideo?: number;
  __lang?: string;
}
export interface Outputs {
  cantidad: number;
  capacidadMB: number;
  espacioPorItem: string;
  formula: string;
  _chart?: any;
  _insight?: any;
}

// Tamaños promedio en MB. Foto/canción/app/doc = por archivo. Video = POR MINUTO.
const SIZES: Record<string, { mb: number; esVideo: boolean }> = {
  '3.5': { mb: 3.5, esVideo: false }, // Foto celular (JPEG ~3.5 MB)
  '25': { mb: 25, esVideo: false }, // Foto RAW/pro (~25 MB)
  '5': { mb: 5, esVideo: false }, // Canción MP3 (~5 MB)
  '100': { mb: 100, esVideo: true }, // Video 1080p (~100 MB/min)
  '375': { mb: 375, esVideo: true }, // Video 4K (~375 MB/min)
  '80': { mb: 80, esVideo: false }, // App promedio (~80 MB)
  '1': { mb: 1, esVideo: false }, // Documento PDF (~1 MB)
};

const LABELS_ES: Record<string, string> = {
  '3.5': 'fotos de celular',
  '25': 'fotos RAW/pro',
  '5': 'canciones MP3',
  '100': 'videos 1080p',
  '375': 'videos 4K',
  '80': 'apps',
  '1': 'documentos PDF',
};
const LABELS_EN: Record<string, string> = {
  '3.5': 'phone photos',
  '25': 'RAW/pro photos',
  '5': 'MP3 songs',
  '100': '1080p videos',
  '375': '4K videos',
  '80': 'apps',
  '1': 'PDF documents',
};

export function cuantasFotosVideosEntranGb(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCap: 'Ingresá una capacidad válida en GB',
      errorTipo: 'Elegí un tipo de contenido',
      perMin: 'por minuto',
      perItem: 'por archivo',
      insightTitle: 'Lo que entra en tu almacenamiento',
      cap: 'Capacidad',
      ofMin: 'de',
      min: 'min',
    },
    en: {
      errorCap: 'Enter a valid capacity in GB',
      errorTipo: 'Pick a content type',
      perMin: 'per minute',
      perItem: 'per file',
      insightTitle: 'What fits in your storage',
      cap: 'Capacity',
      ofMin: 'of',
      min: 'min',
    },
  } as const)[__lang];

  const capacidadGB = Number(i.capacidadGB);
  const tipo = String(i.tipoContenido || '3.5');
  if (!capacidadGB || capacidadGB <= 0) throw new Error(T.errorCap);
  const meta = SIZES[tipo];
  if (!meta) throw new Error(T.errorTipo);

  // 1 GB = 1024 MB (base binaria, como reporta el SO)
  const capacidadMB = capacidadGB * 1024;

  const minutos = meta.esVideo ? Math.max(Number(i.minutosVideo) || 1, 0.1) : 1;
  const tamañoEfectivoMB = meta.esVideo ? meta.mb * minutos : meta.mb;

  const cantidad = Math.floor(capacidadMB / tamañoEfectivoMB);

  const labels = __lang === 'en' ? LABELS_EN : LABELS_ES;
  const nombre = labels[tipo] || tipo;

  const espacioPorItem = meta.esVideo
    ? `${meta.mb} MB/${T.min} × ${minutos} ${T.min} = ${tamañoEfectivoMB.toFixed(1)} MB`
    : `${meta.mb} MB ${T.perItem}`;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: nombre, value: cantidad },
    ],
    centerValue: cantidad.toLocaleString(locale),
    centerLabel: nombre,
    ariaLabel:
      __lang === 'en'
        ? `Number of ${nombre} that fit in ${capacidadGB} GB.`
        : `Cantidad de ${nombre} que entran en ${capacidadGB} GB.`,
  };

  const insight = {
    title: T.insightTitle,
    text:
      __lang === 'en'
        ? `In **${capacidadGB} GB** (${Math.round(capacidadMB).toLocaleString(locale)} MB) you can store about **${cantidad.toLocaleString(locale)} ${nombre}**${meta.esVideo ? ` of ${minutos} ${T.min} each` : ''}. Sizes are approximate averages and vary by quality and compression.`
        : `En **${capacidadGB} GB** (${Math.round(capacidadMB).toLocaleString(locale)} MB) entran aproximadamente **${cantidad.toLocaleString(locale)} ${nombre}**${meta.esVideo ? ` de ${minutos} ${T.min} cada uno` : ''}. Los tamaños son promedios aproximados y varían según calidad y compresión.`,
    tone: 'neutral' as const,
    icon: '💾',
  };

  return {
    cantidad,
    capacidadMB: Math.round(capacidadMB),
    espacioPorItem,
    formula: meta.esVideo
      ? `${Math.round(capacidadMB)} MB ÷ (${meta.mb} MB/min × ${minutos} min) = ${cantidad} ${nombre}`
      : `${Math.round(capacidadMB)} MB ÷ ${meta.mb} MB = ${cantidad} ${nombre}`,
    _chart: chart,
    _insight: insight,
  };
}
