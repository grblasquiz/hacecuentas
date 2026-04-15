/** Calculadora de tiempo estimado para tesis o monografía */

export interface Inputs {
  paginasObjetivo: number;
  horasSemanales: number;
  paginasPorHora: number;
}

export interface Outputs {
  semanasTotal: number;
  mesesEstimados: number;
  horasEscritura: number;
  horasTotales: number;
  detalle: string;
}

export function tiempoTesisMonografia(i: Inputs): Outputs {
  const paginas = Number(i.paginasObjetivo);
  const horasSem = Number(i.horasSemanales);
  const pph = Number(i.paginasPorHora);

  if (isNaN(paginas) || paginas < 10) {
    throw new Error('Ingresá las páginas objetivo (mínimo 10)');
  }
  if (isNaN(horasSem) || horasSem < 1) {
    throw new Error('Ingresá las horas semanales de dedicación (mínimo 1)');
  }
  if (isNaN(pph) || pph <= 0) {
    throw new Error('El ritmo de escritura debe ser mayor a 0 páginas por hora');
  }

  const horasEscritura = paginas / pph;
  // Factor 2.5: por cada hora de escritura, 1.5 horas de investigación/revisión
  const horasTotales = horasEscritura * 2.5;
  const semanas = horasTotales / horasSem;
  const meses = semanas / 4.33;

  return {
    semanasTotal: Math.round(semanas),
    mesesEstimados: Math.round(meses * 10) / 10,
    horasEscritura: Math.round(horasEscritura),
    horasTotales: Math.round(horasTotales),
    detalle: `${paginas} páginas a ${pph} pág/hora = ${Math.round(horasEscritura)}hs escritura. Total con investigación y revisión (×2,5): ${Math.round(horasTotales)}hs. A ${horasSem}hs/semana: ${Math.round(semanas)} semanas (~${meses.toFixed(1)} meses)`,
  };
}
