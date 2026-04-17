/** Ejercicio diario del conejo: horas de suelta, espacio y enriquecimiento. */
export interface Inputs {
  raza?: string;
  edad?: string;
  jaulaM2?: number;
  condicion?: string;
}
export interface Outputs {
  horasSueltaDia: number;
  espacioMinM2: number;
  saltosPorSesion: string;
  enriquecimiento: string;
  recomendacion: string;
}

export function ejercicioConejoDia(i: Inputs): Outputs {
  const raza = String(i.raza || 'enano');
  const edad = String(i.edad || 'adulto');
  const jaula = Math.max(0.1, Number(i.jaulaM2 ?? 1));
  const cond = String(i.condicion || 'normal');

  const baseHoras: Record<string, number> = {
    'enano': 4, 'mediano': 4.5, 'belier': 4.5, 'rex': 5, 'gigante': 4.5,
  };
  const espacioBase: Record<string, number> = {
    'enano': 3, 'mediano': 4, 'belier': 4, 'rex': 4.5, 'gigante': 6,
  };

  let horas = baseHoras[raza] ?? 4;
  const espacioMin = espacioBase[raza] ?? 4;

  // Ajuste por edad
  if (edad === 'cachorro') horas += 1;
  else if (edad === 'senior') horas -= 0.5;

  // Ajuste por tamaño de jaula: si es muy chica, más horas de suelta
  if (jaula < 1) horas *= 1.3;
  else if (jaula < 2) horas *= 1.1;
  else if (jaula >= 4) horas *= 0.9;

  // Ajuste por condición
  if (cond === 'sobrepeso') horas += 1;

  horas = Math.max(3, Math.round(horas * 10) / 10);

  const saltos = edad === 'senior'
    ? 'Caminatas cortas y exploración tranquila. Rampas suaves. Evitar escaleras altas.'
    : raza === 'gigante'
      ? 'Espacio longitudinal largo (>4 m). Menos saltos, más caminata.'
      : 'Sesiones con saltos, binkies (giros en el aire), carreras cortas y exploración.';

  const enriq = 'Cajas de cartón, túneles, puzzles de heno, pelotas de mimbre, ramas de frutal sin fumigar. Rotar cada semana.';

  let rec = '';
  if (jaula < 1) rec = 'La jaula es muy chica. Sumá un corral extensible o pasá a esquema de conejo libre en habitación para compensar.';
  else if (cond === 'sobrepeso') rec = 'Más horas fuera de la jaula, más exploración, reducí pellets. El ejercicio y la dieta deben ir de la mano.';
  else if (edad === 'cachorro') rec = 'Cachorro necesita mucho ejercicio y estímulo. Supervisá sueltas iniciales y rabbit-proofing de cables.';
  else rec = 'Combiná suelta diaria con enriquecimiento rotativo. Ideal: conejo libre en una habitación las 24 h con corral como refugio.';

  return {
    horasSueltaDia: horas,
    espacioMinM2: espacioMin,
    saltosPorSesion: saltos,
    enriquecimiento: enriq,
    recomendacion: rec,
  };
}
