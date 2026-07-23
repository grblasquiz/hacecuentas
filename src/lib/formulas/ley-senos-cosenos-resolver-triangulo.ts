/** Ley de senos y cosenos: resolver triángulos no rectángulos (LLL, LAL, ALA/AAL) */
export interface Inputs {
  modo?: string;
  a?: number;
  b?: number;
  c?: number;
  angA?: number;
  angB?: number;
  angC?: number;
  __lang?: string;
}
export interface Outputs {
  ladoA: number;
  ladoB: number;
  ladoC: number;
  anguloA: number;
  anguloB: number;
  anguloC: number;
  area: number;
  perimetro: number;
  _insight?: any;
}

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

function tipoTriangulo(A: number, B: number, C: number, a: number, b: number, cc: number): string {
  const maxAng = Math.max(A, B, C);
  let porAngulo: string;
  if (Math.abs(maxAng - 90) < 0.01) porAngulo = 'rectángulo';
  else if (maxAng > 90) porAngulo = 'obtusángulo';
  else porAngulo = 'acutángulo';
  const eq = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  let porLados: string;
  if (eq(a, b) && eq(b, cc)) porLados = 'equilátero';
  else if (eq(a, b) || eq(b, cc) || eq(a, cc)) porLados = 'isósceles';
  else porLados = 'escaleno';
  return `${porLados} y ${porAngulo}`;
}

export function leySenosCosenosResolverTriangulo(i: Inputs): Outputs {
  const modo = String(i.modo || 'lll');
  const a = Number(i.a) || 0;
  const b = Number(i.b) || 0;
  const c = Number(i.c) || 0;
  const angA = Number(i.angA) || 0;
  const angB = Number(i.angB) || 0;
  const angC = Number(i.angC) || 0;

  let la = 0, lb = 0, lc = 0; // lados resueltos
  let A = 0, B = 0, C = 0; // ángulos resueltos (grados)

  if (modo === 'lll') {
    if (a <= 0 || b <= 0 || c <= 0) throw new Error('Ingresá los tres lados con valores positivos');
    if (a + b <= c || a + c <= b || b + c <= a)
      throw new Error('Esos lados no forman un triángulo: cada lado debe ser menor que la suma de los otros dos (desigualdad triangular)');
    la = a; lb = b; lc = c;
    // Ley de cosenos despejada para cada ángulo
    A = Math.acos((lb * lb + lc * lc - la * la) / (2 * lb * lc)) * DEG;
    B = Math.acos((la * la + lc * lc - lb * lb) / (2 * la * lc)) * DEG;
    C = 180 - A - B;
  } else if (modo === 'lal') {
    if (a <= 0 || b <= 0) throw new Error('Ingresá los lados a y b con valores positivos');
    if (angC <= 0 || angC >= 180) throw new Error('El ángulo comprendido C debe estar entre 0° y 180°');
    la = a; lb = b; C = angC;
    // Ley de cosenos: c² = a² + b² − 2ab·cos C
    lc = Math.sqrt(la * la + lb * lb - 2 * la * lb * Math.cos(C * RAD));
    A = Math.acos((lb * lb + lc * lc - la * la) / (2 * lb * lc)) * DEG;
    B = 180 - A - C;
  } else if (modo === 'ala') {
    if (angA <= 0 || angB <= 0) throw new Error('Ingresá los dos ángulos con valores positivos');
    if (angA + angB >= 180) throw new Error('Los dos ángulos deben sumar menos de 180° (el tercero tiene que existir)');
    if (a <= 0) throw new Error('Ingresá el lado a (opuesto al ángulo A) con un valor positivo');
    A = angA; B = angB; C = 180 - A - B;
    la = a;
    // Ley de senos: a/sin A = b/sin B = c/sin C
    lb = (la * Math.sin(B * RAD)) / Math.sin(A * RAD);
    lc = (la * Math.sin(C * RAD)) / Math.sin(A * RAD);
  } else {
    throw new Error('Elegí un modo válido: LLL, LAL o ALA');
  }

  // Área por Herón (equivale a (1/2)·a·b·sin C)
  const s = (la + lb + lc) / 2;
  const area = Math.sqrt(s * (s - la) * (s - lb) * (s - lc));
  const perimetro = la + lb + lc;
  const tipo = tipoTriangulo(A, B, C, la, lb, lc);

  return {
    ladoA: Number(la.toFixed(4)),
    ladoB: Number(lb.toFixed(4)),
    ladoC: Number(lc.toFixed(4)),
    anguloA: Number(A.toFixed(2)),
    anguloB: Number(B.toFixed(2)),
    anguloC: Number(C.toFixed(2)),
    area: Number(area.toFixed(4)),
    perimetro: Number(perimetro.toFixed(4)),
    _insight: {
      title: 'Triángulo resuelto',
      text: `El triángulo quedó resuelto: lados **${Number(la.toFixed(4))}, ${Number(lb.toFixed(4))} y ${Number(lc.toFixed(4))}** con ángulos **${A.toFixed(2)}°, ${B.toFixed(2)}° y ${C.toFixed(2)}°** (suman 180°). Es un triángulo **${tipo}**, con área de **${Number(area.toFixed(4)).toLocaleString('es-AR')} u²** y perímetro de **${Number(perimetro.toFixed(4)).toLocaleString('es-AR')} u**.`,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
