/**
 * Calculadora de crop factor y focal equivalente
 */

export interface Inputs {
  focalReal: number; aperturaReal: number; sensor: number;
}

export interface Outputs {
  focalEquivalente: string; aperturaEquivalente: string; angulo: string; resumen: string;
}

export function tamanoSensorCropFactor(inputs: Inputs): Outputs {
  const f = Number(inputs.focalReal);
  const a = Number(inputs.aperturaReal);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !a || !s) throw new Error('Completá los campos');
  const crop: Record<number, number> = { 1: 1.0, 2: 1.6, 3: 1.5, 4: 2.0, 5: 2.7, 6: 5.5 };
  const c = crop[s] || 1.0;
  const fEq = f * c;
  const aEq = a * c;
  // Angulo de visión horizontal full frame ref
  const sensorW = 36 / c; // mm horizontal
  const ang = 2 * Math.atan((sensorW / 2) / f) * (180 / Math.PI);
  return {
    focalEquivalente: `${fEq.toFixed(0)} mm FF`,
    aperturaEquivalente: `f/${aEq.toFixed(1)} (solo para DoF, exposición sigue f/${a.toFixed(1)})`,
    angulo: `${ang.toFixed(1)}° horizontal`,
    resumen: `Crop ${c}× → ${f}mm actúa como ${fEq.toFixed(0)}mm FF`,
  };
}
