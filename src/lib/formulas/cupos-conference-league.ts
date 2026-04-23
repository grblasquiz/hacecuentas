/**
 * Calculadora de cupos a la UEFA Conference League.
 *
 * La Conference League es la tercera competencia UEFA (desde 2021/22).
 * Cupos 2026:
 *  - Países top 1-5 UEFA: 0-1 cupo directo vía copa nacional (si copa ya en EL, baja el 6º de liga).
 *  - Países 6-15: 1 cupo vía fase previa.
 *  - Países 16-55 (federaciones pequeñas): 1 cupo, juegan todas las rondas previas.
 *  - Campeón vigente de Conference: sube a Europa League (no vuelve a Conference).
 */

export interface CuposConferenceInputs {
  rankingUefaPais: number;
  posicionLiga: number;
  campeonCopaNacional: boolean;
  copaYaClasificadaEL: boolean; // ¿el campeón de copa ya clasificó por liga a EL o UCL?
}

export interface CuposConferenceOutputs {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  cuposPais: number;
  detalle: string;
}

export function cuposConferenceLeague(
  inputs: CuposConferenceInputs
): CuposConferenceOutputs {
  const rank = Math.max(1, Math.floor(Number(inputs.rankingUefaPais) || 30));
  const pos = Math.max(1, Math.floor(Number(inputs.posicionLiga) || 10));
  const campeonCopa = !!inputs.campeonCopaNacional;
  const copaEnEL = !!inputs.copaYaClasificadaEL;

  const cuposPais = 1;

  // Ligas top: solo entran a Conference por cupo marginal (normalmente el 6º o 7º)
  if (rank <= 5) {
    if (campeonCopa && copaEnEL && pos >= 5 && pos <= 7) {
      return {
        clasifica: true,
        fase: 'Playoff Conference League',
        viaDeClasificacion: `Posición ${pos} — liga top UEFA, acceso marginal`,
        cuposPais,
        detalle:
          'En ligas top, el último cupo europeo muchas veces cae al 6º o 7º vía Conference League playoff.',
      };
    }
    return {
      clasifica: false,
      fase: 'No clasifica',
      viaDeClasificacion: `Posición ${pos} — liga top UEFA sin cupo Conference`,
      cuposPais,
      detalle:
        'En ligas top (España, Inglaterra, Italia, Alemania, Francia) los cupos Conference son marginales y dependen de la copa nacional.',
    };
  }

  // Ligas medianas
  if (rank >= 6 && rank <= 15) {
    if (pos >= 4 && pos <= 6) {
      return {
        clasifica: true,
        fase: 'Fase previa Conference League',
        viaDeClasificacion: `Posición ${pos} — cupo Conference del país`,
        cuposPais,
        detalle:
          'Ligas ranking 6-15 UEFA tienen 1 cupo Conference que entra por fase previa (1-2 rondas).',
      };
    }
    if (campeonCopa) {
      return {
        clasifica: true,
        fase: 'Fase previa Conference League',
        viaDeClasificacion: 'Campeón de copa nacional',
        cuposPais,
        detalle:
          'El campeón de copa puede ir a Conference si la liga no le da lugar a EL.',
      };
    }
    return {
      clasifica: false,
      fase: 'No clasifica',
      viaDeClasificacion: `Posición ${pos} — fuera de cupos`,
      cuposPais,
      detalle:
        'No alcanzó zona de cupos europeos en su liga.',
    };
  }

  // Federaciones pequeñas (rank 16+)
  if (pos === 1) {
    return {
      clasifica: true,
      fase: 'Fase previa Champions League (luego cae a Conference si pierde)',
      viaDeClasificacion: 'Campeón de liga federación pequeña',
      cuposPais,
      detalle:
        'Campeones de federaciones pequeñas juegan primero previas de UCL; si pierden caen a Conference.',
    };
  }
  if (pos >= 2 && pos <= 4) {
    return {
      clasifica: true,
      fase: 'Fase previa Conference League',
      viaDeClasificacion: `Posición ${pos} — cupo Conference por ranking bajo`,
      cuposPais,
      detalle:
        'Ligas ranking 16+ suelen repartir 2-3 cupos entre Conference y previas. Todos sus equipos juegan varias rondas previas antes de fase de liga.',
    };
  }
  return {
    clasifica: false,
    fase: 'No clasifica',
    viaDeClasificacion: `Posición ${pos} — fuera de cupos`,
    cuposPais,
    detalle:
      'La liga tiene muy pocos cupos, típicamente campeón + 1 a 2 equipos más.',
  };
}
