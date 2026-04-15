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

  return {
    promedioParciales: Math.round(promedio * 100) / 100,
    condicion,
    notaNecesariaPromo: notaNecesaria,
    detalle: `Parcial 1: ${p1} | Parcial 2: ${p2} | Promedio: ${promedio.toFixed(2)} | Mínima por parcial: ${notaMin} | Promedio mínimo promoción: ${promedioMin}`,
  };
}
