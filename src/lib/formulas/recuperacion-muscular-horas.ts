/** Calculadora de recuperación muscular */
export interface Inputs {
  grupoMuscular: string;
  intensidad: string;
  edad: number;
  sueno: number;
  __lang?: string;
}
export interface Outputs {
  horasRecuperacion: number;
  diasDescanso: number;
  frecuenciaSemanal: string;
  mensaje: string;
  _insight?: any;
}

export function recuperacionMuscularHoras(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const grupo = String(i.grupoMuscular || 'piernas');
  const intensidad = String(i.intensidad || 'moderada');
  const edad = Number(i.edad) || 30;
  const sueno = Number(i.sueno) || 7;

  // Base recovery hours by muscle group
  const baseHoras: Record<string, number> = {
    piernas: 60, espalda: 56, pecho: 48, hombros: 48,
    biceps: 36, triceps: 36, abdominales: 24
  };
  let horas = baseHoras[grupo] || 48;

  // Intensity modifier
  if (intensidad === 'baja') horas *= 0.7;
  else if (intensidad === 'alta') horas *= 1.35;

  // Age modifier: +20% after 40, +40% after 50
  if (edad > 50) horas *= 1.4;
  else if (edad > 40) horas *= 1.2;
  else if (edad > 35) horas *= 1.1;

  // Sleep modifier: less sleep = longer recovery
  if (sueno < 6) horas *= 1.3;
  else if (sueno < 7) horas *= 1.15;

  horas = Math.round(horas);
  const diasDescanso = Math.ceil(horas / 24);
  const frecuenciaSemanal = Math.floor(7 / (diasDescanso + 1));

  // Tono dinámico: dormir poco alarga la recuperación y es lo más accionable a cuidar
  const tone = sueno < 6 ? ('warn' as const) : ('good' as const);
  const insight = {
    title: __lang === 'en' ? 'Your recovery window' : 'Tu ventana de recuperación',
    text: __lang === 'en'
      ? (sueno < 6
        ? `Your ${grupo} need about **${horas} hours** (${diasDescanso} days) to recover, so train them **${frecuenciaSemanal}x/week** at most. Sleeping under 6h is stretching that window: more sleep would let you recover faster and train more often.`
        : `Your ${grupo} need about **${horas} hours** (${diasDescanso} days) to recover, so train them **${frecuenciaSemanal}x/week** at most. Respect the rest and the muscle adapts; training it sore just delays progress.`)
      : (sueno < 6
        ? `Tus ${grupo} necesitan unas **${horas} horas** (${diasDescanso} días) para recuperarse, así que entrenalos como mucho **${frecuenciaSemanal}x/semana**. Dormir menos de 6 horas está alargando esa ventana: durmiendo más recuperarías antes y podrías entrenar más seguido.`
        : `Tus ${grupo} necesitan unas **${horas} horas** (${diasDescanso} días) para recuperarse, así que entrenalos como mucho **${frecuenciaSemanal}x/semana**. Respetar el descanso es lo que hace que el músculo se adapte; entrenarlo dolorido solo retrasa el progreso.`),
    tone,
    icon: '💪',
  };

  return {
    horasRecuperacion: horas,
    diasDescanso,
    frecuenciaSemanal: __lang === 'en'
      ? `${frecuenciaSemanal}x per week at most`
      : `${frecuenciaSemanal}x por semana como máximo`,
    mensaje: __lang === 'en'
      ? `Rest at least ${horas} hours (${diasDescanso} days) before training ${grupo} again. You can train them ${frecuenciaSemanal}x/week.`
      : `Descansá al menos ${horas} horas (${diasDescanso} días) antes de volver a entrenar ${grupo}. Podés entrenarlos ${frecuenciaSemanal}x/semana.`,
    _insight: insight,
  };
}