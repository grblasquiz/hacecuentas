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
  _chart?: any;
  _insight?: any;
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

  let segments: Array<{ nombre: string; max: number; color: string; colorDark: string }>;
  if (ctx === 'postprandial') {
    segments = [
      { nombre: 'Hipoglucemia', max: 70, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 140, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Prediabetes', max: 200, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Diabetes', max: Math.max(260, Math.ceil(mgDL) + 20), color: '#fecaca', colorDark: '#b91c1c' },
    ];
  } else if (ctx === 'ayunas') {
    segments = [
      { nombre: 'Hipoglucemia', max: 70, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 100, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Prediabetes', max: 126, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Diabetes', max: Math.max(200, Math.ceil(mgDL) + 20), color: '#fecaca', colorDark: '#b91c1c' },
    ];
  } else {
    segments = [
      { nombre: 'Bajo', max: 70, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Rango típico', max: 200, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Elevada', max: Math.max(260, Math.ceil(mgDL) + 20), color: '#fecaca', colorDark: '#b91c1c' },
    ];
  }
  const chart = {
    type: 'scale' as const,
    marker: Number(mgDL.toFixed(0)),
    markerLabel: 'Tu valor: ' + mgDL.toFixed(0) + ' mg/dL',
    min: 0,
    unit: ' mg/dL',
    segments,
    ariaLabel: 'Escala de glucemia en mg/dL con zonas según criterios ADA.',
  };

  const esNormal = categoria.startsWith('Normal');
  const ctxTxt = ctx === 'ayunas' ? 'en ayunas' : ctx === 'postprandial' ? '2 h post comida' : 'aleatoria';
  const insightTone: 'good' | 'warn' = esNormal ? 'good' : 'warn';
  const insightText = esNormal
    ? `Con **${mgDL.toFixed(0)} mg/dL** (${mmolL.toFixed(2)} mmol/L) ${ctxTxt} caés en zona **${categoria.replace(' ✅', '')}**, dentro del rango de referencia (${rangoMgDL}). Un solo valor no diagnostica: lo importante es la tendencia.`
    : `Con **${mgDL.toFixed(0)} mg/dL** (${mmolL.toFixed(2)} mmol/L) ${ctxTxt} tu resultado cae en **${categoria}**, fuera del rango normal (${rangoMgDL}). Un valor aislado no confirma nada: repetí la medición y consultá con un profesional.`;
  const insight = {
    title: 'Cómo leer tu glucemia',
    text: insightText,
    tone: insightTone,
    icon: '🩸',
  };

  return {
    mgDL: Number(mgDL.toFixed(1)),
    mmolL: Number(mmolL.toFixed(2)),
    categoria,
    rangoNormalMgDL: rangoMgDL,
    rangoNormalMmolL: rangoMmolL,
    resumen: `${v} ${unidad.replace('-', '/').toUpperCase()} = ${mgDL.toFixed(0)} mg/dL = ${mmolL.toFixed(2)} mmol/L. Categoría: ${categoria}.`,
    _chart: chart,
    _insight: insight,
  };
}
