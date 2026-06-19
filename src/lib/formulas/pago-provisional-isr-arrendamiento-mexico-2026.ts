/**
 * Calculadora del PAGO PROVISIONAL de ISR por ARRENDAMIENTO de inmuebles
 * (personas físicas) — México 2026.
 *
 * Base legal: LISR Capítulo III del Título IV (Arts. 114-118).
 *  - Art. 116: pagos provisionales MENSUALES (o TRIMESTRALES si los ingresos
 *    mensuales no exceden 10 salarios mínimos generales elevados al mes).
 *  - Art. 115: deducciones autorizadas → opción REALES (predial, mantenimiento,
 *    intereses, etc.) o DEDUCCIÓN CIEGA del 35% del ingreso + el predial pagado.
 *  - Art. 96: tarifa mensual del ISR aplicada a la base gravable del periodo.
 *  - Art. 116 último párrafo: retención del 10% cuando el inquilino es persona moral,
 *    acreditable contra el pago provisional.
 *
 * Pago provisional = ISR de tarifa(base) − retención 10% (si persona moral).
 *  base = ingreso del periodo − deducciones del periodo.
 */

import { MEXICO_2026, isrMensual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  rentaMensual: number;
  tipoDeduccion?: 'ciega' | 'reales';
  predialAnual?: number;
  gastosRealesMensuales?: number;
  tipoInquilino?: 'fisica' | 'moral';
  // retro-compat / alias
  renta?: number;
  retencion?: number;
}

export interface Outputs {
  periodicidad: string;
  baseGravableMensual: number;
  deduccionAplicada: number;
  isrCausadoMensual: number;
  retencion10Mensual: number;
  pagoProvisionalMensual: number;
  pagoProvisionalTrimestral: number;
  tasaEfectiva: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.\-]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function pagoProvisionalIsrArrendamientoMexico2026(i: Inputs): Outputs {
  const renta = num(i.rentaMensual ?? i.renta);
  if (renta <= 0) throw new Error('Ingresá la renta mensual que cobrás');

  const tipoDeduccion: 'ciega' | 'reales' = i.tipoDeduccion === 'reales' ? 'reales' : 'ciega';
  const predialAnual = Math.max(0, num(i.predialAnual));
  const gastosRealesMensuales = Math.max(0, num(i.gastosRealesMensuales));
  const esMoral = i.tipoInquilino === 'moral';

  const { arrendamiento, salarioMinimo, uma } = MEXICO_2026;
  const predialMensual = predialAnual / 12;

  // ── Deducción del periodo (mensual) ──
  // Ciega: 35% del ingreso + predial mensualizado (Art. 115, último párrafo).
  // Reales: gastos comprobables del mes + predial mensualizado (predial entra en ambas).
  const deduccionCiega = renta * arrendamiento.deduccionCiega + predialMensual;
  const deduccionReales = gastosRealesMensuales + predialMensual;
  const deduccionAplicada = tipoDeduccion === 'ciega' ? deduccionCiega : deduccionReales;

  // ── Base gravable mensual ──
  const baseGravableMensual = Math.max(0, renta - deduccionAplicada);

  // ── ISR causado del periodo (tarifa mensual Art. 96) ──
  const isrCausadoMensual = isrMensual2026(baseGravableMensual);

  // ── Retención 10% del ingreso bruto si el inquilino es persona moral (acreditable) ──
  const retencion10Mensual = esMoral ? renta * arrendamiento.retencionPersonaMoral : 0;

  // ── Pago provisional a enterar = ISR causado − retención (no puede ser negativo) ──
  const pagoProvisionalMensual = Math.max(0, isrCausadoMensual - retencion10Mensual);
  const pagoProvisionalTrimestral = pagoProvisionalMensual * 3;

  // ── Periodicidad: trimestral si el ingreso mensual ≤ 10 salarios mínimos elevados al mes (Art. 116) ──
  const salarioMinimoMensual = salarioMinimo.generalMensual; // 315.04 × 30.4
  const topeTrimestralSMG = salarioMinimoMensual * 10; // 10 SMG elevados al mes (texto literal del Art. 116)
  const topeTrimestralUMA = uma.mensual * 10;          // lectura UMA (criterio usado por el SAT tras la desindexación)
  const puedeTrimestral = renta <= topeTrimestralSMG;

  const periodicidad = puedeTrimestral
    ? `Podés optar por pago TRIMESTRAL (ingreso ≤ 10 salarios mínimos al mes = ${fmtMXN(topeTrimestralSMG)})`
    : `Pago MENSUAL obligatorio (tu ingreso supera 10 salarios mínimos al mes)`;

  const tasaEfectiva = renta > 0 ? Math.round((pagoProvisionalMensual / renta) * 1000) / 10 : 0;

  // ── Detalle ──
  const lineas: string[] = [];
  lineas.push(`Renta del mes: ${fmtMXN(renta)}.`);
  if (tipoDeduccion === 'ciega') {
    lineas.push(
      `Deducción ciega: 35% × ${fmtMXN(renta)} = ${fmtMXN(renta * arrendamiento.deduccionCiega)}` +
        (predialAnual > 0 ? ` + predial mensualizado ${fmtMXN(predialMensual)}` : '') +
        ` = ${fmtMXN(deduccionAplicada)}.`
    );
  } else {
    lineas.push(
      `Deducción real: gastos comprobables ${fmtMXN(gastosRealesMensuales)}` +
        (predialAnual > 0 ? ` + predial mensualizado ${fmtMXN(predialMensual)}` : '') +
        ` = ${fmtMXN(deduccionAplicada)}.`
    );
  }
  lineas.push(`Base gravable: ${fmtMXN(renta)} − ${fmtMXN(deduccionAplicada)} = ${fmtMXN(baseGravableMensual)}.`);
  lineas.push(`ISR causado (tarifa mensual Art. 96, Anexo 8 RMF 2026): ${fmtMXN(isrCausadoMensual)}.`);
  if (esMoral) {
    lineas.push(`Retención del inquilino persona moral (10% de ${fmtMXN(renta)}): ${fmtMXN(retencion10Mensual)}, acreditable.`);
    lineas.push(`Pago provisional a enterar: ${fmtMXN(isrCausadoMensual)} − ${fmtMXN(retencion10Mensual)} = ${fmtMXN(pagoProvisionalMensual)}.`);
  } else {
    lineas.push(`Pago provisional a enterar (inquilino persona física, sin retención): ${fmtMXN(pagoProvisionalMensual)}.`);
  }
  const detalle = lineas.join(' ');

  // ── Insight ──
  const ahorroVsOtra = tipoDeduccion === 'ciega'
    ? isrMensual2026(Math.max(0, renta - deduccionReales)) - isrCausadoMensual
    : isrMensual2026(Math.max(0, renta - deduccionCiega)) - isrCausadoMensual;

  let insightText: string;
  if (esMoral && retencion10Mensual >= isrCausadoMensual) {
    insightText =
      `Como tu inquilino es **persona moral**, te retiene **${fmtMXN(retencion10Mensual)}** al mes, que cubre por completo tu ISR causado (**${fmtMXN(isrCausadoMensual)}**): **no enterás nada** en el provisional y la diferencia se acredita en tu declaración anual.`;
  } else if (tipoDeduccion === 'ciega') {
    insightText =
      `Con la **deducción ciega del 35%** tu pago provisional es **${fmtMXN(pagoProvisionalMensual)}** al mes (**${tasaEfectiva}%** de la renta). ` +
      (ahorroVsOtra > 0
        ? `Te conviene la ciega: con deducciones reales pagarías ${fmtMXN(ahorroVsOtra)} más al mes.`
        : `Si tus gastos comprobables superan el 35% de la renta (${fmtMXN(renta * arrendamiento.deduccionCiega)}), evaluá las deducciones reales.`);
  } else {
    insightText =
      `Con **deducciones reales** tu pago provisional es **${fmtMXN(pagoProvisionalMensual)}** al mes (**${tasaEfectiva}%** de la renta). ` +
      (ahorroVsOtra > 0
        ? `Te conviene la real: con la ciega del 35% pagarías ${fmtMXN(ahorroVsOtra)} más al mes.`
        : `La ciega del 35% te daría un pago igual o menor; revisá cuál te conviene.`);
  }

  const _insight = {
    title: puedeTrimestral ? 'Podés pagar por trimestre' : 'Pago provisional mensual',
    text: insightText,
    tone: esMoral && retencion10Mensual >= isrCausadoMensual ? 'good' : 'neutral',
    icon: '🏠',
  };

  const out: Outputs = {
    periodicidad,
    baseGravableMensual: Number(baseGravableMensual.toFixed(2)),
    deduccionAplicada: Number(deduccionAplicada.toFixed(2)),
    isrCausadoMensual: Number(isrCausadoMensual.toFixed(2)),
    retencion10Mensual: Number(retencion10Mensual.toFixed(2)),
    pagoProvisionalMensual: Number(pagoProvisionalMensual.toFixed(2)),
    pagoProvisionalTrimestral: Number(pagoProvisionalTrimestral.toFixed(2)),
    tasaEfectiva,
    detalle,
    _insight,
  };

  // ── Chart: a dónde va cada peso de la renta del mes ──
  // El ISR causado del mes se reparte entre lo que te retiene el inquilino (acreditado) y lo
  // que enterás vos; el resto de la renta lo conservás (incluye la deducción y la base de tarifa baja).
  const retencionAcreditada = Math.min(retencion10Mensual, isrCausadoMensual);
  const slices = [
    { label: 'ISR a enterar', value: Number(pagoProvisionalMensual.toFixed(2)) },
  ];
  if (retencionAcreditada > 0) slices.push({ label: 'Retención acreditada', value: Number(retencionAcreditada.toFixed(2)) });
  slices.push({ label: 'Renta que conservás', value: Number(Math.max(0, renta - isrCausadoMensual).toFixed(2)) });

  out._chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmtMXN(renta),
    centerLabel: 'Renta mensual',
    ariaLabel: 'Reparto de la renta mensual entre el ISR a enterar, la retención acreditada y la renta que conserva el arrendador',
  };

  return out;
}
