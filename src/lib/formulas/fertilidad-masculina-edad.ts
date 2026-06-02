/** Fertilidad masculina según edad */
export interface Inputs { edadHombre: number; __lang?: string; }
export interface Outputs { calidadEsperma: string; detalleParametros: string; tiempoConcepcion: string; riesgos: string; recomendacion: string; _insight?: any; }

export function fertilidadMasculinaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const edad = Math.round(Number(i.edadHombre));
  if (edad < 18 || edad > 60) throw new Error(__lang === 'en' ? 'Enter an age between 18 and 60' : 'Ingresá una edad entre 18 y 60');

  let calidad = '', parametros = '', tiempo = '', riesgos = '', rec = '';
  let insText = '', insTone: 'good' | 'warn' | 'neutral' = 'neutral';

  if (edad < 30) {
    calidad = __lang === 'en' ? 'Optimal' : 'Óptima';
    parametros = __lang === 'en' ? 'Motility ~60%, morphology ~10-15%, low DNA fragmentation.' : 'Motilidad ~60%, morfología ~10-15%, fragmentación ADN baja.';
    tiempo = __lang === 'en' ? '3-6 months average to conceive with a fertile partner.' : '3-6 meses promedio para concebir con pareja fértil.';
    riesgos = __lang === 'en' ? 'Minimal age-related risks.' : 'Riesgos mínimos asociados a la edad.';
    rec = __lang === 'en' ? 'Fertility at its best. Maintain healthy habits.' : 'Fertilidad en su mejor momento. Mantené hábitos saludables.';
    insTone = 'good';
    insText = __lang === 'en' ? `At **${edad}** male fertility is at its peak: motility around **60%** and low DNA fragmentation. Time to conceive averages just **3-6 months** with a fertile partner.` : `A los **${edad}** la fertilidad masculina está en su pico: motilidad cercana al **60%** y baja fragmentación de ADN. El tiempo a la concepción promedia apenas **3-6 meses** con pareja fértil.`;
  } else if (edad < 35) {
    calidad = __lang === 'en' ? 'Very good' : 'Muy buena';
    parametros = __lang === 'en' ? 'Slight motility decline (~55%). Overall quality remains high.' : 'Leve descenso de motilidad (~55%). Calidad general alta.';
    tiempo = __lang === 'en' ? '3-6 months average.' : '3-6 meses promedio.';
    riesgos = __lang === 'en' ? 'Very low risks. No significant clinical differences vs. < 30.' : 'Riesgos muy bajos. Sin diferencias clínicas significativas vs. < 30.';
    rec = __lang === 'en' ? 'No concerns. Stay physically active and avoid tobacco.' : 'Sin preocupaciones. Mantené actividad física y evitá tabaco.';
    insTone = 'good';
    insText = __lang === 'en' ? `At **${edad}** quality is still very good (motility ~**55%**), with no significant clinical difference versus men under 30. Average time to conceive stays around **3-6 months**.` : `A los **${edad}** la calidad sigue muy buena (motilidad ~**55%**), sin diferencia clínica significativa respecto de menores de 30. El tiempo promedio a la concepción se mantiene en **3-6 meses**.`;
  } else if (edad < 40) {
    calidad = __lang === 'en' ? 'Good with mild decline' : 'Buena con descenso leve';
    parametros = __lang === 'en' ? 'Motility ~50%, higher DNA fragmentation (~20%).' : 'Motilidad ~50%, mayor fragmentación ADN (~20%).';
    tiempo = __lang === 'en' ? '6-9 months average.' : '6-9 meses promedio.';
    riesgos = __lang === 'en' ? 'Mild increase in time to conception. Higher spontaneous miscarriage rate.' : 'Leve aumento en tiempo de concepción. Mayor tasa de aborto espontáneo.';
    rec = __lang === 'en' ? 'If trying for > 6 months, consider a semen analysis.' : 'Si llevan > 6 meses buscando, considerar espermograma.';
    insTone = 'neutral';
    insText = __lang === 'en' ? `From **${edad}** a mild decline begins: motility around **50%** and DNA fragmentation near **20%**. Average time to conceive lengthens to **6-9 months** — consider a semen analysis if trying for over 6.` : `Desde los **${edad}** empieza un descenso leve: motilidad cercana al **50%** y fragmentación de ADN en torno al **20%**. El tiempo promedio se alarga a **6-9 meses** — considerá un espermograma si llevan más de 6 buscando.`;
  } else if (edad < 45) {
    calidad = __lang === 'en' ? 'Moderate decline' : 'Descenso moderado';
    parametros = __lang === 'en' ? 'Motility ~40-45%, DNA fragmentation 25-30%.' : 'Motilidad ~40-45%, fragmentación ADN 25-30%.';
    tiempo = __lang === 'en' ? '6-12 months average.' : '6-12 meses promedio.';
    riesgos = __lang === 'en' ? 'Higher rate of de novo mutations. Slight increase in risk of autism and other genetic conditions.' : 'Mayor tasa de mutaciones de novo. Leve aumento riesgo de autismo y otras condiciones genéticas.';
    rec = __lang === 'en' ? 'Recommended to get a semen analysis + DNA fragmentation test if trying to conceive.' : 'Recomendable hacer espermograma + fragmentación ADN si buscan embarazo.';
    insTone = 'warn';
    insText = __lang === 'en' ? `At **${edad}** the decline is moderate: motility **40-45%**, DNA fragmentation **25-30%**, and more de novo mutations. Average time to conceive is **6-12 months** — a semen analysis plus DNA fragmentation test is recommended.` : `A los **${edad}** el descenso es moderado: motilidad **40-45%**, fragmentación de ADN **25-30%** y más mutaciones de novo. El tiempo promedio es de **6-12 meses** — se recomienda espermograma más test de fragmentación de ADN.`;
  } else {
    calidad = __lang === 'en' ? 'Significant decline' : 'Descenso significativo';
    parametros = __lang === 'en' ? 'Motility ~35%, reduced volume, DNA fragmentation 30-40%.' : 'Motilidad ~35%, volumen reducido, fragmentación ADN 30-40%.';
    tiempo = __lang === 'en' ? '12-18+ months average. Assisted reproduction may be needed.' : '12-18+ meses promedio. Puede requerir asistencia reproductiva.';
    riesgos = __lang === 'en' ? 'Higher rate of genetic mutations, higher miscarriage risk, longer time to conception. Increased risk of genetic conditions in offspring.' : 'Mayor tasa de mutaciones genéticas, mayor riesgo de aborto, mayor tiempo de concepción. Riesgo aumentado de condiciones genéticas en la descendencia.';
    rec = __lang === 'en' ? 'Consult a urologist/andrologist. Consider sperm cryopreservation if delaying fatherhood.' : 'Consultá con urólogo/andrólogo. Considerar criopreservación si posponés paternidad.';
    insTone = 'warn';
    insText = __lang === 'en' ? `At **${edad}** the decline is significant: motility ~**35%**, DNA fragmentation **30-40%**, and more genetic mutations. Average time to conceive is **12-18+ months** and assisted reproduction may be needed — a urology/andrology consult is advised.` : `A los **${edad}** el descenso es significativo: motilidad ~**35%**, fragmentación de ADN **30-40%** y más mutaciones genéticas. El tiempo promedio es de **12-18+ meses** y puede requerir reproducción asistida — conviene consulta con urólogo/andrólogo.`;
  }

  return { calidadEsperma: calidad, detalleParametros: parametros, tiempoConcepcion: tiempo, riesgos, recomendacion: rec, _insight: { title: __lang === 'en' ? 'Fertility at your age' : 'Tu fertilidad a esta edad', text: insText, tone: insTone, icon: '👨' } };
}
