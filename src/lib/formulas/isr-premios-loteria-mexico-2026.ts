/**
 * ISR e impuesto estatal sobre PREMIOS (loterías, rifas, sorteos, concursos) — México 2026.
 * LISR Arts. 137-139 (Cap. VII, Título IV):
 *  - Retención federal de ISR = 1% sobre el valor del premio, sin deducción alguna,
 *    en las entidades federativas que NO graven o graven con impuesto local HASTA 6%.
 *  - Donde el impuesto local EXCEDE el 6%, la tasa federal de ISR es 21%.
 *  - Además, las entidades cobran un impuesto ESTATAL sobre loterías/sorteos (varía por estado,
 *    típicamente 6%) sobre el mismo valor del premio.
 * La retención de ISR es PAGO DEFINITIVO (LISR 138) — no se acumula a los demás ingresos.
 * Premio neto = premio − ISR federal retenido − impuesto estatal retenido.
 * fmtMXN desde src/lib/data/mexico-2026.ts.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  premio: number;                 // valor del premio en pesos (boleto premiado / monto del sorteo)
  estado?: string;                // estado donde se paga el premio → fija el % de impuesto estatal
  impuestoEstatalCustom?: number; // % estatal si estado = 'personalizado' (override manual)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Impuesto estatal sobre loterías/rifas/sorteos/concursos 2026 (% sobre el valor del premio).
 * Las leyes de hacienda estatales lo fijan; la gran mayoría usa 6%, que es el umbral que mantiene
 * la retención federal de ISR en 1% (LISR 138). Algunos estados no lo cobran (0%).
 * Verificado contra leyes de hacienda estatales 2026 (CDMX, Yucatán, Querétaro, Edomex… = 6%).
 */
const IMPUESTO_ESTATAL: Record<string, number> = {
  CDMX: 0.06,
  'Estado de México': 0.06,
  Jalisco: 0.06,
  'Nuevo León': 0.06,
  Querétaro: 0.06,
  Yucatán: 0.06,
  Guanajuato: 0.06,
  Puebla: 0.06,
  Veracruz: 0.06,
  // Otros estados con régimen general 6%
  general6: 0.06,
  // Sin impuesto local
  ninguno: 0,
};

export function compute(i: Inputs): Outputs {
  const premio = num(i.premio, 0);
  if (premio <= 0) throw new Error('Captura el valor del premio en pesos');

  const estado = (i.estado ?? 'general6').toString();

  // % de impuesto estatal: 'personalizado' usa el override; el resto, la tabla.
  let tasaEstatal: number;
  if (estado === 'personalizado') {
    const pct = Math.max(0, num(i.impuestoEstatalCustom, 6));
    tasaEstatal = pct / 100;
  } else {
    tasaEstatal = IMPUESTO_ESTATAL[estado] ?? 0.06;
  }

  // Regla LISR 138: federal 1% si el local es ≤ 6%; 21% si el local EXCEDE 6%.
  const tasaFederal = tasaEstatal > 0.06 ? 0.21 : 0.01;

  const isrFederal = r2(premio * tasaFederal);
  const impuestoEstatal = r2(premio * tasaEstatal);
  const retencionTotal = r2(isrFederal + impuestoEstatal);
  const premioNeto = r2(premio - retencionTotal);
  const tasaEfectiva = premio > 0 ? Math.round((retencionTotal / premio) * 1000) / 10 : 0;

  const pctEstatal = Math.round(tasaEstatal * 10000) / 100; // 6 → "6"
  const pctFederal = Math.round(tasaFederal * 10000) / 100; // 1 → "1"

  const _insight = {
    title: tasaFederal === 0.01 ? 'Te retienen poco más del impuesto estatal' : 'Estado con tasa alta: ISR federal del 21%',
    text: tasaFederal === 0.01
      ? `De tu premio de **${fmtMXN(premio)}** te retienen **${fmtMXN(isrFederal)}** de ISR federal (1%) y **${fmtMXN(impuestoEstatal)}** de impuesto estatal (${pctEstatal}%): cobras **${fmtMXN(premioNeto)}** netos, el **${100 - tasaEfectiva}%** del premio. La retención de ISR es **pago definitivo** (LISR 138): no se suma a tus demás ingresos en la anual.`
      : `Como en este estado el impuesto local supera el 6%, la retención de ISR federal sube al **21%** (LISR 138): **${fmtMXN(isrFederal)}**, más **${fmtMXN(impuestoEstatal)}** de impuesto estatal (${pctEstatal}%). De tus **${fmtMXN(premio)}** cobras **${fmtMXN(premioNeto)}** netos (el **${100 - tasaEfectiva}%**). El ISR es pago definitivo y lo retiene quien entrega el premio.`,
    tone: tasaFederal === 0.01 ? 'success' : 'warn',
    icon: '🎰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Premio neto', value: Math.round(premioNeto) },
      { label: `ISR federal (${pctFederal}%)`, value: Math.round(isrFederal) },
      { label: `Impuesto estatal (${pctEstatal}%)`, value: Math.round(impuestoEstatal) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(premioNeto),
    centerLabel: 'Premio neto',
    ariaLabel: `De un premio de ${fmtMXN(premio)} cobras ${fmtMXN(premioNeto)} netos; te retienen ${fmtMXN(isrFederal)} de ISR federal y ${fmtMXN(impuestoEstatal)} de impuesto estatal.`,
  };

  return {
    premioNeto: `${fmtMXN(premioNeto)} netos (${100 - tasaEfectiva}% del premio)`,
    isrFederal: `${fmtMXN(isrFederal)} (${pctFederal}% federal, pago definitivo)`,
    impuestoEstatal: `${fmtMXN(impuestoEstatal)} (${pctEstatal}% estatal)`,
    retencionTotal: `${fmtMXN(retencionTotal)} retenidos en total (${tasaEfectiva}% del premio)`,
    detalle: `Premio ${fmtMXN(premio)} × ${pctFederal}% ISR federal = ${fmtMXN(isrFederal)}; × ${pctEstatal}% estatal = ${fmtMXN(impuestoEstatal)}. Premio − retenciones = ${fmtMXN(premioNeto)}. ${tasaFederal === 0.01 ? 'Federal al 1% porque el impuesto local no excede el 6% (LISR 138).' : 'Federal al 21% porque el impuesto local supera el 6% (LISR 138).'} Quien paga el premio retiene y te entrega constancia (LISR 139).`,
    _insight,
    _chart,
  };
}
