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
  _insight?: any;
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

  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (horas >= 4) {
    insightText = `Son **${horas.toFixed(1)} h** de estudio: demasiado para una sola sentada. Repartilo en **${sesiones} bloques de 45 min** con descansos, vas a retener mucho más que leyendo de corrido.`;
    insightTone = 'warn';
  } else if (sesiones <= 1) {
    insightText = `Te alcanza con **una sola sesión** de unos **${Math.round(totalMinutos)} min**. Sentate sin distracciones y lo terminás de una.`;
    insightTone = 'good';
  } else {
    insightText = `Vas a necesitar unos **${Math.round(totalMinutos)} min** (**${horas.toFixed(1)} h**). En **${sesiones} sesiones de 45 min** con pausas cortas lo asimilás mejor que de un tirón.`;
    insightTone = 'neutral';
  }

  return {
    tiempoTotalMinutos: Math.round(totalMinutos),
    tiempoHoras: Math.round(horas * 10) / 10,
    sesionesRecomendadas: sesiones,
    detalle: `${paginas} páginas × ${minPorPag} min/página = ${totalMinutos} minutos (${horas.toFixed(1)} horas). Recomendado: ${sesiones} sesiones de 45 min.`,
    _insight: { title: 'Cómo encarar el estudio', text: insightText, tone: insightTone, icon: '📚' },
  };
}
