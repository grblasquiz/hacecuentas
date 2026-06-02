export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function deduccionFamiliaConyugeHijoGanancias(i: Inputs): Outputs {
  const c=String(i.conyuge||'no')==='si'; const hm=Number(i.hijosMenores)||0; const hi=Number(i.hijosInca)||0;
  const DEDUC_CONY=2800000; const DEDUC_HIJO=1400000; const DEDUC_INCA=2800000;
  const montoCony=c?DEDUC_CONY:0; const montoHijos=hm*DEDUC_HIJO; const montoInca=hi*DEDUC_INCA;
  const total=montoCony+montoHijos+montoInca;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

  const out:Outputs={ totalAnual:fmt(total), mensual:fmt(total/12), resumen:`${c?'Cónyuge':''}${c&&(hm+hi>0)?' + ':''}${hm+hi>0?`${hm+hi} hijo(s)`:''}: deducción anual $${total.toFixed(0)}.` };

  if(total>0){
    out._insight={ title:'Qué significa esta deducción', text:`Sumás **${fmt(total)}** de deducciones por carga de familia al año, o sea **${fmt(total/12)} por mes** que se restan de tu ganancia neta antes de calcular el impuesto. No es plata que cobrás: es base imponible que dejás de pagar.`, tone:'good', icon:'👪' };
    const slices:{label:string;value:number}[]=[];
    if(montoCony>0) slices.push({label:'Cónyuge',value:montoCony});
    if(montoHijos>0) slices.push({label:hm===1?'Hijo menor':`${hm} hijos menores`,value:montoHijos});
    if(montoInca>0) slices.push({label:hi===1?'Hijo incapacitado':`${hi} hijos incapacitados`,value:montoInca});
    if(slices.length>=2){
      out._chart={ type:'doughnut', slices, prefix:'$', centerValue:fmt(total), centerLabel:'Deducción anual', ariaLabel:`Composición de la deducción anual por familia: ${slices.map(s=>s.label).join(', ')}` };
    }
  } else {
    out._insight={ title:'Sin cargas de familia cargadas', text:'No declaraste cónyuge ni hijos a cargo, así que la deducción por familia es **$0**. Cargá los familiares que dependan de vos para reducir la base del impuesto a las Ganancias.', tone:'neutral', icon:'👪' };
  }
  return out;
}
