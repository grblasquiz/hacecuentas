/** F1 Mundial: cálculo de puntos restantes en campeonato 2026 */
export interface Inputs {
  puntosLider: number;
  puntosRival: number;
  carrerasRestantes: number;
  sprintsRestantes: number;
  incluirVueltaRapida: string; // 'si' | 'no'
}

export interface Outputs {
  diferenciaActual: number;
  puntosPosiblesRestantes: number;
  puntosMaxRival: number;
  matematicaAsegurada: string;
  escenarioEmpate: string;
  resumen: string;
}

export function f1PuntosRestantes(i: Inputs): Outputs {
  const lider = Number(i.puntosLider);
  const rival = Number(i.puntosRival);
  const gps = Number(i.carrerasRestantes || 0);
  const sprints = Number(i.sprintsRestantes || 0);
  const vr = String(i.incluirVueltaRapida || 'si').toLowerCase() === 'si' ? 1 : 0;

  if (!isFinite(lider) || !isFinite(rival)) throw new Error('Ingresá los puntos de líder y rival');
  if (gps < 0 || sprints < 0) throw new Error('Carreras restantes no pueden ser negativas');

  const diff = lider - rival;
  // Max: GP 25 + VR 1, Sprint 8
  const maxPuntos = gps * (25 + vr) + sprints * 8;
  const maxRival = rival + maxPuntos;

  let asegurado = '';
  if (diff > maxPuntos) {
    asegurado = `Matemáticamente campeón (diferencia ${diff} > ${maxPuntos} max posibles)`;
  } else if (diff === maxPuntos) {
    asegurado = `Necesita sumar 1 punto más para asegurar el título`;
  } else {
    asegurado = `Campeonato abierto — el rival puede alcanzarlo (faltan ${maxPuntos - diff} pts de margen)`;
  }

  const empate = `Si el líder no suma nada, el rival necesita **${diff + 1} pts** en las ${gps} carreras + ${sprints} sprints que quedan para superarlo.`;

  return {
    diferenciaActual: diff,
    puntosPosiblesRestantes: maxPuntos,
    puntosMaxRival: maxRival,
    matematicaAsegurada: asegurado,
    escenarioEmpate: empate,
    resumen: `Líder ${lider} pts, rival ${rival} pts (diff ${diff}). Quedan ${gps} GPs (×${25 + vr}) + ${sprints} sprints (×8) = **${maxPuntos} pts máx posibles**. ${asegurado}.`,
  };
}
