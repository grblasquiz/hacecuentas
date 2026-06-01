/** Test de Edinburgh para depresión posparto (EPDS) */
export interface Inputs { epds1: string; epds2: string; epds3: string; epds4: string; epds5: string; epds6: string; epds7: string; epds8: string; epds9: string; epds10: string; __lang?: string; }
export interface Outputs { puntaje: string; interpretacion: string; recomendacion: string; recursos: string; _chart?: any; _insight?: any; }

export function depresionPospartoTest(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      interp_q10: '⚠️ ATENCIÓN: La respuesta a la pregunta sobre hacerte daño requiere evaluación inmediata.',
      rec_q10: 'Por favor, buscá ayuda AHORA. Llamá al 135 (línea de crisis, gratuita, 24 hs) o acercate a la guardia más cercana. No estás sola.',
      interp_low: 'Bajo riesgo de depresión posparto.',
      rec_low: 'Tu puntaje es bajo, lo cual es una buena señal. Si en algún momento sentís que las cosas cambian, no dudes en buscar ayuda.',
      interp_mild: 'Posible depresión leve. Merece atención.',
      rec_mild: 'Recomendamos hablar con tu obstetra, pediatra o médico de cabecera sobre cómo te sentís. También podés consultar con un psicólogo.',
      interp_high: 'Probable depresión posparto.',
      rec_high: 'Este puntaje sugiere que podrías estar atravesando una depresión posparto. Buscá ayuda profesional (psicólogo/psiquiatra). El tratamiento es efectivo y hay opciones compatibles con la lactancia.',
      markerLabel: 'Tu puntaje: ',
      seg0: 'Bajo riesgo',
      seg1: 'Posible (leve)',
      seg2: 'Probable depresión',
      ariaLabel: 'Escala EPDS de depresión posparto: bajo riesgo hasta 9, posible leve 10 a 12, probable depresión 13 o más',
      recursos: 'Centro de asistencia al suicida: 135 (24 hs, gratuito). Tu obstetra, pediatra o médico pueden derivarte a salud mental. Muchas obras sociales cubren psicoterapia.',
      ins_icon: '🤱',
      ins_q10_title: 'Buscá ayuda ahora',
      ins_q10_text: (t: number) => `Más allá del puntaje (**${t}/30**), marcaste pensamientos de hacerte daño: eso pide atención inmediata. Llamá al **135** (24 hs, gratis) o andá a una guardia. **No estás sola.**`,
      ins_low_title: (t: number) => `Puntaje ${t}/30: bajo riesgo`,
      ins_low_text: (t: number) => `Con **${t}/30** estás en la zona verde de la escala EPDS (corte en 10). Buena señal. Si algo cambia, repetí el test y hablalo con tu médico.`,
      ins_mild_title: (t: number) => `Puntaje ${t}/30: posible depresión leve`,
      ins_mild_text: (t: number) => `**${t}/30** supera el corte de **10** que sugiere malestar emocional. No es un diagnóstico, pero merece que hables con tu obstetra, pediatra o un psicólogo.`,
      ins_high_title: (t: number) => `Puntaje ${t}/30: probable depresión`,
      ins_high_text: (t: number) => `Con **${t}/30** (≥13) la escala sugiere depresión posparto probable. Buscá ayuda profesional: el tratamiento es efectivo y hay opciones compatibles con la lactancia.`,
    },
    en: {
      interp_q10: '⚠️ ATTENTION: Your answer to the self-harm question requires immediate evaluation.',
      rec_q10: 'Please seek help NOW. Call or text a crisis line (e.g. 988 Suicide & Crisis Lifeline) or go to the nearest emergency room. You are not alone.',
      interp_low: 'Low risk of postpartum depression.',
      rec_low: 'Your score is low, which is a good sign. If at any point you feel things are changing, don\'t hesitate to reach out for help.',
      interp_mild: 'Possible mild depression. Deserves attention.',
      rec_mild: 'We recommend speaking with your obstetrician, pediatrician, or primary care doctor about how you\'re feeling. You may also consider consulting a mental health professional.',
      interp_high: 'Probable postpartum depression.',
      rec_high: 'This score suggests you may be experiencing postpartum depression. Please seek professional help (psychologist/psychiatrist). Treatment is effective and there are options compatible with breastfeeding.',
      markerLabel: 'Your score: ',
      seg0: 'Low risk',
      seg1: 'Possible (mild)',
      seg2: 'Probable depression',
      ariaLabel: 'EPDS postpartum depression scale: low risk up to 9, possible mild 10 to 12, probable depression 13 or more',
      recursos: 'Crisis support: 988 Suicide & Crisis Lifeline (call or text 988, 24/7, free). Your OB, pediatrician, or doctor can refer you to mental health services. Many insurance plans cover psychotherapy.',
      ins_icon: '🤱',
      ins_q10_title: 'Seek help now',
      ins_q10_text: (t: number) => `Beyond the score (**${t}/30**), you flagged thoughts of self-harm: that needs immediate attention. Call or text **988** (24/7, free) or go to an emergency room. **You are not alone.**`,
      ins_low_title: (t: number) => `Score ${t}/30: low risk`,
      ins_low_text: (t: number) => `At **${t}/30** you're in the green zone of the EPDS scale (cutoff at 10). A good sign. If things change, retake the test and talk to your doctor.`,
      ins_mild_title: (t: number) => `Score ${t}/30: possible mild depression`,
      ins_mild_text: (t: number) => `**${t}/30** is above the **10** cutoff that suggests emotional distress. It's not a diagnosis, but it's worth talking to your OB, pediatrician, or a psychologist.`,
      ins_high_title: (t: number) => `Score ${t}/30: probable depression`,
      ins_high_text: (t: number) => `At **${t}/30** (≥13) the scale suggests probable postpartum depression. Seek professional help: treatment is effective and there are breastfeeding-compatible options.`,
    },
  } as const)[__lang];

  const valores = [i.epds1, i.epds2, i.epds3, i.epds4, i.epds5, i.epds6, i.epds7, i.epds8, i.epds9, i.epds10];
  const total = valores.reduce((sum, v) => sum + (Number(v) || 0), 0);
  const q10 = Number(i.epds10) || 0;

  let interpretacion = '', recomendacion = '';

  if (q10 > 0) {
    interpretacion = T.interp_q10;
    recomendacion = T.rec_q10;
  } else if (total <= 9) {
    interpretacion = T.interp_low;
    recomendacion = T.rec_low;
  } else if (total <= 12) {
    interpretacion = T.interp_mild;
    recomendacion = T.rec_mild;
  } else {
    interpretacion = T.interp_high;
    recomendacion = T.rec_high;
  }

  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: T.markerLabel + total,
    min: 0,
    unit: '',
    segments: [
      { nombre: T.seg0, max: 9, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.seg1, max: 12, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.seg2, max: 30, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: T.ariaLabel,
  };

  let insTitle: string, insText: string, insTone: string;
  if (q10 > 0) {
    insTitle = T.ins_q10_title;
    insText = T.ins_q10_text(total);
    insTone = 'warn';
  } else if (total <= 9) {
    insTitle = T.ins_low_title(total);
    insText = T.ins_low_text(total);
    insTone = 'good';
  } else if (total <= 12) {
    insTitle = T.ins_mild_title(total);
    insText = T.ins_mild_text(total);
    insTone = 'neutral';
  } else {
    insTitle = T.ins_high_title(total);
    insText = T.ins_high_text(total);
    insTone = 'warn';
  }
  const insight = { title: insTitle, text: insText, tone: insTone, icon: T.ins_icon };
  return {
    puntaje: `${total}/30`,
    interpretacion,
    recomendacion,
    recursos: T.recursos,
    _chart: chart,
    _insight: insight,
  };
}
