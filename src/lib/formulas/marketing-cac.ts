/**
 * Calculadora de CAC (Customer Acquisition Cost) y LTV/CAC ratio
 *
 * CAC = gasto_marketing / clientes_nuevos
 * LTV = ticket_promedio × frecuencia_anual × vida_cliente_anios
 * LTV/CAC — regla de oro: >3 es saludable
 */

export interface CacInputs {
  inversion: number;
  clientesNuevos: number;
  ticketPromedio: number;
  comprasPorAnio: number;
  vidaClienteAnios: number;
}

export interface CacOutputs {
  cac: number;
  ltv: number;
  ratio: number;
  ratioTexto: string;
  paybackMeses: number; // cuántos meses tarda el cliente en recuperar el CAC
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function marketingCac(inputs: CacInputs): CacOutputs {
  const inversion = Number(inputs.inversion);
  const clientes = Number(inputs.clientesNuevos);
  const ticket = Number(inputs.ticketPromedio);
  const frec = Number(inputs.comprasPorAnio) || 1;
  const vida = Number(inputs.vidaClienteAnios) || 1;

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión en marketing');
  if (!clientes || clientes <= 0) throw new Error('Ingresá los clientes nuevos');
  if (!ticket || ticket <= 0) throw new Error('Ingresá el ticket promedio');

  const cac = inversion / clientes;
  const ltv = ticket * frec * vida;
  const ratio = ltv / cac;

  // Payback: cuántos meses para recuperar el CAC asumiendo compras homogéneas
  const ingresoMensualPorCliente = (ticket * frec) / 12;
  const paybackMeses = ingresoMensualPorCliente > 0 ? cac / ingresoMensualPorCliente : 0;

  let benchmark = '';
  if (ratio >= 5) benchmark = '🚀 Excelente — negocio muy escalable';
  else if (ratio >= 3) benchmark = '✅ Saludable — estándar SaaS/ecommerce';
  else if (ratio >= 2) benchmark = '⚡ Aceptable — pero mejorable';
  else if (ratio >= 1) benchmark = '⚠️ Marginal — recuperás CAC pero no crecés';
  else benchmark = '🔴 Perdedor — gastás más de lo que cada cliente te da';

  const tono = ratio >= 3 ? 'good' : ratio >= 2 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu relación LTV/CAC',
    text: `Te cuesta **$${Math.round(cac).toLocaleString('es-AR')}** adquirir cada cliente y cada uno te deja **$${Math.round(ltv).toLocaleString('es-AR')}** de valor de vida: una relación de **${(Math.round(ratio * 10) / 10).toFixed(1)}×**. ${ratio >= 3 ? `Estás en zona saludable y recuperás el CAC en ~**${(Math.round(paybackMeses * 10) / 10).toFixed(1)} meses**.` : ratio >= 1 ? `Recuperás la inversión en ~**${(Math.round(paybackMeses * 10) / 10).toFixed(1)} meses**, pero el objetivo es llegar a 3×.` : `Cada cliente cuesta más de lo que deja: estás perdiendo plata por adquisición.`}`,
    tone: tono,
    icon: ratio >= 3 ? '🚀' : ratio >= 1 ? '⚖️' : '🔴',
  };

  const topSeg = Math.max(6, Math.ceil(ratio) + 1);
  const _chart = {
    type: 'scale',
    marker: Math.round(ratio * 100) / 100,
    markerLabel: `${(Math.round(ratio * 10) / 10).toFixed(1)}×`,
    min: 0,
    segments: [
      { nombre: 'Perdedor', max: 1, color: '#dc2626', colorDark: '#b91c1c' },
      { nombre: 'Marginal', max: 2, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Aceptable', max: 3, color: '#facc15', colorDark: '#ca8a04' },
      { nombre: 'Saludable', max: 5, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Excelente', max: topSeg, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Relación LTV sobre CAC de ${(Math.round(ratio * 10) / 10).toFixed(1)} veces`,
  };

  return {
    cac: Math.round(cac),
    ltv: Math.round(ltv),
    ratio: Math.round(ratio * 100) / 100,
    ratioTexto: `${(Math.round(ratio * 10) / 10).toFixed(1)}× LTV/CAC`,
    paybackMeses: Math.round(paybackMeses * 10) / 10,
    benchmark,
    _insight,
    _chart,
  };
}
