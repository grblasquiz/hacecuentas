/** Área y perímetro: cuadrado, rectángulo, triángulo, círculo */
export interface Inputs {
  figura: string;
  a?: number;
  b?: number;
  c?: number;
}
export interface Outputs {
  area: number;
  perimetro: number;
  figura: string;
  formula: string;
}

export function areaPerimetro(i: Inputs): Outputs {
  const figura = String(i.figura || 'rectangulo');
  const a = Number(i.a) || 0;
  const b = Number(i.b) || 0;
  const c = Number(i.c) || 0;

  let area = 0;
  let perimetro = 0;
  let formula = '';
  let nombre = '';

  switch (figura) {
    case 'cuadrado':
      if (!a) throw new Error('Ingresá el lado');
      area = a * a;
      perimetro = 4 * a;
      nombre = 'Cuadrado';
      formula = `Área = ${a}² = ${area}; Perímetro = 4 × ${a} = ${perimetro}`;
      break;
    case 'rectangulo':
      if (!a || !b) throw new Error('Ingresá base y altura');
      area = a * b;
      perimetro = 2 * (a + b);
      nombre = 'Rectángulo';
      formula = `Área = ${a} × ${b} = ${area}; Perímetro = 2 × (${a} + ${b}) = ${perimetro}`;
      break;
    case 'triangulo':
      // a = base, b = altura, c = lado1+lado2 (para perímetro aproximado)
      if (!a || !b) throw new Error('Ingresá base y altura');
      area = (a * b) / 2;
      perimetro = c > 0 ? a + c : a + 2 * b; // aproximación si no se ingresan los otros lados
      nombre = 'Triángulo';
      formula = `Área = (${a} × ${b}) / 2 = ${area}`;
      break;
    case 'circulo':
      if (!a) throw new Error('Ingresá el radio');
      area = Math.PI * a * a;
      perimetro = 2 * Math.PI * a;
      nombre = 'Círculo';
      formula = `Área = π × ${a}² = ${area.toFixed(2)}; Perímetro = 2π × ${a} = ${perimetro.toFixed(2)}`;
      break;
    case 'trapecio':
      // a = base mayor, b = base menor, c = altura
      if (!a || !b || !c) throw new Error('Ingresá ambas bases y la altura');
      area = ((a + b) * c) / 2;
      perimetro = a + b + 2 * c; // aproximación (lados iguales)
      nombre = 'Trapecio';
      formula = `Área = ((${a} + ${b}) × ${c}) / 2 = ${area}`;
      break;
    case 'rombo':
      // a = diagonal mayor, b = diagonal menor
      if (!a || !b) throw new Error('Ingresá las diagonales');
      area = (a * b) / 2;
      // perímetro por Pitágoras: lado = √((a/2)² + (b/2)²)
      const lado = Math.sqrt((a / 2) ** 2 + (b / 2) ** 2);
      perimetro = 4 * lado;
      nombre = 'Rombo';
      formula = `Área = (${a} × ${b}) / 2 = ${area}`;
      break;
    default:
      throw new Error('Figura no reconocida');
  }

  return {
    area: Number(area.toFixed(4)),
    perimetro: Number(perimetro.toFixed(4)),
    figura: nombre,
    formula,
  };
}
