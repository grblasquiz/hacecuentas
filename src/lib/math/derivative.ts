// ─────────────────────────────────────────────────────────────────────────────
// Motor de derivación simbólica paso a paso.
//
// Pipeline: tokenizar → parsear a AST → reescribir aplicando reglas (suma,
// producto, cociente, potencia, cadena, exponencial) registrando cada paso →
// simplificar → renderizar a MathML (presentación, nativo del navegador).
//
// 100% puro y sin DOM: lo usan tanto el build (ejemplos prerenderizados para SEO)
// como el <script> de la página (interactivo en el cliente). Sin eval() ni
// dependencias externas. Probado en tests/derivative.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type Node =
  | { k: 'num'; v: number }
  | { k: 'const'; name: string } // π, e — constantes simbólicas (derivada 0)
  | { k: 'var'; name: string } // la variable de derivación
  | { k: 'param'; name: string } // parámetro literal (a, b, c…) → derivada 0
  | { k: 'neg'; a: Node }
  | { k: 'add'; a: Node; b: Node }
  | { k: 'sub'; a: Node; b: Node }
  | { k: 'mul'; a: Node; b: Node }
  | { k: 'div'; a: Node; b: Node }
  | { k: 'pow'; a: Node; b: Node }
  | { k: 'func'; name: string; a: Node }
  | { k: 'deriv'; a: Node }; // pseudo-nodo: "derivada aún sin resolver"

export interface Step {
  rule: string; // nombre de la regla aplicada (ej. "Regla del producto")
  formula?: string; // forma general de la regla (texto plano)
  mathml: string; // expresión completa en este punto de la resolución
}

export interface DerivResult {
  ok: boolean;
  error?: string;
  varName: string;
  inputMathml: string; // f(x) renderizada
  resultMathml: string; // f'(x) = resultado simplificado
  resultText: string; // resultado en texto plano (ASCII)
  steps: Step[];
}

const FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'ln', 'log', 'exp', 'sqrt', 'cbrt', 'abs',
]);

// ── Tokenizer ────────────────────────────────────────────────────────────────
type Tok =
  | { t: 'num'; v: number }
  | { t: 'name'; v: string }
  | { t: 'op'; v: string }
  | { t: 'lp' }
  | { t: 'rp' };

function normalize(s: string): string {
  return s
    .replace(/×|·|∙|\*/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/√/g, 'sqrt')
    .replace(/∛/g, 'cbrt')
    .replace(/π/g, 'pi')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

function tokenize(src: string): Tok[] {
  const s = normalize(src);
  const toks: Tok[] = [];
  let i = 0;
  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isAlpha = (c: string) => /[a-zA-Z]/.test(c);
  while (i < s.length) {
    const c = s[i];
    if (isDigit(c) || c === '.') {
      let j = i;
      while (j < s.length && (isDigit(s[j]) || s[j] === '.')) j++;
      const numStr = s.slice(i, j);
      if ((numStr.match(/\./g) || []).length > 1) throw new Error('Número inválido: ' + numStr);
      toks.push({ t: 'num', v: parseFloat(numStr) });
      i = j;
      continue;
    }
    if (isAlpha(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      toks.push({ t: 'name', v: s.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '(') { toks.push({ t: 'lp' }); i++; continue; }
    if (c === ')') { toks.push({ t: 'rp' }); i++; continue; }
    if ('+-*/^'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
    throw new Error(`Carácter inválido: "${c}"`);
  }
  return toks;
}

// ── Parser (descenso recursivo, con multiplicación implícita) ────────────────
function parse(src: string, varName: string): Node {
  const toks = tokenize(src);
  let pos = 0;
  const peek = () => toks[pos];
  const eat = () => toks[pos++];

  function nameToNode(name: string): Node {
    const lower = name.toLowerCase();
    if (lower === 'pi') return { k: 'const', name: 'π' };
    if (lower === 'e') return { k: 'const', name: 'e' };
    if (name === varName) return { k: 'var', name };
    return { k: 'param', name };
  }

  // ¿El próximo token puede iniciar un factor? (para mult. implícita: 2x, x sin(x))
  function startsFactor(): boolean {
    const tk = peek();
    if (!tk) return false;
    return tk.t === 'num' || tk.t === 'name' || tk.t === 'lp';
  }

  function parsePrimary(): Node {
    const tk = peek();
    if (!tk) throw new Error('Expresión incompleta');
    if (tk.t === 'num') { eat(); return { k: 'num', v: (tk as any).v }; }
    if (tk.t === 'lp') {
      eat();
      const e = parseExpr();
      if (!peek() || peek().t !== 'rp') throw new Error('Falta cerrar un paréntesis');
      eat();
      return e;
    }
    if (tk.t === 'name') {
      const name = (tk as any).v as string;
      const lower = name.toLowerCase();
      if (FUNCS.has(lower)) {
        eat();
        if (!peek() || peek().t !== 'lp') throw new Error(`La función ${lower} necesita paréntesis: ${lower}(...)`);
        eat();
        const arg = parseExpr();
        if (!peek() || peek().t !== 'rp') throw new Error(`Falta cerrar el paréntesis de ${lower}(...)`);
        eat();
        return { k: 'func', name: lower, a: arg };
      }
      // Cadena de letras no-función: producto implícito de letras sueltas (ej. "ab" = a·b)
      eat();
      if (name.length === 1 || lower === 'pi') return nameToNode(name);
      let acc: Node = nameToNode(name[0]);
      for (let k = 1; k < name.length; k++) acc = { k: 'mul', a: acc, b: nameToNode(name[k]) };
      return acc;
    }
    throw new Error('Token inesperado');
  }

  function parsePower(): Node {
    const base = parsePrimary();
    if (peek() && peek().t === 'op' && (peek() as any).v === '^') {
      eat();
      const exp = parseUnary(); // ^ asocia a derecha; el exponente puede llevar signo
      return { k: 'pow', a: base, b: exp };
    }
    return base;
  }

  function parseUnary(): Node {
    const tk = peek();
    if (tk && tk.t === 'op' && (tk as any).v === '-') { eat(); return { k: 'neg', a: parseUnary() }; }
    if (tk && tk.t === 'op' && (tk as any).v === '+') { eat(); return parseUnary(); }
    return parsePower();
  }

  function parseTerm(): Node {
    let left = parseUnary();
    for (;;) {
      const tk = peek();
      if (tk && tk.t === 'op' && ((tk as any).v === '*' || (tk as any).v === '/')) {
        const op = (eat() as any).v;
        const right = parseUnary();
        left = { k: op === '*' ? 'mul' : 'div', a: left, b: right };
      } else if (startsFactor()) {
        // multiplicación implícita (2x, x sin(x), (x+1)(x-1))
        const right = parseUnary();
        left = { k: 'mul', a: left, b: right };
      } else break;
    }
    return left;
  }

  function parseExpr(): Node {
    let left = parseTerm();
    for (;;) {
      const tk = peek();
      if (tk && tk.t === 'op' && ((tk as any).v === '+' || (tk as any).v === '-')) {
        const op = (eat() as any).v;
        const right = parseTerm();
        left = { k: op === '+' ? 'add' : 'sub', a: left, b: right };
      } else break;
    }
    return left;
  }

  const ast = parseExpr();
  if (pos < toks.length) throw new Error('Sobran símbolos en la expresión');
  return ast;
}

// ── Utilidades sobre el AST ──────────────────────────────────────────────────
const num = (v: number): Node => ({ k: 'num', v });
const ZERO = num(0);
const ONE = num(1);

function dependsOnVar(n: Node): boolean {
  switch (n.k) {
    case 'var': return true;
    case 'num': case 'const': case 'param': return false;
    case 'neg': case 'deriv': case 'func': return dependsOnVar(n.a);
    default: return dependsOnVar((n as any).a) || dependsOnVar((n as any).b);
  }
}

function equalNode(a: Node, b: Node): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case 'num': return a.v === (b as any).v;
    case 'const': case 'var': case 'param': return a.name === (b as any).name;
    case 'func': return a.name === (b as any).name && equalNode(a.a, (b as any).a);
    case 'neg': case 'deriv': return equalNode(a.a, (b as any).a);
    default: return equalNode((a as any).a, (b as any).a) && equalNode((a as any).b, (b as any).b);
  }
}

// Derivada de cada función conocida, en términos de su argumento `u` (sin la
// cadena: el factor u' lo agrega el reescritor). Devuelve el nodo D[f](u).
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

// ── Reescritor: expande UN nodo `deriv` por vez, devolviendo la regla aplicada ─
interface Expansion { node: Node; rule: string; formula?: string }

function resolveLeafDeriv(a: Node): Node | null {
  // Derivadas triviales que conviene resolver en línea (no merecen un paso aparte)
  if (a.k === 'num' || a.k === 'const' || a.k === 'param') return ZERO;
  if (a.k === 'var') return ONE;
  return null;
}

function expandDeriv(a: Node): Expansion {
  // a = el argumento del nodo deriv que estamos resolviendo
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
        // Regla de la potencia (+ cadena): (uⁿ)' = n·uⁿ⁻¹·u'
        const nMinus1: Node = a.b.k === 'num' ? num(a.b.v - 1) : { k: 'sub', a: a.b, b: ONE };
        const core: Node = { k: 'mul', a: a.b, b: { k: 'pow', a: a.a, b: nMinus1 } };
        if (a.a.k === 'var') return { node: core, rule: 'Regla de la potencia', formula: "(xⁿ)' = n·xⁿ⁻¹" };
        return { node: { k: 'mul', a: core, b: { k: 'deriv', a: a.a } }, rule: 'Regla de la potencia y la cadena', formula: "(uⁿ)' = n·uⁿ⁻¹·u'" };
      }
      if (!baseVar && expVar) {
        // Exponencial: (aᵘ)' = aᵘ·ln(a)·u'  (caso e: ln e = 1)
        if (a.a.k === 'const' && a.a.name === 'e')
          return { node: { k: 'mul', a: a, b: { k: 'deriv', a: a.b } }, rule: 'Derivada de la exponencial', formula: "(eᵘ)' = eᵘ·u'" };
        return {
          node: { k: 'mul', a: { k: 'mul', a, b: { k: 'func', name: 'ln', a: a.a } }, b: { k: 'deriv', a: a.b } },
          rule: 'Derivada de la exponencial', formula: "(aᵘ)' = aᵘ·ln(a)·u'",
        };
      }
      // Caso general uᵛ: derivación logarítmica
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
      // Si u' = 1 (u es la variable) omitimos el factor para no ensuciar
      const node: Node = inner && equalNode(inner, ONE) ? d : { k: 'mul', a: d, b: chain };
      return { node, rule: 'Regla de la cadena', formula: FUNC_RULE[a.name] ?? "(f(u))' = f'(u)·u'" };
    }
    default:
      throw new Error('No se puede derivar esta expresión');
  }
}

// Recorre el árbol, encuentra el primer `deriv` (izq-externo) y lo expande.
// Antes resuelve en línea cualquier deriv de hoja para no generar pasos triviales.
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

// ── Simplificación (conservadora, suficiente para resultados limpios) ────────
function simplify(n: Node): Node {
  switch (n.k) {
    case 'num': case 'const': case 'var': case 'param': case 'deriv':
      return n;
    case 'neg': {
      const a = simplify(n.a);
      if (a.k === 'num') return num(-a.v);
      if (a.k === 'neg') return a.a; // −(−x) = x
      return { k: 'neg', a };
    }
    case 'func': return { k: 'func', name: n.name, a: simplify(n.a) };
    case 'add': {
      const a = simplify(n.a), b = simplify(n.b);
      if (a.k === 'num' && a.v === 0) return b;
      if (b.k === 'num' && b.v === 0) return a;
      if (a.k === 'num' && b.k === 'num') return num(a.v + b.v);
      if (b.k === 'neg') return simplify({ k: 'sub', a, b: b.a }); // a + (−x) = a − x
      return { k: 'add', a, b };
    }
    case 'sub': {
      const a = simplify(n.a), b = simplify(n.b);
      if (b.k === 'num' && b.v === 0) return a;
      if (a.k === 'num' && b.k === 'num') return num(a.v - b.v);
      if (a.k === 'num' && a.v === 0) return simplify({ k: 'neg', a: b });
      return { k: 'sub', a, b };
    }
    case 'mul': {
      const a = simplify(n.a), b = simplify(n.b);
      // Aplanar la cadena de productos, juntar el coeficiente numérico y el signo,
      // y reconstruir con el número al frente (6·x, 2·a·x, −sin(x)…).
      const factors: Node[] = [];
      const flatten = (x: Node) => {
        if (x.k === 'mul') { flatten(x.a); flatten(x.b); }
        else if (x.k === 'neg') { factors.push(num(-1)); flatten(x.a); }
        else factors.push(x);
      };
      flatten(a); flatten(b);
      let coeff = 1;
      const others: Node[] = [];
      for (const f of factors) {
        if (f.k === 'num') coeff *= f.v;
        else others.push(f);
      }
      if (coeff === 0) return ZERO;
      // Combinar factores que son fracciones en una sola: A·(P/Q) = (A·P)/Q
      const numers: Node[] = [];
      const denoms: Node[] = [];
      for (const f of others) {
        if (f.k === 'div') { numers.push(f.a); denoms.push(f.b); }
        else numers.push(f);
      }
      const sign = coeff < 0 ? -1 : 1;
      const mag = Math.abs(coeff);
      const buildProd = (parts: Node[]): Node => {
        if (parts.length === 0) return ONE;
        let p = parts[0];
        for (let i = 1; i < parts.length; i++) p = { k: 'mul', a: p, b: parts[i] };
        return p;
      };
      const numParts: Node[] = mag === 1 ? [...numers] : [num(mag), ...numers];
      let combined: Node;
      if (denoms.length > 0) {
        combined = { k: 'div', a: buildProd(numParts), b: buildProd(denoms) };
      } else {
        combined = buildProd(numParts.length ? numParts : [num(mag)]);
      }
      return sign < 0 ? { k: 'neg', a: combined } : combined;
    }
    case 'div': {
      const a = simplify(n.a), b = simplify(n.b);
      if (a.k === 'num' && a.v === 0) return ZERO;
      if (b.k === 'num' && b.v === 1) return a;
      if (a.k === 'num' && b.k === 'num' && b.v !== 0 && a.v % b.v === 0) return num(a.v / b.v);
      return { k: 'div', a, b };
    }
    case 'pow': {
      const a = simplify(n.a), b = simplify(n.b);
      if (b.k === 'num' && b.v === 1) return a; // x¹ = x
      if (b.k === 'num' && b.v === 0) return ONE; // x⁰ = 1
      if (a.k === 'num' && b.k === 'num') {
        const r = Math.pow(a.v, b.v);
        if (Number.isInteger(r) && Math.abs(r) < 1e15) return num(r);
      }
      return { k: 'pow', a, b };
    }
  }
}

// ── Render MathML (presentación) ─────────────────────────────────────────────
function prec(n: Node): number {
  switch (n.k) {
    case 'add': case 'sub': return 1;
    case 'mul': case 'div': return 2;
    case 'neg': return 2;
    case 'pow': return 3;
    case 'deriv': return 2;
    default: return 4; // num, var, const, param, func
  }
}

const FUNC_MML: Record<string, string> = {
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
  asin: 'arcsin', acos: 'arccos', atan: 'arctan',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', sech: 'sech',
  ln: 'ln', log: 'log', exp: 'exp',
};

function paren(inner: string): string {
  return `<mo>(</mo>${inner}<mo>)</mo>`;
}

function mml(n: Node, varName: string): string {
  switch (n.k) {
    case 'num': {
      if (n.v < 0) return `<mrow><mo>&#x2212;</mo><mn>${fmtNum(-n.v)}</mn></mrow>`;
      return `<mn>${fmtNum(n.v)}</mn>`;
    }
    case 'const': return `<mi>${n.name === 'π' ? '&#x3C0;' : 'e'}</mi>`;
    case 'var': return `<mi>${esc(varName)}</mi>`;
    case 'param': return `<mi>${esc(n.name)}</mi>`;
    case 'neg':
      return `<mrow><mo>&#x2212;</mo>${wrap(n.a, 2, varName)}</mrow>`;
    case 'add':
      return `<mrow>${mml(n.a, varName)}<mo>+</mo>${mml(n.b, varName)}</mrow>`;
    case 'sub':
      return `<mrow>${mml(n.a, varName)}<mo>&#x2212;</mo>${wrap(n.b, 2, varName)}</mrow>`;
    case 'mul': {
      // yuxtaponer coeficiente·variable (2x); en el resto, punto medio
      const aSimple = n.a.k === 'num' || n.a.k === 'const' || n.a.k === 'param';
      const bAtomish = n.b.k === 'var' || n.b.k === 'pow' || n.b.k === 'func' || n.b.k === 'const' || n.b.k === 'param';
      const sep = aSimple && bAtomish ? '<mo>&#x2062;</mo>' : '<mo>&#x22C5;</mo>';
      return `<mrow>${wrap(n.a, 2, varName)}${sep}${wrap(n.b, 2, varName)}</mrow>`;
    }
    case 'div':
      return `<mfrac>${frac(n.a, varName)}${frac(n.b, varName)}</mfrac>`;
    case 'pow': {
      const base = n.a.k === 'func'
        ? mml(n.a, varName) // sin(x)^2 → render función completa como base
        : wrap(n.a, 4, varName);
      return `<msup>${base}<mrow>${mml(n.b, varName)}</mrow></msup>`;
    }
    case 'func': {
      const label = FUNC_MML[n.name] ?? n.name;
      if (n.name === 'sqrt') return `<msqrt>${mml(n.a, varName)}</msqrt>`;
      if (n.name === 'cbrt') return `<mroot>${frac(n.a, varName)}<mn>3</mn></mroot>`;
      if (n.name === 'abs') return `<mrow><mo>|</mo>${mml(n.a, varName)}<mo>|</mo></mrow>`;
      return `<mrow><mi>${label}</mi><mo>&#x2061;</mo>${paren(mml(n.a, varName))}</mrow>`;
    }
    case 'deriv':
      return `<mrow><mfrac><mi>d</mi><mrow><mi>d</mi><mi>${esc(varName)}</mi></mrow></mfrac>${paren(mml(n.a, varName))}</mrow>`;
  }
}

// envuelve en paréntesis si la precedencia del hijo es menor que minPrec
function wrap(n: Node, minPrec: number, varName: string): string {
  const inner = mml(n, varName);
  if (prec(n) < minPrec) return `<mrow>${paren(inner)}</mrow>`;
  return inner;
}

// para numerador/denominador de fracción y radicando: siempre en <mrow> sin parén
function frac(n: Node, varName: string): string {
  return `<mrow>${mml(n, varName)}</mrow>`;
}

function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toPrecision(10)));
}

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
}

function wrapMath(content: string): string {
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${content}</math>`;
}

// ── Texto plano (para aria-label, copiar y fallback) ─────────────────────────
function toText(n: Node, varName: string): string {
  switch (n.k) {
    case 'num': return fmtNum(n.v);
    case 'const': return n.name === 'π' ? 'pi' : 'e';
    case 'var': return varName;
    case 'param': return n.name;
    case 'neg': return `-${ptxt(n.a, 2, varName)}`;
    case 'add': return `${toText(n.a, varName)} + ${toText(n.b, varName)}`;
    case 'sub': return `${toText(n.a, varName)} - ${ptxt(n.b, 2, varName)}`;
    case 'mul': return `${ptxt(n.a, 2, varName)}·${ptxt(n.b, 2, varName)}`;
    case 'div': return `${ptxt(n.a, 2, varName)}/${ptxt(n.b, 3, varName)}`;
    case 'pow': return `${ptxt(n.a, 4, varName)}^${ptxt(n.b, 4, varName)}`;
    case 'func':
      if (n.name === 'sqrt') return `√(${toText(n.a, varName)})`;
      return `${FUNC_MML[n.name] ?? n.name}(${toText(n.a, varName)})`;
    case 'deriv': return `d/d${varName}(${toText(n.a, varName)})`;
  }
}
function ptxt(n: Node, minPrec: number, varName: string): string {
  const t = toText(n, varName);
  return prec(n) < minPrec ? `(${t})` : t;
}

// ── API pública ──────────────────────────────────────────────────────────────
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

  // f(x) = <input>
  const inputMathml = wrapMath(
    `<mrow><mi>f</mi><mo>&#x2061;</mo>${paren(`<mi>${esc(varName)}</mi>`)}<mo>=</mo>${mml(ast, varName)}</mrow>`
  );

  const steps: Step[] = [];
  // Paso 0: plantear la derivada
  let tree: Node = { k: 'deriv', a: ast };
  steps.push({
    rule: 'Planteo',
    formula: `Buscamos f'(${varName}), la derivada de f respecto de ${varName}.`,
    mathml: wrapMath(
      `<mrow><msup><mi>f</mi><mo>&#x2032;</mo></msup>${paren(`<mi>${esc(varName)}</mi>`)}<mo>=</mo>${mml(tree, varName)}</mrow>`
    ),
  });

  // Reescribir hasta que no queden derivadas pendientes
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

  // Simplificación (uno o varios pases hasta punto fijo)
  let simplified = tree;
  for (let i = 0; i < 8; i++) {
    const next = simplify(simplified);
    if (equalNode(next, simplified)) break;
    simplified = next;
  }
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

// Render compartido (build + cliente): genera el HTML de la resolución completa.
// La MathML ya es nuestra (confiable); sólo escapamos el texto de las fórmulas.
export function renderSolutionHTML(r: DerivResult): string {
  if (!r.ok) {
    return `<p class="dv-error" role="alert">⚠️ ${esc(r.error || 'No pude derivar la expresión.')}</p>`;
  }
  const stepsHtml = r.steps
    .map((s, i) => {
      const formula = s.formula ? `<p class="dv-step-formula">${esc(s.formula)}</p>` : '';
      return (
        `<li class="dv-step">` +
        `<div class="dv-step-head"><span class="dv-step-n">${i + 1}</span>` +
        `<span class="dv-step-rule">${esc(s.rule)}</span></div>` +
        formula +
        `<div class="dv-step-math">${s.mathml}</div>` +
        `</li>`
      );
    })
    .join('');
  return (
    `<div class="dv-input-line">${r.inputMathml}</div>` +
    `<ol class="dv-steps">${stepsHtml}</ol>` +
    `<div class="dv-result"><span class="dv-result-label">Resultado</span>` +
    `<div class="dv-result-math">${r.resultMathml}</div>` +
    `<button type="button" class="dv-copy" data-copy="${esc(r.resultText)}" title="Copiar f'(${esc(r.varName)})">📋 Copiar</button>` +
    `</div>`
  );
}
