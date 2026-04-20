export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function estacionamientoMedidoHoraCabaZona(i: Inputs): Outputs {
  const h=Number(i.horas)||0; const z=String(i.zona||'centro');
  const tarifa={'centro':2000,'microcentro':2500,'residencial':1000,'barrios_perifericos':500}[z];
  const total=h*tarifa;
  return { costoTotal:`$${total.toLocaleString('es-AR')}`, porHora:`$${tarifa.toLocaleString('es-AR')}/h`, limite:z==='microcentro'?'Máx 2 horas':'Sin límite (pagá por hora)' };
}
