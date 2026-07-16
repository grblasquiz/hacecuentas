/**
 * Meses Sin Intereses (MSI) México — costo real y si conviene vs pago de contado.
 * Compara el VALOR PRESENTE de las cuotas (descontado a tu tasa de inversión, ej. CETES)
 * contra el precio de contado con descuento. No usa constantes fiscales: las tasas de
 * mercado (rendimiento, descuento) son inputs editables del usuario.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  precio: number;
  meses: number | string;
  tasaInversionAnual: number;   // % anual de tu dinero (ej. CETES/pagaré), editable
  descuentoContado: number;     // % de descuento por pagar de contado, editable
}

export interface Outputs {
  pagoMensual: number;
  valorPresenteMSI: number;
  costoContado: number;
  beneficioDiferir: number;
  opcionConviene: string;
  ahorro: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precio) || 0);
  const meses = Math.max(1, Math.round(Number(i.meses) || 1));
  const tasaAnual = Math.max(0, Number(i.tasaInversionAnual) || 0);
  const descuento = Math.min(100, Math.max(0, Number(i.descuentoContado) || 0));

  const pagoMensual = precio / meses;
  const r = tasaAnual / 100 / 12; // tasa mensual equivalente

  // Valor presente de la anualidad de cuotas: lo que "hoy" te cuesta pagar a MSI,
  // porque el dinero que no desembolsás sigue rindiendo a tu tasa.
  const valorPresenteMSI = r > 0
    ? pagoMensual * (1 - Math.pow(1 + r, -meses)) / r
    : precio;

  const costoContado = precio * (1 - descuento / 100);
  const beneficioDiferir = precio - valorPresenteMSI; // ganancia por diferir el pago

  // Decisión: gana el menor costo medido en valor presente (hoy).
  const convieneMSI = valorPresenteMSI <= costoContado;
  const opcionConviene = convieneMSI ? 'Meses sin intereses' : 'Pago de contado';
  const ahorro = Math.abs(costoContado - valorPresenteMSI);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: convieneMSI ? 'Te conviene pagar a MSI' : 'Te conviene pagar de contado',
    text: convieneMSI
      ? `Pagando **${fmtMXN(pagoMensual)}** al mes durante **${meses}** meses y dejando tu dinero rindiendo al **${tasaAnual}%** anual, el costo real hoy es **${fmtMXN(valorPresenteMSI)}** — **${fmtMXN(ahorro)}** menos que pagar de contado. Diferir el pago te deja **${fmtMXN(beneficioDiferir)}** de beneficio financiero.`
      : `El descuento de contado del **${descuento}%** deja el precio en **${fmtMXN(costoContado)}**, por debajo del valor presente de las cuotas (**${fmtMXN(valorPresenteMSI)}**). Pagar de contado te ahorra **${fmtMXN(ahorro)}**.`,
    tone: convieneMSI ? 'good' : 'warn',
    icon: '💳',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Pago de contado', 'Costo real MSI (hoy)'],
    values: [Math.round(costoContado), Math.round(valorPresenteMSI)],
    prefix: '$',
    ariaLabel: `Pago de contado ${fmtMXN(costoContado)} frente al valor presente de las cuotas MSI ${fmtMXN(valorPresenteMSI)}.`,
  };

  return {
    pagoMensual: round2(pagoMensual),
    valorPresenteMSI: round2(valorPresenteMSI),
    costoContado: round2(costoContado),
    beneficioDiferir: round2(beneficioDiferir),
    opcionConviene,
    ahorro: round2(ahorro),
    _insight,
    _chart,
  };
}
