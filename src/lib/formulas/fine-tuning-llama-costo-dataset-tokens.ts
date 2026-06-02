/** Costo de fine-tunear Llama según tamaño dataset, épocas y precio GPU/hora */
export interface Inputs { datasetMb: number; epocas: number; tokensSegundo: number; precioGpuHoraUsd: number; cantidadGpus: number; }
export interface Outputs { totalTokens: number; horasEntrenamiento: number; costoTotalUsd: number; costoPorEpocaUsd: number; explicacion: string; _insight?: any; }
export function fineTuningLlamaCostoDatasetTokens(i: Inputs): Outputs {
  const mb = Number(i.datasetMb);
  const ep = Number(i.epocas);
  const tps = Number(i.tokensSegundo);
  const precio = Number(i.precioGpuHoraUsd);
  const gpus = Number(i.cantidadGpus);
  if (!mb || mb <= 0) throw new Error('Ingresá tamaño del dataset');
  if (!ep || ep <= 0) throw new Error('Ingresá la cantidad de épocas');
  if (!tps || tps <= 0) throw new Error('Ingresá tokens/segundo');
  if (!precio || precio <= 0) throw new Error('Ingresá precio GPU/hora');
  // Aproximación: 1 MB texto ≈ 250.000 tokens (4 chars/token promedio inglés/español)
  const tokensPorMb = 250000;
  const totalTokens = mb * tokensPorMb * ep;
  const segundos = totalTokens / tps;
  const horas = segundos / 3600;
  const costoTotal = horas * precio * gpus;
  const costoEpoca = costoTotal / ep;
  const fmtUsd = (v: number) => 'USD ' + Number(v.toFixed(0)).toLocaleString('en-US');
  const _insight = {
    title: 'Costo estimado del fine-tuning',
    text: `Procesar **${(totalTokens / 1e6).toFixed(1)}M tokens** (${mb} MB × ${ep} épocas) toma **${horas.toFixed(1)} h** con ${gpus}× GPU a USD ${precio}/h, lo que da **${fmtUsd(costoTotal)}** en total (${fmtUsd(costoEpoca)} por época). Bajar el costo pasa por menos épocas o GPUs más rápidas (mayor tok/s), no por bajar el precio/hora.`,
    tone: costoTotal >= 500 ? 'warn' : (costoTotal <= 50 ? 'good' : 'neutral'),
    icon: '🤖',
  };
  return {
    totalTokens: Number(totalTokens.toFixed(0)),
    horasEntrenamiento: Number(horas.toFixed(2)),
    costoTotalUsd: Number(costoTotal.toFixed(2)),
    costoPorEpocaUsd: Number(costoEpoca.toFixed(2)),
    explicacion: `Dataset ${mb} MB × ${ep} épocas = ${(totalTokens / 1e6).toFixed(1)}M tokens. A ${tps.toLocaleString('en-US')} tok/s tarda ${horas.toFixed(1)}h. Costo ${gpus}× GPU a USD ${precio}/h: USD ${costoTotal.toFixed(0)}.`,
    _insight,
  };
}
