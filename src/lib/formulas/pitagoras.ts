/** Teorema de Pitágoras: hipotenusa o cateto */
export interface Inputs {
  a?: number;
  b?: number;
  c?: number;
  calcular?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  area: number;
  perimetro: number;
  anguloA: number;
  anguloB: number;
}

export function pitagoras(i: Inputs): Outputs {
  const a = Number(i.a) || 0;
  const b = Number(i.b) || 0;
  const c = Number(i.c) || 0;
  const calcular = String(i.calcular || 'hipotenusa');

  let lado_a = a, lado_b = b, hipotenusa = c;
  let resultado = 0;
  let formula = '';

  if (calcular === 'hipotenusa') {
    if (!a || !b) throw new Error('Ingresá los dos catetos');
    hipotenusa = Math.sqrt(a * a + b * b);
    resultado = hipotenusa;
    formula = `c = √(${a}² + ${b}²) = √${a * a + b * b} = ${resultado.toFixed(4)}`;
  } else if (calcular === 'cateto-a') {
    if (!b || !c) throw new Error('Ingresá el otro cateto y la hipotenusa');
    if (c <= b) throw new Error('La hipotenusa debe ser mayor al cateto');
    lado_a = Math.sqrt(c * c - b * b);
    resultado = lado_a;
    formula = `a = √(${c}² − ${b}²) = √${c * c - b * b} = ${resultado.toFixed(4)}`;
  } else {
    // cateto-b
    if (!a || !c) throw new Error('Ingresá el otro cateto y la hipotenusa');
    if (c <= a) throw new Error('La hipotenusa debe ser mayor al cateto');
    lado_b = Math.sqrt(c * c - a * a);
    resultado = lado_b;
    formula = `b = √(${c}² − ${a}²) = √${c * c - a * a} = ${resultado.toFixed(4)}`;
  }

  const area = (lado_a * lado_b) / 2;
  const perimetro = lado_a + lado_b + hipotenusa;

  // Ángulos (trigonometría)
  const anguloA = Math.atan(lado_a / lado_b) * (180 / Math.PI);
  const anguloB = Math.atan(lado_b / lado_a) * (180 / Math.PI);

  return {
    resultado: Number(resultado.toFixed(4)),
    formula,
    area: Number(area.toFixed(4)),
    perimetro: Number(perimetro.toFixed(4)),
    anguloA: Number(anguloA.toFixed(2)),
    anguloB: Number(anguloB.toFixed(2)),
  };
}
