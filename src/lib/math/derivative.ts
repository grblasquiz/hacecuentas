// ─────────────────────────────────────────────────────────────────────────────
// Motor de derivación simbólica paso a paso. La infraestructura común (parser,
// AST, simplificador, render MathML) vive en core.ts; acá sólo está la lógica
// específica de derivar: las reglas y el reescritor que registra cada paso.
// Probado en tests/derivative.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Node, type Step,
  parse, num, ONE, ZERO, dependsOnVar, equalNode, simplifyFully,
  mml, paren, esc, wrapMath, toText, renderSolution, type SolutionView,
} from './core';

export interface DerivResult {
  ok: boolean;
  error?: string;
  varName: string;
  inputMathml: string;
  resultMathml: string;
  resultText: string;
  steps: Step[];
}

// Derivada de cada función conocida en términos de su argumento `u` (sin la
// cadena: el factor u' lo agrega el reescritor).
function funcDeriv(name: string, u: Node): Node {
  switch (name) {
    case 'sin': return { k: 'func', name: 'cos', a: u };
    case 'cos': return { k: 'neg', a: { k: 'func', name: 'sin', a: u } };
    case 'tan': return { k: 'pow', a: { k: 'func', name: 'sec', a: u }, b: num(2) };
    case 'cot': return { k: 'neg', a: { k: 'pow', a: { k: 'func', name: 'csc', a: u }, b: num(2) } };
    case 'sec': return { k: 'mul', a: { k: 'func', name: 'sec', a: u }, b: { k: 'func', name: 'tan', a: u } };
    case 'csc': return { k: 'neg', a: { k: 'mul', a: { k: 'func', name: 'csc', a: u }, b: { k: 'func', name: 'cot', a: u } } };
    case 'asin': return { k: 'div', a: ONE, b: { k: 'func', name: 'sqrt', a: { k: 'sub', a: ONE, b: { k: 'pow', a: u, b: num(2) } } } };
    case 'acos': return { k: 'neg', a: { k: 'div', a: ONE, b: { k: 'func', name: 'sqrt', a: { k: 'sub', a: ONE, b: { k: 'pow', a: u, b: num(2) } } } } };
    case 'atan': return { k: 'div', a: ONE, b: { k: 'add', a: ONE, b: { k: 'pow', a: u, b: num(2) } } };
    case 'sinh': return { k: 'func', name: 'cosh', a: u };
    case 'cosh': return { k: 'func', name: 'sinh', a: u };
    case 'tanh': return { k: 'pow', a: { k: 'func', name: 'sech', a: u }, b: num(2) };
    case 'ln': return { k: 'div', a: ONE, b: u };
    case 'log': return { k: 'div', a: ONE, b: { k: 'mul', a: u, b: { k: 'func', name: 'ln', a: { k: 'num', v: 10 } } } };
    case 'exp': return { k: 'func', name: 'exp', a: u };
    case 'sqrt': return { k: 'div', a: ONE, b: { k: 'mul', a: num(2), b: { k: 'func', name: 'sqrt', a: u } } };
    case 'cbrt': return { k: 'div', a: ONE, b: { k: 'mul', a: num(3), b: { k: 'pow', a: { k: 'func', name: 'cbrt', a: u }, b: num(2) } } };
    default: throw new Error(`No sé derivar la función ${name}`);
  }
}

const FUNC_RULE: Record<string, string> = {
  sin: "(sin u)' = cos(u)·u'",
  cos: "(cos u)' = −sin(u)·u'",
  tan: "(tan u)' = sec²(u)·u'",
  cot: "(cot u)' = −csc²(u)·u'",
  sec: "(sec u)' = sec(u)·tan(u)·u'",
  csc: "(csc u)' = −csc(u)·cot(u)·u'",
  asin: "(arcsin u)' = u' / √(1−u²)",
  acos: "(arccos u)' = −u' / √(1−u²)",
  atan: "(arctan u)' = u' / (1+u²)",
  sinh: "(sinh u)' = cosh(u)·u'",
  cosh: "(cosh u)' = sinh(u)·u'",
  tanh: "(tanh u)' = sech²(u)·u'",
  ln: "(ln u)' = u' / u",
  log: "(log u)' = u' / (u·ln 10)",
  exp: "(eᵘ)' = eᵘ·u'",
  sqrt: "(√u)' = u' / (2√u)",
  cbrt: "(∛u)' = u' / (3·∛u²)",
};

const FUNC_RULE_DEFAULT = "(f(u))' = f'(u)·u'";

interface Expansion { node: Node; rule: string; formula?: string }

function resolveLeafDeriv(a: Node): Node | null {
  if (a.k === 'num' || a.k === 'const' || a.k === 'param') return ZERO;
  if (a.k === 'var') return ONE;
  return null;
}

function expandDeriv(a: Node): Expansion {
  switch (a.k) {
    case 'num': case 'const': case 'param':
      return { node: ZERO, rule: 'Derivada de una constante', formula: "(c)' = 0" };
    case 'var':
      return { node: ONE, rule: 'Derivada de la variable', formula: "(x)' = 1" };
    case 'neg':
      return { node: { k: 'neg', a: { k: 'deriv', a: a.a } }, rule: 'Regla del signo', formula: "(−f)' = −f'" };
    case 'add':
      return {
        node: { k: 'add', a: { k: 'deriv', a: a.a }, b: { k: 'deriv', a: a.b } },
        rule: 'Regla de la suma', formula: "(f+g)' = f' + g'",
      };
    case 'sub':
      return {
        node: { k: 'sub', a: { k: 'deriv', a: a.a }, b: { k: 'deriv', a: a.b } },
        rule: 'Regla de la resta', formula: "(f−g)' = f' − g'",
      };
    case 'mul': {
      const fConst = !dependsOnVar(a.a);
      const gConst = !dependsOnVar(a.b);
      if (fConst && !gConst)
        return { node: { k: 'mul', a: a.a, b: { k: 'deriv', a: a.b } }, rule: 'Constante por función', formula: "(c·f)' = c·f'" };
      if (gConst && !fConst)
        return { node: { k: 'mul', a: { k: 'deriv', a: a.a }, b: a.b }, rule: 'Constante por función', formula: "(f·c)' = f'·c" };
      return {
        node: {
          k: 'add',
          a: { k: 'mul', a: { k: 'deriv', a: a.a }, b: a.b },
          b: { k: 'mul', a: a.a, b: { k: 'deriv', a: a.b } },
        },
        rule: 'Regla del producto', formula: "(f·g)' = f'·g + f·g'",
      };
    }
    case 'div': {
      if (!dependsOnVar(a.b))
        return { node: { k: 'div', a: { k: 'deriv', a: a.a }, b: a.b }, rule: 'Constante por función', formula: "(f/c)' = f'/c" };
      return {
        node: {
          k: 'div',
          a: {
            k: 'sub',
            a: { k: 'mul', a: { k: 'deriv', a: a.a }, b: a.b },
            b: { k: 'mul', a: a.a, b: { k: 'deriv', a: a.b } },
          },
          b: { k: 'pow', a: a.b, b: num(2) },
        },
        rule: 'Regla del cociente', formula: "(f/g)' = (f'·g − f·g') / g²",
      };
    }
    case 'pow': {
      const baseVar = dependsOnVar(a.a);
      const expVar = dependsOnVar(a.b);
      if (baseVar && !expVar) {
        const nMinus1: Node = a.b.k === 'num' ? num(a.b.v - 1) : { k: 'sub', a: a.b, b: ONE };
        const core: Node = { k: 'mul', a: a.b, b: { k: 'pow', a: a.a, b: nMinus1 } };
        if (a.a.k === 'var') return { node: core, rule: 'Regla de la potencia', formula: "(xⁿ)' = n·xⁿ⁻¹" };
        return { node: { k: 'mul', a: core, b: { k: 'deriv', a: a.a } }, rule: 'Regla de la potencia y la cadena', formula: "(uⁿ)' = n·uⁿ⁻¹·u'" };
      }
      if (!baseVar && expVar) {
        if (a.a.k === 'const' && a.a.name === 'e')
          return { node: { k: 'mul', a, b: { k: 'deriv', a: a.b } }, rule: 'Derivada de la exponencial', formula: "(eᵘ)' = eᵘ·u'" };
        return {
          node: { k: 'mul', a: { k: 'mul', a, b: { k: 'func', name: 'ln', a: a.a } }, b: { k: 'deriv', a: a.b } },
          rule: 'Derivada de la exponencial', formula: "(aᵘ)' = aᵘ·ln(a)·u'",
        };
      }
      return {
        node: {
          k: 'mul', a,
          b: {
            k: 'add',
            a: { k: 'mul', a: { k: 'deriv', a: a.b }, b: { k: 'func', name: 'ln', a: a.a } },
            b: { k: 'div', a: { k: 'mul', a: a.b, b: { k: 'deriv', a: a.a } }, b: a.a },
          },
        },
        rule: 'Derivación logarítmica', formula: "(uᵛ)' = uᵛ·(v'·ln u + v·u'/u)",
      };
    }
    case 'func': {
      const inner = resolveLeafDeriv(a.a);
      const chain: Node = inner ?? { k: 'deriv', a: a.a };
      const d = funcDeriv(a.name, a.a);
      const node: Node = inner && equalNode(inner, ONE) ? d : { k: 'mul', a: d, b: chain };
      return { node, rule: 'Regla de la cadena', formula: FUNC_RULE[a.name] ?? FUNC_RULE_DEFAULT };
    }
    default:
      throw new Error('No se puede derivar esta expresión');
  }
}

function stepOnce(tree: Node): { tree: Node; rule: string; formula?: string } | null {
  let found: { rule: string; formula?: string } | null = null;

  function walk(n: Node): Node {
    if (found) return n;
    if (n.k === 'deriv') {
      const ex = expandDeriv(n.a);
      found = { rule: ex.rule, formula: ex.formula };
      return ex.node;
    }
    switch (n.k) {
      case 'neg': return { ...n, a: walk(n.a) };
      case 'func': return { ...n, a: walk(n.a) };
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

function hasDeriv(n: Node): boolean {
  if (n.k === 'deriv') return true;
  switch (n.k) {
    case 'num': case 'const': case 'var': case 'param': return false;
    case 'neg': case 'func': return hasDeriv(n.a);
    default: return hasDeriv((n as any).a) || hasDeriv((n as any).b);
  }
}

const MAX_STEPS = 200;

export function differentiate(input: string, varName = 'x'): DerivResult {
  const base: DerivResult = {
    ok: false, varName, inputMathml: '', resultMathml: '', resultText: '', steps: [],
  };
  if (!input || !input.trim()) return { ...base, error: 'Escribí una función para derivar.' };

  let ast: Node;
  try {
    ast = parse(input, varName);
  } catch (e) {
    return { ...base, error: (e as Error).message || 'No pude interpretar la expresión.' };
  }

  const inputMathml = wrapMath(
    `<mrow><mi>f</mi><mo>&#x2061;</mo>${paren(`<mi>${esc(varName)}</mi>`)}<mo>=</mo>${mml(ast, varName)}</mrow>`
  );

  const steps: Step[] = [];
  let tree: Node = { k: 'deriv', a: ast };
  steps.push({
    rule: 'Planteo',
    formula: `Buscamos f'(${varName}), la derivada de f respecto de ${varName}.`,
    mathml: wrapMath(
      `<mrow><msup><mi>f</mi><mo>&#x2032;</mo></msup>${paren(`<mi>${esc(varName)}</mi>`)}<mo>=</mo>${mml(tree, varName)}</mrow>`
    ),
  });

  let guard = 0;
  try {
    while (hasDeriv(tree) && guard < MAX_STEPS) {
      const r = stepOnce(tree);
      if (!r) break;
      tree = r.tree;
      steps.push({ rule: r.rule, formula: r.formula, mathml: wrapMath(mml(tree, varName)) });
      guard++;
    }
  } catch (e) {
    return { ...base, inputMathml, error: (e as Error).message || 'No pude derivar esta expresión.' };
  }
  if (guard >= MAX_STEPS) return { ...base, inputMathml, error: 'La expresión es demasiado compleja.' };

  const simplified = simplifyFully(tree);
  if (!equalNode(simplified, tree)) {
    steps.push({
      rule: 'Simplificar',
      formula: 'Agrupamos términos, resolvemos productos por 1 y sumas con 0.',
      mathml: wrapMath(mml(simplified, varName)),
    });
  }

  const resultMathml = wrapMath(
    `<mrow><msup><mi>f</mi><mo>&#x2032;</mo></msup>${paren(`<mi>${esc(varName)}</mi>`)}<mo>=</mo>${mml(simplified, varName)}</mrow>`
  );

  return {
    ok: true,
    varName,
    inputMathml,
    resultMathml,
    resultText: toText(simplified, varName),
    steps,
  };
}

// Render compartido (build + cliente) de la resolución de una derivada.
export function renderSolutionHTML(r: DerivResult): string {
  const view: SolutionView = {
    ok: r.ok,
    error: r.error,
    headerMathml: r.inputMathml,
    steps: r.steps,
    resultMathml: r.resultMathml,
    resultText: r.resultText,
    copyLabel: `Copiar f'(${r.varName})`,
  };
  return renderSolution(view);
}
