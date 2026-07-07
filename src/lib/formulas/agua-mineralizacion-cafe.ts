/** Agua mineralización café */
export interface Inputs { durezaActual: number; tdsActual: number; phActual: number; __lang?: string; }
export interface Outputs { evaluacion: string; scaCompliant: string; recomendacion: string; alternativa: string; _insight?: any; }

export function aguaMineralizacionCafe(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const d = Number(i.durezaActual);
  const tds = Number(i.tdsActual);
  const ph = Number(i.phActual);
  if (!isFinite(d) || !isFinite(tds) || !isFinite(ph)) throw new Error(__lang === 'en' ? 'Enter all values' : 'Ingresá todos los valores');

  const durezaOk = d >= 50 && d <= 175;
  const tdsOk = tds >= 75 && tds <= 250;
  const phOk = ph >= 6.5 && ph <= 7.5;
  const all = durezaOk && tdsOk && phOk;

  const T = ({
    es: {
      evalAll:       'Agua en rango SCA — excelente para café specialty',
      evalHardHigh:  'Agua muy dura — afecta extracción y calcifica máquina',
      evalHardLow:   'Agua muy blanda — corroe y sobreextrae',
      evalTdsHigh:   'TDS muy alto — café plano',
      evalTdsLow:    'TDS muy bajo — café débil',
      evalPhHigh:    'pH alto — café plano',
      evalPhLow:     'pH bajo — café ácido/agrio',
      evalOk:        'Agua aceptable',
      scaYes:        'Sí (todas las métricas en rango)',
      scaNo:         'No',
      recAll:        'Filtrá cloro con carbón activado, usá normalmente.',
      recHard:       'Mezclá 50/50 con agua destilada o instalá filtro de osmosis.',
      recSoft:       'Remineralizá con Third Wave Water o 0.08g Epsom + 0.15g bicarbonato por litro.',
      recPhHigh:     'pH alto — filtro con intercambio iónico.',
      recPhLow:      'pH bajo — pizca de bicarbonato sodio.',
      alt:           'Agua mineral comercial: Volvic (ideal), Villa del Sur (bueno), Villavicencio (bueno). Evitá Evian para café.',
      insTitleGood:  'Tu agua para café',
      insTitleWarn:  'Ajustá tu agua',
      insGood:       'las tres en rango SCA. Filtrá el cloro y andá tranquilo.',
      insWarn:       'al menos una métrica está fuera del rango SCA (50-175 / 75-250 / 6.5-7.5) y afecta la taza.',
    },
    en: {
      evalAll:       'Water in SCA range — excellent for specialty coffee',
      evalHardHigh:  'Very hard water — affects extraction and scales the machine',
      evalHardLow:   'Very soft water — corrodes and over-extracts',
      evalTdsHigh:   'TDS too high — flat coffee',
      evalTdsLow:    'TDS too low — weak coffee',
      evalPhHigh:    'pH too high — flat coffee',
      evalPhLow:     'pH too low — acidic/sour coffee',
      evalOk:        'Acceptable water',
      scaYes:        'Yes (all metrics in range)',
      scaNo:         'No',
      recAll:        'Filter chlorine with activated carbon and use normally.',
      recHard:       'Mix 50/50 with distilled water or install a reverse-osmosis filter.',
      recSoft:       'Remineralize with Third Wave Water or 0.08g Epsom + 0.15g baking soda per liter.',
      recPhHigh:     'pH too high — use an ion-exchange filter.',
      recPhLow:      'pH too low — add a pinch of baking soda.',
      alt:           'Commercial mineral water: Volvic (ideal), Villa del Sur (good), Villavicencio (good). Avoid Evian for coffee.',
      insTitleGood:  'Your coffee water',
      insTitleWarn:  'Tune your water',
      insGood:       'all three within SCA range. Filter the chlorine and you are good to go.',
      insWarn:       'at least one metric is outside the SCA range (50-175 / 75-250 / 6.5-7.5) and it hurts the cup.',
    },
  } as const)[__lang];

  let eval_ = '';
  if (all) eval_ = T.evalAll;
  else if (!durezaOk && d > 175) eval_ = T.evalHardHigh;
  else if (!durezaOk && d < 50) eval_ = T.evalHardLow;
  else if (!tdsOk && tds > 250) eval_ = T.evalTdsHigh;
  else if (!tdsOk && tds < 75) eval_ = T.evalTdsLow;
  else if (!phOk) eval_ = ph > 7.5 ? T.evalPhHigh : T.evalPhLow;
  else eval_ = T.evalOk;

  const sca = all ? T.scaYes : T.scaNo;

  let rec = '';
  if (all) rec = T.recAll;
  else if (d > 175 || tds > 250) rec = T.recHard;
  else if (d < 50 || tds < 75) rec = T.recSoft;
  else if (ph > 7.5) rec = T.recPhHigh;
  else if (ph < 6.5) rec = T.recPhLow;

  const alt = T.alt;

  const metricLine = __lang === 'en'
    ? `Hardness **${d} ppm**, TDS **${tds} ppm** and pH **${ph}**:`
    : `Dureza **${d} ppm**, TDS **${tds} ppm** y pH **${ph}**:`;
  const _insight = {
    title: all ? T.insTitleGood : T.insTitleWarn,
    text: `${metricLine} ${all ? T.insGood : T.insWarn}`,
    tone: all ? 'good' : 'warn',
    icon: '☕',
  };

  return { evaluacion: eval_, scaCompliant: sca, recomendacion: rec, alternativa: alt, _insight };
}
