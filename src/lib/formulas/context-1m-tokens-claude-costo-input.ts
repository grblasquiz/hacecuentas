/** Costo input/output con contexto 1M tokens en Claude Sonnet vs Opus */
export interface Inputs { tokensInput: number; tokensOutput: number; modelo: 'sonnet-1m' | 'opus-1m' | 'sonnet' | 'opus'; requestsPorMes: number; }
export interface Outputs { costoInputUsd: number; costoOutputUsd: number; costoPorRequestUsd: number; costoMensualUsd: number; explicacion: string; _insight?: any; _chart?: any; }
export function context1mTokensClaudeCostoInput(i: Inputs): Outputs {
  const tIn = Number(i.tokensInput);
  const tOut = Number(i.tokensOutput);
  const reqs = Number(i.requestsPorMes) || 1;
  if (!tIn || tIn <= 0) throw new Error('Ingresá tokens de input');
  if (tOut < 0) throw new Error('Tokens output inválido');
  // Precios USD por millón tokens (abril 2026)
  // Tier estándar <=200k vs tier 1M (>200k input)
  const precios: Record<string, { input: number; output: number }> = {
    'sonnet': { input: 3, output: 15 },
    'opus': { input: 15, output: 75 },
    'sonnet-1m': { input: 6, output: 22.50 }, // 2x estándar al pasar 200k
    'opus-1m': { input: 30, output: 112.50 },
  };
  const p = precios[i.modelo] || precios['sonnet-1m'];
  const costoIn = (tIn / 1_000_000) * p.input;
  const costoOut = (tOut / 1_000_000) * p.output;
  const costoReq = costoIn + costoOut;
  const costoMes = costoReq * reqs;
  const costoInRound = Number(costoIn.toFixed(4));
  const costoOutRound = Number(costoOut.toFixed(4));
  const pctOut = costoReq > 0 ? Math.round((costoOut / costoReq) * 100) : 0;
  const out: Outputs = {
    costoInputUsd: costoInRound,
    costoOutputUsd: costoOutRound,
    costoPorRequestUsd: Number(costoReq.toFixed(4)),
    costoMensualUsd: Number(costoMes.toFixed(2)),
    explicacion: `${i.modelo}: USD ${costoReq.toFixed(4)} por request (${tIn.toLocaleString('es-AR')} input + ${tOut.toLocaleString('es-AR')} output). Mensual con ${reqs} reqs: USD ${costoMes.toFixed(2)}.`,
    _insight: {
      title: 'Costo estimado de la API',
      text: `Cada request cuesta **USD ${costoReq.toFixed(4)}** y el **output pesa el ${pctOut}%** del total. Con **${reqs.toLocaleString('es-AR')} requests/mes** acumulás **USD ${costoMes.toFixed(2)}**.`,
      tone: 'neutral',
      icon: '🤖',
    },
  };

  // Donut sólo si hay costo de output: muestra input vs output por request.
  if (costoOutRound > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Input', value: costoInRound },
        { label: 'Output', value: costoOutRound },
      ],
      prefix: '$',
      centerValue: `$${costoReq.toFixed(4)}`,
      centerLabel: 'por request',
      ariaLabel: `Costo por request: input USD ${costoIn.toFixed(4)} más output USD ${costoOut.toFixed(4)}`,
    };
  }

  return out;
}
