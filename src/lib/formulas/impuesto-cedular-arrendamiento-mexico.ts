/**
 * ISR por arrendamiento de personas físicas (LISR Arts. 114-118).
 * Deducción real (sin tope legal) o ciega del 35% + predial pagado (Art. 115).
 * Tarifa ISR mensual 2026 desde src/lib/data/mexico-2026.ts (Anexo 8 RMF 2026).
 */
import { isrMensual2026, MEXICO_2026 } from '../data/mexico-2026.ts';

export interface Inputs {
  renta_mensual_cobrada: number;
  tipo_deduccion: 'real' | 'ciega';
  gastos_comprobables_mensual: number;
  ibi_predial_mensual: number;
  intereses_hipotecarios_mensual: number;
  mantenimiento_reparacion_mensual: number;
  retencion_inquilino_persona_moral: number;
  meses_calculo: number;
}

export interface Outputs {
  renta_total_periodo: number;
  deducciones_totales: number;
  porcentaje_deduccion: number;
  renta_neta: number;
  isr_calculado: number;
  menos_retencion: number;
  isr_a_pagar: number;
  tasa_efectiva: number;
  declaracion_tipo: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validaciones y defaults
  const renta_mensual = Math.max(0, i.renta_mensual_cobrada || 0);
  const meses = Math.max(1, Math.min(12, i.meses_calculo || 1));
  const tipo_ded = i.tipo_deduccion || 'ciega';

  // Renta total del período
  const renta_total_periodo = renta_mensual * meses;

  // Deducciones permitidas
  let deducciones_totales = 0;
  let porcentaje_deduccion = 0;

  if (tipo_ded === 'real') {
    // Deducción real (LISR Art. 115): suma de gastos comprobados con CFDI, SIN tope porcentual
    const ibi = Math.max(0, i.ibi_predial_mensual || 0);
    const intereses = Math.max(0, i.intereses_hipotecarios_mensual || 0);
    const mantenim = Math.max(0, i.mantenimiento_reparacion_mensual || 0);
    const otros_gastos = Math.max(0, i.gastos_comprobables_mensual || 0);

    const gastos_mensuales = ibi + intereses + mantenim + otros_gastos;
    deducciones_totales = gastos_mensuales * meses;

    porcentaje_deduccion = renta_total_periodo > 0 ? (deducciones_totales / renta_total_periodo) * 100 : 0;
  } else {
    // Deducción ciega (LISR Art. 115, 2º párrafo): 35% de los ingresos + el predial pagado del período
    const predial = Math.max(0, i.ibi_predial_mensual || 0) * meses;
    deducciones_totales = renta_total_periodo * MEXICO_2026.arrendamiento.deduccionCiega + predial;
    porcentaje_deduccion = renta_total_periodo > 0 ? (deducciones_totales / renta_total_periodo) * 100 : 35;
  }

  // Renta neta (base gravable)
  const renta_neta = Math.max(0, renta_total_periodo - deducciones_totales);

  // Tarifa ISR mensual 2026 (Art. 96 LISR, Anexo 8 RMF 2026) — fuente única mexico-2026.ts
  const renta_neta_mensual = renta_neta / meses;
  const isr_mensual = isrMensual2026(renta_neta_mensual);
  const isr_calculado = isr_mensual * meses;

  // Retención acreditable (inquilino persona moral 10%)
  const retencion = Math.max(0, i.retencion_inquilino_persona_moral || 0);
  const menos_retencion = retencion;

  // ISR a pagar
  const isr_a_pagar = Math.max(-999999, isr_calculado - menos_retencion);

  // Tasa efectiva
  const tasa_efectiva = renta_total_periodo > 0 ? (isr_a_pagar / renta_total_periodo) * 100 : 0;

  // Tipo de declaración
  let declaracion_tipo = 'Anual definitiva';
  if (meses === 1) {
    declaracion_tipo = 'Estimativa mensual (opcional)';
  }

  const fmtMXN = (v: number) => '$' + Math.round(Math.abs(v)).toLocaleString('es-MX');
  const metodo_txt = tipo_ded === 'real'
    ? `deducción de gastos comprobables (**${Math.round(porcentaje_deduccion)}%** de la renta)`
    : 'deducción ciega del **35%**';

  let insight: any;
  if (isr_a_pagar > 0) {
    insight = {
      title: 'ISR de tu arrendamiento',
      text: `Con la ${metodo_txt}, tu base gravable queda en **${fmtMXN(renta_neta)}** y pagás **${fmtMXN(isr_a_pagar)}** de ISR sobre los ${fmtMXN(renta_total_periodo)} cobrados (tasa efectiva del **${tasa_efectiva.toFixed(2)}%**).`,
      tone: 'warn',
      icon: '🏠',
    };
  } else if (isr_a_pagar < 0) {
    insight = {
      title: 'Tenés saldo a favor',
      text: `La retención de **${fmtMXN(menos_retencion)}** supera el ISR calculado (${fmtMXN(isr_calculado)}): te queda un saldo a favor de **${fmtMXN(isr_a_pagar)}** que podés acreditar o solicitar en devolución.`,
      tone: 'good',
      icon: '🏠',
    };
  } else {
    insight = {
      title: 'ISR de tu arrendamiento',
      text: `Con la ${metodo_txt}, tu base gravable queda en **${fmtMXN(renta_neta)}** y no te queda ISR por pagar este período sobre los ${fmtMXN(renta_total_periodo)} cobrados.`,
      tone: 'neutral',
      icon: '🏠',
    };
  }

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Base gravable (renta neta)', value: Math.round(renta_neta) },
      { label: 'Deducciones', value: Math.round(deducciones_totales) },
    ],
    prefix: '$',
    centerValue: fmtMXN(renta_total_periodo),
    centerLabel: 'Renta cobrada',
    ariaLabel: 'Composición de la renta cobrada: base gravable más deducciones aplicadas',
  };

  return {
    renta_total_periodo: Math.round(renta_total_periodo * 100) / 100,
    deducciones_totales: Math.round(deducciones_totales * 100) / 100,
    porcentaje_deduccion: Math.round(porcentaje_deduccion * 100) / 100,
    renta_neta: Math.round(renta_neta * 100) / 100,
    isr_calculado: Math.round(isr_calculado * 100) / 100,
    menos_retencion: Math.round(menos_retencion * 100) / 100,
    isr_a_pagar: Math.round(isr_a_pagar * 100) / 100,
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    declaracion_tipo: declaracion_tipo,
    _insight: insight,
    _chart: chart
  };
}
