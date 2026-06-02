/** Sesiones semanales de sauna y reducción de riesgo cardio según estudio Finlandia (KIHD) */
export interface Inputs { sesionesSemana: number; duracionMin: number; }
export interface Outputs { reduccionRiesgoCardioPct: number; reduccionMortalidadTotalPct: number; categoria: string; explicacion: string; _insight?: any; }
export function saunaFinlandesaFrecuenciaMortalidadCardio(i: Inputs): Outputs {
  const ses = Number(i.sesionesSemana);
  const dur = Number(i.duracionMin);
  if (isNaN(ses) || ses < 0 || ses > 14) throw new Error('Sesiones por semana debe estar entre 0 y 14');
  if (!dur || dur < 5 || dur > 60) throw new Error('Duración debe estar entre 5 y 60 minutos');
  // Datos KIHD study (Laukkanen et al.) — referencia: 1 sesión/semana
  // 2-3 sesiones: -22% mortalidad cardio, -24% mortalidad total
  // 4-7 sesiones: -50% (cardio), -40% total
  // Ajuste por duración: <11 min reduce efecto a la mitad, 19+ min beneficio máximo
  let cardio = 0, total = 0, cat = '';
  if (ses < 1) { cardio = 0; total = 0; cat = 'Sin beneficio relevante'; }
  else if (ses <= 1) { cardio = 0; total = 0; cat = 'Referencia (1 sesión/sem)'; }
  else if (ses <= 3) { cardio = 22; total = 24; cat = '2-3 sesiones/semana'; }
  else { cardio = 50; total = 40; cat = '4-7 sesiones/semana'; }
  const factorDur = dur < 11 ? 0.5 : dur < 19 ? 0.85 : 1;
  cardio = Math.round(cardio * factorDur);
  total = Math.round(total * factorDur);
  const tone = cardio > 0 ? 'good' : 'neutral';
  const icon = '🧖';
  let insightText: string;
  if (cardio > 0) {
    const durNota = dur < 11
      ? ` Ojo: con sesiones de **${dur} min** (cortas) el beneficio se reduce a la mitad; a partir de 19 min se maximiza.`
      : dur < 19
      ? ` Con **${dur} min** captás buena parte del efecto; a partir de 19 min se maximiza.`
      : ` Tus sesiones de **${dur} min** están en el rango de beneficio máximo.`;
    insightText = `Con **${ses}** sesiones por semana, el estudio finlandés (KIHD) asocia una reducción estimada del **${cardio}%** en riesgo cardiovascular y del **${total}%** en mortalidad total frente a 1 sesión/semana.${durNota} Son datos observacionales, no causalidad.`;
  } else if (ses >= 1) {
    insightText = `Con **1 sesión por semana** estás en el grupo de referencia del estudio: no hay reducción extra que medir. Pasar a **2-3 sesiones** ya se asocia a beneficios cardiovasculares.`;
  } else {
    insightText = `Con menos de 1 sesión semanal no hay un beneficio relevante medido. El estudio finlandés empieza a ver efecto a partir de **2-3 sesiones por semana**.`;
  }

  return {
    reduccionRiesgoCardioPct: cardio,
    reduccionMortalidadTotalPct: total,
    categoria: cat,
    explicacion: `Según KIHD (Finlandia): ${cat}, ${dur} min — reducción estimada riesgo cardiovascular: -${cardio}%; mortalidad total: -${total}% vs 1 sesión/semana. INFORMATIVO — datos observacionales, no causalidad demostrada. Consultá con tu médico.`,
    _insight: {
      title: 'Qué dice el estudio finlandés',
      text: insightText,
      tone,
      icon,
    },
  };
}
