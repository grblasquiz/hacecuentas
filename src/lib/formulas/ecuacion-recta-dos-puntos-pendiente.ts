/** Ecuación de la recta: por dos puntos o por punto y pendiente */
export interface Inputs {
  modo?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  m?: number;
  __lang?: string;
}
export interface Outputs {
  pendiente: string;
  ordenada: string;
  ecuacion: string;
  general: string;
  interseccionX: string;
  interseccionY: string;
  _insight?: any;
}

const fmt = (n: number) => String(Number(n.toFixed(4)));

/** término con signo para armar "y = mx + b" legible */
function armarEcuacion(m: number, b: number): string {
  if (m === 0) return `y = ${fmt(b)}`;
  const mTxt = m === 1 ? '' : m === -1 ? '−' : m < 0 ? `−${fmt(Math.abs(m))}` : fmt(m);
  if (b === 0) return `y = ${mTxt}x`;
  const bTxt = b < 0 ? `− ${fmt(Math.abs(b))}` : `+ ${fmt(b)}`;
  return `y = ${mTxt}x ${bTxt}`;
}

/** forma general Ax + By + C = 0 con signos prolijos */
function armarGeneral(A: number, B: number, C: number): string {
  // normalizo: primer coeficiente no nulo positivo
  const primero = A !== 0 ? A : B;
  if (primero < 0) {
    A = -A; B = -B; C = -C;
  }
  const term = (coef: number, v: string, primero_: boolean): string => {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const coefTxt = v && abs === 1 ? '' : fmt(abs);
    const cuerpo = `${coefTxt}${v}`;
    if (primero_) return coef < 0 ? `−${cuerpo}` : cuerpo;
    return coef < 0 ? ` − ${cuerpo}` : ` + ${cuerpo}`;
  };
  let out = term(A, 'x', true);
  out += term(B, 'y', out === '');
  out += term(C, '', out === '');
  return `${out} = 0`;
}

function mcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function ecuacionRectaDosPuntosPendiente(i: Inputs): Outputs {
  const modo = String(i.modo || 'dos-puntos');
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  if (Number.isNaN(x1) || Number.isNaN(y1)) throw new Error('Ingresá las coordenadas del primer punto (x₁, y₁)');

  let m: number;
  let vertical = false;

  if (modo === 'dos-puntos') {
    const x2 = Number(i.x2);
    const y2 = Number(i.y2);
    if (Number.isNaN(x2) || Number.isNaN(y2)) throw new Error('Ingresá las coordenadas del segundo punto (x₂, y₂)');
    if (x1 === x2 && y1 === y2)
      throw new Error('Los dos puntos son el mismo: por un solo punto pasan infinitas rectas. Ingresá puntos distintos');
    if (x2 === x1) {
      vertical = true;
      m = NaN;
    } else {
      m = (y2 - y1) / (x2 - x1);
    }
  } else if (modo === 'punto-pendiente') {
    if (i.m === undefined || i.m === null || Number.isNaN(Number(i.m)))
      throw new Error('Ingresá la pendiente m');
    m = Number(i.m);
  } else {
    throw new Error('Elegí un modo válido: por dos puntos o por punto y pendiente');
  }

  if (vertical) {
    const k = x1;
    const noCorta = k !== 0;
    return {
      pendiente: 'Indefinida (recta vertical)',
      ordenada: noCorta ? 'No tiene (no corta al eje Y)' : 'Coincide con el eje Y',
      ecuacion: `x = ${fmt(k)}`,
      general: armarGeneral(1, 0, -k),
      interseccionX: `(${fmt(k)}, 0)`,
      interseccionY: noCorta ? 'No corta al eje Y' : 'Toda la recta es el eje Y',
      _insight: {
        title: 'Recta vertical',
        text: `Los dos puntos tienen la misma abscisa, así que la recta es **vertical**: su ecuación es **x = ${fmt(k)}** y la pendiente queda **indefinida** (Δx = 0, no se puede dividir). No se puede escribir como y = mx + b.`,
        tone: 'neutral',
        icon: '📈',
      },
    };
  }

  const b = y1 - m * x1;
  const ecuacion = armarEcuacion(m, b);

  // Forma general: m·x − y + b = 0; si los datos son enteros, la paso a coeficientes enteros
  let A = m, B = -1, C = b;
  if (modo === 'dos-puntos') {
    const x2 = Number(i.x2), y2 = Number(i.y2);
    if ([x1, y1, x2, y2].every(Number.isInteger)) {
      A = y2 - y1;
      B = x1 - x2;
      C = -(A * x1 + B * y1);
      const g = mcd(mcd(A, B), C) || 1;
      A /= g; B /= g; C /= g;
    }
  } else if (Number.isInteger(m) && Number.isInteger(b)) {
    A = m; B = -1; C = b;
  }
  const general = armarGeneral(A, B, C);

  const interseccionY = `(0, ${fmt(b)})`;
  const interseccionX =
    m === 0 ? (b === 0 ? 'Toda la recta es el eje X' : 'No corta al eje X (recta horizontal)') : `(${fmt(-b / m)}, 0)`;

  const tipoTxt =
    m === 0
      ? 'Es una recta **horizontal** (pendiente 0).'
      : m > 0
        ? `Como m > 0, la recta **sube**: por cada unidad que avanza x, y sube ${fmt(m)}.`
        : `Como m < 0, la recta **baja**: por cada unidad que avanza x, y baja ${fmt(Math.abs(m))}.`;

  return {
    pendiente: fmt(m),
    ordenada: fmt(b),
    ecuacion,
    general,
    interseccionX,
    interseccionY,
    _insight: {
      title: 'Tu recta, resuelta',
      text: `La ecuación es **${ecuacion}** (forma general: ${general}). ${tipoTxt} Corta al eje Y en **(0, ${fmt(b)})**.`,
      tone: 'neutral',
      icon: '📈',
    },
  };
}
