export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

/**
 * Breakup recovery time estimator.
 *
 * Formula:
 *   base_meses = duracion_meses / 2          (half-rule, Lewandowski & Bizzoco 2007)
 *   adjusted   = base_meses × intensity_factor × initiator_factor
 *   result     = max(1, Math.round(adjusted × 2) / 2)   (rounded to nearest 0.5)
 *
 * Intensity factor (scale 1–5):
 *   1 (muy baja) → 0.75
 *   2 (baja)     → 1.00
 *   3 (media)    → 1.25
 *   4 (alta)     → 1.50
 *   5 (muy alta) → 2.00
 *
 * Who-initiated factor:
 *   "yo"     (I ended it)         → 0.80  (dumper processes grief earlier)
 *   "mutuo"  (mutual)             → 1.00
 *   "pareja" (I was dumped)       → 1.40  (Sprecher et al., ~40% longer on avg)
 *
 * Sources:
 *   - Lewandowski & Bizzoco (2007). "Addition through subtraction: Growth following
 *     the dissolution of a low quality relationship." Journal of Positive Psychology, 2(1), 40–54.
 *   - Sprecher, S., Felmlee, D. et al. (1998). Attachment, Caring, and the Breakup
 *     of Romantic Relationships. Journal of Social and Personal Relationships.
 *   - Attachment Styles and Personal Growth following Romantic Breakups. PLOS One (2013).
 *     PMC3774645.
 */

const INTENSITY_FACTOR: Record<number, number> = {
  1: 0.75,
  2: 1.00,
  3: 1.25,
  4: 1.50,
  5: 2.00,
};

const INITIATOR_FACTOR: Record<string, number> = {
  yo: 0.80,
  mutuo: 1.00,
  pareja: 1.40,
};

export function tiempoSuperarRupturaRelacionMeses(i: Inputs): Outputs {
  const duracion = Math.max(0, Number(i.duracion_meses) || 0);
  const intensidad = Math.min(5, Math.max(1, Math.round(Number(i.intensidad) || 3)));
  const quienTermino = String(i.quien_termino || 'mutuo').toLowerCase();

  const intensityFactor = INTENSITY_FACTOR[intensidad] ?? 1.25;
  const initiatorFactor = INITIATOR_FACTOR[quienTermino] ?? 1.00;

  const base = duracion / 2;
  const raw = base * intensityFactor * initiatorFactor;
  // Round to nearest 0.5, minimum 1 month
  const meses = Math.max(1, Math.round(raw * 2) / 2);

  // Build human-readable description of intensity
  const intensityLabels: Record<number, string> = {
    1: 'muy baja',
    2: 'baja',
    3: 'media',
    4: 'alta',
    5: 'muy alta',
  };
  const intensityLabel = intensityLabels[intensidad] ?? 'media';

  const initiatorLabels: Record<string, string> = {
    yo: 'vos terminaste la relación',
    mutuo: 'fue una decisión mutua',
    pareja: 'tu pareja terminó la relación',
  };
  const initiatorLabel = initiatorLabels[quienTermino] ?? 'fue una decisión mutua';

  // Build breakdown text
  const baseRounded = Math.round(base * 10) / 10;
  const resumen =
    `Relación de ${duracion} meses → base (÷2): ${baseRounded} meses` +
    ` × factor intensidad ${intensityLabel} (×${intensityFactor})` +
    ` × factor iniciador "${initiatorLabel}" (×${initiatorFactor})` +
    ` = **${meses} meses** estimados.`;

  // Insight
  let insightText: string;
  if (meses <= 3) {
    insightText = `La estimación da **${meses} ${meses === 1 ? 'mes' : 'meses'}** de recuperación — un duelo relativamente corto. Date permiso para procesarlo igual; la investigación muestra que saltear el duelo prolonga el malestar.`;
  } else if (meses <= 9) {
    insightText = `La estimación ronda los **${meses} meses** de recuperación. Es un período normal para relaciones de intensidad moderada a alta. Mantener actividad física, red social y, si es posible, apoyo profesional acorta significativamente el proceso.`;
  } else if (meses <= 18) {
    insightText = `La estimación sugiere alrededor de **${meses} meses** (${(meses / 12).toFixed(1)} años). Para procesos de esta duración, acompañamiento terapéutico puede ser especialmente valioso. El resultado es una estimación estadística — no un límite fijo.`;
  } else {
    insightText = `La estimación proyecta **${meses} meses** (~${Math.round(meses / 12 * 10) / 10} años). Las relaciones largas con alta carga emocional pueden llevar ese tiempo. La clave es medir el progreso, no solo el tiempo total: cada mes en que funcionás mejor en trabajo, amistades y autocuidado es señal real de avance.`;
  }

  const lang = String(i.__lang || 'es');

  if (lang === 'en') {
    const initiatorLabelsEn: Record<string, string> = {
      yo: 'you ended the relationship',
      mutuo: 'it was mutual',
      pareja: 'your partner ended it',
    };
    const intensityLabelsEn: Record<number, string> = {
      1: 'very low',
      2: 'low',
      3: 'medium',
      4: 'high',
      5: 'very high',
    };
    const initiatorLabelEn = initiatorLabelsEn[quienTermino] ?? 'it was mutual';
    const intensityLabelEn = intensityLabelsEn[intensidad] ?? 'medium';

    const resumenEn =
      `Relationship of ${duracion} months → base (÷2): ${baseRounded} months` +
      ` × ${intensityLabelEn} intensity factor (×${intensityFactor})` +
      ` × initiator factor "${initiatorLabelEn}" (×${initiatorFactor})` +
      ` = **${meses} months** estimated.`;

    let insightTextEn: string;
    if (meses <= 3) {
      insightTextEn = `The estimate gives **${meses} ${meses === 1 ? 'month' : 'months'}** of recovery — a relatively short grieving period. Give yourself permission to process it anyway; research shows that skipping grief prolongs discomfort.`;
    } else if (meses <= 9) {
      insightTextEn = `The estimate is around **${meses} months** of recovery. This is normal for moderate-to-high intensity relationships. Regular exercise, social connection, and professional support can significantly shorten the process.`;
    } else if (meses <= 18) {
      insightTextEn = `The estimate suggests around **${meses} months** (${(meses / 12).toFixed(1)} years). For processes of this duration, therapeutic support can be especially valuable. This is a statistical estimate — not a rigid deadline.`;
    } else {
      insightTextEn = `The estimate projects **${meses} months** (~${Math.round(meses / 12 * 10) / 10} years). Long, high-intensity relationships can take this long. The key is measuring progress, not just total time: each month you function better at work, in friendships, and in self-care is real evidence of healing.`;
    }

    const _insight = {
      title: 'Estimated recovery time',
      text: insightTextEn,
      tone: 'neutral',
      icon: '💔',
    };

    return { resultado: meses, resumen: resumenEn, _insight };
  }

  const _insight = {
    title: 'Tiempo estimado de recuperación',
    text: insightText,
    tone: 'neutral',
    icon: '💔',
  };

  return { resultado: meses, resumen, _insight };
}
