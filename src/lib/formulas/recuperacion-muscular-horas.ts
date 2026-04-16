/** Calculadora de recuperación muscular */
export interface Inputs {
  grupoMuscular: string;
  intensidad: string;
  edad: number;
  sueno: number;
}
export interface Outputs {
  horasRecuperacion: number;
  diasDescanso: number;
  frecuenciaSemanal: string;
  mensaje: string;
}

export function recuperacionMuscularHoras(i: Inputs): Outputs {
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

  return {
    horasRecuperacion: horas,
    diasDescanso,
    frecuenciaSemanal: `${frecuenciaSemanal}x por semana como máximo`,
    mensaje: `Descansá al menos \${horas} horas (\${diasDescanso} días) antes de volver a entrenar \${grupo}. Podés entrenarlos \${frecuenciaSemanal}x/semana.`
  };
}