import type { HubData } from './types';
import { TARIFAS_2026, TARIFA_PARAMS } from './factura-de-luz';

/**
 * Hub de decisión — "¿Cuánto me cuesta el aire o la calefacción?"
 * Arquetipo RAMIFICADO: cinco caminos reales (enfriar, calentar, dimensionar el
 * equipo, agua caliente y demanda térmica de la zona).
 *
 * Absorbe 9 calculadoras sueltas de climatización (ver hub.replaces).
 *
 * LÍMITE DE ALCANCE: este hub es CONSUMO y COSTO. La envolvente del ambiente
 * (espesor de aislante, placas, puentes térmicos) vive en /construccion/aislacion
 * y acá sólo entra como un factor de dimensionamiento.
 *
 * NOTAS DE CONTRATO:
 *  - El hub MEZCLA unidades: pesos, kWh, W, frigorías, BTU, kcal/h, kg, m³ y
 *    grados-día. TODAS las filas que no son plata declaran su propio
 *    `format`/`unit`: el runtime hace Object.assign y una fila sin formato
 *    propio se imprime en pesos.
 *  - El precio de la luz NO se inventa: sale de `TARIFAS_2026`/`TARIFA_PARAMS`
 *    (copia fiel de
 *    `src/lib/formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts`),
 *    la misma fuente que ya usan los hubs de gaming y presión.
 *  - El precio del gas sale de `src/lib/formulas/tarifa-gas-metrogas-naturgy-cuadro-2026.ts`
 *    (cuadro ENARGAS), copiado abajo en GAS_R23.
 */
export const hub: HubData = {
  slug: 'hogar/climatizacion',
  title: '¿Cuánto me cuesta el aire o la calefacción? Consumo y costo real — 2026',
  description:
    'Calculá cuánto gastás en climatizar tu casa: costo del aire acondicionado por hora y por mes, qué calefacción sale más barata (gas, eléctrica, aire o leña), qué equipo necesita tu ambiente en frigorías y kcal/h, y termo eléctrico vs gas.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Guía y estimación del hogar',
  h1: '¿Cuánto me cuesta el aire o la calefacción?',
  lede:
    'La climatización es el rubro que más mueve la boleta cuando aprieta el frío o el calor. Arrancamos por lo más consultado —cuánto sale tener el aire prendido— y desde ahí bajás a con qué calefaccionar, qué equipo te pide el ambiente, cuánto cuesta el agua caliente y cuánta demanda térmica tiene tu zona.',
  stamps: [
    'Actualizado 27-07-2026',
    'Cuadros ENRE y ENARGAS aplicados',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Costo estimado del mes',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Partimos por la pregunta más frecuente. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'frio',
        label: 'Cuánto me sale tener el aire prendido',
        hint: 'El caso más común',
        answer:
          'El costo del aire es su potencia eléctrica por las horas de uso, al precio pleno del kWh: casi nunca entra en el bloque subsidiado.',
        yes: [
          'Dimensionamos primero el equipo que le corresponde a tu ambiente en frigorías',
          'Convertimos frigorías a consumo eléctrico según el EER del equipo (inverter o velocidad fija)',
          'Multiplicamos por las horas de uso, los días del mes y el precio del kWh con impuestos incluidos',
          'Te mostramos costo por hora, por mes y por toda la temporada',
        ],
        warn: [
          'Aunque tengas subsidio, el bloque bonificado (300 kWh en meses de mayor demanda) se lo come el consumo de base de la casa: los kWh del aire se pagan a precio pleno',
          'Un equipo sobredimensionado enfría rápido pero prende y apaga todo el tiempo, deshumidifica peor y no ahorra',
          'Subir un grado el termostato baja el consumo alrededor de un 7%: es la palanca más barata que tenés',
        ],
        plazo: 'los meses de mayor demanda (verano e invierno) son los que tienen bloque bonificado de 300 kWh; en primavera y otoño son 150.',
      },
      {
        id: 'calor',
        label: 'Con qué calefacción gasto menos',
        hint: 'Gas vs eléctrico vs aire vs leña',
        answer:
          'Con tarifa de red, el gas natural suele ser la opción más barata por hora de calor; el calefactor eléctrico, la más cara.',
        yes: [
          'Comparamos cuatro fuentes para el mismo ambiente y las mismas horas: gas natural, calefactor eléctrico, aire acondicionado en modo calor y leña',
          'Cada fuente usa su propio consumo típico por hora según el tamaño del ambiente',
          'El aire en modo calor rinde mucho más que una resistencia eléctrica: mueve calor en lugar de generarlo',
          'Te damos el costo del mes y el de la temporada completa',
        ],
        warn: [
          'La comparación vale para gas natural de red. Con garrafa o gas envasado los números cambian por completo',
          'La leña depende del precio de plaza y de que esté seca: verde rinde bastante menos de lo calculado',
          'Un calefactor eléctrico de resistencia y un caloventor consumen casi lo mismo por hora de uso: el caloventor no es más barato, sólo calienta más rápido',
        ],
        plazo: 'la leña conviene comprarla y estibarla en verano: en pleno invierno sube y viene húmeda.',
      },
      {
        id: 'equipo',
        label: 'Qué equipo necesita mi ambiente',
        hint: 'Frigorías, BTU y kcal/h',
        answer:
          'Como regla, unas 600 BTU por m² ajustadas por orientación y aislación para frío, y unas 125 kcal/h por m² para calor.',
        yes: [
          'Frigorías y BTU necesarios para enfriar el ambiente, ya redondeados al equipo comercial más chico que alcanza',
          'kcal/h que le pide un calefactor de tiro balanceado para el mismo ambiente',
          'La diferencia entre lo que necesitás y lo que se vende: los equipos vienen en escalones fijos',
        ],
        warn: [
          'Este dimensionamiento es orientativo: no reemplaza el cálculo de un instalador matriculado',
          'Un ambiente con mucho vidrio al oeste o techo sin aislar puede pedir hasta un 25% más de lo estimado',
          'Los equipos de más de 18.000 BTU suelen necesitar instalación de 220 V con línea propia',
        ],
        plazo: 'la instalación de gas de un tiro balanceado la tiene que hacer y firmar un gasista matriculado.',
      },
      {
        id: 'agua',
        label: 'Agua caliente: termo eléctrico o gas',
        hint: 'Cuál sale más barato al mes',
        answer:
          'Con tarifa de red el termotanque a gas suele salir bastante menos por mes, aunque rinda peor que el eléctrico.',
        yes: [
          'Calculamos la energía térmica real que hace falta para llevar tus litros diarios de 15 °C a 55 °C',
          'La dividimos por el rendimiento de cada equipo: 95% el eléctrico, 80% el de gas',
          'La pasamos a pesos con el precio del kWh y el del m³ de gas',
        ],
        warn: [
          'El eléctrico rinde mejor pero la energía eléctrica cuesta mucho más por unidad de calor: por eso pierde en pesos',
          'No entra en la cuenta la inversión inicial ni la instalación, que en gas es más cara',
          'Un termotanque viejo o mal aislado pierde calor todo el día aunque no uses agua',
        ],
        plazo: 'el ánodo de sacrificio del termotanque se cambia cada 2 a 3 años: es lo que evita que se pique el tanque.',
      },
      {
        id: 'grados-dia',
        label: 'Cuánta demanda térmica tiene mi zona',
        hint: 'Grados-día HDD y CDD',
        answer:
          'Los grados-día miden cuánto frío o calor tuvo el período: es el número que explica por qué un mes gasta más que otro.',
        yes: [
          'HDD: grados-día de calefacción, contra una base de 18 °C',
          'CDD: grados-día de refrigeración, contra una base de 24 °C',
          'Sirven para comparar dos meses o dos años sin confundir clima con hábito de consumo',
        ],
        warn: [
          'El cálculo usa una temperatura media del período: con una media única se pierden las olas de frío y de calor, que es donde se dispara el consumo',
          'Las bases 18/24 °C son el estándar ASHRAE; algunos estudios locales usan otras y los números no son comparables entre sí',
        ],
        plazo: 'las series de temperatura media por localidad las publica el Servicio Meteorológico Nacional.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'm2', label: 'Metros cuadrados del ambiente', type: 'number', min: 4, max: 200, value: 20 },
    { id: 'horas', label: 'Horas de uso por día', type: 'number', min: 1, max: 24, value: 8 },
    { id: 'meses', label: 'Meses que dura la temporada', type: 'number', min: 1, max: 12, value: 4 },
    {
      id: 'equipo',
      label: 'Tipo de equipo de aire',
      type: 'select',
      value: 'inverter',
      options: [
        { value: 'inverter', label: 'Inverter (EER 4,5)' },
        { value: 'fijo', label: 'Velocidad fija / on-off (EER 3)' },
      ],
    },
    {
      id: 'distribuidora',
      label: 'Distribuidora de luz',
      type: 'select',
      value: 'edenor',
      options: [
        { value: 'edenor', label: 'Edenor' },
        { value: 'edesur', label: 'Edesur' },
      ],
    },
    {
      id: 'condicion',
      label: 'Tu condición de subsidio eléctrico',
      type: 'select',
      value: 'sin-subsidio',
      options: [
        { value: 'sin-subsidio', label: 'Sin subsidio (tarifa plena)' },
        { value: 'subsidio', label: 'Con subsidio (SEF)' },
      ],
      help: 'Aun con subsidio, el bloque bonificado se agota con el consumo de base de la casa: los kWh de climatización se pagan casi siempre a precio pleno.',
    },
    { id: 'litros', label: 'Litros de agua caliente por día', type: 'number', min: 10, max: 600, value: 120 },
    {
      id: 'precioLena',
      label: 'Precio de la leña por kilo',
      prefix: '$',
      value: '30',
      thousands: true,
      help: 'Precio de plaza: no hay cuadro oficial de leña. Se vende por bolsa o por metro estibado, así que dividí y cambialo acá.',
    },
    { id: 'temp', label: 'Temperatura media del período (°C)', type: 'number', min: -20, max: 45, value: 11 },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. El precio del gas sale de un cuadro tarifario sin verificar contra el último publicado por ENARGAS (en julio de 2026 hubo un aumento que esta página no refleja), así que la comparación entre gas y electricidad es orientativa: el costo real del gas hoy es mayor que el que se muestra acá.',

  chart: {
    type: 'bars',
    title: 'Comparación del caso',
    caption:
      'Las barras comparan cada opción con la más grande. En la rama de costos leés directamente qué fuente de calor o frío te sale más cara.',
  },
  breakdownTitle: 'De dónde sale el número',
  breakdownIntro: 'Cada fila muestra el paso intermedio, con su unidad, para que puedas rehacer la cuenta.',

  faq: [
    {
      q: '¿Cuánto consume un aire acondicionado de 3.000 frigorías por hora?',
      a: 'Un split de 3.000 frigorías mueve unos 3.489 W térmicos. Con un equipo inverter (EER 4,5) eso son unos 775 W eléctricos, o sea 0,78 kWh por hora. Con uno de velocidad fija (EER 3) sube a unos 1.163 W, casi 1,2 kWh por hora: un 50% más de consumo para el mismo frío.',
    },
    {
      q: '¿Cuántas frigorías necesito por metro cuadrado?',
      a: 'La regla práctica es 600 BTU por m² (unas 150 frigorías por m²) para un ambiente estándar de 2,60 m de techo, orientación este u oeste y aislación normal. Se ajusta hacia arriba si el ambiente da al norte, tiene mucho vidrio o el techo no está aislado, y hacia abajo con buena aislación.',
    },
    {
      q: '¿Conviene apagar el aire cuando salgo o dejarlo prendido?',
      a: 'Si salís menos de una hora, conviene dejarlo: un inverter en régimen consume mucho menos que arrancando de cero, porque el pico de arranque es el momento de mayor consumo. Si salís varias horas, apagalo.',
    },
    {
      q: '¿Qué calefacción sale más barata en Argentina?',
      a: 'Con gas natural de red, el gas gana con comodidad frente al calefactor eléctrico. El aire acondicionado en modo calor queda en el medio y suele ser la mejor opción eléctrica, porque mueve calor en lugar de generarlo y rinde tres o cuatro veces más que una resistencia. La leña compite con el gas o lo supera según el precio de plaza.',
    },
    {
      q: '¿Por qué el calefactor eléctrico es tan caro si el aire también anda con luz?',
      a: 'Porque una resistencia convierte 1 kWh eléctrico en 1 kWh de calor y nada más. Un aire en modo calor es una bomba de calor: usa ese 1 kWh para trasladar tres o cuatro kWh de calor desde afuera. Misma electricidad, tres o cuatro veces más calefacción.',
    },
    {
      q: '¿Cuántas kcal/h necesito de calefactor de tiro balanceado?',
      a: 'Unas 125 kcal/h por m² con techo de 2,50 m y aislación regular: 50 kcal por m³ de ambiente. Con buena aislación baja a 40 y con mala sube a 60. Los modelos comerciales vienen en 2.500, 3.000, 4.000, 5.500 y 7.500 kcal/h, así que casi siempre vas a comprar algo por encima de lo que necesitás.',
    },
    {
      q: '¿Cuánta leña necesito para pasar el invierno?',
      a: 'Una salamandra quema unos 3 kg de leña por hora de uso, un hogar abierto unos 5 kg y una estufa de alto rendimiento unos 2 kg. Con 6 horas por día durante 4 meses en salamandra son unos 2.160 kg, cerca de 5,4 m³ estibados: la leña seca pesa unos 400 kg por m³.',
    },
    {
      q: '¿Termotanque eléctrico o a gas?',
      a: 'El eléctrico rinde mejor (unos 95% contra 80%) pero la energía eléctrica cuesta muchas veces más por unidad de calor que el gas de red, así que en la factura mensual el gas gana casi siempre. El eléctrico tiene sentido donde no hay red de gas o para consumos muy chicos.',
    },
    {
      q: '¿Qué son los grados-día HDD y CDD?',
      a: 'Son la suma de cuántos grados por día la temperatura media quedó por debajo de 18 °C (HDD, demanda de calefacción) o por encima de 24 °C (CDD, demanda de refrigeración). Un mes con 200 HDD pide aproximadamente el doble de calefacción que uno con 100, y sirven para comparar consumos entre años sin confundir clima con hábito.',
    },
    {
      q: '¿Los kWh del aire entran en el bloque subsidiado?',
      a: 'En la práctica no. El bloque bonificado del esquema SEF es de 300 kWh en los meses de mayor demanda y 150 en los templados, y el consumo de base de un hogar (heladera, iluminación, electrónica) ya lo agota. Lo que suma la climatización cae del lado del excedente y se paga a precio pleno: por eso la boleta pega el salto justo en verano e invierno.',
    },
    {
      q: '¿Un inverter se paga solo?',
      a: 'Depende de las horas. Un inverter consume alrededor de un 33% menos que un equipo de velocidad fija equivalente. Con uso intensivo de temporada la diferencia mensual es grande y el recambio se amortiza en pocos veranos; con uso esporádico, no.',
    },
    {
      q: '¿Sirve tapar rendijas y cortinar antes que comprar un equipo más grande?',
      a: 'Casi siempre sí. Reducir infiltraciones y proteger los vidrios del sol directo baja la carga térmica del ambiente, y eso te deja comprar un equipo más chico que además va a trabajar menos horas al año. La envolvente es la primera intervención; el equipo, la segunda.',
    },
  ],

  sources: [
    {
      name: 'Cuadros tarifarios de distribución eléctrica — Edenor y Edesur',
      url: 'https://www.argentina.gob.ar/enre',
      publisher: 'ENRE — Ente Nacional Regulador de la Electricidad',
    },
    {
      name: 'Esquema de subsidios a la energía (SEF) — Decreto 943/2025',
      url: 'https://www.argentina.gob.ar/economia/energia',
      publisher: 'Secretaría de Energía de la Nación',
    },
    {
      name: 'Cuadros tarifarios de gas natural por distribuidora',
      url: 'https://www.enargas.gob.ar/secciones/precios-y-tarifas/cuadros-tarifarios.php',
      publisher: 'ENARGAS — Ente Nacional Regulador del Gas',
    },
    {
      name: 'Etiquetado de eficiencia energética de acondicionadores de aire (IRAM 62406)',
      url: 'https://www.argentina.gob.ar/produccion/etiquetado-de-eficiencia-energetica',
      publisher: 'Secretaría de Industria y Comercio',
    },
    {
      name: 'ASHRAE Handbook — Fundamentals, grados-día de calefacción y refrigeración',
      url: 'https://www.ashrae.org/technical-resources/ashrae-handbook',
      publisher: 'ASHRAE',
    },
    {
      name: 'Estadísticas climatológicas — temperaturas medias por localidad',
      url: 'https://www.smn.gob.ar/estadisticas',
      publisher: 'Servicio Meteorológico Nacional',
    },
  ],

  replaces: [
    '/calculadora-tamano-aire-acondicionado-btu-habitacion',
    '/calculadora-costo-mensual-aire-acondicionado-consumo-kwh-factura',
    '/calculadora-costo-calefaccion-invierno',
    '/calculadora-grados-dia-calefaccion-refrigeracion-hdd-cdd-consumo',
    '/calculadora-calefactor-tiro-balanceado-kcal-m2-invierno',
    '/calculadora-ahorro-termo-electrico-vs-gas',
    '/calculadora-aire-acondicionado-frigorias-ambiente',
    '/calculadora-lena-estufa-hogar-invierno',
    '/calculadora-costo-aire-acondicionado-hora',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Carga impositiva de la boleta de luz, EXACTAMENTE como la aplica el módulo
 * real: alumbrado sobre el subtotal, IVA sobre (subtotal + alumbrado) y Ley
 * 25.413 sobre el subtotal. Da 1,3776 — no es lo mismo que multiplicar los tres
 * factores en cadena.
 */
export const FACTOR_IMPUESTOS_LUZ =
  (1 + TARIFA_PARAMS.alumbrado) * (1 + TARIFA_PARAMS.iva) + TARIFA_PARAMS.ley25413;

/**
 * Cuadro de gas — COPIA FIEL de la categoría R23 (residencial de consumo medio,
 * la típica de un hogar con calefacción) de
 * `src/lib/formulas/tarifa-gas-metrogas-naturgy-cuadro-2026.ts`.
 * Los cargos fijos no entran acá: para comparar fuentes de calor sólo importa
 * el costo MARGINAL del m³ consumido de más.
 */
export const GAS_R23 = {
  /** $/m³ del gas propiamente dicho. */
  variableGas: 49,
  /** $/m³ de distribución. */
  variableDist: 54,
  iva: 0.27,
  tasas: 0.025,
};

/** Precio marginal del m³ de gas con impuestos, categoría R23 sin subsidio. */
export const PRECIO_GAS_M3 =
  (GAS_R23.variableGas + GAS_R23.variableDist) * (1 + GAS_R23.iva + GAS_R23.tasas);

/** EER por tipo de equipo (mismo criterio que costo-mensual-aire-acondicionado.ts). */
export const EER: Record<string, number> = { inverter: 4.5, fijo: 3 };

/** Consumo típico por hora de cada fuente de calor según tamaño del ambiente. */
export const CONSUMO_CALOR: Record<string, { gasM3h: number; elecW: number; aireW: number }> = {
  chico: { gasM3h: 0.3, elecW: 1500, aireW: 650 },
  mediano: { gasM3h: 0.4, elecW: 2000, aireW: 850 },
  grande: { gasM3h: 0.6, elecW: 2500, aireW: 1200 },
};

/** kg de leña por hora de una salamandra (lena-estufa-hogar-invierno.ts). */
export const LENA_KG_HORA = 3;
/** Leña seca estibada: ~400 kg por m³. */
export const LENA_KG_M3 = 400;

/** Dimensionamiento de frío (tamano-aire-acondicionado-btu-habitacion.ts). */
export const BTU = {
  porM2: 600,
  alturaRef: 2.6,
  altura: 2.6,
  /** Orientación este/oeste, el caso más común. */
  factorOrientacion: 1.1,
  /** Aislación normal. */
  factorAislacion: 1.0,
  /** 1 frigoría = 4 BTU (redondeo comercial del módulo original). */
  btuPorFrigoria: 4,
  comerciales: [6000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000],
};

/** Dimensionamiento de calor (calefactor-tiro-balanceado-kcal-m2-invierno.ts). */
export const KCAL = {
  altura: 2.5,
  /** Aislación regular. */
  factor: 50,
  modelos: [2500, 3000, 4000, 5500, 7500],
};

/** Agua caliente sanitaria (ahorro-termo-electrico-vs-gas.ts). */
export const ACS = {
  deltaT: 40,
  kcalPorKwh: 860,
  eficienciaElectrico: 0.95,
  eficienciaGas: 0.8,
  /** 1 m³ de gas natural ≈ 10,4 kWh (~8.950 kcal). */
  kwhPorM3: 10.4,
};

/** Grados-día, bases ASHRAE (grados-dia-hdd-cdd.ts). */
export const GRADOS_DIA = { baseHDD: 18, baseCDD: 24 };

/** Consumo eléctrico de base de un hogar tipo, sin climatización (kWh/mes). */
export const BASE_HOGAR_KWH = 250;

export const DIAS_MES = 30;

export { TARIFAS_2026, TARIFA_PARAMS };
