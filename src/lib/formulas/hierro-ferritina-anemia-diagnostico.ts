export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function hierroFerritinaAnemiaDiagnostico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      anemiaYes: 'Sí',
      anemiaNo: 'No',
      reservMuyBajas: 'Muy bajas (deficiencia)',
      reservBajas: 'Bajas',
      reservNormales: 'Normales',
      reservAltas: 'Altas',
      tratSuplementar: 'Suplementar hierro oral + vitamina C. Control en 3 meses.',
      tratNoIndicado: 'No indicado por datos aportados.',
      insTitle: 'Lectura de tu hierro',
      insDefAnemia: (f: string, h: string) => `Ferritina de **${f} ng/mL** (reservas en deficiencia) y hemoglobina **${h} g/dL** por debajo del umbral: cuadro compatible con **anemia ferropénica**. Conviene suplementar hierro con vitamina C y reevaluar con tu médico en 3 meses.`,
      insDef: (f: string) => `Tus reservas de hierro están en deficiencia con ferritina de **${f} ng/mL**, aunque la hemoglobina aún no marca anemia. Es el momento ideal para corregir con suplemento antes de que aparezca la anemia.`,
      insLow: (f: string) => `Ferritina de **${f} ng/mL**: reservas **bajas** (en el límite). No es deficiencia franca, pero conviene cuidar la dieta y controlar la evolución.`,
      insNormal: (f: string) => `Ferritina de **${f} ng/mL** dentro del rango **normal** y sin anemia. Tus reservas de hierro están bien; mantené una dieta variada.`,
      insHigh: (f: string) => `Ferritina de **${f} ng/mL**: reservas **altas**. El exceso de hierro o la inflamación también importan; conviene consultar para descartar sobrecarga.`,
      segDef: 'Deficiencia',
      segLow: 'Bajas',
      segNorm: 'Normales',
      segHigh: 'Altas',
      gaugeLabel: 'Tu ferritina',
      gaugeAria: (f: string) => `Ferritina de ${f} ng/mL ubicada en una escala de reservas de hierro: deficiencia hasta 15, bajas hasta 30, normales hasta 300 y altas por encima.`,
    },
    en: {
      anemiaYes: 'Yes',
      anemiaNo: 'No',
      reservMuyBajas: 'Very low (deficiency)',
      reservBajas: 'Low',
      reservNormales: 'Normal',
      reservAltas: 'High',
      tratSuplementar: 'Supplement oral iron + vitamin C. Follow up in 3 months.',
      tratNoIndicado: 'Not indicated based on the data provided.',
      insTitle: 'Reading your iron levels',
      insDefAnemia: (f: string, h: string) => `Ferritin of **${f} ng/mL** (stores in deficiency) and hemoglobin **${h} g/dL** below threshold: a picture consistent with **iron-deficiency anemia**. It's advisable to supplement iron with vitamin C and reassess with your doctor in 3 months.`,
      insDef: (f: string) => `Your iron stores are in deficiency with ferritin of **${f} ng/mL**, although hemoglobin does not yet indicate anemia. This is the ideal moment to correct it with a supplement before anemia sets in.`,
      insLow: (f: string) => `Ferritin of **${f} ng/mL**: **low** stores (borderline). Not outright deficiency, but it's worth watching your diet and tracking the trend.`,
      insNormal: (f: string) => `Ferritin of **${f} ng/mL** within the **normal** range and no anemia. Your iron stores are fine; keep a varied diet.`,
      insHigh: (f: string) => `Ferritin of **${f} ng/mL**: **high** stores. Iron overload or inflammation also matter; it's worth consulting to rule out overload.`,
      segDef: 'Deficiency',
      segLow: 'Low',
      segNorm: 'Normal',
      segHigh: 'High',
      gaugeLabel: 'Your ferritin',
      gaugeAria: (f: string) => `Ferritin of ${f} ng/mL placed on an iron-stores scale: deficiency up to 15, low up to 30, normal up to 300 and high above.`,
    },
  } as const)[__lang];
  const h=Number(i.hemoglobina)||0; const f=Number(i.ferritina)||0; const sx=String(i.sexo||'mujer');
  const minHb=sx==='hombre'?13:12;
  const hayAnemia=h<minHb;
  const anemia=hayAnemia?T.anemiaYes:T.anemiaNo;
  const reserv=f<15?T.reservMuyBajas:f<30?T.reservBajas:f<300?T.reservNormales:T.reservAltas;
  const trat=f<30?T.tratSuplementar:T.tratNoIndicado;

  const fStr = String(f);
  const hStr = String(h);
  let insText: string; let insTone: 'good'|'warn'|'neutral'; let insIcon: string;
  if (f < 15 && hayAnemia) { insText = T.insDefAnemia(fStr, hStr); insTone = 'warn'; insIcon = '🩸'; }
  else if (f < 15) { insText = T.insDef(fStr); insTone = 'warn'; insIcon = '⚠️'; }
  else if (f < 30) { insText = T.insLow(fStr); insTone = 'warn'; insIcon = '🟠'; }
  else if (f < 300) { insText = T.insNormal(fStr); insTone = 'good'; insIcon = '🩸'; }
  else { insText = T.insHigh(fStr); insTone = 'warn'; insIcon = '🔺'; }

  const _insight = { title: T.insTitle, text: insText, tone: insTone, icon: insIcon };

  // Gauge: ferritina en escala de reservas de hierro (ng/mL)
  const topMax = Math.max(400, Math.ceil(f) + 10);
  const _chart = {
    type: 'scale',
    marker: f,
    markerLabel: T.gaugeLabel,
    min: 0,
    segments: [
      { nombre: T.segDef, max: 15, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: T.segLow, max: 30, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: T.segNorm, max: 300, color: '#22c55e', colorDark: '#15803d' },
      { nombre: T.segHigh, max: topMax, color: '#f59e0b', colorDark: '#b45309' },
    ],
    ariaLabel: T.gaugeAria(fStr),
  };

  return { anemia:anemia, reservasHierro:reserv, tratamiento:trat, _insight, _chart };
}
