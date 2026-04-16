/** Tasa de filtrado glomerular (eGFR) según CKD-EPI 2021 (sin coeficiente racial) */
export interface Inputs {
  creatinina: number;
  edad: number;
  sexo?: string;
}
export interface Outputs {
  egfr: number;
  estadio: string;
  descripcion: string;
  formula: string;
  resumen: string;
  _chart?: any;
}

export function tfgCreatinina(i: Inputs): Outputs {
  const cr = Number(i.creatinina); // mg/dL
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'mujer');

  if (!cr || cr <= 0 || cr > 20) throw new Error('Creatinina entre 0.1 y 20 mg/dL');
  if (!edad || edad < 18 || edad > 120) throw new Error('Edad entre 18 y 120 años (CKD-EPI es para adultos)');

  // CKD-EPI 2021 (sin coeficiente racial)
  // eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(−1.200) × 0.9938^edad × (1.012 si mujer)
  // mujeres: κ = 0.7, α = −0.241
  // hombres: κ = 0.9, α = −0.302
  const k = sexo === 'hombre' ? 0.9 : 0.7;
  const alpha = sexo === 'hombre' ? -0.302 : -0.241;
  const factorSexo = sexo === 'hombre' ? 1 : 1.012;

  const ratio = cr / k;
  const minTerm = Math.pow(Math.min(ratio, 1), alpha);
  const maxTerm = Math.pow(Math.max(ratio, 1), -1.200);
  const ageTerm = Math.pow(0.9938, edad);

  const egfr = 142 * minTerm * maxTerm * ageTerm * factorSexo;

  // Estadios de Enfermedad Renal Crónica (KDIGO)
  let estadio = '';
  let descripcion = '';
  if (egfr >= 90) {
    estadio = 'G1 — Función renal normal o aumentada';
    descripcion = 'eGFR ≥ 90 mL/min/1.73 m². Función renal normal. Si hay daño renal (proteinuria, alteraciones de imagen), consultá nefrólogo aunque la TFG sea normal.';
  } else if (egfr >= 60) {
    estadio = 'G2 — Disminución leve';
    descripcion = 'eGFR 60–89 mL/min/1.73 m². Aceptable si no hay otros marcadores de daño renal. Control anual.';
  } else if (egfr >= 45) {
    estadio = 'G3a — Disminución leve a moderada';
    descripcion = 'eGFR 45–59 mL/min/1.73 m². ERC moderada. Consultá con nefrólogo. Ajustar dosis de fármacos eliminados por riñón.';
  } else if (egfr >= 30) {
    estadio = 'G3b — Disminución moderada a severa';
    descripcion = 'eGFR 30–44 mL/min/1.73 m². ERC moderada-severa. Seguimiento nefrológico cada 3–6 meses.';
  } else if (egfr >= 15) {
    estadio = 'G4 — Disminución severa';
    descripcion = 'eGFR 15–29 mL/min/1.73 m². Pre-diálisis. Preparación para terapia de reemplazo renal.';
  } else {
    estadio = 'G5 — Insuficiencia renal terminal';
    descripcion = 'eGFR < 15 mL/min/1.73 m². Indicación de diálisis o trasplante renal.';
  }

  // Chart: escala con estadios G1-G5 y marker en la eGFR actual
  // Las categorías van de menor (G5) a mayor (G1), pero para la barra las ordenamos de menor a mayor eGFR
  const egfrRedondeado = Math.round(egfr * 10) / 10;
  const chart = {
    type: 'scale' as const,
    ariaLabel: `Escala de eGFR: tu valor ${egfrRedondeado} mL/min/1.73 m² corresponde a ${estadio.split('—')[0].trim()}.`,
    marker: egfrRedondeado,
    markerLabel: `Tu eGFR: ${egfrRedondeado}`,
    segments: [
      { nombre: 'G5', max: 15, color: '#d4a0a8', colorDark: '#7f1d1d' },
      { nombre: 'G4', max: 30, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'G3b', max: 45, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'G3a', max: 60, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'G2', max: 90, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'G1 (normal)', max: Math.max(120, Math.ceil(egfr) + 5), color: '#bbf7d0', colorDark: '#166534' },
    ],
    unit: 'mL/min/1.73 m²',
    min: 0,
  };

  return {
    egfr: Number(egfr.toFixed(1)),
    estadio,
    descripcion,
    formula: `CKD-EPI 2021: 142 × min(${cr}/${k}, 1)^${alpha} × max(${cr}/${k}, 1)^−1.200 × 0.9938^${edad}${sexo !== 'hombre' ? ' × 1.012' : ''}`,
    resumen: `Tu eGFR estimada es ${egfr.toFixed(1)} mL/min/1.73 m² → ${estadio}.`,
    _chart: chart,
  };
}
