/** F1 Mundial: cálculo de puntos restantes en campeonato 2026 */
export interface Inputs {
  puntosLider: number;
  puntosRival: number;
  carrerasRestantes: number;
  sprintsRestantes: number;
  incluirVueltaRapida?: string; // legado 2019-2024; desde 2025 no suma puntos
}

export interface Outputs {
  diferenciaActual: number;
  puntosPosiblesRestantes: number;
  puntosMaxRival: number;
  matematicaAsegurada: string;
  escenarioEmpate: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function f1PuntosRestantes(i: Inputs): Outputs {
  const lider = Number(i.puntosLider);
  const rival = Number(i.puntosRival);
  const gps = Number(i.carrerasRestantes || 0);
  const sprints = Number(i.sprintsRestantes || 0);

  if (!isFinite(lider) || !isFinite(rival)) throw new Error('Ingresá los puntos de líder y rival');
  if (gps < 0 || sprints < 0) throw new Error('Carreras restantes no pueden ser negativas');

  const diff = lider - rival;
  // Sistema vigente desde 2025: GP 25 y Sprint 8; sin punto por vuelta rápida.
  const maxPuntos = gps * 25 + sprints * 8;
  const maxRival = rival + maxPuntos;

  let asegurado = '';
  if (diff > maxPuntos) {
    asegurado = `Campeón asegurado`;
  } else if (diff === maxPuntos) {
    asegurado = `A 1 punto del título`;
  } else {
    asegurado = `Campeonato abierto`;
  }

  const empate = `Si el líder no suma nada, el rival necesita **${diff + 1} pts** en las ${gps} carreras + ${sprints} sprints que quedan para superarlo.`;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (diff > maxPuntos) {
    insightTone = 'good';
    insightText = `Con **${diff} pts** de ventaja y solo **${maxPuntos} pts** en juego, el rival ya no llega: el título está matemáticamente asegurado.`;
  } else if (diff === maxPuntos) {
    insightTone = 'warn';
    insightText = `La ventaja de **${diff} pts** iguala justo los **${maxPuntos} pts** que quedan: alcanza con sumar **1 punto** más para sellar el campeonato.`;
  } else {
    insightTone = 'neutral';
    insightText = `Quedan **${maxPuntos} pts** en juego contra una ventaja de **${diff} pts**: el campeonato sigue abierto y el rival depende de remontar ${diff + 1} puntos.`;
  }

  return {
    diferenciaActual: diff,
    puntosPosiblesRestantes: maxPuntos,
    puntosMaxRival: maxRival,
    matematicaAsegurada: asegurado,
    escenarioEmpate: empate,
    resumen: `Líder ${lider} pts, rival ${rival} pts (diff ${diff}). Quedan ${gps} GPs (×25) + ${sprints} sprints (×8) = **${maxPuntos} pts máx posibles**. ${asegurado}.`,
    _insight: {
      title: 'Lectura del campeonato',
      text: insightText,
      tone: insightTone,
      icon: '🏎️',
    },
    _chart: {
      type: 'scale',
      marker: diff,
      markerLabel: `Ventaja ${diff} pts`,
      min: 0,
      segments: [
        { nombre: 'Abierto', max: maxPuntos, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Asegurado', max: Math.max(maxPuntos + 1, diff + 1), color: '#16a34a', colorDark: '#15803d' },
      ],
      ariaLabel: `Ventaja de ${diff} puntos frente a los ${maxPuntos} puntos que aún se pueden disputar`,
    },
  };
}
