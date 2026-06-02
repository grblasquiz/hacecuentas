/** ROI ajustado por cronograma de vesting con cliff y unlock lineal */
export interface Inputs { tokensTotales: number; precioCompraUsd: number; precioActualUsd: number; tgeUnlockPct: number; cliffMeses: number; vestingMeses: number; }
export interface Outputs { tokensDisponiblesAhora: number; valorDisponibleUsd: number; valorTotalSiUnlock: number; roiInmediatoPct: number; roiTotalPct: number; explicacion: string; _chart?: any; _insight?: any; }
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
  const valorBloqueado = valorTotal - valorDisp;
  const chart = valorTotal > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Disponible ahora (TGE)', value: Number(valorDisp.toFixed(2)) },
      { label: 'Bloqueado (cliff + vesting)', value: Number(Math.max(0, valorBloqueado).toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(valorTotal).toLocaleString('es-AR'),
    centerLabel: 'Valor total',
    ariaLabel: 'Composición del valor total de los tokens al precio actual: porción liberada en el TGE y porción aún bloqueada por cliff y vesting.',
  } : undefined;
  const lockedPct = valorTotal > 0 ? (Math.max(0, valorBloqueado) / valorTotal) * 100 : 0;
  const _insight = {
    title: roiTotal >= 0 ? 'Posición en ganancia (en papel)' : 'Posición en pérdida (en papel)',
    text: roiTotal >= 0
      ? `Si todo se liberara hoy, tu ROI total sería **+${roiTotal.toFixed(1)}%**. Pero **${lockedPct.toFixed(0)}%** del valor (USD ${Math.max(0, valorBloqueado).toFixed(2)}) sigue bloqueado por el cliff de ${cliff}m y el vesting de ${vesting}m: ese precio puede cambiar mucho antes de que puedas vender.`
      : `Al precio actual tu ROI total es **${roiTotal.toFixed(1)}%** (pérdida en papel). Además **${lockedPct.toFixed(0)}%** del valor sigue bloqueado ${cliff}m de cliff + ${vesting}m de vesting, así que ni siquiera podés salir de toda la posición todavía.`,
    tone: roiTotal >= 0 ? 'good' : 'warn',
    icon: roiTotal >= 0 ? '🚀' : '📉',
  };
  return {
    tokensDisponiblesAhora: Number(tgeTokens.toFixed(4)),
    valorDisponibleUsd: Number(valorDisp.toFixed(2)),
    valorTotalSiUnlock: Number(valorTotal.toFixed(2)),
    roiInmediatoPct: Number(roiInm.toFixed(2)),
    roiTotalPct: Number(roiTotal.toFixed(2)),
    _chart: chart,
    _insight,
    explicacion: `Compraste ${total.toLocaleString('en-US')} tokens a USD ${compra}. TGE libera ${(tge * 100).toFixed(0)}% (${tgeTokens.toFixed(0)} tokens, USD ${valorDisp.toFixed(2)}). Cliff ${cliff}m + vesting ${vesting}m. ROI total si todo se libera: ${roiTotal.toFixed(2)}%.`,
  };
}
