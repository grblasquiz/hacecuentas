/** APY combinado de stake ETH + restaking en EigenLayer + AVS rewards */
export interface Inputs { ethStakeado: number; apyStakingPct: number; apyRestakingPct: number; apyAvsPct: number; comisionOperadorPct: number; precioEthUsd: number; }
export interface Outputs { apyTotalNetoPct: number; rendimientoAnualEth: number; rendimientoAnualUsd: number; comisionAnualEth: number; explicacion: string; }
export function restakingEigenlayerRendimientoEth(i: Inputs): Outputs {
  const eth = Number(i.ethStakeado);
  const aS = Number(i.apyStakingPct) / 100;
  const aR = Number(i.apyRestakingPct) / 100;
  const aA = Number(i.apyAvsPct) / 100;
  const com = Number(i.comisionOperadorPct) / 100;
  const p = Number(i.precioEthUsd);
  if (!eth || eth <= 0) throw new Error('Ingresá el ETH stakeado');
  if (!p || p <= 0) throw new Error('Ingresá el precio de ETH');
  const apyBruto = aS + aR + aA;
  const apyNeto = apyBruto * (1 - com);
  const rendEth = eth * apyNeto;
  const rendUsd = rendEth * p;
  const comEth = eth * apyBruto * com;
  return {
    apyTotalNetoPct: Number((apyNeto * 100).toFixed(3)),
    rendimientoAnualEth: Number(rendEth.toFixed(6)),
    rendimientoAnualUsd: Number(rendUsd.toFixed(2)),
    comisionAnualEth: Number(comEth.toFixed(6)),
    explicacion: `Stakeando ${eth} ETH con APY combinado ${(apyBruto * 100).toFixed(2)}% (${(aS * 100).toFixed(1)}% staking + ${(aR * 100).toFixed(1)}% restaking + ${(aA * 100).toFixed(1)}% AVS) menos ${(com * 100).toFixed(0)}% comisión = APY neto ${(apyNeto * 100).toFixed(2)}% → ${rendEth.toFixed(4)} ETH/año (USD ${rendUsd.toFixed(2)}).`,
  };
}
