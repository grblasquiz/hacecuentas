export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fondoDesempleoAnsesMontoTiempo(i: Inputs): Outputs {
  const s=Number(i.sueldoPromedio)||0; const m=Number(i.mesesTrabajados)||0;
  const monto=Math.min(s*0.5,500000); // tope aprox
  const dur=m<12?2:m<24?4:m<36?8:12;
  const topeAplica=s*0.5>500000;
  const totalAcobrar=monto*dur;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title:'Tu prestación por desempleo',
    text:`Con **${m} meses** aportados cobrás **${fmt(monto)}/mes** durante **${dur} meses** (~**${fmt(totalAcobrar)}** en total).`+(topeAplica?` El monto quedó limitado por el **tope** de la prestación, no por tu sueldo.`:` Sumá meses de aporte para extender la duración del cobro.`),
    tone: dur<=2 ? 'warn' : 'neutral',
    icon:'🛟'
  };
  return { montoMensual:`$${Math.round(monto).toLocaleString('es-AR')}`, duracion:`${dur} meses`, interpretacion:`Con ${m} meses aportados cobrás $${Math.round(monto).toLocaleString('es-AR')}/mes durante ${dur} meses.`, _insight };
}
