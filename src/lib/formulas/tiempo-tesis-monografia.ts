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
  _insight?: any;
  _chart?: any;
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

  const hEscR = Math.round(horasEscritura);
  const hTotR = Math.round(horasTotales);
  const hInvR = Math.max(0, hTotR - hEscR);
  const semR = Math.round(semanas);
  const _insight = {
    title: 'Tu plan de trabajo',
    text: `Escribir **${paginas} páginas** te llevaría **${hEscR}hs**, pero contando investigación y revisión son **${hTotR}hs** reales. A **${horasSem}hs por semana** terminás en unas **${semR} semanas** (~${meses.toFixed(1)} meses).`,
    tone: meses > 9 ? 'warn' : 'neutral',
    icon: '🎓',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Escritura', value: hEscR },
      { label: 'Investigación y revisión', value: hInvR },
    ],
    centerValue: hTotR + 'hs',
    centerLabel: 'Total',
    ariaLabel: `Carga total de ${hTotR} horas: ${hEscR} de escritura y ${hInvR} de investigación y revisión`,
  };
  return {
    semanasTotal: semR,
    mesesEstimados: Math.round(meses * 10) / 10,
    horasEscritura: hEscR,
    horasTotales: hTotR,
    detalle: `${paginas} páginas a ${pph} pág/hora = ${hEscR}hs escritura. Total con investigación y revisión (×2,5): ${hTotR}hs. A ${horasSem}hs/semana: ${semR} semanas (~${meses.toFixed(1)} meses)`,
    _insight,
    _chart,
  };
}
