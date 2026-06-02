/**
 * Calculadora de distancia hiperfocal por lente
 */

export interface Inputs {
  focal: number; apertura: number; sensor: number;
}

export interface Outputs {
  hiperfocal: string; zonaNitida: string; foregroundMin: string; consejo: string; _insight?: any; _chart?: any;
}

export function distanciaHiperfocalLente(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const ap = Number(inputs.apertura);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !ap || !s) throw new Error('Completá los campos');
  const coc: Record<number, number> = { 1: 0.030, 2: 0.020, 3: 0.015 };
  const c = coc[s] || 0.030;
  const H = (f * f) / (ap * c); // mm
  const nearMm = H / 2;
  const fmtM = (mm: number) => mm >= 1000 ? `${(mm/1000).toFixed(2)} m` : `${mm.toFixed(0)} mm`;
  let tip = '';
  if (H < 1500) tip = 'Hiperfocal corta: ideal para foreground muy cercano.';
  else if (H < 5000) tip = 'Hiperfocal media: paisajes típicos con foreground mediano.';
  else tip = 'Hiperfocal larga: focal muy tele o apertura abierta. Considerá cerrar más o focal más corta.';
  const Hr = Math.round(H);
  const _insight = {
    title: 'Tu zona de enfoque',
    text: `Con **${f} mm a f/${ap}**, la hiperfocal es **${fmtM(H)}**: enfocando ahí, todo queda nítido desde **${fmtM(nearMm)}** hasta el **infinito**. ${tip}`,
    tone: H < 5000 ? 'good' : 'warn',
    icon: '🏔️',
  };
  const lastMax = Math.max(8000, Math.ceil(Hr / 1000) * 1000 + 1000);
  const _chart = {
    type: 'scale',
    marker: Hr,
    markerLabel: fmtM(H),
    min: 0,
    segments: [
      { nombre: 'Corta', max: 1500, color: '#34d399', colorDark: '#10b981' },
      { nombre: 'Media', max: 5000, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Larga', max: lastMax, color: '#f87171', colorDark: '#ef4444' },
    ],
    ariaLabel: `Distancia hiperfocal de ${fmtM(H)} ubicada en la escala corta-media-larga`,
  };
  return {
    hiperfocal: fmtM(H),
    zonaNitida: `Desde ${fmtM(nearMm)} hasta ∞`,
    foregroundMin: fmtM(nearMm),
    consejo: tip,
    _insight,
    _chart,
  };
}
