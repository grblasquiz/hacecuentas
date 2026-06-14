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
  _insight?: any;
  _chart?: any;
}

// Tabla ISR personas físicas — Art. 296 Código Tributario (DGII). La escala está
// CONGELADA desde 2017/2018: el Art. 327 exige ajuste anual por inflación pero las
// leyes de presupuesto sucesivas lo suspenden. Resolución DDG-AR1-2026-00001.
// Exención anual: RD$416.220 (RD$34.685/mes).
const EXENCION = 416_220;

const TABLA_ISR: Array<{
  desde: number; hasta: number; cuotaFija: number; tasa: number;
}> = [
  { desde: 0, hasta: EXENCION, cuotaFija: 0, tasa: 0 },
  { desde: EXENCION, hasta: 624_329, cuotaFija: 0, tasa: 15 },
  { desde: 624_329, hasta: 867_123, cuotaFija: 31_216, tasa: 20 },
  { desde: 867_123, hasta: Infinity, cuotaFija: 79_776, tasa: 25 },
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

  const teQueda = Math.max(0, rentaNetaGravable - impuestoBruto);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'ISR', value: Math.round(impuestoBruto) },
      { label: 'Te queda', value: Math.round(teQueda) },
    ],
    prefix: 'RD$',
    centerValue: 'RD$' + Math.round(rentaNetaGravable).toLocaleString('es-AR'),
    centerLabel: 'Renta gravable',
    ariaLabel: 'Composición de la renta neta gravable: ISR vs lo que te queda',
  };

  const fmtRd = (n: number) => 'RD$' + Math.round(n).toLocaleString('es-DO');
  const exento = rentaNetaGravable <= EXENCION;
  const _insight = {
    title: exento ? 'Estás dentro de la exención' : `Tu ISR efectivo es ${tasaEfectiva.toFixed(1)}%`,
    text: exento
      ? `Tu renta neta gravable de **${fmtRd(rentaNetaGravable)}** no supera la exención anual de **${fmtRd(EXENCION)}**, así que no pagás ISR.`
      : `Sobre una renta gravable de **${fmtRd(rentaNetaGravable)}** el ISR bruto es **${fmtRd(impuestoBruto)}** (tramo marginal **${tasaMarginal}%**).${retenciones > 0 ? ` Tras acreditar **${fmtRd(retencionesAcreditadas)}** retenidos, quedan **${fmtRd(impuestoNeto)}** por pagar` : ` ISR a pagar: **${fmtRd(impuestoNeto)}**`} (tasa efectiva **${tasaEfectiva.toFixed(1)}%**).`,
    tone: (exento ? 'good' : tasaMarginal >= 25 ? 'warn' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '🇩🇴',
  };

  return {
    rentaNetaGravable: Math.round(rentaNetaGravable),
    impuestoBruto: Math.round(impuestoBruto),
    retencionesAcreditadas: Math.round(retencionesAcreditadas),
    impuestoNeto: Math.round(impuestoNeto),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    tasaMarginal,
    formula,
    explicacion,
    _insight,
    _chart: chart,
  };
}
