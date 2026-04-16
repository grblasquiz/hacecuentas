/** Bienes Personales 2026 — Ley 27.743 (diferenciado del existente: foco en simulación rápida) */

export interface Inputs {
  totalBienesPais: number;
  totalBienesExterior: number;
  inmuebleCasaHabitacion: number;
  adheridoReibp: string;
}

export interface Outputs {
  baseImponible: number;
  impuesto: number;
  alicuotaEfectiva: number;
  reibpAlternativo: number;
  mejorOpcion: string;
  formula: string;
  explicacion: string;
}

const MNI = 350_000_000;
const DEDUCCION_CASA = 450_000_000;
const REIBP_TASA = 0.0045;

const ESCALA = [
  { hasta: 250_000_000, tasa: 0.005, acum: 0 },
  { hasta: 500_000_000, tasa: 0.0075, acum: 1_250_000 },
  { hasta: 1_000_000_000, tasa: 0.01, acum: 3_125_000 },
  { hasta: Infinity, tasa: 0.015, acum: 8_125_000 },
];

function calcBP(excedente: number): number {
  if (excedente <= 0) return 0;
  for (const e of ESCALA) {
    if (excedente <= e.hasta) {
      const prev = ESCALA.indexOf(e) > 0 ? ESCALA[ESCALA.indexOf(e) - 1].hasta : 0;
      return e.acum + (excedente - prev) * e.tasa;
    }
  }
  const last = ESCALA[ESCALA.length - 1];
  const prev = ESCALA[ESCALA.length - 2].hasta;
  return last.acum + (excedente - prev) * last.tasa;
}

export function bienesPersonales2026(i: Inputs): Outputs {
  const pais = Number(i.totalBienesPais) || 0;
  const exterior = Number(i.totalBienesExterior) || 0;
  const casa = Number(i.inmuebleCasaHabitacion) || 0;
  const reibp = i.adheridoReibp === 'si' || i.adheridoReibp === 'true';

  const totalBienes = pais + exterior;
  if (totalBienes <= 0) throw new Error('Ingresá el valor de tus bienes');

  const deduccionCasa = Math.min(casa, DEDUCCION_CASA);
  const baseImponible = Math.max(0, totalBienes - deduccionCasa - MNI);

  let impuesto: number;
  if (reibp) {
    impuesto = totalBienes * REIBP_TASA;
  } else {
    impuesto = calcBP(baseImponible);
  }

  const alicuotaEfectiva = totalBienes > 0 ? (impuesto / totalBienes) * 100 : 0;
  const reibpAlternativo = totalBienes * REIBP_TASA;
  const impuestoNormal = calcBP(baseImponible);
  const mejorOpcion = reibpAlternativo < impuestoNormal ? 'REIBP' : 'Régimen general';

  const formula = reibp
    ? `REIBP = $${totalBienes.toLocaleString()} × 0.45% = $${Math.round(impuesto).toLocaleString()}`
    : `BP = escala($${Math.round(baseImponible).toLocaleString()}) = $${Math.round(impuesto).toLocaleString()}`;

  const explicacion = `Bienes totales: $${totalBienes.toLocaleString()} (país $${pais.toLocaleString()} + exterior $${exterior.toLocaleString()}).${casa > 0 ? ` Deducción casa: $${deduccionCasa.toLocaleString()}.` : ''} MNI: $${MNI.toLocaleString()}. Base imponible: $${baseImponible.toLocaleString()}. ${reibp ? `Con REIBP: $${Math.round(impuesto).toLocaleString()} (0.45% fijo).` : `Impuesto: $${Math.round(impuesto).toLocaleString()} (alícuota efectiva ${alicuotaEfectiva.toFixed(3)}%).`} Comparativa: régimen general $${Math.round(impuestoNormal).toLocaleString()} vs REIBP $${Math.round(reibpAlternativo).toLocaleString()} → conviene ${mejorOpcion}.`;

  return {
    baseImponible: Math.round(baseImponible),
    impuesto: Math.round(impuesto),
    alicuotaEfectiva: Number(alicuotaEfectiva.toFixed(4)),
    reibpAlternativo: Math.round(reibpAlternativo),
    mejorOpcion,
    formula,
    explicacion,
  };
}
