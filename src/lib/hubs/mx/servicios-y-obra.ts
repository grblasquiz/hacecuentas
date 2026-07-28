import type { HubData } from '../types';
import { GAS_LP_CDMX_JUL_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto pago de luz, gas y obra en mi casa?"
 *
 * Fusiona el recibo bimestral de CFE (tarifa doméstica con tramos y DAC), el
 * ahorro y repago de un sistema de paneles solares, el costo de llenar el tanque
 * estacionario o el cilindro de gas LP y el costo de construir por metro
 * cuadrado.
 *
 * Todas las tarifas y precios se copian TAL CUAL de las fórmulas originales; el
 * precio del gas LP viene de la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Tarifa doméstica CFE — copiada de
 * src/lib/formulas/luz-cfe-tarifa-domestica-bimestral-mexico.ts
 * Cuotas de junio 2026; CFE las ajusta cada mes y varían por región.
 */
export const CFE_MX = {
  precioBasico: 1.125,
  precioIntermedio: 1.369,
  precioExcedente: 4.004,
  dacPrecioKwh: 6.8,
  dacCargoFijoMensual: 142.41,
  /** IVA nacional 16% (8% en la franja fronteriza de 20 km). */
  iva: 0.16,
  /** Techos MENSUALES de cada tramo en temporada de verano, por zona climática. */
  bloquesVerano: {
    '1': { basicoHasta: 75, intermedioHasta: 140 },
    '1a': { basicoHasta: 100, intermedioHasta: 150 },
    '1b': { basicoHasta: 125, intermedioHasta: 225 },
    '1c': { basicoHasta: 150, intermedioHasta: 450 },
    '1d': { basicoHasta: 175, intermedioHasta: 600 },
    '1e': { basicoHasta: 300, intermedioHasta: 900 },
    '1f': { basicoHasta: 300, intermedioHasta: 2500 },
  } as Record<string, { basicoHasta: number; intermedioHasta: number }>,
  bloqueFueraVerano: { basicoHasta: 75, intermedioHasta: 140 },
  /** Límite de Alto Consumo (promedio móvil de 12 meses, kWh/mes) que dispara la DAC. */
  limiteDac: { '1': 250, '1a': 300, '1b': 400, '1c': 850, '1d': 1000, '1e': 2000, '1f': 2500 } as Record<string, number>,
};

/** Gas LP — precio máximo CNE (CDMX, semana del 12 al 18 de julio de 2026). */
export const GAS_LP_MX = GAS_LP_CDMX_JUL_2026;

/**
 * Costo de construcción llave en mano, MXN/m² — copiado de
 * src/lib/formulas/costo-construccion-m2-mexico.ts (CMIC/CEICO + mercado 2026).
 */
export const OBRA_MX = {
  costoM2: { economica: 13000, media: 19000, premium: 32000 } as Record<string, number>,
  /** Reparto orientativo de análisis de precios unitarios. */
  pctMateriales: 0.6,
};

export const hub: HubData = {
  slug: 'mx/hogar/servicios-y-obra',
  title: 'Luz CFE, gas LP, paneles solares y costo de obra: cuánto pagas por tu casa en México',
  description:
    'Calcula tu recibo bimestral de CFE con los tramos de la tarifa doméstica y la DAC, cuánto ahorras con paneles solares y en cuánto se pagan, cuánto cuesta llenar el tanque de gas LP y cuánto sale construir por metro cuadrado.',
  silo: 'Hogar',
  siloHref: '/mx/hogar',

  eyebrow: 'México · servicios y obra del hogar',
  h1: '¿Cuánto pago de luz, gas y obra en mi casa?',
  lede:
    'La luz se cobra por tramos, el gas por semana y la obra por metro cuadrado: tres lógicas distintas que aquí se calculan en un solo lugar. Pon tu consumo y tu proyecto y te decimos cuánto pagas hoy, cuánto ahorrarías con paneles y cuánto cuesta construir.',
  stamps: [
    'Tarifa doméstica CFE con tramos y DAC',
    'Precio del gas LP editable (la CNE lo publica cada semana)',
    'Repago de paneles solares',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que pagas',

  cases: {
    title: '¿Qué necesitas calcular?',
    intro:
      'Empezamos por el recibo de CFE, que es el que más gente quiere entender porque su lógica de tramos no aparece explicada en el propio recibo.',
    items: [
      {
        id: 'luz',
        label: 'Mi recibo de luz de CFE',
        hint: 'Desglose bimestral por tramo básico, intermedio y excedente, con IVA y aviso de DAC.',
        yes: [
          'Cargo de energía repartido en los tramos básico, intermedio y excedente',
          'IVA del 16% y total del recibo bimestral',
          'Costo promedio real por kWh',
          'Aviso si tu consumo te está acercando a la tarifa DAC',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los tramos de la tarifa doméstica son MENSUALES: un recibo bimestral se divide entre dos antes de aplicarlos, por eso conviene mirar el consumo por mes',
          'Las cuotas se ajustan cada mes y cambian por región; el resultado es una estimación, no una réplica exacta de tu recibo',
          'En la franja fronteriza de 20 km el IVA es del 8%, no del 16%: el cálculo usa el 16% nacional',
          'La reclasificación a DAC la dispara el promedio móvil de doce meses, no un solo bimestre alto',
        ],
        plazo: 'CFE factura cada dos meses en tarifa doméstica; el promedio de DAC se revisa mes a mes.',
        answer:
          'El recibo se arma cobrando el consumo mensual por tramos, sumando el IVA y multiplicando por dos; si el promedio anual supera el límite de tu zona, pasas a DAC y pierdes el subsidio.',
      },
      {
        id: 'solar',
        label: 'Me quiero poner paneles solares',
        hint: 'Cuánta energía genera el sistema, cuánto ahorras al año y en cuántos años se paga.',
        yes: [
          'Generación anual estimada del sistema',
          'Qué porcentaje de tu consumo anual alcanza a cubrir',
          'Ahorro anual sobre la parte variable del recibo',
          'Años de recuperación de la inversión',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Aunque el sistema cubra el 100% de tu consumo, el cargo fijo mensual se sigue pagando: por eso el ahorro nunca es el recibo completo',
          'La generación por kW instalado depende fuertemente de la irradiación de tu estado y de la orientación del techo: el valor por defecto es un promedio',
          'El excedente que inyectas a la red se compensa con reglas y plazos propios del contrato de interconexión: no es dinero en efectivo',
          'Sobredimensionar el sistema no acorta el repago, porque la energía que sobra de tu consumo anual no se paga igual',
        ],
        plazo: 'el contrato de interconexión con CFE se tramita antes de conectar el sistema.',
        answer:
          'El ahorro es la parte variable del recibo que el sistema alcanza a cubrir; el repago sale de dividir el costo instalado entre ese ahorro anual.',
      },
      {
        id: 'gas',
        label: 'Llenar el tanque o el cilindro de gas',
        hint: 'Cuánto gas cabe del nivel actual al objetivo y cuánto cuesta al precio de tu zona.',
        yes: [
          'Litros o kilos que hay que cargar según el nivel actual y el objetivo',
          'Costo del llenado al precio que pongas',
          'Equivalencia entre litros y kilos de gas LP',
          'Aviso si el objetivo de llenado supera el máximo seguro',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los tanques estacionarios se cargan a un máximo de alrededor del 85% de su capacidad por seguridad: el gas necesita espacio para expandirse',
          'La CNE publica el precio máximo del gas LP cada semana y por municipio: el valor por defecto es el de CDMX y hay que cambiarlo por el de tu zona',
          'El estacionario se vende por litro y el cilindro por kilo: son unidades distintas y no se comparan directamente',
        ],
        plazo: 'el precio máximo de la CNE cambia cada semana, normalmente los domingos.',
        answer:
          'La carga es la diferencia entre el nivel objetivo y el actual sobre la capacidad del recipiente, valuada al precio semanal de tu municipio.',
      },
      {
        id: 'obra',
        label: 'Construir o ampliar',
        hint: 'Costo por metro cuadrado llave en mano según el nivel de terminación.',
        yes: [
          'Costo total de la obra según metros y nivel de terminación',
          'Costo por metro cuadrado aplicado',
          'Reparto orientativo entre materiales y mano de obra',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Es un costo directo de obra llave en mano: no incluye terreno, proyecto, licencias, conexiones ni imprevistos',
          'Los rangos varían mucho por ciudad, por tipo de terreno y por acabados; tómalos como punto de partida para pedir presupuestos',
          'El reparto 60/40 entre materiales y mano de obra es una referencia de análisis de precios unitarios y cambia según la partida',
          'Una estimación por metro cuadrado no reemplaza el cálculo estructural ni la dirección de obra de un profesional habilitado',
        ],
        plazo: 'pide al menos tres presupuestos con el mismo alcance escrito antes de contratar.',
        answer:
          'La obra se estima multiplicando los metros por un costo por metro cuadrado según el nivel de terminación, con un reparto aproximado de 60% materiales y 40% mano de obra.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Cada rama usa solo los campos que necesita: llena los tuyos y deja el resto en su valor de ejemplo.',
  fields: [
    {
      id: 'consumoKwh',
      label: 'Consumo bimestral del recibo (kWh)',
      type: 'number',
      value: 250,
      min: 0,
      step: 10,
      suffix: 'kWh',
      help: 'Es la suma de los dos meses que aparece en tu recibo de CFE.',
    },
    {
      id: 'tarifaZona',
      label: 'Tarifa según zona climática',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Tarifa 1 — zona templada' },
        { value: '1a', label: 'Tarifa 1A' },
        { value: '1b', label: 'Tarifa 1B' },
        { value: '1c', label: 'Tarifa 1C' },
        { value: '1d', label: 'Tarifa 1D' },
        { value: '1e', label: 'Tarifa 1E' },
        { value: '1f', label: 'Tarifa 1F — zona más cálida' },
      ],
      help: 'Aparece impresa en tu recibo. A mayor letra, más calor y más kWh subsidiados en verano.',
    },
    {
      id: 'temporada',
      label: 'Temporada del recibo',
      type: 'select',
      value: 'verano',
      options: [
        { value: 'verano', label: 'Temporada de verano' },
        { value: 'fuera_verano', label: 'Fuera de verano' },
      ],
      help: 'Fuera de verano todas las zonas facturan con los tramos de la Tarifa 1.',
    },
    {
      id: 'aplicarDac',
      label: '¿Estás en tarifa DAC?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, alto consumo' },
      ],
      help: 'La DAC no tiene tramos ni subsidio: todo el consumo va a precio pleno.',
    },
    {
      id: 'consumoKwhMes',
      label: 'Consumo promedio mensual para el cálculo solar (kWh)',
      type: 'number',
      value: 650,
      min: 0,
      step: 10,
      suffix: 'kWh',
      help: 'Promedio de tus últimos doce meses, no el mes pico.',
    },
    {
      id: 'reciboMensual',
      label: 'Recibo CFE mensual equivalente ($)',
      type: 'number',
      value: 2400,
      min: 0,
      step: 50,
      prefix: '$',
      thousands: true,
      help: 'Divide entre dos tu recibo bimestral.',
    },
    {
      id: 'potenciaKw',
      label: 'Potencia del sistema (kW)',
      type: 'number',
      value: 5,
      min: 0,
      step: 0.5,
      suffix: 'kW',
      help: 'La suma de la potencia de todos los paneles.',
    },
    {
      id: 'costoInstalacion',
      label: 'Costo instalado del sistema ($)',
      type: 'number',
      value: 125000,
      min: 0,
      step: 1000,
      prefix: '$',
      thousands: true,
      help: 'Paneles, inversor, estructura, instalación y trámite.',
    },
    {
      id: 'generacionAnualPorKw',
      label: 'Generación anual por kW instalado (kWh)',
      type: 'number',
      value: 1550,
      min: 0,
      step: 50,
      suffix: 'kWh',
      help: 'Depende de la irradiación de tu estado; pídeselo al instalador.',
    },
    {
      id: 'cargoFijoMensual',
      label: 'Cargo fijo mensual que seguirás pagando ($)',
      type: 'number',
      value: 120,
      min: 0,
      step: 10,
      prefix: '$',
      help: 'Aunque generes toda tu energía, este cargo no desaparece.',
    },
    {
      id: 'tipoRecipiente',
      label: 'Tipo de recipiente de gas',
      type: 'select',
      value: 'estacionario',
      options: [
        { value: 'estacionario', label: 'Tanque estacionario (litros)' },
        { value: 'cilindro', label: 'Cilindro portátil (kilos)' },
      ],
      help: 'El estacionario se vende por litro y el cilindro por kilo.',
    },
    {
      id: 'capacidad',
      label: 'Capacidad del recipiente',
      type: 'number',
      value: 300,
      min: 1,
      step: 5,
      help: 'Litros si es estacionario, kilos si es cilindro.',
    },
    {
      id: 'nivelActualPct',
      label: 'Nivel actual del tanque (%)',
      type: 'number',
      value: 20,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'Lo que marca la carátula. En un cilindro vacío pon 0.',
    },
    {
      id: 'nivelObjetivoPct',
      label: 'Nivel objetivo (%)',
      type: 'number',
      value: 85,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'En estacionarios el máximo seguro es alrededor del 85%.',
    },
    {
      id: 'precioGasLitro',
      label: 'Precio del gas por litro ($)',
      type: 'number',
      value: GAS_LP_CDMX_JUL_2026.precioLitro,
      min: 0,
      step: 0.01,
      prefix: '$',
      help: 'Precio máximo semanal de la CNE en tu municipio.',
    },
    {
      id: 'precioGasKg',
      label: 'Precio del gas por kilo ($)',
      type: 'number',
      value: GAS_LP_CDMX_JUL_2026.precioKg,
      min: 0,
      step: 0.01,
      prefix: '$',
      help: 'Precio máximo semanal de la CNE en tu municipio.',
    },
    {
      id: 'metros',
      label: 'Metros cuadrados a construir',
      type: 'number',
      value: 100,
      min: 1,
      step: 5,
      suffix: 'm²',
      help: 'Superficie construida, no la del terreno.',
    },
    {
      id: 'calidadObra',
      label: 'Nivel de terminación',
      type: 'select',
      value: 'media',
      options: [
        { value: 'economica', label: 'Económica / interés social' },
        { value: 'media', label: 'Media / residencial estándar' },
        { value: 'premium', label: 'Premium / residencial alto' },
      ],
      help: 'Es lo que más mueve el costo por metro cuadrado.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Composición de lo que pagas',
    caption:
      'Según la rama, el gráfico reparte el recibo entre tramos e IVA, el costo eléctrico anual entre ahorro solar y pago remanente, el tanque entre lo que ya tienes y lo que cargas, o la obra entre materiales y mano de obra.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Por qué mi recibo de CFE sube tanto de golpe?',
      a: 'Porque la tarifa doméstica es escalonada y el tramo excedente cuesta varias veces más que el básico. Mientras tu consumo se mantiene dentro de los primeros kilovatios el promedio por kWh es bajo; en cuanto pasas el techo del tramo intermedio, cada kWh adicional se cobra al precio sin subsidio efectivo y el total se dispara.',
    },
    {
      q: '¿Los tramos de la tarifa son bimestrales o mensuales?',
      a: 'Mensuales, aunque el recibo llegue cada dos meses. Por eso el cálculo divide tu consumo bimestral entre dos, aplica los tramos y vuelve a multiplicar por dos. Si aplicaras los topes directamente sobre el consumo bimestral te saldría un recibo mucho más caro del real.',
    },
    {
      q: '¿Qué es la tarifa DAC y cómo se sale de ella?',
      a: 'Es la tarifa Doméstica de Alto Consumo: no tiene tramos ni subsidio y suma un cargo fijo mensual, así que el kilovatio sale varias veces más caro. Se entra cuando el promedio móvil de doce meses supera el límite de tu zona climática, y se sale bajando ese promedio por debajo del límite, lo que toma meses de consumo contenido.',
    },
    {
      q: '¿En cuánto tiempo se pagan los paneles solares en México?',
      a: 'Depende de tres cosas: el costo instalado, la irradiación de tu estado y, sobre todo, qué tan caro estabas pagando el kWh. Quien está en DAC recupera la inversión mucho más rápido que quien está en tarifa subsidiada, porque el ahorro por kilovatio evitado es mayor. El cálculo divide el costo instalado entre el ahorro anual estimado.',
    },
    {
      q: '¿Los paneles eliminan por completo el recibo de luz?',
      a: 'No. El cargo fijo mensual se sigue pagando aunque generes toda tu energía, y por eso el ahorro se calcula solo sobre la parte variable del recibo. Además, la compensación de excedentes tiene reglas y plazos propios del contrato de interconexión, no es dinero en efectivo.',
    },
    {
      q: '¿Conviene poner un sistema más grande del que necesito?',
      a: 'Normalmente no. Una vez que la generación anual cubre tu consumo anual, cada kilovatio extra deja de ahorrarte recibo y solo alarga el repago, porque el excedente no se compensa al mismo valor que la energía que consumes. Lo eficiente es dimensionar contra el promedio de doce meses, no contra el mes pico.',
    },
    {
      q: '¿Hasta qué porcentaje se puede llenar un tanque estacionario?',
      a: 'Alrededor del 85% de su capacidad. El gas licuado se expande con la temperatura y necesita espacio libre en la parte alta del tanque; por eso las gaseras no cargan más y por eso una capacidad de 300 litros no significa 300 litros de gas útil.',
    },
    {
      q: '¿Por qué el gas se vende por litro en unos casos y por kilo en otros?',
      a: 'Los tanques estacionarios se cargan desde pipa y se miden en litros, mientras que los cilindros portátiles se venden por peso en kilos. Son unidades distintas de la misma cosa: en el gas LP un litro pesa alrededor de 0,54 kilos, que es la equivalencia que usa la propia autoridad para publicar sus dos precios.',
    },
    {
      q: '¿Quién fija el precio del gas LP?',
      a: 'La Comisión Nacional de Energía publica un precio máximo semanal por municipio. Cambia todas las semanas y varía bastante entre regiones, así que el valor por defecto de esta herramienta es una referencia de CDMX que conviene sustituir por el de tu zona antes de pedir la pipa.',
    },
    {
      q: '¿Cuánto cuesta construir un metro cuadrado en México?',
      a: 'El rango depende del nivel de terminación: una obra económica de interés social está muy por debajo de una residencial premium, con la vivienda media en un punto intermedio. Los valores de aquí son costos directos llave en mano y sirven para ordenar expectativas antes de pedir presupuestos formales.',
    },
    {
      q: '¿El costo por metro cuadrado incluye el terreno y los permisos?',
      a: 'No. Es solo el costo directo de la obra. Fuera quedan el terreno, el proyecto arquitectónico, las licencias municipales, las conexiones de servicios y el margen de imprevistos, que en una obra particular suele ser lo que hace estallar el presupuesto inicial.',
    },
    {
      q: '¿Cómo se reparte el costo de obra entre materiales y mano de obra?',
      a: 'Como referencia general se usa un reparto cercano a 60% materiales y 40% mano de obra, aunque cambia mucho por partida: la obra negra carga más materiales y los acabados más mano de obra especializada. Sirve para entender qué parte del presupuesto se te mueve si suben los insumos.',
    },
  ],

  sources: [
    {
      name: 'CFE — tarifas domésticas y esquema de la tarifa DAC',
      url: 'https://app.cfe.mx/Aplicaciones/CCFE/Tarifas/TarifasCRECasa/Casa.aspx',
      publisher: 'Comisión Federal de Electricidad',
    },
    {
      name: 'Comisión Nacional de Energía — precios máximos de gas LP por región',
      url: 'https://www.gob.mx/cne',
      publisher: 'Comisión Nacional de Energía',
      date: '12-07-2026',
    },
    {
      name: 'CFE — generación distribuida y contrato de interconexión',
      url: 'https://www.cfe.mx/',
      publisher: 'Comisión Federal de Electricidad',
    },
    {
      name: 'CMIC — costos de construcción e índices de la industria',
      url: 'https://www.cmic.org.mx/',
      publisher: 'Cámara Mexicana de la Industria de la Construcción',
    },
    {
      name: 'SAT — tasa general de IVA y franja fronteriza norte',
      url: 'https://www.sat.gob.mx/',
      publisher: 'Servicio de Administración Tributaria',
    },
  ],

  replaces: [
    '/calculadora-luz-cfe-tarifa-domestica-bimestral-mexico',
    '/calculadora-paneles-solares-ahorro-cfe-mexico',
    '/calculadora-gas-lp-llenar-tanque-estacionario-cilindro-mexico',
    '/calculadora-costo-construccion-m2-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
