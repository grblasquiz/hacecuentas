/** Costo mensual operar agente IA con MCP servers: tokens + cómputo + storage */
export interface Inputs { llmCallsDia: number; tokensPorCallProm: number; precioInputUsdM: number; precioOutputUsdM: number; ratioOutputPct: number; computoMcpUsdMes: number; storageUsdMes: number; }
export interface Outputs { tokensTotalesMes: number; costoLlmUsdMes: number; costoComputoUsd: number; costoTotalUsdMes: number; explicacion: string; _chart?: any; _insight?: any; }
export function agenteIaMcpServidorCostoMensual(i: Inputs): Outputs {
  const calls = Number(i.llmCallsDia);
  const tokCall = Number(i.tokensPorCallProm);
  const pIn = Number(i.precioInputUsdM);
  const pOut = Number(i.precioOutputUsdM);
  const ratio = Number(i.ratioOutputPct) / 100;
  const compMcp = Number(i.computoMcpUsdMes);
  const storage = Number(i.storageUsdMes);
  if (!calls || calls <= 0) throw new Error('Ingresá calls/día');
  if (!tokCall || tokCall <= 0) throw new Error('Ingresá tokens por call');
  const callsMes = calls * 30;
  const tokTotal = callsMes * tokCall;
  const tokOut = tokTotal * ratio;
  const tokIn = tokTotal - tokOut;
  const costoLlm = (tokIn / 1e6) * pIn + (tokOut / 1e6) * pOut;
  const costoComp = compMcp + storage;
  const total = costoLlm + costoComp;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'LLM (tokens)', value: Number(costoLlm.toFixed(2)) },
      { label: 'Cómputo + storage', value: Number(costoComp.toFixed(2)) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total/mes',
    ariaLabel: 'Composición del costo mensual: tokens del LLM y cómputo más storage.',
  };
  // Insight narrativo: qué componente domina el costo mensual y dónde optimizar.
  const llmPct = total > 0 ? (costoLlm / total) * 100 : 0;
  const compPct = total > 0 ? (costoComp / total) * 100 : 0;
  const dominaLlm = costoLlm >= costoComp;
  const insight = {
    title: dominaLlm ? 'Manda el costo de tokens' : 'Manda el cómputo + storage',
    text: dominaLlm
      ? `Los **tokens del LLM** son el **${llmPct.toFixed(0)}%** de los **$${total.toFixed(0)}/mes** ($${costoLlm.toFixed(0)}). Para bajar el costo, recortá tokens por call o usá un modelo más barato.`
      : `**Cómputo + storage** del MCP pesan el **${compPct.toFixed(0)}%** de los **$${total.toFixed(0)}/mes** ($${costoComp.toFixed(0)}). El LLM es solo $${costoLlm.toFixed(0)}: optimizá la infra antes que los tokens.`,
    tone: 'neutral' as const,
    icon: '🤖',
  };
  return {
    tokensTotalesMes: Number(tokTotal.toFixed(0)),
    costoLlmUsdMes: Number(costoLlm.toFixed(2)),
    costoComputoUsd: Number(costoComp.toFixed(2)),
    costoTotalUsdMes: Number(total.toFixed(2)),
    explicacion: `${callsMes.toLocaleString('en-US')} calls/mes × ${tokCall} tokens = ${(tokTotal / 1e6).toFixed(1)}M tokens. LLM USD ${costoLlm.toFixed(0)} + cómputo USD ${costoComp.toFixed(0)} = USD ${total.toFixed(0)}/mes.`,
    _chart: chart,
    _insight: insight,
  };
}
