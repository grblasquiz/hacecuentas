export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasPicoProductividadCronobiologiaChrono(i: Inputs): Outputs {
  // v1 = horas de sueño, v2 = duración del ciclo en horas (default 1.5)
  const horasSueno = Number(i.v1) || 0;
  const duracionCiclo = Number(i.v2) > 0 ? Number(i.v2) : 1.5;
  const ciclos = horasSueno / duracionCiclo;
  const ciclosCompletos = Math.floor(ciclos);

  let calidadLabel: string;
  let picoInfo: string;
  if (ciclosCompletos >= 6) {
    calidadLabel = 'Óptimo (rendimiento máximo)';
    picoInfo = 'Pico 1 analítico: +2 a +4 hs post-despertar (2–3 hs de alta concentración). Pico 2 creativo/físico: +9 a +11 hs post-despertar.';
  } else if (ciclosCompletos === 5) {
    calidadLabel = 'Recomendado (adultos, NSF)';
    picoInfo = 'Pico 1 analítico: +2 a +4 hs post-despertar. Pico 2: +9 a +11 hs. Rendimiento cognitivo en rango óptimo.';
  } else if (ciclosCompletos === 4) {
    calidadLabel = 'Mínimo — deuda de sueño leve';
    picoInfo = 'Pico 1 comprimido: ~1 hs efectiva (+2 a +3 hs post-despertar). Valle circadiano más profundo. Evitá tareas críticas en el valle (+6 a +8 hs).';
  } else if (ciclosCompletos === 3) {
    calidadLabel = 'Insuficiente — rendimiento reducido';
    picoInfo = 'Ventanas pico muy cortas. Priorizá UNA tarea cognitiva exigente por día; descartá las demás.';
  } else if (ciclosCompletos > 0) {
    calidadLabel = 'Privación severa de sueño';
    picoInfo = 'Rendimiento cognitivo equivalente a 24–48 hs sin dormir. No planifiques tareas de alta concentración.';
  } else {
    calidadLabel = 'Ingresá las horas de sueño';
    picoInfo = 'Completá el formulario para ver tu análisis.';
  }

  const _insight = {
    title: ciclosCompletos > 0 ? `${ciclosCompletos} ciclos completos — ${calidadLabel}` : 'Resultado',
    text: ciclosCompletos > 0
      ? `Completaste **${ciclosCompletos} ciclos de sueño** (${horasSueno} hs ÷ ${duracionCiclo} hs/ciclo). ${picoInfo} Referencia: 5 ciclos (7,5 hs) = mínimo recomendado por la National Sleep Foundation para adultos.`
      : `Ingresá tus horas de sueño y la duración del ciclo para calcular cuántos ciclos completaste y cuándo es tu ventana pico cognitivo.`,
    tone: ciclosCompletos >= 5 ? 'positive' as const : ciclosCompletos >= 4 ? 'neutral' as const : 'warning' as const,
    icon: '⏰',
  };

  return {
    resultado: ciclosCompletos.toString(),
    resumen: ciclosCompletos > 0 ? `${ciclosCompletos} ciclos completos de ${duracionCiclo} hs. ${calidadLabel}. ${picoInfo}` : 'Ingresá los datos para calcular.',
    _insight,
  };
}
