/** Cuánto gasto en delivery: gasto mensual, anual y equivalencias */

export interface Inputs {
  pedidosSemana: number;
  gastoPromedio: number;
  propina: number;
}

export interface Outputs {
  gastoMensual: number;
  gastoAnual: number;
  gastoPropinaMensual: number;
  equivalente: string;
}

export function cuantoGastoEnDelivery(i: Inputs): Outputs {
  const pedidos = Number(i.pedidosSemana);
  const gasto = Number(i.gastoPromedio);
  const propina = Number(i.propina) || 0;

  if (isNaN(pedidos) || pedidos <= 0) throw new Error('Ingresá cuántos pedidos hacés por semana');
  if (isNaN(gasto) || gasto <= 0) throw new Error('Ingresá el gasto promedio por pedido');
  if (propina < 0) throw new Error('La propina no puede ser negativa');

  const costoPorPedido = gasto + propina;
  const pedidosMes = pedidos * 4.33; // semanas promedio por mes
  const gastoMensual = Math.round(costoPorPedido * pedidosMes);
  const gastoAnual = Math.round(costoPorPedido * pedidos * 52);
  const gastoPropinaMensual = Math.round(propina * pedidosMes);

  // Equivalencias divertidas
  const equivs: string[] = [];
  if (gastoAnual >= 2_500_000) equivs.push('unas vacaciones en Brasil');
  if (gastoAnual >= 1_500_000) equivs.push('un iPhone nuevo');
  if (gastoAnual >= 800_000) equivs.push('1 año de gimnasio');
  if (gastoAnual >= 500_000) equivs.push('6 meses de Netflix + Spotify');
  if (gastoAnual >= 300_000) equivs.push('una bici nueva');
  if (equivs.length === 0) equivs.push('varias salidas a comer afuera');

  const equivalente = `Con $${gastoAnual.toLocaleString()} al año podrías comprar: ${equivs.join(', ')}.`;

  return { gastoMensual, gastoAnual, gastoPropinaMensual, equivalente };
}
