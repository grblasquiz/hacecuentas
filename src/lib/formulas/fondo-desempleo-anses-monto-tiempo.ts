export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fondoDesempleoAnsesMontoTiempo(i: Inputs): Outputs {
  const s=Number(i.sueldoPromedio)||0; const m=Number(i.mesesTrabajados)||0;
  const monto=Math.min(s*0.5,500000); // tope aprox
  const dur=m<12?2:m<24?4:m<36?8:12;
  return { montoMensual:`$${Math.round(monto).toLocaleString('es-AR')}`, duracion:`${dur} meses`, interpretacion:`Con ${m} meses aportados cobrás $${Math.round(monto).toLocaleString('es-AR')}/mes durante ${dur} meses.` };
}
