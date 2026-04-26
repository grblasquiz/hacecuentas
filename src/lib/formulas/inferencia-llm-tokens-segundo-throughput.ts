/** Throughput LLM: tokens/segundo y costo por 1M tokens según modelo y batch */
export interface Inputs { tokensSegundoPorRequest: number; batchSize: number; precioGpuHoraUsd: number; cantidadGpus: number; tokensPromedioPorRequest: number; }
export interface Outputs { tokensSegundoTotal: number; requestsPorHora: number; costoPorMillonTokensUsd: number; costoPorRequestUsd: number; explicacion: string; }
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
  return {
    tokensSegundoTotal: Number(tpsTotal.toFixed(0)),
    requestsPorHora: Number(requestsHora.toFixed(0)),
    costoPorMillonTokensUsd: Number(costoPorMillon.toFixed(3)),
    costoPorRequestUsd: Number(costoRequest.toFixed(5)),
    explicacion: `${batch} requests concurrentes × ${tps} tok/s = ${tpsTotal} tok/s totales. ${gpus}× GPU a USD ${precio}/h → USD ${costoPorMillon.toFixed(2)}/M tokens.`,
  };
}
