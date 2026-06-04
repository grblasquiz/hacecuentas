export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

/**
 * Calcula el impacto de la diferencia de horas de sueño entre dos integrantes de
 * una pareja sobre la frecuencia de conflictos y la calidad de convivencia.
 *
 * Fórmula base (evidencia: Keller et al. 2022 PMC9249692; Hasler & Troxel 2010):
 *   Diferencia          = |horas_A − horas_B|
 *   Deuda_diaria_X      = max(0, 8 − horas_X)           [8h = mediana rango OMS/AASM]
 *   Deuda_semanal_X     = Deuda_diaria_X × 7
 *   Impacto_relacional  = Diferencia × 0.5 + (Deuda_A + Deuda_B) × 0.3
 *                         (escala 0–10; sobre 5 = riesgo alto)
 */
export function horasDormirParejaDiscusionImpacto(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');

  const horasA = Math.max(0, Math.min(24, Number(i.horas_a) || 0));
  const horasB = Math.max(0, Math.min(24, Number(i.horas_b) || 0));

  // Recomendación OMS/AASM para adultos: 7–9 h → usamos 8 h como punto medio
  const RECOMENDADO = 8;
  const UMBRAL_RIESGO = 1.5;   // Hasler & Troxel (2010): ≥1.5h → más conflictos
  const UMBRAL_CRITICO = 3.0;  // ≥3h → impacto x3 en conflictos (investigación Berkeley/AASM)

  const diferencia = Math.abs(horasA - horasB);
  const deudaDiariaA = Math.max(0, RECOMENDADO - horasA);
  const deudaDiariaB = Math.max(0, RECOMENDADO - horasB);
  const deudaSemanalA = deudaDiariaA * 7;
  const deudaSemanalB = deudaDiariaB * 7;

  // Puntuación de impacto relacional (escala 0–10)
  const impacto = Math.min(10, diferencia * 0.5 + (deudaDiariaA + deudaDiariaB) * 0.3);

  // Clasificación de riesgo
  let nivelRiesgo: string;
  let nivelRiesgoEn: string;
  let nivelRiesgoPt: string;
  let toneVal: 'ok' | 'warning' | 'error';

  if (diferencia < 1 && impacto < 2) {
    nivelRiesgo = 'Compatible — mínimo impacto';
    nivelRiesgoEn = 'Compatible — minimal impact';
    nivelRiesgoPt = 'Compatível — impacto mínimo';
    toneVal = 'ok';
  } else if (diferencia < UMBRAL_RIESGO && impacto < 4) {
    nivelRiesgo = 'Zona de atención — acordar rutinas';
    nivelRiesgoEn = 'Attention zone — agree on routines';
    nivelRiesgoPt = 'Zona de atenção — acorde rotinas';
    toneVal = 'warning';
  } else if (diferencia < UMBRAL_CRITICO) {
    nivelRiesgo = 'Riesgo moderado-alto — mayor frecuencia de conflictos';
    nivelRiesgoEn = 'Moderate-high risk — more frequent conflicts';
    nivelRiesgoPt = 'Risco moderado-alto — conflitos mais frequentes';
    toneVal = 'error';
  } else {
    nivelRiesgo = 'Riesgo crítico — desincronización circadiana severa';
    nivelRiesgoEn = 'Critical risk — severe circadian desynchronization';
    nivelRiesgoPt = 'Risco crítico — desincronização circadiana grave';
    toneVal = 'error';
  }

  // Consejos contextuales
  let consejo: string;
  if (__lang === 'en') {
    if (diferencia < 1 && impacto < 2) {
      consejo = 'Your sleep schedules are well synchronized. Maintain shared bedtime rituals to strengthen emotional connection.';
    } else if (diferencia < UMBRAL_RIESGO) {
      consejo = 'A small difference is manageable. Agree on a shared bedtime even if one partner takes longer to fall asleep.';
    } else if (diferencia < UMBRAL_CRITICO) {
      consejo = 'This difference is associated with more frequent next-day arguments. Consider strategic naps or shifting bedtime by 30–45 minutes.';
    } else {
      consejo = 'A difference above 3 hours is linked to up to 3× more verbal conflicts (Berkeley/AASM research). Consult a sleep specialist.';
    }
  } else if (__lang === 'pt') {
    if (diferencia < 1 && impacto < 2) {
      consejo = 'Os horários de sono estão bem sincronizados. Mantenha rituais noturnos compartilhados para fortalecer a conexão emocional.';
    } else if (diferencia < UMBRAL_RIESGO) {
      consejo = 'Diferença manejável. Combinem um horário de dormir juntos, mesmo que um demore mais a adormecer.';
    } else if (diferencia < UMBRAL_CRITICO) {
      consejo = 'Essa diferença está associada a mais discussões no dia seguinte. Considere cochilos estratégicos ou adiantar 30–45 min o horário de dormir.';
    } else {
      consejo = 'Diferença acima de 3 horas está ligada a até 3× mais conflitos (pesquisa Berkeley/AASM). Consulte um especialista em sono.';
    }
  } else {
    if (diferencia < 1 && impacto < 2) {
      consejo = 'Los horarios de sueño están bien sincronizados. Mantené rituales nocturnos compartidos para reforzar la conexión emocional.';
    } else if (diferencia < UMBRAL_RIESGO) {
      consejo = 'Diferencia manejable. Acordá una hora de acostarse juntos aunque uno tarde más en dormirse.';
    } else if (diferencia < UMBRAL_CRITICO) {
      consejo = 'Esta diferencia se asocia con más discusiones al día siguiente. Considerá siestas estratégicas o adelantar 30–45 min el horario de sueño.';
    } else {
      consejo = 'Una diferencia mayor a 3 h se vincula con hasta 3× más conflictos verbales (Berkeley/AASM). Consultá un especialista en sueño.';
    }
  }

  // Texto de insight (bilingual)
  const nivelDisplay = __lang === 'en' ? nivelRiesgoEn : __lang === 'pt' ? nivelRiesgoPt : nivelRiesgo;

  const insightTitle = __lang === 'en' ? 'Your result' : __lang === 'pt' ? 'Seu resultado' : 'Tu resultado';
  const insightText = __lang === 'en'
    ? `Sleep difference: **${diferencia.toFixed(1)} h/day**. Partner A's weekly sleep debt: **${deudaSemanalA.toFixed(1)} h**; Partner B's: **${deudaSemanalB.toFixed(1)} h**. Relational impact score: **${impacto.toFixed(1)}/10** → ${nivelRiesgoEn}. ${consejo}`
    : __lang === 'pt'
    ? `Diferença de sono: **${diferencia.toFixed(1)} h/dia**. Dívida semanal do parceiro A: **${deudaSemanalA.toFixed(1)} h**; do parceiro B: **${deudaSemanalB.toFixed(1)} h**. Pontuação de impacto relacional: **${impacto.toFixed(1)}/10** → ${nivelRiesgoPt}. ${consejo}`
    : `Diferencia de sueño: **${diferencia.toFixed(1)} h/día**. Deuda semanal de A: **${deudaSemanalA.toFixed(1)} h**; de B: **${deudaSemanalB.toFixed(1)} h**. Puntuación de impacto relacional: **${impacto.toFixed(1)}/10** → ${nivelRiesgo}. ${consejo}`;

  const insight = {
    title: insightTitle,
    text: insightText,
    tone: toneVal,
    icon: '😴',
  };

  // Labels for outputs
  const labelDif = __lang === 'en' ? 'Sleep difference' : __lang === 'pt' ? 'Diferença de sono' : 'Diferencia de sueño';
  const labelDeuda = __lang === 'en' ? 'Total weekly sleep debt (A+B)' : __lang === 'pt' ? 'Dívida semanal total (A+B)' : 'Deuda semanal total (A+B)';
  const labelImpacto = __lang === 'en' ? 'Relational impact score' : __lang === 'pt' ? 'Pontuação de impacto relacional' : 'Puntuación de impacto relacional';

  const resumen = __lang === 'en'
    ? `Difference: ${diferencia.toFixed(1)} h | Weekly debt A: ${deudaSemanalA.toFixed(1)} h | Weekly debt B: ${deudaSemanalB.toFixed(1)} h | Impact: ${impacto.toFixed(1)}/10 | ${nivelRiesgoEn}`
    : __lang === 'pt'
    ? `Diferença: ${diferencia.toFixed(1)} h | Dívida A: ${deudaSemanalA.toFixed(1)} h | Dívida B: ${deudaSemanalB.toFixed(1)} h | Impacto: ${impacto.toFixed(1)}/10 | ${nivelRiesgoPt}`
    : `Diferencia: ${diferencia.toFixed(1)} h | Deuda A: ${deudaSemanalA.toFixed(1)} h | Deuda B: ${deudaSemanalB.toFixed(1)} h | Impacto: ${impacto.toFixed(1)}/10 | ${nivelRiesgo}`;

  return {
    resultado: `${impacto.toFixed(1)}/10`,
    diferencia: `${diferencia.toFixed(1)} h`,
    deuda_semanal: `${(deudaSemanalA + deudaSemanalB).toFixed(1)} h`,
    nivel_riesgo: nivelDisplay,
    resumen,
    _insight: insight,
  };
}
