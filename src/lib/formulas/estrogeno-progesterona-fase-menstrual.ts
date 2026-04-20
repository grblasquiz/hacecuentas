export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function estrogenoProgesteronaFaseMenstrual(i: Inputs): Outputs {
  const d=Number(i.diaCiclo)||14;
  let fase='', e='', p='';
  if(d<=5){fase='Menstrual';e='Bajo (30-80 pg/mL)';p='Bajo (<1 ng/mL)'}
  else if(d<13){fase='Folicular';e='Subiendo (80-300)';p='Bajo (<1)'}
  else if(d<=16){fase='Ovulatoria';e='Pico (200-400)';p='Subiendo (1-3)'}
  else if(d<=28){fase='Lútea';e='Medio (100-250)';p='Pico (5-20) día 21'}
  else {fase='Fuera de ciclo';e='N/A';p='N/A'}
  return { fase:fase, estrogenoEsperado:e, progesteronaEsperada:p };
}
