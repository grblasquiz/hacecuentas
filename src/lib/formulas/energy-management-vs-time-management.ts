export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Autoevaluación energía vs tiempo (orientativa).
// v1 = nivel de energía disponible (0-100), v2 = horas productivas disponibles.
// Estima las "horas de alto rendimiento" = horas × (energía/100) y las
// interpreta con bandas documentadas: <2h foco bajo, 2-4 medio, >4 alto.
// No pretende precisión: es una autoevaluación para comparar bloques propios.
export function energyManagementVsTimeManagement(i: Inputs): Outputs {
  let energia = Number(i.v1);
  if (!Number.isFinite(energia)) energia = 0;
  // Acotar la energía al rango 0-100 (es una escala de autoevaluación).
  energia = Math.max(0, Math.min(100, energia));

  let horas = Number(i.v2);
  if (!Number.isFinite(horas) || horas <= 0) horas = 0;

  // Horas de alto rendimiento estimadas = horas × (energía / 100).
  const horasEfectivas = horas * (energia / 100);
  const he = Math.round(horasEfectivas * 100) / 100;

  let nivel: string;
  let recomendacion: string;
  let tone: string;
  if (he < 2) {
    nivel = 'bajo';
    recomendacion = 'Poco margen de foco: priorizá una sola tarea importante o tareas mecánicas, y considerá recuperar energía antes de seguir.';
    tone = 'negative';
  } else if (he < 4) {
    nivel = 'medio';
    recomendacion = 'Margen de foco moderado: alcanza para un bloque de trabajo concentrado más reuniones y tareas administrativas.';
    tone = 'neutral';
  } else {
    nivel = 'alto';
    recomendacion = 'Buen margen de foco: reservá estas horas para tu trabajo de mayor valor (deep work, decisiones, creatividad) antes de que la energía baje.';
    tone = 'positive';
  }

  const fmtHe = he.toFixed(1).replace('.', ',');
  const horasFmt = (Math.round(horas * 100) / 100).toString().replace('.', ',');
  const energiaFmt = (Math.round(energia * 10) / 10).toString().replace('.', ',');

  const _insight = {
    title: `Horas de alto rendimiento estimadas: ~${fmtHe} h`,
    text: `Con energía **${energiaFmt}/100** sobre **${horasFmt}** ${horas === 1 ? 'hora' : 'horas'} productivas, estimás unas **${fmtHe} h** de alto rendimiento (foco ${nivel}). ${recomendacion} Es una autoevaluación orientativa, no una medida exacta.`,
    tone,
    icon: '🔋',
  };

  return {
    resultado: `${fmtHe} h`,
    resumen: `${horasFmt} h × ${energiaFmt}% de energía ≈ ${fmtHe} h de alto rendimiento (foco ${nivel}). ${recomendacion} Es una estimación orientativa para autoevaluación, no una medida precisa.`,
    _insight,
  };
}
