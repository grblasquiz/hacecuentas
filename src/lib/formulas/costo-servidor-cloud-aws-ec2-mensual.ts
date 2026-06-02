export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoServidorCloudAwsEc2Mensual(i: Inputs): Outputs {
  const h=Number(i.hora)||0; const hd=Number(i.horas)||24; const d=Number(i.dias)||30;
  const mes=h*hd*d;
  const fmt=(n:number)=>n.toLocaleString('es-AR',{maximumFractionDigits:2});
  const ahorroMes=mes*0.6;
  const _insight={
    title:'Reservá y bajá la factura',
    text:`A USD **${h}/hora**, ${hd}h por día durante ${d} días, esta instancia te cuesta **USD ${fmt(mes)}/mes** (USD **${fmt(mes*12)}/año**). Pasando a **Reserved** o **Spot Instances** podrías recortar hasta **USD ${fmt(ahorroMes)}/mes** (~60%) sobre el on-demand.`,
    tone:'warn',
    icon:'☁️',
  };
  return { mensual:`$${mes.toFixed(2)}`, anual:`$${(mes*12).toFixed(2)}`, ahorro:`$${(mes*0.6).toFixed(2)}/mes`, resumen:`$${h}/h × ${hd}h × ${d}d = $${mes.toFixed(0)}/mes.`, _insight };
}
