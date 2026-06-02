export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cofundadorEquitySplitStartupJusto(i: Inputs): Outputs {
  const n=Number(i.cantidadFounders)||2; const t=Number(i.tiempoCompletoRelativo)||5; const io=String(i.ideaOriginal||'compartida');
  const equalPart=100/n;
  const bonusIdea=io==='si'?5:io==='no'?-5:0;
  const bonusDedic=(t-5)*2;
  const mio=Math.min(90,Math.max(10,equalPart+bonusIdea+bonusDedic));
  const rec=mio>equalPart*1.3?'Buscá consenso con co-founders antes de cerrar.':'Split razonable. Con vesting claro.';

  const mioR=Math.round(mio);
  const resto=100-mioR;
  const sesgo=mio-equalPart;
  const tono=mio>equalPart*1.3?'warn':Math.abs(sesgo)<=5?'good':'neutral';
  const lectura=Math.abs(sesgo)<=5
    ?`prácticamente un split parejo entre los ${n} founders`
    :sesgo>0
      ?`**${Math.round(sesgo)} pts por encima** del reparto igualitario (${equalPart.toFixed(0)}%)`
      :`**${Math.round(-sesgo)} pts por debajo** del reparto igualitario (${equalPart.toFixed(0)}%)`;
  const insight={
    title:'Tu equity sugerido',
    text:`Te tocaría **${mioR}%** y el restante **${resto}%** se reparte entre los demás. Es ${lectura}. Cerralo siempre con vesting de 4 años y cliff de 1.`,
    tone:tono,
    icon:'🤝',
  };
  const chart={
    type:'doughnut',
    slices:[
      {label:'Vos',value:mioR},
      {label:`Otros founders (${n-1})`,value:resto},
    ],
    prefix:'',
    centerValue:`${mioR}%`,
    centerLabel:'tu parte',
    ariaLabel:`Reparto de equity: ${mioR}% para vos y ${resto}% para los otros ${n-1} co-founders`,
  };

  return { porcentajeSugerido:`${mio.toFixed(0)}%`, recomendacion:rec, consejo:'4 años vesting + 1 año cliff. Shareholder agreement. Revisar con abogado.', _insight:insight, _chart:chart };
}
