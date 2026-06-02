/**
 * Calculadora de tiempo de impresión 3D por altura de capa
 */

export interface Inputs {
  altura: number; layer: number; velocidad: number; areaCapa: number;
  __lang?: string;
}

export interface Outputs {
  horas: number; tiempoFormato: string; capas: number; segundosPorCapa: number;
  _insight?: any;
}

export function tiempoImpresion3dLayer(inputs: Inputs): Outputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorFields: 'Completá todos los campos',
      insightTitle: 'Estimación de impresión',
      insightLong: (cap: number, fmt: string, h: number) => `Con **${cap} capas** la impresión tarda unas **${fmt}**. Es un trabajo largo: dejá la impresora en una superficie estable y revisá las primeras capas antes de irte.`,
      insightMid: (cap: number, fmt: string) => `Son **${cap} capas** y unas **${fmt}** de impresión: un trabajo de media tarde. Verificá el filamento antes de arrancar.`,
      insightShort: (cap: number, fmt: string) => `Impresión rápida: **${cap} capas** en unas **${fmt}**. Ideal para una prueba o pieza chica.`,
    },
    en: {
      errorFields: 'Please fill in all fields',
      insightTitle: 'Print estimate',
      insightLong: (cap: number, fmt: string, h: number) => `With **${cap} layers** the print takes about **${fmt}**. It's a long job: keep the printer on a stable surface and check the first layers before walking away.`,
      insightMid: (cap: number, fmt: string) => `That's **${cap} layers** and about **${fmt}** of printing: a half-afternoon job. Check the filament before starting.`,
      insightShort: (cap: number, fmt: string) => `Quick print: **${cap} layers** in about **${fmt}**. Ideal for a test or small part.`,
    },
  } as const)[__lang];
  const altura = Number(inputs.altura);
  const layer = Number(inputs.layer);
  const vel = Number(inputs.velocidad);
  const area = Number(inputs.areaCapa);
  if (!altura || !layer || !vel || !area) throw new Error(T.errorFields);
  const capas = Math.ceil(altura / layer);
  const nozzle = 0.4;
  const extrusion = (area * 100) / (nozzle * layer);
  const factor = 0.38;
  const segCapa = (extrusion / vel) * factor;
  const totalSeg = capas * segCapa;
  const horas = totalSeg / 3600;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  const tiempoFmt = `${h}h ${m}min`;
  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (horas >= 8) { insightText = T.insightLong(capas, tiempoFmt, horas); insightTone = 'warn'; }
  else if (horas >= 2) { insightText = T.insightMid(capas, tiempoFmt); insightTone = 'neutral'; }
  else { insightText = T.insightShort(capas, tiempoFmt); insightTone = 'good'; }
  return {
    horas: Number(horas.toFixed(2)),
    tiempoFormato: tiempoFmt,
    capas,
    segundosPorCapa: Number(segCapa.toFixed(1)),
    _insight: { title: T.insightTitle, text: insightText, tone: insightTone, icon: '🖨️' },
  };
}
