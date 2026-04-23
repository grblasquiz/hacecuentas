/**
 * Calculadora de cupos a la UEFA Europa League.
 *
 * Reglas generales 2026:
 *  - El 3º de las ligas top 1-4 entra directo a fase de liga de Europa League
 *    si no hay otro mecanismo que lo eleve a Champions.
 *  - El ganador de la copa nacional (FA Cup, Copa del Rey, Coppa Italia, DFB Pokal)
 *    clasifica a Europa League salvo que ya esté en Champions (entonces baja el
 *    finalista o el 5º de liga, según país).
 *  - Ligas 5-15: 1-2 cupos vía liga + 1 cupo vía copa.
 *  - Campeón vigente de Conference League: cupo extra a Europa League.
 */

export interface CuposEuropaLeagueInputs {
  rankingUefaPais: number; // 1 = mejor
  posicionLiga: number;
  campeonCopaNacional: boolean;
  campeonConferenceLeagueVigente: boolean;
  eliminadoChampionsPlayoff: boolean; // ¿perdió playoff de acceso a Champions?
}

export interface CuposEuropaLeagueOutputs {
  clasifica: boolean;
  fase: string;
  viaDeClasificacion: string;
  cuposPais: number;
  detalle: string;
}

export function cuposEuropaLeague(
  inputs: CuposEuropaLeagueInputs
): CuposEuropaLeagueOutputs {
  const rank = Math.max(1, Math.floor(Number(inputs.rankingUefaPais) || 20));
  const pos = Math.max(1, Math.floor(Number(inputs.posicionLiga) || 10));
  const campeonCopa = !!inputs.campeonCopaNacional;
  const campeonCL = !!inputs.campeonConferenceLeagueVigente;
  const chPlayoff = !!inputs.eliminadoChampionsPlayoff;

  let cuposPais = 1;
  if (rank <= 4) cuposPais = 2;
  else if (rank <= 15) cuposPais = 1;
  else cuposPais = 1;

  if (campeonCL) {
    return {
      clasifica: true,
      fase: 'Fase de liga Europa League',
      viaDeClasificacion: 'Campeón vigente de Conference League',
      cuposPais,
      detalle:
        'El campeón de Conference League obtiene cupo directo a fase de liga de Europa League (si no clasifica ya a Champions).',
    };
  }

  if (chPlayoff) {
    return {
      clasifica: true,
      fase: 'Fase de liga Europa League',
      viaDeClasificacion: 'Perdedor playoff Champions (caída a Europa League)',
      cuposPais,
      detalle:
        'Los equipos que pierden el playoff de acceso a Champions caen a fase de liga de Europa League (no pierden la temporada europea).',
    };
  }

  if (campeonCopa) {
    return {
      clasifica: true,
      fase: 'Fase de liga Europa League',
      viaDeClasificacion: 'Campeón de Copa Nacional',
      cuposPais,
      detalle:
        'El ganador de la copa nacional (FA Cup, Copa del Rey, Coppa Italia, DFB Pokal) clasifica a Europa League salvo que ya esté en Champions.',
    };
  }

  if (rank <= 4 && pos === 3) {
    return {
      clasifica: true,
      fase: 'Fase de liga Europa League',
      viaDeClasificacion: 'Tercer puesto de liga top 4 UEFA',
      cuposPais,
      detalle:
        'El 3º de las ligas top 1-4 UEFA entra directo a fase de liga de Europa League en el formato actual (antes era el 5º).',
    };
  }

  if (rank <= 4 && pos === 5) {
    return {
      clasifica: true,
      fase: 'Fase de liga Europa League',
      viaDeClasificacion: 'Posición 5 en liga top 4 UEFA',
      cuposPais,
      detalle:
        'El 5º lugar típicamente va a Europa League cuando el campeón de copa ya está clasificado por liga.',
    };
  }

  if (rank >= 5 && rank <= 15 && pos >= 3 && pos <= 4) {
    return {
      clasifica: true,
      fase: 'Fase previa Europa League',
      viaDeClasificacion: `Posición ${pos} en liga ranking UEFA ${rank}`,
      cuposPais,
      detalle:
        'Ligas medianas UEFA tienen 1 cupo que en general entra por fase previa (2-3 rondas).',
    };
  }

  return {
    clasifica: false,
    fase: 'No clasifica a Europa League',
    viaDeClasificacion: `Posición ${pos} — fuera de cupos`,
    cuposPais,
    detalle:
      'Con esa posición no entra. Puede clasificar a Conference League si el país tiene cupo disponible.',
  };
}
