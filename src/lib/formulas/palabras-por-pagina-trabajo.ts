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
  _insight?: any;
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

  const paginasExactas = palabras / porPagina;
  const paginasCompletas = Math.floor(paginasExactas);
  const palabrasRestantes = palabras - paginasCompletas * porPagina;
  const paginasR = Math.round(paginasExactas * 10) / 10;

  return {
    cantidadPaginas: paginasR,
    paginasCompletas,
    palabrasRestantes,
    detalle: `${palabras.toLocaleString('es-AR')} palabras ÷ ${porPagina} palabras/página = ${paginasExactas.toFixed(1)} páginas (${paginasCompletas} completas + ${palabrasRestantes} palabras en la última)`,
    _insight: {
      title: 'Extensión de tu trabajo',
      text: `Con **${palabras.toLocaleString('es-AR')} palabras** a ${porPagina} por página tu trabajo ocupa **${paginasR} páginas**: ${paginasCompletas} completas más ${palabrasRestantes.toLocaleString('es-AR')} palabras en la última. Ajustá el tipeo si tenés un mínimo o máximo de páginas exigido.`,
      tone: 'neutral',
      icon: '📄',
    },
  };
}
