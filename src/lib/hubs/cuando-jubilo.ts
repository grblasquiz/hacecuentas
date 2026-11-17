import type { HubData } from './types';
import { ANSES_VIGENTE } from '../data/anses-vigente';
export const HABER_MINIMO = ANSES_VIGENTE.haberMinimo;
export const PUAM = ANSES_VIGENTE.puam;
const ars = (n: number) => n.toLocaleString('es-AR', {style:'currency',currency:'ARS'});
export const REQUISITOS = { edadMujer:60, edadHombre:65, aniosAportes:30, puamEdad:65, puamFactor:.8 };

export const hub: HubData = {
  slug: 'jubilacion/cuando-me-jubilo',
  title: "¿Cuándo me jubilo? Edad, aportes y plan de pago ANSES",
  description: "Calculá cuánto te falta según edad, aportes y compensación por exceso de edad. Consultá el costo UCAP y la PUAM con importes oficiales.",
  silo: "Jubilación",
  siloHref: '/jubilacion',
  eyebrow: "Guía previsional ANSES",
  h1: "¿Cuándo me puedo jubilar?",
  lede: "En el régimen general se requieren 60 años para mujeres o 65 para varones y 30 años de servicios con aportes. El exceso de edad puede compensar servicios: dos años de edad excedentes equivalen a uno faltante. La estimación distingue si vas a seguir aportando.",
  stamps: ["Régimen general", "Fuentes oficiales"],
  resultLabel: "Estimación orientativa",
  inputsTitle: "Tus datos",
  inputsIntro: "No ingreses datos identificatorios.",
  fields: [],
  answer: {"title": "Edad, aportes y compensación se evalúan juntos", "copy": "La proyección combina la edad mínima con los aportes registrados y el exceso de edad. Elegí si continuarás aportando; el presupuesto UCAP es independiente y requiere períodos validados por ANSES.", "yes": ["Régimen general: 60 años para mujeres y 65 para varones", "30 años de servicios con aportes y compensación por exceso de edad", "UCAP sobre base imponible mínima oficial del mes"], "warn": ["No incluye regímenes diferenciales ni tareas de cuidado", "Los períodos a regularizar necesitan validación individual"], "plazo": "Consultá la historia laboral y los requisitos del trámite oficial en ANSES."},
  fineprint: "El derecho y el haber los determina ANSES con la documentación del caso.",
  chart: {"type": "bars", "caption": "Referencias mensuales sin bono ni descuentos."},
  breakdownTitle: "Cómo se calcula",
  breakdownIntro: "Supuestos explícitos y fuentes oficiales.",
  faq: [{"q": "¿Cuáles son los requisitos generales?", "a": "La Ley 24.241 exige edad y servicios con aportes. Este simulador usa el régimen general; docentes, tareas diferenciales, cajas provinciales y convenios requieren un análisis propio."}, {"q": "¿Cómo se compensa el exceso de edad?", "a": "El artículo 19 permite compensar dos años que excedan la edad mínima por un año de servicios faltantes, para acreditar el mínimo necesario para la PBU. La estimación incorpora esa relación y supone meses completos."}, {"q": "¿Qué pasa si no sigo aportando?", "a": "Desmarcá la opción de aportes futuros: el simulador sólo proyecta el paso de la edad y la compensación legal. No agrega meses de trabajo que no vayas a realizar."}, {"q": "¿Puedo comprar aportes antes de jubilarme?", "a": "El plan para trabajadores en actividad comprende mujeres de 50 a 59 años y varones de 55 a 64. ANSES debe validar períodos sin aportes anteriores al 31 de marzo de 2012, desde los 18 años, y las demás condiciones. No todo mes faltante se puede regularizar."}, {"q": "¿Cuánto cuesta una UCAP?", "a": "La unidad equivale al 29% de la base imponible mínima vigente al pago. El presupuesto usa la referencia oficial del mes y permite elegir meses a evaluar. ANSES genera un VEP: no son 120 cuotas descontadas de una futura jubilación."}, {"q": "¿Si ya tengo la edad sólo queda la PUAM?", "a": "No se puede decidir con edad y aportes totales solamente. Hay que revisar historia laboral, compensación por edad, reconocimiento de tareas de cuidado y los períodos que pudieran encuadrar en la Ley 24.476. Consultá el encuadre en ANSES; no se presume una moratoria nueva."}, {"q": "¿Cuánto paga la PUAM?", "a": "La referencia mensual sin bono es el 80% del haber mínimo. Se publica abajo con el período oficial. Los refuerzos, descuentos y el derecho individual se verifican aparte."}, {"q": "¿Qué residencia exige la PUAM?", "a": "Se pide desde los 65 años y requiere residencia en Argentina. Para naturalizados son 10 años anteriores a la solicitud; para extranjeros son 20 años, incluidos los 10 inmediatamente anteriores. No debe existir otra prestación o derecho incompatible; ANSES evalúa los requisitos."}, {"q": "¿El resultado autoriza a jubilarme?", "a": "No. Es una proyección orientativa con aportes declarados por vos. Revisá la Historia Laboral de Mi ANSES y documentá períodos faltantes. No ingreses CUIL ni claves en este sitio."}],
  sources: [{"name": "Ley 24.241, artículos 19 y 37", "url": "https://www.argentina.gob.ar/normativa/nacional/ley-24241-639/actualizacion"}, {"name": "ANSES: plan para trabajadores en actividad", "url": "https://www.argentina.gob.ar/servicio/tramitar-plan-de-pago-de-deuda-previsional-para-trabajadores-en-actividad"}, {"name": "Ley 27.705, artículos 15 a 18", "url": "https://www.argentina.gob.ar/normativa/nacional/norma-380615/texto"}, {"name": "Requisitos PUAM", "url": "https://www.argentina.gob.ar/servicio/tramitar-la-pension-universal-para-adulto-mayor-puam"}, {"name": "Ley 24.476", "url": "https://www.argentina.gob.ar/normativa/nacional/ley-24476-30341/actualizacion"}, {"name": "Importes oficiales del mes: ANSES y Seguridad Social", "url": "https://www.argentina.gob.ar/trabajo/seguridadsocial/imss"}],
  lastReviewed: '2026-11-17',
  audience: "AR",
  replaces: [
    '/calculadora-comprar-anos-aportes-moratoria-previsional-cuotas',
    '/calculadora-edad-jubilacion-anos-aporte',
    '/calculadora-cuanto-falta-jubilarse-jubilacion-edad-aportes',
  ],
};
