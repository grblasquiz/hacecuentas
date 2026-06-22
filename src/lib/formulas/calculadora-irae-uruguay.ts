/**
 * Calculadora de IRAE Uruguay 2026 — Impuesto a las Rentas de las Actividades Económicas.
 *
 * Grava la renta neta fiscal de empresas (industria, comercio, servicios) a tasa fija 25%.
 *   renta neta = ingresos gravados − gastos deducibles
 *   IRAE = max(0, renta neta) × 25%
 *
 * Tasa importada del data file (URUGUAY_2026.irae = 0.25), no hardcodeada.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Ingresos gravados del ejercicio (pesos). */
  ingresos: number;
  /** Gastos deducibles del ejercicio (pesos). */
  gastos: number;
}

export interface Outputs {
  ingresos: number;
  gastos: number;
  renta_neta: number;
  tasa: number;
  irae: number;
  renta_despues_irae: number;
  margen_neto: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraIraeUruguay(i: Inputs): Outputs {
  const tasa = URUGUAY_2026.irae;
  const ingresos = Math.max(0, Number(i.ingresos) || 0);
  const gastos = Math.max(0, Number(i.gastos) || 0);

  if (ingresos <= 0) {
    return {
      ingresos: 0,
      gastos: Math.round(gastos),
      renta_neta: 0,
      tasa,
      irae: 0,
      renta_despues_irae: 0,
      margen_neto: 0,
      desglose: '—',
      nota: 'Ingresá los ingresos gravados del ejercicio para calcular el IRAE.',
    };
  }

  const rentaNetaBruta = ingresos - gastos;
  const rentaNeta = Math.max(0, rentaNetaBruta);
  const irae = rentaNeta * tasa;
  const rentaDespues = rentaNetaBruta - irae;
  const margenNeto = ingresos > 0 ? rentaDespues / ingresos : 0;

  const desglose = rentaNetaBruta <= 0
    ? `Ingresos ${fmtUYU(ingresos)} − gastos ${fmtUYU(gastos)} = pérdida fiscal: IRAE = $U 0`
    : `(${fmtUYU(ingresos)} − ${fmtUYU(gastos)}) × 25% = ${fmtUYU(irae)}`;

  return {
    ingresos: Math.round(ingresos),
    gastos: Math.round(gastos),
    renta_neta: Math.round(rentaNeta),
    tasa,
    irae: Math.round(irae),
    renta_despues_irae: Math.round(rentaDespues),
    margen_neto: margenNeto,
    desglose,
    nota: rentaNetaBruta <= 0
      ? 'Con gastos mayores o iguales a los ingresos, el ejercicio da pérdida fiscal: no se paga IRAE y la pérdida puede arrastrarse hasta 5 ejercicios. Verificá que el gasto sea deducible (vinculado a la renta gravada y documentado).'
      : 'IRAE = 25% de la renta neta fiscal. No todos los gastos contables son deducibles: deben estar vinculados a la renta gravada, documentados y cumplir la regla de la "deducción proporcional". Las pequeñas empresas pueden optar por el régimen ficto o el Monotributo/IVA mínimo según facturación.',
    _insight: {
      type: 'highlight',
      icon: '💡',
      text: rentaNetaBruta > 0
        ? `Con ${fmtUYU(ingresos)} de ingresos y ${fmtUYU(gastos)} de gastos deducibles, la renta neta es ${fmtUYU(rentaNeta)} y el IRAE ${fmtUYU(irae)}. Después del impuesto te quedan ${fmtUYU(rentaDespues)} (margen neto ${(margenNeto * 100).toFixed(1)}%).`
        : `Con ${fmtUYU(gastos)} de gastos sobre ${fmtUYU(ingresos)} de ingresos, el ejercicio cierra en pérdida: IRAE $U 0 y la pérdida fiscal se puede compensar en ejercicios futuros.`,
    },
    _table: {
      title: 'IRAE 2026 según renta neta (tasa fija 25%)',
      headers: ['Renta neta fiscal (pesos)', 'IRAE 25%', 'Renta después de IRAE'],
      rows: [100000, 500000, 1000000, 2500000, 5000000, 10000000].map((rn) => [
        fmtUYU(rn),
        fmtUYU(rn * URUGUAY_2026.irae),
        fmtUYU(rn * (1 - URUGUAY_2026.irae)),
      ]),
      note: 'IRAE es proporcional (25% fijo), no progresivo. La base es la renta NETA fiscal (ingresos gravados − gastos deducibles), no la facturación. Además del IRAE, la empresa puede tributar IVA, IP (patrimonio) e ICOSA según corresponda.',
    },
  };
}
