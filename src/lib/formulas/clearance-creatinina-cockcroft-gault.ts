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

  return {
    clearance: Number(clcr.toFixed(1)),
    estadio,
    detalle,
  };
}
