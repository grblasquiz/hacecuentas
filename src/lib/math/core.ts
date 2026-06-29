// ─────────────────────────────────────────────────────────────────────────────
// Núcleo simbólico compartido por las calculadoras de matemática (derivadas,
// ecuaciones, integrales…). Acá vive todo lo común: el parser, el AST, el
// simplificador, el render a MathML (presentación, nativo del navegador) y un
// renderizador de "resolución paso a paso".
//
// 100% puro y sin DOM: lo usan tanto el build (ejemplos prerenderizados para SEO)
// como los <script> de cada página. Sin eval() ni dependencias externas.
// ─────────────────────────────────────────────────────────────────────────────

export type Node =
  | { k: 'num'; v: number }
  | { k: 'const'; name: string } // π, e — constantes simbólicas
  | { k: 'var'; name: string } // la variable principal
  | { k: 'param'; name: string } // parámetro literal (a, b, c…)
  | { k: 'neg'; a: Node }
  | { k: 'add'; a: Node; b: Node }
  | { k: 'sub'; a: Node; b: Node }
  | { k: 'mul'; a: Node; b: Node }
  | { k: 'div'; a: Node; b: Node }
  | { k: 'pow'; a: Node; b: Node }
  | { k: 'func'; name: string; a: Node }
  | { k: 'deriv'; a: Node }; // pseudo-nodo usado por la derivada

export interface Step {
  rule: string; // nombre de la regla / acción aplicada
  formula?: string; // forma general o aclaración (texto plano)
  mathml: string; // expresión completa en este punto de la resolución
}

export const FUNCS = new Set([
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
    if (/[a-zA-Z]/.test(c)) {
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
export function parse(src: string, varName: string): Node {
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
      const exp = parseUnary();
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
export const num = (v: number): Node => ({ k: 'num', v });
export const ZERO = num(0);
export const ONE = num(1);

export function dependsOnVar(n: Node): boolean {
  switch (n.k) {
    case 'var': return true;
    case 'num': case 'const': case 'param': return false;
    case 'neg': case 'deriv': case 'func': return dependsOnVar(n.a);
    default: return dependsOnVar((n as any).a) || dependsOnVar((n as any).b);
  }
}

export function equalNode(a: Node, b: Node): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case 'num': return a.v === (b as any).v;
    case 'const': case 'var': case 'param': return a.name === (b as any).name;
    case 'func': return a.name === (b as any).name && equalNode(a.a, (b as any).a);
    case 'neg': case 'deriv': return equalNode(a.a, (b as any).a);
    default: return equalNode((a as any).a, (b as any).a) && equalNode((a as any).b, (b as any).b);
  }
}

// ── Simplificación (conservadora, suficiente para resultados limpios) ────────
export function simplify(n: Node): Node {
  switch (n.k) {
    case 'num': case 'const': case 'var': case 'param': case 'deriv':
      return n;
    case 'neg': {
      const a = simplify(n.a);
      if (a.k === 'num') return num(-a.v);
      if (a.k === 'neg') return a.a;
      return { k: 'neg', a };
    }
    case 'func': return { k: 'func', name: n.name, a: simplify(n.a) };
    case 'add': {
      const a = simplify(n.a), b = simplify(n.b);
      if (a.k === 'num' && a.v === 0) return b;
      if (b.k === 'num' && b.v === 0) return a;
      if (a.k === 'num' && b.k === 'num') return num(a.v + b.v);
      if (b.k === 'neg') return simplify({ k: 'sub', a, b: b.a });
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
      const factors: Node[] = [];
      const flatten = (x: Node) => {
        if (x.k === 'mul') { flatten(x.a); flatten(x.b); }
        else if (x.k === 'neg') { factors.push(num(-1)); flatten(x.a); }
        else factors.push(x);
      };
      flatten(a); flatten(b);
      let coeff = 1;
      const rest: Node[] = [];
      for (const f of factors) {
        if (f.k === 'num') coeff *= f.v;
        else rest.push(f);
      }
      if (coeff === 0) return ZERO;
      const numers: Node[] = [];
      const denoms: Node[] = [];
      for (const f of rest) {
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
      if (b.k === 'num' && b.v === 1) return a;
      if (b.k === 'num' && b.v === 0) return ONE;
      if (a.k === 'num' && b.k === 'num') {
        const r = Math.pow(a.v, b.v);
        if (Number.isInteger(r) && Math.abs(r) < 1e15) return num(r);
      }
      return { k: 'pow', a, b };
    }
  }
}

export function simplifyFully(n: Node): Node {
  let cur = n;
  for (let i = 0; i < 8; i++) {
    const next = simplify(cur);
    if (equalNode(next, cur)) break;
    cur = next;
  }
  return cur;
}

// ── Render MathML (presentación) ─────────────────────────────────────────────
export function prec(n: Node): number {
  switch (n.k) {
    case 'add': case 'sub': return 1;
    case 'mul': case 'div': return 2;
    case 'neg': return 2;
    case 'pow': return 3;
    case 'deriv': return 2;
    default: return 4;
  }
}

export const FUNC_MML: Record<string, string> = {
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
  asin: 'arcsin', acos: 'arccos', atan: 'arctan',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', sech: 'sech',
  ln: 'ln', log: 'log', exp: 'exp',
};

export function paren(inner: string): string {
  return `<mo>(</mo>${inner}<mo>)</mo>`;
}

export function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
}

export function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toPrecision(10)));
}

export function mml(n: Node, varName: string): string {
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
      const aSimple = n.a.k === 'num' || n.a.k === 'const' || n.a.k === 'param';
      const bAtomish = n.b.k === 'var' || n.b.k === 'pow' || n.b.k === 'func' || n.b.k === 'const' || n.b.k === 'param';
      const sep = aSimple && bAtomish ? '<mo>&#x2062;</mo>' : '<mo>&#x22C5;</mo>';
      return `<mrow>${wrap(n.a, 2, varName)}${sep}${wrap(n.b, 2, varName)}</mrow>`;
    }
    case 'div':
      return `<mfrac>${frac(n.a, varName)}${frac(n.b, varName)}</mfrac>`;
    case 'pow': {
      const base = n.a.k === 'func' ? mml(n.a, varName) : wrap(n.a, 4, varName);
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

export function wrap(n: Node, minPrec: number, varName: string): string {
  const inner = mml(n, varName);
  if (prec(n) < minPrec) return `<mrow>${paren(inner)}</mrow>`;
  return inner;
}

export function frac(n: Node, varName: string): string {
  return `<mrow>${mml(n, varName)}</mrow>`;
}

export function wrapMath(content: string): string {
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${content}</math>`;
}

// ── Texto plano (aria-label, copiar, fallback) ───────────────────────────────
export function toText(n: Node, varName: string): string {
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

export function ptxt(n: Node, minPrec: number, varName: string): string {
  const t = toText(n, varName);
  return prec(n) < minPrec ? `(${t})` : t;
}

// ── Render de "resolución paso a paso" (compartido entre calculadoras) ────────
// El HTML se inyecta con set:html, así que las clases tienen que estar en :global()
// dentro del <style> de la página. La MathML ya es nuestra (confiable).
export interface SolutionView {
  ok: boolean;
  error?: string;
  headerMathml?: string; // línea superior (f(x)=… o la ecuación original)
  steps: Step[];
  resultMathml?: string; // resultado destacado
  resultText?: string; // texto para el botón Copiar
  copyLabel?: string;
}

export function renderSolution(v: SolutionView): string {
  if (!v.ok) {
    return `<p class="dv-error" role="alert">⚠️ ${esc(v.error || 'No pude resolver la expresión.')}</p>`;
  }
  const header = v.headerMathml ? `<div class="dv-input-line">${v.headerMathml}</div>` : '';
  const stepsHtml = v.steps
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
  const result = v.resultMathml
    ? `<div class="dv-result"><span class="dv-result-label">Resultado</span>` +
      `<div class="dv-result-math">${v.resultMathml}</div>` +
      (v.resultText
        ? `<button type="button" class="dv-copy" data-copy="${esc(v.resultText)}" title="${esc(v.copyLabel || 'Copiar resultado')}">📋 Copiar</button>`
        : '') +
      `</div>`
    : '';
  return header + `<ol class="dv-steps">${stepsHtml}</ol>` + result;
}
