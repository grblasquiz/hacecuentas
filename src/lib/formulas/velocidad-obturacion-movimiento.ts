/**
 * Calculadora de velocidad de obturación para congelar o dar movimiento
 */

export interface Inputs {
  velocidadSujeto: number; distancia: number; focal: number;
}

export interface Outputs {
  congelar: string; ligeroBlur: string; panningRec: string;
}

export function velocidadObturacionMovimiento(inputs: Inputs): Outputs {
  const v = Number(inputs.velocidadSujeto) / 3.6;
  const d = Number(inputs.distancia);
  const f = Number(inputs.focal);
  if (!v || !d || !f) throw new Error('Completá los campos');
  const angular = v / d;
  const tipicas = [15, 30, 60, 125, 250, 500, 1000, 2000, 4000, 8000];
  const pickNear = (target: number) => tipicas.reduce((p, c) => Math.abs(c - target) < Math.abs(p - target) ? c : p);
  // Pixel movido por segundo proporcional a angular * focal
  const factor = angular * f / 1000;
  const congelarNum = 1 / (factor * 1.5 / 100);
  const blurNum = 1 / (factor * 6 / 100);
  const panningNum = 1 / (factor * 30 / 100);
  return {
    congelar: `1/${pickNear(congelarNum)} s`,
    ligeroBlur: `1/${pickNear(blurNum)} s`,
    panningRec: `1/${pickNear(panningNum)} s`,
  };
}
