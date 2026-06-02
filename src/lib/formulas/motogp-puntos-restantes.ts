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
  _insight?: any;
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
    asegurado = `Sí, campeón matemático`;
  } else if (diff === maxPuntos) {
    asegurado = `Falta 1 punto`;
  } else {
    asegurado = `No, campeonato abierto`;
  }

  const empate = `Si el líder no suma más, el rival necesita **${diff + 1} pts** en las ${gps + sprints} competiciones restantes para superarlo.`;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightTitle: string;
  let insightText: string;
  if (diff > maxPuntos) {
    insightTone = 'good';
    insightTitle = 'Campeón matemático';
    insightText = `La ventaja de **${diff} pts** ya es inalcanzable: aun ganando todo lo que queda el rival sólo sumaría **${maxPuntos} pts** (${gps} GPs + ${sprints} sprints). El título está cerrado.`;
  } else if (diff === maxPuntos) {
    insightTone = 'good';
    insightTitle = 'A un punto del título';
    insightText = `Con **${diff} pts** de ventaja y **${maxPuntos} pts** en juego, al líder le alcanza con sumar **1 punto** más para ser campeón matemático.`;
  } else {
    insightTone = diff < 0 ? 'warn' : 'neutral';
    insightTitle = 'Campeonato abierto';
    insightText = `La diferencia es de **${diff} pts** y todavía hay **${maxPuntos} pts** en juego, así que el título sigue en disputa. El perseguidor necesita **${diff + 1} pts** netos sobre el líder en las ${gps + sprints} competiciones restantes.`;
  }

  return {
    diferenciaActual: diff,
    puntosPosiblesRestantes: maxPuntos,
    puntosMaxRival: maxRival,
    matematicaAsegurada: asegurado,
    escenarioEmpate: empate,
    resumen: `Líder ${lider} pts, rival ${rival} pts (diff ${diff}). Quedan ${gps} GPs (×25) + ${sprints} sprints (×12) = **${maxPuntos} pts máx posibles**. ${asegurado}.`,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '🏁',
    },
  };
}
