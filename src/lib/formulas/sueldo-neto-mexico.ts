// Calculadora de Sueldo Neto México 2026
// Aplica tarifa ISR mensual (Art. 96 LISR), cuotas IMSS obrero (LSS) y subsidio al empleo (DOF 2026).
// Fuente: SAT, IMSS, DOF — vigente para ejercicio fiscal 2026.

export interface Inputs {
  salarioBrutoMensual?: number;
  sueldoBrutoMensual?: number;
  numHijosCargo?: number;
  tieneInfonavit?: string | boolean;
  porcentajeInfonavit?: number;
  valesDespensa?: number;
}

export interface Outputs {
  salarioNeto: number;
  sueldoNeto: number;
  isrRetenido: number;
  isr: number;
  imssObrero: number;
  imss: number;
  infonavit: number;
  subsidioEmpleo: number;
  totalDescuentos: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Tarifa ISR mensual SAT 2026 (Art. 96 LISR)
// [limInf, limSup, cuotaFija, tasaExcedente]
const TARIFA_ISR_MENSUAL_2026: Array<[number, number, number, number]> = [
  [0.01, 746.04, 0.0, 0.0192],
  [746.05, 6332.05, 14.32, 0.064],
  [6332.06, 11128.01, 371.83, 0.1088],
  [11128.02, 12935.82, 893.63, 0.16],
  [12935.83, 15487.71, 1182.88, 0.1792],
  [15487.72, 31236.49, 1640.18, 0.2136],
  [31236.5, 49233.0, 5004.12, 0.2352],
  [49233.01, 93993.9, 9236.89, 0.3],
  [93993.91, 125325.2, 22665.17, 0.32],
  [125325.21, 375975.61, 32691.18, 0.34],
  [375975.62, Number.POSITIVE_INFINITY, 117912.32, 0.35],
];

// Tabla Subsidio para el Empleo mensual 2026 (DOF)
// [topeIngresoMensual, subsidio]
const TABLA_SPE_2026: Array<[number, number]> = [
  [1768.96, 407.02],
  [2653.38, 406.83],
  [3472.84, 406.62],
  [3537.87, 392.77],
  [4446.15, 382.46],
  [4717.18, 354.23],
  [5335.42, 324.87],
  [6224.67, 294.63],
  [7113.9, 253.54],
  [7382.33, 217.61],
  [Number.POSITIVE_INFINITY, 0],
];

// Cuota IMSS obrero simplificada 2026 (~2.775% del SBC) — LSS Arts. 106, 107, 147, 168
// Tope: 25 UMA mensuales (UMA mensual 2026 = $3,439.46 → tope ≈ $85,986.50)
const PORCENTAJE_IMSS_OBRERO = 0.02775;
const UMA_MENSUAL_2026 = 3439.46;
const TOPE_SBC_25_UMA = UMA_MENSUAL_2026 * 25;

function calcularISRMensual(base: number): { isr: number; tramo: number } {
  if (base <= 0) return { isr: 0, tramo: 0 };
  for (let i = 0; i < TARIFA_ISR_MENSUAL_2026.length; i++) {
    const [limInf, limSup, cuotaFija, tasa] = TARIFA_ISR_MENSUAL_2026[i];
    if (base >= limInf && base <= limSup) {
      const excedente = base - limInf;
      const isr = cuotaFija + excedente * tasa;
      return { isr: Math.round(isr * 100) / 100, tramo: i + 1 };
    }
  }
  // fallback: último tramo
  const last = TARIFA_ISR_MENSUAL_2026[TARIFA_ISR_MENSUAL_2026.length - 1];
  const isr = last[2] + (base - last[0]) * last[3];
  return { isr: Math.round(isr * 100) / 100, tramo: TARIFA_ISR_MENSUAL_2026.length };
}

function calcularSPE(base: number): number {
  for (const [tope, subsidio] of TABLA_SPE_2026) {
    if (base <= tope) return subsidio;
  }
  return 0;
}

function calcularIMSSObrero(base: number): number {
  const baseTopada = Math.min(base, TOPE_SBC_25_UMA);
  return Math.round(baseTopada * PORCENTAJE_IMSS_OBRERO * 100) / 100;
}

export function sueldoNetoMexico(inputs: Inputs): Outputs {
  // Aceptar ambos nombres de campo
  const bruto = Number(inputs.salarioBrutoMensual ?? inputs.sueldoBrutoMensual);
  const tieneInfonavit = inputs.tieneInfonavit === true || inputs.tieneInfonavit === 'true';
  const porcInfonavit = Number(inputs.porcentajeInfonavit) || 5;
  const vales = Number(inputs.valesDespensa) || 0;

  if (!isFinite(bruto) || bruto <= 0) {
    return {
      salarioNeto: 0,
      sueldoNeto: 0,
      isrRetenido: 0,
      isr: 0,
      imssObrero: 0,
      imss: 0,
      infonavit: 0,
      subsidioEmpleo: 0,
      totalDescuentos: 0,
      detalle: 'Ingresa un salario bruto mensual válido mayor a cero.',
    };
  }

  // 1) ISR
  const { isr, tramo } = calcularISRMensual(bruto);

  // 2) IMSS obrero
  const imss = calcularIMSSObrero(bruto);

  // 3) Subsidio para el empleo
  const spe = calcularSPE(bruto);

  // Lógica SPE: si SPE > ISR, neto suma diferencia. Si SPE <= ISR, reduce ISR.
  let isrEfectivo = isr;
  let speEntregado = 0;

  if (spe > 0) {
    if (spe >= isr) {
      isrEfectivo = 0;
      speEntregado = spe - isr; // diferencia adicional al neto
    } else {
      isrEfectivo = isr - spe;
      speEntregado = 0; // se acreditó contra ISR, no se entrega como adicional
    }
  }

  // 4) Infonavit (si aplica)
  const infonavit = tieneInfonavit
    ? Math.round(bruto * (porcInfonavit / 100) * 100) / 100
    : 0;

  // Vales de despensa se suman al neto (porción exenta, sin impacto en ISR/IMSS para este cálculo simplificado)
  const neto = Math.round((bruto - isrEfectivo - imss - infonavit + speEntregado + vales) * 100) / 100;
  const totalDesc = Math.round((isrEfectivo + imss + infonavit) * 100) / 100;
  const porcentaje = ((neto / bruto) * 100).toFixed(1);

  const detalle =
    `Bruto: $${bruto.toFixed(2)} | Tramo ISR: ${tramo}/11 | ISR: $${isr.toFixed(2)} | ` +
    `IMSS obrero (2.775%): $${imss.toFixed(2)} | ` +
    `Subsidio empleo: $${spe.toFixed(2)} (entregado al neto: $${speEntregado.toFixed(2)}) | ` +
    (tieneInfonavit ? `Infonavit (${porcInfonavit}%): $${infonavit.toFixed(2)} | ` : '') +
    (vales > 0 ? `Vales despensa: $${vales.toFixed(2)} | ` : '') +
    `Neto: $${neto.toFixed(2)} (${porcentaje}% del bruto)`;

  const centerTotal = Math.round(neto + isrEfectivo + imss + infonavit);

  const pctDesc = bruto > 0 ? Math.round((totalDesc / bruto) * 100) : 0;
  const insight = {
    title: 'Tu sueldo neto',
    text: speEntregado > 0
      ? `De tu bruto de **$${Math.round(bruto).toLocaleString('es-MX')}** te queda neto **$${Math.round(neto).toLocaleString('es-MX')}**. Por tu nivel de ingreso el subsidio al empleo cubre el ISR y hasta te suma **$${Math.round(speEntregado).toLocaleString('es-MX')}** extra al bolsillo.`
      : `De tu bruto de **$${Math.round(bruto).toLocaleString('es-MX')}** te queda neto **$${Math.round(neto).toLocaleString('es-MX')}** (te descuentan un **${pctDesc}%**). El ISR es **$${Math.round(isrEfectivo).toLocaleString('es-MX')}** y el IMSS obrero **$${Math.round(imss).toLocaleString('es-MX')}**.`,
    tone: (pctDesc >= 18 ? 'warn' : 'good') as 'good' | 'warn',
    icon: '🇲🇽',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      ...(isrEfectivo > 0 ? [{ label: 'ISR', value: Math.round(isrEfectivo) }] : []),
      { label: 'IMSS', value: Math.round(imss) },
      ...(infonavit > 0 ? [{ label: 'Infonavit', value: Math.round(infonavit) }] : []),
    ],
    prefix: '$',
    centerValue: '$' + centerTotal.toLocaleString('es-MX'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del salario: neto más descuentos (ISR, IMSS e Infonavit).',
  };

  return {
    salarioNeto: neto,
    sueldoNeto: neto,
    isrRetenido: Math.round(isrEfectivo * 100) / 100,
    isr: Math.round(isrEfectivo * 100) / 100,
    imssObrero: imss,
    imss,
    infonavit,
    subsidioEmpleo: Math.round(speEntregado * 100) / 100,
    totalDescuentos: totalDesc,
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
