/** ROI ajustado por cronograma de vesting con cliff y unlock lineal */
export interface Inputs { tokensTotales: number; precioCompraUsd: number; precioActualUsd: number; tgeUnlockPct: number; cliffMeses: number; vestingMeses: number; }
export interface Outputs { tokensDisponiblesAhora: number; valorDisponibleUsd: number; valorTotalSiUnlock: number; roiInmediatoPct: number; roiTotalPct: number; explicacion: string; }
export function tokenVestingCliffTgeUnlockRoi(i: Inputs): Outputs {
  const total = Number(i.tokensTotales);
  const compra = Number(i.precioCompraUsd);
  const actual = Number(i.precioActualUsd);
  const tge = Number(i.tgeUnlockPct) / 100;
  const cliff = Number(i.cliffMeses);
  const vesting = Number(i.vestingMeses);
  if (!total || total <= 0) throw new Error('Ingresá la cantidad de tokens');
  if (!compra || compra <= 0) throw new Error('Ingresá el precio de compra');
  if (!actual || actual < 0) throw new Error('Ingresá el precio actual');
  const tgeTokens = total * tge;
  const valorDisp = tgeTokens * actual;
  const valorTotal = total * actual;
  const inversion = total * compra;
  const roiInm = ((valorDisp - inversion * tge) / (inversion * tge)) * 100;
  const roiTotal = ((valorTotal - inversion) / inversion) * 100;
  return {
    tokensDisponiblesAhora: Number(tgeTokens.toFixed(4)),
    valorDisponibleUsd: Number(valorDisp.toFixed(2)),
    valorTotalSiUnlock: Number(valorTotal.toFixed(2)),
    roiInmediatoPct: Number(roiInm.toFixed(2)),
    roiTotalPct: Number(roiTotal.toFixed(2)),
    explicacion: `Compraste ${total.toLocaleString('en-US')} tokens a USD ${compra}. TGE libera ${(tge * 100).toFixed(0)}% (${tgeTokens.toFixed(0)} tokens, USD ${valorDisp.toFixed(2)}). Cliff ${cliff}m + vesting ${vesting}m. ROI total si todo se libera: ${roiTotal.toFixed(2)}%.`,
  };
}
