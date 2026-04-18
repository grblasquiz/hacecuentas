export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoServidorCloudAwsEc2Mensual(i: Inputs): Outputs {
  const h=Number(i.hora)||0; const hd=Number(i.horas)||24; const d=Number(i.dias)||30;
  const mes=h*hd*d;
  return { mensual:`$${mes.toFixed(2)}`, anual:`$${(mes*12).toFixed(2)}`, ahorro:`$${(mes*0.6).toFixed(2)}/mes`, resumen:`$${h}/h × ${hd}h × ${d}d = $${mes.toFixed(0)}/mes.` };
}
