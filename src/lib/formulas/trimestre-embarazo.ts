/** Trimestre de embarazo según semana */
export interface Inputs { semanaActual: number; }
export interface Outputs { trimestre: string; semanasRestantesTrimestre: number; estudios: string; sintomasComunes: string; }

export function trimestreEmbarazo(i: Inputs): Outputs {
  const sem = Math.round(Number(i.semanaActual));
  if (!sem || sem < 1 || sem > 42) throw new Error('Ingresá una semana entre 1 y 42');

  let trimestre = '';
  let restantes = 0;
  let estudios = '';
  let sintomas = '';

  if (sem <= 12) {
    trimestre = 'Primer trimestre (semanas 1-12)';
    restantes = 12 - sem;
    estudios = 'Ecografía transvaginal (sem. 6-8), translucencia nucal (sem. 11-13), screening bioquímico, beta-hCG, grupo sanguíneo, serología TORCH';
    sintomas = 'Náuseas, cansancio extremo, sensibilidad mamaria, cambios de humor, aversión a olores';
  } else if (sem <= 27) {
    trimestre = 'Segundo trimestre (semanas 13-27)';
    restantes = 27 - sem;
    estudios = 'Ecografía morfológica (sem. 20-24), PTOG glucosa (sem. 24-28), hemograma, urocultivo, vacuna antigripal';
    sintomas = 'Más energía, dolor de espalda, acidez, congestión nasal, primeros movimientos fetales';
  } else {
    trimestre = 'Tercer trimestre (semanas 28-40)';
    restantes = Math.max(0, 40 - sem);
    estudios = 'Ecografía crecimiento (sem. 32-36), monitoreo fetal semanal, hisopado GBS (sem. 36-37), vacuna dTpa, hemograma control';
    sintomas = 'Hinchazón, insomnio, Braxton Hicks, ganas frecuentes de orinar, dolor pélvico, cansancio';
  }

  return { trimestre, semanasRestantesTrimestre: restantes, estudios, sintomasComunes: sintomas };
}
