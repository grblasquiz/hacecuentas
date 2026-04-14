/** Bienes Personales 2026 — Ley 23.966 con reforma Ley 27.743 (Bases) */
export interface Inputs {
  valorBienesPais: number;
  valorBienesExterior: number;
  incluyeInmuebleCasa?: boolean | string;
  valorCasaHabitacion?: number;
  regimenREIBP?: boolean | string;
}
export interface Outputs {
  baseImponible: number;
  minimoNoImponible: number;
  excedente: number;
  alicuota: number;
  impuesto: number;
  paga: boolean;
  mensaje: string;
}

// Escala 2026 (Ley 27.743): unificación de alícuotas país/exterior
// MNI: $292.994.206 (valor 2025 actualizado) — aproximamos a $350M para 2026
// Inmueble casa-habitación: deducción hasta $450M
const MNI = 350_000_000;
const DEDUCCION_CASA = 450_000_000;

// Escala progresiva 2026 aproximada
// Ley 27.743: alícuotas bajadas gradualmente 2024→2027, y "régimen especial" REIBP (tasa fija)
const ESCALA: Array<{ hasta: number; tasa: number; acumulado: number; }> = [
  { hasta: 250_000_000, tasa: 0.005, acumulado: 0 },
  { hasta: 500_000_000, tasa: 0.0075, acumulado: 1_250_000 },
  { hasta: 1_000_000_000, tasa: 0.01, acumulado: 3_125_000 },
  { hasta: Infinity, tasa: 0.015, acumulado: 8_125_000 },
];

export function bienesPersonales(i: Inputs): Outputs {
  const pais = Number(i.valorBienesPais) || 0;
  const exterior = Number(i.valorBienesExterior) || 0;
  const incluyeCasa = i.incluyeInmuebleCasa === true || i.incluyeInmuebleCasa === 'true' || i.incluyeInmuebleCasa === 'si';
  const casa = incluyeCasa ? (Number(i.valorCasaHabitacion) || 0) : 0;
  const reibp = i.regimenREIBP === true || i.regimenREIBP === 'true' || i.regimenREIBP === 'si';

  // Deducción casa habitación (solo si aplicable)
  const deduccionCasa = Math.min(casa, DEDUCCION_CASA);
  const baseBruta = pais + exterior - deduccionCasa;

  if (baseBruta <= MNI) {
    return {
      baseImponible: Math.max(0, baseBruta),
      minimoNoImponible: MNI,
      excedente: 0,
      alicuota: 0,
      impuesto: 0,
      paga: false,
      mensaje: `Estás por debajo del mínimo no imponible de $${(MNI / 1e6).toFixed(0)}M — no pagás Bienes Personales.`,
    };
  }

  const excedente = baseBruta - MNI;

  // REIBP (régimen especial): 0.45 % fijo por 5 años
  if (reibp) {
    const impuesto = baseBruta * 0.0045 * 5; // pago adelantado 5 años
    return {
      baseImponible: baseBruta,
      minimoNoImponible: MNI,
      excedente,
      alicuota: 0.45,
      impuesto: Math.round(impuesto),
      paga: true,
      mensaje: `REIBP: pagás el equivalente a 5 años por adelantado a la tasa fija de 0.45 %.`,
    };
  }

  // Escala progresiva sobre el excedente
  let tasa = 0;
  let impuesto = 0;
  for (let k = 0; k < ESCALA.length; k++) {
    const tramo = ESCALA[k];
    if (excedente <= tramo.hasta) {
      const desde = k === 0 ? 0 : ESCALA[k - 1].hasta;
      tasa = tramo.tasa;
      impuesto = tramo.acumulado + (excedente - desde) * tramo.tasa;
      break;
    }
  }

  return {
    baseImponible: baseBruta,
    minimoNoImponible: MNI,
    excedente,
    alicuota: Number((tasa * 100).toFixed(3)),
    impuesto: Math.round(impuesto),
    paga: true,
    mensaje: `Con base imponible de $${(baseBruta / 1e6).toFixed(1)}M te corresponde una alícuota marginal del ${(tasa * 100).toFixed(2)}%.`,
  };
}
