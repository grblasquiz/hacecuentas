import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me van a aumentar el alquiler?"
 * Arquetipo RAMIFICADO: cada rama cambia el índice de actualización.
 * Absorbe 5 calculadoras sueltas (ver hub.replaces).
 */
export const hub: HubData = {
  slug: 'alquiler/aumento-de-alquiler',
  title: 'Calculadora de aumento de alquiler: ICL e IPC 2026',
  description:
    'Calculá el aumento del alquiler por ICL del BCRA, IPC del INDEC o porcentaje pactado. Revisá fórmula, coeficiente y cuota nueva.',
  silo: 'Alquiler',
  siloHref: '/alquiler',

  eyebrow: 'Guía y estimación de alquiler',
  h1: '¿Cuánto me van a aumentar el alquiler?',
  lede:
    'Partimos del caso más habitual: contrato con ajuste por ICL del BCRA. Poné tu alquiler y las dos fechas y mirá la cuota nueva. Si tu contrato ajusta por otro índice, lo cambiás abajo.',
  stamps: ['Revisado 04-08-2026', 'ICL del BCRA e IPC del INDEC oficiales', 'Fórmula explicada'],

  resultLabel: 'Tu alquiler nuevo',

  cases: {
    title: '¿Qué dice tu contrato?',
    intro: 'El índice pactado cambia todo. Elegí el tuyo: el cálculo se adapta solo.',
    items: [
      {
        id: 'icl',
        label: 'Ajusta por ICL del BCRA',
        hint: 'El más común · Ley 27.551',
        answer: 'Con ICL, el aumento es el cociente entre el ICL de las dos fechas.',
        yes: [
          'Coeficiente = ICL del día del ajuste ÷ ICL del día del último ajuste (o de la firma)',
          'Datos diarios oficiales del BCRA desde el 01/07/2020',
          'El ICL mezcla mitad IPC (inflación) y mitad RIPTE (salarios)',
        ],
        warn: [
          'Como fecha de inicio va la de tu ÚLTIMO ajuste, no la de la firma: ese monto ya incluye los aumentos previos. Si usás la firma, contás la inflación dos veces',
          'Si tu contrato es en UVA o en dólares, el ICL no aplica',
        ],
        plazo: 'en contratos Ley 27.551 el ajuste es anual, en el aniversario del contrato.',
      },
      {
        id: 'ipc',
        label: 'Ajusta por IPC del INDEC',
        hint: 'Lo habitual post DNU 70/2023',
        answer: 'Con IPC se compone la inflación mes a mes del período pactado.',
        yes: [
          'Se componen los IPC mensuales publicados por el INDEC entre las dos fechas',
          'Es interés compuesto: los porcentajes mensuales se multiplican, no se suman',
          'Sirve para ajustes trimestrales, semestrales o anuales por IPC',
        ],
        warn: [
          'El INDEC publica el IPC alrededor del día 12-15 del mes siguiente: si el ajuste cae antes, el último mes todavía no está',
          'No compares IPC e ICL como intercambiables: corresponde el índice escrito en el contrato',
        ],
        plazo: 'el IPC del mes se publica entre el 12 y el 15 del mes siguiente.',
      },
      {
        id: 'frecuencia',
        label: 'Ajuste trimestral, cuatrimestral o semestral',
        hint: 'Porcentaje pactado por período',
        answer: 'Con inflación pareja, todas las frecuencias llegan al mismo alquiler a los 12 meses.',
        yes: [
          'Proyección a 12 meses según la frecuencia de ajuste y la inflación mensual estimada',
          'Cada ajuste se aplica sobre el alquiler ya actualizado (efecto compuesto)',
          'Usa el campo "Frecuencia de ajuste" y la inflación mensual estimada',
        ],
        warn: [
          'El cálculo asume inflación mensual constante: si la inflación se mueve, la frecuencia sí cambia el resultado',
          'Ajustar más seguido no sube el total anual, pero te hace pagar montos altos durante más meses del año',
        ],
        plazo: 'cada ajuste rige para el período siguiente: nunca es retroactivo.',
      },
      {
        id: 'contrato-2',
        label: 'Contrato de 2 años: cuánto termino pagando',
        hint: 'Proyección a 24 meses',
        answer: 'A 2 años la cuota se proyecta 24 meses de inflación compuesta.',
        yes: [
          'Proyección de la cuota al final del contrato: 24 meses de inflación compuesta',
          'Plazo más corto, más flexibilidad, y garantía propietaria o seguro de caución',
        ],
        warn: [
          'La proyección mantiene una tasa constante y no anticipa la inflación real ni una futura renegociación',
          'Sumá expensas y servicios por separado: no forman parte del índice de actualización',
        ],
        plazo: 'desde el DNU 70/2023 el plazo mínimo legal ya no existe: se pacta libre.',
      },
      {
        id: 'contrato-3',
        label: 'Contrato de 3 años: cuánto termino pagando',
        hint: 'Proyección a 36 meses',
        answer: 'A 3 años ganás previsibilidad, pero la cuota final compone 36 meses.',
        yes: [
          'Proyección de la cuota al final del contrato: 36 meses de inflación compuesta',
          'Mayor estabilidad y menos renegociaciones, a cambio de un inicio algo más alto',
        ],
        warn: [
          'Un inicio barato con ajuste trimestral puede terminar más caro que uno más alto con ajuste anual',
          'Leé la cláusula de rescisión: irte antes puede tener multa',
        ],
        plazo: 'el contrato de 3 años era el mínimo de la Ley 27.551, derogada por el DNU 70/2023.',
      },
      {
        id: 'manual',
        label: 'Porcentaje fijo pactado',
        hint: 'Escalonado o inflación estimada',
        answer: 'Con un porcentaje fijo por mes, el acumulado es compuesto, no la suma.',
        yes: [
          'Acumulado = (1 + porcentaje mensual)^meses − 1',
          'Usá los campos "Inflación o ajuste mensual" y "Meses del período"',
        ],
        warn: [
          '5% mensual por 12 meses no es 60%: es 79,6% por efecto compuesto',
          'Si el contrato pacta escalones distintos por período, calculá cada tramo por separado',
        ],
        plazo: 'el porcentaje y su frecuencia tienen que estar escritos en el contrato.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa los campos que necesita: ICL e IPC toman las fechas; los ajustes por porcentaje toman la inflación mensual, la frecuencia y los meses.',
  fields: [
    {
      id: 'alquiler',
      label: '¿Cuánto pagás de alquiler hoy?',
      prefix: '$',
      value: '600.000',
      thousands: true,
      help: 'El monto que surgió de tu último ajuste (o de la firma, si nunca te ajustaron).',
    },
    {
      id: 'fechaDesde',
      label: 'Fecha del último ajuste (o de la firma)',
      type: 'date',
      value: '2025-08-01',
    },
    {
      id: 'fechaHasta',
      label: 'Fecha del próximo ajuste',
      type: 'date',
      value: '2026-08-01',
    },
    {
      id: 'coefManual',
      label: 'Coeficiente ICL exacto (opcional — ej. 1,2941)',
      type: 'text',
      value: '',
      help: 'Si tu contrato fija un coeficiente distinto al que publica el BCRA, o el propietario te pasó uno cerrado, ponelo acá y pisa el cálculo automático. Es el cociente entre los dos ICL, un número cercano a 1 (ej. 1,2941 o 1.2941). Dejalo vacío para usar la serie oficial.',
    },
    {
      id: 'inflacionMensual',
      label: 'Inflación o ajuste mensual estimado',
      type: 'number',
      suffix: '%',
      min: -10,
      max: 100,
      step: 0.1,
      value: 2,
      help: 'Sólo para los casos de porcentaje pactado, frecuencia y proyección de contrato.',
    },
    {
      id: 'frecuencia',
      label: 'Frecuencia de ajuste',
      type: 'select',
      value: 'trim',
      options: [
        { value: 'trim', label: 'Trimestral' },
        { value: 'cuat', label: 'Cuatrimestral' },
        { value: 'sem', label: 'Semestral' },
        { value: 'anual', label: 'Anual' },
      ],
    },
    {
      id: 'meses',
      label: 'Meses del período',
      type: 'number',
      suffix: 'meses',
      min: 1,
      max: 120,
      step: 1,
      value: 12,
      help: 'Sólo para el caso de porcentaje fijo pactado.',
    },
  ],
  fineprint:
    'Es una estimación orientativa. El contrato manda: índice, frecuencia, moneda y topes tienen que estar escritos ahí.',

  chart: {
    type: 'bars',
    title: 'Cuota vieja, aumento y cuota nueva',
    caption:
      'La primera barra es lo que pagás hoy, la segunda cuánto sube en pesos y la tercera la cuota nueva que vas a pagar a partir del ajuste.',
  },
  breakdownTitle: 'De qué se compone el aumento',
  breakdownIntro: 'Las barras comparan cada valor con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cómo se calcula el coeficiente ICL?',
      a: 'Coeficiente = ICL del día del ajuste ÷ ICL del día de inicio (o del último ajuste). Ejemplo con datos del BCRA: contrato del 15/03/2024 (ICL 9,88) con ajuste el 15/03/2025 (ICL 23,11) da 23,11 ÷ 9,88 = 2,3391. Un alquiler de $400.000 pasa a $935.628 (+133,9%). El ICL siempre es mayor a 1 en contextos inflacionarios.',
    },
    {
      q: '¿Dónde consigo el valor del ICL del día?',
      a: 'En la web oficial del BCRA, en "Principales variables": buscá "Índice para Contratos de Locación (ICL-2020=1)". Se publica todos los días hábiles y tiene serie completa desde el 01/07/2020. Este hub ya trae la serie oficial cargada, así que sólo ponés las dos fechas.',
    },
    {
      q: '¿Cada cuánto se actualiza un contrato por ICL?',
      a: 'Depende de la ley aplicable. Ley 27.551 (jul 2020 a oct 2023): ajuste anual, en el aniversario. Ley 27.737 (oct a dic 2023): semestral por índice Casa Propia, no por ICL. Post DNU 70/2023: se pacta libremente, y lo más habitual pasó a ser IPC trimestral.',
    },
    {
      q: '¿La Ley de Alquileres sigue vigente?',
      a: 'No: el DNU 70/2023 la derogó en diciembre de 2023. Hoy rige libertad contractual: plazo, moneda, índice y frecuencia se pactan entre las partes. Los contratos firmados antes siguen con la ley de su momento hasta vencer — el último contrato Ley 27.551 vence en octubre de 2026.',
    },
    {
      q: '¿Conviene el ajuste trimestral o el semestral?',
      a: 'Con inflación perfectamente constante da lo mismo a los 12 meses: el factor acumulado es el mismo en las cuatro frecuencias. Lo que cambia es la distribución del pago. Con inflación alta el propietario prefiere ajustes frecuentes para no perder valor real, y el inquilino los prefiere espaciados para diferir el impacto.',
    },
    {
      q: '¿Por qué la inflación acumulada no es la suma de las mensuales?',
      a: 'Porque es compuesta: cada mes se aplica sobre precios que ya subieron. Dos meses al 10% dan 21% acumulado, no 20%. Y 5% mensual durante 12 meses da 79,6%, no 60%. La brecha crece con el plazo y con la tasa.',
    },
    {
      q: '¿Conviene un contrato de 2 o de 3 años?',
      a: 'Depende de cuánto pensás quedarte, la cláusula de rescisión y las condiciones pactadas. Un plazo mayor reduce la frecuencia de renegociación, pero no garantiza un precio más conveniente. Compará índice, frecuencia, depósito, expensas y salida.',
    },
    {
      q: '¿Qué índice puedo pactar para actualizar el alquiler?',
      a: 'Desde el DNU 70/2023 se acuerda libremente: IPC del INDEC, ICL del BCRA, UVA (que ajusta por CER), la fórmula Casa Propia, dólar oficial o MEP, o un porcentaje fijo o escalonado entre las partes.',
    },
    {
      q: '¿El ajuste se aplica de forma retroactiva?',
      a: 'No. Cada ajuste rige para el período siguiente: al llegar la fecha pactada el alquiler se recalcula y ese monto nuevo corre de ahí en adelante. Tampoco se confunde con un aumento por mejoras o servicios agregados, que es otra cosa.',
    },
    {
      q: '¿Qué pasa si mi contrato es en UVA o en dólares?',
      a: 'No uses esta fórmula salvo que el contrato lo indique. En UVA se multiplica la cantidad pactada por el valor UVA correspondiente. En moneda extranjera manda la cláusula de moneda, pago y eventual conversión. Si es ambigua, conviene asesorarse antes de pagar una diferencia discutida.',
    },
    {
      q: '¿Puedo negociar que no se aplique el aumento?',
      a: 'Sólo con acuerdo del propietario y por adenda firmada por las dos partes. Durante la Ley 27.551 el ICL era obligatorio e irrenunciable. Hoy los contratos ya firmados mantienen sus condiciones salvo que ambas partes las cambien por escrito.',
    },
    {
      q: '¿Qué gastos se olvidan al comparar alquileres?',
      a: 'Expensas, servicios, seguro de caución o garantía, depósito, comisión inmobiliaria cuando corresponda y rescisión anticipada. Comparalos por separado porque no todos se actualizan con el índice del alquiler.',
    },
  ],

  sources: [
    {
      name: 'Índice para Contratos de Locación (ICL-2020=1) — serie diaria',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables_datos.asp',
      publisher: 'Banco Central de la República Argentina',
      date: 'serie desde 01/07/2020',
    },
    {
      name: 'Índice de Precios al Consumidor (IPC) nacional, nivel general',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'publicación mensual',
    },
    {
      name: 'Ley 27.551 de Alquileres (texto original)',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/231407',
      publisher: 'Boletín Oficial de la República Argentina',
    },
    {
      name: 'DNU 70/2023 — deroga la Ley de Alquileres y libera plazo e índice',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/301430',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '21-12-2023',
    },
    {
      name: 'Código Civil y Comercial (Ley 26.994), arts. 1196-1221 — locación de inmuebles',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/texto',
      publisher: 'Argentina.gob.ar',
    },
  ],

  replaces: [
    '/calculadora-actualizacion-alquiler-icl',
    '/calculadora-actualizacion-inflacion-ipc',
    '/calculadora-inflacion-acumulada-periodo',
    '/calculadora-aumento-alquiler-trimestral-cuatrimestral-semestral',
    '/calculadora-contrato-alquiler-2-anios-vs-3-anios',
  ],

  lastReviewed: '2026-08-16',
  audience: 'AR',
};

/** Meses que compone cada frecuencia de ajuste (mismo mapa que la calc absorbida). */
export const FRECUENCIA_MESES: Record<string, number> = { trim: 3, cuat: 4, sem: 6, anual: 12 };

/** Meses proyectados por caso de contrato. */
export const CONTRATO_MESES: Record<string, number> = { 'contrato-2': 24, 'contrato-3': 36 };
