/**
 * Calculadora de cupos a la Copa Libertadores por país CONMEBOL.
 *
 * Reparto de cupos 2026 (reglamento CONMEBOL):
 *  - Argentina: 6 directos (fase de grupos) + 2 a repechaje (fase previa)
 *  - Brasil: 6 directos + 2 a repechaje
 *  - Resto de países CONMEBOL (Uruguay, Paraguay, Chile, Colombia, Ecuador,
 *    Bolivia, Perú, Venezuela): 4 cupos (1 fase grupos por campeón, resto
 *    a fase previa) más variaciones por ranking CONMEBOL.
 *  - Campeón vigente de Libertadores: cupo extra directo a grupos.
 *  - Campeón vigente de Sudamericana: cupo extra directo a grupos.
 */

export interface CuposLibertadoresInputs {
  pais: string; // 'argentina' | 'brasil' | 'otro'
  posicionLiga: number; // posición final en la liga local (1 = campeón)
  campeonCopaNacional: boolean; // ¿ganó la copa nacional (Copa Argentina, Copa de Brasil, etc.)?
  campeonLibertadoresVigente: boolean; // ¿es el campeón vigente de Libertadores?
  campeonSudamericanaVigente: boolean; // ¿es el campeón vigente de Sudamericana?
}

export interface CuposLibertadoresOutputs {
  clasifica: boolean;
  fase: string; // 'Fase de grupos' | 'Fase previa (repechaje)' | 'No clasifica'
  viaDeClasificacion: string;
  cuposPais: number;
  cuposDirectos: number;
  cuposRepechaje: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function buildInsightLibertadores(o: {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  pais: string;
}) {
  const paisLbl =
    o.pais === 'argentina' ? 'Argentina' : o.pais === 'brasil' ? 'Brasil' : 'su país';
  if (o.clasifica) {
    const tone = o.fase === 'Fase de grupos' ? 'good' : 'neutral';
    return {
      title:
        o.fase === 'Fase de grupos'
          ? 'Entra directo a fase de grupos'
          : 'Clasifica vía fase previa',
      text:
        o.fase === 'Fase de grupos'
          ? `El equipo asegura un lugar en la **fase de grupos** de la Libertadores (${o.viaDeClasificacion}). Sin repechaje de por medio.`
          : `El equipo entra al **repechaje** (${o.viaDeClasificacion}): debe ganar 1-2 rondas previas para meterse en la fase de grupos.`,
      tone,
      icon: '🏆',
    };
  }
  return {
    title: 'No clasifica a la Libertadores',
    text: `Con esa posición en ${paisLbl}, el equipo queda **fuera** de los cupos a la Libertadores. Todavía puede pelear un cupo a la Copa Sudamericana.`,
    tone: 'warn',
    icon: '🚫',
  };
}

function buildChartLibertadores(o: {
  cuposDirectos: number;
  cuposRepechaje: number;
  cuposPais: number;
}) {
  return {
    type: 'doughnut',
    slices: [
      { label: 'Cupos directos (grupos)', value: o.cuposDirectos },
      { label: 'Cupos a repechaje', value: o.cuposRepechaje },
    ],
    centerValue: String(o.cuposPais),
    centerLabel: 'cupos del país',
    ariaLabel: `El país reparte ${o.cuposPais} cupos a la Libertadores: ${o.cuposDirectos} directos a fase de grupos y ${o.cuposRepechaje} a fase previa.`,
  };
}

export function cuposLibertadoresPais(
  inputs: CuposLibertadoresInputs
): CuposLibertadoresOutputs {
  const pais = String(inputs.pais || 'otro').toLowerCase();
  const pos = Math.max(1, Math.floor(Number(inputs.posicionLiga) || 20));
  // El <select> manda el string "false"/"true": "false" es truthy, así que
  // hay que comparar explícitamente (no usar !! sobre el valor crudo).
  const asBool = (v: unknown) => v === true || v === 'true';
  const campeonCopa = asBool(inputs.campeonCopaNacional);
  const campeonLib = asBool(inputs.campeonLibertadoresVigente);
  const campeonSuda = asBool(inputs.campeonSudamericanaVigente);

  let cuposDirectos = 4;
  let cuposRepechaje = 0;
  let cuposPais = 4;

  if (pais === 'argentina' || pais === 'brasil') {
    cuposDirectos = 6;
    cuposRepechaje = 2;
    cuposPais = 8;
  } else {
    // Paises más chicos: 1 directo (campeón) + 3 a fase previa en general
    cuposDirectos = 1;
    cuposRepechaje = 3;
    cuposPais = 4;
  }

  // Bonus: campeones vigentes tienen cupo extra directo
  if (campeonLib || campeonSuda) {
    return {
      clasifica: true,
      fase: 'Fase de grupos',
      viaDeClasificacion: campeonLib
        ? 'Campeón vigente de Libertadores (cupo extra)'
        : 'Campeón vigente de Sudamericana (cupo extra)',
      cuposPais,
      cuposDirectos,
      cuposRepechaje,
      detalle:
        'Los campeones vigentes de Libertadores y Sudamericana clasifican directo a fase de grupos, independiente de su posición en la liga local.',
      _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: campeonLib ? 'Campeón vigente de Libertadores (cupo extra)' : 'Campeón vigente de Sudamericana (cupo extra)', pais }),
      _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
    };
  }

  // Campeón de copa nacional (Copa Argentina / Copa do Brasil) clasifica directo
  if (campeonCopa && (pais === 'argentina' || pais === 'brasil')) {
    return {
      clasifica: true,
      fase: 'Fase de grupos',
      viaDeClasificacion: 'Campeón de Copa Nacional',
      cuposPais,
      cuposDirectos,
      cuposRepechaje,
      detalle:
        'El ganador de la Copa Argentina (o Copa de Brasil) obtiene cupo directo a fase de grupos de Libertadores.',
      _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: 'Campeón de Copa Nacional', pais }),
      _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
    };
  }

  if (pais === 'argentina' || pais === 'brasil') {
    if (pos <= 6) {
      return {
        clasifica: true,
        fase: 'Fase de grupos',
        viaDeClasificacion: `Top 6 de la liga (posición ${pos})`,
        cuposPais,
        cuposDirectos,
        cuposRepechaje,
        detalle:
          'Los 6 primeros de la liga local clasifican directo a fase de grupos.',
        _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: `Top 6 de la liga (posición ${pos})`, pais }),
        _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
      };
    }
    if (pos <= 8) {
      return {
        clasifica: true,
        fase: 'Fase previa (repechaje)',
        viaDeClasificacion: `Posición ${pos} — repechaje Libertadores`,
        cuposPais,
        cuposDirectos,
        cuposRepechaje,
        detalle:
          'Las posiciones 7 y 8 juegan la fase previa (1 o 2 rondas) para intentar entrar a la fase de grupos.',
        _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase previa (repechaje)', viaDeClasificacion: `Posición ${pos} — repechaje Libertadores`, pais }),
        _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
      };
    }
    return {
      clasifica: false,
      fase: 'No clasifica',
      viaDeClasificacion: `Posición ${pos} — fuera de zona Libertadores`,
      cuposPais,
      cuposDirectos,
      cuposRepechaje,
      detalle:
        'Quedó fuera de los cupos Libertadores. Puede competir por cupos de Sudamericana si su posición lo permite.',
      _insight: buildInsightLibertadores({ clasifica: false, fase: 'No clasifica', viaDeClasificacion: `Posición ${pos} — fuera de zona Libertadores`, pais }),
      _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
    };
  }

  // Resto CONMEBOL
  if (pos === 1) {
    return {
      clasifica: true,
      fase: 'Fase de grupos',
      viaDeClasificacion: 'Campeón de liga',
      cuposPais,
      cuposDirectos,
      cuposRepechaje,
      detalle:
        'El campeón de la liga local clasifica directo a fase de grupos de Libertadores.',
      _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: 'Campeón de liga', pais }),
      _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
    };
  }
  if (pos <= 4) {
    return {
      clasifica: true,
      fase: 'Fase previa (repechaje)',
      viaDeClasificacion: `Posición ${pos} — repechaje`,
      cuposPais,
      cuposDirectos,
      cuposRepechaje,
      detalle:
        'Posiciones 2 a 4 de ligas medianas de CONMEBOL van a fase previa (2 o 3 rondas).',
      _insight: buildInsightLibertadores({ clasifica: true, fase: 'Fase previa (repechaje)', viaDeClasificacion: `Posición ${pos} — repechaje`, pais }),
      _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
    };
  }
  return {
    clasifica: false,
    fase: 'No clasifica',
    viaDeClasificacion: `Posición ${pos} — fuera de zona Libertadores`,
    cuposPais,
    cuposDirectos,
    cuposRepechaje,
    detalle:
      'Quedó fuera de los cupos Libertadores. Puede intentar vía Sudamericana.',
    _insight: buildInsightLibertadores({ clasifica: false, fase: 'No clasifica', viaDeClasificacion: `Posición ${pos} — fuera de zona Libertadores`, pais }),
    _chart: buildChartLibertadores({ cuposDirectos, cuposRepechaje, cuposPais }),
  };
}
