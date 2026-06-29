// ─────────────────────────────────────────────────────────────────────────────
// Integrales (antiderivadas) inmediatas paso a paso: linealidad, regla de la
// potencia, funciones elementales (sin, cos, eˣ…) y sustitución lineal
// (argumento de la forma ax + b). Casos más complejos (por partes, sustitución
// general) quedan fuera con un mensaje claro.
//
// Reusa el parser/AST/render de core.ts y el pseudo-nodo `integ` (∫ … dx).
// Probado en tests/integral.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Node, type Step, type SolutionView, type Poly,
  parse, num, ONE, dependsOnVar, equalNode, simplifyFully,
  mml, paren, esc, wrapMath, toText, renderSolution, toPoly, pDegree,
} from './core';

export interface IntegralResult {
  ok: boolean;
  error?: string;
  varName: string;
  inputMathml: string;
  resultMathml: string;
  resultText: string;
  steps: Step[];
}

const ln = (a: Node): Node => ({ k: 'func', name: 'ln', a });
const abs = (a: Node): Node => ({ k: 'func', name: 'abs', a });
const C: Node = { k: 'param', name: 'C' };

// ¿`node` es lineal (a·x + b) en varName? Devuelve {a, b} o null.
function asLinear(node: Node, varName: string): { a: number; b: number } | null {
  let p: Poly;
  try { p = toPoly(node, varName); } catch { return null; }
  if (pDegree(p) > 1) return null;
  return { a: p[1] ?? 0, b: p[0] ?? 0 };
}

// Antiderivada de cada función elemental (sin la sustitución; sin +C).
function funcAntideriv(name: string, u: Node): Node | null {
  switch (name) {
    case 'sin': return { k: 'neg', a: { k: 'func', name: 'cos', a: u } };
    case 'cos': return { k: 'func', name: 'sin', a: u };
    case 'exp': return { k: 'func', name: 'exp', a: u };
    case 'sinh': return { k: 'func', name: 'cosh', a: u };
    case 'cosh': return { k: 'func', name: 'sinh', a: u };
    case 'tan': return { k: 'neg', a: ln(abs({ k: 'func', name: 'cos', a: u })) };
    default: return null;
  }
}
const FUNC_INT_RULE: Record<string, string> = {
  sin: '∫ sin(ax+b) dx = −cos(ax+b) / a',
  cos: '∫ cos(ax+b) dx = sin(ax+b) / a',
  exp: '∫ e^(ax+b) dx = e^(ax+b) / a',
  sinh: '∫ sinh(ax+b) dx = cosh(ax+b) / a',
  cosh: '∫ cosh(ax+b) dx = sinh(ax+b) / a',
  tan: '∫ tan(ax+b) dx = −ln|cos(ax+b)| / a',
};

interface Expansion { node: Node; rule: string; formula?: string }

// Divide por el coeficiente lineal a (sustitución u = ax+b), salvo a = 1.
function overA(node: Node, a: number): Node {
  return a === 1 ? node : { k: 'div', a: node, b: num(a) };
}

function expandInteg(a: Node, varName: string): Expansion {
  switch (a.k) {
    case 'add':
      return { node: { k: 'add', a: { k: 'integ', a: a.a }, b: { k: 'integ', a: a.b } }, rule: 'Linealidad (suma)', formula: '∫(f+g) dx = ∫f dx + ∫g dx' };
    case 'sub':
      return { node: { k: 'sub', a: { k: 'integ', a: a.a }, b: { k: 'integ', a: a.b } }, rule: 'Linealidad (resta)', formula: '∫(f−g) dx = ∫f dx − ∫g dx' };
    case 'neg':
      return { node: { k: 'neg', a: { k: 'integ', a: a.a } }, rule: 'Signo', formula: '∫(−f) dx = −∫f dx' };
    case 'mul': {
      const aConst = !dependsOnVar(a.a);
      const bConst = !dependsOnVar(a.b);
      if (aConst && !bConst)
        return { node: { k: 'mul', a: a.a, b: { k: 'integ', a: a.b } }, rule: 'Constante por función', formula: '∫c·f dx = c·∫f dx' };
      if (bConst && !aConst)
        return { node: { k: 'mul', a: a.b, b: { k: 'integ', a: a.a } }, rule: 'Constante por función', formula: '∫f·c dx = c·∫f dx' };
      throw new Error('No integro un producto de dos funciones de la variable de forma inmediata (haría falta integración por partes o sustitución).');
    }
    case 'div': {
      if (!dependsOnVar(a.b))
        return { node: { k: 'div', a: { k: 'integ', a: a.a }, b: a.b }, rule: 'Constante por función', formula: '∫(f/c) dx = (1/c)·∫f dx' };
      if (!dependsOnVar(a.a)) {
        const lin = asLinear(a.b, varName);
        if (lin && Math.abs(lin.a) > 1e-12)
          return { node: { k: 'mul', a: { k: 'div', a: a.a, b: num(lin.a) }, b: ln(abs(a.b)) }, rule: 'Integral de 1/(ax+b)', formula: '∫ 1/(ax+b) dx = (1/a)·ln|ax+b|' };
      }
      throw new Error('Esa fracción no tiene una integral inmediata (probá con un caso más simple).');
    }
    case 'num': case 'const': case 'param':
      return { node: { k: 'mul', a, b: { k: 'var', name: varName } }, rule: 'Integral de una constante', formula: '∫c dx = c·x' };
    case 'var':
      return { node: { k: 'div', a: { k: 'pow', a, b: num(2) }, b: num(2) }, rule: 'Regla de la potencia', formula: '∫x dx = x²/2' };
    case 'func': {
      if (a.name === 'sqrt')
        return { node: { k: 'integ', a: { k: 'pow', a: a.a, b: num(0.5) } }, rule: 'Reescribir la raíz como potencia', formula: '√u = u^(1/2)' };
      if (a.name === 'cbrt')
        return { node: { k: 'integ', a: { k: 'pow', a: a.a, b: num(1 / 3) } }, rule: 'Reescribir la raíz como potencia', formula: '∛u = u^(1/3)' };
      const lin = asLinear(a.a, varName);
      if (!lin || Math.abs(lin.a) < 1e-12)
        throw new Error('Sólo integro funciones con argumento lineal (de la forma ax + b).');
      const F = funcAntideriv(a.name, a.a);
      if (!F) throw new Error(`La integral de ${a.name} no es inmediata.`);
      return { node: overA(F, lin.a), rule: 'Integral inmediata', formula: FUNC_INT_RULE[a.name] };
    }
    case 'pow': {
      const baseVar = dependsOnVar(a.a);
      const expVar = dependsOnVar(a.b);
      if (baseVar && !expVar && a.b.k === 'num') {
        const n = a.b.v;
        if (a.a.k === 'var') {
          if (Math.abs(n + 1) < 1e-12)
            return { node: ln(abs(a.a)), rule: 'Integral de 1/x', formula: '∫ x⁻¹ dx = ln|x|' };
          return { node: { k: 'div', a: { k: 'pow', a: a.a, b: num(n + 1) }, b: num(n + 1) }, rule: 'Regla de la potencia', formula: '∫xⁿ dx = xⁿ⁺¹/(n+1)' };
        }
        const lin = asLinear(a.a, varName);
        if (lin && Math.abs(lin.a) > 1e-12) {
          if (Math.abs(n + 1) < 1e-12)
            return { node: { k: 'mul', a: { k: 'div', a: ONE, b: num(lin.a) }, b: ln(abs(a.a)) }, rule: 'Sustitución lineal', formula: '∫ 1/(ax+b) dx = (1/a)·ln|ax+b|' };
          return { node: { k: 'div', a: { k: 'pow', a: a.a, b: num(n + 1) }, b: num(lin.a * (n + 1)) }, rule: 'Regla de la potencia con sustitución lineal', formula: '∫(ax+b)ⁿ dx = (ax+b)ⁿ⁺¹ / (a(n+1))' };
        }
        throw new Error('La base de la potencia debe ser x o algo lineal (ax+b) para integrar de forma inmediata.');
      }
      if (!baseVar && expVar) {
        const lin = asLinear(a.b, varName);
        if (lin && Math.abs(lin.a) > 1e-12) {
          if (a.a.k === 'const' && a.a.name === 'e')
            return { node: { k: 'div', a, b: num(lin.a) }, rule: 'Integral de la exponencial', formula: '∫ e^(ax+b) dx = e^(ax+b)/a' };
          if (a.a.k === 'num' && a.a.v > 0)
            return { node: { k: 'div', a, b: num(lin.a * Math.log(a.a.v)) }, rule: 'Integral de la exponencial', formula: '∫ kˣ dx = kˣ / (a·ln k)' };
        }
        throw new Error('Para integrar una exponencial el exponente debe ser lineal (ax + b).');
      }
      throw new Error('No puedo integrar esta potencia de forma inmediata.');
    }
    default:
      throw new Error('No puedo integrar este término de forma elemental.');
  }
}

function hasInteg(n: Node): boolean {
  if (n.k === 'integ') return true;
  switch (n.k) {
    case 'num': case 'const': case 'var': case 'param': return false;
    case 'neg': case 'func': case 'deriv': return hasInteg(n.a);
    default: return hasInteg((n as any).a) || hasInteg((n as any).b);
  }
}

function stepOnce(tree: Node, varName: string): { tree: Node; rule: string; formula?: string } | null {
  let found: { rule: string; formula?: string } | null = null;
  function walk(n: Node): Node {
    if (found) return n;
    if (n.k === 'integ') {
      const ex = expandInteg(n.a, varName);
      found = { rule: ex.rule, formula: ex.formula };
      return ex.node;
    }
    switch (n.k) {
      case 'neg': case 'func': return { ...n, a: walk(n.a) };
      case 'add': case 'sub': case 'mul': case 'div': case 'pow': {
        const a = walk((n as any).a);
        if (found) return { ...(n as any), a };
        const b = walk((n as any).b);
        return { ...(n as any), a, b };
      }
      default: return n;
    }
  }
  const newTree = walk(tree);
  if (!found) return null;
  return { tree: newTree, rule: (found as any).rule, formula: (found as any).formula };
}

const MAX_STEPS = 200;

export function integrate(input: string, varName = 'x'): IntegralResult {
  const base: IntegralResult = {
    ok: false, varName, inputMathml: '', resultMathml: '', resultText: '', steps: [],
  };
  if (!input || !input.trim()) return { ...base, error: 'Escribí una función para integrar.' };

  let ast: Node;
  try {
    ast = parse(input, varName);
  } catch (e) {
    return { ...base, error: (e as Error).message || 'No pude interpretar la expresión.' };
  }

  const dx = `<mspace width="0.15em"/><mrow><mi>d</mi><mi>${esc(varName)}</mi></mrow>`;
  const inputMathml = wrapMath(`<mrow><mo>&#x222B;</mo>${mml(ast, varName)}${dx}</mrow>`);

  const steps: Step[] = [];
  let tree: Node = { k: 'integ', a: ast };
  steps.push({
    rule: 'Planteo',
    formula: `Buscamos la antiderivada (integral indefinida) respecto de ${varName}.`,
    mathml: wrapMath(mml(tree, varName)),
  });

  let guard = 0;
  try {
    while (hasInteg(tree) && guard < MAX_STEPS) {
      const r = stepOnce(tree, varName);
      if (!r) break;
      tree = r.tree;
      steps.push({ rule: r.rule, formula: r.formula, mathml: wrapMath(mml(tree, varName)) });
      guard++;
    }
  } catch (e) {
    return { ...base, inputMathml, error: (e as Error).message || 'No pude integrar esta expresión.' };
  }
  if (guard >= MAX_STEPS) return { ...base, inputMathml, error: 'La expresión es demasiado compleja.' };

  const simplified = simplifyFully(tree);
  if (!equalNode(simplified, tree)) {
    steps.push({ rule: 'Simplificar', mathml: wrapMath(mml(simplified, varName)) });
  }

  // Sumar la constante de integración.
  const withC: Node = { k: 'add', a: simplified, b: C };
  steps.push({
    rule: 'Sumar la constante de integración',
    formula: 'Toda integral indefinida lleva + C (la constante arbitraria).',
    mathml: wrapMath(mml(withC, varName)),
  });

  const resultMathml = wrapMath(`<mrow>${mml({ k: 'integ', a: ast }, varName)}<mo>=</mo>${mml(withC, varName)}</mrow>`);

  return {
    ok: true,
    varName,
    inputMathml,
    resultMathml,
    resultText: toText(withC, varName),
    steps,
  };
}

export function renderIntegralHTML(r: IntegralResult): string {
  const view: SolutionView = {
    ok: r.ok,
    error: r.error,
    headerMathml: r.inputMathml,
    steps: r.steps,
    resultMathml: r.resultMathml,
    resultText: r.resultText,
    copyLabel: 'Copiar la integral',
  };
  return renderSolution(view);
}
