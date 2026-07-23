/** Redondeo de números: decimales, unidad, decena, centena y mil */
export interface Inputs {
  numero?: number;
  precision?: string;
  __lang?: string;
}
export interface Outputs {
  redondeado: number;
  truncado: number;
  haciaArriba: number;
  haciaAbajo: number;
  regla: string;
  _insight?: any;
}

const NIVELES: Record<string, { n: number; label: string }> = {
  d4: { n: 4, label: '4 decimales' },
  d3: { n: 3, label: '3 decimales' },
  d2: { n: 2, label: '2 decimales' },
  d1: { n: 1, label: '1 decimal' },
  unidad: { n: 0, label: 'la unidad (entero)' },
  decena: { n: -1, label: 'la decena' },
  centena: { n: -2, label: 'la centena' },
  mil: { n: -3, label: 'el millar' },
};

function limpiar(x: number, n: number): number {
  // Elimina artefactos de punto flotante en el resultado final
  return n > 0 ? Number(x.toFixed(n)) : Number(x.toFixed(0));
}

export function redondeoNumerosDecimalesDecenasCentenas(i: Inputs): Outputs {
  const numero = Number(i.numero);
  const precision = String(i.precision || 'd2');

  if (i.numero === undefined || i.numero === null || Number.isNaN(numero)) {
    throw new Error('Ingresá el número que querés redondear');
  }
  const nivel = NIVELES[precision];
  if (!nivel) throw new Error('Elegí una precisión válida del menú');
  if (Math.abs(numero) > 1e12) throw new Error('Ingresá un número menor a un billón');

  const n = nivel.n;
  const abs = Math.abs(numero);
  const signo = numero < 0 ? -1 : 1;

  let redondeadoAbs: number, truncadoAbs: number, ceilAbs: number, floorAbs: number;
  if (n >= 0) {
    const f = Math.pow(10, n);
    const v = Number((abs * f).toPrecision(12));
    redondeadoAbs = Math.round(v) / f;
    truncadoAbs = Math.trunc(v) / f;
    ceilAbs = Math.ceil(v) / f;
    floorAbs = Math.floor(v) / f;
  } else {
    const paso = Math.pow(10, -n); // 10, 100, 1000
    const v = Number((abs / paso).toPrecision(12));
    redondeadoAbs = Math.round(v) * paso;
    truncadoAbs = Math.trunc(v) * paso;
    ceilAbs = Math.ceil(v) * paso;
    floorAbs = Math.floor(v) * paso;
  }

  // Redondeo "half away from zero" (regla escolar del 5)
  const redondeado = limpiar(signo * redondeadoAbs, n);
  const truncado = limpiar(signo * truncadoAbs, n);
  // Ceil/floor se aplican sobre el número CON signo (hacia +∞ / hacia −∞)
  const haciaArriba = limpiar(signo > 0 ? ceilAbs : -floorAbs, n);
  const haciaAbajo = limpiar(signo > 0 ? floorAbs : -ceilAbs, n);

  // Dígito que decide la regla del 5 (primer dígito descartado)
  const pasoDigito = n >= 0 ? Math.pow(10, n + 1) : Math.pow(10, n + 1);
  const digito = Math.floor(Number((abs * pasoDigito).toPrecision(12))) % 10;
  const sube = digito >= 5;
  const regla = `El primer dígito descartado es ${digito}: como ${digito} ${sube ? '≥ 5, se redondea hacia arriba (se suma 1 a la última cifra conservada)' : '< 5, se redondea hacia abajo (la última cifra conservada queda igual)'}.`;

  const igualadas = redondeado === truncado;
  return {
    redondeado,
    truncado,
    haciaArriba,
    haciaAbajo,
    regla,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `**${numero.toLocaleString('es-AR')}** redondeado a ${nivel.label} da **${redondeado.toLocaleString('es-AR')}**. ${igualadas ? 'En este caso truncar y redondear coinciden porque el dígito descartado es menor que 5.' : `Truncando (cortando sin mirar) queda **${truncado.toLocaleString('es-AR')}**: la diferencia la hace la regla del 5.`}`,
      tone: 'neutral',
      icon: '🔢',
    },
  };
}
