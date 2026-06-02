export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function estacionamientoMedidoHoraCabaZona(i: Inputs): Outputs {
  const h=Number(i.horas)||0; const z=String(i.zona||'centro');
  const tarifa=({'centro':2000,'microcentro':2500,'residencial':1000,'barrios_perifericos':500} as Record<string,number>)[z] ?? 2000;
  const total=h*tarifa;
  const microLimite = z==='microcentro';
  const _insight = microLimite
    ? {
        title:'Microcentro: tope de 2 horas',
        text:`A **$${tarifa.toLocaleString('es-AR')}/h**, **${h} h** suman **$${total.toLocaleString('es-AR')}**. El microcentro tiene un **máximo de 2 horas** de estacionamiento medido: pasado ese tiempo tenés que mover el auto o arriesgás acarreo y multa.`,
        tone:'warn',
        icon:'🅿️',
      }
    : {
        title:`Costo: $${total.toLocaleString('es-AR')}`,
        text:`En zona ${z.replace('_',' ')} la tarifa es **$${tarifa.toLocaleString('es-AR')}/h**, así que **${h} h** salen **$${total.toLocaleString('es-AR')}**. Acordate de activar el pago en la app de estacionamiento medido apenas estacionás.`,
        tone:'neutral',
        icon:'🅿️',
      };
  return { costoTotal:`$${total.toLocaleString('es-AR')}`, porHora:`$${tarifa.toLocaleString('es-AR')}/h`, limite:microLimite?'Máx 2 horas':'Sin límite (pagá por hora)', _insight };
}
