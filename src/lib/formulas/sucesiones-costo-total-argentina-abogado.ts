export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sucesionesCostoTotalArgentinaAbogado(i: Inputs): Outputs {
  const v=Number(i.valorPatrimonio)||0; const c=String(i.complejidad||'simple');
  const pct:Record<string,number>={'simple':0.04,'mediana':0.08,'compleja':0.15};
  const hon=v*(pct[c]||0.04); const tasa=v*0.015; const total=hon+tasa;
  const f=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const pctTotal=v>0?total/v*100:0;
  const insight={
    title:'Cuánto cuesta la sucesión sobre el patrimonio',
    text:`Sobre un patrimonio de **${f(v)}**, la sucesión cuesta **${f(total)}** (**${pctTotal.toFixed(1)}%**): **${f(hon)}** de honorarios del abogado y **${f(tasa)}** de tasa de justicia. A los herederos les quedan **${f(v-total)}**.`,
    tone: pctTotal>=12?'warn':'neutral',
    icon:'⚖️',
  };
  const chart={
    type:'doughnut',
    slices:[
      { label:'Honorarios abogado', value:Math.round(hon) },
      { label:'Tasa de justicia', value:Math.round(tasa) },
    ],
    prefix:'$',
    centerValue:f(total),
    centerLabel:'Costo total',
    ariaLabel:'Composición del costo de la sucesión: honorarios del abogado y tasa de justicia',
  };
  return { honorarios:f(hon), tasaJusticia:f(tasa), costoTotal:f(total), _insight:insight, _chart:chart };
}
