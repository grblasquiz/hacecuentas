export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dietaHipocaloricaDeficitSaludableMensual(i: Inputs): Outputs {
  const pa=Number(i.pesoActual)||0; const po=Number(i.pesoObjetivo)||0; const s=Number(i.semanasObjetivo)||1;
  const diff=pa-po;
  const perdidaSem=diff/s;
  const deficitDia=perdidaSem*1100;
  let riesgo='';
  if(perdidaSem>1) riesgo='Agresivo — considera más semanas';
  else if(perdidaSem>0.5) riesgo='Moderado — saludable';
  else riesgo='Conservador — sostenible';
  return { deficitDiario:`${Math.round(deficitDia)} kcal`, perdidaSemanal:`${perdidaSem.toFixed(2)} kg`, riesgo:riesgo };
}
