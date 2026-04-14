/**
 * Calculadora de Promedios y Descenso del Fútbol Argentino
 *
 * La Liga Profesional Argentina usa un sistema de dos tablas:
 *   1. Tabla de promedios: (puntos últimas 3 temporadas) / (partidos últimas 3 temporadas)
 *   2. Tabla anual: total de puntos del año
 *
 * Descienden 2 equipos cada año:
 *   - El peor promedio de las últimas 3 temporadas
 *   - El peor de la tabla anual (que no haya descendido ya)
 *
 * Equipos recién ascendidos solo cuentan temporadas desde su ascenso.
 */

export interface DescensoInputs {
  puntosT1: number; // temporada más vieja
  partidosT1: number;
  puntosT2: number;
  partidosT2: number;
  puntosT3: number; // temporada actual (en curso)
  partidosT3: number; // jugados hasta ahora
  partidosRestantes: number;
  promedioRival: number; // promedio del rival directo (penúltimo en promedios)
}

export interface DescensoOutputs {
  promedioActual: number;
  partidosTotales: number;
  puntosTotales: number;
  promedioRivalFormat: string;
  diferenciaConRival: number;
  puntosNecesariosParaIgualar: number; // cuántos puntos en los restantes para igualar al rival
  proyeccionSiGanaTodo: number;
  proyeccionSiEmpataTodo: number;
  proyeccionSiPierdeTodo: number;
  veredicto: string;
}

export function descensoFutbol(inputs: DescensoInputs): DescensoOutputs {
  const p1 = Number(inputs.puntosT1) || 0;
  const j1 = Number(inputs.partidosT1) || 0;
  const p2 = Number(inputs.puntosT2) || 0;
  const j2 = Number(inputs.partidosT2) || 0;
  const p3 = Number(inputs.puntosT3) || 0;
  const j3 = Number(inputs.partidosT3) || 0;
  const restantes = Math.max(0, Number(inputs.partidosRestantes) || 0);
  const promRival = Number(inputs.promedioRival) || 0;

  const puntosTotales = p1 + p2 + p3;
  const partidosJugados = j1 + j2 + j3;

  if (partidosJugados === 0) {
    throw new Error('Ingresá al menos partidos de una temporada');
  }

  const promedioActual = puntosTotales / partidosJugados;
  const partidosTotales = partidosJugados + restantes;

  // Proyecciones: puntos al final de la temporada actual + restantes
  // Si gana todo: +3 pts cada restante
  // Empata todo: +1 cada restante
  // Pierde todo: +0
  const puntosGanaTodo = puntosTotales + restantes * 3;
  const puntosEmpataTodo = puntosTotales + restantes * 1;
  const puntosPierdeTodo = puntosTotales;

  const proyGanaTodo = puntosGanaTodo / partidosTotales;
  const proyEmpataTodo = puntosEmpataTodo / partidosTotales;
  const proyPierdeTodo = puntosPierdeTodo / partidosTotales;

  // Puntos necesarios para igualar el promedio del rival al final de la temporada
  // Asumiendo que el rival no suma puntos adicionales (peor caso para nosotros)
  // Para igualar: (puntosTotales + X) / partidosTotales = promRival
  // X = promRival × partidosTotales - puntosTotales
  const puntosNecesariosParaIgualar = Math.max(
    0,
    Math.ceil(promRival * partidosTotales - puntosTotales)
  );

  const diferenciaConRival = promedioActual - promRival;

  let veredicto = '';
  if (promRival === 0) {
    veredicto = 'Ingresá el promedio del rival directo para comparar.';
  } else if (puntosNecesariosParaIgualar === 0 && restantes === 0) {
    veredicto = '✅ Temporada terminada con promedio superior al rival. Te salvaste.';
  } else if (puntosNecesariosParaIgualar === 0) {
    veredicto = '✅ Tu promedio actual ya es superior al del rival. Mantenelo.';
  } else if (puntosNecesariosParaIgualar > restantes * 3) {
    veredicto = '🔴 Matemáticamente descendido: no podés sumar suficientes puntos.';
  } else if (puntosNecesariosParaIgualar > restantes * 1.5) {
    veredicto = '⚠️ Situación crítica: necesitás ganar casi todos los partidos restantes.';
  } else if (puntosNecesariosParaIgualar > restantes) {
    veredicto = '🟠 Complicado: necesitás varios triunfos entre los restantes.';
  } else {
    veredicto = '🟡 Dependés de vos: con pocos triunfos te salvás.';
  }

  return {
    promedioActual: Number(promedioActual.toFixed(3)),
    partidosTotales,
    puntosTotales,
    promedioRivalFormat: promRival ? promRival.toFixed(3) : '—',
    diferenciaConRival: Number(diferenciaConRival.toFixed(3)),
    puntosNecesariosParaIgualar,
    proyeccionSiGanaTodo: Number(proyGanaTodo.toFixed(3)),
    proyeccionSiEmpataTodo: Number(proyEmpataTodo.toFixed(3)),
    proyeccionSiPierdeTodo: Number(proyPierdeTodo.toFixed(3)),
    veredicto,
  };
}
