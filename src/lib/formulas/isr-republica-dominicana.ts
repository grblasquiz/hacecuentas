/** ISR República Dominicana — personas físicas
 *  Tabla Art. 296 Código Tributario (ajustada por inflación anual)
 *  Escala 2026 estimada basada en 2025
 */

export interface Inputs {
  ingresoAnualRd: number;
  deduccionesPersonales: number;
  retencionesAnuales: number;
}

export interface Outputs {
  rentaNetaGravable: number;
  impuestoBruto: number;
  retencionesAcreditadas: number;
  impuestoNeto: number;
  tasaEfectiva: number;
  tasaMarginal: number;
  formula: string;
  explicacion: string;
}

// Tabla ISR personas físicas 2026 (estimada con ajuste inflación ~4%)
// Exención anual estimada: RD$ 520,116
const EXENCION = 520_116;

const TABLA_ISR: Array<{
  desde: number; hasta: number; cuotaFija: number; tasa: number;
}> = [
  { desde: 0, hasta: EXENCION, cuotaFija: 0, tasa: 0 },
  { desde: EXENCION, hasta: 780_174, cuotaFija: 0, tasa: 15 },
  { desde: 780_174, hasta: 1_083_575, cuotaFija: 39_009, tasa: 20 },
  { desde: 1_083_575, hasta: Infinity, cuotaFija: 99_689, tasa: 25 },
];

export function isrRepublicaDominicana(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnualRd);
  const deducciones = Number(i.deduccionesPersonales) || 0;
  const retenciones = Number(i.retencionesAnuales) || 0;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso anual en RD$');

  const rentaNetaGravable = Math.max(0, ingreso - deducciones);

  let impuestoBruto = 0;
  let tasaMarginal = 0;

  for (const t of TABLA_ISR) {
    if (rentaNetaGravable > t.desde && rentaNetaGravable <= t.hasta) {
      impuestoBruto = t.cuotaFija + (rentaNetaGravable - t.desde) * (t.tasa / 100);
      tasaMarginal = t.tasa;
      break;
    }
    if (t.hasta === Infinity && rentaNetaGravable > t.desde) {
      impuestoBruto = t.cuotaFija + (rentaNetaGravable - t.desde) * (t.tasa / 100);
      tasaMarginal = t.tasa;
    }
  }

  const retencionesAcreditadas = Math.min(retenciones, impuestoBruto);
  const impuestoNeto = Math.max(0, impuestoBruto - retencionesAcreditadas);
  const tasaEfectiva = ingreso > 0 ? (impuestoNeto / ingreso) * 100 : 0;

  const formula = `ISR = cuota fija + (RD$${rentaNetaGravable.toLocaleString()} - tramo) × ${tasaMarginal}% = RD$${Math.round(impuestoBruto).toLocaleString()}`;
  const explicacion = `Ingreso anual: RD$${ingreso.toLocaleString()}${deducciones > 0 ? `. Deducciones: RD$${deducciones.toLocaleString()}` : ''}. Renta neta gravable: RD$${rentaNetaGravable.toLocaleString()}. ${rentaNetaGravable <= EXENCION ? 'Estás dentro de la exención anual, no pagás ISR.' : `ISR bruto: RD$${Math.round(impuestoBruto).toLocaleString()} (tasa marginal ${tasaMarginal}%).${retenciones > 0 ? ` Retenciones acreditadas: RD$${retencionesAcreditadas.toLocaleString()}.` : ''} ISR neto: RD$${Math.round(impuestoNeto).toLocaleString()} (tasa efectiva ${tasaEfectiva.toFixed(2)}%).`}`;

  return {
    rentaNetaGravable: Math.round(rentaNetaGravable),
    impuestoBruto: Math.round(impuestoBruto),
    retencionesAcreditadas: Math.round(retencionesAcreditadas),
    impuestoNeto: Math.round(impuestoNeto),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    tasaMarginal,
    formula,
    explicacion,
  };
}
