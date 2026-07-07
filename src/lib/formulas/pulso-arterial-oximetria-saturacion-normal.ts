/**
 * Interpretación de saturación de oxígeno (SpO2) y pulso por oxímetro.
 * Clasifica la SpO2 en aire ambiente según OMS/ATS/ERS, ajustando el rango
 * esperado por altitud, y contextualiza la frecuencia cardíaca si se ingresa.
 * Bilingüe es/en vía __lang. No tira error en build (corre client-side).
 */
type Lang = 'es' | 'en';

export interface Inputs {
  spo2: number | string;
  frecuenciaCardiaca?: number | string;
  altitud?: number | string; // metros sobre el nivel del mar
  __lang?: string;
}
export interface Outputs {
  categoria: string;
  nivelAlerta: string;
  rangoEsperado: string;
  recomendacion: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
  [k: string]: string | number | any;
}

interface S {
  err: string;
  normal: string; leve: string; moderada: string; severa: string; critica: string;
  sinAlerta: string; precaucion: string; prontaAtencion: string; urgencia: string; emergencia: string;
  recNormal: string; recLeve: string; recModerada: string; recSevera: string; recCritica: string;
  rango: string; rangoAlt2500: string; rangoAlt1500: string;
  brad: string; taq: string;
  insightTitle: string;
  insightOk: (s: number, r: string) => string;
  insightBad: (s: number, cat: string, r: string, rec: string) => string;
  segCritica: string; segSevera: string; segModerada: string; segLeve: string; segNormal: string;
  markerLabel: (s: number) => string; aria: string;
}

const STR: Record<Lang, S> = {
  es: {
    err: 'Ingresá un valor de SpO2 válido (50–100%).',
    normal: 'Normal ✅', leve: 'Hipoxemia leve', moderada: 'Hipoxemia moderada', severa: 'Hipoxemia severa', critica: 'Hipoxemia crítica',
    sinAlerta: 'Sin alerta', precaucion: 'Precaución', prontaAtencion: 'Atención médica pronta', urgencia: 'Urgencia', emergencia: 'Emergencia vital',
    recNormal: 'Saturación adecuada. Continuá con tu actividad normal.',
    recLeve: 'Descansá, hidratate y volvé a medir en 15 minutos. Si persiste o tenés síntomas, consultá.',
    recModerada: 'Comunicate con un profesional de salud. Se suele indicar oxígeno suplementario.',
    recSevera: 'Llamá al servicio de emergencias (107/911). Requiere oxigenoterapia inmediata.',
    recCritica: 'Traslado urgente a guardia. Riesgo de daño neurológico y cardiovascular.',
    rango: '95–100%', rangoAlt2500: '90–95% (ajustado por altitud)', rangoAlt1500: '93–97% (ajustado por altitud)',
    brad: ' Bradicardia asociada (pulso < 60).', taq: ' Taquicardia asociada (pulso > 100), posible compensación por baja SpO2.',
    insightTitle: 'Qué significa tu saturación',
    insightOk: (s, r) => `Tu SpO2 de **${s}%** está dentro del rango esperado (**${r}**). El oxígeno en sangre es adecuado.`,
    insightBad: (s, cat, r, rec) => `Tu SpO2 de **${s}%** indica **${cat}** (por debajo de **${r}**). ${rec}`,
    segCritica: 'Crítica', segSevera: 'Severa', segModerada: 'Moderada', segLeve: 'Leve', segNormal: 'Normal',
    markerLabel: (s) => `Tu SpO2: ${s}%`, aria: 'Escala de saturación de oxígeno: crítica, severa, moderada, leve y normal.',
  },
  en: {
    err: 'Enter a valid SpO2 value (50–100%).',
    normal: 'Normal ✅', leve: 'Mild hypoxemia', moderada: 'Moderate hypoxemia', severa: 'Severe hypoxemia', critica: 'Critical hypoxemia',
    sinAlerta: 'No alert', precaucion: 'Caution', prontaAtencion: 'Seek medical care soon', urgencia: 'Urgent', emergencia: 'Life-threatening emergency',
    recNormal: 'Adequate saturation. Carry on with your normal activity.',
    recLeve: 'Rest, hydrate and re-measure in 15 minutes. If it persists or you have symptoms, see a doctor.',
    recModerada: 'Contact a healthcare professional. Supplemental oxygen is often indicated.',
    recSevera: 'Call emergency services (911). Immediate oxygen therapy is required.',
    recCritica: 'Urgent transfer to the ER. Risk of neurological and cardiovascular damage.',
    rango: '95–100%', rangoAlt2500: '90–95% (altitude-adjusted)', rangoAlt1500: '93–97% (altitude-adjusted)',
    brad: ' Associated bradycardia (pulse < 60).', taq: ' Associated tachycardia (pulse > 100), possible compensation for low SpO2.',
    insightTitle: 'What your saturation means',
    insightOk: (s, r) => `Your SpO2 of **${s}%** is within the expected range (**${r}**). Blood oxygen is adequate.`,
    insightBad: (s, cat, r, rec) => `Your SpO2 of **${s}%** indicates **${cat}** (below **${r}**). ${rec}`,
    segCritica: 'Critical', segSevera: 'Severe', segModerada: 'Moderate', segLeve: 'Mild', segNormal: 'Normal',
    markerLabel: (s) => `Your SpO2: ${s}%`, aria: 'Blood oxygen saturation scale: critical, severe, moderate, mild and normal.',
  },
};

export function pulsoArterialOximetriaSaturacionNormal(i: Inputs): Outputs {
  const lang: Lang = i.__lang === 'en' ? 'en' : 'es';
  const t = STR[lang];

  const spo2 = Number(i.spo2);
  const fc = Number(i.frecuenciaCardiaca) || 0;
  const altitud = Number(i.altitud) || 0;

  if (!spo2 || spo2 < 50 || spo2 > 100) throw new Error(t.err);

  // Rango esperado ajustado por altitud (a gran altura la SpO2 normal baja).
  let minNormal = 95;
  let rangoEsperado = t.rango;
  if (altitud >= 2500) { minNormal = 90; rangoEsperado = t.rangoAlt2500; }
  else if (altitud >= 1500) { minNormal = 93; rangoEsperado = t.rangoAlt1500; }

  let categoria: string, nivelAlerta: string, recomendacion: string;
  let requiereAtencion = false;
  if (spo2 >= minNormal) { categoria = t.normal; nivelAlerta = t.sinAlerta; recomendacion = t.recNormal; }
  else if (spo2 >= 90) { categoria = t.leve; nivelAlerta = t.precaucion; recomendacion = t.recLeve; requiereAtencion = true; }
  else if (spo2 >= 85) { categoria = t.moderada; nivelAlerta = t.prontaAtencion; recomendacion = t.recModerada; requiereAtencion = true; }
  else if (spo2 >= 80) { categoria = t.severa; nivelAlerta = t.urgencia; recomendacion = t.recSevera; requiereAtencion = true; }
  else { categoria = t.critica; nivelAlerta = t.emergencia; recomendacion = t.recCritica; requiereAtencion = true; }

  let obsFC = '';
  if (fc > 0) { if (fc < 60) obsFC = t.brad; else if (fc > 100) obsFC = t.taq; }

  const chart = {
    type: 'scale' as const,
    marker: spo2,
    markerLabel: t.markerLabel(spo2),
    min: 70,
    unit: '%',
    segments: [
      { nombre: t.segCritica, max: 80, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: t.segSevera, max: 85, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: t.segModerada, max: 90, color: '#fde68a', colorDark: '#b45309' },
      { nombre: t.segLeve, max: 95, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: t.segNormal, max: Math.max(100, Math.ceil(spo2) + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: t.aria,
  };

  const catLimpia = categoria.replace(/[^\p{L}\p{N}\s%-]/gu, '').trim();
  return {
    categoria,
    nivelAlerta,
    rangoEsperado,
    recomendacion,
    resumen: `SpO2 ${spo2}% → ${catLimpia}. ${recomendacion}${obsFC}`,
    _chart: chart,
    _insight: {
      title: t.insightTitle,
      text: requiereAtencion ? t.insightBad(spo2, catLimpia, rangoEsperado, recomendacion) : t.insightOk(spo2, rangoEsperado),
      tone: requiereAtencion ? 'warn' : 'good',
      icon: !requiereAtencion ? '🫁' : (spo2 < 85 ? '🚨' : '⚠️'),
    },
  };
}
