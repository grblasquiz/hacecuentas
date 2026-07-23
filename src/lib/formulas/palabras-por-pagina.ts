/** Conversor palabras a páginas */
export interface Inputs {
  cantidad: number;
  unidadEntrada: string;
  interlineado: string;
  fuente: string;
  tamanoFuente: number;
}
export interface Outputs {
  paginas: number;
  palabras: number;
  caracteres: number;
  tiempoLectura: number;
  tiempoEscritura: number;
  mensaje: string;
  _table?: any;
  _insight?: any;
}

export function palabrasPorPagina(i: Inputs): Outputs {
  const cantidad = Number(i.cantidad);
  const unidad = String(i.unidadEntrada || 'palabras');
  const interlineado = String(i.interlineado || 'doble');
  const tamano = Number(i.tamanoFuente) || 12;

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá una cantidad');

  // Palabras por página según formato
  let ppg: number;
  if (interlineado === 'simple') ppg = 500;
  else if (interlineado === '1.5') ppg = 375;
  else ppg = 250; // doble

  // Ajuste por tamaño de fuente
  ppg = ppg * (12 / tamano);

  let palabras: number;
  let paginas: number;

  if (unidad === 'palabras') {
    palabras = cantidad;
    paginas = cantidad / ppg;
  } else {
    paginas = cantidad;
    palabras = cantidad * ppg;
  }

  const caracteres = Math.round(palabras * 5.5); // promedio español
  const tiempoLectura = Math.ceil(palabras / 200); // 200 wpm lectura
  const tiempoEscritura = Math.ceil(palabras / 40); // ~40 wpm escritura

  return {
    paginas: Number(paginas.toFixed(1)),
    palabras: Math.round(palabras),
    caracteres,
    tiempoLectura,
    tiempoEscritura,
    mensaje: `${Math.round(palabras)} palabras = ${paginas.toFixed(1)} páginas (interlineado ${interlineado}, ${tamano}pt). Lectura: ~${tiempoLectura} min. Escritura: ~${tiempoEscritura} min.`,
    _table: {
      title: `Tu texto en páginas (interlineado ${interlineado}, ${tamano}pt)`,
      headers: ['Palabras', 'Páginas', 'Lectura', 'Escritura'],
      align: ['left', 'right', 'right', 'right'],
      rows: (() => {
        // Escalones que la gente busca literalmente ("30000 palabras cuántas
        // páginas son", "50 mil palabras en paginas") + el valor del usuario.
        const base = [250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 30000, 50000, 80000];
        const propio = Math.round(palabras);
        const escalones = base.includes(propio) ? base : [...base, propio].sort((a, b) => a - b);
        const fmt = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}min`);
        return escalones.map((wc) => {
          const lm = Math.ceil(wc / 200);
          const wm = Math.ceil(wc / 40);
          const etiqueta = wc.toLocaleString('es-AR') + (wc === propio ? ' (tu texto)' : '');
          return [etiqueta, (wc / ppg).toFixed(1), fmt(lm), fmt(wm)];
        });
      })(),
      note: `Páginas recalculadas para tu formato actual (interlineado ${interlineado}, fuente ${tamano}pt). La lectura (~200 palabras/min) y la escritura (~40 palabras/min) no dependen del interlineado.`,
    },
    _insight: {
      title: 'Tu texto en páginas y tiempo',
      text: `Con interlineado ${interlineado} a ${tamano}pt, **${Math.round(palabras).toLocaleString('es-AR')} palabras** ocupan **${paginas.toFixed(1)} páginas**. Se leen en ~**${tiempoLectura} min** y se escriben en ~**${tiempoEscritura} min**; el interlineado es lo que más mueve el conteo de páginas.`,
      tone: 'neutral',
      icon: '📝',
    },
  };
}
