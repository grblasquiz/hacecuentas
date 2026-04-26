/** Costo mensual operar agente IA con MCP servers: tokens + cómputo + storage */
export interface Inputs { llmCallsDia: number; tokensPorCallProm: number; precioInputUsdM: number; precioOutputUsdM: number; ratioOutputPct: number; computoMcpUsdMes: number; storageUsdMes: number; }
export interface Outputs { tokensTotalesMes: number; costoLlmUsdMes: number; costoComputoUsd: number; costoTotalUsdMes: number; explicacion: string; }
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
  return {
    tokensTotalesMes: Number(tokTotal.toFixed(0)),
    costoLlmUsdMes: Number(costoLlm.toFixed(2)),
    costoComputoUsd: Number(costoComp.toFixed(2)),
    costoTotalUsdMes: Number(total.toFixed(2)),
    explicacion: `${callsMes.toLocaleString('en-US')} calls/mes × ${tokCall} tokens = ${(tokTotal / 1e6).toFixed(1)}M tokens. LLM USD ${costoLlm.toFixed(0)} + cómputo USD ${costoComp.toFixed(0)} = USD ${total.toFixed(0)}/mes.`,
  };
}
