/** Honorarios persona fisica Mexico */
export interface Inputs { ingresoAnual: number; gastosDeducibles: number; regimen: string; }
export interface Outputs { netoAnual: number; isrAnual: number; tasaEfectiva: number; ivaCobrado: number; netoMensual: number; _insight?: any; _chart?: any; }
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
  const tasaEfectiva = ing > 0 ? Number(((isr / ing) * 100).toFixed(2)) : 0;
  const fmtMX = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const regLabel = reg === 'resico' ? 'RESICO' : 'régimen general de actividad profesional';

  // Donut: cómo se reparte el ingreso anual (neto + ISR + gastos deducibles). Suman el ingreso.
  const gastosSlice = ing - neto - isr; // = gastos efectivamente usados
  const slices: { label: string; value: number }[] = [
    { label: 'Neto para vos', value: Math.round(neto) },
    { label: 'ISR', value: Math.round(isr) },
  ];
  if (gastosSlice > 0) slices.push({ label: 'Gastos deducibles', value: Math.round(gastosSlice) });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: fmtMX(ing),
    centerLabel: 'Ingreso anual',
    ariaLabel: 'Reparto del ingreso anual: neto, ISR y gastos deducibles',
  };

  const insight = {
    title: 'Qué significa',
    text: `Bajo **${regLabel}**, de **${fmtMX(ing)}** facturados pagás **${fmtMX(isr)}** de ISR (tasa efectiva **${tasaEfectiva}%**) y te quedan **${fmtMX(neto)}** al año (${fmtMX(neto / 12)}/mes). El IVA cobrado (${fmtMX(iva)}) es ajeno: lo trasladás al SAT, no es tu ganancia.`,
    tone: (tasaEfectiva <= 5 ? 'good' : tasaEfectiva >= 20 ? 'warn' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '🧾',
  };

  return {
    netoAnual: Math.round(neto),
    isrAnual: Math.round(isr),
    tasaEfectiva,
    ivaCobrado: Math.round(iva),
    netoMensual: Math.round(neto / 12),
    _insight: insight,
    _chart: chart
  };
}
