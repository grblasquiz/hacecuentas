/** Frecuencia de entrenamiento y supercompensación */
export interface Inputs {
  tipoEntrenamiento: string;
  intensidad: number;
  nivel: string;
}

export interface Outputs {
  result: number;
  rangoHoras: string;
  frecuenciaSemanal: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const HORAS_BASE: Record<string, { min: number; max: number; nombre: string }> = {
  'cardio-suave': { min: 12, max: 24, nombre: 'Cardio suave' },
  'cardio-moderado': { min: 24, max: 48, nombre: 'Cardio moderado' },
  'cardio-intenso': { min: 36, max: 60, nombre: 'Cardio intenso' },
  'hiit': { min: 48, max: 72, nombre: 'HIIT / CrossFit' },
  'fuerza-moderada': { min: 48, max: 72, nombre: 'Fuerza moderada' },
  'fuerza-pesada': { min: 72, max: 96, nombre: 'Fuerza pesada' },
  'deporte-equipo': { min: 48, max: 72, nombre: 'Deporte de equipo' },
  'flexibilidad': { min: 12, max: 24, nombre: 'Flexibilidad / yoga' },
};

export function frecuenciaEntrenamientoSupercompensacion(i: Inputs): Outputs {
  const tipo = String(i.tipoEntrenamiento || 'fuerza-moderada');
  const rpe = Number(i.intensidad);
  const nivel = String(i.nivel || 'intermedio');

  if (!rpe || rpe < 1 || rpe > 10) throw new Error('Ingresá la intensidad percibida (RPE 1-10)');

  const info = HORAS_BASE[tipo] || HORAS_BASE['fuerza-moderada'];

  // Factor intensidad
  let factorInt = 1.0;
  if (rpe <= 3) factorInt = 0.8;
  else if (rpe <= 6) factorInt = 1.0;
  else if (rpe <= 8) factorInt = 1.1;
  else factorInt = 1.3;

  // Factor nivel
  let factorNivel = 1.0;
  if (nivel === 'principiante') factorNivel = 1.2;
  else if (nivel === 'avanzado') factorNivel = 0.85;

  const horasPromedio = ((info.min + info.max) / 2) * factorInt * factorNivel;
  const dias = horasPromedio / 24;
  const horasMin = Math.round(info.min * factorInt * factorNivel);
  const horasMax = Math.round(info.max * factorInt * factorNivel);

  const sesionesMax = Math.floor(7 / (dias + 0.01));
  const frecuencia = sesionesMax >= 7 ? 'Todos los días' : `${Math.min(sesionesMax, 7)} veces por semana`;

  const diasR = Number(dias.toFixed(1));
  const ventana = diasR < 1.5 ? 'corta' : diasR <= 3 ? 'media' : 'larga';
  const tone = diasR < 1.5 ? 'warn' : diasR <= 3 ? 'good' : 'neutral';
  const matiz = diasR < 1.5
    ? 'recuperás rápido: podés volver casi a diario, pero cuidá la técnica para no acumular fatiga'
    : diasR <= 3
    ? 'es la ventana clásica de supercompensación: entrenar acá aprovecha el pico de adaptación'
    : 'el músculo necesita descanso largo; entrenar demasiado seguido te dejaría en sobreentrenamiento';

  return {
    result: diasR,
    rangoHoras: `${horasMin}-${horasMax} horas`,
    frecuenciaSemanal: frecuencia,
    detalle: `Para **${info.nombre}** con RPE ${rpe} (nivel ${nivel}): descanso recomendado **${dias.toFixed(1)} días** (${horasMin}-${horasMax}h). Frecuencia máxima: **${frecuencia}**.`,
    _insight: {
      title: 'Tu ventana de supercompensación',
      text: `Tras **${info.nombre}** a RPE ${rpe} necesitás unas **${diasR} días** de descanso (ventana ${ventana}): ${matiz}. Eso permite hasta **${frecuencia.toLowerCase()}**.`,
      tone,
      icon: '🏋️',
    },
    _chart: {
      type: 'scale',
      marker: diasR,
      markerLabel: `${diasR} días`,
      min: 0,
      segments: [
        { nombre: 'Recuperación rápida', max: 1.5, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Supercompensación', max: 3, color: '#3b82f6', colorDark: '#2563eb' },
        { nombre: 'Descanso largo', max: Math.max(5, Math.ceil(diasR) + 1), color: '#f59e0b', colorDark: '#d97706' },
      ],
      ariaLabel: `Descanso de ${diasR} días en la escala de recuperación muscular`,
    },
  };
}
