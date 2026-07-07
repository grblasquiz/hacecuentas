export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function autoUsadoValorDepreciacionAnosAntiguedad(i: Inputs): Outputs {
  const v=Number(i.valor0km)||0; const a=Number(i.anosUso)||0; const km=Number(i.kmTotales)||0;
  let valor=v;
  if(a>=1) valor*=0.82; // primer año
  for(let i_=1;i_<a;i_++){ if(i_<4) valor*=0.88; else if(i_<10) valor*=0.93; else valor*=0.96; }
  // ajuste km
  if(km>100000) valor*=0.92; else if(km>50000) valor*=0.96;
  const dep=((1-valor/v)*100);
  const out: Outputs = { valorEstimado:`USD ${Math.round(valor).toLocaleString('en-US')}`, depreciacion:`${dep.toFixed(0)}%`, observacion:`Depreciación teórica. Mercado AR tiende a mantener valor más que USA/Europa.` };
  if (v>0) {
    const perdido = v - valor;
    out._insight = {
      title: 'Cuánto valor perdió',
      text: `Un 0km de **USD ${Math.round(v).toLocaleString('en-US')}** con **${a} año${a===1?'':'s'}** de uso y ${km.toLocaleString('es-AR')} km vale hoy unos **USD ${Math.round(valor).toLocaleString('en-US')}**: perdió **${dep.toFixed(0)}%** (USD ${Math.round(perdido).toLocaleString('en-US')}). En Argentina el usado suele depreciarse menos que en USA o Europa.`,
      tone: dep>=50 ? 'warn' : (dep>=25 ? 'neutral' : 'good'),
      icon: '🚗',
    };
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Valor actual', value: Math.round(valor) },
        { label: 'Valor perdido', value: Math.round(perdido) },
      ],
      prefix: 'USD ',
      centerValue: `USD ${Math.round(v).toLocaleString('en-US')}`,
      centerLabel: 'Valor 0km',
      ariaLabel: `Del valor original de USD ${Math.round(v).toLocaleString('en-US')}, conserva USD ${Math.round(valor).toLocaleString('en-US')} y perdió USD ${Math.round(perdido).toLocaleString('en-US')}`,
    };
  }
  return out;
}
