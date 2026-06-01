export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vocabularioIdiomaPalabrasNivelConocido(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      nativoCulto: 'Nativo-culto',
      avanzado: 'Avanzado',
      intermedioAlto: 'Intermedio alto',
      intermedio: 'Intermedio',
      basico: 'Básico',
      principiante: 'Principiante',
      dominio: 'Dominio',
      obj10000: '10000+ para C2',
      obj8000: '8000 para C1',
      obj4000: '4000 para B2',
      obj2500: '2500 para B1',
      obj1500: '1500 para A2',
    },
    en: {
      nativoCulto: 'Native/cultured',
      avanzado: 'Advanced',
      intermedioAlto: 'Upper-intermediate',
      intermedio: 'Intermediate',
      basico: 'Basic',
      principiante: 'Beginner',
      dominio: 'Mastery',
      obj10000: '10,000+ for C2',
      obj8000: '8,000 for C1',
      obj4000: '4,000 for B2',
      obj2500: '2,500 for B1',
      obj1500: '1,500 for A2',
    },
  } as const)[__lang];
  const p=Number(i.palabrasActivas)||0;
  let n='', int_='', obj='';
  if(p>=10000){n='C2';int_=T.nativoCulto;obj=T.dominio}
  else if(p>=8000){n='C1';int_=T.avanzado;obj=T.obj10000}
  else if(p>=4000){n='B2';int_=T.intermedioAlto;obj=T.obj8000}
  else if(p>=2500){n='B1';int_=T.intermedio;obj=T.obj4000}
  else if(p>=1500){n='A2';int_=T.basico;obj=T.obj2500}
  else {n='A1';int_=T.principiante;obj=T.obj1500}
  return { nivel:n, interpretacion:int_, objetivo:obj };
}
