/** Conversión de glucemia: mg/dL ↔ mmol/L */
export interface Inputs {
  valor: number;
  unidadOrigen: string;
  contexto?: string; // 'ayunas' | 'postprandial' | 'aleatorio'
}
export interface Outputs {
  mgDL: number;
  mmolL: number;
  categoria: string;
  rangoNormalMgDL: string;
  rangoNormalMmolL: string;
  resumen: string;
}

// Factor: 1 mmol/L = 18.016 mg/dL
const FACTOR = 18.016;

export function glucemiaConversionMgDlMmolL(i: Inputs): Outputs {
  const v = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'mg-dl');
  const ctx = String(i.contexto || 'ayunas');
  if (!v || v <= 0) throw new Error('Ingresá un valor positivo');

  let mgDL = 0, mmolL = 0;
  if (unidad === 'mg-dl') {
    mgDL = v;
    mmolL = v / FACTOR;
  } else if (unidad === 'mmol-l') {
    mmolL = v;
    mgDL = v * FACTOR;
  } else throw new Error('Unidad no reconocida');

  // Clasificación ADA según contexto
  let categoria = '';
  let rangoMgDL = '';
  let rangoMmolL = '';

  if (ctx === 'ayunas') {
    rangoMgDL = '70–99 mg/dL';
    rangoMmolL = '3.9–5.5 mmol/L';
    if (mgDL < 54) categoria = 'Hipoglucemia grave — atención médica urgente';
    else if (mgDL < 70) categoria = 'Hipoglucemia leve';
    else if (mgDL < 100) categoria = 'Normal ✅';
    else if (mgDL < 126) categoria = 'Prediabetes (glucemia alterada en ayunas)';
    else categoria = 'Diabetes (si se confirma en segunda determinación)';
  } else if (ctx === 'postprandial') {
    rangoMgDL = '< 140 mg/dL (2 h post comida)';
    rangoMmolL = '< 7.8 mmol/L';
    if (mgDL < 54) categoria = 'Hipoglucemia grave';
    else if (mgDL < 70) categoria = 'Hipoglucemia leve';
    else if (mgDL < 140) categoria = 'Normal ✅';
    else if (mgDL < 200) categoria = 'Intolerancia a la glucosa (prediabetes)';
    else categoria = 'Diabetes (postprandial ≥ 200 mg/dL)';
  } else {
    rangoMgDL = '70–140 mg/dL';
    rangoMmolL = '3.9–7.8 mmol/L';
    if (mgDL < 70) categoria = 'Por debajo del rango típico';
    else if (mgDL < 200) categoria = 'Dentro del rango típico';
    else categoria = 'Elevada (≥ 200 mg/dL con síntomas sugiere diabetes)';
  }

  return {
    mgDL: Number(mgDL.toFixed(1)),
    mmolL: Number(mmolL.toFixed(2)),
    categoria,
    rangoNormalMgDL: rangoMgDL,
    rangoNormalMmolL: rangoMmolL,
    resumen: `${v} ${unidad.replace('-', '/').toUpperCase()} = ${mgDL.toFixed(0)} mg/dL = ${mmolL.toFixed(2)} mmol/L. Categoría: ${categoria}.`,
  };
}
