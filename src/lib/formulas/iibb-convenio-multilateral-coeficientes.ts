export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function iibbConvenioMultilateralCoeficientes(i: Inputs): Outputs {
  const ia=Number(i.ingresosJurA)||0; const ib=Number(i.ingresosJurB)||0;
  const ga=Number(i.gastosJurA)||0; const gb=Number(i.gastosJurB)||0;
  const totI=ia+ib; const totG=ga+gb;
  const cia=totI>0?ia/totI:0.5; const cib=totI>0?ib/totI:0.5;
  const cga=totG>0?ga/totG:0.5; const cgb=totG>0?gb/totG:0.5;
  const coefA=(cia+cga)/2*100; const coefB=(cib+cgb)/2*100;
  return { coefJurA:`${coefA.toFixed(1)}%`, coefJurB:`${coefB.toFixed(1)}%`, interpretacion:`Distribuí la base imponible: ${coefA.toFixed(0)}% a Jur A y ${coefB.toFixed(0)}% a Jur B.` };
}
