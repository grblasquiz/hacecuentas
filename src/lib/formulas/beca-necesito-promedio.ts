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
  _insight?: any;
  _chart?: any;
}

export function becaNecesitoPromedio(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).materiasEnPlazo = (i as any).materiasEnPlazo === true || (i as any).materiasEnPlazo === 'true';
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

  // --- Insight dinámico según cumplimiento y cercanía al mínimo
  const tone = probabilidad.startsWith('Alta')
    ? 'good'
    : probabilidad.startsWith('Baja —')
      ? 'warn'
      : 'neutral';
  let insightText: string;
  if (cumplePromedio) {
    insightText = `Tu promedio de **${promedioActual}** supera el mínimo de **${beca.promedio}** que pide esta beca${beca.promedio === 0 ? ' (esta beca no exige promedio, mirá la regularidad)' : ` por **${Math.abs(diferencia).toFixed(2)}** puntos`}. Probabilidad: **${probabilidad.split(' — ')[0]}** — revisá el resto de requisitos.`;
  } else {
    insightText = `Con **${promedioActual}** te faltan **${diferencia.toFixed(2)}** puntos para el mínimo de **${beca.promedio}**. ${diferencia <= 1 ? 'Estás cerca: un par de buenas notas te alcanzan.' : 'Vas a necesitar varias materias con nota alta para llegar.'}`;
  }
  const _insight = {
    title: cumplePromedio ? 'Llegás al promedio' : 'Te falta promedio',
    text: insightText,
    tone,
    icon: '🎓'
  };

  // --- Gauge: tu promedio frente al mínimo exigido (escala 0-10)
  const umbral = beca.promedio;
  const segments = umbral > 0
    ? [
        { nombre: 'Por debajo', max: umbral, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Cumple el mínimo', max: Math.max(10, promedioActual + 0.1), color: '#16a34a', colorDark: '#22c55e' },
      ]
    : [
        { nombre: 'Sin mínimo de promedio', max: Math.max(10, promedioActual + 0.1), color: '#16a34a', colorDark: '#22c55e' },
      ];
  const _chart = {
    type: 'scale',
    marker: promedioActual,
    markerLabel: `Tu promedio: ${promedioActual}`,
    min: 0,
    segments,
    ariaLabel: `Tu promedio es ${promedioActual} sobre 10${umbral > 0 ? `; la beca exige un mínimo de ${umbral}` : '; esta beca no exige promedio mínimo'}.`
  };

  return {
    promedioMinimo: beca.promedio,
    cumplePromedio,
    diferencia: Number(Math.max(0, diferencia).toFixed(2)),
    probabilidad,
    requisitos: beca.desc,
    mensaje: `${beca.desc} Promedio mínimo: ${beca.promedio}. Tu promedio: ${promedioActual}. ${cumplePromedio ? 'Cumplís el requisito de promedio.' : `Te faltan ${diferencia.toFixed(2)} puntos.`}`,
    _insight,
    _chart,
  };
}
