// ─────────────────────────────────────────────────────────────────────────────
// Resolución paso a paso de ecuaciones polinómicas de primer y segundo grado
// (lineales y cuadráticas). Reusa el parser/AST/render de core.ts.
//
// Estrategia: parsear "lhs = rhs", llevar todo a un lado (lhs − rhs = 0),
// extraer los coeficientes del polinomio en la incógnita y resolver:
//   - grado 1 → despeje
//   - grado 2 → discriminante + fórmula resolvente
// Probado en tests/equation.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Node, type Step, type SolutionView,
  parse, num, ZERO, simplifyFully, mml, esc, wrapMath, fmtNum, renderSolution,
} from './core';

export interface EquationResult {
  ok: boolean;
  error?: string;
  varName: string;
  headerMathml: string;
  resultMathml: string;
  resultText: string;
  steps: Step[];
}

// ── Polinomio como mapa grado → coeficiente ──────────────────────────────────
type Poly = Record<number, number>;
const EPS = 1e-10;

function pClean(p: Poly): Poly {
  const r: Poly = {};
  for (const d in p) if (Math.abs(p[d]) > EPS) r[d] = p[d];
  return r;
}
function pAdd(a: Poly, b: Poly, sign = 1): Poly {
  const r: Poly = { ...a };
  for (const d in b) r[d] = (r[d] || 0) + sign * b[d];
  return pClean(r);
}
function pScale(p: Poly, s: number): Poly {
  const r: Poly = {};
  for (const d in p) r[d] = p[d] * s;
  return pClean(r);
}
function pMul(a: Poly, b: Poly): Poly {
  const r: Poly = {};
  for (const da in a) for (const db in b) {
    const d = Number(da) + Number(db);
    r[d] = (r[d] || 0) + a[da] * b[db];
  }
  return pClean(r);
}
function degree(p: Poly): number {
  let d = 0;
  for (const k in p) d = Math.max(d, Number(k));
  return d;
}

// Convierte un AST en su polinomio en `varName`. Lanza errores claros cuando la
// ecuación no es polinómica (funciones, incógnita en el denominador, parámetros).
function toPoly(n: Node, varName: string): Poly {
  switch (n.k) {
    case 'num': return { 0: n.v };
    case 'const': return { 0: n.name === 'π' ? Math.PI : Math.E };
    case 'var': return { 1: 1 };
    case 'param':
      throw new Error(`La ecuación tiene la letra "${n.name}" además de la incógnita. Ingresá coeficientes numéricos.`);
    case 'neg': return pScale(toPoly(n.a, varName), -1);
    case 'add': return pAdd(toPoly(n.a, varName), toPoly(n.b, varName));
    case 'sub': return pAdd(toPoly(n.a, varName), toPoly(n.b, varName), -1);
    case 'mul': return pMul(toPoly(n.a, varName), toPoly(n.b, varName));
    case 'div': {
      const den = toPoly(n.b, varName);
      if (degree(den) !== 0 || Math.abs(den[0] ?? 0) < EPS)
        throw new Error('No resuelvo ecuaciones con la incógnita en el denominador.');
      return pScale(toPoly(n.a, varName), 1 / den[0]);
    }
    case 'pow': {
      if (n.b.k !== 'num' || !Number.isInteger(n.b.v) || n.b.v < 0)
        throw new Error('Sólo manejo potencias con exponente entero ≥ 0.');
      let r: Poly = { 0: 1 };
      const base = toPoly(n.a, varName);
      for (let i = 0; i < n.b.v; i++) r = pMul(r, base);
      return r;
    }
    case 'func':
      throw new Error('Por ahora resuelvo ecuaciones polinómicas (sin sin, cos, ln, √, etc.).');
    default:
      throw new Error('No pude interpretar la ecuación.');
  }
}

// ── Helpers de MathML para las sustituciones numéricas ───────────────────────
const TIMES = '<mo>&#x22C5;</mo>';
const MINUS = '<mo>&#x2212;</mo>';
const EQ = '<mo>=</mo>';

// Coeficiente entre paréntesis cuando es negativo (para sustituir sin ambigüedad).
function pc(v: number): string {
  const s = fmtNum(Math.abs(v));
  return v < 0 ? `<mrow><mo>(</mo>${MINUS}<mn>${s}</mn><mo>)</mo></mrow>` : `<mn>${s}</mn>`;
}
function mnum(v: number): string {
  if (v < 0) return `<mrow>${MINUS}<mn>${fmtNum(-v)}</mn></mrow>`;
  return `<mn>${fmtNum(v)}</mn>`;
}

// Construye el AST de la forma estándar a·xⁿ + … para renderizarla prolija.
function polyToNode(p: Poly, varName: string): Node {
  const degs = Object.keys(p).map(Number).filter((d) => Math.abs(p[d]) > EPS).sort((a, b) => b - a);
  if (degs.length === 0) return ZERO;
  let node: Node | null = null;
  for (const d of degs) {
    const c = p[d];
    let term: Node;
    if (d === 0) term = num(c);
    else {
      const pw: Node = d === 1 ? { k: 'var', name: varName } : { k: 'pow', a: { k: 'var', name: varName }, b: num(d) };
      term = c === 1 ? pw : { k: 'mul', a: num(c), b: pw };
    }
    node = node ? { k: 'add', a: node, b: term } : term;
  }
  return simplifyFully(node!);
}

function eqMathml(left: string, right: string): string {
  return wrapMath(`<mrow>${left}${EQ}${right}</mrow>`);
}

// Redondeo de presentación para raíces irracionales.
function disp(v: number): string {
  if (Math.abs(v) < EPS) return '0';
  const r = Number(v.toPrecision(8));
  return fmtNum(r);
}

// ── API pública ──────────────────────────────────────────────────────────────
export function solveEquation(input: string, varName = 'x'): EquationResult {
  const base: EquationResult = {
    ok: false, varName, headerMathml: '', resultMathml: '', resultText: '', steps: [],
  };
  if (!input || !input.trim()) return { ...base, error: 'Escribí una ecuación para resolver.' };

  // Permitir "expr" suelta (se asume = 0) o "lhs = rhs".
  const parts = input.split('=');
  if (parts.length > 2) return { ...base, error: 'La ecuación tiene más de un signo "=".' };
  const lhsRaw = parts[0];
  const rhsRaw = parts.length === 2 ? parts[1] : '0';
  if (!lhsRaw.trim()) return { ...base, error: 'Falta el lado izquierdo de la ecuación.' };
  if (parts.length === 2 && !rhsRaw.trim()) return { ...base, error: 'Falta el lado derecho de la ecuación.' };

  let lhs: Node, rhs: Node, poly: Poly;
  try {
    lhs = parse(lhsRaw, varName);
    rhs = parse(rhsRaw, varName);
    poly = toPoly({ k: 'sub', a: lhs, b: rhs }, varName);
  } catch (e) {
    return { ...base, error: (e as Error).message || 'No pude interpretar la ecuación.' };
  }

  const headerMathml = eqMathml(mml(lhs, varName), mml(rhs, varName));
  const deg = degree(poly);

  const steps: Step[] = [];
  // Paso 1: llevar todo a un lado.
  const stdNode = polyToNode(poly, varName);
  steps.push({
    rule: 'Igualar a cero',
    formula: 'Pasamos todos los términos a la izquierda para dejar la ecuación igualada a 0.',
    mathml: eqMathml(mml(stdNode, varName), '<mn>0</mn>'),
  });

  if (deg === 0) {
    const c = poly[0] ?? 0;
    if (Math.abs(c) < EPS) {
      return {
        ...base, headerMathml, steps,
        ok: true,
        resultMathml: wrapMath('<mtext>Infinitas soluciones</mtext>'),
        resultText: 'Infinitas soluciones (identidad)',
      };
    }
    return {
      ...base, headerMathml, steps,
      ok: true,
      resultMathml: wrapMath('<mtext>Sin solución</mtext>'),
      resultText: 'Sin solución (igualdad imposible)',
    };
  }

  if (deg > 2) {
    return { ...base, headerMathml, error: `La ecuación es de grado ${deg}. Por ahora resuelvo de primer y segundo grado (lineales y cuadráticas).` };
  }

  if (deg === 1) {
    const b = poly[1];
    const c = poly[0] ?? 0;
    // bx + c = 0  →  bx = −c  →  x = −c / b
    steps.push({
      rule: 'Despejar el término con la incógnita',
      formula: 'Pasamos el término independiente al otro lado (cambia de signo).',
      mathml: eqMathml(`<mrow>${mnum(b)}${TIMES}<mi>${esc(varName)}</mi></mrow>`, mnum(-c)),
    });
    steps.push({
      rule: 'Dividir por el coeficiente',
      formula: `Dividimos ambos lados por ${fmtNum(b)} (el número que multiplica a ${varName}).`,
      mathml: eqMathml(`<mi>${esc(varName)}</mi>`, `<mfrac><mrow>${mnum(-c)}</mrow><mrow>${mnum(b)}</mrow></mfrac>`),
    });
    const x = -c / b;
    const resultMathml = eqMathml(`<mi>${esc(varName)}</mi>`, mnum(Number(disp(x))));
    return {
      ...base, ok: true, headerMathml, steps, resultMathml,
      resultText: `${varName} = ${disp(x)}`,
    };
  }

  // deg === 2 → ax² + bx + c = 0
  const a = poly[2];
  const b = poly[1] ?? 0;
  const c = poly[0] ?? 0;

  steps.push({
    rule: 'Identificar los coeficientes',
    formula: `En a·${varName}² + b·${varName} + c = 0, leemos a, b y c.`,
    mathml: wrapMath(
      `<mrow><mi>a</mi>${EQ}${mnum(a)}<mo>,</mo><mspace width="0.6em"/>` +
      `<mi>b</mi>${EQ}${mnum(b)}<mo>,</mo><mspace width="0.6em"/>` +
      `<mi>c</mi>${EQ}${mnum(c)}</mrow>`
    ),
  });

  const D = b * b - 4 * a * c;
  steps.push({
    rule: 'Calcular el discriminante',
    formula: 'Δ = b² − 4·a·c. Su signo decide cuántas soluciones reales hay.',
    mathml: wrapMath(
      `<mrow><mi>&#x394;</mi>${EQ}<msup>${pc(b)}<mn>2</mn></msup>${MINUS}<mn>4</mn>${TIMES}${pc(a)}${TIMES}${pc(c)}` +
      `${EQ}${mnum(D)}</mrow>`
    ),
  });

  // Fórmula resolvente con los números sustituidos.
  const resolvSub =
    `<mrow><mi>${esc(varName)}</mi>${EQ}<mfrac>` +
    `<mrow>${MINUS}${pc(b)}<mo>&#xB1;</mo><msqrt>${mnum(D)}</msqrt></mrow>` +
    `<mrow><mn>2</mn>${TIMES}${pc(a)}</mrow></mfrac></mrow>`;
  steps.push({
    rule: 'Aplicar la fórmula resolvente',
    formula: 'x = (−b ± √Δ) / (2a). Sustituimos a, b y Δ.',
    mathml: wrapMath(resolvSub),
  });

  if (D > EPS) {
    const sq = Math.sqrt(D);
    const x1 = (-b + sq) / (2 * a);
    const x2 = (-b - sq) / (2 * a);
    steps.push({
      rule: 'Resolver las dos raíces',
      formula: 'Δ > 0: hay dos soluciones reales distintas (una con + y otra con −).',
      mathml: wrapMath(
        `<mrow><msub><mi>${esc(varName)}</mi><mn>1</mn></msub>${EQ}<mfrac><mrow>${mnum(-b)}<mo>+</mo><msqrt>${mnum(D)}</msqrt></mrow><mrow>${mnum(2 * a)}</mrow></mfrac>${EQ}${mnum(Number(disp(x1)))}</mrow>`
      ),
    });
    steps.push({
      rule: 'Segunda raíz',
      mathml: wrapMath(
        `<mrow><msub><mi>${esc(varName)}</mi><mn>2</mn></msub>${EQ}<mfrac><mrow>${mnum(-b)}${MINUS}<msqrt>${mnum(D)}</msqrt></mrow><mrow>${mnum(2 * a)}</mrow></mfrac>${EQ}${mnum(Number(disp(x2)))}</mrow>`
      ),
    });
    const resultMathml = wrapMath(
      `<mrow><msub><mi>${esc(varName)}</mi><mn>1</mn></msub>${EQ}${mnum(Number(disp(x1)))}` +
      `<mo>,</mo><mspace width="0.8em"/>` +
      `<msub><mi>${esc(varName)}</mi><mn>2</mn></msub>${EQ}${mnum(Number(disp(x2)))}</mrow>`
    );
    return {
      ...base, ok: true, headerMathml, steps, resultMathml,
      resultText: `${varName}₁ = ${disp(x1)}, ${varName}₂ = ${disp(x2)}`,
    };
  }

  if (Math.abs(D) <= EPS) {
    const x = -b / (2 * a);
    steps.push({
      rule: 'Raíz doble',
      formula: 'Δ = 0: hay una única solución real (raíz doble).',
      mathml: wrapMath(
        `<mrow><mi>${esc(varName)}</mi>${EQ}<mfrac><mrow>${mnum(-b)}</mrow><mrow>${mnum(2 * a)}</mrow></mfrac>${EQ}${mnum(Number(disp(x)))}</mrow>`
      ),
    });
    return {
      ...base, ok: true, headerMathml, steps,
      resultMathml: eqMathml(`<mi>${esc(varName)}</mi>`, mnum(Number(disp(x)))),
      resultText: `${varName} = ${disp(x)} (raíz doble)`,
    };
  }

  // D < 0 → raíces complejas conjugadas
  const re = -b / (2 * a);
  const im = Math.sqrt(-D) / (2 * a);
  const reS = disp(re), imS = disp(Math.abs(im));
  const cplx = (sign: string) =>
    `<mrow>${mnum(Number(reS))}<mo>${sign}</mo>${imS === '1' ? '' : `<mn>${imS}</mn>`}<mi>i</mi></mrow>`;
  steps.push({
    rule: 'Raíces complejas',
    formula: 'Δ < 0: no hay soluciones reales. Las raíces son complejas conjugadas (i = √−1).',
    mathml: wrapMath(
      `<mrow><msub><mi>${esc(varName)}</mi><mn>1,2</mn></msub>${EQ}<mfrac><mrow>${mnum(-b)}<mo>&#xB1;</mo><msqrt>${mnum(-D)}</msqrt><mi>i</mi></mrow><mrow>${mnum(2 * a)}</mrow></mfrac></mrow>`
    ),
  });
  const resultMathml = wrapMath(
    `<mrow><msub><mi>${esc(varName)}</mi><mn>1,2</mn></msub>${EQ}${cplx('+')}<mo>,</mo><mspace width="0.6em"/>${cplx('&#x2212;')}</mrow>`
  );
  return {
    ...base, ok: true, headerMathml, steps, resultMathml,
    resultText: `${varName} = ${reS} ± ${imS}i (complejas)`,
  };
}

// Render compartido (build + cliente) de la resolución de una ecuación.
export function renderEquationHTML(r: EquationResult): string {
  const view: SolutionView = {
    ok: r.ok,
    error: r.error,
    headerMathml: r.headerMathml,
    steps: r.steps,
    resultMathml: r.resultMathml,
    resultText: r.resultText,
    copyLabel: 'Copiar solución',
  };
  return renderSolution(view);
}
