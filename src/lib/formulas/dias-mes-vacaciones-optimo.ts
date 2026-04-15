/** Calcula cuántos días de vacaciones rinden más según fines de semana largos y feriados */
export interface Inputs {
  diasVacaciones: number;
  feriadosEnPeriodo: number;
  incluyeFinSemana: string; // 'si' | 'no'
}

export interface Outputs {
  diasTotalesLibres: number;
  ratioDiasPorVacacion: number;
  mejorEstrategia: string;
  ejemploOptimizacion: string;
  resumen: string;
}

export function diasMesVacacionesOptimo(i: Inputs): Outputs {
  const dv = Number(i.diasVacaciones);
  const fer = Number(i.feriadosEnPeriodo) || 0;
  const incluyeFds = i.incluyeFinSemana !== 'no';

  if (!dv || dv <= 0) throw new Error('Ingresá la cantidad de días de vacaciones');

  // Semanas calendario cubiertas aproximadas
  const semanas = Math.ceil(dv / 5);
  const finesDeSemana = incluyeFds ? semanas * 2 : 0;

  const diasTotales = dv + fer + finesDeSemana;
  const ratio = diasTotales / dv;

  let estrategia = 'Buena distribución — aprovechás los fines de semana adyacentes.';
  if (ratio >= 2.0) estrategia = 'Excelente — tus días rinden el doble o más. Gran optimización.';
  else if (ratio >= 1.6) estrategia = 'Muy buena — aprovechás feriados y fin de semana largos.';
  else if (ratio < 1.3) estrategia = 'Mejorable — tomá días pegados a feriados o fin de semanas.';

  const ejemplo = `Si tomás desde el viernes antes de un lunes feriado hasta el domingo siguiente (5 días hábiles), sumás 2 fines de semana + 1 feriado: **10 días libres gastando solo 5 de vacaciones**.`;

  return {
    diasTotalesLibres: diasTotales,
    ratioDiasPorVacacion: Number(ratio.toFixed(2)),
    mejorEstrategia: estrategia,
    ejemploOptimizacion: ejemplo,
    resumen: `Usando ${dv} días de vacaciones + ${fer} feriados + fines de semana adyacentes conseguís **${diasTotales} días libres** (ratio ${ratio.toFixed(2)}x). ${estrategia}`,
  };
}
