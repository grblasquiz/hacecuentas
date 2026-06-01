export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ecuacionCuadraticaRaicesDiscriminante(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { linear: 'Lineal, no cuadrática.', real2: '(dos reales)', double: '(raíz doble)', complex: '(complejas)' },
    en: { linear: 'Linear, not quadratic.', real2: '(two real roots)', double: '(double root)', complex: '(complex)' },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  const d=b*b-4*a*c;
  let x1:any, x2:any;
  if (a===0) return { x1:'—', x2:(-c/b).toFixed(3), disc:d.toFixed(2), resumen:T.linear };
  if (d<0) { x1=`${(-b/(2*a)).toFixed(3)} + ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; x2=`${(-b/(2*a)).toFixed(3)} - ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; }
  else { x1=((-b+Math.sqrt(d))/(2*a)).toFixed(3); x2=((-b-Math.sqrt(d))/(2*a)).toFixed(3); }
  return { x1, x2, disc:d.toFixed(2), resumen:`D=${d.toFixed(2)} ${d>0?T.real2:d===0?T.double:T.complex}.` };
}
