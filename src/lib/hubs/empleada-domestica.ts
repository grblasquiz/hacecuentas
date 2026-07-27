import type { HubData } from './types';

/**
 * Hub para EMPLEADORES de personal de casas particulares (ley 26.844).
 *
 * Cubre el día a día: sueldo por hora o mensual según la escala de la CNTCP,
 * aportes y contribuciones a ARCA/AFIP por tramo de horas, ART y las
 * provisiones de aguinaldo y vacaciones.
 *
 * ALCANCE: NO liquida el egreso. La renuncia y el despido de casas
 * particulares ya viven en /trabajo/liquidacion-final. Acá se los nombra y se
 * linkea, pero no se duplica el cálculo.
 *
 * La escala horaria y los importes de aportes/ART se IMPORTAN del módulo real
 * (src/lib/formulas/aportes-empleada-domestica-casas-particulares-empleador.ts)
 * desde la página. Nunca se copian acá: la CNTCP los mueve varias veces al año.
 */
export const hub: HubData = {
  slug: 'trabajo/empleada-domestica',
  title: 'Empleada doméstica: ¿cuánto le pago? — Sueldo y aportes 2026',
  description:
    'Calculá cuánto te sale por mes tener empleada doméstica registrada: valor hora de la escala CNTCP por categoría, con o sin retiro, sueldo mensual, aportes y contribuciones a ARCA por tramo de horas, ART y provisión de aguinaldo y vacaciones (ley 26.844).',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación para empleadores',
  h1: 'Empleada doméstica: ¿cuánto le pago?',
  lede:
    'El sueldo lo fija la escala de la CNTCP por categoría, por hora y según trabaje con o sin retiro. Encima va lo que pagás vos: aportes y contribuciones a ARCA según las horas semanales, la ART y las provisiones de aguinaldo y vacaciones. Partimos del caso más común y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'Ley 26.844 · Escala CNTCP vigente', '5 calculadoras adentro'],

  resultLabel: 'Lo que te sale por mes (costo total)',

  cases: {
    title: '¿Cómo la tenés contratada?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'hora-sin-retiro',
        label: 'Por hora, sin retiro (viene por horas)',
        hint: 'El caso más común',
        answer: 'Pagás el valor hora sin retiro de su categoría por las horas trabajadas, más aportes y ART.',
        yes: [
          'Valor hora de la escala CNTCP de su categoría, en la columna SIN RETIRO (más alta que la de con retiro)',
          'Mensual estimado = valor hora × horas semanales × 4,33 semanas promedio por mes',
          'Aportes y contribuciones a ARCA (ex AFIP) según el tramo de horas semanales que trabaje para vos',
          'Cuota mensual de ART: es obligatoria aunque venga pocas horas',
          'Provisión de aguinaldo (un doceavo del sueldo por mes) y de vacaciones',
        ],
        warn: [
          'La escala de la CNTCP es un PISO: podés pagar más, nunca menos',
          'Si trabaja en varias casas, cada empleador registra y aporta por sus propias horas',
          'Con menos de 16 hs semanales para vos los aportes son menores, pero no le dan obra social plena',
          'La categoría la define la tarea real, no el nombre que le pongan al puesto',
        ],
        plazo: 'la escala de la CNTCP se actualiza varias veces al año: revisá el valor hora vigente cada vez que se firma un acuerdo.',
      },
      {
        id: 'hora-con-retiro',
        label: 'Por hora, con retiro (vive en la casa)',
        hint: 'Personal con retiro / cama adentro',
        answer: 'El valor hora con retiro es menor que el sin retiro, porque incluye alojamiento y comida.',
        yes: [
          'Valor hora de la escala CNTCP en la columna CON RETIRO de su categoría',
          'La diferencia con la columna sin retiro compensa el alojamiento y las comidas',
          'Aportes a ARCA y ART iguales que en cualquier otra modalidad',
          'Le corresponde descanso semanal de 35 horas corridas y una pausa nocturna de 9 horas',
        ],
        warn: [
          'Los caseros no tienen diferencia de escala entre con y sin retiro: cobran un único valor hora',
          'El alojamiento y la comida NO se descuentan del sueldo: ya están contemplados en la escala más baja',
          'La jornada no puede superar 8 horas diarias ni 48 semanales, con o sin retiro',
        ],
        plazo: 'el descanso semanal es de 35 horas corridas, desde el sábado a las 13 hasta el lunes a la misma hora, salvo pacto en contrario.',
      },
      {
        id: 'mensual',
        label: 'Le pago un sueldo mensual fijo',
        hint: 'Jornada completa o monto pactado',
        answer: 'El sueldo mensual pactado nunca puede quedar por debajo del piso de la escala CNTCP.',
        yes: [
          'Podés pactar un monto mensual fijo si la jornada es estable',
          'El control es simple: el mensual pactado tiene que ser igual o mayor al valor hora de escala × horas × 4,33',
          'Sobre ese mensual se calculan igual el aguinaldo y el día de vacaciones (sueldo ÷ 25)',
          'Los aportes a ARCA siguen dependiendo de las HORAS semanales, no del monto pactado',
        ],
        warn: [
          'Si el mensual pactado queda debajo del piso de escala, la diferencia se le adeuda',
          'Un aumento de la CNTCP puede dejar tu monto fijo por debajo del piso de un mes para el otro',
          'Las horas por encima de 8 diarias o 48 semanales se pagan con recargo del 50% (100% sábados después de las 13, domingos y feriados)',
        ],
        plazo: 'el sueldo se paga hasta el cuarto día hábil del mes siguiente si es mensual, y el aguinaldo en junio y diciembre.',
      },
      {
        id: 'aportes',
        label: 'Sólo quiero saber cuánto pago de aportes',
        hint: 'ARCA + ART',
        answer: 'Los aportes de casas particulares son importes fijos por tramo de horas semanales, más la ART.',
        yes: [
          'No es un porcentaje del sueldo: es un importe fijo mensual según el tramo de horas semanales',
          'Tres tramos: menos de 12 hs, de 12 a menos de 16 hs, y 16 hs o más por semana',
          'Con 16 hs o más el aporte le da obra social plena y cómputo jubilatorio completo',
          'Se paga con el formulario de Casas Particulares en ARCA (ex AFIP), junto con la cuota de ART',
        ],
        warn: [
          'Los importes de ARCA y la cuota de ART se actualizan sin previo aviso: los de abajo son referenciales y editables',
          'La ART es obligatoria desde la primera hora, incluso con jornadas mínimas',
          'Podés deducir de Ganancias lo pagado en sueldo y contribuciones, hasta el tope de la ganancia no imponible anual',
        ],
        plazo: 'el pago de aportes vence a mediados del mes siguiente, según la terminación de tu CUIT.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'categoria',
      label: 'Categoría del personal (CNTCP)',
      type: 'select',
      value: 'tareas-gen',
      options: [
        { value: 'tareas-gen', label: 'Tareas generales (limpieza)' },
        { value: 'cuidado-per', label: 'Asistencia y cuidado de personas' },
        { value: 'cocinera', label: 'Tareas específicas (cocina)' },
        { value: 'caseros', label: 'Caseros' },
        { value: 'supervisor', label: 'Supervisor/a' },
      ],
      help: 'La define la tarea real, no el nombre del puesto.',
    },
    { id: 'horas', label: 'Horas por semana que trabaja para vos', type: 'number', min: 1, max: 48, value: 12, suffix: 'hs/sem' },
    {
      id: 'sueldoPactado',
      label: 'Sueldo mensual pactado (si arreglaste un monto fijo)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 para que use el piso de la escala CNTCP.',
    },
    { id: 'antiguedad', label: 'Años de antigüedad', type: 'number', min: 0, max: 50, value: 2, suffix: 'años' },
    {
      id: 'art',
      label: 'Cuota mensual de ART',
      prefix: '$',
      value: '3.500',
      thousands: true,
      help: 'Varía por aseguradora: poné la de tu póliza.',
    },
  ],
  fineprint:
    'Es una orientación. La escala de la CNTCP y los importes de aportes cambian varias veces al año; verificá el valor vigente antes de liquidar.',

  chart: {
    type: 'stacked',
    title: 'Lo que cobra ella vs. lo que pagás vos',
    caption:
      'La barra parte el costo mensual: el sueldo de bolsillo que cobra ella y, al lado, lo que sale de tu bolsillo aparte —aportes a ARCA, ART y las provisiones de aguinaldo y vacaciones—. Ese segundo bloque es el que casi siempre se subestima.',
  },
  breakdownTitle: 'Cómo se arma lo que te sale por mes',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cuánto se le paga por hora a una empleada doméstica en 2026?',
      a: 'Depende de la categoría y de si trabaja con o sin retiro. La escala la fija la Comisión Nacional de Trabajo en Casas Particulares (CNTCP) y se actualiza varias veces al año: la calculadora de arriba usa el valor hora vigente de cada categoría, con tareas generales como caso base y supervisión como el más alto. El valor sin retiro siempre es mayor que el de con retiro.',
    },
    {
      q: '¿Por qué el valor hora sin retiro es más alto que el de con retiro?',
      a: 'Porque en el personal con retiro (el que vive en la casa) la escala contempla que el empleador provee alojamiento y comida. Esas prestaciones no se descuentan del sueldo: ya están reflejadas en un valor hora más bajo. La excepción son los caseros, que tienen un único valor sin distinción.',
    },
    {
      q: '¿Cuánto pago de aportes por una empleada de casas particulares?',
      a: 'No es un porcentaje del sueldo. Son importes fijos mensuales por tramo de horas semanales: menos de 12 hs, de 12 a menos de 16 hs, y 16 hs o más. A eso se le suma la cuota de ART, que es obligatoria desde la primera hora. Con 16 hs semanales o más el aporte le da obra social plena y cómputo jubilatorio completo.',
    },
    {
      q: '¿Cuál es el costo total real de tener empleada doméstica registrada?',
      a: 'Sueldo de bolsillo + aportes y contribuciones a ARCA + cuota de ART + la provisión mensual del aguinaldo (un doceavo del sueldo) + la provisión de las vacaciones pagas. Con pocas horas semanales, esa mochila puede sumar entre un 15% y un 30% por encima del sueldo; con jornada completa pesa proporcionalmente menos.',
    },
    {
      q: '¿Cuántos días de vacaciones le corresponden?',
      a: 'Según el art. 30 de la ley 26.844: 14 días corridos con menos de 5 años de antigüedad, 21 días de 5 a 10, 28 días de 10 a 20 y 35 días con más de 20. El día de vacaciones se paga a razón del sueldo mensual dividido 25, así que vale más que un día común. Con menos de 6 meses trabajados en el año, se liquida 1 día por cada 20 trabajados.',
    },
    {
      q: '¿Cómo le pago el aguinaldo?',
      a: 'El art. 39 de la ley 26.844 le da el mismo SAC que la LCT: el 50% del mejor sueldo mensual del semestre, proporcional al tiempo trabajado, en dos cuotas (junio y diciembre). Conviene provisionar un doceavo del sueldo todos los meses para no comerse el bache. El detalle del cálculo está en el hub de aguinaldo.',
    },
    {
      q: '¿Cómo cobra una niñera por hora nocturna o de fin de semana?',
      a: 'La niñera encuadra en la categoría de asistencia y cuidado de personas, así que el piso es el valor hora de esa categoría. Sobre ese piso, las horas que exceden la jornada de 8 diarias o 48 semanales se pagan con un recargo del 50%, y del 100% los sábados después de las 13, domingos y feriados. En el mercado informal es habitual además un plus por más de un chico o por zona, pero eso es acuerdo entre partes, no escala.',
    },
    {
      q: 'Si la despido, ¿cuánto le tengo que pagar de indemnización?',
      a: 'Eso no entra en esta estimación, que cubre el sueldo y los aportes del día a día. El despido sin causa del régimen de casas particulares paga un mes de sueldo por año o fracción mayor a 3 meses (art. 48), preaviso (art. 42) e integración del mes (art. 43), sin tope de convenio. La liquidación del egreso —renuncia o despido— está en el hub de liquidación final.',
    },
    {
      q: '¿Qué pasa si le pago menos que la escala?',
      a: 'La escala de la CNTCP es un piso de orden público: lo que pagues de menos se le adeuda y puede reclamarse con intereses, más las multas por registración deficiente. El riesgo típico no es pagar mal a propósito, sino quedarse con un monto fijo pactado hace meses después de que la Comisión aumentó la escala.',
    },
    {
      q: '¿Puedo deducir lo que le pago de Ganancias?',
      a: 'Sí. El personal de casas particulares es deducible de Impuesto a las Ganancias: se computan el sueldo y las contribuciones patronales efectivamente pagados en el año, con tope en el monto de la ganancia no imponible anual. Para poder deducirlo necesitás tenerla registrada y los pagos hechos con el formulario correspondiente de ARCA.',
    },
    {
      q: '¿Tengo que pagar ART si viene sólo unas horas por semana?',
      a: 'Sí. La cobertura de riesgos del trabajo es obligatoria para todo el personal de casas particulares desde la primera hora contratada, sin mínimo de jornada. La cuota la fija cada aseguradora, por eso en la calculadora es un campo editable y no un número fijo.',
    },
  ],

  sources: [
    {
      name: 'Ley 26.844 — Régimen Especial de Contrato de Trabajo para el Personal de Casas Particulares',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/210000-214999/210489/norma.htm',
      publisher: 'InfoLeg',
      date: 'texto vigente',
    },
    {
      name: 'Decreto 467/2014 — reglamentación de la ley 26.844',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/225000-229999/228633/norma.htm',
      publisher: 'InfoLeg',
      date: '2014',
    },
    {
      name: 'Comisión Nacional de Trabajo en Casas Particulares (CNTCP) — escala salarial vigente por categoría y zona',
      url: 'https://www.argentina.gob.ar/trabajo/casasparticulares',
      publisher: 'Ministerio de Capital Humano',
    },
    {
      name: 'Casas Particulares — aportes, contribuciones y registro del empleador',
      url: 'https://www.afip.gob.ar/casas-particulares/',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Ley 24.557 de Riesgos del Trabajo — cobertura obligatoria de ART',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/27971/texact.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/calculadora-sueldo-empleada-domestica-horas-retiro',
    '/calculadora-vacaciones-empleada-casa-particular-antiguedad-dias',
    '/calculadora-ninera-hora-noche-fin-de-semana-tarifa',
    '/calculadora-indemnizacion-empleada-casa-particular-ley-26844-despido',
    '/calculadora-aportes-empleada-domestica-casas-particulares-empleador',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros por rama.
 *  - retiro: qué columna de la escala CNTCP usar ('con' | 'sin' | null si la
 *    rama parte de un mensual pactado).
 *  - foco: qué muestra el total ('costo' = costo total del empleador,
 *    'aportes' = sólo lo que va a ARCA + ART).
 */
export const CASE_MATH: Record<string, { retiro: 'con' | 'sin'; foco: 'costo' | 'aportes'; nota: string }> = {
  'hora-sin-retiro': {
    retiro: 'sin',
    foco: 'costo',
    nota: 'valor hora sin retiro de la escala CNTCP',
  },
  'hora-con-retiro': {
    retiro: 'con',
    foco: 'costo',
    nota: 'valor hora con retiro (incluye alojamiento y comida)',
  },
  mensual: {
    retiro: 'sin',
    foco: 'costo',
    nota: 'mensual pactado, controlado contra el piso de escala',
  },
  aportes: {
    retiro: 'sin',
    foco: 'aportes',
    nota: 'aportes y contribuciones a ARCA + ART',
  },
};

/** Semanas promedio por mes que usa la liquidación horaria del régimen. */
export const SEMANAS_MES = 4.33;

/** Días de vacaciones por antigüedad — art. 30 ley 26.844. */
export const TRAMOS_VACACIONES = [
  { hastaAnios: 5, dias: 14 },
  { hastaAnios: 10, dias: 21 },
  { hastaAnios: 20, dias: 28 },
  { hastaAnios: 999, dias: 35 },
];

/** Divisor del día de vacaciones (art. 155 LCT por analogía, dec. 467/2014). */
export const DIVISOR_VACACIONES = 25;
