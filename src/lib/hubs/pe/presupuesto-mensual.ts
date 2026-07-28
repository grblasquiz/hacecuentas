import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';
import live from '../../../data/live/peru.json';

/**
 * Hub de decisión PE — "¿Cuánto necesito por mes para vivir en el Perú, y me alcanza?"
 *
 * Absorbe: costo de vida mensual, canasta básica INEI, alquiler asequible según ingreso,
 * actualización por inflación (IPC), recibo de luz (BT5B/OSINERGMIN), recibo de agua
 * (Sedapal/Sunass), recibo de gas natural (Cálidda) y la calculadora de propinas.
 *
 * Constantes de servicios y canasta: espejadas de las fórmulas vivas recibo-luz-peru-osinergmin.ts,
 * recibo-agua-sedapal-peru.ts, recibo-gas-natural-calidda-peru.ts, costo-vida-mensual-peru.ts,
 * canasta-basica-peru-inei.ts y alquiler-asequible-ingreso-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const RMV = PERU_2026.rmv;
export const IGV = PERU_2026.igv;

/** Líneas del INEI (Evolución de la Pobreza Monetaria), per cápita mensual. */
export const INEI = {
  lineaPobreza: 462,
  lineaPobrezaExtrema: 260,
};

/** Un menor consume alrededor del 70% de la canasta alimentaria de un adulto. */
export const FACTOR_MENOR = 0.7;

/** Nivel de vida: multiplica alimentación y transporte, no la vivienda. */
export const FACTOR_NIVEL: Record<string, number> = { austero: 0.85, medio: 1.15, comodo: 1.7 };

/** Transporte urbano: pasaje troncal de Lima y viajes al mes por persona. */
export const TRANSPORTE = { pasaje: 3.2, viajesAdulto: 44, viajesMenor: 30 };

/** Factor regional sobre transporte y servicios (provincia es más barata que Lima). */
export const FACTOR_REGION: Record<string, number> = { lima: 1, provincia: 0.78 };

/** Tarifa BT5B residencial (precios de pliego, IGV incluido). */
export const LUZ_BT5B = {
  cargoFijoBajo: 2.62,
  cargoFijoAlto: 2.68,
  primerBloque: 0.4948,
  fijo30: 14.84,
  exceso: 0.7068,
  plano: 0.7238,
  reposicion: 1.8,
  umbralKwh: 140,
  alumbradoPorKwh: 0.045,
  alumbradoMinimo: 3,
};

/** Agua potable Sedapal, categoría doméstica: bloques marginales en S/ por m³. */
export const AGUA_BLOQUES = [
  { hasta: 10, tarifa: 2.2 },
  { hasta: 20, tarifa: 2.36 },
  { hasta: 50, tarifa: 3.22 },
  { hasta: null as number | null, tarifa: 7.32 },
];
export const AGUA_CARGO_FIJO = 6.32;
/** El alcantarillado se factura de forma aproximadamente proporcional al agua potable. */
export const AGUA_FACTOR_ALCANTARILLADO = 0.86;

/** Gas natural residencial por red (referenciales, sin IGV). */
export const GAS = { precioM3: 2.05, cargoFijo: 3.4 };

/** Balón de GLP de 10 kg, para hogares sin red de gas natural. */
export const BALON_GLP = 50;

/** Plan de internet hogar, referencial de mercado. */
export const INTERNET = 90;

/** Regla de asequibilidad del alquiler: recomendado 30% del ingreso, tolerable 35%. */
export const RATIO_ALQUILER = { recomendado: 0.3, tolerable: 0.35 };

/** IPC de Lima Metropolitana (INEI vía BCRP), del bloque `ipc` de src/data/live/peru.json. */
const IPC_LIVE: any = (live as any)?.ipc ?? null;
export const IPC_INTERANUAL: number =
  typeof IPC_LIVE?.variacionInteranual === 'number' ? IPC_LIVE.variacionInteranual : 1.51;
export const IPC_PERIODO: string =
  typeof IPC_LIVE?.periodo === 'string' ? IPC_LIVE.periodo : '2025-12';

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));
const sol2 = (n: number) =>
  'S/ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'pe/hogar/presupuesto-mensual',
  title: 'Cuánto se necesita al mes para vivir en el Perú: presupuesto, recibos y canasta INEI',
  description:
    'Arma el presupuesto mensual real de tu hogar en el Perú: alquiler, luz con tarifa BT5B, agua de Sedapal, gas de Cálidda, comida y transporte, comparado contra tu ingreso y contra la línea de pobreza del INEI.',
  silo: 'Hogar',
  siloHref: '/pe/hogar',
  locale: 'pe',

  eyebrow: 'Perú · canasta INEI, OSINERGMIN, Sedapal y Cálidda',
  h1: '¿Cuánto necesito por mes para vivir en el Perú, y me alcanza?',
  lede:
    'Un presupuesto de hogar en el Perú son cuatro bloques: dónde vives, qué comes, cómo te mueves y los recibos. Los recibos son los que más sorprenden, porque la tarifa eléctrica residencial cambia de estructura al pasar los 140 kWh y el agua se factura por bloques crecientes. Acá se arma la cuenta completa y se compara contra tu ingreso y contra la línea de pobreza del INEI.',
  stamps: [
    `RMV ${sol(RMV)} · línea de pobreza INEI ${sol(INEI.lineaPobreza)} per cápita`,
    'Luz BT5B · agua Sedapal por bloques · gas natural con IGV',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Gasto mensual del hogar',

  cases: {
    title: '¿Cómo es tu hogar?',
    intro:
      'El tamaño del hogar cambia todo: la comida y el transporte escalan por persona, pero el alquiler y buena parte de los recibos se reparten entre todos.',
    items: [
      {
        id: 'solo',
        label: 'Vivo solo',
        hint: 'Un adulto · alquiler o habitación',
        answer: 'Viviendo solo el alquiler es el rubro dominante y los servicios pesan proporcionalmente más que en un hogar grande.',
        yes: [
          'Alquiler completo a cargo de una sola persona',
          'Canasta alimentaria de un adulto ajustada por tu nivel de vida',
          'Transporte urbano de una persona',
          'Recibos de luz, agua, gas e internet: el cargo fijo lo pagas igual que una familia',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los cargos fijos de luz, agua e internet no bajan porque vivas solo: son el mismo monto que paga un hogar de cinco',
          'Compartir vivienda es la única palanca que mueve el presupuesto de verdad en este caso: los ahorros en comida y luz son marginales al lado del alquiler',
        ],
        plazo: 'los recibos de luz y agua llegan mensualmente; el consumo del mes ya está hecho cuando te enteras del monto.',
      },
      {
        id: 'pareja',
        label: 'Vivimos en pareja',
        hint: 'Dos adultos · dos ingresos',
        answer: 'En pareja el alquiler y los cargos fijos se dividen, así que el gasto por persona baja bastante respecto de vivir solo.',
        yes: [
          'Alquiler y cargos fijos repartidos entre dos ingresos',
          'Canasta alimentaria de dos adultos',
          'Transporte de dos personas',
          'Comparación del gasto total contra el ingreso conjunto del hogar',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Comparar el alquiler contra el ingreso conjunto y no contra un solo sueldo: si uno de los dos ingresos se corta, la regla del 30% se rompe de golpe',
          'El consumo eléctrico y de agua sí sube con la segunda persona, aunque menos que proporcionalmente',
        ],
        plazo: 'el contrato de alquiler suele reajustarse una vez al año: es el momento de rehacer esta cuenta.',
      },
      {
        id: 'familia',
        label: 'Familia con hijos',
        hint: 'Adultos y menores a cargo',
        answer: 'Con hijos la comida y el transporte escalan, y el consumo de luz y agua empuja el recibo hacia los tramos caros.',
        yes: [
          'Canasta alimentaria de los adultos más la de los menores, que consumen alrededor del 70% de la de un adulto',
          'Transporte escolar con medio pasaje',
          'Consumo eléctrico y de agua mayor: es fácil pasar el umbral de los 140 kWh',
          'Vivienda con más ambientes',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Pasar de 140 kWh al mes cambia la estructura de la tarifa eléctrica: se deja de pagar por bloques y se paga una tarifa única sobre todo el consumo, más cara',
          'El agua se factura por bloques crecientes: el metro cúbico que se pasa de 20 cuesta bastante más que el primero',
          'Esta cuenta no incluye pensiones escolares, útiles ni salud, que en un hogar con hijos pesan mucho',
        ],
        plazo: 'los picos de gasto del año son marzo, por la campaña escolar, y julio y diciembre, por fiestas.',
      },
      {
        id: 'canasta',
        label: 'Quiero compararme con la canasta del INEI',
        hint: 'Línea de pobreza y pobreza extrema',
        answer: `La línea de pobreza del INEI es de ${sol(INEI.lineaPobreza)} por persona al mes, y la de pobreza extrema de ${sol(INEI.lineaPobrezaExtrema)}.`,
        yes: [
          'Línea de pobreza del hogar: el valor per cápita multiplicado por los integrantes',
          'Línea de pobreza extrema del hogar, que mide solo la canasta de alimentos',
          'Dónde queda tu ingreso per cápita respecto de esas dos líneas',
          'Cuánto falta o sobra respecto de la canasta básica de consumo',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El INEI mide pobreza monetaria sobre el gasto per cápita del hogar, no sobre el ingreso de una persona: dos hogares con el mismo ingreso pueden clasificar distinto si tienen distinta cantidad de integrantes',
          'Las líneas se publican con rezago: el valor vigente corresponde al último informe técnico publicado, no al mes en curso',
          'Superar la línea de pobreza no significa vivir cómodamente: es el umbral de una canasta mínima, no de un nivel de vida objetivo',
        ],
        plazo: 'el INEI publica el informe de pobreza monetaria una vez al año, con los datos del año anterior.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Si tienes los recibos a mano, carga el consumo real de luz en kWh, de agua en metros cúbicos y de gas en metros cúbicos: ahí es donde la estimación se vuelve tu presupuesto y no un promedio.',
  fields: [
    {
      id: 'adultos',
      label: 'Adultos en el hogar',
      type: 'number',
      value: 2,
      min: 1,
      max: 12,
      step: 1,
      help: 'Personas de 18 años o más que viven en la casa.',
    },
    {
      id: 'menores',
      label: 'Menores en el hogar',
      type: 'number',
      value: 1,
      min: 0,
      max: 12,
      step: 1,
      help: 'Se cuentan con el 70% de la canasta alimentaria de un adulto y con medio pasaje escolar.',
    },
    {
      id: 'alquiler',
      label: 'Alquiler mensual (S/)',
      type: 'number',
      prefix: 'S/',
      value: 1600,
      min: 0,
      step: 50,
      help: 'Si la vivienda es propia y no pagas hipoteca, pon 0: un cero acá es un dato legítimo y se respeta.',
    },
    {
      id: 'ingreso',
      label: 'Ingreso neto mensual del hogar (S/)',
      type: 'number',
      prefix: 'S/',
      value: 4500,
      min: 0,
      step: 100,
      help: 'La suma de lo que entra en mano cada mes, después de descuentos.',
    },
    {
      id: 'kwh',
      label: 'Consumo eléctrico del mes (kWh)',
      type: 'number',
      value: 120,
      min: 0,
      max: 2000,
      step: 5,
      help: `Está en tu recibo. Al pasar los ${LUZ_BT5B.umbralKwh} kWh cambia la estructura de la tarifa BT5B y el recibo pega un salto.`,
    },
    {
      id: 'm3agua',
      label: 'Consumo de agua del mes (m³)',
      type: 'number',
      value: 16,
      min: 0,
      max: 300,
      step: 1,
      help: 'Un hogar promedio de Lima consume alrededor de 16 m³ al mes. Se factura por bloques crecientes.',
    },
    {
      id: 'm3gas',
      label: 'Consumo de gas natural del mes (m³)',
      type: 'number',
      value: 20,
      min: 0,
      max: 500,
      step: 1,
      help: `Si tu hogar no tiene red de gas natural, deja 0 y se calcula con balones de GLP a ${sol(BALON_GLP)} cada uno.`,
    },
    {
      id: 'nivel',
      label: 'Tu nivel de gasto en comida y transporte',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'austero', label: 'Austero: cocino en casa, transporte público' },
        { value: 'medio', label: 'Medio: algunas comidas fuera, combino público y apps' },
        { value: 'comodo', label: 'Cómodo: como fuera seguido, taxi o apps' },
      ],
      help: 'Ajusta la canasta alimentaria y el transporte; no toca el alquiler ni los recibos, que se calculan con tus consumos reales.',
    },
    {
      id: 'region',
      label: '¿Dónde vives?',
      type: 'select',
      value: 'lima',
      options: [
        { value: 'lima', label: 'Lima o Callao' },
        { value: 'provincia', label: 'Provincia' },
      ],
      help: 'En provincia el transporte y los servicios son en promedio más baratos que en Lima. Las tarifas de luz y agua cargadas son las de Lima.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'En qué se te va el mes',
    caption:
      'La vivienda y la comida se llevan casi siempre más de la mitad del presupuesto. Los recibos parecen chicos en el gráfico, pero son el rubro sobre el que sí puedes actuar mes a mes bajando el consumo.',
  },
  breakdownTitle: 'Tu presupuesto, línea por línea',
  breakdownIntro:
    'Vivienda, comida, transporte y cada recibo por separado, y al final la comparación contra tu ingreso y contra la canasta del INEI.',

  faq: [
    {
      q: '¿Cuánto necesita un hogar en el Perú para no ser pobre?',
      a: `Según la medición de pobreza monetaria del INEI, la línea de pobreza es de ${sol(INEI.lineaPobreza)} por persona al mes, así que un hogar de cuatro integrantes necesita alrededor de ${sol(INEI.lineaPobreza * 4)} mensuales para superarla. La línea de pobreza extrema, que mide solo la canasta de alimentos, es de ${sol(INEI.lineaPobrezaExtrema)} por persona. Son umbrales mínimos de subsistencia, no un nivel de vida objetivo.`,
    },
    {
      q: '¿Por qué mi recibo de luz sube tanto cuando me paso de 140 kWh?',
      a: `Porque la tarifa BT5B residencial cambia de estructura en ese umbral. Hasta ${LUZ_BT5B.umbralKwh} kWh al mes pagas por bloques, con los primeros 30 kWh a un precio más bajo. Al pasar ese umbral se aplica una tarifa única sobre todo el consumo, no solo sobre el exceso, y esa tarifa es más cara que la del bloque anterior. Por eso un mes con un poco más de consumo puede tener un recibo bastante más alto: el salto no es proporcional.`,
    },
    {
      q: '¿Cómo se factura el agua de Sedapal?',
      a: `Por bloques crecientes de consumo: los primeros metros cúbicos tienen la tarifa más baja y cada bloque siguiente cuesta más. A eso se le suma el servicio de alcantarillado, que se calcula sobre el mismo consumo, y un cargo fijo mensual de ${sol(AGUA_CARGO_FIJO)} que se paga aunque no consumas nada. Al total se le aplica el IGV del ${(IGV * 100).toFixed(0)}%. Por eso bajar el consumo tiene efecto, pero nunca lleva el recibo a cero.`,
    },
    {
      q: '¿Conviene el gas natural por red o el balón de GLP?',
      a: `Por energía equivalente, el gas natural por red sale bastante más barato que el balón de GLP, que hoy ronda los ${sol(BALON_GLP)} por unidad de 10 kg. La contra es la instalación interna, que tiene un costo inicial y solo está disponible donde llega la red de distribución. Si tu zona tiene red, la conversión suele recuperarse en el consumo de los primeros años; si no la tiene, la cuenta se hace con balones.`,
    },
    {
      q: '¿Cuánto debería gastar en alquiler?',
      a: `La regla estándar de asequibilidad es que el alquiler no supere el ${(RATIO_ALQUILER.recomendado * 100).toFixed(0)}% del ingreso neto del hogar. Hasta un ${(RATIO_ALQUILER.tolerable * 100).toFixed(0)}% se considera ajustado pero manejable; por encima de eso el alquiler empieza a comerse el resto del presupuesto y cualquier imprevisto se vuelve deuda. En el mercado limeño esa regla deja fuera varios distritos incluso con ingresos por encima del promedio.`,
    },
    {
      q: '¿Qué es la canasta básica familiar y en qué se diferencia del costo de vida?',
      a: 'La canasta básica del INEI es un umbral estadístico de subsistencia: el valor de un conjunto mínimo de alimentos y de bienes y servicios básicos, usado para medir pobreza. El costo de vida es lo que efectivamente gasta un hogar concreto, que incluye cosas que la canasta no contempla, como internet, un alquiler de mercado, colegio privado o salidas. Por eso el costo de vida real de un hogar urbano está siempre bastante por encima de la línea de pobreza.',
    },
    {
      q: '¿Cuánto cuesta el transporte urbano al mes?',
      a: `Con el pasaje troncal de Lima en ${sol2(TRANSPORTE.pasaje)} y dos viajes al día durante los días laborables, un adulto gasta alrededor de ${sol(TRANSPORTE.pasaje * TRANSPORTE.viajesAdulto)} al mes solo en ir y volver del trabajo. Con hijos en edad escolar se suma el medio pasaje. Si se usan aplicaciones de taxi con frecuencia, el rubro se multiplica y suele ser el que más se subestima al armar un presupuesto.`,
    },
    {
      q: '¿Cómo afecta la inflación a mi presupuesto?',
      a: `La inflación no cambia lo que compras, cambia lo que cuesta comprar lo mismo. Con la variación interanual del IPC de Lima Metropolitana que publica el INEI, este hub muestra cuánto costaría tu mismo presupuesto dentro de un año si los precios se movieran al mismo ritmo. Es la cuenta que hay que hacer antes de aceptar un aumento de sueldo: si el aumento es menor que la inflación, en términos reales estás cobrando menos.`,
    },
    {
      q: '¿Se acostumbra dejar propina en el Perú?',
      a: 'No es obligatoria ni está incluida por ley en la cuenta. En restaurantes con servicio a la mesa lo habitual es dejar alrededor del 10% cuando el servicio estuvo bien, y muchos locales incluyen un recargo por servicio que ya figura en la boleta: conviene revisarla antes de dejar propina encima. Fuera de la gastronomía la propina es voluntaria y bastante menos frecuente que en otros países.',
    },
    {
      q: '¿Vivir en provincia es más barato que en Lima?',
      a: 'En promedio sí, sobre todo en vivienda y transporte, que son los dos rubros donde la diferencia es más grande. Los servicios domiciliarios varían por empresa distribuidora y no siempre son más baratos, y algunos productos importados llegan más caros por el flete. Este hub aplica un ajuste general a transporte y servicios, pero si tienes tus recibos a mano, cargar el consumo real es siempre más preciso que cualquier factor promedio.',
    },
    {
      q: '¿Qué gastos no están en esta cuenta?',
      a: 'Salud, educación privada, ropa, entretenimiento, deudas y ahorro. Este hub cubre el piso de vivir: techo, comida, transporte y servicios. Un presupuesto completo suma esos rubros encima, y una regla práctica es que del ingreso quede al menos un margen para imprevistos: sin ese margen, cualquier gasto no previsto se financia con tarjeta y termina costando el doble.',
    },
    {
      q: '¿Cómo bajo el recibo de luz sin dejar de usar lo necesario?',
      a: `Lo que más mueve la aguja es no cruzar el umbral de ${LUZ_BT5B.umbralKwh} kWh, porque el salto de tarifa no es gradual. Después, los equipos de mayor consumo: terma eléctrica, plancha, hervidor y aire acondicionado. Un solo electrodoméstico de alto consumo usado a diario puede empujar el hogar del tramo social al tramo caro y encarecer todo el recibo, no solo el excedente.`,
    },
  ],

  sources: [
    { name: 'INEI — Evolución de la pobreza monetaria', url: 'https://www.gob.pe/institucion/inei', publisher: 'Instituto Nacional de Estadística e Informática' },
    { name: 'Osinergmin — Tarifa eléctrica residencial (BT5B)', url: 'https://www.osinergmin.gob.pe/Paginas/Folletos/folletos/tarifa_electrica_residencial.html', publisher: 'Osinergmin' },
    { name: 'Sunass — Yakúmetro: cálculo de la facturación de agua y alcantarillado', url: 'https://www.gob.pe/39636-calcular-facturacion-mensual-de-agua-potable-y-alcantarillado-yakumetro', publisher: 'Sunass' },
    { name: 'Sedapal — Estructura tarifaria vigente', url: 'https://www.sedapal.com.pe/', publisher: 'Sedapal' },
    { name: 'Cálidda — Tarifas de gas natural residencial', url: 'https://www.calidda.com.pe/', publisher: 'Cálidda' },
    { name: 'BCRP — Índice de precios al consumidor de Lima Metropolitana', url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/inflacion', publisher: 'Banco Central de Reserva del Perú' },
    { name: 'MTPE — Remuneración mínima vital', url: 'https://www.gob.pe/mtpe', publisher: 'Ministerio de Trabajo y Promoción del Empleo' },
  ],

  replaces: [
    '/pe/calculadora-costo-vida-mensual-peru',
    '/pe/calculadora-canasta-basica-peru-inei',
    '/pe/calculadora-alquiler-asequible-ingreso-peru',
    '/pe/calculadora-actualizacion-inflacion-ipc-peru',
    '/pe/calculadora-recibo-luz-peru-osinergmin',
    '/pe/calculadora-recibo-agua-sedapal-peru',
    '/pe/calculadora-recibo-gas-natural-calidda-peru',
    // Absorbida sólo por URL: usa la fórmula genérica de propinas y no es una decisión
    // de presupuesto propia; la pregunta que responde queda cubierta en las FAQ.
    '/pe/calculadora-de-propinas-peru',
  ],

  lastReviewed: '2026-07-28',
};
