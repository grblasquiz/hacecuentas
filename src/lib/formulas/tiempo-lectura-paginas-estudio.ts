/** Calculadora de tiempo de lectura de páginas académicas */

export interface Inputs {
  cantidadPaginas: number;
  minutosPorPagina: number;
}

export interface Outputs {
  tiempoTotalMinutos: number;
  tiempoHoras: number;
  sesionesRecomendadas: number;
  detalle: string;
}

export function tiempoLecturaPaginasEstudio(i: Inputs): Outputs {
  const paginas = Number(i.cantidadPaginas);
  const minPorPag = Number(i.minutosPorPagina);

  if (isNaN(paginas) || paginas < 1) {
    throw new Error('Ingresá la cantidad de páginas (mínimo 1)');
  }
  if (isNaN(minPorPag) || minPorPag < 1) {
    throw new Error('Ingresá los minutos por página (mínimo 1)');
  }

  const totalMinutos = paginas * minPorPag;
  const horas = totalMinutos / 60;
  const sesiones = Math.ceil(totalMinutos / 45);

  return {
    tiempoTotalMinutos: Math.round(totalMinutos),
    tiempoHoras: Math.round(horas * 10) / 10,
    sesionesRecomendadas: sesiones,
    detalle: `${paginas} páginas × ${minPorPag} min/página = ${totalMinutos} minutos (${horas.toFixed(1)} horas). Recomendado: ${sesiones} sesiones de 45 min.`,
  };
}
