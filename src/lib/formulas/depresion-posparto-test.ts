/** Test de Edinburgh para depresión posparto (EPDS) */
export interface Inputs { epds1: string; epds2: string; epds3: string; epds4: string; epds5: string; epds6: string; epds7: string; epds8: string; epds9: string; epds10: string; }
export interface Outputs { puntaje: string; interpretacion: string; recomendacion: string; recursos: string; _chart?: any; }

export function depresionPospartoTest(i: Inputs): Outputs {
  const valores = [i.epds1, i.epds2, i.epds3, i.epds4, i.epds5, i.epds6, i.epds7, i.epds8, i.epds9, i.epds10];
  const total = valores.reduce((sum, v) => sum + (Number(v) || 0), 0);
  const q10 = Number(i.epds10) || 0;

  let interpretacion = '', recomendacion = '';

  if (q10 > 0) {
    interpretacion = '⚠️ ATENCIÓN: La respuesta a la pregunta sobre hacerte daño requiere evaluación inmediata.';
    recomendacion = 'Por favor, buscá ayuda AHORA. Llamá al 135 (línea de crisis, gratuita, 24 hs) o acercate a la guardia más cercana. No estás sola.';
  } else if (total <= 9) {
    interpretacion = 'Bajo riesgo de depresión posparto.';
    recomendacion = 'Tu puntaje es bajo, lo cual es una buena señal. Si en algún momento sentís que las cosas cambian, no dudes en buscar ayuda.';
  } else if (total <= 12) {
    interpretacion = 'Posible depresión leve. Merece atención.';
    recomendacion = 'Recomendamos hablar con tu obstetra, pediatra o médico de cabecera sobre cómo te sentís. También podés consultar con un psicólogo.';
  } else {
    interpretacion = 'Probable depresión posparto.';
    recomendacion = 'Este puntaje sugiere que podrías estar atravesando una depresión posparto. Buscá ayuda profesional (psicólogo/psiquiatra). El tratamiento es efectivo y hay opciones compatibles con la lactancia.';
  }

  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: 'Tu puntaje: ' + total,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo riesgo', max: 9, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Posible (leve)', max: 12, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Probable depresión', max: 30, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala EPDS de depresión posparto: bajo riesgo hasta 9, posible leve 10 a 12, probable depresión 13 o más',
  };

  return {
    puntaje: `${total}/30`,
    interpretacion,
    recomendacion,
    recursos: 'Centro de asistencia al suicida: 135 (24 hs, gratuito). Tu obstetra, pediatra o médico pueden derivarte a salud mental. Muchas obras sociales cubren psicoterapia.',
    _chart: chart,
  };
}
