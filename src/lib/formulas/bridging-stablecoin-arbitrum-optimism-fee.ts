/** Costo total de bridge de stablecoin entre L2 con bridge nativo vs Across vs Hop */
export interface Inputs { montoUsdc: number; gasNativoUsd: number; gasAcrossUsd: number; gasHopUsd: number; feeAcrossPct: number; feeHopPct: number; minutosNativo: number; }
export interface Outputs { costoNativoUsd: number; costoAcrossUsd: number; costoHopUsd: number; mejorOpcion: string; ahorroVsMasCaroUsd: number; explicacion: string; }
export function bridgingStablecoinArbitrumOptimismFee(i: Inputs): Outputs {
  const m = Number(i.montoUsdc);
  const gN = Number(i.gasNativoUsd);
  const gA = Number(i.gasAcrossUsd);
  const gH = Number(i.gasHopUsd);
  const fA = Number(i.feeAcrossPct) / 100;
  const fH = Number(i.feeHopPct) / 100;
  if (!m || m <= 0) throw new Error('Ingresá el monto a bridgear');
  const cN = gN;
  const cA = gA + m * fA;
  const cH = gH + m * fH;
  const map = { 'Bridge nativo': cN, Across: cA, Hop: cH };
  const sorted = Object.entries(map).sort((a, b) => a[1] - b[1]);
  const mejor = sorted[0][0];
  const dif = sorted[sorted.length - 1][1] - sorted[0][1];
  return {
    costoNativoUsd: Number(cN.toFixed(2)),
    costoAcrossUsd: Number(cA.toFixed(2)),
    costoHopUsd: Number(cH.toFixed(2)),
    mejorOpcion: mejor,
    ahorroVsMasCaroUsd: Number(dif.toFixed(2)),
    explicacion: `Bridgear USDC ${m.toLocaleString('en-US')}: Nativo USD ${cN.toFixed(2)} (~${i.minutosNativo}m), Across USD ${cA.toFixed(2)} (rápido), Hop USD ${cH.toFixed(2)}. Mejor: ${mejor}.`,
  };
}
