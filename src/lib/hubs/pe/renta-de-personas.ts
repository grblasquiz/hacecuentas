import type { HubData } from '../types';
import { PERU_2026, DEDUCCION_3UIT_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "Impuesto a la renta de personas: ¿cuánto pago según de dónde
 * viene mi plata?"
 *
 * Absorbe el hub raíz `/impuestos/renta-peru` (src/lib/hubs/renta-peru.ts), que sólo
 * cubría 4ta y 5ta, y lo amplía con 1ra (alquiler) y 2da (ganancia de capital).
 *
 * Constantes: src/lib/data/peru-2026.ts. Cálculo espejado de las fórmulas vivas
 * renta-anual-trabajo-cuarta-quinta-peru.ts, renta-primera-categoria-alquiler-peru.ts,
 * renta-segunda-categoria-ganancia-capital-peru.ts, deduccion-adicional-3-uit-sunat-peru.ts
 * y suspension-retencion-cuarta-categoria-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UIT vigente: S/ 5.500 (DS 301-2025-EF, vigente desde el 01-01-2026). */
export const UIT = PERU_2026.uit;
export const UIT_ANIO = PERU_2026.anio;

/** Escala del Art. 53 LIR sobre la renta neta de trabajo, en UIT acumuladas. */
export const TRAMOS = PERU_2026.renta5ta.tramos.map((t) => ({
  hastaUit: Number.isFinite(t.hastaUit) ? t.hastaUit : null,
  tasa: t.tasa,
}));

/** Deducción fija de rentas de trabajo: 7 UIT (Art. 46 LIR). */
export const DEDUCCION_UIT = PERU_2026.renta5ta.deduccionUit;
/** 4ta categoría: deducción del 20% con tope de 24 UIT (Art. 45 LIR). */
export const DEDUCCION_4TA = 0.2;
export const TOPE_4TA_UIT = 24;
/** Deducción adicional por gastos, tope 3 UIT (Art. 46 LIR) y porcentaje por rubro. */
export const ADICIONAL_3UIT = DEDUCCION_3UIT_2026;

/** Tasas efectivas de 1ra y 2da categoría: 6,25% sobre la renta neta (80% del bruto) = 5% efectivo. */
export const TASA_EFECTIVA_CAPITAL = 0.05;
export const TASA_RENTA_NETA_CAPITAL = 0.0625;
export const DEDUCCION_CAPITAL = 0.2;
/** Renta mínima presunta del alquiler: 6% del autovalúo (Art. 23 LIR). */
export const PRESUNTA_ALQUILER = 0.06;

/** Umbrales de suspensión de retenciones de 4ta (R.S. 013-2007/SUNAT). */
export const SUSPENSION = { generalUit: 8.75, incisoBUit: 7, retencion: 0.08, pisoRecibo: 1500 };

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/impuestos/renta-de-personas',
  title: 'Impuesto a la renta Perú 2026: cuánto pagas por categoría',
  description:
    'Calculá tu impuesto a la renta en el Perú 2026 por categoría: quinta, cuarta, primera y segunda, con la UIT vigente y la deducción de 7 UIT de la LIR.',
  silo: 'Impuestos',
  siloHref: '/pe/impuestos',
  locale: 'pe',

  eyebrow: 'Perú · SUNAT · persona natural',
  h1: 'Impuesto a la renta en Perú: cuánto te toca pagar según de dónde viene tu plata.',
  lede:
    'En el Perú no hay un solo impuesto a la renta: hay cinco categorías, y cada una deduce cosas distintas antes de llegar al impuesto. Las rentas de trabajo (cuarta y quinta) se suman y pasan por la escala progresiva del Art. 53. Las rentas de capital (primera y segunda) pagan una tasa plana. Elige tu caso y la cuenta cambia sola.',
  stamps: [
    `UIT ${UIT_ANIO}: ${sol(UIT)}`,
    'Arts. 33, 45, 46, 52-A y 53 de la Ley del Impuesto a la Renta',
    '10 calculadoras adentro',
  ],

  resultLabel: 'Impuesto anual estimado',

  cases: {
    title: '¿De dónde vienen tus ingresos?',
    intro:
      'La escala progresiva sólo corre para las rentas de trabajo. Las rentas de capital pagan una tasa plana y no se mezclan con tu sueldo. Partimos del caso más frecuente.',
    items: [
      {
        id: '5ta',
        label: 'Quinta categoría: estoy en planilla',
        hint: 'Trabajo dependiente · Art. 34 LIR',
        answer: `En quinta categoría se descuentan ${DEDUCCION_UIT} UIT antes de aplicar la escala, y el empleador retiene mes a mes.`,
        yes: [
          `Deducción fija de ${DEDUCCION_UIT} UIT sobre el ingreso anual (${sol(DEDUCCION_UIT * UIT)})`,
          'El año en planilla son 14 remuneraciones: 12 sueldos más las gratificaciones de julio y diciembre',
          `Deducción adicional de hasta ${ADICIONAL_3UIT.topeUit} UIT por gastos con comprobante electrónico vinculado a tu DNI`,
          'Lo que retuvo el empleador se acredita contra el impuesto del año',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La CTS no está afecta al impuesto a la renta de trabajo, pero las gratificaciones sí: entran en la base',
          'Los aportes a AFP u ONP NO se restan de la base: el sistema peruano reemplazó las deducciones por gastos con la deducción fija de 7 UIT',
        ],
        plazo: 'si tuviste un solo empleador todo el año y no usas la deducción adicional, en general no te toca presentar declaración anual.',
      },
      {
        id: '4ta',
        label: 'Cuarta categoría: emito recibos por honorarios',
        hint: 'Trabajo independiente · Art. 33 LIR',
        answer: `En cuarta se descuenta primero el ${DEDUCCION_4TA * 100}%, con tope de ${TOPE_4TA_UIT} UIT, y recién después las ${DEDUCCION_UIT} UIT.`,
        yes: [
          `Deducción del ${DEDUCCION_4TA * 100}% del ingreso bruto, con tope de ${TOPE_4TA_UIT} UIT (${sol(TOPE_4TA_UIT * UIT)})`,
          `Después se resta la deducción fija de ${DEDUCCION_UIT} UIT, igual que en quinta`,
          'Sobre lo que queda corre la misma escala progresiva del Art. 53',
          `Puedes pedir la suspensión de retenciones si proyectas no superar ${SUSPENSION.generalUit} UIT al año (${sol(SUSPENSION.generalUit * UIT)})`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `El ${DEDUCCION_4TA * 100}% NO aplica a los ingresos del inciso b) del Art. 33: director, síndico, mandatario, gestor de negocios, albacea y actividades similares. Ese perceptor además tiene un umbral de suspensión más bajo, de ${SUSPENSION.incisoBUit} UIT`,
          `La retención del ${SUSPENSION.retencion * 100}% sólo se practica en recibos mayores a ${sol(SUSPENSION.pisoRecibo)}: por debajo de eso no te retienen, pero el ingreso igual entra en la declaración anual`,
        ],
        plazo: 'la suspensión se pide con el Formulario Virtual 1609 y hay que renovarla cada ejercicio.',
      },
      {
        id: '1ra',
        label: 'Primera categoría: alquilo un inmueble',
        hint: 'Renta de capital · Art. 23 LIR',
        answer: 'El alquiler paga un 5% efectivo sobre el bruto, mes a mes, y no se mezcla con tu sueldo.',
        yes: [
          `Tasa efectiva del ${TASA_EFECTIVA_CAPITAL * 100}% sobre el alquiler bruto (${TASA_RENTA_NETA_CAPITAL * 100}% sobre la renta neta, que es el 80% del bruto)`,
          'Se paga mes a mes con el Pago Fácil, formulario 1683, dentro del cronograma de vencimientos de SUNAT',
          'La constancia de pago es el comprobante que le entregas al inquilino',
          'No entra en la escala progresiva: es una tasa plana, independiente de cuánto ganes por otro lado',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La ley presume una renta mínima del ${PRESUNTA_ALQUILER * 100}% del autovalúo del predio: si alquilas por debajo de eso, SUNAT liquida igual sobre la presunta (Art. 23 LIR). La cuenta de acá parte del alquiler pactado, así que si es un alquiler de favor o muy bajo, revisa la presunta`,
          'Ceder un inmueble gratis o a precio simbólico no te libera: la presunción se aplica igual, salvo las excepciones expresas de la ley',
          'El pago mensual es definitivo para el inquilino pero no te exime de la declaración anual si tienes otras rentas de capital',
        ],
        plazo: 'el vencimiento mensual sigue el cronograma de SUNAT según el último dígito de tu RUC.',
      },
      {
        id: '2da',
        label: 'Segunda categoría: vendí acciones o cobré dividendos',
        hint: 'Ganancia de capital · Arts. 24 y 52-A LIR',
        answer: 'La ganancia de capital paga 5% efectivo; los dividendos, un 5% de retención definitiva.',
        yes: [
          `Venta de valores: ${TASA_RENTA_NETA_CAPITAL * 100}% sobre la renta neta (la ganancia menos el ${DEDUCCION_CAPITAL * 100}% de deducción) = ${TASA_EFECTIVA_CAPITAL * 100}% efectivo sobre la ganancia`,
          'Dividendos: 5% de retención definitiva sobre el monto distribuido, sin costo ni deducción que restar',
          'En operaciones locales CAVALI practica la retención por ti',
          'La ganancia es precio de venta menos costo computable: guarda los comprobantes de compra',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La exoneración de la Ley 30341 para ganancias en la Bolsa de Valores de Lima venció el 31-12-2023 y no fue prorrogada: desde entonces esas ganancias están gravadas',
          'La venta de un inmueble tiene su propia cuenta, con la exoneración de casa habitación: eso se resuelve en el hub de impuestos del inmueble',
          'Las pérdidas de capital no compensan rentas de trabajo: son compartimentos separados',
        ],
        plazo: 'la ganancia de fuente extranjera no la retiene nadie: la declaras y la pagas tú en la anual.',
      },
    ],
  },

  inputsTitle: 'Tus cifras del ejercicio',
  inputsIntro:
    'Todo en soles y en valores anuales, salvo el alquiler que va mensual. Puedes dejar el ejemplo cargado y volver después con tus números.',
  fields: [
    {
      id: 'renta5ta',
      label: 'Ingresos de quinta categoría del año (S/)',
      prefix: 'S/',
      value: 60000,
      thousands: true,
      help: 'Los 12 sueldos brutos más las gratificaciones de julio y diciembre. No incluyas la CTS: no está afecta.',
    },
    {
      id: 'renta4ta',
      label: 'Honorarios de cuarta categoría del año (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Total facturado por recibos por honorarios en el ejercicio, antes de la retención.',
    },
    {
      id: 'alquiler',
      label: 'Alquiler que cobras por mes (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Sólo para la rama de primera categoría. Es el alquiler bruto pactado, sin descontar nada.',
    },
    {
      id: 'ganancia',
      label: 'Ganancia de capital o dividendos del año (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Sólo para la rama de segunda categoría. En venta de valores, la ganancia neta (precio de venta menos costo). En dividendos, el monto distribuido.',
    },
    {
      id: 'gastos3uit',
      label: 'Deducción adicional acumulada por gastos (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: `Ya deducida por rubro: ${ADICIONAL_3UIT.pct.restaurantesHoteles * 100}% de restaurantes y hoteles, ${ADICIONAL_3UIT.pct.alquiler * 100}% del alquiler de tu vivienda, ${ADICIONAL_3UIT.pct.medicosOdontologos * 100}% de médicos y odontólogos, ${ADICIONAL_3UIT.pct.otrosProfesionales * 100}% de otros servicios de cuarta, y el 100% del EsSalud del trabajador del hogar. Tope: ${ADICIONAL_3UIT.topeUit} UIT.`,
    },
    {
      id: 'retenciones',
      label: 'Retenciones y pagos a cuenta del año (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Lo que ya te retuvo el empleador de quinta y lo que te retuvieron en los recibos por honorarios.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada sol que ganaste',
    caption:
      'Compara la parte del ingreso que las deducciones dejan fuera del impuesto, la renta neta que sí queda gravada y el impuesto que sale de la escala.',
  },
  breakdownTitle: 'Cómo se arma tu impuesto, línea por línea',
  breakdownIntro:
    'El mismo orden de la declaración: ingresos por categoría, deducciones, renta neta imponible, tramo de la escala y saldo.',

  faq: [
    {
      q: '¿Cuál es la UIT vigente y por qué todo se mide en esa unidad?',
      a: `La Unidad Impositiva Tributaria es la referencia con la que la ley tributaria peruana escribe deducciones, tramos, topes y multas, para que se actualicen solos cada año sin tener que modificar la norma. La vigente es de ${sol(UIT)}, fijada por el Decreto Supremo 301-2025-EF con efecto desde el 1 de enero de ${UIT_ANIO}. La deducción fija de rentas de trabajo, toda la escala del Art. 53 y los umbrales de suspensión de cuarta se miden en UIT.`,
    },
    {
      q: '¿Desde qué ingreso empiezo a pagar impuesto a la renta de trabajo?',
      a: `Recién cuando tu renta neta pasa de cero, es decir cuando el ingreso anual supera la deducción de ${DEDUCCION_UIT} UIT: ${sol(DEDUCCION_UIT * UIT)}. En quinta categoría, repartido en 14 remuneraciones, eso equivale a un sueldo de alrededor de ${sol((DEDUCCION_UIT * UIT) / 14)} al mes. En cuarta el umbral es más alto porque antes se descuenta el ${DEDUCCION_4TA * 100}%: el punto de arranque ronda los ${sol((DEDUCCION_UIT * UIT) / (1 - DEDUCCION_4TA))} de ingreso bruto anual.`,
    },
    {
      q: '¿Cuáles son los tramos de la escala del Art. 53?',
      a: 'Cinco tramos sobre la renta neta de trabajo: 8% hasta 5 UIT; 14% de 5 a 20 UIT; 17% de 20 a 35 UIT; 20% de 35 a 45 UIT; y 30% de 45 UIT en adelante. Es progresiva por tramos: cada tasa grava solamente la porción de renta que cae dentro de ese tramo, no todo el ingreso. Por eso alguien que "está en el tramo del 30%" nunca paga 30% de todo lo que gana.',
    },
    {
      q: '¿Qué diferencia hay entre cuarta y quinta categoría?',
      a: `La quinta es trabajo dependiente, en planilla, con el empleador reteniendo mes a mes y declarando por ti. La cuarta es trabajo independiente por recibo por honorarios, donde el cliente te retiene el ${SUSPENSION.retencion * 100}% cuando el recibo supera ${sol(SUSPENSION.pisoRecibo)}. La única diferencia de cálculo es la deducción del ${DEDUCCION_4TA * 100}% con tope de ${TOPE_4TA_UIT} UIT que sólo tiene la cuarta; después ambas restan las ${DEDUCCION_UIT} UIT y aplican la misma escala. Si tienes las dos, se suman en una sola base.`,
    },
    {
      q: '¿Cómo funciona la deducción adicional de 3 UIT?',
      a: `Es un beneficio sobre gastos sustentados con comprobante electrónico vinculado a tu DNI y pagados por medios bancarizados cuando corresponde. Cada rubro deduce un porcentaje distinto: ${ADICIONAL_3UIT.pct.restaurantesHoteles * 100}% del consumo en restaurantes y hoteles, ${ADICIONAL_3UIT.pct.alquiler * 100}% del alquiler de tu vivienda, ${ADICIONAL_3UIT.pct.medicosOdontologos * 100}% de honorarios médicos y odontológicos, ${ADICIONAL_3UIT.pct.otrosProfesionales * 100}% de otros servicios de cuarta categoría, y el 100% de los aportes a EsSalud del trabajador del hogar. La suma no puede pasar de ${ADICIONAL_3UIT.topeUit} UIT (${sol(ADICIONAL_3UIT.topeUit * UIT)}). Lo que ahorras no es la deducción: es la deducción por tu tasa marginal.`,
    },
    {
      q: '¿Puedo suspender las retenciones de cuarta categoría?',
      a: `Sí, con el Formulario Virtual 1609, si proyectas que tus ingresos anuales no van a superar ${SUSPENSION.generalUit} UIT (${sol(SUSPENSION.generalUit * UIT)}). Para los perceptores del inciso b) del Art. 33 —directores, síndicos, mandatarios, gestores de negocios, regidores— el umbral es más bajo: ${SUSPENSION.incisoBUit} UIT (${sol(SUSPENSION.incisoBUit * UIT)}). Aprobada la suspensión, tus clientes dejan de retenerte el ${SUSPENSION.retencion * 100}%. Hay que renovarla cada ejercicio, y si a mitad de año te das cuenta de que vas a superar el umbral, corresponde comunicarlo.`,
    },
    {
      q: '¿Cuánto pago por alquilar un departamento?',
      a: `El ${TASA_EFECTIVA_CAPITAL * 100}% efectivo del alquiler bruto, todos los meses. Formalmente son ${TASA_RENTA_NETA_CAPITAL * 100}% sobre la renta neta, y la renta neta es el 80% del bruto porque la ley reconoce una deducción del ${DEDUCCION_CAPITAL * 100}% sin necesidad de sustento. Se paga con el Pago Fácil, formulario 1683, y la constancia es lo que le entregas al inquilino. Ojo con la renta presunta: si alquilas por menos del ${PRESUNTA_ALQUILER * 100}% del autovalúo anual del predio, SUNAT liquida sobre esa presunta y no sobre lo que efectivamente cobras.`,
    },
    {
      q: '¿Las ganancias en la Bolsa de Valores de Lima están exoneradas?',
      a: 'Ya no. La exoneración de la Ley 30341, prorrogada por la Ley 31662, venció el 31 de diciembre de 2023 y no fue renovada. Desde entonces la ganancia por venta de acciones y otros valores mobiliarios tributa como renta de segunda categoría: 6,25% sobre la renta neta, que equivale a 5% efectivo sobre la ganancia. En las operaciones locales CAVALI practica la retención.',
    },
    {
      q: '¿Los dividendos se suman a mi sueldo para el impuesto?',
      a: 'No. Los dividendos pagan un 5% de retención definitiva sobre el monto distribuido y ahí termina la historia: no se acumulan con tus rentas de trabajo ni te empujan a un tramo más alto de la escala. Es una de las razones por las que la tasa efectiva total de alguien que vive de dividendos puede ser bastante menor que la de un asalariado con el mismo ingreso.',
    },
    {
      q: '¿Los aportes a AFP u ONP se restan de la base del impuesto?',
      a: `No. El sistema peruano reemplazó las deducciones por gastos con la deducción fija de ${DEDUCCION_UIT} UIT, y los aportes previsionales quedaron fuera. Se descuentan de tu sueldo, sí, pero la base del impuesto a la renta de quinta se calcula sobre la remuneración bruta. Es una diferencia importante contra otros países de la región, donde la seguridad social sí baja la base imponible.`,
    },
    {
      q: '¿Qué pasa si me retuvieron de más?',
      a: 'Queda saldo a favor. Con la declaración anual pides la devolución o lo compensas contra otras deudas tributarias. SUNAT además corre una devolución de oficio para muchos contribuyentes de rentas de trabajo, típicamente entre marzo y abril, pero conviene revisar el resultado en tu buzón electrónico y no darlo por hecho: si tus gastos deducibles no quedaron bien registrados, la devolución sale más chica de lo que corresponde.',
    },
    {
      q: '¿Y si me atraso con SUNAT?',
      a: 'Corren intereses moratorios sobre la deuda desde el día siguiente al vencimiento, calculados con la Tasa de Interés Moratorio que SUNAT publica y actualiza. Además hay multas propias por no presentar la declaración dentro del plazo, expresadas en porcentaje de la UIT, con régimen de gradualidad si subsanas voluntariamente antes de que te detecten. Subsanar por tu cuenta siempre sale mucho más barato que esperar la notificación.',
    },
    {
      q: '¿Tengo que presentar declaración anual?',
      a: 'Si sólo tuviste quinta categoría con un único empleador, normalmente no. Sí corresponde si tuviste cuarta categoría, más de un empleador en el año, saldo por regularizar, rentas de fuente extranjera, o si quieres usar la deducción adicional de 3 UIT y pedir la devolución de lo retenido de más. SUNAT publica cada año el cronograma de vencimientos según el último dígito del RUC.',
    },
  ],

  sources: [
    { name: 'SUNAT — Rentas de trabajo: cuarta y quinta categoría', url: 'https://www.sunat.gob.pe/orientacion/rentasTrabajo/index.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Unidad Impositiva Tributaria (UIT) por año', url: 'https://www.sunat.gob.pe/indicestasas/uit.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Rentas de segunda categoría por venta de inmuebles y valores', url: 'https://personas.sunat.gob.pe/vendo-mi-casa/rentas-segunda-categoria', publisher: 'SUNAT' },
    { name: 'SUNAT — Arrendamiento de bienes: renta de primera categoría', url: 'https://personas.sunat.gob.pe/alquilo-un-inmueble', publisher: 'SUNAT' },
    { name: 'SUNAT — Suspensión de retenciones de cuarta categoría (Formulario Virtual 1609)', url: 'https://www.gob.pe/7813-solicitar-la-suspension-de-retenciones-de-cuarta-categoria', publisher: 'SUNAT' },
    { name: 'MEF — Decretos Supremos (valor de la UIT, DS 301-2025-EF)', url: 'https://www.mef.gob.pe/es/normatividad-sp-9322/por-instrumento/decretos-supremos', publisher: 'Ministerio de Economía y Finanzas del Perú' },
  ],

  replaces: [
    // Hub raíz de la migración AR que este hub absorbe y amplía.
    '/impuestos/renta-peru',
    '/pe/calculadora-renta-anual-trabajo-cuarta-quinta-peru',
    '/pe/calculadora-impuesto-renta-quinta-categoria-peru',
    '/pe/calculadora-renta-cuarta-categoria-honorarios-peru',
    '/pe/calculadora-suspension-retencion-cuarta-categoria-peru',
    '/pe/calculadora-deduccion-adicional-3-uit-sunat-peru',
    '/pe/calculadora-renta-primera-categoria-alquiler-peru',
    '/pe/calculadora-renta-segunda-categoria-ganancia-capital-peru',
    '/pe/calculadora-uit-2026-soles-peru-conversor',
    '/pe/calculadora-intereses-moratorios-sunat-peru',
  ],

  lastReviewed: '2026-08-16',
};
