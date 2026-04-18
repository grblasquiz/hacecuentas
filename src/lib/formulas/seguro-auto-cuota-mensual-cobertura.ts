export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function seguroAutoCuotaMensualCobertura(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const c=String(i.cob||'rc');
  const pct:Record<string,number>={rc:0.01,interm:0.025,todo:0.04};
  const mes=v*(pct[c]||0.02)/12;
  return { mensual:`$${mes.toFixed(0)}`, anual:`$${(mes*12).toFixed(0)}`, resumen:`Auto $${v.toLocaleString()} ${c}: ~$${mes.toFixed(0)}/mes.` };
}
