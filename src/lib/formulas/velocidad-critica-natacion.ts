/** Velocidad Crítica de Natación (CSS) */
export interface Inputs {
  tiempo400min: number;
  tiempo400seg: number;
  tiempo200min: number;
  tiempo200seg: number;
}
export interface Outputs {
  cssPace: string;
  cssVelocidad: string;
  zonaRecuperacion: string;
  zonaUmbral: string;
  zonaVo2: string;
  mensaje: string;
}

function fmtPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function velocidadCriticaNatacion(i: Inputs): Outputs {
  const t400 = Number(i.tiempo400min) * 60 + Number(i.tiempo400seg);
  const t200 = Number(i.tiempo200min) * 60 + Number(i.tiempo200seg);
  if (t400 <= 0 || t200 <= 0) throw new Error('Ingresá tiempos válidos');
  if (t400 <= t200) throw new Error('El tiempo de 400m debe ser mayor que el de 200m');

  // CSS = (D2 - D1) / (T2 - T1) in m/s
  const cssMs = 200 / (t400 - t200);
  const cssPace100 = 100 / cssMs; // seconds per 100m

  const zonaRecuperacion = fmtPace(cssPace100 + 10) + ' /100m';
  const zonaUmbral = fmtPace(cssPace100 - 3) + ' a ' + fmtPace(cssPace100 + 3) + ' /100m';
  const zonaVo2 = fmtPace(cssPace100 - 8) + ' /100m';

  return {
    cssPace: fmtPace(cssPace100) + ' /100m',
    cssVelocidad: cssMs.toFixed(2) + ' m/s (' + (cssMs * 3.6).toFixed(1) + ' km/h)',
    zonaRecuperacion,
    zonaUmbral,
    zonaVo2,
    mensaje: `CSS: ${fmtPace(cssPace100)}/100m (${cssMs.toFixed(2)} m/s). Usá este pace para series de umbral.`
  };
}