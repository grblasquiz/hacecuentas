import type { HubData } from '../types';
import { ECUADOR_2026, CANASTA_INEC_2026, COSTO_VIDA_EC_2026, TARIFA_ELECTRICA_EC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto necesito por mes para vivir en el Ecuador, y me alcanza?"
 *
 * Cálculo espejado de las fórmulas vivas:
 *   costo-vida-mensual-ecuador.ts · canasta-basica-familiar-ecuador.ts ·
 *   arriendo-maximo-legal-ecuador.ts · actualizacion-inflacion-ipc-ecuador.ts ·
 *   planilla-luz-cnel-ecuador.ts · planilla-agua-ecuador.ts
 *
 * El tope legal del arriendo en Ecuador NO es la regla del 30% del ingreso: la Ley de
 * Inquilinato (art. 17) fija la pensión mensual máxima en la doceava parte del 10% del
 * avalúo comercial municipal del inmueble. Verificado contra la fórmula viva, que lo
 * implementa bien.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const SBU = ECUADOR_2026.sbu;
export const CANASTA = CANASTA_INEC_2026;
export const COSTO_VIDA = COSTO_VIDA_EC_2026;
/** Tarifa eléctrica con `Infinity` mapeado a null: no sobrevive a define:vars. */
export const TARIFA_LUZ = {
  tarifaDignidad: TARIFA_ELECTRICA_EC_2026.tarifaDignidad,
  limiteDignidadSierra: TARIFA_ELECTRICA_EC_2026.limiteDignidadSierra,
  limiteDignidadCosta: TARIFA_ELECTRICA_EC_2026.limiteDignidadCosta,
  comercializacion: TARIFA_ELECTRICA_EC_2026.comercializacion,
  precioMedioNacional: TARIFA_ELECTRICA_EC_2026.precioMedioNacional,
  bloques: TARIFA_ELECTRICA_EC_2026.bloques.map((b) => ({
    hasta: Number.isFinite(b.hasta) ? b.hasta : null,
    usdKwh: b.usdKwh,
  })),
};

/** Tarifa residencial de agua por bloques ($/m³). `hasta: null` = último tramo. */
export const TARIFA_AGUA = {
  epmaps: {
    label: 'EPMAPS (Quito)',
    cargoFijo: 0.72,
    alcantarilladoPct: 0,
    bloques: [
      { hasta: 10, precio: 0.4 },
      { hasta: 25, precio: 0.448 },
      { hasta: 50, precio: 0.55 },
      { hasta: null, precio: 0.73 },
    ],
  },
  interagua: {
    label: 'Interagua (Guayaquil)',
    cargoFijo: 1.26,
    alcantarilladoPct: 0.8,
    bloques: [
      { hasta: 15, precio: 0.322 },
      { hasta: 30, precio: 0.477 },
      { hasta: 60, precio: 0.675 },
      { hasta: 100, precio: 0.925 },
      { hasta: null, precio: 1.042 },
    ],
  },
};

/** Pesos del presupuesto sobre la canasta de un hogar de 4 (suman 1), composición INEC. */
export const PESOS_RUBRO = {
  alimentacion: 0.39,
  arriendo: 0.26,
  servicios: 0.1,
  transporte: 0.08,
  otros: 0.17,
};

/** Escalas de equivalencia por tamaño de hogar, relativas al hogar de 4 del INEC. */
export const ESCALA_HOGAR = {
  solo: { personas: 1, label: 'Vivo solo', alimentacion: 0.3, arriendo: 0.55, servicios: 0.55, transporte: 0.45, otros: 0.4 },
  pareja: { personas: 2, label: 'En pareja', alimentacion: 0.58, arriendo: 0.8, servicios: 0.75, transporte: 0.7, otros: 0.65 },
  familia4: { personas: 4, label: 'Familia tipo de 4', alimentacion: 1, arriendo: 1, servicios: 1, transporte: 1, otros: 1 },
  familia5: { personas: 5, label: 'Familia de 5', alimentacion: 1.18, arriendo: 1.08, servicios: 1.08, transporte: 1.12, otros: 1.15 },
};

/** Tope legal del arriendo: doceava parte del 10% del avalúo comercial (Ley de Inquilinato, art. 17). */
export const ARRIENDO_PCT_LEGAL = 0.1;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/hogar/presupuesto-mensual',
  title: 'Cuánto se necesita al mes para vivir en Ecuador: canasta básica, arriendo, luz y agua',
  description:
    'Calcula el presupuesto mensual de tu hogar en el Ecuador contra la canasta básica familiar del INEC, ciudad por ciudad. Incluye la planilla de luz con Tarifa Dignidad, la planilla de agua por bloques y el tope legal del arriendo según la Ley de Inquilinato.',
  silo: 'Hogar',
  siloHref: '/ec/hogar',
  locale: 'ec',

  eyebrow: 'Ecuador · INEC, ARCONEL, EPMAPS e Interagua',
  h1: '¿Cuánto necesitas al mes para vivir en el Ecuador, y te alcanza con lo que ganas?',
  lede:
    'La canasta básica familiar del INEC es el número que sale en los titulares, pero está calculada para un hogar de cuatro personas: si vives solo o en pareja, tu presupuesto real es otro. Aquí armas el tuyo rubro por rubro, con las planillas de luz y agua calculadas de verdad, y lo comparas con tu ingreso.',
  stamps: [
    `Canasta básica ${usd(CANASTA_INEC_2026.basicaFamiliar)} · canasta vital ${usd(CANASTA_INEC_2026.vital)} (${CANASTA_INEC_2026.mesReferencia})`,
    `Ingreso familiar de referencia ${usd(CANASTA_INEC_2026.ingresoFamiliarRef)} · SBU ${usd(ECUADOR_2026.sbu)}`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Presupuesto mensual del hogar',

  cases: {
    title: '¿Cómo es tu hogar?',
    intro:
      'La canasta del INEC se mide sobre un hogar tipo de cuatro personas con 1,6 perceptores de ingreso. Tu presupuesto escala desde ahí, pero no linealmente: el arriendo y los servicios casi no cambian con una persona más, la comida sí.',
    items: [
      {
        id: 'solo',
        label: 'Vivo solo',
        hint: 'Una persona · el arriendo pesa más',
        answer: 'Viviendo solo el gasto total baja bastante respecto de la canasta familiar, pero el arriendo pasa a ser el rubro más pesado del presupuesto.',
        yes: [
          'La alimentación baja casi proporcionalmente: es el rubro con más economía de escala al revés',
          'El arriendo y los servicios básicos casi no bajan: una persona sola paga un cargo fijo de luz y agua igual que una familia',
          'La canasta básica del INEC no aplica directamente: es para un hogar de cuatro',
          'El presupuesto por persona de quien vive solo es el más alto de todos los tipos de hogar',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Las estimaciones por rubro son aproximaciones a partir de la composición de la canasta del INEC: si conoces tu arriendo o tu gasto real, escríbelo en el campo correspondiente y manda tu dato',
          'Vivir solo sube el costo por persona en todos los rubros salvo la comida: compartir vivienda es la palanca de ahorro más grande que existe en Ecuador',
        ],
        plazo: 'el INEC publica la canasta básica y la canasta vital todos los meses, junto con el índice de precios al consumidor.',
      },
      {
        id: 'pareja',
        label: 'En pareja',
        hint: 'Dos personas · dos ingresos',
        answer: 'En pareja el gasto sube pero el costo por persona baja: la vivienda y los servicios se reparten entre dos.',
        yes: [
          'La alimentación sube casi al doble; la vivienda y los servicios suben mucho menos',
          'Con dos perceptores de ingreso el hogar suele superar cómodamente la canasta vital',
          'El costo por persona baja alrededor de un tercio respecto de vivir solo',
          'Es el punto donde conviene empezar a comparar el arriendo con el tope legal del avalúo del inmueble',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Dos ingresos no significan el doble de holgura si el arriendo se lleva más de un tercio del total: mira el peso del arriendo sobre el presupuesto, no solo el total',
          'El ingreso familiar de referencia del INEC supone 1,6 perceptores del salario básico, no dos sueldos completos: no lo uses como si fuera tu caso',
        ],
        plazo: 'los contratos de arriendo en el Ecuador tienen plazo mínimo de dos años a favor del inquilino, salvo pacto expreso distinto.',
      },
      {
        id: 'familia4',
        label: 'Familia tipo de 4',
        hint: 'Referencia oficial del INEC',
        answer: `Este es exactamente el hogar que mide el INEC: cuatro personas y una canasta básica de ${usd(CANASTA_INEC_2026.basicaFamiliar)} al mes.`,
        yes: [
          `Canasta básica familiar de ${usd(CANASTA_INEC_2026.basicaFamiliar)} y canasta vital de ${usd(CANASTA_INEC_2026.vital)}`,
          `Ingreso familiar de referencia del INEC: ${usd(CANASTA_INEC_2026.ingresoFamiliarRef)}, calculado con 1,6 perceptores del salario básico`,
          `Con ese ingreso de referencia, la canasta básica absorbe el ${((CANASTA_INEC_2026.basicaFamiliar / CANASTA_INEC_2026.ingresoFamiliarRef) * 100).toFixed(2).replace('.', ',')}% del ingreso del hogar`,
          'La canasta vital es el mínimo de subsistencia: cubre 73 productos, contra los 75 de la básica',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La canasta del INEC es una referencia estadística, no un presupuesto personal: incluye rubros que quizá no consumes y excluye gastos que tú sí tienes, como el pago de deudas',
          'Que el ingreso de referencia sea menor a la canasta básica significa que el hogar promedio no la cubre: es una brecha estructural, no un error del cálculo',
        ],
        plazo: 'la canasta se publica mensualmente en el informe ejecutivo de canastas analíticas del INEC.',
      },
      {
        id: 'ciudad',
        label: 'Quiero comparar por ciudad',
        hint: 'Nueve ciudades del IPC',
        answer: 'Vivir en Cuenca cuesta alrededor de cien dólares más al mes que vivir en Machala, para la misma canasta de cuatro personas.',
        yes: [
          `Cuenca es la ciudad más cara del país (${usd(COSTO_VIDA_EC_2026.ciudades.cuenca.canasta)}) y Machala la más barata (${usd(COSTO_VIDA_EC_2026.ciudades.machala.canasta)})`,
          `Quito ${usd(COSTO_VIDA_EC_2026.ciudades.quito.canasta)} · Loja ${usd(COSTO_VIDA_EC_2026.ciudades.loja.canasta)} · Guayaquil ${usd(COSTO_VIDA_EC_2026.ciudades.guayaquil.canasta)}`,
          'El límite de la Tarifa Dignidad de la luz cambia según la región: 110 kWh en la Sierra y 130 kWh en la Costa, Oriente e Insular',
          'La planilla de agua se calcula con pliegos distintos: EPMAPS en Quito e Interagua en Guayaquil tienen bloques y cargos fijos diferentes',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Solo los valores de Cuenca, Loja, Quito y Machala están verificados al centavo contra la publicación del INEC; los de Manta, Guayaquil, Esmeraldas, Ambato y Santo Domingo son aproximados de prensa, porque el INEC publica el cuadro completo por ciudad solo en imagen',
          'La canasta por ciudad mide precios, no calidad de vida ni oferta de servicios: dos ciudades con canasta parecida pueden tener arriendos muy distintos',
        ],
        plazo: 'las nueve ciudades que releva el IPC son Quito, Guayaquil, Cuenca, Manta, Machala, Loja, Ambato, Esmeraldas y Santo Domingo.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu hogar',
  inputsIntro:
    'Todo en dólares al mes. Los rubros que dejes en cero se estiman con la composición de la canasta del INEC para tu ciudad y tu tipo de hogar; el que escribas manda sobre la estimación.',
  fields: [
    {
      id: 'ciudad',
      label: 'Ciudad donde vives',
      type: 'select',
      value: 'nacional',
      options: [
        { value: 'nacional', label: 'Promedio nacional' },
        { value: 'quito', label: 'Quito' },
        { value: 'guayaquil', label: 'Guayaquil' },
        { value: 'cuenca', label: 'Cuenca' },
        { value: 'manta', label: 'Manta' },
        { value: 'machala', label: 'Machala' },
        { value: 'loja', label: 'Loja' },
        { value: 'ambato', label: 'Ambato' },
        { value: 'esmeraldas', label: 'Esmeraldas' },
        { value: 'santo_domingo', label: 'Santo Domingo' },
      ],
      help: 'La canasta básica de tu ciudad es el punto de partida del presupuesto estimado.',
    },
    {
      id: 'ingresoFamiliar',
      label: 'Ingreso mensual del hogar ($)',
      prefix: '$',
      value: '900',
      thousands: true,
      help: 'La suma de lo que entra al hogar, ya neto de descuentos. Es lo que se compara contra la canasta.',
    },
    {
      id: 'arriendo',
      label: 'Lo que pagas de arriendo ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Déjalo en 0 para que se estime a partir de la canasta. Si eres propietario también puedes dejarlo en 0.',
    },
    {
      id: 'avaluoInmueble',
      label: 'Avalúo comercial municipal del inmueble ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Se usa para calcular el tope legal del arriendo (art. 17 de la Ley de Inquilinato). Lo consultas en el catastro de tu municipio. Déjalo en 0 si no lo tienes.',
    },
    {
      id: 'consumoKwh',
      label: 'Consumo de luz del mes (kWh)',
      type: 'number',
      value: 120,
      min: 0,
      step: 5,
      help: 'Está en tu planilla. Por debajo del límite regional puedes calificar a la Tarifa Dignidad de $0,04 por kWh.',
    },
    {
      id: 'region',
      label: 'Región para el límite de la Tarifa Dignidad',
      type: 'select',
      value: 'sierra',
      options: [
        { value: 'sierra', label: 'Sierra (límite 110 kWh)' },
        { value: 'costa', label: 'Costa, Oriente o Insular (límite 130 kWh)' },
      ],
      help: 'La Tarifa Dignidad exige además haber estado bajo el límite en 11 de los últimos 12 meses.',
    },
    {
      id: 'consumoM3',
      label: 'Consumo de agua del mes (m³)',
      type: 'number',
      value: 15,
      min: 0,
      step: 1,
      help: 'Metros cúbicos de tu planilla de agua. Un hogar de cuatro personas suele estar entre 15 y 25 m³.',
    },
    {
      id: 'empresaAgua',
      label: 'Empresa de agua',
      type: 'select',
      value: 'epmaps',
      options: [
        { value: 'epmaps', label: 'EPMAPS (Quito)' },
        { value: 'interagua', label: 'Interagua (Guayaquil)' },
      ],
      help: 'En Quito el alcantarillado va dentro de los bloques; en Guayaquil se factura aparte como el 80% del valor del agua.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'En qué se va tu presupuesto mensual',
    caption:
      'Compara los cinco rubros del gasto del hogar. Si el arriendo pasa del 30% del total tienes un problema de vivienda, no de consumo; si la alimentación pasa del 40%, es una señal de ingreso ajustado.',
  },
  breakdownTitle: 'Tu presupuesto, rubro por rubro',
  breakdownIntro:
    'Primero el gasto estimado por rubro, después las planillas de luz y agua calculadas con los pliegos reales, y al final la comparación con la canasta del INEC y con el tope legal del arriendo.',

  faq: [
    {
      q: '¿Cuánto cuesta la canasta básica familiar en Ecuador?',
      a: `La canasta básica familiar del INEC está en ${usd(CANASTA_INEC_2026.basicaFamiliar)} al mes y la canasta vital en ${usd(CANASTA_INEC_2026.vital)}, con datos de ${CANASTA_INEC_2026.mesReferencia}. La básica cubre 75 productos y la vital 73. Las dos están calculadas para un hogar tipo de cuatro personas, así que no son un presupuesto individual.`,
    },
    {
      q: '¿El sueldo básico alcanza para la canasta básica?',
      a: `No, y por bastante. El ingreso familiar de referencia que usa el INEC es de ${usd(CANASTA_INEC_2026.ingresoFamiliarRef)}, calculado con 1,6 perceptores que ganan el salario básico unificado de ${usd(ECUADOR_2026.sbu)}. Con ese ingreso la canasta básica absorbe alrededor del ${((CANASTA_INEC_2026.basicaFamiliar / CANASTA_INEC_2026.ingresoFamiliarRef) * 100).toFixed(0)}% del ingreso del hogar. Un solo salario básico cubre poco más de la mitad de la canasta.`,
    },
    {
      q: '¿Cuál es la ciudad más cara y la más barata del Ecuador?',
      a: `Con la canasta básica por ciudad del INEC, Cuenca es la más cara (${usd(COSTO_VIDA_EC_2026.ciudades.cuenca.canasta)}) y Machala la más barata (${usd(COSTO_VIDA_EC_2026.ciudades.machala.canasta)}), con una diferencia de más de cien dólares al mes para la misma canasta. Quito está en ${usd(COSTO_VIDA_EC_2026.ciudades.quito.canasta)} y Guayaquil en ${usd(COSTO_VIDA_EC_2026.ciudades.guayaquil.canasta)}. Ojo: solo Cuenca, Loja, Quito y Machala tienen valor verificado al centavo; el resto son aproximaciones publicadas en prensa.`,
    },
    {
      q: '¿Cuánto puede cobrarme legalmente el arrendador?',
      a: 'En Ecuador el tope no es la famosa regla del 30% del ingreso, que es un consejo financiero y no una norma. El artículo 17 de la Ley de Inquilinato dice que la pensión mensual de arrendamiento no puede exceder la doceava parte del 10% del avalúo comercial con que el inmueble consta en el catastro municipal. Es decir, avalúo × 10% ÷ 12. Si arriendas solo una parte del predio, el tope se aplica en proporción.',
    },
    {
      q: '¿Qué es la Tarifa Dignidad y cómo sé si califico?',
      a: `Es un subsidio eléctrico que cobra $${String(TARIFA_ELECTRICA_EC_2026.tarifaDignidad).replace('.', ',')} por kWh a los hogares de bajo consumo. El límite es de ${TARIFA_ELECTRICA_EC_2026.limiteDignidadSierra} kWh al mes en la Sierra y ${TARIFA_ELECTRICA_EC_2026.limiteDignidadCosta} kWh en la Costa, el Oriente y la región Insular. No basta con estar bajo el límite este mes: hay que haber estado por debajo en 11 de los últimos 12 meses. Pasarse una vez no te saca del subsidio, pero pasarse seguido sí.`,
    },
    {
      q: '¿Cómo se calcula la planilla de luz si no tengo Tarifa Dignidad?',
      a: `Con la tarifa residencial general por bloques crecientes: el primer bloque va a alrededor de $0,091 por kWh y va subiendo hasta $0,27 en los consumos más altos, más un cargo fijo de comercialización de ${usd(TARIFA_ELECTRICA_EC_2026.comercializacion)} al mes. Como los bloques son marginales, solo los kWh que exceden cada tramo pagan la tarifa más alta. El precio medio nacional facturado ronda los $${String(TARIFA_ELECTRICA_EC_2026.precioMedioNacional).replace('.', ',')} por kWh.`,
    },
    {
      q: '¿Por qué la planilla de agua es distinta en Quito y en Guayaquil?',
      a: 'Porque son pliegos tarifarios de empresas distintas. En Quito, EPMAPS cobra por bloques desde $0,40 el m³ con el alcantarillado ya incluido en la progresividad, más un cargo fijo de $0,72 al mes. En Guayaquil, Interagua cobra el agua por bloques desde $0,322 el m³ y factura el alcantarillado aparte, como el 80% del valor del agua consumida, más un cargo fijo de comercialización según el diámetro de la acometida.',
    },
    {
      q: '¿Cómo actualizo un monto viejo por inflación en un país dolarizado?',
      a: 'Igual que en cualquier otro, pero con números mucho más chicos. Al estar dolarizado, el Ecuador tiene una inflación baja y estable, cerca del 2% anual en los últimos años, así que un monto de hace cinco años no se desactualizó de forma dramática. El cálculo es monto × (1 + inflación acumulada del período ÷ 100). El índice de precios al consumidor lo publica el INEC todos los meses.',
    },
    {
      q: '¿Cuánto debería destinar al arriendo?',
      a: 'La referencia práctica más usada es no pasar del 30% del ingreso del hogar en vivienda, para que quede espacio para alimentación, servicios y ahorro. No es una norma legal, es una regla de presupuesto. Lo que sí es legal es el tope del artículo 17 de la Ley de Inquilinato sobre el avalúo del inmueble, que es un límite al arrendador, no a ti.',
    },
    {
      q: '¿Cuánto necesita una persona sola para vivir en el Ecuador?',
      a: 'Bastante menos que la canasta familiar, pero mucho más que la cuarta parte. La comida escala casi proporcional al número de personas, pero el arriendo, la luz, el agua y el internet casi no bajan por vivir solo: se pagan cargos fijos iguales. Por eso el costo por persona de quien vive solo es el más alto de todos los tipos de hogar, y compartir vivienda sigue siendo la palanca de ahorro más grande que existe.',
    },
    {
      q: '¿La canasta básica del INEC incluye el arriendo?',
      a: 'Sí, la vivienda es uno de los grupos de la canasta y pesa alrededor de un cuarto del total. Lo que la canasta no incluye es el pago de deudas, el ahorro ni los gastos extraordinarios, y esos son justamente los rubros que aparecen en los presupuestos reales de los hogares. Por eso la canasta es un piso de comparación, no un presupuesto completo.',
    },
    {
      q: '¿Puedo bajar la planilla de luz sin dejar de usar los electrodomésticos?',
      a: `Si estás cerca del límite de la Tarifa Dignidad, sí, y el ahorro es grande: pasar el límite te saca del subsidio de $${String(TARIFA_ELECTRICA_EC_2026.tarifaDignidad).replace('.', ',')} por kWh y te lleva a la tarifa general, que arranca más del doble. Con consumos altos el ahorro está en los bloques superiores, donde el kWh cuesta hasta $0,27: bajar cien kWh en la franja alta ahorra más que bajarlos en la baja.`,
    },
  ],

  sources: [
    { name: 'INEC — Canastas analíticas básica y vital', url: 'https://www.ecuadorencifras.gob.ec/canasta/', publisher: 'Instituto Nacional de Estadística y Censos' },
    { name: 'INEC — Índice de Precios al Consumidor', url: 'https://www.ecuadorencifras.gob.ec/indice-de-precios-al-consumidor/', publisher: 'Instituto Nacional de Estadística y Censos' },
    { name: 'Ley de Inquilinato (Codificación 1, R.O. 196)', url: 'https://www.gob.ec/sites/default/files/regulations/2025-10/LEY_DE_INQUILINATO.pdf', publisher: 'Registro Oficial del Ecuador' },
    { name: 'ARCONEL / ARCERNNR — Pliego tarifario del servicio eléctrico', url: 'https://www.controlrecursosyenergia.gob.ec/', publisher: 'Agencia de Regulación y Control de Energía y Recursos Naturales No Renovables' },
    { name: 'EPMAPS — Pliego tarifario de agua potable', url: 'https://www.aguaquito.gob.ec/', publisher: 'Empresa Pública Metropolitana de Agua Potable y Saneamiento de Quito' },
    { name: 'Interagua — Estructura tarifaria residencial', url: 'https://www.interagua.com.ec/preguntas-frecuentes', publisher: 'Interagua / ECAPAG' },
    { name: 'Ministerio del Trabajo — Salario básico unificado', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-costo-vida-mensual-ecuador',
    '/ec/calculadora-canasta-basica-familiar-ecuador',
    '/ec/calculadora-arriendo-maximo-legal-ecuador',
    '/ec/calculadora-actualizacion-inflacion-ipc-ecuador',
    '/ec/calculadora-planilla-luz-cnel-ecuador',
    '/ec/calculadora-planilla-agua-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
