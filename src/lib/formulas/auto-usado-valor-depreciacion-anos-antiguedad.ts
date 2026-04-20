export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autoUsadoValorDepreciacionAnosAntiguedad(i: Inputs): Outputs {
  const v=Number(i.valor0km)||0; const a=Number(i.anosUso)||0; const km=Number(i.kmTotales)||0;
  let valor=v;
  if(a>=1) valor*=0.82; // primer año
  for(let i_=1;i_<a;i_++){ if(i_<4) valor*=0.88; else if(i_<10) valor*=0.93; else valor*=0.96; }
  // ajuste km
  if(km>100000) valor*=0.92; else if(km>50000) valor*=0.96;
  const dep=((1-valor/v)*100);
  return { valorEstimado:`USD ${Math.round(valor).toLocaleString('en-US')}`, depreciacion:`${dep.toFixed(0)}%`, observacion:`Depreciación teórica. Mercado AR tiende a mantener valor más que USA/Europa.` };
}
