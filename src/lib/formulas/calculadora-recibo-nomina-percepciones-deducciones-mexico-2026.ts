/**
 * Recibo de nómina CFDI desglosado — México 2026.
 * Formato "percepciones − deducciones = neto" de un recibo de nómina timbrado (CFDI 4.0):
 *   Percepciones: sueldo gravado + (vales/previsión social exenta).
 *   Deducciones:  ISR (Art. 96 LISR) + IMSS obrero (LSS) − subsidio al empleo (DOF 2026).
 * Constantes (tarifa ISR mensual, UMA, subsidio): fuente única src/lib/data/mexico-2026.ts.
 */
import {
  MEXICO_2026,
  isrMensual2026,
  isrQuincenal2026,
  cuotaImssObreroMensual,
  subsidioEmpleoMensual2026,
  fmtMXN,
} from '../data/mexico-2026.ts';

export interface Inputs {
  salarioMensual?: number;        // sueldo bruto mensual ordinario (gravado)
  periodicidad?: string;          // 'mensual' | 'quincenal' (default mensual)
  prestacionesExentas?: number;   // vales de despensa / previsión social exenta del período
  tieneInfonavit?: string | boolean;
  __lang?: string;
}

export interface Outputs {
  netoRecibo: number;
  totalPercepciones: number;
  totalDeducciones: number;
  sueldoGravado: number;
  prestacionesExentas: number;
  isrRetenido: number;
  imssObrero: number;
  subsidioEmpleo: number;
  infonavit: number;
  periodicidad: string;
  detalle: string;
  formula: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const bruto = Number(i.salarioMensual);
  if (!Number.isFinite(bruto) || bruto <= 0) {
    throw new Error('Ingresá tu salario bruto mensual para armar el recibo.');
  }

  const periodo = String(i.periodicidad || 'mensual').toLowerCase() === 'quincenal' ? 'quincenal' : 'mensual';
  const divisor = periodo === 'quincenal' ? 2 : 1;
  const tieneInfonavit = i.tieneInfonavit === true || i.tieneInfonavit === 'true';

  // El recibo del período toma el sueldo proporcional al período.
  const sueldoGravado = r2(bruto / divisor);
  const exentas = Math.max(0, Number(i.prestacionesExentas) || 0);

  // ── ISR del período (tarifa mensual o quincenal proporcional, Art. 96 LISR) ──
  const isrBruto = periodo === 'quincenal' ? isrQuincenal2026(sueldoGravado) : isrMensual2026(sueldoGravado);

  // ── Subsidio para el empleo: se evalúa sobre el ingreso MENSUAL (tope $11.492,66) ──
  const subsidioMensual = subsidioEmpleoMensual2026(bruto);
  const subsidioPeriodo = r2(subsidioMensual / divisor);

  // Acreditamiento del subsidio contra el ISR (decreto DOF 31-dic-2025).
  let isrEfectivo = isrBruto;
  let subsidioEntregado = 0;
  if (subsidioPeriodo > 0) {
    if (subsidioPeriodo >= isrBruto) {
      isrEfectivo = 0;
      subsidioEntregado = r2(subsidioPeriodo - isrBruto); // diferencia a favor del trabajador
    } else {
      isrEfectivo = r2(isrBruto - subsidioPeriodo);
    }
  }

  // ── IMSS obrero del período (SBC ≈ sueldo gravado; tope 25 UMA, excedente >3 UMA) ──
  const imssMensual = cuotaImssObreroMensual(bruto);
  const imssObrero = r2(imssMensual / divisor);

  // ── INFONAVIT obrero: sólo si hay crédito vigente (5% del SBC como referencia) ──
  const infonavit = tieneInfonavit ? r2((bruto * 0.05) / divisor) : 0;

  // ── Estructura del recibo CFDI: percepciones − deducciones = neto ──
  const totalPercepciones = r2(sueldoGravado + exentas + subsidioEntregado);
  const totalDeducciones = r2(isrEfectivo + imssObrero + infonavit);
  const netoRecibo = r2(totalPercepciones - totalDeducciones);
  const pctNeto = sueldoGravado > 0 ? (netoRecibo / (sueldoGravado + exentas)) * 100 : 0;

  const detalle =
    `Percepciones: sueldo gravado ${fmtMXN(sueldoGravado)}` +
    (exentas > 0 ? ` + exento ${fmtMXN(exentas)}` : '') +
    (subsidioEntregado > 0 ? ` + subsidio ${fmtMXN(subsidioEntregado)}` : '') +
    ` = ${fmtMXN(totalPercepciones)} | ` +
    `Deducciones: ISR ${fmtMXN(isrEfectivo)} + IMSS obrero ${fmtMXN(imssObrero)}` +
    (infonavit > 0 ? ` + Infonavit ${fmtMXN(infonavit)}` : '') +
    ` = ${fmtMXN(totalDeducciones)} | Neto a pagar: ${fmtMXN(netoRecibo)} (${pctNeto.toFixed(1)}% del bruto del período)`;

  const formula = `Neto CFDI = Percepciones (${fmtMXN(totalPercepciones)}) − Deducciones (${fmtMXN(totalDeducciones)}) = ${fmtMXN(netoRecibo)}`;

  const _insight = {
    title: subsidioEntregado > 0 ? 'Tu recibo con subsidio al empleo' : 'Tu recibo neto del período',
    text:
      subsidioEntregado > 0
        ? `En tu recibo ${periodo}, las **percepciones** suman **${fmtMXN(totalPercepciones)}** (incluyen **${fmtMXN(subsidioEntregado)}** de subsidio al empleo a favor) y las **deducciones** sólo **${fmtMXN(totalDeducciones)}** de IMSS, así que cobrás **${fmtMXN(netoRecibo)}**.`
        : `De un sueldo gravado de **${fmtMXN(sueldoGravado)}** en el período ${periodo}, te descuentan **${fmtMXN(isrEfectivo)}** de ISR y **${fmtMXN(imssObrero)}** de IMSS obrero${infonavit > 0 ? ` (más ${fmtMXN(infonavit)} de Infonavit)` : ''}. Neto a pagar en el recibo: **${fmtMXN(netoRecibo)}** (≈${pctNeto.toFixed(0)}%).`,
    tone: (totalDeducciones / Math.max(1, sueldoGravado) >= 0.18 ? 'warn' : 'good') as 'good' | 'warn',
    icon: '🧾',
  };

  const _table = {
    title: `Recibo de nómina (CFDI) — período ${periodo}`,
    headers: ['Concepto', 'Tipo', 'Importe'],
    rows: [
      ['Sueldo ordinario', 'Percepción gravada', fmtMXN(sueldoGravado)],
      ...(exentas > 0 ? [['Prestaciones exentas (vales/previsión)', 'Percepción exenta', fmtMXN(exentas)]] : []),
      ...(subsidioEntregado > 0 ? [['Subsidio para el empleo', 'Percepción (a favor)', fmtMXN(subsidioEntregado)]] : []),
      ['ISR retenido', 'Deducción', '−' + fmtMXN(isrEfectivo)],
      ['IMSS (cuota obrero)', 'Deducción', '−' + fmtMXN(imssObrero)],
      ...(infonavit > 0 ? [['INFONAVIT (crédito)', 'Deducción', '−' + fmtMXN(infonavit)]] : []),
      ['Neto a pagar', 'Total', fmtMXN(netoRecibo)],
    ],
    note: 'Estructura de un CFDI de nómina 4.0: total de percepciones menos total de deducciones. El subsidio al empleo, cuando supera el ISR, aparece como percepción a favor del trabajador. El IMSS patronal (~25-35% del SBC) y el 5% del INFONAVIT patronal no se descuentan al trabajador.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(netoRecibo) },
      ...(isrEfectivo > 0 ? [{ label: 'ISR', value: Math.round(isrEfectivo) }] : []),
      { label: 'IMSS', value: Math.round(imssObrero) },
      ...(infonavit > 0 ? [{ label: 'Infonavit', value: Math.round(infonavit) }] : []),
    ],
    prefix: '$',
    centerValue: fmtMXN(sueldoGravado + exentas),
    centerLabel: 'Percepción',
    ariaLabel: `Reparto del recibo del período entre neto y deducciones (ISR, IMSS, Infonavit).`,
  };

  return {
    netoRecibo,
    totalPercepciones,
    totalDeducciones,
    sueldoGravado,
    prestacionesExentas: exentas,
    isrRetenido: isrEfectivo,
    imssObrero,
    subsidioEmpleo: subsidioEntregado,
    infonavit,
    periodicidad: periodo,
    detalle,
    formula,
    _insight,
    _table,
    _chart,
  };
}
