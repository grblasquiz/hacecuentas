export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dcaBitcoinHistoricoRentabilidad(i: Inputs): Outputs {
  const m=Number(i.aporteMensual)||0; const meses=Number(i.mesesDca)||0; const pp=Number(i.precioPromedio)||1; const pa=Number(i.precioActual)||0;
  const btc=m*meses/pp; const inv=m*meses; const valor=btc*pa; const roi=inv>0?((valor-inv)/inv*100):0;
  const ganancia=valor-inv;
  const valorFmt=`USD ${Math.round(valor).toLocaleString('en-US')}`;
  const roiTxt=`${roi>=0?'+':''}${roi.toFixed(1)}%`;
  const _insight = {
    title: roi>=0 ? 'Tu DCA va en verde' : 'Tu DCA va en rojo',
    text: roi>=0
      ? `Invertiste **USD ${inv.toLocaleString('en-US')}** comprando BTC a un promedio de USD ${pp.toLocaleString('en-US')} y hoy valen **${valorFmt}**: una ganancia de **USD ${Math.round(ganancia).toLocaleString('en-US')}** (**${roiTxt}**). El DCA suavizó el precio de entrada frente a la volatilidad.`
      : `Pusiste **USD ${inv.toLocaleString('en-US')}** y la posición vale hoy **${valorFmt}**, una pérdida latente de **USD ${Math.round(-ganancia).toLocaleString('en-US')}** (**${roiTxt}**). Mientras no vendas es no realizada; el DCA apuesta a promediar en las caídas.`,
    tone: (roi>=0 ? 'good' : 'warn') as 'good' | 'warn' | 'neutral',
    icon: '₿',
  };
  const _chart = (ganancia>0 && inv>0)
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Capital invertido', value: Math.round(inv) },
          { label: 'Ganancia', value: Math.round(ganancia) },
        ],
        prefix: 'USD ',
        centerValue: valorFmt,
        centerLabel: 'Valor actual',
        ariaLabel: `Valor actual ${valorFmt}: USD ${Math.round(inv).toLocaleString('en-US')} aportados más USD ${Math.round(ganancia).toLocaleString('en-US')} de ganancia.`,
      }
    : undefined;
  return { totalBtc:`${btc.toFixed(4)} BTC`, totalInvertido:`USD ${inv.toLocaleString('en-US')}`, valorActual:valorFmt, roi:roiTxt,
    ...(_chart ? { _chart } : {}), _insight };
}
