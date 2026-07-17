/** Revalorización de la pensión 2026 según el IPC (España).
 *  ⚠️ El porcentaje de revalorización 2026 debe confirmarse en el BOE.
 *  Desde la Ley 21/2021, las pensiones contributivas se revalorizan cada 1 de enero según
 *  la variación media del IPC de los 12 meses previos (diciembre a noviembre del año anterior).
 *  Nueva pensión = pensión actual × (1 + % revalorización). Referencia: la revalorización
 *  de 2025 fue del 2,8%. El % de 2026 depende del IPC medio y se publica en el BOE, por eso
 *  aquí se introduce como dato (con un valor de partida referencial).
 *  Existe un tope: la pensión máxima (referencial 2025: 3.267,60 €/mes en 14 pagas).
 *  Fuente: Ley 21/2021 y Seguridad Social — revalorización de pensiones. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

const PENSION_MAXIMA_MES = 3267.60; // pensión máxima €/mes (2025, referencial 2026)

export interface Inputs {
  pensionMensualActual: number;  // pensión bruta actual (€/mes)
  ipcRevalorizacion?: number;    // % de revalorización aplicable (default referencial 2.5)
  numeroPagas?: number;          // 12 o 14 (default 14)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const actual = Number(i.pensionMensualActual) || 0;
  const pct = Number(i.ipcRevalorizacion) >= 0 ? Number(i.ipcRevalorizacion) : 2.5;
  const numeroPagas = Number(i.numeroPagas) === 12 ? 12 : 14;
  if (actual <= 0) throw new Error('Introduce tu pensión mensual actual');

  const nuevaMensualBruta = actual * (1 + pct / 100);
  const topeAplicado = nuevaMensualBruta > PENSION_MAXIMA_MES;
  const nuevaMensual = topeAplicado ? PENSION_MAXIMA_MES : nuevaMensualBruta;
  const incrementoMensual = nuevaMensual - actual;
  const nuevaAnual = nuevaMensual * numeroPagas;
  const incrementoAnual = incrementoMensual * numeroPagas;

  const _insight = {
    title: 'Tu pensión tras la subida',
    text: `Con una revalorización del **${pct}%**, tu pensión de **${fmtEur(actual)}** pasa a **${fmtEur(nuevaMensual)}** al mes: **${fmtEur(incrementoMensual)}** más cada mensualidad y **${fmtEur(incrementoAnual)}** más al año (${numeroPagas} pagas).${topeAplicado ? ' Se ha aplicado el tope de la pensión máxima.' : ''} El % oficial de 2026 se publica en el BOE.`,
    tone: 'good',
    icon: '📈',
  };
  const _chart = {
    type: 'bar',
    labels: ['Pensión actual', 'Pensión revalorizada'],
    values: [Math.round(actual), Math.round(nuevaMensual)],
    prefix: '€ ',
    ariaLabel: `Pensión actual ${fmtEur(actual)} y revalorizada ${fmtEur(nuevaMensual)}.`,
  };

  return {
    nuevaMensual: fmtEur(nuevaMensual),
    incrementoMensual: fmtEur(incrementoMensual),
    nuevaAnual: fmtEur(nuevaAnual),
    incrementoAnual: fmtEur(incrementoAnual),
    detalle: `Pensión ${fmtEur(actual)}/mes × (1 + ${pct}%) = ${fmtEur(nuevaMensual)}/mes (+${fmtEur(incrementoMensual)}). Anual ${numeroPagas} pagas: ${fmtEur(nuevaAnual)} (+${fmtEur(incrementoAnual)}).${topeAplicado ? ' Tope pensión máxima aplicado.' : ''} % oficial 2026 pendiente de BOE.`,
    _insight,
    _chart,
  };
}
