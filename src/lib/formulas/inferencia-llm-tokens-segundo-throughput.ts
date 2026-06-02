/** Throughput LLM: tokens/segundo y costo por 1M tokens según modelo y batch */
export interface Inputs { tokensSegundoPorRequest: number; batchSize: number; precioGpuHoraUsd: number; cantidadGpus: number; tokensPromedioPorRequest: number; }
export interface Outputs { tokensSegundoTotal: number; requestsPorHora: number; costoPorMillonTokensUsd: number; costoPorRequestUsd: number; explicacion: string; _insight?: any; }
export function inferenciaLlmTokensSegundoThroughput(i: Inputs): Outputs {
  const tps = Number(i.tokensSegundoPorRequest);
  const batch = Number(i.batchSize);
  const precio = Number(i.precioGpuHoraUsd);
  const gpus = Number(i.cantidadGpus);
  const tokRequest = Number(i.tokensPromedioPorRequest);
  if (!tps || tps <= 0) throw new Error('Ingresá tokens/segundo por request');
  if (!batch || batch <= 0) throw new Error('Ingresá batch size');
  if (!precio || precio <= 0) throw new Error('Ingresá precio GPU/hora');
  const tpsTotal = tps * batch;
  const tokensHora = tpsTotal * 3600;
  const requestsHora = tokRequest > 0 ? tokensHora / tokRequest : 0;
  const costoHora = precio * gpus;
  const costoPorMillon = (costoHora / tokensHora) * 1e6;
  const costoRequest = tokRequest > 0 ? (costoPorMillon * tokRequest) / 1e6 : 0;
  const costoTone = costoPorMillon < 1 ? 'good' : costoPorMillon < 5 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Costo por millón de tokens',
    text: `Servís **${tpsTotal.toLocaleString('es')} tok/s** en total y cada millón de tokens te cuesta **USD ${costoPorMillon.toFixed(2)}**${costoTone === 'warn' ? ' — subí el batch o bajá el costo de GPU para ser competitivo' : costoTone === 'good' ? ' — muy eficiente frente a las APIs comerciales' : ''}.`,
    tone: costoTone,
    icon: '⚡',
  };

  return {
    tokensSegundoTotal: Number(tpsTotal.toFixed(0)),
    requestsPorHora: Number(requestsHora.toFixed(0)),
    costoPorMillonTokensUsd: Number(costoPorMillon.toFixed(3)),
    costoPorRequestUsd: Number(costoRequest.toFixed(5)),
    explicacion: `${batch} requests concurrentes × ${tps} tok/s = ${tpsTotal} tok/s totales. ${gpus}× GPU a USD ${precio}/h → USD ${costoPorMillon.toFixed(2)}/M tokens.`,
    _insight,
  };
}
