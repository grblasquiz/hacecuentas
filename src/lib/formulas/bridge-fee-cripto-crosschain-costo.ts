export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function bridgeFeeCriptoCrosschainCosto(i: Inputs): Outputs {
  const m=Number(i.montoUsd)||0; const co=String(i.chainOrigen||'eth'); const cd=String(i.chainDestino||'arbitrum');
  const isEth=co==='eth'||cd==='eth'; const fixed=isEth?5:1; const pct=0.001;
  const fee=fixed+m*pct; const recibido=m-fee;
  const feePct = m>0 ? fee/m*100 : 0;
  const _insight = m>0 ? {
    title: 'Cuánto te come el bridge',
    text: `Mover **USD ${m.toLocaleString('en-US')}** ${isEth ? 'pasando por Ethereum' : 'entre L2'} cuesta **USD ${fee.toFixed(2)}** de fee (**${feePct.toFixed(2)}%**), así que del otro lado llegan **USD ${recibido.toFixed(2)}** en ~${isEth ? '10-20' : '2-5'} min.`,
    tone: feePct > 1 ? 'warn' : feePct > 0.3 ? 'neutral' : 'good',
    icon: '🌉',
  } : undefined;
  const _chart = m>0 && recibido>0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Monto recibido', value: Number(recibido.toFixed(2)) },
      { label: 'Fee del bridge', value: Number(fee.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: `USD ${recibido.toFixed(2)}`,
    centerLabel: 'Recibís',
    ariaLabel: `Reparto del monto enviado entre lo que recibís y el fee del bridge`,
  } : undefined;
  return { feeEstimado:`USD ${fee.toFixed(2)}`, montoRecibido:`USD ${recibido.toFixed(2)}`, tiempo:isEth?'10-20 min':'2-5 min', _insight, _chart };
}
