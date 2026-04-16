/** Fertilidad masculina según edad */
export interface Inputs { edadHombre: number; }
export interface Outputs { calidadEsperma: string; tiempoConcepcion: string; riesgos: string; recomendacion: string; }

export function fertilidadMasculinaEdad(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadHombre));
  if (edad < 18 || edad > 60) throw new Error('Ingresá una edad entre 18 y 60');

  let calidad = '', tiempo = '', riesgos = '', rec = '';

  if (edad < 30) {
    calidad = 'Óptima. Motilidad ~60%, morfología ~10-15%, fragmentación ADN baja.';
    tiempo = '3-6 meses promedio para concebir con pareja fértil.';
    riesgos = 'Riesgos mínimos asociados a la edad.';
    rec = 'Fertilidad en su mejor momento. Mantené hábitos saludables.';
  } else if (edad < 35) {
    calidad = 'Muy buena. Leve descenso de motilidad (~55%). Calidad general alta.';
    tiempo = '3-6 meses promedio.';
    riesgos = 'Riesgos muy bajos. Sin diferencias clínicas significativas vs. < 30.';
    rec = 'Sin preocupaciones. Mantené actividad física y evitá tabaco.';
  } else if (edad < 40) {
    calidad = 'Buena con descenso leve. Motilidad ~50%, mayor fragmentación ADN (~20%).';
    tiempo = '6-9 meses promedio.';
    riesgos = 'Leve aumento en tiempo de concepción. Mayor tasa de aborto espontáneo.';
    rec = 'Si llevan > 6 meses buscando, considerar espermograma.';
  } else if (edad < 45) {
    calidad = 'Descenso moderado. Motilidad ~40-45%, fragmentación ADN 25-30%.';
    tiempo = '6-12 meses promedio.';
    riesgos = 'Mayor tasa de mutaciones de novo. Leve aumento riesgo de autismo y otras condiciones genéticas.';
    rec = 'Recomendable hacer espermograma + fragmentación ADN si buscan embarazo.';
  } else {
    calidad = 'Descenso significativo. Motilidad ~35%, volumen reducido, fragmentación ADN 30-40%.';
    tiempo = '12-18+ meses promedio. Puede requerir asistencia reproductiva.';
    riesgos = 'Mayor tasa de mutaciones genéticas, mayor riesgo de aborto, mayor tiempo de concepción. Riesgo aumentado de condiciones genéticas en la descendencia.';
    rec = 'Consultá con urólogo/andrólogo. Considerar criopreservación si posponés paternidad.';
  }

  return { calidadEsperma: calidad, tiempoConcepcion: tiempo, riesgos, recomendacion: rec };
}
