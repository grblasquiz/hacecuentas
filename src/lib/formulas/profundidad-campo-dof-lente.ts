/**
 * Calculadora de profundidad de campo (DoF) por lente
 */

export interface Inputs {
  focal: number; apertura: number; distancia: number; sensor: number;
}

export interface Outputs {
  dofTotal: string; dofCerca: string; dofLejos: string; hiperfocal: string; _insight?: any;
}

export function profundidadCampoDofLente(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const ap = Number(inputs.apertura);
  const d = Number(inputs.distancia) * 1000; // m → mm
  const s = Math.round(Number(inputs.sensor));
  if (!f || !ap || !d || !s) throw new Error('Completá los campos');
  const coc: Record<number, number> = { 1: 0.030, 2: 0.020, 3: 0.015 };
  const c = coc[s] || 0.030;
  const H = (f * f) / (ap * c); // mm
  const near = (d * H) / (H + d - f);
  const far = d < H ? (d * H) / (H - d + f) : Infinity;
  const dofTotal = far === Infinity ? Infinity : far - near;
  const fmtM = (mm: number) => mm === Infinity ? '∞' : mm >= 1000 ? `${(mm/1000).toFixed(2)} m` : `${mm.toFixed(0)} mm`;
  const _insight = {
    title: 'Tu zona enfocada',
    text: dofTotal === Infinity
      ? `Enfocando a **${fmtM(d)}** con f/${ap} superás la hiperfocal (**${fmtM(H)}**): la nitidez llega hasta el infinito. Encuadre ideal para paisajes.`
      : dofTotal < 300
        ? `Profundidad de campo de solo **${fmtM(dofTotal)}** a f/${ap}: márgen mínimo para aislar el sujeto con fondo desenfocado, pero el foco tiene que ser preciso.`
        : `Con f/${ap} a **${fmtM(d)}** tenés **${fmtM(dofTotal)}** de zona nítida. Subí el número f para ampliarla o bajalo para un fondo más cremoso.`,
    tone: 'neutral',
    icon: '📷',
  };
  return {
    dofTotal: dofTotal === Infinity ? 'Infinita (hiperfocal superada)' : fmtM(dofTotal),
    dofCerca: fmtM(d - near),
    dofLejos: far === Infinity ? '∞' : fmtM(far - d),
    hiperfocal: fmtM(H),
    _insight,
  };
}
