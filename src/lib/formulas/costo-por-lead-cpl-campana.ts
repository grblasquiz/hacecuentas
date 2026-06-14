/**
 * Calculadora de Costo por Lead (CPL) de una campaña
 * CPL = inversión / leads generados
 * Si se carga la tasa de cierre: costo por cliente = CPL / (tasa_cierre / 100)
 * Distinto de CPA: un lead no es una adquisición/venta, es un contacto interesado.
 */

export interface CostoPorLeadCplCampanaInputs {
  inversion: number | string;
  leads_generados: number | string;
  tasa_cierre_pct?: number | string; // % opcional
}

export interface CostoPorLeadCplCampanaOutputs {
  cpl: number;
  clientesEstimados: number;
  costoPorCliente: number;
  benchmark: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function costoPorLeadCplCampana(
  i: CostoPorLeadCplCampanaInputs
): CostoPorLeadCplCampanaOutputs {
  const inversion = num(i.inversion);
  const leads = num(i.leads_generados);
  const tasaCierre = Math.max(0, Math.min(100, num(i.tasa_cierre_pct, 0)));

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión de la campaña');
  if (!leads || leads <= 0) throw new Error('Ingresá la cantidad de leads generados');

  const cpl = inversion / leads;

  const tieneCierre = tasaCierre > 0;
  const clientesEstimados = tieneCierre ? leads * (tasaCierre / 100) : 0;
  const costoPorCliente = tieneCierre ? cpl / (tasaCierre / 100) : 0;

  const cplR = Math.round(cpl * 100) / 100;

  // Benchmark orientativo sobre el CPL (referencia genérica, depende de industria y ticket)
  let benchmark = '';
  if (cplR <= 1000) benchmark = '🚀 CPL muy bajo — captación eficiente (validá calidad del lead)';
  else if (cplR <= 5000) benchmark = '✅ CPL competitivo para la mayoría de los rubros';
  else if (cplR <= 15000) benchmark = '⚡ CPL medio — razonable si el ticket o LTV es alto';
  else benchmark = '⚠️ CPL alto — justificable solo con tickets/LTV elevados (B2B, inmuebles, autos)';

  const tone: 'good' | 'warn' | 'neutral' =
    cplR <= 5000 ? 'good' : cplR <= 15000 ? 'neutral' : 'warn';

  const insightText = tieneCierre
    ? `Cada lead te cuesta **$${cplR.toLocaleString('es-AR')}** (CPL = inversión ÷ leads). Con una tasa de cierre del **${tasaCierre}%**, esos ${Math.round(leads).toLocaleString('es-AR')} leads se traducen en ~**${Math.round(clientesEstimados).toLocaleString('es-AR')} clientes**, así que el **costo por cliente es $${Math.round(costoPorCliente).toLocaleString('es-AR')}**. Compará ese número contra tu ticket promedio o LTV: si el cliente vale más que eso, la campaña es rentable.`
    : `Cada lead te cuesta **$${cplR.toLocaleString('es-AR')}** (CPL = inversión ÷ leads = $${Math.round(inversion).toLocaleString('es-AR')} ÷ ${Math.round(leads).toLocaleString('es-AR')}). Ojo: un lead **no es una venta**. Cargá tu tasa de cierre para estimar el costo por cliente real, que es el número que importa para la rentabilidad.`;

  const _insight = {
    title: 'Costo por lead',
    text: insightText,
    tone,
    icon: '🧲',
  };

  // Doughnut: del total de leads, cuántos cierran vs cuántos no (cuando hay tasa de cierre)
  const _chart = tieneCierre
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Leads que cierran', value: Math.round(clientesEstimados) },
          { label: 'Leads sin cierre', value: Math.round(leads - clientesEstimados) },
        ],
        centerValue: `${tasaCierre}%`,
        centerLabel: 'Cierre',
        ariaLabel: `Gráfico de torta de los ${Math.round(leads).toLocaleString('es-AR')} leads: cuántos se convierten en clientes según la tasa de cierre del ${tasaCierre}%`,
      }
    : undefined;

  const out: CostoPorLeadCplCampanaOutputs = {
    cpl: cplR,
    clientesEstimados: Math.round(clientesEstimados),
    costoPorCliente: Math.round(costoPorCliente),
    benchmark,
    detalle: `CPL: $${cplR.toLocaleString('es-AR')} (inversión $${Math.round(inversion).toLocaleString('es-AR')} ÷ ${Math.round(leads).toLocaleString('es-AR')} leads).${tieneCierre ? ` Con cierre del ${tasaCierre}%: ~${Math.round(clientesEstimados).toLocaleString('es-AR')} clientes, costo por cliente $${Math.round(costoPorCliente).toLocaleString('es-AR')}.` : ''}`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
