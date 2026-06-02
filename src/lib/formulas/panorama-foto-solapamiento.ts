/**
 * Calculadora de panorama por fotos y solapamiento
 */

export interface Inputs {
  anguloTotal: number; focal: number; sensor: number; orientacion: number; overlap: number;
}

export interface Outputs {
  cantidadFotos: string; anguloPorFoto: string; anguloNuevo: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function panoramaFotoSolapamiento(inputs: Inputs): Outputs {
  const at = Number(inputs.anguloTotal);
  const f = Number(inputs.focal);
  const s = Math.round(Number(inputs.sensor));
  const ori = Math.round(Number(inputs.orientacion));
  const ov = Number(inputs.overlap);
  if (!at || !f || !s || !ori || !ov) throw new Error('Completá los campos');
  const sensores: Record<number, { w: number; h: number }> = {
    1: { w: 36, h: 24 },
    2: { w: 23.5, h: 15.6 },
    3: { w: 22.2, h: 14.8 },
    4: { w: 17.3, h: 13 },
  };
  const ss = sensores[s] || sensores[1];
  // Orientación 1=horizontal (sensor horizontal alineado), 2=vertical (rotar)
  const dim = ori === 1 ? ss.w : ss.h;
  const anguloSensor = 2 * Math.atan((dim / 2) / f) * (180 / Math.PI);
  const anguloUtil = anguloSensor * (1 - ov / 100);
  const cant = Math.ceil(at / anguloUtil) + 1;
  const anguloCubierto = anguloUtil * (cant - 1) + anguloSensor;
  let tip = '';
  if (cant < 5) tip = 'Pocas fotos: stitching rápido y fácil.';
  else if (cant < 10) tip = 'Paisaje típico. Trípode y exposición manual.';
  else if (cant < 20) tip = 'Panorama grande: cabezal nodal ayuda, stitching 5-10 min.';
  else tip = 'Panorama gigante: considerá multi-row, PTGui, 30+ min stitching.';
  const insightTone = cant < 10 ? 'good' : cant < 20 ? 'neutral' : 'warn';
  const insight = {
    title: 'Tu disparo en números',
    text: `Necesitás **${cant} fotos** con ${ov}% de solapamiento para cubrir los **${at}°** del panorama (cada toma aporta ${anguloUtil.toFixed(1)}° útiles de los ${anguloSensor.toFixed(1)}° del encuadre).`,
    tone: insightTone,
    icon: '📷',
  };
  const chart = {
    type: 'scale' as const,
    marker: cant,
    markerLabel: `${cant} fotos`,
    min: 1,
    segments: [
      { nombre: 'Rápido', max: 5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Típico', max: 10, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Grande', max: 20, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Gigante', max: Math.max(40, cant + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Cantidad de fotos del panorama (${cant}) ubicada en su zona de dificultad de stitching.`,
  };
  return {
    cantidadFotos: `${cant} fotos`,
    anguloPorFoto: `${anguloSensor.toFixed(1)}° (efectivo ${anguloUtil.toFixed(1)}°)`,
    anguloNuevo: `${anguloCubierto.toFixed(0)}° cubierto`,
    consejo: tip,
    _insight: insight,
    _chart: chart,
  };
}
