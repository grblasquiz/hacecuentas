import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto es la cuota alimentaria?"
 *
 * Arquetipo RAMIFICADO: la pregunta cambia mucho según quién la hace (un hijo,
 * varios, alimentante sin recibo de sueldo, o cuota ya fijada que quedó vieja),
 * así que va con `cases` y sin `answer`.
 *
 * TEMA SENSIBLE. No hay una tabla oficial de porcentajes: el Código Civil y
 * Comercial (arts. 658 a 670) fija el contenido de la obligación alimentaria y
 * el criterio de proporcionalidad, pero el monto lo determina cada juez. Los
 * rangos que usa este hub son los que aparecen en la jurisprudencia habitual y
 * en las calculadoras que absorbe, y el copy tiene que decir en todos lados que
 * es orientativo. No agregar porcentajes que no salgan de esas fuentes.
 */
export const hub: HubData = {
  slug: 'familia/cuota-alimentaria',
  title: '¿Cuánto es la cuota alimentaria? — Estimación 2026 (Argentina)',
  description:
    'Estimá la cuota alimentaria según tu caso: un hijo, dos o más, alimentante monotributista o informal, o una cuota con sentencia que quedó desactualizada. Rangos de la jurisprudencia argentina y criterios del CCyCN arts. 658 a 670.',
  silo: 'Familia',
  siloHref: '/familia',

  eyebrow: 'Guía y estimación de familia',
  h1: '¿Cuánto es la cuota alimentaria?',
  lede:
    'No existe un porcentaje oficial: el juez fija el monto mirando las necesidades del hijo y la capacidad económica de cada progenitor. Lo que sí hay son rangos que la jurisprudencia repite. Partimos del caso más común —un hijo— y lo ajustás con tu situación.',
  stamps: [
    'Actualizado 27-07-2026',
    'CCyCN arts. 658 a 670 · orientativo, no vinculante',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Aporte mensual estimado del alimentante',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'un-hijo',
        label: 'Tengo un solo hijo',
        hint: 'El caso más común',
        answer: 'Con un hijo la jurisprudencia se mueve entre el 20% y el 30% del ingreso neto del alimentante.',
        yes: [
          'Rango habitual: 25% a 30% del ingreso neto mensual, con fallos que arrancan en el 20%',
          'La base es el ingreso NETO: sueldo de bolsillo más horas extra, comisiones, aguinaldo y bonos',
          'La cuota cubre alimentos, vivienda, vestimenta, educación, salud, esparcimiento y gastos de crianza (art. 659 CCyCN)',
          'El aporte del progenitor conviviente se computa en especie: el cuidado personal cotidiano tiene valor económico (art. 660)',
        ],
        warn: [
          'El porcentaje sube si el hijo es adolescente, tiene una discapacidad o necesidades de salud especiales',
          'Baja si el alimentante tiene otros hijos a cargo o una carga de cuidado compartida real',
          'El monto que arroja esta página es orientativo: no reemplaza un patrocinio letrado ni la resolución del juzgado',
        ],
        plazo: 'la cuota se debe desde la interposición de la demanda, e incluso desde el reclamo fehaciente anterior si se demanda dentro de los seis meses (art. 669 CCyCN).',
      },
      {
        id: 'dos-o-mas',
        label: 'Tengo dos o más hijos',
        hint: 'La escala sube, pero no se duplica',
        answer: 'Con dos hijos el rango habitual es 30% a 40% del ingreso neto, y con tres sube a 35% a 45%.',
        yes: [
          'Dos hijos: 30% a 40%. Tres: 35% a 45%. Cuatro: 40% a 50%. Cinco o más: 45% a 55%',
          'La escala es decreciente por hijo: hay gastos de vivienda y servicios que se comparten entre hermanos',
          'Si los hijos conviven con progenitores distintos, cada cuota se fija por separado sobre el mismo ingreso',
          'Se puede pedir una cuota única global o una discriminada por hijo, útil cuando alguno alcanza la mayoría de edad',
        ],
        warn: [
          'En la práctica los juzgados suelen no pasar del 50% del ingreso, para no dejar al alimentante sin sustento',
          'Cuando un hijo cumple 21 años la cuota no cae sola: hay que pedir el cese, y si el hijo estudia puede extenderse hasta los 25 (art. 663)',
          'La cuota de cada hijo puede tener montos distintos si sus necesidades lo son',
        ],
        plazo: 'la cuota de cada hijo se debe hasta los 21 años, y hasta los 25 si continúa estudiando y eso le impide mantenerse.',
      },
      {
        id: 'informal',
        label: 'El alimentante es monotributista o trabaja en negro',
        hint: 'No hay recibo de sueldo',
        answer: 'Sin recibo, la cuota se fija por el nivel de vida probado y suele ir al extremo alto del rango.',
        yes: [
          'Se prueba la capacidad económica por indicios: consumos, tarjetas, autos, viajes, alquileres, publicaciones y movimientos bancarios',
          'Los jueces suelen fijar un monto fijo actualizable por índice, en vez de un porcentaje sobre un sueldo que no existe',
          'También se usan unidades de referencia: cantidad de salarios mínimos o la Canasta de Crianza que publica el INDEC',
          'Se puede pedir el informe de la Agencia de Recaudación (ARCA) y el rastreo de cuentas para acreditar ingresos',
        ],
        warn: [
          'Declarar un ingreso menor al real no baja la cuota: el juez puede fijarla igual sobre la base presumida por el nivel de vida',
          'Este hub aplica el extremo alto del rango porque es lo habitual cuando el ingreso no está documentado: si tu caso tiene ingresos probados, usá otra rama',
          'La falta de recibo no habilita el incumplimiento: existe el Registro de Deudores Alimentarios Morosos en cada jurisdicción',
        ],
        plazo: 'con dos cuotas impagas ya se puede pedir la inscripción en el Registro de Deudores Alimentarios Morosos, que traba trámites, licencia de conducir y crédito.',
      },
      {
        id: 'sentencia',
        label: 'Ya hay sentencia y quiero actualizarla',
        hint: 'La cuota quedó vieja',
        answer: 'La cuota fijada se actualiza por el índice pactado en la sentencia o se pide su recomposición al juzgado.',
        yes: [
          'Si la sentencia previó un mecanismo de actualización (IPC del INDEC, RIPTE, salario mínimo o el convenio del alimentante), se aplica solo',
          'Si la cuota es un porcentaje del sueldo, se actualiza automáticamente con cada aumento y se descuenta por planilla',
          'Si es un monto fijo sin cláusula de ajuste, hay que pedir un incidente de aumento de cuota alimentaria',
          'Al incidente se lo respalda mostrando la variación del índice y el aumento concreto de los gastos del hijo',
        ],
        warn: [
          'Una cuota en monto fijo sin cláusula de ajuste pierde poder de compra todos los meses: es el error más caro de un acuerdo',
          'El aumento rige desde que se pide, así que demorar el reclamo cuesta plata que no se recupera',
          'Comparar la cuota actualizada con lo que daría hoy la escala te da el argumento cuantificado para el incidente',
        ],
        plazo: 'conviene revisar la cuota al menos una vez al año, o cada vez que el índice acumule una variación relevante.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Con el ingreso y la cantidad de hijos ya sale la estimación. Los últimos dos campos son sólo para la rama de actualización.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso neto mensual del alimentante',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'De bolsillo, promediando aguinaldo, horas extra y comisiones.',
    },
    { id: 'hijos', label: 'Cantidad de hijos', type: 'number', min: 1, max: 8, step: 1, value: 1 },
    {
      id: 'edadMayor',
      label: 'Edad del hijo mayor',
      type: 'select',
      value: '6-12',
      options: [
        { value: '0-5', label: 'Hasta 5 años' },
        { value: '6-12', label: 'De 6 a 12 años' },
        { value: '13-17', label: 'De 13 a 17 años' },
        { value: '18-21', label: 'De 18 a 21 años (o hasta 25 si estudia)' },
      ],
      help: 'La edad mueve el rango: la adolescencia encarece educación, salud y esparcimiento.',
    },
    {
      id: 'obraSocial',
      label: 'Cobertura de salud del hijo (mensual)',
      prefix: '$',
      value: '60.000',
      thousands: true,
      help: 'Obra social o prepaga. Suele ir aparte de la cuota, a cargo del alimentante.',
    },
    {
      id: 'extraordinarios',
      label: 'Gastos extraordinarios (promedio mensual)',
      prefix: '$',
      value: '40.000',
      thousands: true,
      help: 'Matrícula, útiles, uniformes, tratamientos. Se dividen entre ambos progenitores: acá se computa la mitad.',
    },
    {
      id: 'cuotaVigente',
      label: 'Cuota fijada en la sentencia (sólo si ya hay una)',
      prefix: '$',
      value: '350.000',
      thousands: true,
      help: 'El monto que figura hoy en el acuerdo o en la sentencia.',
    },
    {
      id: 'ajuste',
      label: 'Variación del índice desde la última actualización',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 500,
      step: 0.1,
      value: 25,
      help: 'IPC del INDEC, RIPTE o el índice que haya pactado la sentencia.',
    },
  ],
  fineprint:
    'Es una estimación orientativa, no un cálculo legal. En la Argentina no hay una tabla oficial de porcentajes: cada juzgado fija el monto según las necesidades del hijo y la capacidad económica de cada progenitor. Antes de reclamar o de firmar un acuerdo, asesorate con un abogado de familia o con la defensoría pública de tu jurisdicción, que es gratuita.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el aporte mensual',
    caption:
      'El aporte del alimentante casi nunca es una sola cifra: está la cuota alimentaria propiamente dicha, la cobertura de salud que suele ir aparte, y los gastos extraordinarios, que se dividen entre ambos progenitores. El gráfico muestra cuánto pesa cada parte en el total mensual.',
  },
  breakdownTitle: 'Cómo se arma la cuota',
  breakdownIntro:
    'Todos los valores son mensuales y en pesos, salvo la última fila, que es el porcentaje del ingreso que se lleva la cuota.',

  faq: [
    {
      q: '¿Cuál es el porcentaje de cuota alimentaria en Argentina?',
      a: 'No hay uno fijado por ley. El Código Civil y Comercial establece qué cubre la obligación alimentaria y el criterio de proporcionalidad, pero el porcentaje lo define el juez. En la jurisprudencia el rango habitual es del 20% al 30% del ingreso neto por un hijo, 30% a 40% por dos y 35% a 45% por tres, con un techo práctico cercano al 50%.',
    },
    {
      q: '¿Qué gastos cubre la cuota alimentaria?',
      a: 'Según el art. 659 del CCyCN, la manutención, la educación, el esparcimiento, la vestimenta, la habitación, la asistencia médica y los gastos por enfermedad, además de los necesarios para adquirir una profesión u oficio. Los gastos extraordinarios, como una matrícula o un tratamiento, se reclaman aparte y se dividen entre ambos progenitores.',
    },
    {
      q: '¿La cuota se calcula sobre el sueldo bruto o el neto?',
      a: 'Sobre el neto, es decir el de bolsillo después de los descuentos de ley. Se computan también el aguinaldo, las horas extra, las comisiones, los bonos y cualquier ingreso habitual. No se descuentan del cálculo los embargos ni los préstamos que el alimentante haya tomado por su cuenta.',
    },
    {
      q: '¿Hasta qué edad se paga la cuota alimentaria?',
      a: 'Hasta los 21 años como regla. Si el hijo continúa estudiando o capacitándose y eso le impide sostenerse solo, la obligación se extiende hasta los 25 (art. 663 CCyCN). En ambos casos el cese no es automático: hay que pedirlo, y mientras tanto la cuota se sigue devengando.',
    },
    {
      q: '¿Qué pasa si el alimentante es monotributista o trabaja en negro?',
      a: 'La cuota se fija igual. Ante la falta de recibo, el juez prueba la capacidad económica por indicios —consumos, tarjetas, vehículos, viajes, alquileres, movimientos bancarios— y suele establecer un monto fijo actualizable por índice, o expresado en salarios mínimos o en Canastas de Crianza del INDEC, en vez de un porcentaje sobre un sueldo que no existe.',
    },
    {
      q: '¿Cómo se actualiza una cuota alimentaria que quedó vieja?',
      a: 'Si la sentencia previó un mecanismo de ajuste —IPC del INDEC, RIPTE, salario mínimo o el convenio del alimentante—, se aplica sin pedir nada. Si es un porcentaje del sueldo, sube sola con cada aumento. Si es un monto fijo sin cláusula, hay que iniciar un incidente de aumento de cuota, y el nuevo monto rige desde que se pide, no en forma retroactiva.',
    },
    {
      q: '¿Desde cuándo se debe la cuota?',
      a: 'Desde el día de la interposición de la demanda. Y si hubo un reclamo fehaciente previo al otro progenitor —una carta documento, por ejemplo— se debe desde esa fecha, siempre que la demanda se interponga dentro de los seis meses siguientes (art. 669 CCyCN).',
    },
    {
      q: '¿Qué pasa si el alimentante no paga?',
      a: 'Se puede ejecutar la sentencia y embargar el sueldo, las cuentas o los bienes. También corresponde la inscripción en el Registro de Deudores Alimentarios Morosos de la jurisdicción, que traba la licencia de conducir, la apertura de cuentas, el crédito y buena parte de los trámites administrativos. Los juzgados suelen aplicar además intereses y astreintes.',
    },
    {
      q: '¿El progenitor que convive con el hijo también aporta?',
      a: 'Sí. El art. 660 del CCyCN dice expresamente que las tareas cotidianas de cuidado personal tienen un valor económico y constituyen un aporte a la manutención. Por eso la cuota que paga quien no convive no es la mitad del gasto total del hijo, sino la porción que le corresponde según su capacidad y descontando ese aporte en especie.',
    },
    {
      q: '¿La cuota baja si el alimentante forma otra familia?',
      a: 'No automáticamente. Tener nuevos hijos puede justificar un pedido de reducción, porque la obligación se reparte entre todos los hijos, pero hay que probarlo y pedirlo en el juzgado. Los gastos de una nueva pareja adulta no son motivo de reducción.',
    },
    {
      q: '¿Se puede acordar la cuota sin juicio?',
      a: 'Sí, y es lo más rápido. El acuerdo se firma ante un abogado y se presenta a homologar en el juzgado de familia, lo que le da la misma fuerza que una sentencia y permite ejecutarlo si se incumple. Conviene incluir siempre una cláusula de actualización automática por índice y aclarar quién paga la cobertura de salud y los gastos extraordinarios.',
    },
    {
      q: '¿Esta calculadora sirve para presentar en el juzgado?',
      a: 'No. Es una orientación para saber en qué orden de magnitud te movés antes de consultar. El monto lo fija el juez caso por caso, con la prueba de necesidades y de ingresos que se produzca en el expediente. Si no tenés abogado, la defensoría pública de tu jurisdicción atiende estos reclamos en forma gratuita.',
    },
  ],

  sources: [
    {
      name: 'Código Civil y Comercial de la Nación — arts. 658 a 670 (deberes de los progenitores y obligación alimentaria)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Cuota alimentaria — cómo reclamarla y qué cubre',
      url: 'https://www.argentina.gob.ar/justicia/derechofacil/leysimple/alimentos',
      publisher: 'Ministerio de Justicia de la Nación',
    },
    {
      name: 'Canasta de Crianza — costo mensual de criar hijos e hijas por tramo de edad',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149',
      publisher: 'INDEC',
    },
    {
      name: 'Índice de Precios al Consumidor (IPC), índice de referencia habitual para actualizar la cuota',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'Registro de Deudores Alimentarios Morosos — información y jurisdicciones',
      url: 'https://www.argentina.gob.ar/justicia/derechofacil/leysimple/alimentos',
      publisher: 'Ministerio de Justicia de la Nación',
    },
    {
      name: 'Defensorías públicas y patrocinio jurídico gratuito',
      url: 'https://www.mpd.gov.ar/',
      publisher: 'Ministerio Público de la Defensa',
    },
  ],

  replaces: [
    '/calculadora-cuota-alimentaria-estimacion',
    '/calculadora-cuota-alimentaria-hijos',
    '/calculadora-cuota-alimentos-porcentaje-sueldo-hijo',
    '/calculadora-pension-alimentaria-hijo-porcentaje-sueldo-detallada',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Rangos porcentuales por cantidad de hijos, en puntos porcentuales del ingreso
 * neto del alimentante. Salen de la jurisprudencia habitual y son los mismos que
 * usaban las calculadoras que este hub absorbe. NO son una tabla oficial.
 */
export const RANGOS: Record<number, [number, number]> = {
  1: [25, 30],
  2: [30, 40],
  3: [35, 45],
  4: [40, 50],
  5: [45, 55],
};

/** Ajuste en puntos porcentuales por edad del hijo mayor. */
export const AJUSTE_EDAD: Record<string, number> = {
  '0-5': -2,
  '6-12': 0,
  '13-17': 3,
  '18-21': 5,
};

/**
 * Parámetros por rama.
 *  - hijosMin / hijosMax: acota el campo "cantidad de hijos" a la rama.
 *  - punto: dónde del rango se para la estimación ('medio' o 'alto').
 *  - actualiza: la rama recalcula una cuota ya fijada por índice.
 */
export const CASE_MATH: Record<
  string,
  { hijosMin: number; hijosMax: number; punto: 'medio' | 'alto'; actualiza: boolean; norma: string; nota: string }
> = {
  'un-hijo': {
    hijosMin: 1,
    hijosMax: 1,
    punto: 'medio',
    actualiza: false,
    norma: 'CCyCN art. 658',
    nota: 'punto medio del rango de la jurisprudencia',
  },
  'dos-o-mas': {
    hijosMin: 2,
    hijosMax: 8,
    punto: 'medio',
    actualiza: false,
    norma: 'CCyCN art. 658',
    nota: 'punto medio del rango, escala decreciente por hijo',
  },
  informal: {
    hijosMin: 1,
    hijosMax: 8,
    punto: 'alto',
    actualiza: false,
    norma: 'CCyCN art. 659',
    nota: 'extremo alto del rango: sin ingreso documentado se fija por nivel de vida',
  },
  sentencia: {
    hijosMin: 1,
    hijosMax: 8,
    punto: 'medio',
    actualiza: true,
    norma: 'CCyCN art. 660',
    nota: 'cuota vigente actualizada por el índice',
  },
};

/** Tope práctico que los juzgados no suelen superar, en % del ingreso neto. */
export const TOPE_PRACTICO = 50;

/** Proporción de los gastos extraordinarios que se computa al alimentante. */
export const PARTE_EXTRAORDINARIOS = 0.5;
