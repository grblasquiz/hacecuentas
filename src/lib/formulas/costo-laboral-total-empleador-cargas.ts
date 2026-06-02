export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoLaboralTotalEmpleadorCargas(i: Inputs): Outputs {
  const s=Number(i.sueldoBruto)||0; const cs=Number(i.cargasSociales)||0; const art=Number(i.art)||0; const seg=Number(i.seguros)||0;
  const total=s*(1+(cs+art+seg)/100); const anual=total*13; const pct=((total/s-1)*100);
  const cargas=Math.round(total-s);
  const fmt=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const tono = pct>=50?'warn':pct>=35?'neutral':'good';
  return {
    costoTotal:fmt(total),
    costoAnual:fmt(anual),
    porcentajeCargas:`+${pct.toFixed(1)}%`,
    _insight:{
      title:'Lo que cuesta de verdad un empleado',
      text:`Un sueldo bruto de **${fmt(s)}** te cuesta **${fmt(total)}/mes** (${fmt(cargas)} extra en cargas, ART y seguros, un **+${pct.toFixed(1)}%**). En el año, con aguinaldo, son **${fmt(anual)}**.`,
      tone:tono,
      icon:'🧾',
    },
    _chart:{
      type:'doughnut',
      slices:[
        {label:'Sueldo bruto',value:Math.round(s)},
        {label:'Cargas + ART + seguros',value:cargas},
      ],
      prefix:'$',
      centerValue:fmt(total),
      centerLabel:'Costo mensual',
      ariaLabel:`El costo laboral total de ${fmt(total)} se compone del sueldo bruto ${fmt(s)} más ${fmt(cargas)} de cargas, ART y seguros.`,
    },
  };
}
