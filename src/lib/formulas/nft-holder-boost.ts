/** NFT holder boost rewards */
export interface Inputs { nftsHeld: number; baseRewardPerNft: number; boostMultiplier: number; tokenPrice: number; daysHeld: number; rewardTokenInflation: number; }
export interface Outputs { totalTokensEarned: number; rewardsUsd: number; dailyRewards: number; nominalApr: number; realValueAfterInflation: number; explicacion: string; }
export function nftHolderBoostRewards(i: Inputs): Outputs {
  const nfts = Number(i.nftsHeld);
  const base = Number(i.baseRewardPerNft);
  const boost = Number(i.boostMultiplier) || 1;
  const price = Number(i.tokenPrice);
  const days = Number(i.daysHeld) || 30;
  const inflation = Number(i.rewardTokenInflation) / 100;
  if (!nfts || nfts <= 0) throw new Error('Cantidad NFTs');
  const tokensPerDay = base * boost * nfts;
  const totalTokens = tokensPerDay * days;
  const totalUsd = totalTokens * price;
  const dailyUsd = tokensPerDay * price;
  const priceAdjust = 1 + inflation;
  const realValue = totalUsd / priceAdjust;
  const apr = (365 / days) * (totalUsd / (nfts * price * 100)) * 100;
  return {
    totalTokensEarned: Number(totalTokens.toFixed(2)),
    rewardsUsd: Number(totalUsd.toFixed(2)),
    dailyRewards: Number(dailyUsd.toFixed(2)),
    nominalApr: Number(apr.toFixed(2)),
    realValueAfterInflation: Number(realValue.toFixed(2)),
    explicacion: `${nfts} NFTs × ${base} token/día × ${boost}x boost = ${tokensPerDay.toFixed(2)} tokens/día. En ${days}d: ${totalTokens.toFixed(2)} tokens @ $${price} = $${totalUsd.toFixed(2)}. Real (post-inflation): $${realValue.toFixed(2)}.`,
  };
}
