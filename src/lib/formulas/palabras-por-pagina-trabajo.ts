/** Calculadora de palabras a páginas para trabajos académicos */

export interface Inputs {
  cantidadPalabras: number;
  palabrasPorPagina: number;
}

export interface Outputs {
  cantidadPaginas: number;
  paginasCompletas: number;
  palabrasRestantes: number;
  detalle: string;
  _table?: any;
  _insight?: any;
}

// Math central: páginas = palabras / palabrasPorPágina. La usa el resultado principal Y cada fila.
function paginasDe(palabras: number, porPagina: number): number {
  return palabras / porPagina;
}

export function palabrasPorPaginaTrabajo(i: Inputs): Outputs {
  const palabras = Number(i.cantidadPalabras);
  const porPagina = Number(i.palabrasPorPagina);

  if (isNaN(palabras) || palabras < 1) {
    throw new Error('Ingresá la cantidad de palabras (mínimo 1)');
  }
  if (isNaN(porPagina) || porPagina < 150) {
    throw new Error('Las palabras por página deben ser al menos 150');
  }

  const paginasExactas = paginasDe(palabras, porPagina);
  const paginasCompletas = Math.floor(paginasExactas);
  const palabrasRestantes = palabras - paginasCompletas * porPagina;
  const paginasR = Math.round(paginasExactas * 10) / 10;

  // Filas fijas + la cantidad del usuario, recalculadas al MISMO formato (porPagina) elegido.
  const baseWc = [500, 1000, 2000, 3000, 5000];
  const filasWc = Array.from(new Set([...baseWc, palabras])).sort((a, b) => a - b);

  return {
    cantidadPaginas: paginasR,
    paginasCompletas,
    palabrasRestantes,
    detalle: `${palabras.toLocaleString('es-AR')} palabras ÷ ${porPagina} palabras/página = ${paginasExactas.toFixed(1)} páginas (${paginasCompletas} completas + ${palabrasRestantes} palabras en la última)`,
    _table: {
      title: `Palabras a páginas (${porPagina} palabras por página)`,
      headers: ['Palabras', 'Páginas'],
      align: ['left', 'right'],
      rows: filasWc.map((wc) => {
        const esTuyo = wc === palabras;
        const etiqueta = wc.toLocaleString('es-AR') + (esTuyo ? ' (tu texto)' : '');
        return [etiqueta, paginasDe(wc, porPagina).toFixed(1)];
      }),
      note: `Páginas calculadas con tu formato actual de ${porPagina} palabras por página. Cambiar interlineado, fuente o tamaño cambia ese número (≈250 a doble espacio, ≈500 a espacio simple en 12pt).`,
    },
    _insight: {
      title: 'Extensión de tu trabajo',
      text: `Con **${palabras.toLocaleString('es-AR')} palabras** a ${porPagina} por página tu trabajo ocupa **${paginasR} páginas**: ${paginasCompletas} completas más ${palabrasRestantes.toLocaleString('es-AR')} palabras en la última. Ajustá el tipeo si tenés un mínimo o máximo de páginas exigido.`,
      tone: 'neutral',
      icon: '📄',
    },
  };
}
