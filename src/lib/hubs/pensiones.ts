import type { HubData } from './types';
import { ANSES_VIGENTE } from '../data/anses-vigente';
export const HABER_MINIMO = ANSES_VIGENTE.haberMinimo;
export const PUAM = ANSES_VIGENTE.puam;
const ars = (n: number) => n.toLocaleString('es-AR', {style:'currency',currency:'ARS'});
export const PNC_INVALIDEZ = Math.round(HABER_MINIMO*.7*100)/100;
export const PNC_MADRE7 = HABER_MINIMO;
export const CASE_MATH = { viudezSinHijos:70, viudezConHijos:50, viudezPorHijo:20 };

export const hub: HubData = {
  slug: 'jubilacion/pensiones',
  title: "Pensiones ANSES: viudez, PUAM y montos de PNC",
  description: "Estimá el reparto de una pensión por fallecimiento de una persona jubilada y consultá referencias oficiales de PUAM y PNC, sin confundir monto con elegibilidad.",
  silo: "Jubilación",
  siloHref: '/jubilacion',
  eyebrow: "Guía previsional ANSES",
  h1: "¿Me corresponde una pensión?",
  lede: "La pensión derivada depende del vínculo y de los derechohabientes. La PUAM y las pensiones no contributivas tienen requisitos propios: un importe de referencia no confirma el derecho a cobrarlas.",
  stamps: ["Régimen general", "Fuentes oficiales"],
  resultLabel: "Estimación orientativa",
  inputsTitle: "Tus datos",
  inputsIntro: "No ingreses datos identificatorios.",
  fields: [],
  answer: {"title": "El reparto requiere derechohabientes y un haber de referencia", "copy": "Para el fallecimiento de una persona jubilada se aplica el reparto legal sobre su prestación. La PUAM y las PNC se muestran como referencias separadas; el cuadro no determina elegibilidad.", "yes": ["70% para pareja sin hijos con derecho", "50% para pareja con hijos y 20% por hijo; tope conjunto del 100%", "Incremento y prorrateo para hijos sin pareja con derecho"], "warn": ["No usar el salario de una persona fallecida en actividad", "Los vínculos no acreditados requieren evaluación de ANSES"], "plazo": "Consultá la historia laboral y los requisitos del trámite oficial en ANSES."},
  fineprint: "El derecho y el haber los determina ANSES con la documentación del caso.",
  chart: {"type": "bars", "caption": "Referencias mensuales sin bono ni descuentos."},
  breakdownTitle: "Cómo se calcula",
  breakdownIntro: "Supuestos explícitos y fuentes oficiales.",
  faq: [{"q": "¿Cuánto corresponde a la pareja sin hijos con derecho?", "a": "En el supuesto de fallecimiento de una persona jubilada, el porcentaje de referencia es 70% de la prestación del causante. No es el 70% de cualquier salario y no incluye automáticamente bonos o descuentos."}, {"q": "¿Cómo se reparte con hijos con derecho?", "a": "Con pareja con derecho, se asigna 50% a la pareja y 20% por hijo. Si el total supera 100%, se reduce proporcionalmente. Sólo se incluyen hijos que cumplan las condiciones legales; no todos los hijos integran el reparto."}, {"q": "¿Qué pasa si sólo hay hijos con derecho?", "a": "El 50% previsto para la pareja se distribuye entre los hijos con derecho, además del 20% por cada uno. Rige el tope conjunto del 100% y el prorrateo proporcional."}, {"q": "¿La convivencia alcanza para cobrar?", "a": "ANSES exige acreditar el vínculo y la convivencia: en general cinco años anteriores al fallecimiento o dos si hay hijos reconocidos por ambos. Casos con cónyuge separado, concurrencia de vínculos o documentación discutida requieren evaluación individual."}, {"q": "¿Sirve si falleció una persona que trabajaba?", "a": "Esta calculadora distribuye el haber de una persona que ya estaba jubilada. La pensión por fallecimiento de un trabajador requiere verificar regularidad de aportes y determinar la base correspondiente; no uses directamente su sueldo en este formulario."}, {"q": "¿Qué es la PUAM?", "a": "Es una prestación para personas de 65 años o más que cumplen los requisitos oficiales de residencia e incompatibilidades. Su referencia sin bono es 80% del haber mínimo; no genera una pensión derivada."}, {"q": "¿La cifra de PNC por invalidez confirma que me corresponde?", "a": "No. El cuadro identifica la referencia mensual informada por la fuente oficial. El régimen aplicable, los requisitos de salud, documentación, ingresos e incompatibilidades deben verificarse en el trámite oficial vigente. No diagnosticamos incapacidad ni prometemos cobertura médica."}, {"q": "¿Cómo consulto la PNC para madres de siete o más hijos?", "a": "La referencia mensual equivale al haber mínimo, sin bono. Tener siete hijos por sí solo no confirma el derecho: revisá los requisitos y la documentación del trámite oficial."}, {"q": "¿Estos importes incluyen bono, aguinaldo o descuentos?", "a": "No. Son referencias mensuales brutas sin refuerzos, aguinaldo, descuentos ni retroactivos. El recibo y la resolución de ANSES determinan el pago individual."}],
  sources: [{"name": "Ley 24.241, artículos 53, 97 y 98", "url": "https://www.argentina.gob.ar/normativa/nacional/ley-24241-639/actualizacion"}, {"name": "Requisitos PUAM", "url": "https://www.argentina.gob.ar/servicio/tramitar-la-pension-universal-para-adulto-mayor-puam"}, {"name": "Pensiones no contributivas: trámites oficiales", "url": "https://www.argentina.gob.ar/andis/pensiones-no-contributivas"}, {"name": "Importes oficiales del mes: ANSES y Seguridad Social", "url": "https://www.argentina.gob.ar/trabajo/seguridadsocial/imss"}],
  lastReviewed: '2026-11-17',
  audience: "AR",
  replaces: [
    '/calculadora-pension-viudez-porcentaje-conyuge',
    '/calculadora-pension-no-contributiva-madre-7-hijos-anses-2026',
    '/calculadora-puam-pension-universal-adulto-mayor-anses-2026',
    '/calculadora-pension-invalidez-anses-no-contributiva-2026-cuantia',
    '/calculadora-pami-prestaciones-monto-copago-2026',
    // PNC por invalidez duplicada bajo nombre de "asignación": la fórmula es la
    // misma (70% del haber mínimo, Decreto 432/97), no es una asignación
    // familiar. Se absorbe acá y no en el hub de asignaciones.
    '/calculadora-asignacion-discapacidad-pensionado',
  ],
};
