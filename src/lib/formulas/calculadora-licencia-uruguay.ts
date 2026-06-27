/**
 * Calculadora de licencia anual (días y pago) — Uruguay 2026.
 *
 * Régimen (Ley 12.590, MTSS):
 *  - 20 días de licencia por año calendario completo trabajado.
 *  - +1 día extra cada 4 años de antigüedad, a partir del 5º año (día 21 al
 *    cumplir 5; día 22 al cumplir 9; etc.).
 *  - Si no se trabajó el año completo, los días se prorratean por meses (×/12).
 *  - El jornal de licencia se paga como nominal/30 × días.
 *
 * Data: src/lib/data/uruguay-2026.ts (URUGUAY_2026.laboral).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface LicenciaInputs {
  /** Antigüedad total en años (define los días extra). */
  aniosAntiguedad?: number | string;
  /** Meses trabajados que generan la licencia (1–12). Default 12. */
  mesesTrabajados?: number | string;
  /** Sueldo mensual nominal, en pesos. */
  sueldo?: number | string;
}

export interface LicenciaOutputs {
  diasLicencia: string;
  diasLicenciaNum: number;
  pagoLicencia: string;
  pagoLicenciaMonto: number;
  diasBase: number;
  diasExtra: number;
  detalle: string;
  _insight?: any;
  _table?: any;
}

/** Días de licencia que corresponden por la antigüedad (sin prorrateo por meses). */
function diasLicenciaPorAntiguedad(aniosAntiguedad: number): number {
  const base = URUGUAY_2026.laboral.licenciaDiasBase;
  const anios = Math.max(0, Math.floor(aniosAntiguedad));
  // +1 día cada 4 años desde el 5º: día extra al cumplir 5, 9, 13, 17…
  const extra = anios >= 5 ? Math.floor((anios - 5) / 4) + 1 : 0;
  return base + extra;
}

export function calculadoraLicenciaUruguay(i: LicenciaInputs): LicenciaOutputs {
  const aniosRaw = Math.max(0, Number(i.aniosAntiguedad) || 0);
  const sueldo = Math.max(0, Number(i.sueldo) || 0);
  let meses = i.mesesTrabajados === undefined || i.mesesTrabajados === ''
    ? 12
    : Math.max(0, Number(i.mesesTrabajados) || 0);
  meses = Math.min(12, meses);

  const diasBase = URUGUAY_2026.laboral.licenciaDiasBase;
  const diasConAntiguedad = diasLicenciaPorAntiguedad(aniosRaw);
  const diasExtra = diasConAntiguedad - diasBase;

  // Prorrateo por meses trabajados (año incompleto).
  const diasGenerados = (diasConAntiguedad * meses) / 12;

  // Pago: jornal de licencia (nominal/30) × días.
  const jornalDia = sueldo / 30;
  const pago = jornalDia * diasGenerados;

  const diasMostrar = Math.round(diasGenerados * 10) / 10;

  return {
    diasLicencia: `${diasMostrar} días`,
    diasLicenciaNum: diasMostrar,
    pagoLicencia: fmtUYU(pago),
    pagoLicenciaMonto: Math.round(pago),
    diasBase,
    diasExtra,
    detalle:
      `${diasConAntiguedad} días por antigüedad` +
      (meses < 12 ? ` × ${meses}/12 meses = ${diasMostrar} días` : '') +
      `. Pago = ${fmtUYU(jornalDia)}/día × ${diasMostrar} días = ${fmtUYU(pago)}.`,
    _insight: {
      title: 'Tus días de licencia',
      text:
        `Con **${Math.floor(aniosRaw)} años** de antigüedad te corresponden **${diasConAntiguedad} días** de licencia` +
        (diasExtra > 0 ? ` (20 base + ${diasExtra} día/s extra por antigüedad)` : ' (el mínimo de 20 días)') +
        (meses < 12 ? `, que prorrateados por ${meses} meses trabajados dan **${diasMostrar} días**` : '') +
        `. El pago del jornal de licencia es **${fmtUYU(pago)}**.`,
      tone: 'info' as const,
      icon: '🏖️',
    },
    _table: {
      title: 'Días de licencia anual según antigüedad',
      headers: ['Años de antigüedad', 'Días de licencia'],
      rows: [
        ['1 a 4 años', '20 días'],
        ['5 a 8 años', '21 días'],
        ['9 a 12 años', '22 días'],
        ['13 a 16 años', '23 días'],
        ['17 a 20 años', '24 días'],
        ['21 a 24 años', '25 días'],
      ],
      note: 'Base de 20 días por año completo trabajado, más 1 día cada 4 años de antigüedad a partir del 5º año (Ley 12.590). Si no se trabajó el año completo, los días se prorratean por meses.',
    },
  };
}
