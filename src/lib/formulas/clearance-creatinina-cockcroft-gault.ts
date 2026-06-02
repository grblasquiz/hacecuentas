/** Clearance de creatinina — Cockcroft-Gault (1976) */
export interface Inputs {
  edad: number;
  peso: number;
  creatinina: number;
  sexo: string;
}
export interface Outputs {
  clearance: number;
  estadio: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function clearanceCreatininaCockcroftGault(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const peso = Number(i.peso);
  const cr = Number(i.creatinina);
  const sexo = String(i.sexo || 'm');

  if (!edad || edad < 18) throw new Error('Ingresá la edad (mínimo 18 años)');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso en kg');
  if (!cr || cr <= 0) throw new Error('Ingresá la creatinina sérica en mg/dL');

  // Cockcroft-Gault
  let clcr = ((140 - edad) * peso) / (72 * cr);
  if (sexo === 'f') clcr *= 0.85;

  // Estadio KDIGO
  let estadio: string;
  if (clcr >= 90) estadio = 'G1 — Función renal normal (≥90 ml/min)';
  else if (clcr >= 60) estadio = 'G2 — Levemente disminuida (60-89 ml/min)';
  else if (clcr >= 45) estadio = 'G3a — Leve a moderadamente disminuida (45-59 ml/min)';
  else if (clcr >= 30) estadio = 'G3b — Moderada a severamente disminuida (30-44 ml/min)';
  else if (clcr >= 15) estadio = 'G4 — Severamente disminuida (15-29 ml/min)';
  else estadio = 'G5 — Fallo renal (<15 ml/min) — evaluación para diálisis';

  const detalle =
    `Fórmula: [(140 − ${edad}) × ${peso}] / (72 × ${cr})${sexo === 'f' ? ' × 0,85' : ''} = ${clcr.toFixed(1)} ml/min | ` +
    `${estadio}. ` +
    `⚠️ Orientativo — no reemplaza evaluación nefrológica.`;

  const clr = Number(clcr.toFixed(1));
  const tone = clr >= 60 ? 'good' : clr >= 30 ? 'warn' : 'warn';
  const topMax = Math.max(120, Math.ceil(clr + 10));

  return {
    clearance: clr,
    estadio,
    detalle,
    _insight: {
      title: 'Qué dice tu filtrado renal',
      text: `Con creatinina **${cr} mg/dL** a los **${edad}** años, el clearance estimado es **${clr} ml/min**, que corresponde al estadio **${estadio.split('—')[0].trim()}**. ${clr >= 60 ? 'Está dentro del rango funcional; mantené el control de rutina.' : clr >= 30 ? 'Hay disminución moderada: conviene evaluación nefrológica y revisar dosis de fármacos de eliminación renal.' : 'Es una caída marcada del filtrado: requiere seguimiento nefrológico cercano.'} Valor orientativo, no reemplaza una evaluación médica.`,
      tone,
      icon: '🩺',
    },
    _chart: {
      type: 'scale',
      marker: clr,
      markerLabel: clr + ' ml/min',
      min: 0,
      segments: [
        { nombre: 'G5 fallo', max: 15, color: '#7f1d1d', colorDark: '#450a0a' },
        { nombre: 'G4 severa', max: 30, color: '#ef4444', colorDark: '#7f1d1d' },
        { nombre: 'G3b', max: 45, color: '#f97316', colorDark: '#7c2d12' },
        { nombre: 'G3a', max: 60, color: '#fde68a', colorDark: '#78350f' },
        { nombre: 'G2 leve', max: 90, color: '#bef264', colorDark: '#3f6212' },
        { nombre: 'G1 normal', max: topMax, color: '#86efac', colorDark: '#14532d' },
      ],
      ariaLabel: `Clearance de creatinina ${clr} ml/min, estadio ${estadio.split('—')[0].trim()}`,
    },
  };
}
