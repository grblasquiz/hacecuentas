/**
 * Ratio LDL/HDL y Castelli.
 */

export interface ColesterolLdlHdlRatioInputs {
  colesterolTotal: number;
  hdl: number;
  trigliceridos: number;
}

export interface ColesterolLdlHdlRatioOutputs {
  ldlCalculado: number;
  ratioLdlHdl: string;
  castelli: string;
  riesgo: string;
  resumen: string;
  _chart?: any;
}

export function colesterolLdlHdlRatio(inputs: ColesterolLdlHdlRatioInputs): ColesterolLdlHdlRatioOutputs {
  const ct = Number(inputs.colesterolTotal);
  const hdl = Number(inputs.hdl);
  const tg = Number(inputs.trigliceridos);
  if (!ct || !hdl || !tg) throw new Error('Ingresá todos los valores');
  const ldl = ct - hdl - tg / 5;
  const ratio = ldl / hdl;
  const castelli = ct / hdl;
  let riesgo: string;
  if (ratio < 2.5) riesgo = 'Óptimo ✅';
  else if (ratio < 3.5) riesgo = 'Moderado';
  else if (ratio < 5) riesgo = 'Alto ⚠️';
  else riesgo = 'Muy alto 🚨';
  const ratioMarker = Number(ratio.toFixed(2));

  const chart = {
    type: 'scale' as const,
    marker: ratioMarker,
    markerLabel: 'Ratio LDL/HDL: ' + ratioMarker,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Óptimo', max: 2.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderado', max: 3.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alto', max: 5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy alto', max: Math.max(7, Math.ceil(ratioMarker) + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de riesgo cardiovascular por ratio LDL/HDL: óptimo <2,5, moderado 2,5-3,5, alto 3,5-5, muy alto >5',
  };

  return {
    ldlCalculado: Number(ldl.toFixed(0)),
    ratioLdlHdl: ratio.toFixed(2),
    castelli: castelli.toFixed(2),
    riesgo,
    resumen: `LDL ${ldl.toFixed(0)}, ratio LDL/HDL ${ratio.toFixed(2)}, Castelli ${castelli.toFixed(2)} - ${riesgo}`,
    _chart: chart,
  };
}
