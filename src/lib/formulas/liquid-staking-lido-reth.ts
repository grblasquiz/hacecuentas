/** Liquid staking Lido vs Rocket Pool */
export interface Inputs { ethAmount: number; provider: string; apr: number; ethPriceUsd: number; years: number; }
export interface Outputs { rewardEthNet: number; rewardUsd: number; lstReceived: number; feeCharged: number; apyEffective: number; vs32EthGap: number; explicacion: string; _insight?: any; _chart?: any; }
export function liquidStakingLidoReth(i: Inputs): Outputs {
  const eth = Number(i.ethAmount);
  const provider = String(i.provider || 'lido');
  const apr = Number(i.apr) / 100;
  const price = Number(i.ethPriceUsd) || 3200;
  const years = Number(i.years) || 1;
  if (!eth || eth <= 0) throw new Error('Ingresá ETH');
  const fee = provider === 'rocket' ? 0.14 : 0.10;
  const gross = eth * (Math.pow(1 + apr / 365, 365 * years) - 1);
  const feeEth = gross * fee;
  const net = gross - feeEth;
  const usd = net * price;
  const lstReceived = eth;
  const apyEff = (Math.pow(1 + apr / 365, 365) - 1) * (1 - fee) * 100;
  const solo = eth * (Math.pow(1 + apr / 365, 365 * years) - 1);
  const gap = solo - net;
  const netSlice = Number(net.toFixed(4));
  const feeSlice = Number(feeEth.toFixed(4));
  const grossEth = netSlice + feeSlice;
  const providerName = provider === 'rocket' ? 'Rocket Pool' : 'Lido';
  const _insight = {
    title: `Ganás ${net.toFixed(4)} ETH netos (~$${usd.toFixed(0)})`,
    text: `Con **${eth} ETH** en ${providerName} al ${(apr*100).toFixed(2)}% APR durante ${years} año(s) embolsás **${net.toFixed(4)} ETH** netos (~$${usd.toFixed(0)}). El protocolo se queda **${(fee*100).toFixed(0)}%** (${feeEth.toFixed(4)} ETH), dejando un APY efectivo de **${apyEff.toFixed(2)}%**.`,
    tone: 'warn',
    icon: '🪙',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Tu recompensa neta', value: netSlice },
      { label: `Fee ${providerName} (${(fee*100).toFixed(0)}%)`, value: feeSlice },
    ],
    prefix: '',
    centerValue: `${grossEth.toFixed(4)} ETH`,
    centerLabel: 'Recompensa bruta',
    ariaLabel: `De ${grossEth.toFixed(4)} ETH de recompensa bruta, ${netSlice} ETH son para vos y ${feeSlice} ETH se los lleva ${providerName}.`,
  };
  return {
    rewardEthNet: Number(net.toFixed(6)),
    rewardUsd: Number(usd.toFixed(2)),
    lstReceived: Number(lstReceived.toFixed(4)),
    feeCharged: Number(feeEth.toFixed(6)),
    apyEffective: Number(apyEff.toFixed(3)),
    vs32EthGap: Number(gap.toFixed(6)),
    explicacion: `Con ${eth} ETH en ${provider} al ${(apr*100).toFixed(2)}% APR: ganás ${net.toFixed(4)} ETH en ${years} año(s) = $${usd.toFixed(2)}. Fee ${(fee*100).toFixed(0)}% se queda el protocolo.`,
    _insight,
    _chart,
  };
}
