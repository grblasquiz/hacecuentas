// ─────────────────────────────────────────────────────────────────────────────
// Simplificar / operar expresiones: expande productos y potencias y agrupa los
// términos semejantes de un polinomio en una variable, o evalúa una expresión
// numérica. Casos no polinómicos (funciones, varias variables) usan la
// simplificación conservadora del núcleo o avisan con un mensaje.
//
// Reusa parser/AST/poly/render de core.ts. Probado en tests/simplify.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Node, type Step, type SolutionView,
  parse, FUNCS, simplifyFully, equalNode, mml, wrapMath, fmtNum, toText,
  renderSolution, toPoly, polyToNode, pDegree,
} from './core';

export interface SimplifyResult {
  ok: boolean;
  error?: string;
  varName: string;
  inputMathml: string;
  resultMathml: string;
  resultText: string;
  steps: Step[];
}

// Adivina la variable: la única letra (que no sea función ni π/e) que aparece.
function guessVar(input: string, preferred: string): string {
  const runs = input.match(/[a-zA-Z]+/g) || [];
  const vars = new Set<string>();
  for (const r of runs) {
    const low = r.toLowerCase();
    if (FUNCS.has(low) || low === 'pi') continue;
    for (const ch of r) {
      if (ch.toLowerCase() === 'e') continue;
      vars.add(ch);
    }
  }
  if (vars.has(preferred)) return preferred;
  if (vars.size === 1) return [...vars][0];
  return preferred;
}

export function simplifyExpression(input: string, preferredVar = 'x'): SimplifyResult {
  const varName = guessVar(input, preferredVar);
  const base: SimplifyResult = {
    ok: false, varName, inputMathml: '', resultMathml: '', resultText: '', steps: [],
  };
  if (!input || !input.trim()) return { ...base, error: 'Escribí una expresión para simplificar.' };

  let ast: Node;
  try {
    ast = parse(input, varName);
  } catch (e) {
    return { ...base, error: (e as Error).message || 'No pude interpretar la expresión.' };
  }

  const inputMathml = wrapMath(mml(ast, varName));
  const steps: Step[] = [];
  steps.push({ rule: 'Expresión original', mathml: wrapMath(mml(ast, varName)) });

  // Camino 1: es un polinomio en una variable → expandir y agrupar.
  try {
    const poly = toPoly(ast, varName);
    const deg = pDegree(poly);

    if (deg === 0) {
      const value = poly[0] ?? 0;
      const resultMathml = wrapMath(`<mrow>${mml(ast, varName)}<mo>=</mo><mn>${fmtNum(value)}</mn></mrow>`);
      steps.push({
        rule: 'Operar', formula: 'Resolvemos las operaciones numéricas.',
        mathml: wrapMath(`<mn>${fmtNum(value)}</mn>`),
      });
      return { ...base, ok: true, varName, inputMathml, steps, resultMathml, resultText: fmtNum(value) };
    }

    const canonical = polyToNode(poly, varName);
    steps.push({
      rule: 'Agrupar términos semejantes',
      formula: 'Resolvemos productos y potencias, y sumamos los términos del mismo grado.',
      mathml: wrapMath(mml(canonical, varName)),
    });
    const resultMathml = wrapMath(`<mrow>${mml(ast, varName)}<mo>=</mo>${mml(canonical, varName)}</mrow>`);
    return {
      ...base, ok: true, varName, inputMathml, steps, resultMathml,
      resultText: toText(canonical, varName),
    };
  } catch {
    // No es un polinomio en una variable: usamos la simplificación conservadora.
  }

  // Camino 2: simplificación general conservadora (productos por 1, sumas con 0…).
  const simplified = simplifyFully(ast);
  if (equalNode(simplified, ast)) {
    return {
      ...base, ok: true, varName, inputMathml,
      steps: [...steps, { rule: 'Sin cambios', formula: 'La expresión ya está en su forma más simple que puedo manejar (puede tener funciones o varias variables).', mathml: wrapMath(mml(ast, varName)) }],
      resultMathml: wrapMath(mml(ast, varName)),
      resultText: toText(ast, varName),
    };
  }
  steps.push({
    rule: 'Simplificar',
    formula: 'Resolvemos productos por 1, sumas con 0 y signos.',
    mathml: wrapMath(mml(simplified, varName)),
  });
  const resultMathml = wrapMath(`<mrow>${mml(ast, varName)}<mo>=</mo>${mml(simplified, varName)}</mrow>`);
  return {
    ...base, ok: true, varName, inputMathml, steps, resultMathml,
    resultText: toText(simplified, varName),
  };
}

export function renderSimplifyHTML(r: SimplifyResult): string {
  const view: SolutionView = {
    ok: r.ok,
    error: r.error,
    headerMathml: r.inputMathml,
    steps: r.steps,
    resultMathml: r.resultMathml,
    resultText: r.resultText,
    copyLabel: 'Copiar resultado',
  };
  return renderSolution(view);
}
