/**
 * Aportes de Empleada/o Doméstica/o — BPS Uruguay 2026 (Grupo 21).
 *
 * El servicio doméstico aporta a BPS como cualquier dependiente de Industria y
 * Comercio. Sobre el sueldo NOMINAL:
 *   PERSONAL (se descuenta del trabajador):
 *     - Montepío (jubilatorio): 15%
 *     - FONASA: 3% a 8% según base (2,5 BPC) y familia a cargo
 *     - FRL: 0,1%
 *   PATRONAL (lo paga el empleador, ADEMÁS del sueldo):
 *     - Jubilatorio: 7,5%   ·   FONASA: 5%   ·   FRL: 0,1%
 *
 *   Total a BPS = aportes personales + aportes patronales.
 *   Líquido del trabajador = nominal − aportes personales.
 *   Costo del empleador = nominal + aportes patronales.
 *
 * Todas las tasas se importan de src/lib/data/uruguay-2026.ts (fuente única).
 * El salario mínimo del Grupo 21 (laudo del servicio doméstico) suele estar por
 * encima del SMN general; el usuario ingresa el nominal real.
 */
import { URUGUAY_2026, aportesBpsPersonales, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Sueldo nominal mensual, en pesos. */
  sueldoNominal: number;
  /** Situación FONASA: solo | hijos | conyuge | conyuge-hijos. */
  fonasa?: string;
}

export interface Outputs {
  aportePersonal: string;
  aportePatronal: string;
  totalBps: string;
  liquidoTrabajador: string;
  costoEmpleador: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const nominal = Math.max(0, Number(i.sueldoNominal) || 0);
  const f = String(i.fonasa || 'solo');
  const conConyuge = f === 'conyuge' || f === 'conyuge-hijos';
  const conHijos = f === 'hijos' || f === 'conyuge-hijos';

  const personalDetalle = aportesBpsPersonales(nominal, conConyuge, conHijos);
  const personal = personalDetalle.total;

  const p = URUGUAY_2026.bps.patronal;
  const patronal = nominal * (p.jubilatorio + p.fonasa + p.frl);

  const totalBps = personal + patronal;
  const liquido = nominal - personal;
  const costoEmpleador = nominal + patronal;

  const detalle =
    `Sobre un nominal de ${fmtUYU(nominal)}: aportes personales ${fmtUYU(personal)} ` +
    `(montepío 15% ${fmtUYU(personalDetalle.montepio)} + FONASA ${(personalDetalle.tasaFonasa * 100).toFixed(1)}% ${fmtUYU(personalDetalle.fonasa)} + FRL 0,1% ${fmtUYU(personalDetalle.frl)}); ` +
    `aportes patronales ${fmtUYU(patronal)} (jubilatorio 7,5% + FONASA 5% + FRL 0,1%). ` +
    `Total a BPS ${fmtUYU(totalBps)}. Líquido del trabajador ${fmtUYU(liquido)}. Costo total del empleador ${fmtUYU(costoEmpleador)}.`;

  return {
    aportePersonal: fmtUYU(personal),
    aportePatronal: fmtUYU(patronal),
    totalBps: fmtUYU(totalBps),
    liquidoTrabajador: fmtUYU(liquido),
    costoEmpleador: fmtUYU(costoEmpleador),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🧹',
      text: `Con un sueldo nominal de **${fmtUYU(nominal)}**, a BPS se aportan **${fmtUYU(totalBps)}** por mes (${fmtUYU(personal)} del trabajador + ${fmtUYU(patronal)} del empleador). La empleada cobra **${fmtUYU(liquido)}** en la mano y al empleador le cuesta **${fmtUYU(costoEmpleador)}** en total (sin contar aguinaldo, licencia ni salario vacacional).`,
      tone: 'info' as const,
    },
    _table: {
      title: 'Aportes BPS del servicio doméstico (Grupo 21) — 2026',
      headers: ['Sueldo nominal', 'Aporte personal', 'Aporte patronal', 'Total a BPS', 'Líquido del trabajador'],
      rows: [25383, 35000, 45000, 60000].map((n) => {
        const ap = aportesBpsPersonales(n, conConyuge, conHijos);
        const pat = n * (p.jubilatorio + p.fonasa + p.frl);
        return [fmtUYU(n), fmtUYU(ap.total), fmtUYU(pat), fmtUYU(ap.total + pat), fmtUYU(n - ap.total)];
      }),
      note: `Servicio doméstico (Grupo 21). Personal: montepío 15% + FONASA ${(personalDetalle.tasaFonasa * 100).toFixed(1)}% + FRL 0,1%. Patronal: jubilatorio 7,5% + FONASA 5% + FRL 0,1%. No incluye aguinaldo, licencia ni salario vacacional. El nominal mínimo lo fija el laudo del Grupo 21. Fuente: BPS.`,
    },
  };
}
