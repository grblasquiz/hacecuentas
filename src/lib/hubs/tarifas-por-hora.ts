import type { HubData } from './types';
import dolar from '../../data/live/dolar.json';

/**
 * Hub de decisión — "¿Cuánto se cobra la hora en mi oficio?"
 *
 * Arquetipo RAMIFICADO. La pregunta es de MERCADO, no de costos: cuánto paga
 * el mercado por una hora de este oficio, según seniority y según de dónde es
 * el cliente. El hub hermano `/finanzas-personales/tarifa-freelance` responde
 * la pregunta opuesta (cuánto NECESITO cobrar para cubrir mis costos): son el
 * techo y el piso de la misma decisión y se enlazan mutuamente en la FAQ.
 *
 * Absorbe 9 calculadoras que eran la misma cuenta cortada en pedazos:
 * un rate base × multiplicador de experiencia × multiplicador de mercado.
 *
 * NOTAS DE CONTRATO
 *  - El hub MEZCLA MONEDAS: las ramas de profesión, mercado y palabra trabajan
 *    en dólares; la de nivel, en pesos. El default del runtime es 'ars', así
 *    que TODA fila que no sea peso argentino declara `format` propio.
 *  - Todas las constantes son copia fiel de las fórmulas reales del repo:
 *    `costo-hora-consultor-marketing.ts`, `costo-hora-desarrollador-senior.ts`,
 *    `costo-hora-disenador-grafico.ts`, `costo-hora-fotografo-evento.ts`,
 *    `costo-hora-redactor-copywriter.ts`, `hora-freelance-por-pais-mercado.ts`,
 *    `rate-hora-freelance-nivel.ts` y
 *    `cuanto-cobrar-traduccion-palabra-2026-espanol-ingles.ts`.
 *    No hay ni una tarifa inventada.
 */

/** Disclaimer YMYL dominio `finance` — copiado textual de src/lib/disclaimers.ts. */
export const FINANCE_DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Rate base en USD/hora de cada oficio. Copia fiel del `baseRate` de cada
 * fórmula `costo-hora-*.ts`.
 */
export const BASE_OFICIO: Record<string, { base: number; label: string }> = {
  'consultor-marketing': { base: 120, label: 'Consultoría de marketing' },
  desarrollador: { base: 100, label: 'Desarrollo de software' },
  fotografo: { base: 100, label: 'Fotografía de eventos' },
  redactor: { base: 60, label: 'Redacción y copywriting' },
  disenador: { base: 50, label: 'Diseño gráfico' },
};

/**
 * Multiplicador por años de experiencia. Copia fiel del tramo `byExp` que
 * comparten las cinco fórmulas `costo-hora-*.ts`.
 */
export const EXP_TRAMOS = [
  { hasta: 2, mult: 0.5, label: 'menos de 2 años' },
  { hasta: 5, mult: 0.8, label: 'de 2 a 5 años' },
  { hasta: 10, mult: 1.2, label: 'de 5 a 10 años' },
  { hasta: Infinity, mult: 1.7, label: '10 años o más' },
];

/**
 * Multiplicador por mercado del cliente. Unifica los dos mapas del repo: las
 * fórmulas `costo-hora-*` traen usa/europa/latam/asia y
 * `hora-freelance-por-pais-mercado` suma uk y australia. Ningún valor es nuevo.
 */
export const MERCADOS: Record<string, { mult: number; label: string }> = {
  usa: { mult: 1.5, label: 'Estados Unidos' },
  uk: { mult: 1.4, label: 'Reino Unido' },
  australia: { mult: 1.35, label: 'Australia' },
  europa: { mult: 1.3, label: 'Europa' },
  latam: { mult: 0.7, label: 'Latinoamérica' },
  asia: { mult: 0.6, label: 'Asia' },
};

/** Recargo por especialización vertical. Copia fiel de `espMult` en `costo-hora-*.ts`. */
export const ESPECIALIZACION_MULT = 1.35;

/** Multiplicador de seniority. Copia fiel de `multMap` en `rate-hora-freelance-nivel.ts`. */
export const NIVEL_MULT: Record<string, { mult: number; label: string }> = {
  junior: { mult: 0.6, label: 'Junior' },
  semi: { mult: 1.0, label: 'Semi-senior' },
  senior: { mult: 1.6, label: 'Senior' },
  experto: { mult: 2.5, label: 'Experto o lead' },
};

/**
 * Tarifas por palabra en USD y velocidad de trabajo en palabras por hora.
 * Copia fiel de `baseRates` en
 * `cuanto-cobrar-traduccion-palabra-2026-espanol-ingles.ts`.
 */
export const PALABRA_NIVELES: Record<
  string,
  { min: number; max: number; midpoint: number; speed: number; label: string }
> = {
  junior: { min: 0.04, max: 0.06, midpoint: 0.05, speed: 225, label: 'Junior' },
  mid: { min: 0.08, max: 0.12, midpoint: 0.1, speed: 325, label: 'Intermedio' },
  senior: { min: 0.15, max: 0.25, midpoint: 0.2, speed: 375, label: 'Senior' },
  specialist: { min: 0.2, max: 0.4, midpoint: 0.3, speed: 225, label: 'Especialista' },
};

/** Recargo por tipo de contenido. Copia fiel de `contentMultipliers`. */
export const CONTENIDO_MULT: Record<string, { mult: number; label: string }> = {
  general: { mult: 1.0, label: 'General o divulgación' },
  technical: { mult: 1.2, label: 'Técnico' },
  legal: { mult: 1.4, label: 'Legal' },
  medical: { mult: 1.4, label: 'Médico' },
};

/** Recargo por dirección del par. Copia fiel de `directionMultiplier`. */
export const DIRECCION_MULT = { es_to_en: 1.08, en_to_es: 1.0 };

/** Banda negociable alrededor del rate de referencia (fórmulas `costo-hora-*`). */
export const BANDA = { min: 0.8, max: 1.3 };
/** Banda de la fórmula por mercado y por nivel, que es simétrica. */
export const BANDA_SIMETRICA = { min: 0.8, max: 1.2 };
/** Horas de un proyecto tipo, para pasar de rate horario a precio de proyecto. */
export const HORAS_PROYECTO = 40;

/** Tipo de cambio en vivo: lo que un banco te liquida por una exportación de servicios. */
export const USD_ARS_LIQUIDACION: number = (dolar as any).quotes?.oficial?.compra ?? 0;
/** Contado con liquidación, como referencia de la brecha. */
export const USD_ARS_CCL: number = (dolar as any).quotes?.contadoconliqui?.compra ?? 0;
export const DOLAR_FECHA: string = ((dolar as any)._meta?.fetchedAt ?? '').slice(0, 10);

export const hub: HubData = {
  slug: 'negocios/tarifas-por-hora',
  title: '¿Cuánto se cobra la hora en mi oficio? Tarifas de mercado por profesión',
  description:
    'Tarifa por hora de mercado según profesión, años de experiencia y país del cliente: desarrollo, diseño, marketing, fotografía y redacción. Incluye la conversión de tarifa por palabra a tarifa horaria efectiva y cuánto queda en pesos al liquidar.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Precios de mercado para independientes',
  h1: '¿Cuánto se cobra la hora en mi oficio?',
  lede:
    'Acá no calculamos lo que necesitás para cubrir tus gastos: calculamos lo que paga el mercado. La misma hora de trabajo vale muy distinto según el oficio, los años que llevás y sobre todo de dónde es el cliente que la compra. Elegí tu caso y mirá la banda completa, no un número solo.',
  stamps: [
    'Actualizado 27-07-2026',
    'Tarifas de referencia en dólares',
    'Cotización del dólar en vivo',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tarifa de referencia por hora',

  cases: {
    title: '¿Desde dónde querés mirar la tarifa?',
    intro:
      'Las cuatro ramas usan la misma matemática: un rate base del oficio, corregido por experiencia y por el mercado que paga. Si tu caso es otro, cambialo.',
    items: [
      {
        id: 'profesion',
        label: 'Por mi profesión y mis años de experiencia',
        hint: 'El caso más común',
        answer:
          'La tarifa de mercado sale de multiplicar el rate base del oficio por tu tramo de experiencia, por el mercado del cliente y por el recargo de especialización.',
        yes: [
          FINANCE_DISCLAIMER,
          'El rate base de referencia de cinco oficios: consultoría de marketing, desarrollo, fotografía de eventos, redacción y diseño gráfico',
          'El ajuste por experiencia en cuatro tramos: menos de 2 años, de 2 a 5, de 5 a 10 y más de 10',
          'El ajuste por el mercado del cliente, que puede duplicar o partir al medio la misma hora',
          'El recargo por especializarte en un vertical o una tecnología concreta',
          'La banda negociable completa: piso, referencia y techo, más el precio de un proyecto tipo',
          'La misma tarifa pasada a pesos al tipo de cambio del día',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Estos son rates de referencia de mercado, no un precio garantizado: lo que cobrás depende de tu portfolio, de tus referencias y de cuánta demanda tengas encima',
          'Nunca cobres por debajo del piso de la banda: a esos clientes los educás a no valorar tu trabajo y después no hay forma de subirles el precio',
          'Comparar tu tarifa con la banda no reemplaza saber tu piso de costos: si el mercado paga menos que tu punto de equilibrio, el problema es el modelo, no el precio',
          'En diseño y en fotografía conviene cotizar por proyecto y no por hora: el cliente paga el resultado, no el tiempo que tardás',
        ],
        plazo:
          'revisá tu tarifa cada seis meses y siempre que cambies de tramo de experiencia o de tipo de cliente.',
      },
      {
        id: 'nivel',
        label: 'Por mi seniority y el ingreso que quiero llegar a hacer',
        hint: 'Junior, semi, senior o lead',
        answer:
          'El salto de junior a experto multiplica la tarifa por más de cuatro: el mismo trabajo, cobrado por alguien a quien no hay que explicarle nada.',
        yes: [
          FINANCE_DISCLAIMER,
          'Cuántas horas facturables tenés al año según tus horas por semana y las semanas que trabajás',
          'Cuánto tenés que facturar bruto para llevarte el ingreso neto que querés, sumando tu overhead',
          'El rate base que sale de esa cuenta y cómo lo corrige tu nivel: junior, semi-senior, senior o experto',
          'La banda negociable alrededor de ese rate y la comparación con los otros tres niveles',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'El overhead se come más de lo que parece: con 30% de gastos generales, para llevarte cien tenés que facturar más de ciento cuarenta',
          'El seniority que cuenta es el que el cliente percibe y puede verificar, no los años de antigüedad: sin casos que mostrar, el multiplicador no se sostiene en la negociación',
          'Esta rama trabaja en pesos porque parte de un ingreso objetivo anual; si tu cliente paga en dólares, mirá las otras ramas',
          'Subir de nivel no es cobrar más por lo mismo: es hacerte cargo de decisiones y de resultados que antes tomaba otro',
        ],
        plazo:
          'el salto de tramo se negocia al renovar contrato o al arrancar un proyecto nuevo, nunca a mitad de una entrega.',
      },
      {
        id: 'mercado',
        label: 'Por el país del cliente que me está contratando',
        hint: 'Local, Estados Unidos, Europa, Asia',
        answer:
          'La misma hora vale más del doble para un cliente de Estados Unidos que para uno de Asia: el mercado del comprador pesa tanto como tu seniority.',
        yes: [
          FINANCE_DISCLAIMER,
          'Cuánto se corrige tu rate base según el mercado del cliente, con seis plazas de referencia',
          'La comparación lado a lado de todos los mercados, para ver adónde conviene mover el foco comercial',
          'La banda negociable en ese mercado',
          'Cuánto te queda en pesos por hora una vez que liquidás la exportación de servicios, y la brecha contra el contado con liquidación',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Un mercado que paga más también exige más: husos horarios, idioma, contratos y estándares de entrega distintos. El multiplicador no es plata gratis',
          'Facturar al exterior no te exime del monotributo ni de Ingresos Brutos: la exportación de servicios tiene su propio encuadre y conviene confirmarlo con un contador',
          'El tipo de cambio al que liquidás cambia todos los días y no es el mismo al que comprás: la conversión a pesos vale para hoy',
          'Trabajar sólo para el mercado que mejor paga concentra el riesgo: si ese cliente se va, se va todo el ingreso de golpe',
        ],
        plazo: 'la cotización del dólar se mueve a diario: la conversión a pesos vale para hoy.',
      },
      {
        id: 'palabra',
        label: 'Cobro por palabra y quiero saber cuánto es por hora',
        hint: 'Traducción y redacción',
        answer:
          'Una tarifa por palabra sólo se puede comparar con una tarifa por hora si la dividís por tu velocidad real de trabajo.',
        yes: [
          FINANCE_DISCLAIMER,
          'La tarifa por palabra de referencia según tu nivel, el tipo de contenido y la dirección del par',
          'El total del trabajo por la cantidad de palabras que tiene',
          'Las horas estimadas según la velocidad típica de ese nivel',
          'La tarifa horaria efectiva, que es el número que sí se puede comparar con cualquier otro trabajo por hora',
          'La banda por palabra de tu nivel, de piso a techo',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'El especialista trabaja más lento que el senior a propósito: la tarifa por palabra es más alta pero la velocidad baja, así que la tarifa horaria no sube en la misma proporción',
          'La velocidad de referencia no incluye revisión, glosario, maquetación ni las idas y vueltas con el cliente: si eso no se cotiza aparte, la tarifa horaria real es menor',
          'Contá las palabras del texto de origen, no las del destino: del español al inglés el texto se acorta y cobrar por destino te hace perder plata',
          'En contenido legal y médico el error tiene consecuencias: si no dominás el campo, no lo tomes por el recargo',
        ],
        plazo:
          'cerrá la cantidad de palabras y las rondas de corrección incluidas por escrito antes de arrancar.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa los campos que le sirven. Los demás podés dejarlos como están y volver después.',
  fields: [
    {
      id: 'oficio',
      label: 'Tu oficio',
      type: 'select',
      value: 'desarrollador',
      options: Object.keys(BASE_OFICIO).map((k) => ({
        value: k,
        label: `${BASE_OFICIO[k].label} (base USD ${BASE_OFICIO[k].base}/h)`,
      })),
      help: 'El rate base es la referencia del oficio antes de corregir por experiencia y por mercado.',
    },
    {
      id: 'anos',
      label: 'Años de experiencia en ese oficio',
      type: 'number',
      min: 0,
      max: 60,
      step: 1,
      value: 6,
      help: 'Los tramos que mueven la tarifa son: menos de 2, de 2 a 5, de 5 a 10 y más de 10.',
    },
    {
      id: 'mercado',
      label: 'De dónde es el cliente',
      type: 'select',
      value: 'latam',
      options: Object.keys(MERCADOS).map((k) => ({
        value: k,
        label: `${MERCADOS[k].label} (×${MERCADOS[k].mult})`,
      })),
    },
    {
      id: 'especializado',
      label: '¿Estás especializado en un vertical o una tecnología?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, soy generalista' },
        { value: 'si', label: 'Sí, tengo un nicho definido' },
      ],
      help: 'La especialización real, la que se puede demostrar con casos, agrega un 35% sobre la referencia.',
    },
    {
      id: 'rate_base',
      label: 'Tu rate base actual por hora, en dólares',
      type: 'number',
      prefix: 'USD',
      min: 0,
      max: 2000,
      step: 1,
      value: 40,
      help: 'Sólo lo usa la rama de mercado: es la tarifa que ya cobrás y que se corrige según el país del cliente.',
    },
    {
      id: 'nivel',
      label: 'Tu nivel de seniority',
      type: 'select',
      value: 'senior',
      options: Object.keys(NIVEL_MULT).map((k) => ({
        value: k,
        label: `${NIVEL_MULT[k].label} (×${NIVEL_MULT[k].mult})`,
      })),
    },
    {
      id: 'ingreso_anual',
      label: 'Ingreso neto anual que querés llevarte',
      prefix: '$',
      value: '36.000.000',
      thousands: true,
      help: 'En pesos y limpio, después de gastos. Sólo lo usa la rama de seniority.',
    },
    {
      id: 'horas_semana',
      label: 'Horas facturables por semana',
      type: 'number',
      min: 1,
      max: 80,
      step: 1,
      value: 30,
      help: 'Facturables, no trabajadas: presupuestar, cobrar y buscar clientes no se le cobra a nadie.',
    },
    {
      id: 'semanas_ano',
      label: 'Semanas que trabajás al año',
      type: 'number',
      min: 1,
      max: 52,
      step: 1,
      value: 48,
      help: 'Cincuenta y dos menos vacaciones, feriados largos y los períodos flojos de tu rubro.',
    },
    {
      id: 'overhead_pct',
      label: 'Overhead: qué porcentaje se te va en gastos generales',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 90,
      step: 1,
      value: 30,
      help: 'Herramientas, contador, impuestos, equipo, oficina. Cuanto más alto, más te empuja el rate hacia arriba.',
    },
    {
      id: 'palabras',
      label: 'Cantidad de palabras del trabajo',
      type: 'number',
      min: 0,
      max: 2000000,
      step: 100,
      value: 5000,
      thousands: true,
      help: 'Contá siempre las del texto de origen.',
    },
    {
      id: 'nivel_palabra',
      label: 'Tu nivel como traductor o redactor',
      type: 'select',
      value: 'mid',
      options: Object.keys(PALABRA_NIVELES).map((k) => ({
        value: k,
        label: `${PALABRA_NIVELES[k].label} (USD ${PALABRA_NIVELES[k].min}–${PALABRA_NIVELES[k].max} por palabra)`,
      })),
    },
    {
      id: 'contenido',
      label: 'Tipo de contenido',
      type: 'select',
      value: 'general',
      options: Object.keys(CONTENIDO_MULT).map((k) => ({
        value: k,
        label: `${CONTENIDO_MULT[k].label} (×${CONTENIDO_MULT[k].mult})`,
      })),
    },
    {
      id: 'direccion',
      label: 'Dirección del par',
      type: 'select',
      value: 'es_to_en',
      options: [
        { value: 'es_to_en', label: 'Español → inglés (+8%)' },
        { value: 'en_to_es', label: 'Inglés → español' },
      ],
      help: 'Traducir hacia el inglés se paga un poco más porque hay menos gente que lo hace con calidad nativa.',
    },
  ],
  fineprint: `${FINANCE_DISCLAIMER} Las tarifas que aparecen acá son bandas de referencia de mercado para trabajo independiente, no precios garantizados ni recomendaciones de precio: lo que efectivamente cobres depende de tu portfolio, del cliente y de la negociación. La conversión a pesos usa la cotización del día y cambia a diario.`,

  chart: {
    type: 'bars',
    title: 'La misma hora, comparada',
    caption:
      'El gráfico compara tu tarifa contra las alternativas de tu rama: los cinco oficios en la primera, los cuatro niveles de seniority en la segunda, los seis mercados en la tercera y los cuatro niveles de traductor en la cuarta. Sirve para ver de un vistazo cuál de las variables mueve más la aguja.',
  },
  breakdownTitle: 'Cómo se arma la tarifa',
  breakdownIntro:
    'Cada fila trae su unidad: hay dólares, pesos, multiplicadores, horas y palabras. Las barras comparan cada concepto con el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto se cobra la hora de trabajo freelance en cada profesión?',
      a: 'Las referencias de mercado en dólares por hora, para un perfil de entre 5 y 10 años y clientes internacionales, arrancan en una base de 120 para consultoría de marketing, 100 para desarrollo de software, 100 para fotografía de eventos, 60 para redacción y copywriting y 50 para diseño gráfico. Esa base después se corrige por experiencia, por el mercado del cliente y por especialización, así que la tarifa final de dos personas del mismo oficio puede diferir cuatro o cinco veces.',
    },
    {
      q: '¿Cuánto sube la tarifa con los años de experiencia?',
      a: 'Por tramos, no linealmente. Con menos de 2 años se cobra alrededor de la mitad de la base del oficio; entre 2 y 5 años, un 80%; entre 5 y 10, un 20% por encima de la base; y con más de 10 años, un 70% por encima. El salto más grande está entre el segundo y el tercer tramo: es cuando dejás de vender horas de ejecución y empezás a vender criterio.',
    },
    {
      q: '¿Por qué el país del cliente cambia tanto lo que puedo cobrar?',
      a: 'Porque el precio lo fija el presupuesto de quien compra, no el costo de vida de quien produce. Sobre una misma tarifa base, un cliente de Estados Unidos paga alrededor de un 50% más, uno de Reino Unido un 40% más, uno de Australia un 35% más y uno de Europa un 30% más; en cambio Latinoamérica paga alrededor de un 30% menos y Asia un 40% menos. Esa diferencia es la razón principal por la que conviene diversificar el mercado de tus clientes antes que subirle el precio a los que ya tenés.',
    },
    {
      q: '¿Cuál es la diferencia entre esta calculadora y la de tarifa freelance?',
      a: 'Son las dos mitades de la misma decisión. Esta responde cuánto paga el mercado por lo que hacés: es el techo, y sirve para no cobrar de menos. La de tarifa freelance responde cuánto necesitás cobrar para cubrir tus costos, tus impuestos y tus horas no facturables: es el piso, y sirve para saber cuándo decir que no. Un precio sano vive entre esos dos números, y si el piso queda por encima del techo, el problema no es el precio sino el modelo de negocio.',
    },
    {
      q: '¿Cuánto más se puede cobrar por estar especializado?',
      a: 'Alrededor de un 35% sobre la tarifa de un generalista con la misma experiencia. La condición es que la especialización sea verificable: casos publicados, clientes de ese vertical, contenido propio sobre el tema. Decir que te especializás sin nada que mostrar no mueve el precio; lo que lo mueve es que el cliente perciba que va a tener que explicarte menos y que el riesgo de que salga mal es menor.',
    },
    {
      q: '¿Cómo paso una tarifa por palabra a tarifa por hora?',
      a: 'Multiplicás la tarifa por palabra por tu velocidad real en palabras por hora. Las velocidades de referencia son de unas 225 palabras por hora para un perfil junior, 325 para uno intermedio, 375 para uno senior y otra vez 225 para un especialista, que trabaja más lento porque el contenido es más difícil. Es la única forma de comparar un trabajo cobrado por palabra con uno cobrado por hora, y suele revelar que una tarifa por palabra que parecía buena esconde una tarifa horaria mediocre.',
    },
    {
      q: '¿Cuánto se cobra por palabra en traducción?',
      a: 'Las bandas de referencia en dólares por palabra son de 0,04 a 0,06 para un traductor junior, de 0,08 a 0,12 para uno intermedio, de 0,15 a 0,25 para uno senior y de 0,20 a 0,40 para un especialista. Encima de eso, el contenido técnico suma alrededor de un 20% y el legal o médico alrededor de un 40%, y traducir hacia el inglés agrega otro 8% porque hay mucha menos gente que lo hace con calidad nativa.',
    },
    {
      q: '¿Cuánto multiplica el seniority sobre el rate base?',
      a: 'Tomando como referencia el semi-senior, un junior cobra alrededor del 60% de esa tarifa, un senior un 60% más y un experto o lead dos veces y media. El salto de junior a experto es de más de cuatro veces, y no se explica por la velocidad de ejecución: se explica porque el experto decide qué hacer y se hace cargo del resultado, mientras que el junior ejecuta lo que le indican.',
    },
    {
      q: '¿Cuántas horas al año puedo facturar realmente?',
      a: 'Bastante menos de las que trabajás. Si facturás 30 horas por semana durante 48 semanas, son 1.440 horas al año, contra las más de 2.000 de un empleo en relación de dependencia. La diferencia se va en presupuestar, buscar clientes, facturar, cobrar, formarte y administrar, y todo eso tiene que estar prorrateado dentro de la tarifa de las horas que sí facturás.',
    },
    {
      q: '¿Por qué hay que sumar el overhead a la tarifa?',
      a: 'Porque la plata que entra no es la que te queda. Herramientas, contador, impuestos, equipo, conexión y espacio de trabajo se llevan un porcentaje fijo de todo lo que facturás. Con un overhead del 30%, para llevarte cien tenés que facturar más de ciento cuarenta y dos: la cuenta es dividir el ingreso deseado por uno menos el overhead, no restarle el porcentaje.',
    },
    {
      q: '¿Cuánto me queda en pesos de una tarifa en dólares?',
      a: 'Depende de a qué tipo de cambio liquides. Una exportación de servicios cobrada por transferencia bancaria se liquida a la punta compradora del dólar oficial, que está por debajo del contado con liquidación. Esa brecha es el costo real de cobrar por la vía formal, y conviene tenerla presente cuando comparás una propuesta en dólares con una en pesos: la tarifa nominal en dólares puede ser mejor y el neto en pesos, no tanto.',
    },
    {
      q: '¿Conviene cobrar por hora o por proyecto?',
      a: 'Por hora conviene cuando el alcance es difuso o el cliente cambia de idea seguido, porque te protege de trabajar gratis. Por proyecto conviene cuando el alcance está claro y sos rápido, porque el cliente paga el resultado y no el tiempo: si mejorás tu método, ganás más por la misma entrega. En diseño y en fotografía el precio por proyecto es la norma; en desarrollo y consultoría conviven los dos. En cualquier caso, calculá siempre la tarifa horaria equivalente para saber si el proyecto valió la pena.',
    },
  ],

  sources: [
    {
      name: 'Upwork — Guías de tarifas por categoría y nivel de experiencia',
      url: 'https://www.upwork.com/resources/freelance-rates',
      publisher: 'Upwork Global Inc.',
    },
    {
      name: 'Stack Overflow Developer Survey — Compensación por experiencia y región',
      url: 'https://survey.stackoverflow.co/',
      publisher: 'Stack Overflow',
    },
    {
      name: 'AATI — Aranceles orientativos de traducción e interpretación',
      url: 'https://aati.org.ar/',
      publisher: 'Asociación Argentina de Traductores e Intérpretes',
    },
    {
      name: 'Colegio de Traductores Públicos de la Ciudad de Buenos Aires — Aranceles orientativos',
      url: 'https://www.traductores.org.ar/matriculados/aranceles-orientativos/',
      publisher: 'CTPCBA',
    },
    {
      name: 'Cotizaciones del dólar oficial y financiero',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
      date: DOLAR_FECHA,
    },
    {
      name: 'Tipos de cambio de referencia',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Tipos_de_cambio.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Exportación de servicios — facturación y encuadre',
      url: 'https://www.argentina.gob.ar/servicio/emitir-facturas-electronicas',
      publisher: 'Gobierno de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-costo-hora-consultor-marketing',
    '/calculadora-costo-hora-desarrollador-senior',
    '/calculadora-costo-hora-disenador-grafico',
    '/calculadora-costo-hora-fotografo-evento',
    '/calculadora-costo-hora-redactor-copywriter',
    '/calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles',
    '/calculadora-hora-freelance-por-pais-mercado',
    '/calculadora-rate-hora-freelance-nivel',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
