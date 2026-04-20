export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dcaBitcoinHistoricoRentabilidad(i: Inputs): Outputs {
  const m=Number(i.aporteMensual)||0; const meses=Number(i.mesesDca)||0; const pp=Number(i.precioPromedio)||1; const pa=Number(i.precioActual)||0;
  const btc=m*meses/pp; const inv=m*meses; const valor=btc*pa; const roi=inv>0?((valor-inv)/inv*100):0;
  return { totalBtc:`${btc.toFixed(4)} BTC`, totalInvertido:`USD ${inv.toLocaleString('en-US')}`, valorActual:`USD ${Math.round(valor).toLocaleString('en-US')}`, roi:`${roi>=0?'+':''}${roi.toFixed(1)}%` };
}
