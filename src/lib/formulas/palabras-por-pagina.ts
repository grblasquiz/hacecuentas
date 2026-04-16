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
  };
}
