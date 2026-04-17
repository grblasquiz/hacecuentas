/**
 * Calculadora de ángulo de visión y ancho capturado
 */

export interface Inputs {
  focal: number; distancia: number; sensor: number;
}

export interface Outputs {
  anchoCapturado: string; altoCapturado: string; anguloHorizontal: string; anguloDiagonal: string;
}

export function anchoAnguloLenteDistancia(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const d = Number(inputs.distancia);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !d || !s) throw new Error('Completá los campos');
  const sensores: Record<number, { w: number; h: number }> = {
    1: { w: 36, h: 24 },
    2: { w: 23.5, h: 15.6 },
    3: { w: 22.2, h: 14.8 },
    4: { w: 17.3, h: 13 },
  };
  const ss = sensores[s] || sensores[1];
  const aH = 2 * Math.atan((ss.w / 2) / f) * (180 / Math.PI);
  const aV = 2 * Math.atan((ss.h / 2) / f) * (180 / Math.PI);
  const diag = Math.sqrt(ss.w ** 2 + ss.h ** 2);
  const aD = 2 * Math.atan((diag / 2) / f) * (180 / Math.PI);
  const anchoM = 2 * d * Math.tan((aH * Math.PI / 180) / 2);
  const altoM = 2 * d * Math.tan((aV * Math.PI / 180) / 2);
  return {
    anchoCapturado: `${anchoM.toFixed(2)} m`,
    altoCapturado: `${altoM.toFixed(2)} m`,
    anguloHorizontal: `${aH.toFixed(1)}°`,
    anguloDiagonal: `${aD.toFixed(1)}°`,
  };
}
