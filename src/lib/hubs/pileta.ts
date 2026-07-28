import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto sale mantener la pileta?"
 *
 * Arquetipo CÁLCULO DOMINANTE (calculadora-costo-mensual-pileta se lleva la
 * pregunta), así que NO usa `cases`: la respuesta va en `answer` y la forma, el
 * tipo de pileta y la estación se eligen en `select`.
 *
 * Absorbe 4 calculadoras (ver hub.replaces):
 *   - pileta-natacion-litros-m3          → volumen (litros y m³) por forma
 *   - evaporacion-piscina-litros-dia     → evaporación mm/día y L/día (Rohwer)
 *   - piscina-cloro-mantenimiento-...    → cloro y alguicida por mes
 *   - calculadora-costo-mensual-pileta   → agua + luz de la bomba + químicos
 *
 * EXTENSIONES sobre las fórmulas originales (documentadas en el reporte):
 *   1. Forma "ovalada" (estadio: rectángulo + dos semicírculos). La fórmula
 *      original sólo tenía rectangular / circular / riñón.
 *   2. Reposición de agua CALCULADA en vez de pedida como % arbitrario:
 *      evaporación del mes + agua perdida en los retrolavados del filtro.
 *   3. Cuarto rubro del costo: filtro y mantenimiento (arena, floculante,
 *      servicio). La fórmula vieja sólo sumaba agua + luz + químicos.
 *   4. Estación: en invierno la pileta se invernada (cobertor + bomba mínima).
 *      En VERANO todos los factores valen 1, así que el hub reproduce las
 *      fórmulas originales exactamente.
 *
 * NOTAS DE CONTRATO:
 *  - Litros, m³, m², mm, g, kg, kWh, horas y porcentajes NO son plata: todas
 *    esas filas declaran `format: 'unit'`. El runtime hace Object.assign y una
 *    fila sin `format` propio cae a pesos.
 *  - El default del resultado sí es 'ars': el número grande es el costo mensual.
 */

/** Disclaimer textual de `getCalculatorDisclaimer` (dominio 'general', categoría hogar). */
const D =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'hogar/pileta',
  title: '¿Cuánto sale mantener la pileta? — Costo mensual, cloro y agua',
  description:
    'Calculá el costo mensual real de tu pileta: litros que tiene, cloro y alguicida por mes, agua que se evapora y hay que reponer, luz de la bomba y filtro. Rectangular, circular, ovalada o riñón, en verano y en invierno.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'El costo real de tenerla',
  h1: '¿Cuánto sale mantener la pileta?',
  lede:
    'Todo arranca por un número: cuántos litros tiene. De ahí salen el cloro que consume, el agua que se evapora y hay que reponer, y lo que gasta la bomba. Poné las medidas de tu pileta y abajo tenés el costo del mes desglosado.',
  stamps: [
    'Rectangular, circular, ovalada y riñón',
    'Verano e invernada',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo mensual de la pileta',

  inputsTitle: 'Las medidas de tu pileta y tus precios',
  inputsIntro:
    'Con largo, ancho y profundidades ya tenés el volumen y una estimación completa. El resto ajusta el número a tu tarifa y a tu forma de mantenerla.',
  fields: [
    {
      id: 'forma',
      label: 'Forma de la pileta',
      type: 'select',
      value: 'rectangular',
      options: [
        { value: 'rectangular', label: 'Rectangular (largo × ancho)' },
        { value: 'circular', label: 'Circular u ovalada elíptica (π/4)' },
        { value: 'ovalada', label: 'Ovalada tipo estadio (recta con puntas redondeadas)' },
        { value: 'rinon', label: 'Riñón o forma libre (85% del rectángulo)' },
      ],
      help: 'Medí el rectángulo que la contiene: el factor de forma se encarga del resto.',
    },
    {
      id: 'largoM',
      label: 'Largo',
      type: 'number',
      suffix: 'm',
      min: 0.5,
      max: 100,
      step: 0.1,
      value: 8,
    },
    {
      id: 'anchoM',
      label: 'Ancho (o diámetro)',
      type: 'number',
      suffix: 'm',
      min: 0.5,
      max: 50,
      step: 0.1,
      value: 4,
    },
    {
      id: 'profMinM',
      label: 'Profundidad en la parte baja',
      type: 'number',
      suffix: 'm',
      min: 0.2,
      max: 5,
      step: 0.1,
      value: 1.2,
    },
    {
      id: 'profMaxM',
      label: 'Profundidad en la parte honda',
      type: 'number',
      suffix: 'm',
      min: 0.2,
      max: 6,
      step: 0.1,
      value: 1.8,
      help: 'Si la pileta tiene fondo plano, poné el mismo valor que arriba.',
    },
    {
      id: 'tipo',
      label: 'Tipo de pileta',
      type: 'select',
      value: 'hormigon',
      options: [
        { value: 'lona', label: 'Lona desmontable (filtro de cartucho)' },
        { value: 'fibra', label: 'Fibra de vidrio' },
        { value: 'hormigon', label: 'Hormigón revestido' },
      ],
      help: 'Define cuánta agua se va en los retrolavados del filtro y cuánto pesa el mantenimiento.',
    },
    {
      id: 'estacion',
      label: 'Época del año',
      type: 'select',
      value: 'verano',
      options: [
        { value: 'verano', label: 'Temporada: la pileta se usa' },
        { value: 'invierno', label: 'Invernada: tapada y en mantenimiento mínimo' },
      ],
      help: 'En invernada la pileta va con cobertor, la bomba filtra un rato corto y el cloro cae fuerte.',
    },
    {
      id: 'sistema',
      label: 'Sistema de cloración',
      type: 'select',
      value: 'granulado',
      options: [
        { value: 'granulado', label: 'Cloro granulado (65% de activo)' },
        { value: 'liquido', label: 'Cloro líquido (10%)' },
        { value: 'pastillas', label: 'Pastillas de tricloro (90%)' },
        { value: 'sal', label: 'Clorador salino (genera el cloro solo)' },
      ],
    },
    {
      id: 'uso',
      label: 'Cuánto se usa',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'bajo', label: 'Poco: fines de semana' },
        { value: 'medio', label: 'Uso normal de familia' },
        { value: 'alto', label: 'Mucho: chicos e invitados casi todos los días' },
      ],
      help: 'Cada bañista consume cloro: el uso alto sube la dosis un 40%.',
    },
    {
      id: 'exposicion',
      label: 'Exposición al sol',
      type: 'select',
      value: 'mixta',
      options: [
        { value: 'sombra', label: 'Mayormente a la sombra' },
        { value: 'mixta', label: 'Sol y sombra' },
        { value: 'sol', label: 'Pleno sol todo el día' },
      ],
      help: 'El sol degrada el cloro: a pleno sol la dosis sube un 25%.',
    },
    {
      id: 'temperatura',
      label: 'Temperatura media del aire',
      type: 'number',
      suffix: '°C',
      min: -10,
      max: 50,
      step: 1,
      value: 28,
      help: 'La media de la época, no la máxima de un día puntual.',
    },
    {
      id: 'humedad',
      label: 'Humedad relativa media',
      type: 'number',
      suffix: '%',
      min: 1,
      max: 100,
      step: 1,
      value: 55,
    },
    {
      id: 'viento',
      label: 'Viento medio',
      type: 'number',
      suffix: 'km/h',
      min: 0,
      max: 150,
      step: 1,
      value: 10,
      help: 'El del pronóstico, que se mide a 10 metros de altura en terreno abierto.',
    },
    {
      id: 'abrigo',
      label: '¿Cuánto viento le llega al agua?',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'expuesta', label: 'Expuesta — campo abierto, sin reparo' },
        { value: 'normal', label: 'Normal — casa con cerco o medianeras' },
        { value: 'protegida', label: 'Protegida — patio cerrado, muros altos' },
      ],
      help: 'Sobre el espejo de agua sopla bastante menos que a 10 metros: en un patio con cerco, alrededor de un tercio.',
    },
    {
      id: 'potenciaBomba',
      label: 'Potencia de la bomba',
      type: 'number',
      suffix: 'W',
      min: 50,
      max: 5000,
      step: 50,
      value: 750,
      help: '750 W es 1 HP, la bomba típica de una pileta familiar.',
    },
    {
      id: 'horasBombaDia',
      label: 'Horas de filtrado por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 6,
      help: 'En temporada se recomienda filtrar todo el volumen al menos una vez por día.',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh',
      prefix: '$',
      type: 'number',
      min: 0,
      max: 100000,
      step: 1,
      value: 220,
      help: 'Sale de tu factura: importe de energía dividido los kWh del período.',
    },
    {
      id: 'precioAguaM3',
      label: 'Precio del metro cúbico de agua',
      prefix: '$',
      type: 'number',
      min: 0,
      max: 100000,
      step: 1,
      value: 133,
      help: 'Si no tenés medidor, dejalo igual para ver cuánta agua se va aunque no la pagues aparte.',
    },
    {
      id: 'precioCloro',
      label: 'Precio del kilo de cloro granulado',
      prefix: '$',
      value: '4.500',
      thousands: true,
    },
    {
      id: 'precioAlguicida',
      label: 'Precio del litro de alguicida',
      prefix: '$',
      value: '3.200',
      thousands: true,
    },
    {
      id: 'mantenimiento',
      label: 'Filtro y mantenimiento por mes',
      prefix: '$',
      value: '25.000',
      thousands: true,
      help: 'Arena o cartucho, floculante, elevador de pH, red y service. Es el rubro que más varía.',
    },
  ],
  fineprint: `${D} La evaporación es una estimación climática: el consumo real cambia con el viento, la temperatura del agua y si usás cobertor. Los precios de cloro y alguicida varían mucho entre marcas y entre bidón y pastilla.`,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata de la pileta',
    caption:
      'El anillo reparte el costo del mes entre el agua que reponés, el cloro y el alguicida, la luz que consume la bomba mientras filtra y el filtro con su mantenimiento. En la mayoría de las piletas la bomba y el mantenimiento pesan más que el agua, que es lo que casi todo el mundo cree que es el gasto grande.',
  },
  breakdownTitle: 'Litros, químicos, kilovatios y pesos',
  breakdownIntro:
    'Las filas en pesos son plata; las de litros, metros cúbicos, gramos, kilos, kWh y horas llevan su unidad. Las barras comparan cada valor con el mayor de su tabla.',

  answer: {
    title: 'De qué está hecho el gasto de una pileta',
    copy:
      'El costo de una pileta no es "el cloro". Son cuatro rubros: el agua que se evapora y reponés, los químicos, la electricidad de la bomba y el mantenimiento del filtro. Y los cuatro salen del mismo número de partida: cuántos litros tiene.',
    yes: [
      'Volumen: largo × ancho × profundidad promedio × el factor de tu forma, en m³ y en litros',
      'Evaporación: milímetros por día sobre la superficie del espejo de agua, según temperatura, humedad y viento',
      'Retrolavado: cada limpieza del filtro de arena se lleva agua que también hay que reponer',
      'Cloro: una dosis base de 2 ppm por día, corregida por cuánto se usa y cuánto sol recibe',
      'Alguicida: 1 mL cada 1.000 litros por semana como dosis preventiva, el doble a pleno sol o con uso alto',
      'Luz: potencia de la bomba en kW × horas de filtrado × 30 días × precio del kWh',
    ],
    warn: [
      D,
      'El cobertor es la palanca más barata que existe: tapada, la pileta corta la evaporación de forma drástica y consume menos cloro',
      'Bajar horas de filtrado ahorra luz, pero por debajo de un recambio completo del volumen por día el agua se pone verde y el ahorro se te va en cloro de choque',
      'El clorador salino no compra cloro, pero sí consume electricidad en la celda y sal por temporada: no es gratis',
      'La dosis de cloro es orientativa: lo que manda es el test de cloro libre y pH, no la cuenta',
      'La evaporación es muy sensible al viento que cargues: con vientos medios altos el resultado se va al extremo superior del rango, así que usalo como cota máxima',
      'El llenado inicial no está en este número: llenar una pileta de cero es un gasto de una sola vez que puede valer varios meses de mantenimiento',
    ],
    plazo:
      'medí cloro libre y pH dos veces por semana en temporada; el pH fuera de 7,2–7,6 hace que el cloro que pusiste casi no desinfecte.',
  },

  faq: [
    {
      q: '¿Cuánto sale mantener una pileta por mes?',
      a: 'Depende del volumen, pero la cuenta siempre es la misma: agua de reposición (los metros cúbicos que se evaporan y los del retrolavado, por el precio del m³), químicos (cloro y alguicida), electricidad de la bomba (potencia en kW × horas por día × 30 × precio del kWh) y el mantenimiento del filtro. En una pileta familiar típica de unos 30 m³ en pleno verano, la bomba y el mantenimiento suelen llevarse más de la mitad del total, y el agua es el rubro más chico si tenés tarifa residencial.',
    },
    {
      q: '¿Cuántos litros tiene mi pileta?',
      a: 'Multiplicá largo × ancho × profundidad promedio y el resultado en m³ por 1.000. La profundidad promedio es (mínima + máxima) ÷ 2. Si la pileta no es rectangular se aplica un factor de forma: π/4 (0,785) para las circulares y elípticas, y 0,85 para las de riñón o forma libre. Una pileta de 8 × 4 m con fondo de 1,2 a 1,8 m tiene 48 m³, o sea 48.000 litros.',
    },
    {
      q: '¿Cuánto cloro necesita mi pileta por mes?',
      a: 'La referencia de mantenimiento es una dosis de cloro activo de unos 2 ppm por día (2 mg por litro), que se corrige por uso y por sol. Esos gramos de cloro activo se dividen por la concentración del producto: el granulado ronda el 65%, las pastillas de tricloro el 90% y el cloro líquido apenas el 10%. Por eso el líquido parece barato por litro pero rinde mucho menos por unidad de cloro activo.',
    },
    {
      q: '¿Cuánta agua se evapora de una pileta por día?',
      a: 'Se mide en milímetros de lámina por día, y cada milímetro sobre un metro cuadrado de espejo de agua es un litro: una pileta de 32 m² que evapora 5 mm pierde 160 litros por día, unos 4.800 al mes. Los tres factores son la temperatura, la humedad y sobre todo el viento, que es el que más la dispara: con aire quieto y humedad alta la evaporación se desploma, y con viento fuerte y aire seco se multiplica. El modelo que usa esta página es sensible al viento, así que si cargás vientos medios altos vas a ver valores en el extremo superior del rango: tomalo como cota máxima y contrastalo midiendo cuánto baja el nivel de tu pileta en una semana sin lluvia.',
    },
    {
      q: '¿El cobertor realmente ahorra?',
      a: 'Es la medida con mejor relación costo-beneficio. Tapada, la pileta corta la mayor parte de la evaporación —que es la principal vía de pérdida de agua y de calor— y además protege al cloro de la radiación solar, que es lo que más rápido lo degrada. En invernada, con cobertor puesto, el consumo de agua y de químicos cae a una fracción del de temporada.',
    },
    {
      q: '¿Cuántas horas por día tengo que hacer funcionar la bomba?',
      a: 'La regla práctica es filtrar al menos una vez todo el volumen por día: dividí los m³ de la pileta por el caudal de la bomba en m³/h y ese es el mínimo. En la mayoría de las piletas familiares eso da entre 4 y 8 horas en temporada. Conviene repartirlas en dos tandas, una a la mañana y otra a la tarde, en vez de una sola corrida.',
    },
    {
      q: '¿Cuánta luz consume la bomba de la pileta?',
      a: 'Una bomba de 1 HP son 750 W. Seis horas por día durante 30 días son 135 kWh al mes, que a tarifa plena residencial es una parte muy visible de la factura de luz de verano: puede ser el aparato que más consume de toda la casa en esos meses. Cada hora diaria que le sacás son unos 22 kWh menos por mes.',
    },
    {
      q: '¿El clorador salino sale más barato?',
      a: 'En químicos sí: la celda genera el cloro a partir de la sal disuelta y no comprás cloro. Pero el ahorro no es total, porque la celda consume electricidad mientras filtra, hay que reponer sal por temporada y la celda es un consumible que se reemplaza cada varios años. Igual seguís necesitando alguicida y control de pH.',
    },
    {
      q: '¿Cuánta agua pierdo en el retrolavado del filtro?',
      a: 'Un retrolavado de un filtro de arena manda al desagüe entre el 1% y el 2% del volumen de la pileta, y en temporada se hace más o menos una vez por semana. En una pileta de 48 m³ eso son entre 500 y 1.000 litros por semana, o sea de 2 a 4 m³ al mes: puede llegar a acercarse a lo que perdés por evaporación. Las piletas de lona con filtro de cartucho no tienen esa pérdida porque el cartucho se lava con manguera.',
    },
    {
      q: '¿Por qué el agua se pone verde si le pongo cloro igual?',
      a: 'Casi siempre por pH fuera de rango o por filtrado insuficiente. Con pH por encima de 7,8 el cloro que agregaste queda en una forma que desinfecta muchísimo menos, así que el test te da cloro pero el agua se vuelve verde igual. Antes de tirar más cloro, medí y corregí el pH a 7,2–7,6, y revisá que la bomba esté filtrando el volumen completo todos los días.',
    },
    {
      q: '¿Cuánto sale llenar la pileta de cero?',
      a: 'Es el volumen completo por el precio del m³, un gasto de una sola vez que no entra en el costo mensual. Si tu conexión no tiene medidor, el agua de red no se cobra por consumo, pero el camión cisterna sí se cobra por viaje y ahí el llenado inicial se vuelve el gasto más grande del año. Por eso conviene no vaciarla en invierno: invernarla sale mucho menos que volver a llenarla.',
    },
    {
      q: '¿Conviene vaciar la pileta en invierno?',
      a: 'No. Vaciarla implica volver a llenarla, y además una pileta vacía sufre: el revestimiento se reseca y una de hormigón puede llegar a levantarse por la presión de la napa. La invernada —cobertor, alguicida de invierno y unas pocas horas de filtrado por día— cuesta una fracción del mantenimiento de temporada y te evita el llenado completo en primavera.',
    },
  ],

  sources: [
    {
      name: 'Cuadros tarifarios de energía eléctrica (precio del kWh)',
      url: 'https://www.argentina.gob.ar/enre/cuadros-tarifarios',
      publisher: 'ENRE',
    },
    {
      name: 'Cuadro tarifario y régimen tarifario de agua y saneamiento',
      url: 'https://www.aysa.com.ar/Que-Hacemos/tarifas',
      publisher: 'AySA',
    },
    {
      name: 'Evaporation from free water surfaces (Technical Bulletin 271) — base empírica del cálculo de evaporación',
      url: 'https://naldc.nal.usda.gov/catalog/CAT86200278',
      publisher: 'USDA',
    },
    {
      name: 'Crop evapotranspiration — FAO Irrigation and Drainage Paper 56 (presión de vapor de saturación, ecuación de Tetens)',
      url: 'https://www.fao.org/4/x0490e/x0490e00.htm',
      publisher: 'FAO',
    },
    {
      name: 'Guidelines for safe recreational water environments — Volume 2: Swimming pools and similar environments (cloro libre y pH)',
      url: 'https://www.who.int/publications/i/item/9241546808',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Healthy Swimming — desinfección, cloro libre y control de pH en piletas',
      url: 'https://www.cdc.gov/healthy-swimming/about/index.html',
      publisher: 'CDC',
    },
  ],

  replaces: [
    '/calculadora-pileta-natacion-litros-m3',
    '/calculadora-costo-mensual-pileta',
    '/calculadora-piscina-cloro-mantenimiento-mensual-litros-tamano',
    '/calculadora-tiempo-evaporacion-piscina-litros-dia',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-pileta-cloro-litros-volumen-dosificacion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Factor de forma sobre el rectángulo que contiene la pileta.
 *  - rectangular / circular / rinon: los de `pileta-natacion-litros-m3.ts`.
 *  - ovalada: NO estaba en la fórmula original. Es un "estadio" (rectángulo con
 *    dos semicírculos en las puntas): área = L·A − A²·(1 − π/4), así que el
 *    factor depende de la relación largo/ancho y se calcula, no es constante.
 */
export const FORMAS: Record<string, { label: string; factor: number | null }> = {
  rectangular: { label: 'rectangular', factor: 1 },
  circular: { label: 'circular', factor: Math.PI / 4 },
  ovalada: { label: 'ovalada', factor: null },
  rinon: { label: 'riñón', factor: 0.85 },
};

/**
 * Tipo de pileta.
 *  - retrolavadoPct: % del volumen que se va por cada retrolavado semanal del
 *    filtro. La lona usa cartucho: se lava con manguera, no descarga la pileta.
 *  - mantFactor: peso relativo del gasto de filtro y mantenimiento.
 */
export const TIPOS: Record<string, { label: string; retrolavadoPct: number; mantFactor: number }> = {
  lona: { label: 'lona desmontable', retrolavadoPct: 0, mantFactor: 0.5 },
  fibra: { label: 'fibra de vidrio', retrolavadoPct: 1.5, mantFactor: 0.8 },
  hormigon: { label: 'hormigón', retrolavadoPct: 2, mantFactor: 1 },
};

/**
 * Estación. En VERANO todos los factores valen 1: el hub reproduce exactamente
 * las fórmulas originales. En invernada la pileta va tapada (el cobertor corta
 * la evaporación), la bomba filtra un tercio del tiempo y la dosis de cloro cae.
 */
export const ESTACIONES: Record<
  string,
  { label: string; evap: number; cloro: number; alguicida: number; bomba: number }
> = {
  verano: { label: 'temporada', evap: 1, cloro: 1, alguicida: 1, bomba: 1 },
  invierno: { label: 'invernada', evap: 0.3, cloro: 0.3, alguicida: 0.5, bomba: 0.33 },
};

/** Factores de la dosis de cloro (de `piscina-cloro-mantenimiento-mensual-litros-tamaño.ts`). */
export const CLORO = {
  /** Dosis base de cloro activo, en ppm por día. */
  DOSIS_BASE_PPM_DIA: 2.0,
  USO: { bajo: 0.75, medio: 1.0, alto: 1.4 } as Record<string, number>,
  SOLAR: { sombra: 0.8, mixta: 1.0, sol: 1.25 } as Record<string, number>,
  /** % de cloro activo del producto comercial. */
  ACTIVO: { granulado: 0.65, liquido: 0.1, sal: 1.0, pastillas: 0.9 } as Record<string, number>,
  /** Precio relativo al granulado por unidad de cloro activo. */
  PRECIO: { granulado: 1.0, liquido: 0.55, sal: 0.0, pastillas: 1.35 } as Record<string, number>,
  LABEL: {
    granulado: 'cloro granulado 65%',
    liquido: 'cloro líquido 10%',
    sal: 'clorador salino',
    pastillas: 'pastillas 90%',
  } as Record<string, string>,
  /** Dosis preventiva de alguicida: mL por cada 1.000 L y por semana. */
  ALGUICIDA_ML_1000L_SEMANA: 1.0,
  /** Semanas promedio por mes. */
  SEMANAS_MES: 4.33,
};

/*
 * Evaporación: método de Shah (2014), ASHRAE Transactions 120(2), paper
 * SE-14-001, tabla 14 — pileta exterior desocupada = el mayor de la convección
 * natural, la forzada con aire quieto y la forzada por viento.
 *
 * Reemplaza a la correlación anterior `(2,2 + 1,5·v)·(es − ea)`, que no
 * correspondía a ninguna fuente publicada y daba hasta 29 mm/día (casi 3 cm de
 * bajada de nivel diaria) cuando el rango real de una pileta en verano es de 4
 * a 8 mm/día: el término de viento dominaba al base ya a 6 km/h.
 *
 * El otro error que arreglamos es de unidades, no de fórmula: el viento que
 * informa el pronóstico se mide a 10 m en terreno abierto, y la correlación
 * pide la velocidad SOBRE el espejo de agua. De ahí el factor de abrigo.
 */
export const EVAP = {
  /** Ec. 1 — convección natural. */
  C: 35,
  /** Ec. 2 y 7 — convección forzada. */
  B: 0.00005,
  /** Ec. 7 — velocidad de referencia, m/s. */
  U0: 0.15,
  P_ATM: 101325,
  R_AIRE_SECO: 287.055,
};

/** Cuánto del viento informado llega al espejo de agua. */
export const ABRIGO_EVAP: Record<string, { label: string; factor: number }> = {
  expuesta: { label: 'Expuesta (campo abierto, sin reparo)', factor: 0.5 },
  normal: { label: 'Normal (casa con cerco o medianeras)', factor: 0.3 },
  protegida: { label: 'Protegida (patio cerrado, muros altos)', factor: 0.15 },
};
