export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function presupuestoViajeEuropa30DiasTotal(i: Inputs): Outputs {
  const p=Number(i.paisesPrincipales)||4; const e=String(i.estiloViaje||'hostel'); const c=Number(i.comidasAfuera)||2;
  const porDia={'hostel':70,'hotel_medio':130,'hotel_alto':230}[e];
  const hospedaje=porDia*30;
  const aereo=1200;
  const transInterno=p*80;
  const actividades=30*50;
  const totalDia=porDia+25+c*15;
  const total=aereo+transInterno+actividades+totalDia*30;
  return { totalUsd:`USD ${Math.round(total).toLocaleString('en-US')}`, porDia:`USD ${Math.round(totalDia)}`, desglose:`Aéreo USD ${aereo} + Hospedaje ${hospedaje} + Transporte ${transInterno} + Comidas ${30*c*15} + Actividades ${actividades}` };
}
