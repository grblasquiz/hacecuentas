import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto necesito al mes para vivir y cuánta renta puedo pagar?"
 *
 * Fusiona las calculadoras de presupuesto del hogar: costo de vida mensual por
 * composición y ciudad, canasta básica de despensa, cuánta renta soporta tu
 * sueldo, renta de mercado en las principales ciudades y el tope de aumento
 * anual de renta según el INPC.
 *
 * Todas las constantes de gasto y de renta de mercado se copian TAL CUAL de las
 * fórmulas originales (src/lib/formulas/*.ts). El salario mínimo sale de la
 * fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Salario mínimo general mensual 2026 (CONASAMI, DOF 09-dic-2025). */
export const SM_MENSUAL_MX = MEXICO_2026.salarioMinimo.generalMensual;

/**
 * Constantes de costo de vida — copiadas de
 * src/lib/formulas/coste-vida-mensual-mexico-soltero-pareja-familia.ts
 */
export const COSTO_VIDA_MX = {
  /** Factor de ciudad vs CDMX = 1,0 (INEGI, costo de vida regional). */
  ciudad: {
    cdmx: 1.0,
    monterrey: 0.95,
    guadalajara: 0.85,
    puebla: 0.75,
    ciudad_mediana: 0.65,
    ciudad_pequena: 0.55,
  } as Record<string, number>,
  /** Multiplicadores por composición del hogar. */
  composicion: {
    soltero: { viv: 1.0, ali: 1.0, tra: 1.0, sal: 0.5, edu: 0.0 },
    pareja: { viv: 1.4, ali: 1.6, tra: 1.3, sal: 0.8, edu: 0.0 },
    familia_2h: { viv: 1.8, ali: 2.2, tra: 1.5, sal: 1.0, edu: 2.0 },
    familia_3h: { viv: 2.1, ali: 2.8, tra: 1.7, sal: 1.2, edu: 3.0 },
    multigeneracional: { viv: 2.4, ali: 3.2, tra: 1.9, sal: 1.4, edu: 2.0 },
  } as Record<string, { viv: number; ali: number; tra: number; sal: number; edu: number }>,
  /** Bases mensuales en CDMX, estilo moderado, una persona (MXN). */
  bases: {
    vivienda: 10000,
    alimentacion: 4000,
    transporte: 1500,
    servicios: 1000,
    salud: 800,
    educacion: 0,
    ocio: 2000,
  } as Record<string, number>,
  estilo: { basico: 0.75, moderado: 1.0, confortable: 1.35 } as Record<string, number>,
  /** Costo mensual del auto (gasolina, mantenimiento, tenencia, seguro), ajustado por ciudad. */
  autoMensual: 4000,
  /** Sobrecosto mensual de salud por dependientes mayores, ajustado por ciudad. */
  mayoresMensual: 2500,
  /** La fórmula original recomienda un ingreso de 3× el gasto (colchón + ahorro). */
  factorIngresoRecomendado: 3,
};

/**
 * Constantes de la canasta básica —
 * src/lib/formulas/canasta-basica-mexico-costo-mensual-familia.ts
 * Ancla: canasta alimentaria urbana INEGI (Líneas de Pobreza).
 */
export const CANASTA_MX = {
  adultoBase: 2100,
  ninoBase: 1450,
  perfil: { basico: 0.85, equilibrado: 1.0, saludable: 1.25 } as Record<string, number>,
  region: {
    norte: 1.1,
    bajio: 1.02,
    occidente: 1.05,
    centro: 1.0,
    oriente: 1.03,
    sureste: 0.95,
  } as Record<string, number>,
  /** Desviación de precio por cadena respecto del promedio. */
  cadena: { aurrera: 0.95, walmart: 1.0, chedraui: 1.02, soriana: 1.03 } as Record<string, number>,
};

/**
 * Renta de mercado por ciudad y recámaras —
 * src/lib/formulas/renta-mensual-cdmx-vs-guadalajara-monterrey.ts
 * (Inmuebles24 / Vivanuncios, ajuste jul-2026). Precios de mercado: cambian.
 */
export const RENTA_MERCADO_MX = {
  tablas: {
    cdmx: {
      '1': { base: 22000, minimo: 18000, maximo: 40000 },
      '2': { base: 35000, minimo: 25000, maximo: 55000 },
      '3': { base: 48000, minimo: 35000, maximo: 70000 },
    },
    guadalajara: {
      '1': { base: 18000, minimo: 10000, maximo: 22000 },
      '2': { base: 25000, minimo: 15000, maximo: 32000 },
      '3': { base: 29000, minimo: 20000, maximo: 42000 },
    },
    monterrey: {
      '1': { base: 24000, minimo: 12000, maximo: 28000 },
      '2': { base: 31000, minimo: 18000, maximo: 40000 },
      '3': { base: 36000, minimo: 25000, maximo: 50000 },
    },
    queretaro: {
      '1': { base: 11000, minimo: 8000, maximo: 18000 },
      '2': { base: 16500, minimo: 12000, maximo: 25000 },
      '3': { base: 23000, minimo: 16000, maximo: 35000 },
    },
    merida: {
      '1': { base: 9000, minimo: 6000, maximo: 15000 },
      '2': { base: 14000, minimo: 10000, maximo: 22000 },
      '3': { base: 20000, minimo: 14000, maximo: 30000 },
    },
  } as Record<string, Record<string, { base: number; minimo: number; maximo: number }>>,
  /** Ajuste de la renta base por nivel de colonia. */
  nivel: { premium: 0.35, medio_alto: 0.2, medio: 0.05, economico: -0.15 } as Record<string, number>,
  /** Ajuste del piso del rango por nivel de colonia. */
  nivelMin: { premium: 0.25, medio_alto: 0.1, medio: 0, economico: -0.1 } as Record<string, number>,
  /** Ajuste del techo del rango por nivel de colonia. */
  nivelMax: { premium: 0.25, medio_alto: 0.15, medio: 0, economico: -0.15 } as Record<string, number>,
  /** Servicios mensuales estimados (luz, agua, gas, internet). */
  servicios: { cdmx: 1200, guadalajara: 1000, monterrey: 1100, queretaro: 950, merida: 900 } as Record<string, number>,
  /** Depósito de garantía habitual: 1,5 rentas. */
  depositoRentas: 1.5,
};

export const hub: HubData = {
  slug: 'mx/vida/cuanto-cuesta-vivir',
  title: 'Cuánto cuesta vivir en México: presupuesto mensual y cuánta renta puedes pagar',
  description:
    'Calcula cuánto necesitas al mes para vivir según tu hogar y tu ciudad, cuánto se va en despensa, cuánta renta soporta tu sueldo, cuánto cuesta rentar en CDMX, Guadalajara o Monterrey y cuál es el aumento máximo de renta permitido por el INPC.',
  silo: 'Vida',
  siloHref: '/mx/vida',

  eyebrow: 'México · presupuesto del hogar',
  h1: '¿Cuánto necesito al mes para vivir y cuánta renta puedo pagar?',
  lede:
    'Vivir cuesta distinto en cada ciudad y con cada hogar. Pon tu situación y te decimos el gasto mensual completo, cuánto se va solo en despensa, qué renta soporta tu sueldo sin ahogarte y hasta dónde te pueden subir la renta al renovar el contrato.',
  stamps: [
    'Costo de vida por ciudad y hogar',
    'Regla del 30% y el requisito de 3× la renta',
    'Renta de mercado CDMX, GDL, MTY, Querétaro y Mérida',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que necesitas al mes',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro:
      'Empezamos por el presupuesto completo del hogar, que es la pregunta que más se hace quien está por mudarse o cambiar de ciudad.',
    items: [
      {
        id: 'presupuesto',
        label: 'Mi gasto mensual completo',
        hint: 'Cuánto se va al mes en vivienda, comida, transporte, servicios, salud, escuela y ocio.',
        yes: [
          'Gasto mensual estimado desglosado en siete rubros',
          'Ajuste por ciudad, por composición del hogar y por estilo de vida',
          'Costo extra del auto propio y de los adultos mayores a cargo',
          'Ingreso recomendado para cubrirlo con colchón y ahorro',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los importes base son promedios de encuestas de gasto en hogares: tu renta real puede desviarse mucho del promedio de tu ciudad',
          'El rubro vivienda ya incluye una estimación de agua, luz y gas; si calculas la renta por separado, no lo sumes dos veces',
          'El ingreso recomendado es una regla de presupuesto (3× el gasto), no un requisito legal ni bancario',
        ],
        plazo: 'revisa el presupuesto cada vez que cambies de ciudad, de vivienda o de tamaño de familia.',
        answer:
          'El gasto mensual sale de siete rubros ajustados por tu ciudad, tu hogar y tu estilo de vida; para cubrirlo con holgura conviene un ingreso de alrededor del triple.',
      },
      {
        id: 'renta',
        label: 'Cuánta renta puedo pagar',
        hint: 'La regla del 30% del ingreso, más el requisito de comprobar 3× la renta que piden los arrendadores.',
        yes: [
          'Renta recomendada según el porcentaje del ingreso que elijas',
          'Rango conservador (25%) y máximo (35%) del ingreso neto',
          'Tope por el requisito del arrendador de comprobar ingresos de 3× la renta',
          'Lo que te queda libre después de la renta y de tus otras deudas',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La regla del 30% aplica sobre el ingreso NETO en mano, no sobre el sueldo bruto',
          'Muchos arrendadores piden comprobar ingresos de al menos 3× la renta, lo que suele ser más restrictivo que la regla del 30%',
          'Al presupuesto hay que sumarle el depósito de garantía (habitualmente 1,5 rentas) y el primer mes por adelantado',
        ],
        plazo: 'ten listos los comprobantes de ingreso de los últimos tres meses antes de firmar.',
        answer:
          'Con la regla del 30% del ingreso neto y el tope de 3× la renta que exige el arrendador, la cifra más baja de las dos es tu renta realista.',
      },
      {
        id: 'mercado',
        label: 'Cuánto cuesta rentar en mi ciudad',
        hint: 'Renta de mercado por ciudad, número de recámaras y nivel de colonia.',
        yes: [
          'Renta promedio y rango mínimo-máximo de la ciudad y las recámaras elegidas',
          'Ajuste por nivel de colonia (premium, medio alto, medio o económico)',
          'Depósito de garantía y renta anual',
          'Servicios mensuales estimados y costo total del mes',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Son precios de mercado publicados en portales inmobiliarios: cambian rápido y varían muchísimo dentro de una misma ciudad',
          'El rango no incluye mantenimiento del condominio, estacionamiento ni amueblado, que en zonas premium pesan mucho',
          'En zonas premium de CDMX y Monterrey lo normal es que además pidan aval con propiedad',
        ],
        plazo: 'los precios publicados suelen negociarse; compara al menos cinco anuncios de la misma colonia.',
        answer:
          'La renta depende sobre todo de la ciudad, del número de recámaras y del nivel de la colonia; el depósito habitual es de 1,5 rentas.',
      },
      {
        id: 'aumento',
        label: 'Me quieren subir la renta',
        hint: 'Cuál es el aumento máximo razonable al renovar, tomando el INPC como tope.',
        yes: [
          'Aumento máximo en pesos tomando la inflación anual (INPC) como tope',
          'Renta máxima permitida y renta con el aumento que te proponen',
          'Diferencia mensual y anual si el aumento propuesto excede el INPC',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El INPC es el criterio habitual en contratos y en la normativa de vivienda de la CDMX, pero el tope concreto lo fija tu contrato: léelo antes de discutir',
          'El INPC anual cambia cada mes: consulta el dato vigente en el INEGI antes de calcular, la calculadora no lo fija por ti',
          'Un aumento por encima del INPC no es automáticamente ilegal en todo el país; es un argumento de negociación, no una sentencia',
        ],
        plazo: 'la renovación se negocia antes del vencimiento del contrato; llega con el dato del INEGI en la mano.',
        answer:
          'El criterio habitual es que la renta suba como máximo la inflación anual del INPC; por encima de eso tienes argumento para negociar.',
      },
      {
        id: 'despensa',
        label: 'Solo la despensa',
        hint: 'Cuánto cuesta al mes darle de comer a la familia y qué porción del salario mínimo se lleva.',
        yes: [
          'Costo mensual de la despensa según adultos, niños, perfil y región',
          'Costo diario por persona',
          'Qué porcentaje de un salario mínimo mensual se lleva la canasta',
          'Comparativa entre cadenas y ahorro potencial',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La estimación cubre alimentos consumidos en el hogar más limpieza e higiene básica; no incluye comidas fuera de casa',
          'Un niño se cuenta como 0,7 de un adulto (criterio de adulto equivalente de la ENIGH), no como una persona completa',
          'El perfil básico cubre calorías pero puede quedarse corto en proteína y micronutrientes: no lo sostengas en el tiempo si hay menores o embarazo',
        ],
        plazo: 'los precios de la canasta se mueven mes a mes; recalcula cada trimestre.',
        answer:
          'La despensa se estima por adulto equivalente, ajustada por perfil nutricional y región, y se compara contra un salario mínimo mensual.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Llena lo que corresponda a tu caso: cada rama usa solo los campos que necesita, así que no pasa nada si dejas el resto en su valor de ejemplo.',
  fields: [
    {
      id: 'composicion',
      label: 'Composición del hogar',
      type: 'select',
      value: 'pareja',
      options: [
        { value: 'soltero', label: 'Una persona' },
        { value: 'pareja', label: 'Pareja sin hijos' },
        { value: 'familia_2h', label: 'Familia con 2 hijos' },
        { value: 'familia_3h', label: 'Familia con 3 hijos' },
        { value: 'multigeneracional', label: 'Hogar multigeneracional' },
      ],
      help: 'Define cuánto se multiplican vivienda, comida, transporte, salud y escuela.',
    },
    {
      id: 'ciudad',
      label: 'Ciudad o tipo de localidad',
      type: 'select',
      value: 'cdmx',
      options: [
        { value: 'cdmx', label: 'Ciudad de México' },
        { value: 'monterrey', label: 'Monterrey' },
        { value: 'guadalajara', label: 'Guadalajara' },
        { value: 'puebla', label: 'Puebla' },
        { value: 'ciudad_mediana', label: 'Ciudad mediana' },
        { value: 'ciudad_pequena', label: 'Ciudad pequeña' },
      ],
      help: 'CDMX es la referencia (factor 1,0); el resto se ajusta hacia abajo.',
    },
    {
      id: 'estiloVida',
      label: 'Estilo de vida',
      type: 'select',
      value: 'moderado',
      options: [
        { value: 'basico', label: 'Básico (–25%)' },
        { value: 'moderado', label: 'Moderado (referencia)' },
        { value: 'confortable', label: 'Confortable (+35%)' },
      ],
      help: 'Multiplica todos los rubros del presupuesto a la vez.',
    },
    {
      id: 'incluirAuto',
      label: '¿Tienes auto propio?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Suma gasolina, mantenimiento, tenencia y seguro al rubro de transporte.',
    },
    {
      id: 'dependientesMayores',
      label: '¿Tienes adultos mayores a cargo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Suma medicamentos y consultas al rubro de salud.',
    },
    {
      id: 'ingresoNeto',
      label: 'Tu ingreso mensual neto ($)',
      type: 'number',
      value: 25000,
      min: 0,
      step: 500,
      prefix: '$',
      thousands: true,
      help: 'El que te cae en la cuenta, ya con ISR e IMSS descontados.',
    },
    {
      id: 'reglaPct',
      label: 'Porcentaje del ingreso para la renta (%)',
      type: 'number',
      value: 30,
      min: 5,
      max: 60,
      step: 1,
      suffix: '%',
      help: 'La regla clásica es el 30%. Se acota entre 5% y 60%.',
    },
    {
      id: 'otrasDeudas',
      label: 'Otras deudas o mensualidades ($)',
      type: 'number',
      value: 3000,
      min: 0,
      step: 500,
      prefix: '$',
      thousands: true,
      help: 'Tarjetas, crédito de auto, colegiaturas fijas.',
    },
    {
      id: 'ciudadRenta',
      label: 'Ciudad para el precio de renta',
      type: 'select',
      value: 'cdmx',
      options: [
        { value: 'cdmx', label: 'Ciudad de México' },
        { value: 'guadalajara', label: 'Guadalajara' },
        { value: 'monterrey', label: 'Monterrey' },
        { value: 'queretaro', label: 'Querétaro' },
        { value: 'merida', label: 'Mérida' },
      ],
      help: 'Solo hay tabla de renta de mercado para estas cinco ciudades.',
    },
    {
      id: 'recamaras',
      label: 'Recámaras',
      type: 'select',
      value: '2',
      options: [
        { value: '1', label: '1 recámara' },
        { value: '2', label: '2 recámaras' },
        { value: '3', label: '3 recámaras o más' },
      ],
      help: 'Es la variable que más mueve el precio después de la ciudad.',
    },
    {
      id: 'coloniaNivel',
      label: 'Nivel de la colonia',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'premium', label: 'Premium (+35%)' },
        { value: 'medio_alto', label: 'Medio alto (+20%)' },
        { value: 'medio', label: 'Medio (+5%)' },
        { value: 'economico', label: 'Económico (–15%)' },
      ],
      help: 'Dentro de una misma ciudad la colonia cambia el precio más que los metros.',
    },
    {
      id: 'incluirServicios',
      label: '¿Sumar servicios al costo de rentar?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, luz, agua, gas e internet' },
        { value: 'no', label: 'No, solo la renta' },
      ],
      help: 'Los servicios se estiman por ciudad.',
    },
    {
      id: 'rentaActual',
      label: 'Tu renta mensual actual ($)',
      type: 'number',
      value: 10000,
      min: 0,
      step: 500,
      prefix: '$',
      thousands: true,
      help: 'La que pagas hoy, antes del aumento.',
    },
    {
      id: 'inpcAnual',
      label: 'Inflación anual INPC (%)',
      type: 'number',
      value: 4.2,
      min: 0,
      max: 100,
      step: 0.1,
      suffix: '%',
      help: 'Dato vivo del INEGI: consúltalo y ponlo aquí, la calculadora no lo fija.',
    },
    {
      id: 'incrementoPropuesto',
      label: 'Aumento que te proponen (%)',
      type: 'number',
      value: 8,
      min: 0,
      max: 200,
      step: 0.5,
      suffix: '%',
      help: 'Para comparar contra el tope del INPC.',
    },
    {
      id: 'adultos',
      label: 'Adultos en casa (despensa)',
      type: 'number',
      value: 2,
      min: 0,
      max: 20,
      step: 1,
      help: 'Cada adulto cuenta como una unidad de consumo completa.',
    },
    {
      id: 'ninos',
      label: 'Niños en casa (despensa)',
      type: 'number',
      value: 2,
      min: 0,
      max: 20,
      step: 1,
      help: 'Un niño equivale a alrededor de 0,7 de un adulto.',
    },
    {
      id: 'perfilDespensa',
      label: 'Perfil de la despensa',
      type: 'select',
      value: 'equilibrado',
      options: [
        { value: 'basico', label: 'Básico (–15%)' },
        { value: 'equilibrado', label: 'Equilibrado (referencia)' },
        { value: 'saludable', label: 'Saludable (+25%)' },
      ],
      help: 'El básico cubre calorías, no necesariamente micronutrientes.',
    },
    {
      id: 'region',
      label: 'Región para la despensa',
      type: 'select',
      value: 'centro',
      options: [
        { value: 'norte', label: 'Norte (+10%)' },
        { value: 'occidente', label: 'Occidente (+5%)' },
        { value: 'oriente', label: 'Oriente (+3%)' },
        { value: 'bajio', label: 'Bajío (+2%)' },
        { value: 'centro', label: 'Centro (referencia)' },
        { value: 'sureste', label: 'Sureste (–5%)' },
      ],
      help: 'El norte es la región con la canasta más cara del país.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'A dónde se va tu dinero',
    caption:
      'La composición cambia según la rama: los rubros del presupuesto, el reparto de tu ingreso entre renta y deudas, o el peso del aumento sobre la renta.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto necesita una persona sola para vivir en México?',
      a: 'Depende sobre todo de la ciudad. Con un estilo de vida moderado, una persona sola en la Ciudad de México gasta bastante más que la misma persona en una ciudad mediana, porque la vivienda pesa cerca de la mitad del presupuesto y es el rubro con mayor diferencia regional. La estimación de aquí parte de promedios de encuestas de gasto en hogares y los ajusta por ciudad, composición del hogar y estilo de vida.',
    },
    {
      q: '¿Qué porcentaje del sueldo se debe destinar a la renta?',
      a: 'La regla más difundida es el 30% del ingreso neto, con un rango conservador del 25% y un techo del 35%. Por encima del 35% el presupuesto queda tan apretado que cualquier imprevisto obliga a endeudarse. Ojo: la regla se aplica sobre el neto en mano, no sobre el sueldo bruto.',
    },
    {
      q: '¿Por qué los arrendadores piden comprobar 3 veces la renta?',
      a: 'Es la política más común del mercado mexicano para reducir el riesgo de impago: el arrendador quiere que la renta no supere un tercio de tu ingreso comprobable. En la práctica ese requisito es más restrictivo que la regla del 30%, así que la renta a la que realmente puedes aspirar es la menor de las dos cifras.',
    },
    {
      q: '¿Cuánto pueden subirme la renta al renovar el contrato?',
      a: 'El criterio habitual, recogido en muchos contratos y en la normativa de vivienda de la Ciudad de México, es que el aumento anual no supere la inflación acumulada medida por el INPC. Lo primero es leer la cláusula de tu contrato: si fija un porcentaje o remite al INPC, ese es el tope aplicable. Si te proponen más, el dato del INEGI es tu argumento de negociación.',
    },
    {
      q: '¿Dónde consulto el INPC actualizado?',
      a: 'En el sitio del INEGI, que publica el Índice Nacional de Precios al Consumidor a mitad y a fin de cada mes. Por eso esta herramienta deja el INPC como campo editable en vez de fijarlo: un dato de inflación viejo te haría negociar con la cifra equivocada.',
    },
    {
      q: '¿La renta de mercado que muestran incluye servicios y mantenimiento?',
      a: 'No. El precio de mercado es la renta pelona publicada en los portales inmobiliarios. Los servicios (luz, agua, gas e internet) se estiman aparte por ciudad, y el mantenimiento del condominio, el estacionamiento y el amueblado no están incluidos: en zonas premium pueden sumar varios miles de pesos al mes.',
    },
    {
      q: '¿Cuánto hay que tener ahorrado para mudarse?',
      a: 'Como piso, el depósito de garantía (habitualmente equivalente a una renta y media) más el primer mes por adelantado. A eso conviene sumarle mudanza, depósitos de servicios y lo que cueste amueblar, que suele ser el gasto que la gente subestima.',
    },
    {
      q: '¿Cuánto cuesta la despensa al mes para una familia?',
      a: 'La estimación parte de un costo por adulto equivalente al mes y cuenta a cada niño como alrededor de 0,7 de un adulto, siguiendo el criterio de la ENIGH. Después se ajusta por perfil nutricional y por región: el norte es la zona más cara del país y el sureste la más barata.',
    },
    {
      q: '¿Por qué la despensa se compara contra el salario mínimo?',
      a: 'Porque es la referencia que permite ver de un vistazo qué tan viable es el presupuesto. Si la despensa de la familia se lleva más del 80% de un salario mínimo mensual, prácticamente no queda nada para renta, transporte ni servicios, lo que indica que el hogar necesita más de un ingreso.',
    },
    {
      q: '¿Cambia mucho el precio según el súper donde compres?',
      a: 'Sí, y es una de las palancas de ahorro más rápidas. Entre la cadena más económica y la más cara del comparativo hay alrededor de ocho puntos porcentuales de diferencia sobre el total del mes, sin cambiar nada de lo que comes.',
    },
    {
      q: '¿Cuánto se lleva tener auto propio?',
      a: 'La estimación suma un costo mensual fijo por gasolina, mantenimiento, tenencia y seguro, ajustado por el nivel de precios de tu ciudad. En hogares de ingreso medio suele ser el tercer gasto más pesado, después de la vivienda y de la comida.',
    },
    {
      q: '¿El ingreso recomendado que muestra es un requisito?',
      a: 'No, es una regla de presupuesto personal: apunta a un ingreso de alrededor del triple del gasto para que quepan el ahorro, un fondo de emergencia y los gastos que no aparecen mes a mes, como seguros anuales o reparaciones. No es un requisito legal ni un criterio bancario.',
    },
  ],

  sources: [
    {
      name: 'INEGI — Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH)',
      url: 'https://www.inegi.org.mx/programas/enigh/',
      publisher: 'INEGI',
    },
    {
      name: 'INEGI — Índice Nacional de Precios al Consumidor (INPC)',
      url: 'https://www.inegi.org.mx/temas/inpc/',
      publisher: 'INEGI',
    },
    {
      name: 'INEGI — Líneas de pobreza por ingresos (valor de la canasta alimentaria)',
      url: 'https://www.inegi.org.mx/temas/lp/',
      publisher: 'INEGI',
    },
    {
      name: 'CONASAMI — salarios mínimos 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
    {
      name: 'Ley de Vivienda para la Ciudad de México',
      url: 'https://www.congresocdmx.gob.mx/',
      publisher: 'Congreso de la Ciudad de México',
    },
    {
      name: 'CONDUSEF — presupuesto familiar y educación financiera',
      url: 'https://www.gob.mx/condusef',
      publisher: 'CONDUSEF',
    },
  ],

  replaces: [
    '/calculadora-coste-vida-mensual-mexico-soltero-pareja-familia',
    '/calculadora-canasta-basica-mexico-costo-mensual-familia',
    '/calculadora-cuanta-renta-puedo-pagar-sueldo-mexico',
    '/calculadora-renta-mensual-cdmx-vs-guadalajara-monterrey',
    '/calculadora-aumento-renta-permitido-inpc-mexico',
    '/calculadora-coste-funeral-mexico-promedio-2026-paquetes',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
