/** Qué promedio necesitás para acceder a beca */
export interface Inputs {
  tipoBeca: string;
  promedioActual: number;
  materiasAprobadas: number;
  materiasEnPlazo: boolean;
}
export interface Outputs {
  promedioMinimo: number;
  cumplePromedio: boolean;
  diferencia: number;
  probabilidad: string;
  requisitos: string;
  mensaje: string;
}

export function becaNecesitoPromedio(i: Inputs): Outputs {
  const tipoBeca = String(i.tipoBeca || 'progresar');
  const promedioActual = Number(i.promedioActual);
  const materiasAprobadas = Number(i.materiasAprobadas) || 0;
  const materiasEnPlazo = i.materiasEnPlazo !== false;

  if (promedioActual < 0 || promedioActual > 10) throw new Error('Ingresá un promedio válido (0-10)');

  // Requisitos de becas argentinas comunes
  const becas: Record<string, { promedio: number; materias: number; desc: string }> = {
    progresar: { promedio: 0, materias: 2, desc: 'Beca Progresar (ANSES): no exige promedio mínimo, sí regularidad (2+ materias/año). Ingreso familiar menor a 3 SMVM.' },
    uba_excelencia: { promedio: 7, materias: 6, desc: 'Beca UBA Excelencia Académica: promedio 7+, 6+ materias aprobadas en el último año. Solo para UBA.' },
    conicet: { promedio: 7.5, materias: 0, desc: 'Beca CONICET doctoral: promedio 7.5+ (con título), plan de investigación aprobado, director asignado.' },
    santander: { promedio: 6, materias: 4, desc: 'Beca Santander Universidades: promedio 6+, regularidad en la carrera, 50%+ materias al día.' },
    privada: { promedio: 8, materias: 0, desc: 'Beca académica universidad privada: promedio 8+ generalmente. Varía por institución.' },
    deportiva: { promedio: 5, materias: 2, desc: 'Beca deportiva: promedio 5+ y regularidad. Acreditar nivel competitivo en el deporte.' },
  };

  const beca = becas[tipoBeca] || becas['progresar'];
  const cumplePromedio = promedioActual >= beca.promedio;
  const diferencia = beca.promedio - promedioActual;

  let probabilidad: string;
  if (cumplePromedio && materiasAprobadas >= beca.materias && materiasEnPlazo) {
    probabilidad = 'Alta — cumplís los requisitos académicos principales';
  } else if (cumplePromedio) {
    probabilidad = 'Media — cumplís el promedio pero revisá los demás requisitos';
  } else if (diferencia <= 1) {
    probabilidad = 'Baja-media — te falta poco de promedio. Subilo con las próximas materias.';
  } else {
    probabilidad = 'Baja — necesitás mejorar significativamente el promedio.';
  }

  return {
    promedioMinimo: beca.promedio,
    cumplePromedio,
    diferencia: Number(Math.max(0, diferencia).toFixed(2)),
    probabilidad,
    requisitos: beca.desc,
    mensaje: `${beca.desc} Promedio mínimo: ${beca.promedio}. Tu promedio: ${promedioActual}. ${cumplePromedio ? 'Cumplís el requisito de promedio.' : `Te faltan ${diferencia.toFixed(2)} puntos.`}`,
  };
}
