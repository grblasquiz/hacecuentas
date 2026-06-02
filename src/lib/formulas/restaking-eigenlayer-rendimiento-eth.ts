/** APY combinado de stake ETH + restaking en EigenLayer + AVS rewards */
export interface Inputs { ethStakeado: number; apyStakingPct: number; apyRestakingPct: number; apyAvsPct: number; comisionOperadorPct: number; precioEthUsd: number; }
export interface Outputs { apyTotalNetoPct: number; rendimientoAnualEth: number; rendimientoAnualUsd: number; comisionAnualEth: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const grossEth = eth * apyBruto;
  const insight = {
    title: apyNeto >= 0.06 ? 'Rendimiento atractivo' : apyNeto >= 0.03 ? 'Rendimiento moderado' : 'Rendimiento bajo',
    text: `Tu APY neto es **${(apyNeto * 100).toFixed(2)}%** (bruto ${(apyBruto * 100).toFixed(2)}% menos ${(com * 100).toFixed(0)}% del operador), o sea **${rendEth.toFixed(4)} ETH/año** (~$${rendUsd.toFixed(0)} USD). La comisión te resta **${comEth.toFixed(4)} ETH** anuales, sobre todo el riesgo extra de slashing del restaking.`,
    tone: apyNeto >= 0.06 ? 'good' : apyNeto >= 0.03 ? 'neutral' : 'warn',
    icon: '💠',
  };
  const out: Outputs = {
    apyTotalNetoPct: Number((apyNeto * 100).toFixed(3)),
    rendimientoAnualEth: Number(rendEth.toFixed(6)),
    rendimientoAnualUsd: Number(rendUsd.toFixed(2)),
    comisionAnualEth: Number(comEth.toFixed(6)),
    explicacion: `Stakeando ${eth} ETH con APY combinado ${(apyBruto * 100).toFixed(2)}% (${(aS * 100).toFixed(1)}% staking + ${(aR * 100).toFixed(1)}% restaking + ${(aA * 100).toFixed(1)}% AVS) menos ${(com * 100).toFixed(0)}% comisión = APY neto ${(apyNeto * 100).toFixed(2)}% → ${rendEth.toFixed(4)} ETH/año (USD ${rendUsd.toFixed(2)}).`,
    _insight: insight,
  };
  if (grossEth > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Tu rendimiento neto', value: Number(rendEth.toFixed(6)) },
        { label: 'Comisión del operador', value: Number(comEth.toFixed(6)) },
      ],
      suffix: ' ETH',
      centerValue: grossEth.toFixed(4) + ' ETH',
      centerLabel: 'Rendimiento bruto/año',
      ariaLabel: `Reparto del rendimiento bruto anual de ${grossEth.toFixed(4)} ETH entre tu parte neta y la comisión del operador`,
    };
  }
  return out;
}
