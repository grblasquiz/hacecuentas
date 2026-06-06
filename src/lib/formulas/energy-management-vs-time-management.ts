export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Energía vs tiempo: ratio de energía por hora de trabajo.
// v1 = nivel de energía disponible (0-100), v2 = horas de trabajo disponibles.
// El resultado es cuántos "puntos de energía" le corresponden a cada hora.
export function energyManagementVsTimeManagement(i: Inputs): Outputs {
  const energia = Number(i.v1) || 0;
  const horas = Number(i.v2) > 0 ? Number(i.v2) : 1;
  const ratio = energia / horas;
  const r = Math.round(ratio * 100) / 100;

  let nivel: string;
  let recomendacion: string;
  let tone: string;
  if (r <= 8) {
    nivel = 'muy bajo';
    recomendacion = 'Energía por hora muy baja: hacé solo tareas mecánicas o descansá antes de seguir.';
    tone = 'negative';
  } else if (r <= 14) {
    nivel = 'moderado';
    recomendacion = 'Energía moderada por hora: ideal para reuniones de rutina, mails y trabajo administrativo.';
    tone = 'neutral';
  } else if (r <= 20) {
    nivel = 'bueno';
    recomendacion = 'Buena energía por hora: aprovechá para análisis, escritura y aprendizaje de conceptos.';
    tone = 'positive';
  } else if (r <= 30) {
    nivel = 'alto';
    recomendacion = 'Energía alta por hora: bloque ideal para deep work, decisiones estratégicas y creatividad.';
    tone = 'positive';
  } else {
    nivel = 'excelente';
    recomendacion = 'Energía excelente por hora: reservá este bloque para tus proyectos de máximo valor.';
    tone = 'positive';
  }

  const fmt = r.toFixed(2).replace('.', ',');

  const _insight = {
    title: `Ratio energía/hora: ${fmt}`,
    text: `Con **${energia}** puntos de energía repartidos en **${horas}** ${horas === 1 ? 'hora' : 'horas'} tenés **${fmt}** puntos de energía por hora (nivel ${nivel}). ${recomendacion}`,
    tone,
    icon: '🔋',
  };

  return {
    resultado: fmt,
    resumen: `${energia} puntos ÷ ${horas} h = ${fmt} puntos de energía por hora (nivel ${nivel}). ${recomendacion}`,
    _insight,
  };
}
