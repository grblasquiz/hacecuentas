/**
 * ISR del finiquito / liquidación — México 2026 (ISR aislado de la separación).
 *
 * Procedimiento Art. 95 LISR + Art. 174 RLISR para ingresos por separación
 * (indemnización constitucional + prima de antigüedad):
 *   1) Exención: 90 UMA por año de servicio (LISR 93-XIII).
 *   2) Sobre el EXCEDENTE gravable se aplica la TASA EFECTIVA del último sueldo
 *      ordinario mensual = ISR(último sueldo) / último sueldo.
 *   3) El finiquito ordinario (días trabajados, vacaciones, aguinaldo prop.) tributa
 *      como salario normal del mes; acá se informa pero el foco es el ISR de separación.
 *
 * Constantes (UMA, exención 90 UMA/año, tarifa ISR mensual): fuente única
 * src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrMensual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  indemnizacion?: number;          // indemnización por separación (3 meses + 20 días/año, prima antig.)
  finiquitoGravable?: number;      // finiquito ordinario gravable (días, vacaciones, aguinaldo prop.)
  aniosServicio?: number;          // años de servicio (para la exención de 90 UMA/año)
  ultimoSueldoOrdinario?: number;  // último sueldo ordinario mensual (para la tasa efectiva)
  __lang?: string;
}

export interface Outputs {
  isrSeparacion: number;
  isrFiniquitoOrdinario: number;
  isrTotal: number;
  exencionSeparacion: number;
  baseGravableSeparacion: number;
  tasaEfectiva: number;
  netoTotal: number;
  brutoTotal: number;
  detalle: string;
  formula: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const indemnizacion = Math.max(0, Number(i.indemnizacion) || 0);
  const finiquitoGravable = Math.max(0, Number(i.finiquitoGravable) || 0);
  const anios = Math.max(0, Number(i.aniosServicio) || 0);
  const ultimoSueldo = Number(i.ultimoSueldoOrdinario);

  if (indemnizacion <= 0 && finiquitoGravable <= 0) {
    throw new Error('Ingresá la indemnización o el finiquito gravable para calcular el ISR.');
  }
  if (!Number.isFinite(ultimoSueldo) || ultimoSueldo <= 0) {
    throw new Error('Ingresá tu último sueldo ordinario mensual (define la tasa efectiva del ISR).');
  }

  const { uma, exencionesIsrUmas } = MEXICO_2026;

  // ── 1) Exención por separación: 90 UMA por año de servicio (LISR 93-XIII) ──
  // Año iniciado cuenta como año completo (criterio LFT/SAT). Mínimo 1 año si hubo indemnización.
  const aniosComputables = indemnizacion > 0 ? Math.max(1, Math.ceil(anios)) : Math.ceil(anios);
  const exencionSeparacion = r2(uma.diaria * exencionesIsrUmas.separacionPorAnio * aniosComputables);
  const baseGravableSeparacion = r2(Math.max(0, indemnizacion - exencionSeparacion));

  // ── 2) Tasa efectiva del último sueldo ordinario (Art. 174 RLISR) ──
  const isrUltimoSueldo = isrMensual2026(ultimoSueldo);
  const tasaEfectiva = ultimoSueldo > 0 ? isrUltimoSueldo / ultimoSueldo : 0;
  const isrSeparacion = r2(baseGravableSeparacion * tasaEfectiva);

  // ── 3) Finiquito ordinario: tributa como salario del mes (tarifa Art. 96) ──
  const isrFiniquitoOrdinario = r2(isrMensual2026(finiquitoGravable));

  const isrTotal = r2(isrSeparacion + isrFiniquitoOrdinario);
  const brutoTotal = r2(indemnizacion + finiquitoGravable);
  const netoTotal = r2(brutoTotal - isrTotal);
  const tasaEfectivaPct = (tasaEfectiva * 100).toFixed(2);

  const detalle =
    `Indemnización ${fmtMXN(indemnizacion)} − exención ${fmtMXN(exencionSeparacion)} (90 UMA × ${aniosComputables} año/s) = ` +
    `base gravable ${fmtMXN(baseGravableSeparacion)} × tasa efectiva ${tasaEfectivaPct}% = ISR separación ${fmtMXN(isrSeparacion)} | ` +
    `ISR finiquito ordinario ${fmtMXN(isrFiniquitoOrdinario)} | ISR total ${fmtMXN(isrTotal)} | Neto a cobrar ${fmtMXN(netoTotal)}`;

  const formula = `ISR separación = (Indemnización − 90·UMA·años) × [ISR(último sueldo) ÷ último sueldo] = ${fmtMXN(baseGravableSeparacion)} × ${tasaEfectivaPct}% = ${fmtMXN(isrSeparacion)}`;

  const pctTotal = brutoTotal > 0 ? (isrTotal / brutoTotal) * 100 : 0;
  const _insight = {
    title: baseGravableSeparacion <= 0 ? 'Indemnización exenta de ISR' : 'ISR de tu liquidación',
    text:
      baseGravableSeparacion <= 0
        ? `Tu indemnización de **${fmtMXN(indemnizacion)}** queda **totalmente exenta**: la exención de **90 UMA por año** (${aniosComputables} año/s = **${fmtMXN(exencionSeparacion)}**) la cubre. El único ISR sale del finiquito ordinario: **${fmtMXN(isrFiniquitoOrdinario)}**.`
        : `De tu liquidación bruta de **${fmtMXN(brutoTotal)}**, el ISR total es **${fmtMXN(isrTotal)}** (**${pctTotal.toFixed(1)}%**). La indemnización paga **${fmtMXN(isrSeparacion)}** a la tasa efectiva de tu sueldo (**${tasaEfectivaPct}%**) sólo sobre lo que excede la exención de **${fmtMXN(exencionSeparacion)}**. Cobrás neto **${fmtMXN(netoTotal)}**.`,
    tone: (pctTotal >= 12 ? 'warn' : 'good') as 'good' | 'warn',
    icon: '🧮',
  };

  const _table = {
    title: 'Desglose del ISR de la liquidación',
    headers: ['Concepto', 'Bruto', 'Exento', 'Base gravable', 'ISR'],
    rows: [
      [
        'Indemnización + prima antig. (separación)',
        fmtMXN(indemnizacion),
        fmtMXN(exencionSeparacion),
        fmtMXN(baseGravableSeparacion),
        fmtMXN(isrSeparacion),
      ],
      [
        'Finiquito ordinario (días, vac., aguinaldo)',
        fmtMXN(finiquitoGravable),
        '—',
        fmtMXN(finiquitoGravable),
        fmtMXN(isrFiniquitoOrdinario),
      ],
      ['Total', fmtMXN(brutoTotal), fmtMXN(exencionSeparacion), fmtMXN(baseGravableSeparacion + finiquitoGravable), fmtMXN(isrTotal)],
    ],
    note: 'Exención de separación: 90 UMA por año de servicio (LISR 93-XIII). El excedente paga ISR a la tasa efectiva del último sueldo ordinario (Art. 95 LISR / Art. 174 RLISR), no a la tarifa marginal directa. El finiquito ordinario tributa como salario del mes.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto liquidación', value: Math.round(netoTotal) },
      ...(isrTotal > 0 ? [{ label: 'ISR retenido', value: Math.round(isrTotal) }] : []),
    ],
    prefix: '$',
    centerValue: fmtMXN(brutoTotal),
    centerLabel: 'Liquidación bruta',
    ariaLabel: `Reparto de la liquidación bruta de ${fmtMXN(brutoTotal)} entre neto e ISR retenido.`,
  };

  return {
    isrSeparacion,
    isrFiniquitoOrdinario,
    isrTotal,
    exencionSeparacion,
    baseGravableSeparacion,
    tasaEfectiva: r2(tasaEfectiva * 100),
    netoTotal,
    brutoTotal,
    detalle,
    formula,
    _insight,
    _table,
    _chart,
  };
}
