/** Clearance de creatinina - Cockcroft-Gault */
export interface Inputs { creatinina: number; edad: number; peso: number; sexo: string; }
export interface Outputs { crcl: number; estadio: string; recomendacion: string; mensaje: string; _insight?: any; _chart?: any; }

export function clearanceCreatininaCockcroft(i: Inputs): Outputs {
  const cr = Number(i.creatinina);
  const edad = Number(i.edad);
  const peso = Number(i.peso);
  const sexo = String(i.sexo || 'masculino');
  if (!cr || cr <= 0) throw new Error('Ingresá la creatinina sérica');
  if (!edad || !peso) throw new Error('Completá edad y peso');

  // Cockcroft-Gault: CrCl = [(140 - age) × weight] / (72 × SCr)
  let crcl = ((140 - edad) * peso) / (72 * cr);
  if (sexo === 'femenino') crcl *= 0.85;
  crcl = Math.round(crcl);

  let estadio: string;
  let recomendacion: string;
  if (crcl >= 90) {
    estadio = 'Normal o G1 (≥90 ml/min)';
    recomendacion = 'Función renal normal. Seguir control anual de rutina.';
  } else if (crcl >= 60) {
    estadio = 'G2 — Leve disminución (60-89 ml/min)';
    recomendacion = 'Leve disminución, puede ser normal en >60 años. Controlar factores de riesgo y repetir en 6-12 meses.';
  } else if (crcl >= 45) {
    estadio = 'G3a — Moderada (45-59 ml/min)';
    recomendacion = 'Disminución moderada. Consultar nefrólogo. Ajustar medicamentos nefrotóxicos.';
  } else if (crcl >= 30) {
    estadio = 'G3b — Moderada-severa (30-44 ml/min)';
    recomendacion = 'Seguimiento nefrólogico obligatorio. Ajuste de dosis de múltiples medicamentos.';
  } else if (crcl >= 15) {
    estadio = 'G4 — Severa (15-29 ml/min)';
    recomendacion = 'Insuficiencia renal severa. Preparar para posible diálisis. Control estricto.';
  } else {
    estadio = 'G5 — Fallo renal (<15 ml/min)';
    recomendacion = 'Fallo renal. Diálisis o trasplante probablemente necesarios.';
  }

  const tone = crcl >= 60 ? 'good' : 'warn';
  const topMax = Math.max(120, crcl + 10);

  return {
    crcl,
    estadio,
    recomendacion,
    mensaje: `CrCl: ${crcl} ml/min. ${estadio}.`,
    _insight: {
      title: 'Qué dice tu filtrado renal',
      text: `Con creatinina **${cr} mg/dL** a los **${edad}** años, el clearance estimado es **${crcl} ml/min** → **${estadio.split('—')[0].trim()}**. ${recomendacion} Valor orientativo, no reemplaza la evaluación médica.`,
      tone,
      icon: '🩺',
    },
    _chart: {
      type: 'scale',
      marker: crcl,
      markerLabel: crcl + ' ml/min',
      min: 0,
      segments: [
        { nombre: 'G5 fallo', max: 15, color: '#7f1d1d', colorDark: '#450a0a' },
        { nombre: 'G4 severa', max: 30, color: '#ef4444', colorDark: '#7f1d1d' },
        { nombre: 'G3b', max: 45, color: '#f97316', colorDark: '#7c2d12' },
        { nombre: 'G3a', max: 60, color: '#fde68a', colorDark: '#78350f' },
        { nombre: 'G2 leve', max: 90, color: '#bef264', colorDark: '#3f6212' },
        { nombre: 'G1 normal', max: topMax, color: '#86efac', colorDark: '#14532d' },
      ],
      ariaLabel: `Clearance de creatinina ${crcl} ml/min, ${estadio.split('—')[0].trim()}`,
    },
  };
}