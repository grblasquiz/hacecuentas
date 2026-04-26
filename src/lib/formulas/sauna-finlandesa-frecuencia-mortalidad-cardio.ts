/** Sesiones semanales de sauna y reducción de riesgo cardio según estudio Finlandia (KIHD) */
export interface Inputs { sesionesSemana: number; duracionMin: number; }
export interface Outputs { reduccionRiesgoCardioPct: number; reduccionMortalidadTotalPct: number; categoria: string; explicacion: string; }
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
  return {
    reduccionRiesgoCardioPct: cardio,
    reduccionMortalidadTotalPct: total,
    categoria: cat,
    explicacion: `Según KIHD (Finlandia): ${cat}, ${dur} min — reducción estimada riesgo cardiovascular: -${cardio}%; mortalidad total: -${total}% vs 1 sesión/semana. INFORMATIVO — datos observacionales, no causalidad demostrada. Consultá con tu médico.`,
  };
}
