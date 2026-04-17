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
  return {
    ldlCalculado: Number(ldl.toFixed(0)),
    ratioLdlHdl: ratio.toFixed(2),
    castelli: castelli.toFixed(2),
    riesgo,
    resumen: `LDL ${ldl.toFixed(0)}, ratio LDL/HDL ${ratio.toFixed(2)}, Castelli ${castelli.toFixed(2)} - ${riesgo}`,
  };
}
