/** Costo de mint de un Rune en Bitcoin segun sat/vbyte y tamano de tx */
export interface Inputs { txVbytes: number; satsPerVbyte: number; btcUsd: number; cantidadMints: number; }
export interface Outputs { feeSatosihisPorMint: number; feeUsdPorMint: number; feeTotalSats: number; feeTotalUsd: number; feePctRespectoBtc: number; explicacion: string; _insight?: any; }
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
  // Congestión: <10 sat/vB barato, 10-50 normal, >50 caro
  const congestion = sat > 50 ? 'alta' : sat > 10 ? 'normal' : 'baja';
  const congestionWarn = sat > 50;
  const insight = {
    title: congestionWarn ? 'Mempool congestionado: fees caras' : 'Costo de minteo de tus Runes',
    text: `A **${sat} sat/vbyte** (congestión ${congestion}), cada mint cuesta **USD ${usdMint.toFixed(4)}** y tus **${n} mints** suman **USD ${totalUsd.toFixed(2)}**.${congestionWarn ? ' Esperar a que baje la red puede recortar el costo varias veces.' : ' Si la red se llena, este fee puede multiplicarse, así que minteá cuando el mempool esté tranquilo.'}`,
    tone: congestionWarn ? 'warn' : 'neutral',
    icon: '₿',
  };
  return {
    feeSatosihisPorMint: Number(satsMint.toFixed(0)),
    feeUsdPorMint: Number(usdMint.toFixed(4)),
    feeTotalSats: Number(totalSats.toFixed(0)),
    feeTotalUsd: Number(totalUsd.toFixed(2)),
    feePctRespectoBtc: Number(pctBtc.toFixed(6)),
    explicacion: `Mintear 1 Rune con tx de ${v} vbytes a ${sat} sat/vbyte cuesta ${satsMint.toFixed(0)} sats (USD ${usdMint.toFixed(4)}). Por ${n} mints: USD ${totalUsd.toFixed(2)} totales.`,
    _insight: insight,
  };
}
