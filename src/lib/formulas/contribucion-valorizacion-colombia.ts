/**
 * Contribución de valorización (Colombia) — compara pagar DE CONTADO (con descuento por
 * pronto pago) contra FINANCIAR en cuotas (con interés). La contribución la ASIGNA el
 * municipio por predio según el beneficio de la obra; esta herramienta NO calcula ese monto,
 * sólo modela las dos opciones de pago con los valores que trae tu resolución/factura.
 *
 * VERIFICADO: mecánica de amortización (sistema francés) y del descuento de contado.
 * REFERENCIAL: el % de descuento por pronto pago y la tasa de interés de financiación los fija
 * cada proyecto/municipio y varían — usá los que figuren en tu resolución de cobro.
 * Base legal: Decreto 1604 de 1966 (contribución de valorización, Ley 25 de 1921).
 */
import { fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  montoAsignado: number;         // monto de la contribución asignada por el municipio (COP)
  formaPago?: string;            // 'contado' | 'cuotas'
  numeroCuotas?: number;         // nº de cuotas mensuales (si formaPago = 'cuotas')
  descuentoContado?: number;     // % de descuento por pago de contado (referencial)
  tasaInteresMensual?: number;   // % mensual de financiación (referencial)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Lee un numérico opcional con fallback, tolerando '', null y undefined. */
function num(v: any, fallback: number): number {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function compute(i: Inputs): Outputs {
  const monto = i.montoAsignado === undefined || i.montoAsignado === null || (i.montoAsignado as any) === ''
    ? NaN : Number(i.montoAsignado);
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('Ingresa el monto de la contribución de valorización asignada a tu predio');
  }

  const formaPago = String(i.formaPago || 'cuotas') === 'contado' ? 'contado' : 'cuotas';
  const desc = Math.min(100, Math.max(0, num(i.descuentoContado, 5)));   // % referencial de pronto pago
  const tasa = Math.max(0, num(i.tasaInteresMensual, 1));                // % mensual referencial
  let n = Math.round(num(i.numeroCuotas, 12));
  if (!Number.isFinite(n) || n < 1) n = 1;                               // guard: evita dividir por 0

  // ── Opción 1: pago de contado con descuento ──
  const valorContado = Math.round(monto * (1 - desc / 100));
  const ahorroContado = Math.round(monto - valorContado);

  // ── Opción 2: financiación en cuotas fijas (amortización francesa) ──
  const r = tasa / 100;
  let cuota: number;
  if (r > 0) {
    cuota = (monto * r) / (1 - Math.pow(1 + r, -n));   // cuota fija con interés
  } else {
    cuota = monto / n;                                  // sin interés: reparto lineal
  }
  cuota = Math.round(cuota);
  const totalFinanciado = Math.round(cuota * n);
  const sobrecosto = Math.max(0, Math.round(totalFinanciado - monto));

  // Contado siempre es ≤ monto ≤ total financiado: la diferencia es lo que "cuesta" financiar.
  const brechaContadoVsCuotas = Math.round(totalFinanciado - valorContado);

  const recomendacion = formaPago === 'contado'
    ? `Pagando de contado desembolsás ${fmtCOP(valorContado)} hoy y te ahorrás ${fmtCOP(ahorroContado)} por el ${desc}% de descuento. Frente a financiar en ${n} cuotas (${fmtCOP(totalFinanciado)} en total) la diferencia a favor del contado es de ${fmtCOP(brechaContadoVsCuotas)}.`
    : `Financiar en ${n} cuotas de ${fmtCOP(cuota)} suma ${fmtCOP(totalFinanciado)} y agrega ${fmtCOP(sobrecosto)} en intereses. Si tenés el capital, pagar de contado bajaría el costo a ${fmtCOP(valorContado)} (ahorro total de ${fmtCOP(brechaContadoVsCuotas)}).`;

  const detalle = `Contribución asignada ${fmtCOP(monto)}. Contado con ${desc}% de descuento = ${fmtCOP(valorContado)} (ahorro ${fmtCOP(ahorroContado)}). Cuotas: ${n} × ${fmtCOP(cuota)} = ${fmtCOP(totalFinanciado)} (sobrecosto ${fmtCOP(sobrecosto)} al ${tasa}% mensual). El % de descuento y la tasa son referenciales: confirmá los de tu resolución de cobro.`;

  const _insight = {
    title: formaPago === 'contado' ? 'Pago de contado' : `Financiado en ${n} cuotas`,
    text: formaPago === 'contado'
      ? `Pagás **${fmtCOP(valorContado)}** de contado (con **${desc}%** de descuento) en vez de **${fmtCOP(monto)}**: te ahorrás **${fmtCOP(ahorroContado)}**. Financiar el mismo monto en ${n} cuotas costaría **${fmtCOP(totalFinanciado)}**, así que el contado es **${fmtCOP(brechaContadoVsCuotas)}** más barato.`
      : `Con **${n} cuotas** al **${tasa}% mensual** pagás **${fmtCOP(cuota)}/mes** y en total **${fmtCOP(totalFinanciado)}**: son **${fmtCOP(sobrecosto)}** de intereses sobre los ${fmtCOP(monto)} asignados. De contado bajaría a **${fmtCOP(valorContado)}**.`,
    tone: formaPago === 'contado' ? 'good' : 'info',
    icon: '🏗️',
  };

  const _chart = {
    type: 'bar',
    labels: ['Contado (con desc.)', `${n} cuotas (total)`],
    values: [valorContado, totalFinanciado],
    prefix: '$',
    ariaLabel: `Pago de contado ${fmtCOP(valorContado)} frente al total financiado ${fmtCOP(totalFinanciado)} en ${n} cuotas.`,
  };

  return {
    valorContado: `${fmtCOP(valorContado)} (ahorro ${fmtCOP(ahorroContado)})`,
    cuotaMensual: `${fmtCOP(cuota)} × ${n} cuotas`,
    totalFinanciado: fmtCOP(totalFinanciado),
    sobrecostoIntereses: `${fmtCOP(sobrecosto)} (${tasa}% mensual)`,
    recomendacion,
    detalle,
    _insight,
    _chart,
  };
}
