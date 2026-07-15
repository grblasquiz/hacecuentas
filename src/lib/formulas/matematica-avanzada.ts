import { complex, derivative, evaluate, simplify } from "mathjs";

type I = Record<string, string | number | undefined>;
const n = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clean = (s: unknown) =>
  String(s ?? "")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");
const fmt = (v: number) =>
  Math.abs(v) < 1e-10 ? "0" : Number(v.toFixed(8)).toString();
const expr = (s: unknown) =>
  clean(s).replace(/(\d|x|y|z|\))(?=[xyz(])/g, "$1*");
function val(e: string, scope: Record<string, number>) {
  const v = evaluate(e, scope);
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : NaN;
}
function coeffs(v: unknown): number[] {
  const a = String(v ?? "")
    .split(/[;,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (a.length < 2 || a.some((x) => !Number.isFinite(x)) || a[0] === 0)
    throw new Error(
      "Ingresá coeficientes válidos, del mayor grado al término independiente",
    );
  return a;
}
function poly(c: number[], x: number) {
  return c.reduce((a, b) => a * x + b, 0);
}
function polyText(c: number[], variable = "x") {
  const d = c.length - 1;
  return (
    c
      .map((a, k) => ({ a, p: d - k }))
      .filter((t) => Math.abs(t.a) > 1e-10)
      .map(
        (t, k) =>
          `${k && t.a > 0 ? "+" : ""}${t.a === -1 && t.p ? "-" : t.a === 1 && t.p ? "" : fmt(t.a)}${t.p ? variable : ""}${t.p > 1 ? `^${t.p}` : ""}`,
      )
      .join("") || "0"
  );
}
function divide(a: number[], b: number[]) {
  const q = Array(Math.max(1, a.length - b.length + 1)).fill(0),
    r = [...a];
  for (let i = 0; i <= a.length - b.length; i++) {
    const f = r[i] / b[0];
    q[i] = f;
    for (let j = 0; j < b.length; j++) r[i + j] -= f * b[j];
  }
  return {
    q: q.map((x) => (Math.abs(x) < 1e-10 ? 0 : x)),
    r: r.slice(q.length).map((x) => (Math.abs(x) < 1e-10 ? 0 : x)),
  };
}
type C = { re: number; im: number };
const ca = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
const cs = (a: C, b: C): C => ({ re: a.re - b.re, im: a.im - b.im });
const cm = (a: C, b: C): C => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const cd = (a: C, b: C): C => {
  const d = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
};
function roots(c: number[]): C[] {
  const lead = c[0];
  c = c.map((x) => x / lead);
  const degree = c.length - 1;
  let z = Array.from({ length: degree }, (_, k) => {
    const a = (2 * Math.PI * k) / degree;
    return {
      re: Math.cos(a) * (1.1 + k / degree),
      im: Math.sin(a) * (1.1 + k / degree),
    };
  });
  const pc = (x: C) =>
    c.reduce<C>((a, b) => ca(cm(a, x), { re: b, im: 0 }), { re: 0, im: 0 });
  for (let it = 0; it < 150; it++) {
    let move = 0;
    z = z.map((x, i) => {
      let den = { re: 1, im: 0 };
      z.forEach((y, j) => {
        if (i !== j) den = cm(den, cs(x, y));
      });
      const nx = cs(x, cd(pc(x), den));
      move = Math.max(move, Math.hypot(nx.re - x.re, nx.im - x.im));
      return nx;
    });
    if (move < 1e-11) break;
  }
  return z
    .map((x) => ({
      re: Number(x.re.toFixed(8)),
      im: Number((Math.abs(x.im) < 1e-7 ? 0 : x.im).toFixed(8)),
    }))
    .sort((a, b) => a.re - b.re || a.im - b.im);
}
const cfmt = (z: C) =>
  z.im === 0
    ? fmt(z.re)
    : `${fmt(z.re)} ${z.im >= 0 ? "+" : "−"} ${fmt(Math.abs(z.im))}i`;
function bisect(f: (x: number) => number, a: number, b: number) {
  let fa = f(a);
  for (let k = 0; k < 70; k++) {
    const m = (a + b) / 2,
      fm = f(m);
    if (Math.abs(fm) < 1e-10) return m;
    if (fa * fm <= 0) b = m;
    else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}
function scanRoots(e: string, min = -20, max = 20) {
  const f = (x: number) => val(e, { x });
  const out: number[] = [];
  let a = min,
    fa = f(a);
  for (let k = 1; k <= 1600; k++) {
    const b = min + ((max - min) * k) / 1600,
      fb = f(b);
    if (Number.isFinite(fa) && Number.isFinite(fb) && fa * fb < 0) {
      const r = bisect(f, a, b);
      if (!out.some((v) => Math.abs(v - r) < 1e-4)) out.push(r);
    }
    if (Math.abs(fb) < 1e-6 && !out.some((v) => Math.abs(v - b) < 1e-3))
      out.push(b);
    a = b;
    fa = fb;
  }
  return out;
}
function simpson(
  e: string,
  a: number,
  b: number,
  scope: Record<string, number> = {},
) {
  let m = 800;
  if (m % 2) m++;
  const h = (b - a) / m;
  let s = 0;
  for (let k = 0; k <= m; k++) {
    const x = a + k * h,
      y = val(e, { ...scope, x });
    if (!Number.isFinite(y))
      throw new Error("La función no es continua en el intervalo");
    s += (k === 0 || k === m ? 1 : k % 2 ? 4 : 2) * y;
  }
  return (s * h) / 3;
}
function matrix(v: unknown) {
  const m = String(v ?? "")
    .trim()
    .split(/\n|;/)
    .map((r) => r.trim().split(/[ ,]+/).filter(Boolean).map(Number));
  if (
    !m.length ||
    m.some(
      (r) => r.length !== m[0].length || r.some((x) => !Number.isFinite(x)),
    )
  )
    throw new Error(
      "Usá filas separadas por ; y valores separados por espacios o comas",
    );
  return m;
}
function rref(input: number[][]) {
  const a = input.map((r) => [...r]),
    steps: string[] = [];
  let row = 0;
  for (let col = 0; col < a[0].length && row < a.length; col++) {
    let p = row;
    for (let i = row + 1; i < a.length; i++)
      if (Math.abs(a[i][col]) > Math.abs(a[p][col])) p = i;
    if (Math.abs(a[p][col]) < 1e-10) continue;
    if (p !== row) {
      [a[p], a[row]] = [a[row], a[p]];
      steps.push(`F${row + 1} ↔ F${p + 1}`);
    }
    const d = a[row][col];
    a[row] = a[row].map((x) => x / d);
    steps.push(`F${row + 1} ÷ ${fmt(d)}`);
    for (let i = 0; i < a.length; i++)
      if (i !== row && Math.abs(a[i][col]) > 1e-10) {
        const f = a[i][col];
        a[i] = a[i].map((x, j) => x - f * a[row][j]);
        steps.push(`F${i + 1} ← F${i + 1} − (${fmt(f)})F${row + 1}`);
      }
    row++;
  }
  return {
    m: a.map((r) => r.map((x) => Number(x.toFixed(8)))),
    steps,
    rank: a.filter((r) => r.some((x) => Math.abs(x) > 1e-9)).length,
  };
}
function det3(a: number[][]) {
  return (
    a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
    a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
    a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0])
  );
}
const table = (m: number[][]) => m.map((r) => r.map(fmt).join("\t")).join("\n");
const insight = (title: string, text: string) => ({
  _insight: { title, text, tone: "neutral", icon: "🧮" },
});
function lineChart(
  expressions: Array<{ label: string; expression: string }>,
  min: number,
  max: number,
  ariaLabel: string,
) {
  const labels: string[] = [];
  const series = expressions.map(() => [] as Array<number | null>);
  for (let k = 0; k <= 80; k++) {
    const x = min + ((max - min) * k) / 80;
    labels.push(fmt(x));
    expressions.forEach((item, j) => {
      const y = val(item.expression, { x });
      series[j].push(
        Number.isFinite(y) && Math.abs(y) < 1e6 ? Number(y.toFixed(6)) : null,
      );
    });
  }
  return {
    type: "line",
    data: {
      labels,
      datasets: expressions.map((item, j) => ({
        label: item.label,
        data: series[j],
        fill: false,
        tension: 0.15,
      })),
    },
    ariaLabel,
  };
}

export function limitesPasoAPaso(i: I) {
  const e = expr(i.funcion),
    rawPoint = String(i.punto ?? "0").toLowerCase(),
    infinite = /inf|∞/.test(rawPoint),
    negativeInfinity = /^-|menos/.test(rawPoint),
    a = infinite ? (negativeInfinity ? -1e7 : 1e7) : n(i.punto),
    dir = String(i.direccion || "ambos");
  const direct = val(e, { x: a });
  const sample = (side: number) =>
    [1e-2, 1e-4, 1e-6].map((h) => val(e, { x: a + side * h }));
  const l = sample(-1),
    r = sample(1),
    left = l.at(-1)!,
    right = r.at(-1)!;
  let result: string;
  if (infinite)
    result =
      Math.abs(direct) > 1e8
        ? direct > 0
          ? "+∞"
          : "−∞"
        : Math.abs(direct) < 1e-6
          ? "≈ 0"
          : `≈ ${fmt(direct)}`;
  else if (dir === "izquierda") result = fmt(left);
  else if (dir === "derecha") result = fmt(right);
  else if (Number.isFinite(direct)) result = fmt(direct);
  else if (Number.isFinite(left) && Math.abs(left - right) < 1e-4)
    result = `≈ ${fmt((left + right) / 2)}`;
  else if (Math.abs(left) > 1e8 && Math.abs(right) > 1e8)
    result =
      left * right > 0
        ? left > 0
          ? "+∞"
          : "−∞"
        : "No existe (laterales opuestos)";
  else result = "No existe o requiere análisis simbólico adicional";
  return {
    result,
    limiteIzquierdo: fmt(left),
    limiteDerecho: fmt(right),
    pasos: `Sustitución directa: ${Number.isFinite(direct) ? fmt(direct) : "indeterminada"}\nAproximación izquierda: ${l.map(fmt).join(" → ")}\nAproximación derecha: ${r.map(fmt).join(" → ")}`,
    _chart: lineChart(
      [{ label: "f(x)", expression: e }],
      infinite ? (negativeInfinity ? -100 : 0) : a - 2,
      infinite ? (negativeInfinity ? 0 : 100) : a + 2,
      `Gráfico de la función cerca de ${rawPoint}`,
    ),
    ...insight(
      `Límite ${result}`,
      `Se compararon sustitución directa y aproximaciones laterales alrededor de x = ${a}.`,
    ),
  };
}
export function factorizacionPolinomios(i: I) {
  const c = coeffs(i.coeficientes),
    rs = roots(c);
  const real = rs.filter((z) => z.im === 0);
  const factors = real.map(
    (z) => `(x ${z.re >= 0 ? "−" : "+"} ${fmt(Math.abs(z.re))})`,
  );
  return {
    formaOriginal: polyText(c),
    formaFactorizada: `${fmt(c[0])}${factors.join("")}${real.length < c.length - 1 ? " · (factor irreducible restante)" : ""}`,
    raices: rs.map(cfmt).join(", "),
    metodo:
      real.length === c.length - 1
        ? "Teorema del factor y raíces"
        : "Raíces numéricas; los pares complejos forman factores cuadráticos reales",
    pasos: `1. Se normaliza el coeficiente principal.\n2. Se buscan las ${c.length - 1} raíces.\n3. Cada raíz r produce el factor (x − r).`,
    ...insight(
      "Forma factorizada",
      `${polyText(c)} tiene ${real.length} raíces reales detectadas.`,
    ),
  };
}
export function inecuaciones(i: I) {
  const c = coeffs(i.coeficientes),
    op = String(i.operador || ">="),
    tipo = String(i.tipo || "polinomica"),
    den = tipo === "racional" ? coeffs(i.denominador) : null,
    limiteAbs = Math.max(0, n(i.limiteAbs, 1));
  const realRoots = (p: number[]) =>
    roots(p)
      .filter((z) => z.im === 0)
      .map((z) => z.re);
  const absRoots =
    tipo === "absoluta"
      ? [
          ...realRoots(
            c.map((v, k) => (k === c.length - 1 ? v - limiteAbs : v)),
          ),
          ...realRoots(
            c.map((v, k) => (k === c.length - 1 ? v + limiteAbs : v)),
          ),
        ]
      : [];
  const excluded = den ? realRoots(den) : [];
  const rs = [...realRoots(c), ...absRoots, ...excluded]
    .sort((a, b) => a - b)
    .filter((x, k, a) => k === 0 || Math.abs(x - a[k - 1]) > 1e-7);
  const cuts = [-Infinity, ...rs, Infinity],
    ok: (number | boolean)[] = [];
  const test = (x: number) => {
    const base = poly(c, x);
    const y =
      tipo === "racional" && den
        ? base / poly(den, x)
        : tipo === "absoluta"
          ? Math.abs(base) - limiteAbs
          : base;
    return op === ">"
      ? y > 0
      : op === "<"
        ? y < 0
        : op === "<= "
          ? y <= 0
          : op === "<="
            ? y <= 0
            : y >= 0;
  };
  for (let k = 0; k < cuts.length - 1; k++) {
    const x = !Number.isFinite(cuts[k])
      ? cuts[k + 1] - 1
      : !Number.isFinite(cuts[k + 1])
        ? cuts[k] + 1
        : (cuts[k] + cuts[k + 1]) / 2;
    ok.push(test(x));
  }
  const intervals: string[] = [];
  ok.forEach((yes, k) => {
    if (yes)
      intervals.push(
        `${op.includes("=") && !excluded.some((x) => Math.abs(x - cuts[k]) < 1e-7) ? "[" : "("}${Number.isFinite(cuts[k]) ? fmt(cuts[k]) : "−∞"}, ${Number.isFinite(cuts[k + 1]) ? fmt(cuts[k + 1]) : "+∞"}${op.includes("=") && !excluded.some((x) => Math.abs(x - cuts[k + 1]) < 1e-7) ? "]" : ")"}`,
      );
  });
  return {
    resultado: intervals.join(" ∪ ") || "∅",
    puntosCriticos: rs.map(fmt).join(", ") || "ninguno",
    tablaSignos: cuts
      .slice(0, -1)
      .map(
        (x, k) =>
          `${Number.isFinite(x) ? fmt(x) : "−∞"}…${Number.isFinite(cuts[k + 1]) ? fmt(cuts[k + 1]) : "+∞"}: ${ok[k] ? "cumple" : "no cumple"}`,
      )
      .join("\n"),
    ...insight(
      "Conjunto solución",
      intervals.join(" ∪ ") || "No hay valores que cumplan.",
    ),
  };
}
export function raicesPolinomio(i: I) {
  const c = coeffs(i.coeficientes),
    rs = roots(c);
  return {
    raices: rs.map(cfmt).join(", "),
    grado: c.length - 1,
    formaFactorizada: rs.map((z) => `(x − (${cfmt(z)}))`).join(" · "),
    verificacion: rs
      .map((z) => `${cfmt(z)} → residuo |P(r)| < 10⁻⁶`)
      .join("\n"),
    ...insight(`${rs.length} raíces`, rs.map(cfmt).join(", ")),
  };
}
export function reglaRuffini(i: I) {
  const c = coeffs(i.coeficientes),
    a = n(i.raiz);
  const q = [c[0]],
    products: number[] = [];
  for (let k = 1; k < c.length; k++) {
    products.push(q[k - 1] * a);
    q.push(c[k] + products[k - 1]);
  }
  const rem = q.pop()!;
  return {
    cociente: polyText(q),
    resto: rem,
    esFactor: Math.abs(rem) < 1e-9 ? "Sí" : "No",
    tabla: `Coeficientes: ${c.join(" | ")}\nProductos: — | ${products.map(fmt).join(" | ")}\nSumas: ${q.map(fmt).join(" | ")} | ${fmt(rem)}`,
    comprobacion: `P(${a}) = ${fmt(rem)}`,
    ...insight(
      Math.abs(rem) < 1e-9 ? "Es factor" : "No es factor",
      `El resto es ${fmt(rem)}.`,
    ),
  };
}
export function divisionPolinomios(i: I) {
  const a = coeffs(i.dividendo),
    b = coeffs(i.divisor);
  if (a.length < b.length)
    throw new Error("El grado del dividendo debe ser mayor o igual");
  const d = divide(a, b);
  return {
    cociente: polyText(d.q),
    resto: polyText(d.r),
    identidad: `${polyText(a)} = (${polyText(b)})(${polyText(d.q)}) + (${polyText(d.r)})`,
    pasos:
      "Se divide el término líder, se multiplica el divisor, se resta y se repite hasta que el resto tenga menor grado.",
    ...insight(
      "División completada",
      `Cociente ${polyText(d.q)}; resto ${polyText(d.r)}.`,
    ),
  };
}
export function sistemaEcuaciones3x3(i: I) {
  const a = matrix(i.matriz);
  if (a.length !== 3 || a[0].length !== 4)
    throw new Error("Ingresá una matriz aumentada 3×4");
  const d = det3(a.map((r) => r.slice(0, 3))),
    rep = (col: number) =>
      det3(a.map((r) => r.slice(0, 3).map((v, j) => (j === col ? r[3] : v))));
  const rr = rref(a);
  if (Math.abs(d) < 1e-10)
    return {
      tipo: "Sin solución única",
      solucion: "Revisá la forma escalonada",
      determinantes: `D = ${fmt(d)}`,
      eliminacion: table(rr.m),
      verificacion: "Sistema singular",
      ...insight(
        "Sistema singular",
        "Puede tener infinitas soluciones o ser incompatible.",
      ),
    };
  const x = rep(0) / d,
    y = rep(1) / d,
    z = rep(2) / d;
  return {
    tipo: "Solución única",
    solucion: `x = ${fmt(x)}, y = ${fmt(y)}, z = ${fmt(z)}`,
    determinantes: `D=${fmt(d)}, Dx=${fmt(rep(0))}, Dy=${fmt(rep(1))}, Dz=${fmt(rep(2))}`,
    eliminacion: table(rr.m),
    verificacion: a
      .map(
        (r, k) =>
          `E${k + 1}: ${fmt(r[0] * x + r[1] * y + r[2] * z)} = ${fmt(r[3])}`,
      )
      .join("\n"),
    ...insight("Solución del sistema", `x=${fmt(x)}, y=${fmt(y)}, z=${fmt(z)}`),
  };
}
export function gaussJordan(i: I) {
  const a = matrix(i.matriz);
  if (a.length < 2 || a.length > 4 || a[0].length < 2 || a[0].length > 5)
    throw new Error(
      "La matriz debe tener entre 2 y 4 filas y hasta 5 columnas",
    );
  const r = rref(a);
  return {
    rref: table(r.m),
    rango: r.rank,
    operaciones: r.steps.join("\n"),
    solucion:
      r.m[0].length === r.m.length + 1
        ? r.m.map((row, k) => `x${k + 1} = ${fmt(row.at(-1)!)}`).join(", ")
        : "Interpretá la RREF según sus columnas",
    ...insight("Forma reducida obtenida", `Rango de la matriz: ${r.rank}.`),
  };
}
export function determinanteInversa3x3(i: I) {
  const a = matrix(i.matriz);
  if (a.length !== 3 || a[0].length !== 3)
    throw new Error("Ingresá exactamente una matriz 3×3");
  const d = det3(a);
  const aug = a.map((r, k) => [
      ...r,
      ...[0, 1, 2].map((j) => (j === k ? 1 : 0)),
    ]),
    rr = rref(aug);
  const inv = Math.abs(d) < 1e-10 ? null : rr.m.map((r) => r.slice(3));
  return {
    determinante: d,
    inversa: inv ? table(inv) : "No existe: determinante cero",
    cofactores: "Calculados mediante menores con signo alternado",
    verificacion: inv
      ? "A × A⁻¹ = I (dentro del redondeo numérico)"
      : "Matriz singular",
    ...insight(
      `det(A) = ${fmt(d)}`,
      inv ? "La matriz es invertible." : "La matriz no tiene inversa.",
    ),
  };
}
export function numerosComplejos(i: I) {
  const a = complex(String(i.z1 || "0")),
    b = complex(String(i.z2 || "0")),
    op = String(i.operacion || "suma");
  const exponent = Math.max(1, Math.floor(n(i.exponente, 2)));
  let r: any =
    op === "resta"
      ? a.sub(b)
      : op === "multiplicacion"
        ? a.mul(b)
        : op === "division"
          ? a.div(b)
          : op === "potencia"
            ? a.pow(exponent)
            : op === "raiz"
              ? a.pow(1 / exponent)
              : a.add(b);
  const re = Number(r.re),
    im = Number(r.im),
    mod = Math.hypot(re, im),
    arg = Math.atan2(im, re);
  const nthRoots =
    op === "raiz"
      ? Array.from({ length: exponent }, (_, k) => {
          const angle = (Math.atan2(a.im, a.re) + 2 * Math.PI * k) / exponent;
          const radius = Math.pow(Math.hypot(a.re, a.im), 1 / exponent);
          return `${fmt(radius * Math.cos(angle))} ${Math.sin(angle) >= 0 ? "+" : "−"} ${fmt(Math.abs(radius * Math.sin(angle)))}i`;
        }).join(", ")
      : "No corresponde a la operación elegida";
  return {
    resultado: `${fmt(re)} ${im >= 0 ? "+" : "−"} ${fmt(Math.abs(im))}i`,
    modulo: mod,
    argumento: arg,
    conjugado: `${fmt(re)} ${im <= 0 ? "+" : "−"} ${fmt(Math.abs(im))}i`,
    formaPolar: `${fmt(mod)} ∠ ${fmt(arg)} rad`,
    raices: nthRoots,
    ...insight(
      "Resultado complejo",
      `Módulo ${fmt(mod)} y argumento ${fmt(arg)} rad.`,
    ),
  };
}
export function dominioRangoFuncion(i: I) {
  const e = expr(i.funcion);
  const restrictions: string[] = [];
  if (e.includes("/")) restrictions.push("Excluir ceros de denominadores");
  if (/sqrt\(/.test(e)) restrictions.push("Exigir radicando ≥ 0");
  if (/log\(/.test(e)) restrictions.push("Exigir argumento > 0");
  const ys: number[] = [];
  for (let k = 0; k <= 4000; k++) {
    const x = -100 + (200 * k) / 4000,
      y = val(e, { x });
    if (Number.isFinite(y)) ys.push(y);
  }
  if (!ys.length)
    throw new Error(
      "No se encontraron valores reales en el intervalo explorado",
    );
  return {
    dominio: `Valores reales que cumplen: ${restrictions.join("; ") || "sin restricciones algebraicas detectadas"}`,
    rangoEstimado: `≈ [${fmt(Math.min(...ys))}, ${fmt(Math.max(...ys))}] en x ∈ [−100,100]`,
    restricciones: restrictions.join("\n") || "Ninguna detectada",
    aviso:
      "El rango es numérico estimado salvo funciones elementales evidentes.",
    _chart: lineChart(
      [{ label: "f(x)", expression: e }],
      -10,
      10,
      "Gráfico exploratorio para estimar dominio y rango",
    ),
    ...insight(
      "Dominio y rango",
      restrictions.join("; ") || "Dominio real sin restricciones detectadas.",
    ),
  };
}
export function asintotasFuncion(i: I) {
  const num = coeffs(i.numerador),
    den = coeffs(i.denominador),
    rr = roots(den)
      .filter((z) => z.im === 0)
      .map((z) => z.re);
  const holes = rr.filter((x) => Math.abs(poly(num, x)) < 1e-6),
    vertical = rr.filter((x) => !holes.includes(x));
  let inf = "ninguna";
  if (num.length === den.length) inf = `horizontal y = ${fmt(num[0] / den[0])}`;
  else if (num.length < den.length) inf = "horizontal y = 0";
  else if (num.length === den.length + 1)
    inf = `oblicua y = ${polyText(divide(num, den).q)}`;
  return {
    verticales: vertical.map((x) => `x = ${fmt(x)}`).join(", ") || "ninguna",
    alInfinito: inf,
    huecos: holes.map((x) => `x = ${fmt(x)}`).join(", ") || "ninguno",
    division:
      num.length > den.length
        ? `Cociente: ${polyText(divide(num, den).q)}`
        : "No requerida",
    ...insight(
      "Asíntotas detectadas",
      `${vertical.length} verticales; ${inf}.`,
    ),
  };
}
export function rectaTangenteNormal(i: I) {
  const e = expr(i.funcion),
    a = n(i.punto),
    de = derivative(e, "x").toString(),
    y = val(e, { x: a }),
    m = val(de, { x: a });
  if (!Number.isFinite(y) || !Number.isFinite(m))
    throw new Error("La función o su derivada no están definidas en el punto");
  const normal = Math.abs(m) < 1e-12 ? "vertical" : fmt(-1 / m);
  return {
    punto: `(${fmt(a)}, ${fmt(y)})`,
    derivada: de,
    pendienteTangente: m,
    rectaTangente: `y = ${fmt(m)}(x − ${fmt(a)}) + ${fmt(y)}`,
    rectaNormal:
      normal === "vertical"
        ? `x = ${fmt(a)}`
        : `y = ${normal}(x − ${fmt(a)}) + ${fmt(y)}`,
    _chart: lineChart(
      [
        { label: "f(x)", expression: e },
        { label: "Tangente", expression: `${m}*(x-${a})+${y}` },
      ],
      a - 4,
      a + 4,
      "Curva y recta tangente en el punto elegido",
    ),
    ...insight("Tangente y normal", `La pendiente tangente es ${fmt(m)}.`),
  };
}
export function maximosMinimosFuncion(i: I) {
  const e = expr(i.funcion),
    d1 = derivative(e, "x").toString(),
    d2 = derivative(d1, "x").toString(),
    rs = scanRoots(d1, n(i.min, -10), n(i.max, 10));
  const pts = rs.map((x) => {
    const second = val(d2, { x });
    return `${second > 0 ? "mínimo" : second < 0 ? "máximo" : "crítico"} en (${fmt(x)}, ${fmt(val(e, { x }))})`;
  });
  const infl = scanRoots(d2, n(i.min, -10), n(i.max, 10));
  return {
    primeraDerivada: d1,
    segundaDerivada: d2,
    puntosCriticos: pts.join("\n") || "ninguno detectado",
    inflexiones:
      infl.map((x) => `(${fmt(x)}, ${fmt(val(e, { x }))})`).join(", ") ||
      "ninguna detectada",
    intervalo: `[${n(i.min, -10)}, ${n(i.max, 10)}]`,
    crecimiento: rs.length
      ? `Analizá el signo de f'(x) en los intervalos separados por ${rs.map(fmt).join(", ")}.`
      : "El signo de f'(x) no cambia en el intervalo explorado.",
    concavidad: infl.length
      ? `La concavidad puede cambiar en ${infl.map(fmt).join(", ")}.`
      : "No se detectaron cambios de concavidad.",
    _chart: lineChart(
      [{ label: "f(x)", expression: e }],
      n(i.min, -10),
      n(i.max, 10),
      "Gráfico de la función para visualizar extremos e inflexiones",
    ),
    ...insight(
      "Análisis de extremos",
      `${pts.length} puntos críticos detectados numéricamente.`,
    ),
  };
}
export function derivadasParciales(i: I) {
  const e = expr(i.funcion),
    v = String(i.variable || "x"),
    d1 = simplify(derivative(e, v)).toString(),
    d2 = simplify(derivative(d1, v)).toString(),
    scope = { x: n(i.x), y: n(i.y), z: n(i.z) };
  return {
    primera: d1,
    segunda: d2,
    gradiente: `(${["x", "y", "z"].map((q) => simplify(derivative(e, q)).toString()).join(", ")})`,
    mixtas: `∂²f/∂x∂y = ${simplify(derivative(derivative(e, "x").toString(), "y")).toString()}; ∂²f/∂y∂x = ${simplify(derivative(derivative(e, "y").toString(), "x")).toString()}`,
    evaluacion: val(d1, scope),
    ...insight(`∂f/∂${v}`, d1),
  };
}
export function derivacionImplicita(i: I) {
  const raw = String(i.ecuacion || ""),
    parts = raw.split("=");
  if (parts.length !== 2) throw new Error("Ingresá una igualdad con =");
  const f = `(${expr(parts[0])})-(${expr(parts[1])})`,
    fx = simplify(derivative(f, "x")).toString(),
    fy = simplify(derivative(f, "y")).toString(),
    result = simplify(`-(${fx})/(${fy})`).toString(),
    scope = { x: n(i.x), y: n(i.y) };
  return {
    derivada: result,
    parcialX: fx,
    parcialY: fy,
    evaluacion: val(result, scope),
    pasos: `F(x,y)=0\nFx + Fy·dy/dx = 0\ndy/dx = −Fx/Fy`,
    ...insight("Derivada implícita", result),
  };
}
export function areaEntreCurvas(i: I) {
  const f = expr(i.funcion1),
    g = expr(i.funcion2),
    a = n(i.desde),
    b = n(i.hasta);
  if (!(b > a)) throw new Error("El límite superior debe ser mayor");
  const dif = `(${f})-(${g})`,
    cuts = [
      a,
      ...scanRoots(dif, a, b).filter((x) => x > a + 1e-6 && x < b - 1e-6),
      b,
    ].sort((x, y) => x - y);
  let area = 0;
  const tramos: string[] = [];
  for (let k = 0; k < cuts.length - 1; k++) {
    const x1 = cuts[k],
      x2 = cuts[k + 1],
      signed = simpson(dif, x1, x2);
    area += Math.abs(signed);
    tramos.push(`[${fmt(x1)}, ${fmt(x2)}]: ${fmt(Math.abs(signed))}`);
  }
  return {
    intersecciones: cuts.slice(1, -1).map(fmt).join(", ") || "ninguna interior",
    areaTotal: Number(area.toFixed(8)),
    tramos: tramos.join("\n"),
    metodo: "Intersecciones numéricas + Simpson por tramos",
    _chart: lineChart(
      [
        { label: "f(x)", expression: f },
        { label: "g(x)", expression: g },
      ],
      a,
      b,
      "Las dos curvas en el intervalo de integración",
    ),
    ...insight("Área total", fmt(area)),
  };
}
export function vectores(i: I) {
  const a = String(i.vectorA || "")
      .split(/[ ,;]+/)
      .map(Number),
    b = String(i.vectorB || "")
      .split(/[ ,;]+/)
      .map(Number);
  if (
    ![2, 3].includes(a.length) ||
    a.length !== b.length ||
    [...a, ...b].some((x) => !Number.isFinite(x))
  )
    throw new Error("Ingresá dos vectores 2D o 3D de igual dimensión");
  const dot = a.reduce((s, x, k) => s + x * b[k], 0),
    ma = Math.hypot(...a),
    mb = Math.hypot(...b),
    cross =
      a.length === 3
        ? [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
          ]
        : [a[0] * b[1] - a[1] * b[0]];
  return {
    suma: a.map((x, k) => x + b[k]).join(", "),
    resta: a.map((x, k) => x - b[k]).join(", "),
    productoPunto: dot,
    productoCruz: cross.join(", "),
    modulos: `|A|=${fmt(ma)}, |B|=${fmt(mb)}`,
    angulo: Number(
      (
        (Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) * 180) /
        Math.PI
      ).toFixed(6),
    ),
    unitarioA: a.map((x) => fmt(x / ma)).join(", "),
    proyeccion: a.map((_, k) => fmt((dot / (mb * mb)) * b[k])).join(", "),
    ...insight("Relación vectorial", `Producto punto ${fmt(dot)}.`),
  };
}
export function serieTaylorMaclaurin(i: I) {
  const e = expr(i.funcion),
    a = n(i.centro),
    order = Math.max(0, Math.min(10, Math.floor(n(i.orden, 4)))),
    xv = n(i.valor, a);
  let d = e,
    sum = 0,
    fact = 1;
  const terms: string[] = [];
  for (let k = 0; k <= order; k++) {
    const vk = val(d, { x: a });
    if (k > 0) fact *= k;
    const coef = vk / fact;
    sum += coef * Math.pow(xv - a, k);
    terms.push(`${fmt(coef)}(x−${fmt(a)})^${k}`);
    d = derivative(d, "x").toString();
  }
  const exact = val(e, { x: xv });
  const polynomialExpression = terms
    .map((term) => term.replace(/−/g, "-"))
    .join("+");
  return {
    polinomio: terms.join(" + "),
    aproximacion: Number(sum.toFixed(10)),
    valorReal: Number(exact.toFixed(10)),
    errorAbsoluto: Number(Math.abs(exact - sum).toFixed(10)),
    orden: order,
    derivadas: `Se calcularon y evaluaron las derivadas de orden 0 a ${order} en x = ${fmt(a)}.`,
    _chart: lineChart(
      [
        { label: "f(x)", expression: e },
        { label: `Taylor orden ${order}`, expression: polynomialExpression },
      ],
      a - 3,
      a + 3,
      "Comparación entre la función y su polinomio de Taylor",
    ),
    ...insight(
      "Aproximación de Taylor",
      `En x=${fmt(xv)}, el error absoluto es ${fmt(Math.abs(exact - sum))}.`,
    ),
  };
}
export function transformadaLaplace(i: I) {
  const raw = clean(i.funcion).replace(/\s/g, ""),
    terms = raw.replace(/-/g, "+-").split("+").filter(Boolean);
  const out = terms.map((t) => {
    let m = t.match(/^(-?\d*\.?\d*)\*?t\^(\d+)$/);
    if (m) {
      const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]),
        p = Number(m[2]);
      let f = 1;
      for (let k = 2; k <= p; k++) f *= k;
      return `${fmt(a * f)}/s^${p + 1}`;
    }
    m = t.match(/^(-?\d*\.?\d*)\*?exp\(([-\d.]+)\*?t\)$/);
    if (m) return `${m[1] || 1}/(s−${m[2]})`;
    m = t.match(
      /^(-?\d*\.?\d*)\*?exp\(([-\d.]+)\*?t\)\*?(sin|cos)\(([-\d.]+)\*?t\)$/,
    );
    if (m) {
      const c = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]),
        a = Number(m[2]),
        w = Number(m[4]),
        shifted = `(s−${fmt(a)})`;
      return m[3] === "sin"
        ? `${fmt(c * w)}/(${shifted}^2+${fmt(w * w)})`
        : `${fmt(c)}${shifted}/(${shifted}^2+${fmt(w * w)})`;
    }
    m = t.match(/^(-?\d*\.?\d*)\*?(sin|cos|sinh|cosh)\(([-\d.]+)\*?t\)$/);
    if (m) {
      const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]),
        w = Number(m[3]);
      if (m[2] === "sin") return `${fmt(a * w)}/(s^2+${fmt(w * w)})`;
      if (m[2] === "cos") return `${fmt(a)}s/(s^2+${fmt(w * w)})`;
      if (m[2] === "sinh") return `${fmt(a * w)}/(s^2−${fmt(w * w)})`;
      return `${fmt(a)}s/(s^2−${fmt(w * w)})`;
    }
    if (/^[-\d.]+$/.test(t)) return `${t}/s`;
    throw new Error(`Término todavía no soportado: ${t}`);
  });
  return {
    resultado: out.join(" + "),
    tabla:
      "1 → 1/s\nt^n → n!/s^(n+1)\ne^(at) → 1/(s−a)\nsin(wt) → w/(s²+w²)\ncos(wt) → s/(s²+w²)\nsinh(wt) → w/(s²−w²)\ncosh(wt) → s/(s²−w²)\ne^(at)f(t) → F(s−a)",
    pasos: terms.map((t, k) => `${t} → ${out[k]}`).join("\n"),
    ...insight("Transformada de Laplace", out.join(" + ")),
  };
}
