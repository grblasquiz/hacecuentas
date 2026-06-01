/** Fertilidad masculina según edad */
export interface Inputs { edadHombre: number; __lang?: string; }
export interface Outputs { calidadEsperma: string; detalleParametros: string; tiempoConcepcion: string; riesgos: string; recomendacion: string; }

export function fertilidadMasculinaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const edad = Math.round(Number(i.edadHombre));
  if (edad < 18 || edad > 60) throw new Error(__lang === 'en' ? 'Enter an age between 18 and 60' : 'Ingresá una edad entre 18 y 60');

  let calidad = '', parametros = '', tiempo = '', riesgos = '', rec = '';

  if (edad < 30) {
    calidad = __lang === 'en' ? 'Optimal' : 'Óptima';
    parametros = __lang === 'en' ? 'Motility ~60%, morphology ~10-15%, low DNA fragmentation.' : 'Motilidad ~60%, morfología ~10-15%, fragmentación ADN baja.';
    tiempo = __lang === 'en' ? '3-6 months average to conceive with a fertile partner.' : '3-6 meses promedio para concebir con pareja fértil.';
    riesgos = __lang === 'en' ? 'Minimal age-related risks.' : 'Riesgos mínimos asociados a la edad.';
    rec = __lang === 'en' ? 'Fertility at its best. Maintain healthy habits.' : 'Fertilidad en su mejor momento. Mantené hábitos saludables.';
  } else if (edad < 35) {
    calidad = __lang === 'en' ? 'Very good' : 'Muy buena';
    parametros = __lang === 'en' ? 'Slight motility decline (~55%). Overall quality remains high.' : 'Leve descenso de motilidad (~55%). Calidad general alta.';
    tiempo = __lang === 'en' ? '3-6 months average.' : '3-6 meses promedio.';
    riesgos = __lang === 'en' ? 'Very low risks. No significant clinical differences vs. < 30.' : 'Riesgos muy bajos. Sin diferencias clínicas significativas vs. < 30.';
    rec = __lang === 'en' ? 'No concerns. Stay physically active and avoid tobacco.' : 'Sin preocupaciones. Mantené actividad física y evitá tabaco.';
  } else if (edad < 40) {
    calidad = __lang === 'en' ? 'Good with mild decline' : 'Buena con descenso leve';
    parametros = __lang === 'en' ? 'Motility ~50%, higher DNA fragmentation (~20%).' : 'Motilidad ~50%, mayor fragmentación ADN (~20%).';
    tiempo = __lang === 'en' ? '6-9 months average.' : '6-9 meses promedio.';
    riesgos = __lang === 'en' ? 'Mild increase in time to conception. Higher spontaneous miscarriage rate.' : 'Leve aumento en tiempo de concepción. Mayor tasa de aborto espontáneo.';
    rec = __lang === 'en' ? 'If trying for > 6 months, consider a semen analysis.' : 'Si llevan > 6 meses buscando, considerar espermograma.';
  } else if (edad < 45) {
    calidad = __lang === 'en' ? 'Moderate decline' : 'Descenso moderado';
    parametros = __lang === 'en' ? 'Motility ~40-45%, DNA fragmentation 25-30%.' : 'Motilidad ~40-45%, fragmentación ADN 25-30%.';
    tiempo = __lang === 'en' ? '6-12 months average.' : '6-12 meses promedio.';
    riesgos = __lang === 'en' ? 'Higher rate of de novo mutations. Slight increase in risk of autism and other genetic conditions.' : 'Mayor tasa de mutaciones de novo. Leve aumento riesgo de autismo y otras condiciones genéticas.';
    rec = __lang === 'en' ? 'Recommended to get a semen analysis + DNA fragmentation test if trying to conceive.' : 'Recomendable hacer espermograma + fragmentación ADN si buscan embarazo.';
  } else {
    calidad = __lang === 'en' ? 'Significant decline' : 'Descenso significativo';
    parametros = __lang === 'en' ? 'Motility ~35%, reduced volume, DNA fragmentation 30-40%.' : 'Motilidad ~35%, volumen reducido, fragmentación ADN 30-40%.';
    tiempo = __lang === 'en' ? '12-18+ months average. Assisted reproduction may be needed.' : '12-18+ meses promedio. Puede requerir asistencia reproductiva.';
    riesgos = __lang === 'en' ? 'Higher rate of genetic mutations, higher miscarriage risk, longer time to conception. Increased risk of genetic conditions in offspring.' : 'Mayor tasa de mutaciones genéticas, mayor riesgo de aborto, mayor tiempo de concepción. Riesgo aumentado de condiciones genéticas en la descendencia.';
    rec = __lang === 'en' ? 'Consult a urologist/andrologist. Consider sperm cryopreservation if delaying fatherhood.' : 'Consultá con urólogo/andrólogo. Considerar criopreservación si posponés paternidad.';
  }

  return { calidadEsperma: calidad, detalleParametros: parametros, tiempoConcepcion: tiempo, riesgos, recomendacion: rec };
}
