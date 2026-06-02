export interface Outputs { [k: string]: string | number | undefined | any; _insight?: any; _chart?: any; }
export function tokensOpenaiGptCostoUsoMensual(i: Inputs): Outputs {
  const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0; const m=String(i.modelo||'gpt_4_turbo');
  const pricing={'gpt_4_turbo':[10,30],'gpt_4':[30,60],'gpt_35_turbo':[0.5,1.5],'gpt_4o':[5,15]}[m];
  const costoIn=ti*pricing[0]; const costoOut=to*pricing[1];
  const total=costoIn+costoOut;
  const requests=(ti+to)*1000/5; // asumir 5k tokens prom por request
  const porReq=requests>0?total/requests:0;

  const inShare = total > 0 ? (costoIn / total) * 100 : 0;
  const heavySide = costoOut >= costoIn ? 'salida' : 'entrada';
  const _insight = {
    title: 'De dónde sale tu factura',
    text: `Vas a gastar **USD ${total.toFixed(2)}/mes** con ${m.replace(/_/g,'-')}. El **${inShare.toFixed(0)}%** es entrada y el resto salida; los tokens de **${heavySide}** son los que más pesan. Como la salida cuesta 2-3× más que la entrada, recortar respuestas largas baja el costo más rápido que recortar el prompt.`,
    tone: total >= 100 ? 'warn' : 'neutral',
    icon: '🤖',
  };
  const _chart = total > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tokens de entrada', value: Number(costoIn.toFixed(2)) },
      { label: 'Tokens de salida', value: Number(costoOut.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + total.toFixed(2),
    centerLabel: 'Costo mensual',
    ariaLabel: `Composición del costo mensual de USD ${total.toFixed(2)}: USD ${costoIn.toFixed(2)} por tokens de entrada y USD ${costoOut.toFixed(2)} por tokens de salida.`,
  } : undefined;

  return { costoMensual:`USD ${total.toFixed(2)}`, porRequest:`USD ${porReq.toFixed(4)}`, observacion:`In ${ti}M × USD ${pricing[0]} + Out ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mes.`, _insight, _chart };
}
