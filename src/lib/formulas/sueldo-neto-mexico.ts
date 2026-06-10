// Calculadora de Sueldo Neto México 2026
// Aplica tarifa ISR mensual (Art. 96 LISR), cuotas IMSS obrero (LSS) y subsidio al empleo (DOF 2026).
// Constantes (tarifa ISR mensual 2026, UMA, subsidio al empleo): fuente única
// src/lib/data/mexico-2026.ts (SAT Anexo 8 RMF 2026, INEGI, DOF 31-dic-2025).
import { MEXICO_2026, isrMensual2026, subsidioEmpleoMensual2026 } from '../data/mexico-2026';

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

// Cuota IMSS obrero simplificada 2026 (~2.775% del SBC) — LSS Arts. 106, 107, 147, 168
// Tope: 25 UMA mensuales (UMA mensual 2026 = $3.566,22 → tope ≈ $89.155,50)
const PORCENTAJE_IMSS_OBRERO = 0.02775;
const TOPE_SBC_25_UMA = MEXICO_2026.uma.mensual * MEXICO_2026.imss.topeSbcUmas;
const NUM_TRAMOS_ISR = MEXICO_2026.isrTarifaMensual.length;

// ISR mensual 2026 desde la fuente única, devolviendo además el tramo para el detalle.
function calcularISRMensual(base: number): { isr: number; tramo: number } {
  if (base <= 0) return { isr: 0, tramo: 0 };
  const isr = isrMensual2026(base);
  let tramo = NUM_TRAMOS_ISR;
  for (let i = 0; i < NUM_TRAMOS_ISR; i++) {
    const [limInf, limSup] = MEXICO_2026.isrTarifaMensual[i];
    if (base >= limInf && base <= limSup) { tramo = i + 1; break; }
  }
  return { isr, tramo };
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

  // 3) Subsidio para el empleo (Decreto DOF 31-dic-2025: monto fijo si no supera el tope)
  const spe = subsidioEmpleoMensual2026(bruto);

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
    `Bruto: $${bruto.toFixed(2)} | Tramo ISR: ${tramo}/${NUM_TRAMOS_ISR} | ISR: $${isr.toFixed(2)} | ` +
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
