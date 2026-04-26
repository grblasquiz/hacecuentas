/** Costo de mint de un Rune en Bitcoin segun sat/vbyte y tamano de tx */
export interface Inputs { txVbytes: number; satsPerVbyte: number; btcUsd: number; cantidadMints: number; }
export interface Outputs { feeSatosihisPorMint: number; feeUsdPorMint: number; feeTotalSats: number; feeTotalUsd: number; feePctRespectoBtc: number; explicacion: string; }
export function runesBitcoinProtocoloFeeMint(i: Inputs): Outputs {
  const v = Number(i.txVbytes);
  const sat = Number(i.satsPerVbyte);
  const btc = Number(i.btcUsd);
  const n = Number(i.cantidadMints);
  if (!v || v <= 0) throw new Error('Ingresá el tamaño de la tx en vbytes');
  if (!sat || sat <= 0) throw new Error('Ingresá las sat/vbyte');
  if (!btc || btc <= 0) throw new Error('Ingresá el precio de BTC');
  if (!n || n <= 0) throw new Error('Ingresá la cantidad de mints');
  const satsMint = v * sat;
  const usdMint = (satsMint / 100_000_000) * btc;
  const totalSats = satsMint * n;
  const totalUsd = usdMint * n;
  const pctBtc = (satsMint / 100_000_000) * 100;
  return {
    feeSatosihisPorMint: Number(satsMint.toFixed(0)),
    feeUsdPorMint: Number(usdMint.toFixed(4)),
    feeTotalSats: Number(totalSats.toFixed(0)),
    feeTotalUsd: Number(totalUsd.toFixed(2)),
    feePctRespectoBtc: Number(pctBtc.toFixed(6)),
    explicacion: `Mintear 1 Rune con tx de ${v} vbytes a ${sat} sat/vbyte cuesta ${satsMint.toFixed(0)} sats (USD ${usdMint.toFixed(4)}). Por ${n} mints: USD ${totalUsd.toFixed(2)} totales.`,
  };
}
