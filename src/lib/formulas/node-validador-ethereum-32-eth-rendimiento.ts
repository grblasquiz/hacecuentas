/** APY validador Ethereum: solo (32 ETH) vs pool (Rocket Pool, Lido) vs LST */
export interface Inputs { ethStakeado: number; apyConsensoPct: number; apyEjecucionPct: number; comisionPoolPct: number; costoHardwareMensualUsd: number; precioEthUsd: number; }
export interface Outputs { rendimientoAnualEth: number; rendimientoAnualUsd: number; apyNetoPct: number; costoHardwareAnualUsd: number; explicacion: string; }
export function nodeValidadorEthereum32EthRendimiento(i: Inputs): Outputs {
  const eth = Number(i.ethStakeado);
  const apyCons = Number(i.apyConsensoPct) / 100;
  const apyEjec = Number(i.apyEjecucionPct) / 100;
  const comision = Number(i.comisionPoolPct) / 100;
  const hwMes = Number(i.costoHardwareMensualUsd);
  const precio = Number(i.precioEthUsd);
  if (!eth || eth <= 0) throw new Error('Ingresá ETH stakeado');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del ETH');
  const apyBruto = apyCons + apyEjec;
  const rendimientoBrutoEth = eth * apyBruto;
  const comisionEth = rendimientoBrutoEth * comision;
  const rendimientoNetoEth = rendimientoBrutoEth - comisionEth;
  const rendimientoUsd = rendimientoNetoEth * precio;
  const hwAnual = hwMes * 12;
  const apyNeto = ((rendimientoUsd - hwAnual) / (eth * precio)) * 100;
  return {
    rendimientoAnualEth: Number(rendimientoNetoEth.toFixed(4)),
    rendimientoAnualUsd: Number(rendimientoUsd.toFixed(2)),
    apyNetoPct: Number(apyNeto.toFixed(3)),
    costoHardwareAnualUsd: Number(hwAnual.toFixed(2)),
    explicacion: `Stakeás ${eth} ETH a APY bruto ${(apyBruto * 100).toFixed(2)}%. Neto ${rendimientoNetoEth.toFixed(4)} ETH/año (USD ${rendimientoUsd.toFixed(0)}). APY neto post hardware: ${apyNeto.toFixed(2)}%.`,
  };
}
