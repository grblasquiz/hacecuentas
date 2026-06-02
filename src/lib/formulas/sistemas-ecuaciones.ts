/** Sistema de ecuaciones lineales 2×2: ax+by=c / dx+ey=f */
export interface Inputs {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}
export interface Outputs {
  x: number | string;
  y: number | string;
  resultado: string;
  determinante: number;
  metodo: string;
  tipo: string;
  _insight?: any;
}

export function sistemasEcuaciones(i: Inputs): Outputs {
  const a = Number(i.a);
  const b = Number(i.b);
  const c = Number(i.c);
  const d = Number(i.d);
  const e = Number(i.e);
  const f = Number(i.f);

  if ([a, b, c, d, e, f].some(v => isNaN(v))) throw new Error('Ingresá los seis coeficientes');

  // Determinante: |a b| = a*e - b*d
  //               |d e|
  const det = a * e - b * d;

  let x: number | string = 0, y: number | string = 0;
  let tipo = 'compatible determinado';
  let resultado = '';

  if (det === 0) {
    // Sistema incompatible o indeterminado
    // Si c/a = f/d y b/a = e/d → infinitas soluciones (proporcionales)
    if (a !== 0 && d !== 0 && Math.abs(c / a - f / d) < 1e-10 && Math.abs(b / a - e / d) < 1e-10) {
      tipo = 'compatible indeterminado';
      x = '∞ (infinitas soluciones)';
      y = '∞ (infinitas soluciones)';
      resultado = 'Las dos ecuaciones son equivalentes (rectas coincidentes). Hay infinitas soluciones.';
    } else {
      tipo = 'incompatible';
      x = '∅ (no existe)';
      y = '∅ (no existe)';
      resultado = 'No tiene solución (rectas paralelas, sin punto de corte).';
    }
  } else {
    // Regla de Cramer
    const detX = c * e - b * f;
    const detY = a * f - c * d;
    x = Number((detX / det).toFixed(6));
    y = Number((detY / det).toFixed(6));
    resultado = `x = ${x}, y = ${y}`;
  }

  const metodo = `Determinante = (${a})(${e}) − (${b})(${d}) = ${det}. ${
    det === 0
      ? 'Det = 0 → no se puede aplicar Cramer.'
      : `Cramer: x = (c·e − b·f) / det = ${(c * e - b * f).toFixed(2)}/${det}; y = (a·f − c·d) / det = ${(a * f - c * d).toFixed(2)}/${det}.`
  }`;

  let _insight: any;
  if (tipo === 'compatible determinado') {
    _insight = {
      title: 'Solución única',
      text: `El sistema es **compatible determinado**: las rectas se cruzan en un solo punto, **(${x}, ${y})**. El determinante (**${det}**) es distinto de cero, así que la regla de Cramer da una respuesta exacta.`,
      tone: 'good',
      icon: '📐',
    };
  } else if (tipo === 'compatible indeterminado') {
    _insight = {
      title: 'Infinitas soluciones',
      text: `Las dos ecuaciones son **equivalentes** (rectas coincidentes) y el determinante es **0**. Hay **infinitas soluciones**: cualquier punto de una recta sirve.`,
      tone: 'neutral',
      icon: '♾️',
    };
  } else {
    _insight = {
      title: 'Sin solución',
      text: `El determinante es **0** y las ecuaciones no son proporcionales: las rectas son **paralelas** y no se cortan. El sistema es **incompatible**, no hay ningún par (x, y) que cumpla las dos.`,
      tone: 'warn',
      icon: '🚫',
    };
  }

  return {
    x,
    y,
    resultado,
    determinante: det,
    metodo,
    tipo,
    _insight,
  };
}
