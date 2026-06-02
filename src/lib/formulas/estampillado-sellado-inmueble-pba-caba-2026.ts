export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function estampilladoSelladoInmueblePbaCaba2026(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'pba');
  const aliq=j==='otra'?0.035:0.036;
  const sellos=v*aliq; const parte=sellos/2;
  const honorarios=v*0.02;
  const iva=honorarios*0.21;
  const esc=v*0.02*1.21; // honorarios + IVA
  const total=sellos+esc;
  const pctSobreValor = v>0 ? (total/v*100) : 0;
  const _insight = {
    title:`Costos de escritura: ${pctSobreValor.toFixed(1)}% del valor`,
    text:`Sobre una operación de **$${Math.round(v).toLocaleString('es-AR')}**, entre sellos (**$${Math.round(sellos).toLocaleString('es-AR')}**) y honorarios + IVA (**$${Math.round(esc).toLocaleString('es-AR')}**) pagás **$${Math.round(total).toLocaleString('es-AR')}**, un **${pctSobreValor.toFixed(1)}%** extra. El sellado suele dividirse 50/50 entre comprador y vendedor: te tocarían **$${Math.round(parte).toLocaleString('es-AR')}**.`,
    tone:'warn',
    icon:'🏠',
  };
  const _chart = v>0 ? {
    type:'doughnut',
    slices:[
      { label:'Sellos', value:Math.round(sellos) },
      { label:'Honorarios', value:Math.round(honorarios) },
      { label:'IVA', value:Math.round(iva) },
    ],
    prefix:'$',
    centerValue:`$${Math.round(total).toLocaleString('es-AR')}`,
    centerLabel:'Total',
    ariaLabel:`Desglose del costo de escrituración: sellos, honorarios e IVA, total $${Math.round(total).toLocaleString('es-AR')}`,
  } : undefined;
  return { sellosTotal:`$${Math.round(sellos).toLocaleString('es-AR')}`, porParte:`$${Math.round(parte).toLocaleString('es-AR')}`, escrituracionTotal:`$${Math.round(total).toLocaleString('es-AR')} (sellos + honorarios + IVA)`, _insight, ...(_chart?{_chart}:{}) };
}
