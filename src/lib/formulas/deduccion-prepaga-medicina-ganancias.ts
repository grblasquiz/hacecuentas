export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function deduccionPrepagaMedicinaGanancias(i: Inputs): Outputs {
  const c=Number(i.cuotaPrepagaMensual)||0; const g=Number(i.gananciaNetaAnual)||0;
  const anual=c*12;
  const tope=g*0.05;
  const deduc=Math.min(anual,tope);
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

  const out:Outputs={ deduccionReal:fmt(deduc), topeAnual:fmt(tope), resumen:`Prepaga $${c}/mes = $${anual} anual. Deducción efectiva $${deduc.toFixed(0)} (tope 5%).` };

  if(anual>0 && g>0){
    const excedente=Math.max(0,anual-tope);
    if(excedente>0){
      out._insight={ title:'El tope del 5% te recorta', text:`Pagás **${fmt(anual)}** de prepaga al año, pero solo podés deducir **${fmt(deduc)}** porque el tope es el 5% de tu ganancia neta (**${fmt(tope)}**). Quedan **${fmt(excedente)}** sin deducir este año.`, tone:'warn', icon:'🏥' };
      out._chart={ type:'doughnut', slices:[ {label:'Deducible (tope 5%)',value:Math.round(deduc)}, {label:'No deducible (excede tope)',value:Math.round(excedente)} ], prefix:'$', centerValue:fmt(anual), centerLabel:'Prepaga anual', ariaLabel:'Parte deducible vs no deducible de la cuota de prepaga anual' };
    } else {
      out._insight={ title:'Deducís toda la prepaga', text:`Tus **${fmt(anual)}** de prepaga anual entran completos dentro del tope del 5% (**${fmt(tope)}**), así que podés deducir el total y bajar tu base de Ganancias.`, tone:'good', icon:'🏥' };
    }
  } else {
    out._insight={ title:'Completá los datos', text:'Cargá la cuota mensual de prepaga y tu ganancia neta anual para ver cuánto podés deducir realmente (el tope es el 5% de la ganancia neta).', tone:'neutral', icon:'🏥' };
  }
  return out;
}
