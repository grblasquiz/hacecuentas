/** Teorema de Pitágoras: hipotenusa o cateto */
export interface Inputs {
  a?: number;
  b?: number;
  c?: number;
  calcular?: string;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  area: number;
  perimetro: number;
  anguloA: number;
  anguloB: number;
  _insight?: any;
}

export function pitagoras(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errAmbos: 'Ingresá los dos catetos',
      errCatetoHipo: 'Ingresá el otro cateto y la hipotenusa',
      errHipoMayor: 'La hipotenusa debe ser mayor al cateto',
      insightTitle: 'Qué te dice el resultado',
      ladoHipo: 'la hipotenusa',
      ladoCateto: 'el cateto que faltaba',
      insightText: (lado: string, val: string, area: string, ang: string) =>
        `Resolviendo el triángulo rectángulo, **${lado} mide ${val}**. Con esos lados el triángulo encierra un área de **${area} u²** y su ángulo más chico es de **${ang}°**. Recordá que la fórmula solo vale si el ángulo entre los catetos es de 90°.`,
    },
    en: {
      errAmbos: 'Enter both legs',
      errCatetoHipo: 'Enter the other leg and the hypotenuse',
      errHipoMayor: 'The hypotenuse must be greater than the leg',
      insightTitle: 'What the result means',
      ladoHipo: 'the hypotenuse',
      ladoCateto: 'the missing leg',
      insightText: (lado: string, val: string, area: string, ang: string) =>
        `Solving the right triangle, **${lado} measures ${val}**. With those sides the triangle encloses an area of **${area} u²** and its smallest angle is **${ang}°**. Remember the formula only holds if the angle between the legs is 90°.`,
    },
  } as const)[__lang];

  const a = Number(i.a) || 0;
  const b = Number(i.b) || 0;
  const c = Number(i.c) || 0;
  const calcular = String(i.calcular || 'hipotenusa');

  let lado_a = a, lado_b = b, hipotenusa = c;
  let resultado = 0;
  let formula = '';

  if (calcular === 'hipotenusa') {
    if (!a || !b) throw new Error(T.errAmbos);
    hipotenusa = Math.sqrt(a * a + b * b);
    resultado = hipotenusa;
    formula = `c = √(${a}² + ${b}²) = √${a * a + b * b} = ${resultado.toFixed(4)}`;
  } else if (calcular === 'cateto-a') {
    if (!b || !c) throw new Error(T.errCatetoHipo);
    if (c <= b) throw new Error(T.errHipoMayor);
    lado_a = Math.sqrt(c * c - b * b);
    resultado = lado_a;
    formula = `a = √(${c}² − ${b}²) = √${c * c - b * b} = ${resultado.toFixed(4)}`;
  } else {
    // cateto-b
    if (!a || !c) throw new Error(T.errCatetoHipo);
    if (c <= a) throw new Error(T.errHipoMayor);
    lado_b = Math.sqrt(c * c - a * a);
    resultado = lado_b;
    formula = `b = √(${c}² − ${a}²) = √${c * c - a * a} = ${resultado.toFixed(4)}`;
  }

  const area = (lado_a * lado_b) / 2;
  const perimetro = lado_a + lado_b + hipotenusa;

  // Ángulos (trigonometría)
  const anguloA = Math.atan(lado_a / lado_b) * (180 / Math.PI);
  const anguloB = Math.atan(lado_b / lado_a) * (180 / Math.PI);

  const resultadoR = Number(resultado.toFixed(4));
  const areaR = Number(area.toFixed(4));
  const anguloMin = Math.min(anguloA, anguloB);
  const ladoLabel = calcular === 'hipotenusa' ? T.ladoHipo : T.ladoCateto;

  return {
    resultado: resultadoR,
    formula,
    area: areaR,
    perimetro: Number(perimetro.toFixed(4)),
    anguloA: Number(anguloA.toFixed(2)),
    anguloB: Number(anguloB.toFixed(2)),
    _insight: {
      title: T.insightTitle,
      text: T.insightText(
        ladoLabel,
        resultadoR.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
        areaR.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
        anguloMin.toFixed(1)
      ),
      tone: 'neutral',
      icon: '📐',
    },
  };
}
