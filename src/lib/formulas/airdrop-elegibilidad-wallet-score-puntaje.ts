/** Score educativo de elegibilidad de wallet para airdrops segun metricas onchain */
export interface Inputs { transaccionesTotales: number; volumenOperadoUsd: number; antiguedadMeses: number; bridgesUsados: number; protocolosInteractuados: number; }
export interface Outputs { scoreTransacciones: number; scoreVolumen: number; scoreAntiguedad: number; scoreBridges: number; scoreProtocolos: number; scoreTotal: number; tier: string; explicacion: string; }
export function airdropElegibilidadWalletScorePuntaje(i: Inputs): Outputs {
  const tx = Number(i.transaccionesTotales);
  const vol = Number(i.volumenOperadoUsd);
  const ant = Number(i.antiguedadMeses);
  const br = Number(i.bridgesUsados);
  const pr = Number(i.protocolosInteractuados);
  if (tx < 0 || vol < 0 || ant < 0 || br < 0 || pr < 0) throw new Error('Los valores no pueden ser negativos');
  const sTx = Math.min(20, tx / 10);
  const sVol = Math.min(25, vol / 1000);
  const sAnt = Math.min(20, ant);
  const sBr = Math.min(15, br * 3);
  const sPr = Math.min(20, pr * 2);
  const total = sTx + sVol + sAnt + sBr + sPr;
  let tier = 'Bajo';
  if (total >= 80) tier = 'Sybil-resistant alto';
  else if (total >= 60) tier = 'Buen perfil';
  else if (total >= 40) tier = 'Medio';
  return {
    scoreTransacciones: Number(sTx.toFixed(2)),
    scoreVolumen: Number(sVol.toFixed(2)),
    scoreAntiguedad: Number(sAnt.toFixed(2)),
    scoreBridges: Number(sBr.toFixed(2)),
    scoreProtocolos: Number(sPr.toFixed(2)),
    scoreTotal: Number(total.toFixed(2)),
    tier,
    explicacion: `Score educativo: ${total.toFixed(0)}/100 (${tier}). Tx ${sTx.toFixed(0)}, Volumen ${sVol.toFixed(0)}, Antigüedad ${sAnt.toFixed(0)}, Bridges ${sBr.toFixed(0)}, Protocolos ${sPr.toFixed(0)}. No garantiza elegibilidad real.`,
  };
}
