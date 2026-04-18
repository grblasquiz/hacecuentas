export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function onzasBiberonPesoBebeDia(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const m=Number(i.edadMes)||0;
  let mlkg=90; if (m>3) mlkg=75; if (m>6) mlkg=60;
  const mlDia=p*mlkg; const tomas=m<=3?6:5;
  return { mlDia:`${mlDia.toFixed(0)} ml/día`, porToma:`${(mlDia/tomas).toFixed(0)} ml/toma`, resumen:`${p}kg a ${m}m: ~${mlDia.toFixed(0)}ml/día en ${tomas} tomas.` };
}
