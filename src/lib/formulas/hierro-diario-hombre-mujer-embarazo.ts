export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// RDA values per group (IOM / NIH Office of Dietary Supplements, 2001 DRI — vigentes 2026)
const RDA_TABLE: Record<string, { rda: number; label_es: string; label_en: string }> = {
  'hombre-adulto':        { rda: 8,  label_es: 'Hombre adulto (19–50 años)',         label_en: 'Adult man (19–50 years)' },
  'hombre-mayor':         { rda: 8,  label_es: 'Hombre mayor de 50 años',             label_en: 'Man over 50 years' },
  'mujer-adulta':         { rda: 18, label_es: 'Mujer adulta (19–50 años)',            label_en: 'Adult woman (19–50 years)' },
  'mujer-mayor':          { rda: 8,  label_es: 'Mujer mayor de 50 (postmenopausia)',   label_en: 'Woman over 50 (postmenopause)' },
  'embarazo':             { rda: 27, label_es: 'Embarazo (cualquier edad)',            label_en: 'Pregnancy (any age)' },
  'lactancia':            { rda: 9,  label_es: 'Lactancia (19+ años)',                 label_en: 'Breastfeeding (19+ years)' },
  'adolescente-varon':    { rda: 11, label_es: 'Adolescente varón (14–18 años)',       label_en: 'Adolescent male (14–18 years)' },
  'adolescente-mujer':    { rda: 15, label_es: 'Adolescente mujer (14–18 años)',       label_en: 'Adolescent female (14–18 years)' },
};

export function hierroDiarioHombreMujerEmbarazo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const grupoKey = String(i.grupo || 'hombre-adulto');
  const grupoData = RDA_TABLE[grupoKey] || RDA_TABLE['hombre-adulto'];
  const rda = grupoData.rda;
  const grupoLabel = __lang === 'en' ? grupoData.label_en : grupoData.label_es;

  const ingesta = Math.max(0, Number(i.ingesta_mg) || 0);

  // Coverage percentage (cap display at 200% to avoid absurd numbers)
  const coberturaPct = rda > 0 ? Math.min((ingesta / rda) * 100, 200) : 0;
  const deficit = rda - ingesta; // positive = deficit, negative = surplus

  // Status classification
  let status: 'deficit' | 'ok' | 'surplus';
  if (ingesta < rda * 0.9) status = 'deficit';
  else if (ingesta <= rda * 1.2) status = 'ok';
  else status = 'surplus';

  // Format resultado: "X mg de Y mg (Z%)"
  const ingestaFmt = ingesta % 1 === 0 ? ingesta.toFixed(0) : ingesta.toFixed(1);
  const pctFmt = coberturaPct.toFixed(0);

  let resultado: string;
  if (__lang === 'en') {
    resultado = `${ingestaFmt} mg / ${rda} mg per day (${pctFmt}% of RDA)`;
  } else {
    resultado = `${ingestaFmt} mg de ${rda} mg/día (${pctFmt}% de la RDA)`;
  }

  // Resumen text
  let resumen: string;
  if (__lang === 'en') {
    if (status === 'deficit') {
      const defFmt = Math.abs(deficit).toFixed(1);
      resumen = `You are ${defFmt} mg/day below the RDA for ${grupoLabel} (${rda} mg/day). Consider iron-rich foods or consult a doctor about supplementation.`;
    } else if (status === 'ok') {
      resumen = `Your iron intake meets the RDA for ${grupoLabel} (${rda} mg/day). Keep up your current dietary habits.`;
    } else {
      const surFmt = Math.abs(deficit).toFixed(1);
      resumen = `Your intake exceeds the RDA by ${surFmt} mg/day (limit: 45 mg/day). Excess iron may cause gastrointestinal discomfort. Avoid supplements unless prescribed.`;
    }
  } else {
    if (status === 'deficit') {
      const defFmt = Math.abs(deficit).toFixed(1);
      resumen = `Tu ingesta está ${defFmt} mg/día por debajo de la RDA para ${grupoLabel} (${rda} mg/día). Evaluá aumentar el consumo de alimentos con hierro o consultá a tu médico sobre suplementación.`;
    } else if (status === 'ok') {
      resumen = `Tu ingesta cubre la RDA para ${grupoLabel} (${rda} mg/día). Mantené tus hábitos alimentarios.`;
    } else {
      const surFmt = Math.abs(deficit).toFixed(1);
      resumen = `Tu ingesta supera la RDA en ${surFmt} mg/día (límite tolerable: 45 mg/día). El exceso puede causar molestias gastrointestinales. Evitá suplementos sin prescripción.`;
    }
  }

  // Insight
  const toneMap = { deficit: 'warning', ok: 'positive', surplus: 'warning' } as const;
  const tone = toneMap[status];

  const insightTitle = __lang === 'en'
    ? (status === 'deficit' ? 'Iron deficit detected' : status === 'ok' ? 'Iron intake adequate' : 'Intake above RDA')
    : (status === 'deficit' ? 'Déficit de hierro detectado' : status === 'ok' ? 'Ingesta de hierro adecuada' : 'Ingesta por encima de la RDA');

  const _insight = {
    title: insightTitle,
    text: resumen,
    tone,
    icon: '🩸',
  };

  return { resultado, resumen, _insight };
}
