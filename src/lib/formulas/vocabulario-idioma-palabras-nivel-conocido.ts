export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vocabularioIdiomaPalabrasNivelConocido(i: Inputs): Outputs {
  const p=Number(i.palabrasActivas)||0;
  let n='', int_='', obj='';
  if(p>=10000){n='C2';int_='Nativo-culto';obj='Dominio'}
  else if(p>=8000){n='C1';int_='Avanzado';obj='10000+ para C2'}
  else if(p>=4000){n='B2';int_='Intermedio alto';obj='8000 para C1'}
  else if(p>=2500){n='B1';int_='Intermedio';obj='4000 para B2'}
  else if(p>=1500){n='A2';int_='Básico';obj='2500 para B1'}
  else {n='A1';int_='Principiante';obj='1500 para A2'}
  return { nivel:n, interpretacion:int_, objetivo:obj };
}
