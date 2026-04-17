/**
 * Calculadora de distancia hiperfocal por lente
 */

export interface Inputs {
  focal: number; apertura: number; sensor: number;
}

export interface Outputs {
  hiperfocal: string; zonaNitida: string; foregroundMin: string; consejo: string;
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
  return {
    hiperfocal: fmtM(H),
    zonaNitida: `Desde ${fmtM(nearMm)} hasta ∞`,
    foregroundMin: fmtM(nearMm),
    consejo: tip,
  };
}
