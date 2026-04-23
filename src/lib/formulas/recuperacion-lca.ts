/** Recuperación rotura LCA (ligamento cruzado anterior) post-cirugía */
export interface Inputs {
  tipoCirugia: string;
  fechaCirugia: string;
  edad: number;
  nivelCompetencia: string;
  adherenciaRehab: string;
  fuerzaCuadricepsPct: number;
}
export interface Outputs {
  fasesRehab: string;
  mesesRetornoEntrenamiento: string;
  mesesRetornoCompeticion: string;
  tasaRetornoEsperada: string;
  semaforoBiomarcador: string;
  mensaje: string;
}

function parseFecha(s: string): number {
  const m = String(s || '').trim().replace('T', ' ');
  const [y, mo, d] = (m.split(/\s+/)[0] || '').split('-').map(Number);
  if (!y || !mo || !d) return NaN;
  return new Date(y, mo - 1, d).getTime();
}

export function recuperacionLca(i: Inputs): Outputs {
  const tipo = String(i.tipoCirugia || 'injerto-bptb');
  const edad = Number(i.edad) || 25;
  const nivel = String(i.nivelCompetencia || 'amateur');
  const adherencia = String(i.adherenciaRehab || 'alta');
  const cuadPct = Number(i.fuerzaCuadricepsPct) || 0;

  // Base months to competition (BPTB injerto hueso-tendón-hueso vs semitendinoso)
  let baseCompeticionMin = 9;
  let baseCompeticionMax = 12;
  let baseEntrenoMin = 6;
  let baseEntrenoMax = 9;

  if (tipo === 'injerto-cuadricipital') {
    baseCompeticionMin = 9;
    baseCompeticionMax = 12;
  } else if (tipo === 'injerto-semitendinoso') {
    baseCompeticionMin = 9;
    baseCompeticionMax = 13;
  } else if (tipo === 'reparacion-primaria') {
    baseCompeticionMin = 8;
    baseCompeticionMax = 10;
  }

  // Ajustes por edad y nivel
  if (edad > 35) { baseCompeticionMin += 1; baseCompeticionMax += 2; }
  if (nivel === 'profesional') { baseCompeticionMax += 1; }
  if (adherencia === 'baja') { baseCompeticionMin += 2; baseCompeticionMax += 3; }
  else if (adherencia === 'media') { baseCompeticionMin += 1; baseCompeticionMax += 1; }

  const fechaCir = parseFecha(String(i.fechaCirugia || ''));
  let infoFecha = '';
  if (!isNaN(fechaCir)) {
    const hoy = Date.now();
    const mesesTranscurridos = Math.round((hoy - fechaCir) / (1000 * 60 * 60 * 24 * 30.4));
    infoFecha = ` Transcurridos ${mesesTranscurridos} meses desde la cirugía.`;
  }

  // Tasa retorno competencia
  let tasaMin = 65, tasaMax = 80;
  if (nivel === 'profesional') { tasaMin = 70; tasaMax = 85; }
  if (adherencia === 'baja') { tasaMin -= 10; tasaMax -= 10; }

  // Semáforo biomarcador cuádriceps (>85% vs lado sano = verde)
  let semaforo = '';
  if (cuadPct >= 90) semaforo = 'VERDE: fuerza cuádriceps ≥90% vs lado sano. Apto para retorno progresivo.';
  else if (cuadPct >= 85) semaforo = 'VERDE: fuerza cuádriceps ≥85% vs lado sano (umbral mínimo JOSPT).';
  else if (cuadPct >= 70) semaforo = 'AMARILLO: fuerza 70-85%. Seguir fortalecimiento antes de pivoteos/saltos.';
  else if (cuadPct > 0) semaforo = 'ROJO: fuerza <70%. No retornar a pivoteos/saltos. Alto riesgo relesión.';
  else semaforo = 'Ingresá la fuerza del cuádriceps (medición con dinamómetro) para evaluar criterio de alta.';

  const fases = [
    'Fase 1 (0-2 sem): control dolor, inflamación, rango articular.',
    'Fase 2 (2-6 sem): activación cuádriceps, marcha normal sin muletas.',
    'Fase 3 (6-12 sem): fuerza progresiva, bicicleta, propiocepción.',
    'Fase 4 (3-6 meses): carrera recta, fuerza pliométrica.',
    'Fase 5 (6-9 meses): pivoteos, saltos, gestos específicos de fútbol.',
    'Fase 6 (9-12 meses): retorno progresivo a competencia con criterios objetivos.'
  ].join(' | ');

  return {
    fasesRehab: fases,
    mesesRetornoEntrenamiento: `${baseEntrenoMin}-${baseEntrenoMax} meses (fútbol controlado, sin contacto).`,
    mesesRetornoCompeticion: `${baseCompeticionMin}-${baseCompeticionMax} meses (competencia oficial, con contacto).`,
    tasaRetornoEsperada: `${tasaMin}-${tasaMax}% de retorno a nivel pre-lesión (6-24 meses post-op).`,
    semaforoBiomarcador: semaforo,
    mensaje: `Retorno a competencia estimado ${baseCompeticionMin}-${baseCompeticionMax} meses post-cirugía.${infoFecha} No reemplaza evaluación de médico deportólogo/traumatólogo.`
  };
}
