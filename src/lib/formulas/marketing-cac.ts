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

  return {
    cac: Math.round(cac),
    ltv: Math.round(ltv),
    ratio: Math.round(ratio * 100) / 100,
    ratioTexto: `${(Math.round(ratio * 10) / 10).toFixed(1)}× LTV/CAC`,
    paybackMeses: Math.round(paybackMeses * 10) / 10,
    benchmark,
  };
}
