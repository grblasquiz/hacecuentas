/** Honorarios persona fisica Mexico */
export interface Inputs { ingresoAnual: number; gastosDeducibles: number; regimen: string; }
export interface Outputs { netoAnual: number; isrAnual: number; tasaEfectiva: number; ivaCobrado: number; netoMensual: number; }
export function honorariosPersonaFisicaMexico(i: Inputs): Outputs {
  const ing = Number(i.ingresoAnual);
  const gastos = Number(i.gastosDeducibles);
  const reg = String(i.regimen || 'resico');
  if (ing < 0) throw new Error('Ingreso inválido');
  let isr = 0;
  if (reg === 'resico') {
    if (ing > 3500000) throw new Error('RESICO tope 3.5M MXN/año');
    const mensual = ing / 12;
    let tasa = 0.01;
    if (mensual > 25000) tasa = 0.011;
    if (mensual > 50000) tasa = 0.015;
    if (mensual > 83333) tasa = 0.02;
    if (mensual > 208333) tasa = 0.025;
    isr = ing * tasa;
  } else {
    const base = Math.max(0, ing - gastos);
    const brackets: [number, number][] = [[8952, 0.0192], [75984, 0.0640], [133536, 0.1088], [155230, 0.16], [185852, 0.2152], [374837, 0.2336], [746442, 0.30], [1499999, 0.32], [4000000, 0.34], [Infinity, 0.35]];
    let prev = 0;
    for (const [limit, rate] of brackets) {
      if (base > prev) {
        const t = Math.min(base, limit) - prev;
        isr += t * rate;
        prev = limit;
        if (base <= limit) break;
      }
    }
  }
  const neto = ing - gastos - isr;
  const iva = ing * 0.16;
  return {
    netoAnual: Math.round(neto),
    isrAnual: Math.round(isr),
    tasaEfectiva: Number(((isr / ing) * 100).toFixed(2)),
    ivaCobrado: Math.round(iva),
    netoMensual: Math.round(neto / 12)
  };
}
