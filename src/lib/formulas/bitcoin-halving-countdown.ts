/** Bitcoin halving countdown */
export interface Inputs { currentBlockHeight: number; avgBlockTimeMin: number; }
export interface Outputs { blocksToHalving: number; daysUntilHalving: number; estimatedDate: string; currentReward: number; nextReward: number; explicacion: string; }
export function bitcoinHalvingCountdown(i: Inputs): Outputs {
  const currentBlock = Number(i.currentBlockHeight);
  const avgBlockTime = Number(i.avgBlockTimeMin) || 10;
  if (!currentBlock || currentBlock <= 0) throw new Error('Current block height inválido');
  const halvingInterval = 210000;
  const halvingNumber = Math.ceil((currentBlock + 1) / halvingInterval);
  const nextHalvingBlock = halvingNumber * halvingInterval;
  const blocksRemaining = nextHalvingBlock - currentBlock;
  const minutesRemaining = blocksRemaining * avgBlockTime;
  const daysRemaining = minutesRemaining / 1440;
  const now = new Date();
  const estimatedDate = new Date(now.getTime() + minutesRemaining * 60 * 1000);
  const currentReward = 50 / Math.pow(2, halvingNumber - 1);
  const nextReward = currentReward / 2;
  return {
    blocksToHalving: blocksRemaining,
    daysUntilHalving: Number(daysRemaining.toFixed(1)),
    estimatedDate: estimatedDate.toISOString().split('T')[0],
    currentReward: Number(currentReward.toFixed(6)),
    nextReward: Number(nextReward.toFixed(6)),
    explicacion: `Block actual ${currentBlock}, próximo halving en ${blocksRemaining} bloques (${daysRemaining.toFixed(0)} días, aprox ${estimatedDate.toISOString().split('T')[0]}). Reward actual ${currentReward} BTC → ${nextReward} BTC.`,
  };
}
