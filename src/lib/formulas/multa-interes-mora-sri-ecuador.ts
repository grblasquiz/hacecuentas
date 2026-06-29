/**
 * Multa e interés por mora SRI (Ecuador) — declaración tardía.
 * Multa: 3% del impuesto causado por mes o fracción, tope 100% (LRTI art. 100).
 * Interés: tasa trimestral por mora (1er trim. 2026 = 0,647% mensual), editable.
 * Fuente: SRI (sri.gob.ec). Verificado 2026-06-29.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  impuestoCausado: number;
  mesesRetraso: number;
  tasaMensual?: number;
  hayImpuesto?: string;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

const MULTA_PCT_MENSUAL = 0.03; // 3% por mes o fracción
const MULTA_TOPE = 1.0;         // tope 100% del impuesto causado

export function compute(i: Inputs): Outputs {
  const impuesto = Number(i.impuestoCausado) || 0;
  const meses = Math.max(0, Math.floor(Number(i.mesesRetraso) || 0));
  const tasaMensual = (i.tasaMensual === undefined || i.tasaMensual === null || isNaN(Number(i.tasaMensual)))
    ? 0.647
    : Number(i.tasaMensual);
  const hayImpuesto = (i.hayImpuesto ?? 'si') === 'si';

  if (impuesto <= 0) throw new Error('Ingresá el impuesto causado de la declaración');

  // Multa: 3% por mes, topada al 100% del impuesto. Si la declaración no tiene
  // impuesto a pagar, esta base no aplica (el SRI usa otra base de cálculo).
  const multa = hayImpuesto
    ? Math.min(impuesto * MULTA_PCT_MENSUAL * meses, impuesto * MULTA_TOPE)
    : 0;

  // Interés por mora: tasa mensual (% → fracción) × meses, sin tope.
  const interes = impuesto * (tasaMensual / 100) * meses;

  const totalPagar = impuesto + multa + interes;

  const enTope = hayImpuesto && impuesto * MULTA_PCT_MENSUAL * meses >= impuesto * MULTA_TOPE && meses > 0;

  const _insight = {
    title: enTope ? 'Multa en el tope del 100%' : 'Costo de declarar tarde',
    text: hayImpuesto
      ? `Por declarar con **${meses} ${meses === 1 ? 'mes' : 'meses'}** de retraso sobre un impuesto de **${fmtUSDec(impuesto)}**, pagás **${fmtUSDec(multa)}** de multa${enTope ? ' (tope del 100% alcanzado)' : ''} y **${fmtUSDec(interes)}** de interés. En total tenés que abonar **${fmtUSDec(totalPagar)}**.`
      : `Tu declaración no tiene impuesto a pagar, así que la multa del 3% no aplica sobre el impuesto causado. Igual podés deber una multa según otra base del SRI (porcentaje de ingresos o multa fija).`,
    tone: enTope ? 'bad' : 'warn',
    icon: '⏰',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Impuesto causado', value: Math.round(impuesto * 100) / 100 },
      { label: 'Multa', value: Math.round(multa * 100) / 100 },
      { label: 'Interés', value: Math.round(interes * 100) / 100 },
    ],
    ariaLabel: `Impuesto ${fmtUSDec(impuesto)}, multa ${fmtUSDec(multa)}, interés ${fmtUSDec(interes)}.`,
  };

  // Tabla: mismos cálculos para varios horizontes de retraso (misma lógica).
  const anclas = [1, 3, 6, 12, 24, 36];
  if (meses > 0 && !anclas.includes(meses)) anclas.push(meses);
  anclas.sort((a, b) => a - b);
  const tableRows = anclas.slice(0, 7).map((m) => {
    const mul = hayImpuesto ? Math.min(impuesto * MULTA_PCT_MENSUAL * m, impuesto * MULTA_TOPE) : 0;
    const intr = impuesto * (tasaMensual / 100) * m;
    const tope = hayImpuesto && impuesto * MULTA_PCT_MENSUAL * m >= impuesto * MULTA_TOPE;
    return [
      `${m} ${m === 1 ? 'mes' : 'meses'}${m === meses ? ' (tu caso)' : ''}`,
      `${fmtUSDec(mul)}${tope ? ' (tope)' : ''}`,
      fmtUSDec(intr),
      fmtUSDec(impuesto + mul + intr),
    ];
  });
  const _table = {
    title: `Recargos por mora según meses de retraso (impuesto ${fmtUSDec(impuesto)}, tasa ${tasaMensual}%)`,
    headers: ['Meses de retraso', 'Multa (3%/mes, tope 100%)', `Interés (${tasaMensual}%/mes)`, 'Total a pagar'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Multa: 3% del impuesto por mes o fracción, tope 100% (LRTI art. 100). Interés: tasa trimestral del SRI (1er trim. 2026 = 0,647%), sin tope.',
  };

  return {
    multa: fmtUSDec(multa),
    interes: fmtUSDec(interes),
    totalPagar: fmtUSDec(totalPagar),
    detalle: hayImpuesto
      ? `Multa 3% × ${meses} = ${fmtUSDec(multa)} + interés ${tasaMensual}% × ${meses} = ${fmtUSDec(interes)}. Total ${fmtUSDec(totalPagar)}.`
      : `Sin impuesto causado: la multa del 3% no aplica. Interés ${fmtUSDec(interes)}. Total ${fmtUSDec(totalPagar)}.`,
    _insight,
    _chart,
    _table,
  };
}
