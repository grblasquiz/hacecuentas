/**
 * ISR por dividendos para personas físicas (LISR Arts. 140 y 10).
 * Combina la retención definitiva del 10% sobre el dividendo con la acumulación piramidada:
 * el dividendo se multiplica por 1/(1−0,30) y se acredita el ISR corporativo (30%) contra el
 * impuesto de tu declaración anual, calculado con la tarifa 2026 de src/lib/data/mexico-2026.ts.
 */
import { isrAnual2026 } from '../data/mexico-2026.ts';

export interface Inputs {
  dividendoRecibido: number;       // dividendo percibido en el año ($)
  otrosIngresosAnuales: number;    // otros ingresos acumulables del año ($)
}

export interface Outputs {
  retencion10: number;
  dividendoAcumulable: number;
  isrCorporativoAcreditable: number;
  isrPorAcumulacion: number;
  efectoNetoAcumulacion: number;
  isrTotalEstimado: number;
  tasaEfectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const dividendo = Math.max(0, Number(i.dividendoRecibido) || 0);
  const otros = Math.max(0, Number(i.otrosIngresosAnuales) || 0);

  const TASA_ISR_MORAL = 0.30;                 // ISR personas morales (LISR Art. 9)
  const factorPiramidacion = 1 / (1 - TASA_ISR_MORAL); // 1,4286 (LISR Art. 10)

  // Retención definitiva del 10% sobre el dividendo (LISR Art. 140, 2º párrafo).
  const retencion10 = dividendo * 0.10;

  // Acumulación piramidada y acreditamiento del ISR corporativo.
  const dividendoAcumulable = dividendo * factorPiramidacion;
  const isrCorporativoAcreditable = dividendoAcumulable * TASA_ISR_MORAL;

  const isrConDividendo = isrAnual2026(otros + dividendoAcumulable);
  const isrSinDividendo = isrAnual2026(otros);
  const isrPorAcumulacion = Math.max(0, isrConDividendo - isrSinDividendo);

  // Efecto neto de la acumulación (negativo = saldo a favor por acreditar de más).
  const efectoNetoAcumulacion = isrPorAcumulacion - isrCorporativoAcreditable;
  const isrTotalEstimado = retencion10 + efectoNetoAcumulacion;
  const tasaEfectiva = dividendo > 0 ? (isrTotalEstimado / dividendo) * 100 : 0;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const money = (v: number) => (v < 0 ? '-$' : '$') + Math.round(Math.abs(v)).toLocaleString('es-MX');

  const _insight = {
    title: 'ISR de tus dividendos',
    text: `Sobre **${money(dividendo)}** de dividendos, la empresa retiene **${money(retencion10)}** (10% definitivo). Al acumularlos en tu anual, la piramidación acredita **${money(isrCorporativoAcreditable)}** de ISR corporativo, con un efecto neto de **${money(efectoNetoAcumulacion)}**. Tu ISR total estimado es **${money(isrTotalEstimado)}** (tasa efectiva **${tasaEfectiva.toFixed(2)}%**).`,
    tone: 'neutral',
    icon: '💰',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Retención 10%', 'Efecto acumulación', 'ISR total'],
    values: [Math.round(retencion10), Math.round(efectoNetoAcumulacion), Math.round(isrTotalEstimado)],
    prefix: '$',
    ariaLabel: `Retención del 10% ${money(retencion10)}, efecto de la acumulación ${money(efectoNetoAcumulacion)} e ISR total estimado ${money(isrTotalEstimado)}.`,
  };

  return {
    retencion10: round2(retencion10),
    dividendoAcumulable: round2(dividendoAcumulable),
    isrCorporativoAcreditable: round2(isrCorporativoAcreditable),
    isrPorAcumulacion: round2(isrPorAcumulacion),
    efectoNetoAcumulacion: round2(efectoNetoAcumulacion),
    isrTotalEstimado: round2(isrTotalEstimado),
    tasaEfectiva: round2(tasaEfectiva),
    _insight,
    _chart,
  };
}
