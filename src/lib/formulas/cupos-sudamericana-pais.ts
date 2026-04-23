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
    };
  }

  if (pais === 'argentina' || pais === 'brasil') {
    if (pos >= 9 && pos <= 14) {
      const esRepechaje = pos >= 13;
      return {
        clasifica: true,
        fase: esRepechaje ? 'Fase previa (repechaje)' : 'Fase de grupos',
        viaDeClasificacion: `Posición ${pos} — cupo Sudamericana`,
        cuposPaisSuda,
        detalle: esRepechaje
          ? 'Posiciones 13-14 van a fase previa Sudamericana; las 9-12 directo a grupos.'
          : 'Las posiciones 9 a 12 clasifican directo a fase de grupos de Sudamericana.',
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
      };
    }
    return {
      clasifica: false,
      fase: 'No clasifica',
      viaDeClasificacion: `Posición ${pos} — fuera de cupos internacionales`,
      cuposPaisSuda,
      detalle:
        'Quedó afuera de los cupos Sudamericana del país (en AR/BR típicamente top 14).',
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
    };
  }
  return {
    clasifica: false,
    fase: 'No clasifica',
    viaDeClasificacion: `Posición ${pos} — fuera de cupos`,
    cuposPaisSuda,
    detalle: 'No alcanzó la zona de cupos internacionales del país.',
  };
}
