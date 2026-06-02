export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function presupuestoViajeEuropa30DiasTotal(i: Inputs): Outputs {
  const p=Number(i.paisesPrincipales)||4; const e=String(i.estiloViaje||'hostel'); const c=Number(i.comidasAfuera)||2;
  const porDia={'hostel':70,'hotel_medio':130,'hotel_alto':230}[e];
  const hospedaje=porDia*30;
  const aereo=1200;
  const transInterno=p*80;
  const actividades=30*50;
  const totalDia=porDia+25+c*15;
  const total=aereo+transInterno+actividades+totalDia*30;
  const comidas=30*c*15;
  const varios=25*30;
  const fmt=(n:number)=>Math.round(n).toLocaleString('en-US');
  const estiloLabel={'hostel':'mochilero (hostel)','hotel_medio':'hotel medio','hotel_alto':'hotel de alta gama'}[e]||'hotel medio';
  const _insight={
    title:'Tu presupuesto para 30 días en Europa',
    text:`Un mes recorriendo **${p} ${p===1?'país':'países'}** en estilo ${estiloLabel} sale **USD ${fmt(total)}** por persona, unos **USD ${Math.round(totalDia)}** por día en destino. Solo el aéreo (**USD ${fmt(aereo)}**) y el hospedaje (**USD ${fmt(hospedaje)}**) ya son el grueso del viaje.`,
    tone:'warn',
    icon:'✈️'
  };
  const _chart={
    type:'doughnut',
    slices:[
      {label:'Aéreo',value:Math.round(aereo)},
      {label:'Hospedaje',value:Math.round(hospedaje)},
      {label:'Comidas',value:Math.round(comidas)},
      {label:'Actividades',value:Math.round(actividades)},
      {label:'Transporte interno',value:Math.round(transInterno)},
      {label:'Varios',value:Math.round(varios)}
    ],
    prefix:'$',
    centerValue:`USD ${fmt(total)}`,
    centerLabel:'Total 30 días',
    ariaLabel:`Desglose del presupuesto de 30 días en Europa: total USD ${fmt(total)}`
  };
  return { totalUsd:`USD ${Math.round(total).toLocaleString('en-US')}`, porDia:`USD ${Math.round(totalDia)}`, desglose:`Aéreo USD ${aereo} + Hospedaje ${hospedaje} + Transporte ${transInterno} + Comidas ${30*c*15} + Actividades ${actividades}`, _insight, _chart };
}
