/**
 * Descenso Liga Profesional Argentina (LPF) — sistema de promedios 3 temporadas.
 *
 * Desde 2023 descienden 4 equipos por promedios al final de la temporada:
 *   promedio = (puntos_T−2 + puntos_T−1 + puntos_actual) / partidos_totales
 *
 * Este calc devuelve el promedio actual, proyecciones y cuántos puntos
 * necesita el equipo en los partidos restantes para igualar al 4º peor promedio
 * (el umbral de salvación).
 */

export interface DescensoLPFInputs {
  puntosT1: number;
  partidosT1: number;
  puntosT2: number;
  partidosT2: number;
  puntosT3: number;
  partidosT3: number;
  partidosRestantes: number;
  promedioCuartoPeor: number; // promedio del 4º peor (el corte de salvación)
}

export interface DescensoLPFOutputs {
  promedioActual: number;
  puntosTotales: number;
  partidosTotales: number;
  proyeccionGanaTodo: number;
  proyeccionEmpataTodo: number;
  proyeccionPierdeTodo: number;
  puntosNecesariosSalvarse: number;
  diferenciaConCorte: number;
  veredicto: string;
}

export function descensoLigaProfesionalAr(inputs: DescensoLPFInputs): DescensoLPFOutputs {
  const p1 = Number(inputs.puntosT1) || 0;
  const j1 = Number(inputs.partidosT1) || 0;
  const p2 = Number(inputs.puntosT2) || 0;
  const j2 = Number(inputs.partidosT2) || 0;
  const p3 = Number(inputs.puntosT3) || 0;
  const j3 = Number(inputs.partidosT3) || 0;
  const restantes = Math.max(0, Number(inputs.partidosRestantes) || 0);
  const corte = Number(inputs.promedioCuartoPeor) || 0;

  const puntosTotales = p1 + p2 + p3;
  const partidosJugados = j1 + j2 + j3;
  if (partidosJugados === 0) {
    throw new Error('Ingresá al menos partidos jugados de una temporada.');
  }

  const promedioActual = puntosTotales / partidosJugados;
  const partidosTotales = partidosJugados + restantes;

  const proyeccionGanaTodo = (puntosTotales + restantes * 3) / partidosTotales;
  const proyeccionEmpataTodo = (puntosTotales + restantes * 1) / partidosTotales;
  const proyeccionPierdeTodo = puntosTotales / partidosTotales;

  const puntosNecesariosSalvarse = Math.max(
    0,
    Math.ceil(corte * partidosTotales - puntosTotales)
  );

  const diferenciaConCorte = promedioActual - corte;

  let veredicto = '';
  if (corte === 0) {
    veredicto = 'Ingresá el promedio del 4º peor para comparar.';
  } else if (puntosNecesariosSalvarse === 0) {
    veredicto = '✅ Tu promedio actual ya te salva. Sostener.';
  } else if (puntosNecesariosSalvarse > restantes * 3) {
    veredicto = '🔴 Matemáticamente descendido: no alcanzan los partidos restantes.';
  } else if (puntosNecesariosSalvarse > restantes * 1.5) {
    veredicto = '⚠️ Crítico: tenés que ganar casi todos los partidos que quedan.';
  } else if (puntosNecesariosSalvarse > restantes) {
    veredicto = '🟠 Complicado: necesitás varios triunfos entre los restantes.';
  } else {
    veredicto = '🟡 Dependés de vos: con 2-3 triunfos te salvás.';
  }

  return {
    promedioActual: Number(promedioActual.toFixed(3)),
    puntosTotales,
    partidosTotales,
    proyeccionGanaTodo: Number(proyeccionGanaTodo.toFixed(3)),
    proyeccionEmpataTodo: Number(proyeccionEmpataTodo.toFixed(3)),
    proyeccionPierdeTodo: Number(proyeccionPierdeTodo.toFixed(3)),
    puntosNecesariosSalvarse,
    diferenciaConCorte: Number(diferenciaConCorte.toFixed(3)),
    veredicto,
  };
}
