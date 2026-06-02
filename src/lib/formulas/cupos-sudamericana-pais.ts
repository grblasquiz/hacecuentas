/**
 * Calculadora de cupos a la Copa Sudamericana por país CONMEBOL.
 *
 * Reparto 2026:
 *  - Argentina: 6 directos + 2 repechaje (a fase previa Sudamericana).
 *  - Brasil: 6 directos + 2 repechaje.
 *  - Resto CONMEBOL: 4 cupos por país (posiciones 5-8 de liga típicamente).
 *  - Los eliminados en 16avos de Libertadores (tercero del grupo) caen a
 *    fase de 16avos de Sudamericana.
 */

export interface CuposSudamericanaInputs {
  pais: string;
  posicionLiga: number; // 1 = campeón liga
  vieneDeLibertadores: boolean; // ¿eliminado en fase grupos Libertadores (3º)?
  campeonSudamericanaVigente: boolean;
}

export interface CuposSudamericanaOutputs {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  cuposPaisSuda: number;
  detalle: string;
  _insight?: any;
}

function buildInsightSudamericana(o: {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  cuposPaisSuda: number;
}) {
  if (o.clasifica) {
    return {
      title: 'Clasifica a la Sudamericana',
      text: `El equipo entra a la **${o.fase}** de la Copa Sudamericana (${o.viaDeClasificacion}). El país reparte **${o.cuposPaisSuda}** cupos a esta competencia.`,
      tone: 'good',
      icon: '🥈',
    };
  }
  // clasifica=false puede ser "ya va a Libertadores" (mejor) o realmente afuera.
  if (o.fase === 'Copa Libertadores') {
    return {
      title: 'Va a la Libertadores, no a la Sudamericana',
      text: `Con esa posición el equipo accede a un torneo **superior**: la Copa Libertadores. No necesita el cupo de Sudamericana.`,
      tone: 'good',
      icon: '🏆',
    };
  }
  return {
    title: 'Sin cupo internacional',
    text: `Con esa posición el equipo queda **fuera** de los cupos del país a la Sudamericana (${o.viaDeClasificacion}). No clasifica a torneo internacional esta temporada.`,
    tone: 'warn',
    icon: '🚫',
  };
}

export function cuposSudamericanaPais(
  inputs: CuposSudamericanaInputs
): CuposSudamericanaOutputs {
  const pais = String(inputs.pais || 'otro').toLowerCase();
  const pos = Math.max(1, Math.floor(Number(inputs.posicionLiga) || 20));
  const vieneLib = !!inputs.vieneDeLibertadores;
  const campeonSuda = !!inputs.campeonSudamericanaVigente;

  let cuposPaisSuda = 4;
  if (pais === 'argentina' || pais === 'brasil') cuposPaisSuda = 6;

  if (campeonSuda) {
    return {
      clasifica: true,
      fase: 'Fase de grupos',
      viaDeClasificacion: 'Campeón vigente de Sudamericana',
      cuposPaisSuda,
      detalle:
        'El campeón vigente de Sudamericana obtiene cupo extra a fase de grupos (aunque también puede migrar a Libertadores).',
      _insight: buildInsightSudamericana({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: 'Campeón vigente de Sudamericana', cuposPaisSuda }),
    };
  }

  if (vieneLib) {
    return {
      clasifica: true,
      fase: '16avos de final',
      viaDeClasificacion: 'Tercero de grupo en Libertadores',
      cuposPaisSuda,
      detalle:
        'Los 8 equipos que terminan 3º en la fase de grupos de Libertadores pasan directo a los 16avos de Sudamericana, emparejándose con los 8 ganadores de grupos Sudamericana.',
      _insight: buildInsightSudamericana({ clasifica: true, fase: '16avos de final', viaDeClasificacion: 'Tercero de grupo en Libertadores', cuposPaisSuda }),
    };
  }

  if (pais === 'argentina' || pais === 'brasil') {
    if (pos >= 9 && pos <= 14) {
      const esRepechaje = pos >= 13;
      const faseSuda = esRepechaje ? 'Fase previa (repechaje)' : 'Fase de grupos';
      return {
        clasifica: true,
        fase: faseSuda,
        viaDeClasificacion: `Posición ${pos} — cupo Sudamericana`,
        cuposPaisSuda,
        detalle: esRepechaje
          ? 'Posiciones 13-14 van a fase previa Sudamericana; las 9-12 directo a grupos.'
          : 'Las posiciones 9 a 12 clasifican directo a fase de grupos de Sudamericana.',
        _insight: buildInsightSudamericana({ clasifica: true, fase: faseSuda, viaDeClasificacion: `Posición ${pos} — cupo Sudamericana`, cuposPaisSuda }),
      };
    }
    if (pos <= 8) {
      return {
        clasifica: false,
        fase: 'Copa Libertadores',
        viaDeClasificacion: `Posición ${pos} — ya clasifica a Libertadores`,
        cuposPaisSuda,
        detalle:
          'Con esta posición clasifica a Libertadores, no necesita cupo Sudamericana.',
        _insight: buildInsightSudamericana({ clasifica: false, fase: 'Copa Libertadores', viaDeClasificacion: `Posición ${pos} — ya clasifica a Libertadores`, cuposPaisSuda }),
      };
    }
    return {
      clasifica: false,
      fase: 'No clasifica',
      viaDeClasificacion: `Posición ${pos} — fuera de cupos internacionales`,
      cuposPaisSuda,
      detalle:
        'Quedó afuera de los cupos Sudamericana del país (en AR/BR típicamente top 14).',
      _insight: buildInsightSudamericana({ clasifica: false, fase: 'No clasifica', viaDeClasificacion: `Posición ${pos} — fuera de cupos internacionales`, cuposPaisSuda }),
    };
  }

  // Resto CONMEBOL
  if (pos >= 2 && pos <= 5) {
    return {
      clasifica: true,
      fase: 'Fase de grupos',
      viaDeClasificacion: `Posición ${pos} — cupo Sudamericana`,
      cuposPaisSuda,
      detalle:
        'Las posiciones 2 a 5 de la liga (según cupos del país por ranking CONMEBOL) clasifican a Sudamericana.',
      _insight: buildInsightSudamericana({ clasifica: true, fase: 'Fase de grupos', viaDeClasificacion: `Posición ${pos} — cupo Sudamericana`, cuposPaisSuda }),
    };
  }
  return {
    clasifica: false,
    fase: 'No clasifica',
    viaDeClasificacion: `Posición ${pos} — fuera de cupos`,
    cuposPaisSuda,
    detalle: 'No alcanzó la zona de cupos internacionales del país.',
    _insight: buildInsightSudamericana({ clasifica: false, fase: 'No clasifica', viaDeClasificacion: `Posición ${pos} — fuera de cupos`, cuposPaisSuda }),
  };
}
