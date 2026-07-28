import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me sale este viaje en auto?"
 *
 * Absorbe 4 calculadoras sueltas del silo Auto de Chile: costo del viaje en bencina,
 * desglose del precio de la bencina (impuesto específico + IVA), costo mensual del TAG
 * en las autopistas urbanas de Santiago, y comparación eléctrico vs bencinero a 5 años.
 *
 * La UTM es dato VIVO (src/data/live/chile.json). El impuesto específico a los
 * combustibles se expresa en UTM/m³ (Ley 18.502) y el MEPCO (Ley 20.765) lo ajusta
 * cada semana: por eso la tasa en UTM/m³ es un CAMPO EDITABLE con su fecha de dato,
 * no una constante.
 *
 * DIFERENCIA DELIBERADA contra la fórmula vieja (ver reporte): el impuesto específico
 * NO forma parte de la base imponible del IVA (Art. 6° Ley 18.502). La fórmula
 * absorbida calculaba el IVA como precio × 0,19/1,19 sobre el precio TOTAL, cobrando
 * IVA sobre el impuesto específico y sobrestimando el IVA por litro.
 */

/** Disclaimers YMYL — copiados textuales de src/lib/disclaimers.ts. */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos, con los mismos fallbacks que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

export const IVA = CHILE_2026.iva;

/**
 * Impuesto específico a los combustibles — Ley 18.502, en UTM por metro cúbico.
 * El componente variable del MEPCO (Ley 20.765) se recalcula CADA SEMANA por decreto,
 * así que estos valores son referenciales y en el hub viajan como campo editable.
 * Referencia: decretos MEPCO / SII, dato al 2026-07-28. 1 m³ = 1.000 litros.
 */
export const IMPUESTO_ESPECIFICO_FECHA = '2026-07-28';
export const COMBUSTIBLES: Array<{ id: string; nombre: string; utmM3: number }> = [
  { id: 'g93', nombre: 'Gasolina 93 octanos', utmM3: 5.1774 },
  { id: 'g97', nombre: 'Gasolina 97 octanos', utmM3: 5.2286 },
  { id: 'diesel', nombre: 'Petróleo diésel', utmM3: 2.5123 },
];

/**
 * Tarifas por kilómetro del TAG — referencia de Costanera Norte, categoría 1 (autos).
 * CADUCAN: cada concesionaria fija las suyas y se reajustan por IPC más un factor real
 * cada 1 de enero. En el hub son un campo editable con fecha, no una constante.
 */
export const TAG_TARIFA_FECHA = '2026-07-28';
export const TAG_TARIFAS: Array<{ id: string; nombre: string; valorKm: number }> = [
  { id: 'fuera_punta', nombre: 'Tarifa Base Fuera de Punta (TBFP)', valorKm: 107 },
  { id: 'punta', nombre: 'Tarifa Base Punta (TBP)', valorKm: 206 },
  { id: 'saturacion', nombre: 'Tarifa de Saturación (TS)', valorKm: 312 },
];

/**
 * Costos operativos anuales para la comparación eléctrico vs bencinero.
 * Son supuestos de mercado editables en el propio cálculo, no valores legales.
 * Reemplazan los defaults de la calc absorbida, que traía una "patente anual" de
 * $800.000 y una "revisión técnica anual" de $140.000 — ambos muy por encima de la
 * realidad (el permiso de circulación se calcula acá con la tabla del Art. 12 de la
 * Ley 18.290 y la revisión técnica ronda los $30.000).
 */
export const TCO_ANIOS = 5;
export const TCO_SUPUESTOS = {
  mantencionAnualElectrico: 300_000,
  mantencionAnualBencinero: 600_000,
  revisionTecnicaAnual: 30_000,
  seguroAnualElectrico: 1_200_000,
  seguroAnualBencinero: 900_000,
  depreciacionAnualElectrico: 0.12,
  depreciacionAnualBencinero: 0.10,
};

/** Permiso de circulación — Art. 12 Ley 18.290, misma tabla que el hub del costo anual. */
export const PERMISO_TRAMOS: Array<{ desdeUtm: number; hastaUtm: number | null; fijoUtm: number; tasa: number }> = [
  { desdeUtm: 0, hastaUtm: 60, fijoUtm: 0, tasa: 0.01 },
  { desdeUtm: 60, hastaUtm: 120, fijoUtm: 0.6, tasa: 0.02 },
  { desdeUtm: 120, hastaUtm: 250, fijoUtm: 1.8, tasa: 0.03 },
  { desdeUtm: 250, hastaUtm: 400, fijoUtm: 5.7, tasa: 0.04 },
  { desdeUtm: 400, hastaUtm: null, fijoUtm: 11.7, tasa: 0.045 },
];
export const PERMISO_MINIMO_UTM = 0.5;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/auto/cuanto-gasto-en-el-viaje',
  title: 'Cuánto sale un viaje en auto en Chile: bencina, TAG y cuánto del litro es impuesto',
  description:
    'Calcula cuánto te sale un viaje en auto en Chile: litros según el rendimiento y el precio del combustible, peajes y TAG de las autopistas urbanas, y el desglose de cuánto de cada litro de bencina es impuesto específico (Ley 18.502) e IVA. Y si estás dudando, la comparación de costo total de un eléctrico contra un bencinero a cinco años.',
  silo: 'Auto',
  siloHref: '/cl/auto',
  locale: 'cl',

  eyebrow: 'Chile · bencina, peajes y TAG',
  h1: '¿Cuánto me sale este viaje en auto?',
  lede:
    'Pon los kilómetros, el rendimiento de tu auto y el precio del litro y mira cuánto se va en bencina y en peajes. Más abajo puedes cambiar el caso y ver el gasto mensual de TAG, cuánto de cada litro se lo lleva el Estado, o si a cinco años te conviene un eléctrico.',
  stamps: [
    `UTM del mes: ${fmt(UTM)}`,
    'Impuesto específico en UTM/m³ · Ley 18.502 + MEPCO Ley 20.765',
    `IVA ${Math.round(IVA * 100)}% · DL 825`,
    'Tarifas de TAG y precios de combustible editables',
    '4 cálculos en una sola página',
  ],

  resultLabel: 'Costo estimado del viaje',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más común: vas a hacer un viaje puntual a otra ciudad y quieres saber cuánto tienes que llevar.',
    items: [
      {
        id: 'viaje',
        label: 'Voy a hacer un viaje puntual a otra ciudad',
        hint: 'Litros que vas a gastar, costo de la bencina y peajes de la ruta.',
        yes: [
          'Litros estimados según los kilómetros y el consumo real de tu auto en L/100 km',
          'Costo del combustible al precio de litro que pongas',
          'Peajes de la ruta, si los conoces',
          'Costo por kilómetro del viaje completo, útil para repartir gastos',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El precio del litro CADUCA: cambia todas las semanas por el MEPCO y varía entre estaciones y regiones. Es un campo editable a propósito',
          'El consumo de catálogo casi siempre es optimista: en ruta con aire acondicionado, carga y viento en contra puedes gastar entre un 10% y un 20% más',
          'Este cálculo es sólo del viaje de ida: si vuelves, duplica los kilómetros y los peajes',
          'No incluye el desgaste del auto ni la mantención, que en viajes largos es plata real aunque no la veas ese día',
        ],
        plazo:
          'los precios de combustible se actualizan todos los jueves con el nuevo decreto MEPCO: si el viaje es la semana que viene, vuelve a mirar el precio.',
        answer:
          'El costo del viaje son los litros que gastas (km × consumo ÷ 100) por el precio del litro, más los peajes de la ruta.',
      },
      {
        id: 'tag',
        label: 'Uso las autopistas de Santiago todos los días',
        hint: 'Peaje por kilómetro según el horario, más el arriendo del dispositivo TAG.',
        yes: [
          'Costo diario según los kilómetros que hagas en autopista y la tarifa horaria que te toque',
          'Costo mensual sumando los días que efectivamente la usas, más el arriendo del dispositivo',
          'Proyección anual del gasto en TAG',
          'Comparación contra lo que gastas en bencina en esos mismos kilómetros',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Las tarifas por kilómetro CADUCAN: cada concesionaria fija las suyas y se reajustan cada 1 de enero por IPC más un factor real. Es un campo editable',
          'Hay tres tarifas según el horario: fuera de punta, punta y saturación. La de saturación puede ser el triple de la más barata',
          'Circular sin TAG o con el dispositivo en mal estado genera una infracción por cada pórtico, no una sola',
          'Si tienes deuda de TAG impaga no puedes sacar el permiso de circulación del año siguiente',
        ],
        plazo:
          'las tarifas de las concesionarias se reajustan cada 1 de enero; la cuenta del TAG llega mensual y el no pago se cobra con intereses y puede terminar en cobranza judicial.',
        answer:
          'El TAG se cobra por kilómetro recorrido y cambia según el horario: multiplica tus kilómetros diarios por la tarifa y por los días que usas la autopista, y súmale el arriendo del dispositivo.',
      },
      {
        id: 'impuestos',
        label: '¿Por qué está tan cara la bencina?',
        hint: 'Cuánto de cada litro es impuesto específico, cuánto es IVA y cuánto es el combustible.',
        yes: [
          'Impuesto específico por litro, convertido desde la tasa en UTM por metro cúbico de la Ley 18.502',
          'IVA del 19% que se aplica sobre el valor del combustible, sin incluir el impuesto específico',
          'Componente base: el combustible propiamente tal, el transporte y el margen de la estación',
          'Porcentaje del precio del litro que se lleva el Estado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tasa del impuesto específico se ajusta CADA SEMANA por el MEPCO (Ley 20.765): el valor que trae la página es referencial y editable, confírmalo en el decreto vigente',
          'El impuesto específico no forma parte de la base imponible del IVA (Art. 6° Ley 18.502): calcularlo sobre el precio total infla el IVA que aparece en el desglose',
          'El diésel paga un impuesto específico bastante menor que las gasolinas, y los transportistas pueden recuperar parte de él',
          'El precio final de cada estación incluye además su propio margen, que varía de comuna en comuna',
        ],
        plazo:
          'el nuevo componente MEPCO se publica cada miércoles y rige desde el jueves siguiente: por eso los precios en surtidor se mueven semanalmente.',
        answer:
          'De cada litro de bencina en Chile, una parte grande es impuesto específico (una tasa en UTM por metro cúbico) más el IVA sobre el resto del precio.',
      },
      {
        id: 'electrico',
        label: '¿Me conviene un eléctrico?',
        hint: 'Costo total de propiedad a cinco años, incluyendo compra, energía, mantención y depreciación.',
        yes: [
          'Costo de la energía a cinco años en cada caso: kWh en el eléctrico, litros en el bencinero',
          'Mantención, seguro, revisión técnica y permiso de circulación de los cinco años',
          'Depreciación de cada vehículo y su valor residual al quinto año',
          'Costo total de propiedad y ahorro neto de una opción sobre la otra',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El resultado depende sobre todo de dos supuestos que nadie conoce: la depreciación del eléctrico y el precio de la energía a cinco años',
          'El permiso de circulación acá se calcula con la tabla del Art. 12 de la Ley 18.290 sobre el precio de cada vehículo, no con una cifra fija',
          'Cargar en la calle cuesta bastante más que cargar en la casa: si no tienes estacionamiento propio, el ahorro en energía se achica',
          'El eléctrico queda exento de impuesto verde al comprarlo, pero sí paga permiso de circulación y SOAP como cualquier otro auto',
          'La batería es el componente caro: revisa los años y kilómetros de garantía antes de comparar sólo por el precio de lista',
        ],
        plazo:
          'a cinco años el resultado se define por el sobreprecio inicial: si el eléctrico cuesta mucho más, el ahorro en energía y mantención rara vez alcanza a compensarlo dentro del plazo.',
        answer:
          'El eléctrico gana cuando el sobreprecio de compra es chico y haces muchos kilómetros al año; con pocos kilómetros el bencinero suele salir más barato a cinco años.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu viaje y de tu auto',
  inputsIntro:
    'Todo en pesos chilenos. Cada campo dice en qué caso se usa: los que no aplican a tu situación puedes dejarlos como están.',
  fields: [
    {
      id: 'distanciaKm',
      label: 'Distancia del viaje (km)',
      type: 'number',
      value: 300,
      min: 0,
      max: 10000,
      step: 1,
      help: 'Sólo la ida. Si vuelves por la misma ruta, pon el doble.',
    },
    {
      id: 'consumoL100',
      label: 'Consumo de tu auto (L/100 km)',
      type: 'number',
      value: 7,
      min: 1,
      max: 40,
      step: 0.1,
      help: 'El consumo real en ruta, no el de catálogo. Un auto chico anda en 6-7 y una camioneta en 10-12.',
    },
    {
      id: 'precioLitro',
      label: 'Precio del litro en surtidor (CLP)',
      prefix: '$',
      value: '1.300',
      thousands: true,
      help: `Dato editable: cambia todas las semanas con el MEPCO y varía por estación y región. Referencia al ${IMPUESTO_ESPECIFICO_FECHA}.`,
    },
    {
      id: 'combustible',
      label: 'Tipo de combustible',
      type: 'select',
      value: 'g93',
      options: COMBUSTIBLES.map((c) => ({ value: c.id, label: c.nombre })),
      help: 'Define qué tasa de impuesto específico se aplica. El diésel paga bastante menos que las gasolinas.',
    },
    {
      id: 'tasaUtmM3',
      label: 'Impuesto específico vigente (UTM por m³)',
      type: 'number',
      value: 5.1774,
      min: 0,
      max: 15,
      step: 0.0001,
      help: `Dato editable: lo fija el decreto MEPCO de cada semana. Valor de referencia al ${IMPUESTO_ESPECIFICO_FECHA}; si dejas el que trae, se usa el del combustible que elegiste.`,
    },
    {
      id: 'peajes',
      label: 'Peajes de la ruta (CLP)',
      prefix: '$',
      value: '12.000',
      thousands: true,
      help: 'Suma de las plazas de peaje interurbanas del trayecto. Si no las conoces, déjalo en cero.',
    },
    {
      id: 'kmDiariosTag',
      label: 'Kilómetros diarios en autopista urbana (km)',
      type: 'number',
      value: 20,
      min: 0,
      max: 300,
      step: 1,
      help: 'Sólo se usa en el caso del TAG. Cuenta ida y vuelta si haces las dos por autopista.',
    },
    {
      id: 'tarifaTag',
      label: 'Horario en que usas la autopista',
      type: 'select',
      value: 'punta',
      options: TAG_TARIFAS.map((t) => ({ value: t.id, label: `${t.nombre} — $${t.valorKm}/km` })),
      help: 'Fuera de punta, punta o saturación. La de saturación puede ser casi el triple de la más barata.',
    },
    {
      id: 'tarifaKm',
      label: 'Tarifa por kilómetro del TAG (CLP)',
      prefix: '$',
      value: 206,
      type: 'number',
      min: 0,
      max: 2000,
      step: 1,
      help: `Dato editable: cada concesionaria fija la suya y se reajusta cada 1 de enero. Referencia de Costanera Norte al ${TAG_TARIFA_FECHA}.`,
    },
    {
      id: 'diasMesTag',
      label: 'Días al mes que usas la autopista',
      type: 'number',
      value: 22,
      min: 0,
      max: 31,
      step: 1,
      help: 'Días hábiles típicos de un mes de trabajo: 22.',
    },
    {
      id: 'arriendoTag',
      label: 'Arriendo mensual del dispositivo TAG (CLP)',
      prefix: '$',
      value: '4.000',
      thousands: true,
      help: 'Lo cobra la concesionaria en la cuenta mensual. Si tienes varios TAG, súmalos.',
    },
    {
      id: 'kmAnuales',
      label: 'Kilómetros que haces al año',
      type: 'number',
      value: 15000,
      min: 0,
      max: 200000,
      step: 500,
      help: 'Sólo se usa en la comparación eléctrico contra bencinero. Es la variable que más mueve el resultado.',
    },
    {
      id: 'precioElectrico',
      label: 'Precio del auto eléctrico (CLP)',
      prefix: '$',
      value: '25.000.000',
      thousands: true,
      help: 'Precio de lista del eléctrico que estás mirando.',
    },
    {
      id: 'precioBencinero',
      label: 'Precio del bencinero equivalente (CLP)',
      prefix: '$',
      value: '18.000.000',
      thousands: true,
      help: 'El modelo comparable a bencina. La diferencia con el eléctrico es el sobreprecio que hay que recuperar.',
    },
    {
      id: 'consumoKwh100',
      label: 'Consumo del eléctrico (kWh/100 km)',
      type: 'number',
      value: 15,
      min: 5,
      max: 40,
      step: 0.5,
      help: 'Un eléctrico compacto anda en 14-17 kWh cada 100 km.',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh en tu casa (CLP)',
      prefix: '$',
      value: 150,
      type: 'number',
      min: 0,
      max: 1000,
      step: 1,
      help: 'Míralo en tu boleta de electricidad. Cargar en la calle cuesta bastante más.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del viaje',
    caption:
      'Compara el peso del combustible contra los peajes, y en el caso del desglose, cuánto de cada litro es impuesto y cuánto es combustible de verdad.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada gasto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cómo calculo cuánta bencina gasto en un viaje?',
      a: 'Multiplica los kilómetros por el consumo de tu auto en litros cada 100 kilómetros y divide por 100: eso te da los litros. Después multiplica los litros por el precio del litro. Por ejemplo, 300 km con un consumo de 7 L/100 km son 21 litros, y a $1.300 el litro son $27.300. A eso súmale los peajes de la ruta para tener el costo real del viaje.',
    },
    {
      q: '¿El consumo que dice el fabricante es el que voy a tener?',
      a: 'Casi nunca. Las cifras homologadas se miden en ciclos de laboratorio y en la vida real el consumo sube entre un 10% y un 20% por el aire acondicionado, la carga, el viento, la altura y el estilo de manejo. En carretera a velocidad constante te puedes acercar bastante al dato de catálogo; en ciudad con tacos, ni cerca. Para presupuestar un viaje, usa el consumo que te da tu propio auto entre carga y carga.',
    },
    {
      q: '¿Cuánto de lo que pago por un litro de bencina son impuestos?',
      a: 'Dos impuestos distintos. El impuesto específico a los combustibles de la Ley 18.502 se cobra por metro cúbico y se expresa en UTM, así que su valor en pesos cambia mes a mes con la UTM, y además el MEPCO lo ajusta cada semana. Encima va el IVA del 19%, que se calcula sobre el valor del combustible sin incluir el impuesto específico. Sumados, se llevan una fracción importante del precio del litro, más alta en gasolinas que en diésel.',
    },
    {
      q: '¿El IVA se calcula también sobre el impuesto específico?',
      a: 'No. El Art. 6° de la Ley 18.502 deja el impuesto específico fuera de la base imponible del IVA. Es un detalle que muchas calculadoras se saltan: si calculas el IVA como precio total × 0,19 ÷ 1,19 estás cobrando IVA sobre el impuesto específico y el desglose te da un IVA más alto del que realmente pagas, y un componente de combustible más bajo del real.',
    },
    {
      q: '¿Qué es el MEPCO y por qué cambia el precio todas las semanas?',
      a: 'Es el Mecanismo de Estabilización de Precios de los Combustibles, creado por la Ley 20.765. Funciona subiendo o bajando el componente variable del impuesto específico para amortiguar los saltos del precio internacional del petróleo y del dólar. Cada miércoles se publica el decreto con los nuevos valores, que rigen desde el jueves. Por eso el precio en el surtidor se mueve semanalmente aunque nada haya cambiado en tu estación.',
    },
    {
      q: '¿Cómo se cobra el TAG en las autopistas de Santiago?',
      a: 'Por kilómetro efectivamente recorrido, no por pórtico pasado. Hay tres tarifas según el horario: base fuera de punta, base punta y saturación, esta última en las horas de mayor congestión. La diferencia entre la más barata y la de saturación puede ser casi el triple. A eso se suma el arriendo mensual del dispositivo, que se cobra igual aunque no uses la autopista ese mes.',
    },
    {
      q: '¿Puedo circular por la autopista sin TAG?',
      a: 'Puedes hacerlo con un pase diario que venden las concesionarias, pero si pasas sin TAG y sin pase te cursan una infracción por cada pórtico que cruzas, no una sola por el trayecto. Eso convierte un viaje corto en una cuenta muy alta. Además, la deuda de TAG impaga te bloquea el permiso de circulación del año siguiente, así que arrastrarla no es una opción realista.',
    },
    {
      q: '¿Cuánto se ahorra de verdad con un auto eléctrico en Chile?',
      a: 'En energía el ahorro es grande: un eléctrico que consume 15 kWh cada 100 km cargando en casa gasta una fracción de lo que gasta un bencinero de 8 L/100 km. También ahorra en mantención, porque tiene muchas menos piezas móviles. El problema es el sobreprecio de compra y la depreciación, que hoy es más fuerte en los eléctricos. Con 15.000 km al año y un sobreprecio de varios millones, es habitual que el bencinero siga saliendo más barato a cinco años.',
    },
    {
      q: '¿A partir de cuántos kilómetros al año conviene el eléctrico?',
      a: 'No hay un número universal, porque depende del sobreprecio, del precio del kWh y del de la bencina. Pero la lógica es simple: el ahorro por kilómetro es lo que separa el costo de energía de las dos opciones, y el sobreprecio inicial se divide por ese ahorro. Si haces pocos kilómetros, el sobreprecio no se amortiza nunca dentro del horizonte de cinco años. Si haces muchos, y sobre todo si cargas en casa a tarifa doméstica, el punto de equilibrio se adelanta bastante.',
    },
    {
      q: '¿El eléctrico paga permiso de circulación y SOAP?',
      a: 'Sí, los dos, igual que cualquier otro vehículo: el permiso se calcula con la misma tabla del Art. 12 de la Ley 18.290 sobre su tasación fiscal, y el SOAP es obligatorio para circular. Lo que el eléctrico no paga es el impuesto verde de la Ley 20.780, porque no consume combustible ni emite óxidos de nitrógeno y los dos términos de la fórmula quedan en cero.',
    },
    {
      q: '¿Conviene cargar el eléctrico en casa o en electrolineras?',
      a: 'En casa, sin comparación. La tarifa doméstica es bastante más barata que la de una carga rápida en la calle, que además cobra por la potencia entregada. Si no tienes estacionamiento con enchufe propio, buena parte del ahorro que hace atractivo al eléctrico se evapora, y eso es lo primero que conviene resolver antes de decidir la compra.',
    },
    {
      q: '¿Por qué el precio de la bencina es distinto en cada estación y en cada región?',
      a: 'Porque sobre el impuesto específico y el IVA, que son iguales en todo el país, cada distribuidora y cada estación aplican su propio margen, y a eso se suma el costo de transporte desde el terminal más cercano. Por eso una estación en una comuna alejada suele ser más cara que una en el centro, y por eso conviene mirar los precios comparados que publica la CNE antes de cargar.',
    },
  ],

  sources: [
    {
      name: 'Ley 18.502 — impuesto específico a los combustibles',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29854',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Ley 20.765 — Mecanismo de Estabilización de Precios de los Combustibles (MEPCO)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1064812',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'CNE — precios de referencia y componentes del MEPCO',
      url: 'https://www.cne.cl/precios-de-referencia-e-impuestos-especificos/',
      publisher: 'Comisión Nacional de Energía',
    },
    {
      name: 'SEC — bencina en línea, precios de combustible por estación de servicio',
      url: 'https://www.sec.cl/combustibles/',
      publisher: 'Superintendencia de Electricidad y Combustibles',
    },
    {
      name: 'SII — valor mensual de la UTM',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'MOP — Concesiones, autopistas urbanas y sistema de peaje electrónico',
      url: 'https://www.concesiones.cl/',
      publisher: 'Ministerio de Obras Públicas',
    },
    {
      name: 'Costanera Norte — tarifas vigentes por kilómetro',
      url: 'https://www.costaneranorte.cl/tarifas/',
      publisher: 'Sociedad Concesionaria Costanera Norte',
    },
    {
      name: 'Ley 18.290 de Tránsito — permiso de circulación (Art. 12)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29708',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Ministerio de Energía — electromovilidad y costos de carga',
      url: 'https://energia.gob.cl/electromovilidad',
      publisher: 'Ministerio de Energía de Chile',
    },
  ],

  replaces: [
    '/calculadora-copec-costo-viaje-bencina-chile',
    '/calculadora-desglose-precio-bencina-impuesto-especifico-chile',
    '/calculadora-costo-tag-autopistas-santiago-chile',
    '/calculadora-coche-electrico-vs-gasolina-chile-tco-5-anos',
  ],

  lastReviewed: '2026-07-28',
};
