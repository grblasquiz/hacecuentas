/**
 * Calculadora de cupos a la UEFA Champions League según coeficiente UEFA.
 *
 * Reparto 2026/27 (nuevo formato liga de 36 equipos):
 *  - Top 1-4 del ranking UEFA (5 años): 5 cupos cada uno (ESP, ING, ITA, ALE en 2026).
 *  - Top 5: 4 cupos (FRA).
 *  - Top 6: 3 cupos + 1 país por performance (Países Bajos / Portugal dependiendo).
 *  - Top 7-15: 2 cupos.
 *  - Top 16+: 1 cupo.
 *  - +2 cupos adicionales "European Performance Spots": se otorgan a los 2 países
 *    con mejor performance UEFA del año anterior (temporadas 2023/24 fueron ITA y ALE).
 */

export interface CuposChampionsInputs {
  rankingUefaPais: number; // 1 = mejor ranking UEFA
  posicionLiga: number; // 1 = campeón liga local
  tieneCupoExtraPerformance: boolean; // ¿el país ganó un "European Performance Spot"?
  campeonChampionsVigente: boolean; // ¿es el campeón vigente de Champions?
  campeonEuropaLeagueVigente: boolean;
}

export interface CuposChampionsOutputs {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  cuposPaisBase: number;
  cuposPaisConBonus: number;
  detalle: string;
}

export function cuposChampionsCoeficienteUefa(
  inputs: CuposChampionsInputs
): CuposChampionsOutputs {
  const rank = Math.max(1, Math.floor(Number(inputs.rankingUefaPais) || 20));
  const pos = Math.max(1, Math.floor(Number(inputs.posicionLiga) || 10));
  const perfSpot = !!inputs.tieneCupoExtraPerformance;
  const campeonChampions = !!inputs.campeonChampionsVigente;
  const campeonEL = !!inputs.campeonEuropaLeagueVigente;

  let cuposBase: number;
  if (rank <= 4) cuposBase = 4;
  else if (rank === 5) cuposBase = 3;
  else if (rank === 6) cuposBase = 2;
  else if (rank <= 15) cuposBase = 2;
  else cuposBase = 1;

  const cuposConBonus = cuposBase + (perfSpot ? 1 : 0);

  if (campeonChampions) {
    return {
      clasifica: true,
      fase: 'Fase de liga (36 equipos)',
      viaDeClasificacion: 'Campeón vigente de Champions League',
      cuposPaisBase: cuposBase,
      cuposPaisConBonus: cuposConBonus,
      detalle:
        'El campeón vigente de Champions League tiene cupo asegurado a la fase de liga, independiente de su posición doméstica.',
    };
  }
  if (campeonEL) {
    return {
      clasifica: true,
      fase: 'Fase de liga (36 equipos)',
      viaDeClasificacion: 'Campeón vigente de Europa League',
      cuposPaisBase: cuposBase,
      cuposPaisConBonus: cuposConBonus,
      detalle:
        'Desde 2015 el campeón de Europa League clasifica directo a fase de liga de Champions.',
    };
  }

  if (pos <= cuposConBonus) {
    return {
      clasifica: true,
      fase: 'Fase de liga (36 equipos)',
      viaDeClasificacion: `Posición ${pos} en liga local (ranking UEFA del país: ${rank})`,
      cuposPaisBase: cuposBase,
      cuposPaisConBonus: cuposConBonus,
      detalle: `El país tiene ${cuposConBonus} cupos directos a Champions por su ranking UEFA. Con posición ${pos} clasifica.`,
    };
  }

  // Ligas top (1-5) a veces tienen un cupo adicional via Champions Path playoff
  if (rank <= 5 && pos === cuposConBonus + 1) {
    return {
      clasifica: true,
      fase: 'Playoff de acceso (Champions Path)',
      viaDeClasificacion: `Posición ${pos} — juega playoff de acceso`,
      cuposPaisBase: cuposBase,
      cuposPaisConBonus: cuposConBonus,
      detalle:
        'Algunas ligas top tienen una plaza adicional vía playoff a dos partidos (Champions Path).',
    };
  }

  return {
    clasifica: false,
    fase: 'No clasifica a Champions',
    viaDeClasificacion: `Posición ${pos} — fuera de cupos Champions del país`,
    cuposPaisBase: cuposBase,
    cuposPaisConBonus: cuposConBonus,
    detalle:
      'Con ese puesto no entra a Champions. Puede clasificar a Europa League o Conference League según ranking.',
  };
}
