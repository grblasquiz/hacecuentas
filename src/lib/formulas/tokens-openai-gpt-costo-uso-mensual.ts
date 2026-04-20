export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tokensOpenaiGptCostoUsoMensual(i: Inputs): Outputs {
  const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0; const m=String(i.modelo||'gpt_4_turbo');
  const pricing={'gpt_4_turbo':[10,30],'gpt_4':[30,60],'gpt_35_turbo':[0.5,1.5],'gpt_4o':[5,15]}[m];
  const costoIn=ti*pricing[0]; const costoOut=to*pricing[1];
  const total=costoIn+costoOut;
  const requests=(ti+to)*1000/5; // asumir 5k tokens prom por request
  const porReq=requests>0?total/requests:0;
  return { costoMensual:`USD ${total.toFixed(2)}`, porRequest:`USD ${porReq.toFixed(4)}`, observacion:`In ${ti}M × USD ${pricing[0]} + Out ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mes.` };
}
