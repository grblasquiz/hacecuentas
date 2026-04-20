export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bridgeFeeCriptoCrosschainCosto(i: Inputs): Outputs {
  const m=Number(i.montoUsd)||0; const co=String(i.chainOrigen||'eth'); const cd=String(i.chainDestino||'arbitrum');
  const isEth=co==='eth'||cd==='eth'; const fixed=isEth?5:1; const pct=0.001;
  const fee=fixed+m*pct; const recibido=m-fee;
  return { feeEstimado:`USD ${fee.toFixed(2)}`, montoRecibido:`USD ${recibido.toFixed(2)}`, tiempo:isEth?'10-20 min':'2-5 min' };
}
