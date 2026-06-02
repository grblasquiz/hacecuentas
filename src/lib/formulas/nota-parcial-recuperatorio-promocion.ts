/** Calculadora de condición académica: parciales, recuperatorio y promoción */

export interface Inputs {
  notaParcial1: number;
  notaParcial2: number;
  notaMinPromocion: number;
  promedioMinPromocion: number;
}

export interface Outputs {
  promedioParciales: number;
  condicion: string;
  notaNecesariaPromo: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function notaParcialRecuperatorioPromocion(i: Inputs): Outputs {
  const p1 = Number(i.notaParcial1);
  const p2 = Number(i.notaParcial2);
  const notaMin = Number(i.notaMinPromocion);
  const promedioMin = Number(i.promedioMinPromocion);

  if (isNaN(p1) || p1 < 0 || p1 > 10) {
    throw new Error('La nota del primer parcial debe estar entre 0 y 10');
  }
  if (isNaN(p2) || p2 < 0 || p2 > 10) {
    throw new Error('La nota del segundo parcial debe estar entre 0 y 10');
  }
  if (isNaN(notaMin) || notaMin < 4 || notaMin > 8) {
    throw new Error('La nota mínima para promoción debe estar entre 4 y 8');
  }
  if (isNaN(promedioMin) || promedioMin < 4 || promedioMin > 10) {
    throw new Error('El promedio mínimo para promoción debe estar entre 4 y 10');
  }

  const promedio = (p1 + p2) / 2;
  const minimaOk = p1 >= notaMin && p2 >= notaMin;
  const promedioPromoOk = promedio >= promedioMin;
  const ambosAprobados = p1 >= 4 && p2 >= 4;

  let condicion: string;
  if (minimaOk && promedioPromoOk) {
    condicion = '🎉 ¡Promocionás! No necesitás rendir final.';
  } else if (ambosAprobados && promedio >= 4) {
    condicion = '📝 Quedás regular. Tenés que rendir final.';
  } else {
    condicion = '❌ Quedás libre. Necesitás recuperar o recursar.';
  }

  // Calcular qué nota necesitaba para promocionar
  let notaNecesaria: string;
  if (minimaOk && promedioPromoOk) {
    notaNecesaria = 'Ya promocionaste.';
  } else {
    const notaFaltanteP2 = promedioMin * 2 - p1;
    const notaFaltanteP1 = promedioMin * 2 - p2;
    const mejorOpcion = Math.min(notaFaltanteP1, notaFaltanteP2);
    if (mejorOpcion > 10) {
      notaNecesaria = 'No es posible promocionar con estas notas.';
    } else {
      const cual = notaFaltanteP2 <= notaFaltanteP1 ? 'segundo' : 'primer';
      const notaReq = Math.max(notaMin, cual === 'segundo' ? notaFaltanteP2 : notaFaltanteP1);
      notaNecesaria = notaReq <= 10
        ? `Necesitarías un ${Math.ceil(notaReq)} en el ${cual} parcial (recuperatorio) para promocionar.`
        : 'No es posible promocionar con estas notas.';
    }
  }

  const promedioOut = Math.round(promedio * 100) / 100;

  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let insightText: string;
  if (minimaOk && promedioPromoOk) {
    tone = 'good';
    icon = '🎉';
    insightText = `Con parciales de **${p1}** y **${p2}** (promedio **${promedioOut}**) superás tanto la mínima por parcial (**${notaMin}**) como el promedio de promoción (**${promedioMin}**): promocionás y te ahorrás el final.`;
  } else if (ambosAprobados && promedio >= 4) {
    tone = 'neutral';
    icon = '📝';
    const motivo = !minimaOk
      ? `alguno de tus parciales quedó por debajo del mínimo de **${notaMin}** que pide la promoción`
      : `tu promedio **${promedioOut}** no llega al **${promedioMin}** requerido para promocionar`;
    insightText = `Aprobaste ambos parciales (**${p1}** y **${p2}**), así que quedás regular y rendís final. ${motivo[0].toUpperCase() + motivo.slice(1)}.`;
  } else {
    tone = 'warn';
    icon = '⚠️';
    const cuales = p1 < 4 && p2 < 4 ? 'ambos parciales' : (p1 < 4 ? 'el primer parcial' : 'el segundo parcial');
    insightText = `Quedás libre: ${cuales} por debajo de 4 (tenés ${p1} y ${p2}). Vas a tener que recuperar o recursar la materia.`;
  }

  const topMax = promedio >= 10 ? 10.5 : 10;
  const segments: Array<{ nombre: string; max: number; color: string; colorDark: string }> = [];
  segments.push({ nombre: 'Libre', max: 4, color: '#ef4444', colorDark: '#dc2626' });
  if (promedioMin > 4) {
    segments.push({ nombre: 'Regular', max: promedioMin, color: '#eab308', colorDark: '#ca8a04' });
  }
  segments.push({ nombre: 'Promoción', max: topMax, color: '#22c55e', colorDark: '#16a34a' });

  return {
    promedioParciales: promedioOut,
    condicion,
    notaNecesariaPromo: notaNecesaria,
    detalle: `Parcial 1: ${p1} | Parcial 2: ${p2} | Promedio: ${promedio.toFixed(2)} | Mínima por parcial: ${notaMin} | Promedio mínimo promoción: ${promedioMin}`,
    _insight: { title: 'Tu condición en la materia', text: insightText, tone, icon },
    _chart: {
      type: 'scale',
      marker: promedioOut,
      markerLabel: `Promedio ${promedioOut}`,
      min: 0,
      segments,
      ariaLabel: `El promedio de parciales ${promedioOut} sobre una escala de 0 a 10, con zonas de libre, regular y promoción`,
    },
  };
}
