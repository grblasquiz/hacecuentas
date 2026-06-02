export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sucesionCostoHonorariosAbogadoInmueble(i: Inputs): Outputs {
  const v=Number(i.valorAcervo)||0; const c=String(i.complejidad||'simple');
  const hono: Record<string,number> = { simple:0.08, med:0.12, compleja:0.15 };
  const h=v*(hono[c]||0.08);
  const imp=v*0.03;
  const total=h+imp;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pctTotal=v>0?total/v*100:0;
  const insight={
    title:'Cuánto te llevás vs. cuánto se va en costos',
    text:`Sobre un acervo de **${fmt(v)}**, la sucesión te consume **${fmt(total)}** (**${pctTotal.toFixed(1)}%**): **${fmt(h)}** de honorarios del abogado y **${fmt(imp)}** de impuestos. Quedan **${fmt(v-total)}** netos para los herederos.`,
    tone: pctTotal>=15?'warn':'neutral',
    icon:'⚖️',
  };
  const chart={
    type:'doughnut',
    slices:[
      { label:'Honorarios abogado', value:Math.round(h) },
      { label:'Impuestos', value:Math.round(imp) },
    ],
    prefix:'$',
    centerValue:fmt(total),
    centerLabel:'Costo total',
    ariaLabel:'Composición del costo de la sucesión: honorarios del abogado e impuestos',
  };
  return { honorariosAbog:fmt(h), impuestos:fmt(imp), total:fmt(total), resumen:`Acervo $${v.toLocaleString('es-AR')} ${c}: total ~$${total.toFixed(0)} (${pctTotal.toFixed(1)}%).`, _insight:insight, _chart:chart };
}
