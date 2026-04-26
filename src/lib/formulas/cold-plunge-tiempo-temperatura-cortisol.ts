/** Tiempo recomendado cold plunge según temperatura del agua y nivel */
export interface Inputs { temperaturaAgua: number; nivel: 'principiante' | 'intermedio' | 'avanzado'; }
export interface Outputs { tiempoMinSegundos: number; tiempoMaxSegundos: number; tiempoMinutos: string; explicacion: string; }
export function coldPlungeTiempoTemperaturaCortisol(i: Inputs): Outputs {
  const t = Number(i.temperaturaAgua);
  if (isNaN(t) || t < 0 || t > 20) throw new Error('Temperatura debe estar entre 0 y 20 °C');
  // Protocolo Huberman/Susanna Søberg: 11 minutos/semana total a <15°C
  // Por sesión: 1-3 min principiante, 2-5 intermedio, 3-8 avanzado
  // Ajuste por temperatura: más frío = menos tiempo
  const baseMin: Record<string, [number, number]> = {
    principiante: [60, 120],
    intermedio: [120, 240],
    avanzado: [180, 360],
  };
  const base = baseMin[i.nivel] || baseMin.principiante;
  // Factor: a 5°C tiempo base; a 15°C duplicar; a 0°C reducir 40%
  const factor = t <= 5 ? 1 : t <= 10 ? 1.3 : t <= 13 ? 1.6 : 2;
  const ajusteFrio = t < 3 ? 0.6 : 1;
  const min = Math.round(base[0] * factor * ajusteFrio);
  const max = Math.round(base[1] * factor * ajusteFrio);
  const minutos = `${(min / 60).toFixed(1)}-${(max / 60).toFixed(1)} min`;
  return {
    tiempoMinSegundos: min,
    tiempoMaxSegundos: max,
    tiempoMinutos: minutos,
    explicacion: `A ${t}°C, nivel ${i.nivel}: ${minutos} por sesión. Para alcanzar el target de ~11 min/semana de exposición acumulada, distribuí en 2-4 sesiones. INFORMATIVO — no es asesoramiento médico.`,
  };
}
