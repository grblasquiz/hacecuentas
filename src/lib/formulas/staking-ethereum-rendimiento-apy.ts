export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function stakingEthereumRendimientoApy(i: Inputs): Outputs {
  const e=Number(i.ethStaked)||0; const a=Number(i.apyPorcentaje)||0; const p=Number(i.precioEth)||0;
  const ganado=e*a/100; const usd=ganado*p; const mens=usd/12;
  return { ethGanado:`${ganado.toFixed(4)} ETH`, valorUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`, rendimientoMensual:`USD ${Math.round(mens).toLocaleString('en-US')}` };
}
