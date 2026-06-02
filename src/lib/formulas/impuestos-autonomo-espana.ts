/** Impuestos autonomo Espana */
export interface Inputs { facturacionAnualBruta: number; gastosDeducibles: number; tarifaPlana: string; }
export interface Outputs { netoAnual: number; cuotaAutonomos: number; irpfPagado: number; beneficioFiscal: number; netoMensual: number; _insight?: any; _chart?: any; }
export function impuestosAutonomoEspana(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnualBruta);
  const gastos = Number(i.gastosDeducibles);
  const tp = String(i.tarifaPlana || 'no');
  if (fact < 0) throw new Error('Facturación inválida');
  const cuotaMensual = tp === 'si' ? 80 : (fact < 12000 ? 200 : fact < 30000 ? 250 : fact < 60000 ? 340 : 450);
  const cuotaAnual = cuotaMensual * 12;
  const base = fact - gastos - cuotaAnual;
  let irpf = 0;
  if (base > 0) {
    const brackets = [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [Infinity, 0.45]];
    let prev = 0;
    for (const [limit, rate] of brackets) {
      if (base > prev) {
        const taxable = Math.min(base, limit as number) - prev;
        irpf += taxable * (rate as number);
        prev = limit as number;
        if (base <= limit) break;
      }
    }
  }
  const neto = fact - gastos - cuotaAnual - irpf;

  const cargaTotal = cuotaAnual + irpf;
  const presionFiscal = fact > 0 ? (cargaTotal / fact) * 100 : 0;
  const tone: 'good' | 'warn' | 'neutral' = presionFiscal >= 30 ? 'warn' : presionFiscal >= 18 ? 'neutral' : 'good';
  const fmt = (n: number) => '€' + Math.round(n).toLocaleString('es-ES');
  const insight = {
    title: 'Lo que te queda como autónomo',
    text: `De **${fmt(fact)}** facturados te quedan **${fmt(neto)}** netos al año (**${fmt(neto / 12)}/mes**). Entre cuota de autónomos (**${fmt(cuotaAnual)}**) e IRPF (**${fmt(irpf)}**) se va el **${presionFiscal.toFixed(1)}%** de tu facturación${tp === 'si' ? ', con tarifa plana de 80 €/mes aplicada' : ''}.`,
    tone,
    icon: '🇪🇸',
  };

  const slices = [
    { label: 'Neto para vos', value: Math.round(neto > 0 ? neto : 0) },
    { label: 'Gastos deducibles', value: Math.round(gastos > 0 ? gastos : 0) },
    { label: 'Cuota autónomos', value: Math.round(cuotaAnual) },
    { label: 'IRPF', value: Math.round(irpf) },
  ].filter((s) => s.value > 0);
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '€',
    centerValue: fmt(fact),
    centerLabel: 'Facturado',
    ariaLabel: 'Reparto de la facturación anual entre neto, gastos deducibles, cuota de autónomos e IRPF',
  };

  return {
    netoAnual: Math.round(neto),
    cuotaAutonomos: Math.round(cuotaAnual),
    irpfPagado: Math.round(irpf),
    beneficioFiscal: Math.round(base > 0 ? base : 0),
    netoMensual: Math.round(neto / 12),
    _insight: insight,
    _chart: chart
  };
}
