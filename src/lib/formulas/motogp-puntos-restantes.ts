/** MotoGP: cálculo de puntos restantes en campeonato 2026 */
export interface Inputs {
  puntosLider: number;
  puntosRival: number;
  carrerasRestantes: number; // GP principales
  sprintsRestantes: number;
}

export interface Outputs {
  diferenciaActual: number;
  puntosPosiblesRestantes: number;
  puntosMaxRival: number;
  matematicaAsegurada: string;
  escenarioEmpate: string;
  resumen: string;
}

export function motogpPuntosRestantes(i: Inputs): Outputs {
  const lider = Number(i.puntosLider);
  const rival = Number(i.puntosRival);
  const gps = Number(i.carrerasRestantes || 0);
  const sprints = Number(i.sprintsRestantes || 0);

  if (!isFinite(lider) || !isFinite(rival)) throw new Error('Ingresá los puntos de líder y rival');
  if (gps < 0 || sprints < 0) throw new Error('Carreras restantes no pueden ser negativas');

  const diff = lider - rival;
  // Máximo puntos por carrera: GP 25, Sprint 12
  const maxPuntos = gps * 25 + sprints * 12;
  const maxRival = rival + maxPuntos;

  let asegurado = '';
  if (diff > maxPuntos) {
    asegurado = `Matemáticamente campeón (diferencia ${diff} > ${maxPuntos} max posibles)`;
  } else if (diff === maxPuntos) {
    asegurado = `Necesita sumar 1 punto más para asegurar el título`;
  } else {
    asegurado = `El campeonato sigue abierto — el rival puede alcanzarlo con ${maxPuntos - diff} pts de diferencia`;
  }

  const empate = `Si el líder no suma más, el rival necesita **${diff + 1} pts** en las ${gps + sprints} competiciones restantes para superarlo.`;

  return {
    diferenciaActual: diff,
    puntosPosiblesRestantes: maxPuntos,
    puntosMaxRival: maxRival,
    matematicaAsegurada: asegurado,
    escenarioEmpate: empate,
    resumen: `Líder ${lider} pts, rival ${rival} pts (diff ${diff}). Quedan ${gps} GPs (×25) + ${sprints} sprints (×12) = **${maxPuntos} pts máx posibles**. ${asegurado}.`,
  };
}
