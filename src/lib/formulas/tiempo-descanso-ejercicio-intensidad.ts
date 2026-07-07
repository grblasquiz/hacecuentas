export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | Record<string, any> | undefined; _insight?: any; }
export function tiempoDescansoEjercicioIntensidad(i: Inputs): Outputs {
  const pct = Number(i.pct1RM);
  const obj = String(i.objetivo);
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Determine zone from %1RM if provided; fall back to explicit objetivo
  // Science-backed thresholds per NSCA guidelines:
  // >=85% 1RM -> strength (max strength / neural adaptations)
  // 67-84% 1RM -> hypertrophy (muscle building range, 8-12 reps)
  // <67% 1RM -> endurance (high-rep, metabolic conditioning)
  let zone: 'fuerza' | 'hipertrofia' | 'resistencia';
  if (!isNaN(pct) && pct > 0) {
    if (pct >= 85) zone = 'fuerza';
    else if (pct >= 67) zone = 'hipertrofia';
    else zone = 'resistencia';
  } else {
    zone = (obj === 'fuerza' || obj === 'hipertrofia' || obj === 'resistencia') ? obj : 'hipertrofia';
  }

  // When both are provided and conflict, warn but trust %1RM
  const zonaExplicita = (obj === 'fuerza' || obj === 'hipertrofia' || obj === 'resistencia') ? obj : zone;
  const hayConflicto = zonaExplicita !== zone && !isNaN(pct) && pct > 0;

  // Rest period ranges per NSCA, ACSM, and Schoenfeld (2010) research
  const descEs: Record<string, string> = {
    fuerza: '3-5 min',
    hipertrofia: '60-90 seg',
    resistencia: '20-60 seg',
  };
  const descEn: Record<string, string> = {
    fuerza: '3-5 min',
    hipertrofia: '60-90 sec',
    resistencia: '20-60 sec',
  };
  const descanso = __lang === 'en' ? descEn[zone] : descEs[zone];

  const motivoEs: Record<string, string> = {
    fuerza: 'el sistema fosfageno (ATP-PCr) necesita 3-5 min para resintetizarse completamente y mantener la fuerza maxima en cada serie',
    hipertrofia: 'el descanso corto-medio mantiene el estres metabolico (lactato, GH, IGF-1) que activa mTORC1 y estimula el crecimiento muscular',
    resistencia: 'la pausa corta sostiene la frecuencia cardiaca elevada y mejora la capacidad oxidativa local del musculo',
  };
  const motivoEn: Record<string, string> = {
    fuerza: 'the phosphagen system (ATP-PCr) needs 3-5 min for full resynthesis to maintain maximal force output each set',
    hipertrofia: 'moderate rest sustains metabolic stress (lactate, GH, IGF-1) that activates mTORC1 and drives muscle growth',
    resistencia: 'short rest keeps heart rate elevated and improves the local oxidative capacity of the muscle',
  };
  const motivo = __lang === 'en' ? motivoEn[zone] : motivoEs[zone];

  const conflictoMsgEs = hayConflicto
    ? ` Tu objetivo seleccionado (${zonaExplicita}) no coincide con tu %1RM (${pct}%) - se uso la zona del %1RM.`
    : '';
  const conflictoMsgEn = hayConflicto
    ? ` Your selected goal (${zonaExplicita}) does not match your %1RM (${pct}%) - the %1RM zone was used.`
    : '';
  const conflictoMsg = __lang === 'en' ? conflictoMsgEn : conflictoMsgEs;

  const goalLabelEn: Record<string, string> = { fuerza: 'Strength', hipertrofia: 'Muscle Gain', resistencia: 'Endurance' };
  const goalLabel = __lang === 'en' ? goalLabelEn[zone] : zone;
  const pctLabel = isNaN(pct) || pct <= 0 ? obj : `${pct}% 1RM`;

  const insightText = __lang === 'en'
    ? `For **${goalLabel}** at **${pctLabel}**, rest **${descanso}** between sets: ${motivo}.${conflictoMsg}`
    : `Para **${zone}** al **${pctLabel}**, descansa **${descanso}** entre series: ${motivo}.${conflictoMsg}`;

  const insightTitle = __lang === 'en' ? 'Optimal rest between sets' : 'Descanso optimo entre series';
  const resumenText = __lang === 'en'
    ? `Rest: ${descanso} for ${goalLabel} (${pctLabel}).`
    : `Descanso: ${descanso} para ${zone} (${pctLabel}).`;

  return {
    descanso,
    resumen: resumenText,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '&#x23F1;',
    },
  };
}
