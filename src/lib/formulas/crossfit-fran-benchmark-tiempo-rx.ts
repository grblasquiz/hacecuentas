export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function crossfitFranBenchmarkTiempoRx(i: Inputs): Outputs {
  const s=Number(i.tiempoSegundos)||0;
  let n='', ref='';
  if(s<150){n='Elite';ref='<2:30'}
  else if(s<240){n='Avanzado';ref='<4:00'}
  else if(s<360){n='Intermedio';ref='<6:00'}
  else if(s<480){n='Principiante';ref='6-8 min'}
  else {n='Iniciando';ref='>8 min'}
  return { nivel:n, referencia:ref, objetivoMejora:`Objetivo: bajar 30 segundos en 3 meses con entrenamiento estructurado.` };
}
