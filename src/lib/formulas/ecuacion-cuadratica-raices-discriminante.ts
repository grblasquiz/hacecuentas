export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ecuacionCuadraticaRaicesDiscriminante(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      linear: 'Lineal, no cuadrática.', real2: '(dos reales)', double: '(raíz doble)', complex: '(complejas)',
      insTitle: 'Lectura del discriminante',
      insLinear: (x: string) => `Con a=0 no es una cuadrática sino una recta: su única solución es x=**${x}**.`,
      insReal2: (a: string, b: string) => `Discriminante positivo: la parábola cruza el eje x en **dos puntos distintos**, x=**${a}** y x=**${b}**.`,
      insDouble: (a: string) => `Discriminante cero: la parábola toca el eje x en **un solo punto** (raíz doble), x=**${a}**.`,
      insComplex: 'Discriminante negativo: la parábola **no cruza el eje x**, las dos raíces son complejas conjugadas.',
    },
    en: {
      linear: 'Linear, not quadratic.', real2: '(two real roots)', double: '(double root)', complex: '(complex)',
      insTitle: 'Reading the discriminant',
      insLinear: (x: string) => `With a=0 this is not a quadratic but a line: its only solution is x=**${x}**.`,
      insReal2: (a: string, b: string) => `Positive discriminant: the parabola crosses the x-axis at **two distinct points**, x=**${a}** and x=**${b}**.`,
      insDouble: (a: string) => `Zero discriminant: the parabola touches the x-axis at **a single point** (double root), x=**${a}**.`,
      insComplex: 'Negative discriminant: the parabola **does not cross the x-axis**; the two roots are complex conjugates.',
    },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  const d=b*b-4*a*c;
  let x1:any, x2:any;
  if (a===0) {
    const xl=(-c/b).toFixed(3);
    return { x1:'—', x2:xl, disc:d.toFixed(2), resumen:T.linear, _insight:{ title:T.insTitle, text:T.insLinear(xl), tone:'neutral', icon:'📐' } };
  }
  if (d<0) { x1=`${(-b/(2*a)).toFixed(3)} + ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; x2=`${(-b/(2*a)).toFixed(3)} - ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; }
  else { x1=((-b+Math.sqrt(d))/(2*a)).toFixed(3); x2=((-b-Math.sqrt(d))/(2*a)).toFixed(3); }
  const _insight = { title:T.insTitle, text: d>0?T.insReal2(x1,x2):d===0?T.insDouble(x1):T.insComplex, tone:'neutral', icon:'📐' };
  return { x1, x2, disc:d.toFixed(2), resumen:`D=${d.toFixed(2)} ${d>0?T.real2:d===0?T.double:T.complex}.`, _insight };
}
