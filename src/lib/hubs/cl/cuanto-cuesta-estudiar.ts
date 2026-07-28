import type { HubData } from '../types';
import { FES_CONDONACION_2026, NEM_DEMRE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me va a costar la universidad y con qué deuda salgo?"
 *
 * Absorbe seis calculadoras de educación superior: gratuidad, arancel de universidad privada,
 * deuda del CAE, condonación del FES, NEM/ranking DEMRE y pase escolar TNE.
 *
 * ─── Correcciones respecto de las fórmulas viejas ────────────────────────────────────────
 * 1) CITA LEGAL FALSA. `gratuidad-educacion-superior-chile-deciles-1-6.ts:45` dice
 *    `const max_cobertura_anos = 6; // límite ley 20.949`. La Ley 20.949 no regula educación
 *    superior: regula el peso máximo de carga en la manipulación manual de los trabajadores.
 *    La gratuidad está en la Ley 21.091 sobre Educación Superior, y la regla real no es un "6"
 *    plano: la cobertura corre por la DURACIÓN FORMAL de la carrera; si el estudiante se
 *    excede hasta un año, la institución puede cobrarle hasta el 50% del arancel regulado y
 *    los derechos básicos de matrícula de ese período; si se excede más de un año, puede
 *    cobrarle el 100%. Acá se implementa esa regla, no el tope fijo.
 * 2) La misma fórmula cubría el "arancel anual estimado" completo. La gratuidad cubre el
 *    ARANCEL REGULADO, no el arancel real de la institución: la diferencia la paga el
 *    estudiante. Por eso acá el arancel regulado es un campo aparte.
 * 3) `credito-aval-cae-chile-deuda-final-promedio.ts:62-84` simula el repago SIN interés
 *    ("Deuda CAE NO genera interés adicional durante repago"). El CAE devenga su tasa durante
 *    todo el crédito, también después de titularse: ignorarlo subestima el plazo y el costo.
 *    Acá el saldo devenga interés mes a mes durante el repago.
 * 4) `pase-escolar-tne-chile-precio-2026-recargo.ts:24-41` traía una tabla de tarifas de
 *    transporte por región citando al SII como fuente. El SII no fija tarifas de transporte y
 *    esos valores no corresponden a ninguna tarifa publicada. Acá la tarifa adulto es un campo
 *    editable: la pone el usuario con el valor real de su ciudad.
 *
 * FES_CONDONACION_2026 y NEM_DEMRE_2026 están verificados en src/lib/data/chile-2026.ts.
 * La UF es dato VIVO (src/data/live/chile.json): la condonación del FES se expresa en UF.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicador vivo, con el mismo fallback que usa la fórmula original del FES. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;

export const FES = FES_CONDONACION_2026;
export const NEM = NEM_DEMRE_2026;

export const ESTUDIAR = {
  /** Deciles del Registro Social de Hogares con derecho a gratuidad — Ley 21.091. */
  decilesGratuidad: 6,
  /**
   * Excedida la duración formal hasta en un año, la institución puede cobrar como máximo esta
   * fracción del arancel regulado y los derechos básicos de matrícula. Ley 21.091.
   */
  fraccionCobroPrimerAnioExtra: 0.5,
  /** Pasado ese año adicional, la institución puede cobrar el arancel completo. */
  fraccionCobroDespues: 1.0,
  /** Tope legal de la cuota del CAE: 10% de la renta bruta del deudor. */
  topeCuotaCaeSobreRenta: 0.1,
  /** Descuento de la Tarjeta Nacional Estudiantil: se paga un tercio de la tarifa adulto. */
  factorTneSobreTarifa: 1 / 3,
} as const;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/cuanto-cuesta-estudiar',
  title: 'Cuánto cuesta estudiar en Chile: gratuidad, arancel, CAE y condonación del FES',
  description:
    'Calcula si te toca gratuidad por tu decil, cuánto pagarías de arancel en una universidad privada, con qué deuda de CAE sales y cuánto te condonaría el FES. Incluye tu puntaje NEM y ranking del DEMRE y el ahorro del pase escolar TNE.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · educación superior',
  h1: '¿Cuánto me va a costar la universidad y con qué deuda salgo?',
  lede:
    'Estudiar en Chile puede costarte cero o varias decenas de millones, y la diferencia se decide con dos datos: tu decil del Registro Social de Hogares y el arancel de la carrera. Mira si te toca gratuidad, cuánto queda a tu cargo si no, con qué deuda sales financiando con CAE y cuánto de esa deuda condonaría el FES.',
  stamps: [
    'Gratuidad: deciles 1 a 6 · Ley 21.091 sobre Educación Superior',
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `FES: base de ${FES.baseUf.noTituladoAlDia} a ${FES.baseUf.tituladoMoroso} UF según perfil`,
    'Tablas NEM del DEMRE, escala 100–1000',
    '5 situaciones en una sola página',
  ],

  resultLabel: 'Costo estimado a tu cargo',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'Partimos por la pregunta que decide todo lo demás: si te corresponde gratuidad o si vas a tener que financiar el arancel.',
    items: [
      {
        id: 'gratuidad',
        label: '¿Me toca gratuidad?',
        hint: 'Deciles 1 a 6 del Registro Social de Hogares, en una institución adscrita.',
        yes: [
          'Cobertura del arancel regulado y de los derechos básicos de matrícula mientras dures lo formal de la carrera',
          'La diferencia entre el arancel real de la institución y el arancel regulado, que queda a tu cargo',
          'Qué pasa si te atrasas: hasta un año extra la institución puede cobrarte como máximo la mitad del arancel regulado',
          'Cuánto pagarías si te atrasas más de un año, cuando ya pueden cobrarte el arancel completo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La gratuidad cubre el ARANCEL REGULADO, no el arancel que cobra la institución: si tu carrera cobra más que el regulado, esa diferencia la pagas tú aunque tengas gratuidad',
          'El beneficio exige que la institución esté adscrita a la gratuidad y acreditada: no todas lo están, y una institución puede perder la adscripción',
          'Tu decil se recalcula todos los años con el Registro Social de Hogares: si el hogar sube de decil, puedes perder la gratuidad para el año siguiente',
          'Hay que mantener la matrícula vigente y un avance mínimo de la carrera para conservar el beneficio',
          'La cobertura corre por la duración formal de la carrera (Ley 21.091), no por un número fijo de años igual para todas',
        ],
        plazo:
          'la acreditación socioeconómica se hace con el Formulario Único de Acreditación Socioeconómica, que se completa entre octubre y noviembre para el año siguiente.',
        answer:
          'Si tu hogar está en los deciles 1 a 6 y tu institución está adscrita, la gratuidad cubre el arancel regulado y la matrícula por la duración formal de la carrera. Lo que la institución cobre por encima del arancel regulado sigue siendo tuyo.',
      },
      {
        id: 'arancel-cae',
        label: 'No me toca gratuidad: arancel más CAE',
        hint: 'Cuánto suma la carrera completa y con qué deuda sales al titularte.',
        yes: [
          'El arancel de los años de carrera con su reajuste anual',
          'Cuánto de eso financia el CAE y cuánto tienes que poner de tu bolsillo cada año',
          'La deuda capitalizada al momento de egresar, con la tasa del crédito',
          'La cuota al titularte, topada en el 10% de tu renta bruta, y en cuántos años terminas de pagar',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El CAE devenga interés durante toda la vida del crédito, también después de titularte: cualquier cálculo que asuma interés cero en el repago subestima el plazo y el costo total',
          'La cuota está topada en el 10% de tu renta bruta, así que si la renta es baja la cuota apenas cubre el interés y el saldo puede bajar muy lento',
          'El arancel de referencia del CAE puede ser menor que el arancel real de tu carrera: la diferencia la financias tú',
          'La deuda del CAE no se extingue por dejar la carrera: si abandonas, igual la debes, y con un perfil de no titulado',
          'Este cálculo asume renta estable y crecimiento parejo: una interrupción laboral cambia el resultado por completo',
        ],
        plazo:
          'el CAE empieza a pagarse 18 meses después del egreso o de dejar la institución.',
        answer:
          'Con CAE la deuda al egresar es bastante mayor que la suma de los aranceles, porque cada desembolso capitaliza durante la carrera. Con la cuota topada en el 10% de la renta, el plazo real suele superar los diez años.',
      },
      {
        id: 'fes',
        label: 'Ya tengo CAE: ¿cuánto me condona el FES?',
        hint: 'La condonación inicial depende de tu perfil y de cuántas cuotas llevas pagadas.',
        yes: [
          'La condonación inicial en UF según tu perfil: titulado o no, al día o en mora',
          'Esa condonación convertida a pesos con la UF de hoy',
          'El saldo que quedaría después de aplicarla',
          'La opción de pago anticipado: pagando el 75% del saldo en hasta 12 cuotas se condona el 25% restante',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El FES es un proyecto de ley en tramitación legislativa: nada de esto es todavía derecho vigente y las cifras definitivas dependen del texto que se apruebe',
          'La condonación se expresa en UF, así que su valor en pesos cambia todos los días',
          'La base es más alta para quien está en mora que para quien está al día, lo que resulta contraintuitivo pero es lo que dice la fórmula publicada por el Mineduc',
          'Haber pagado más cuotas aumenta la condonación: el factor es cuotas pagadas dividido por cuotas totales, más uno',
          'Si la condonación inicial supera tu saldo, la deuda se extingue; no se recibe la diferencia en efectivo',
        ],
        plazo:
          'no hay plazo vigente: depende de la tramitación del proyecto de ley y de su reglamento posterior.',
        answer:
          'La condonación inicial del FES parte de una base en UF según tu perfil y se multiplica por las cuotas que llevas pagadas. Es una estimación: el proyecto de ley sigue en tramitación.',
      },
      {
        id: 'admision',
        label: 'Estoy postulando: mi puntaje NEM y ranking',
        hint: 'Tu promedio de enseñanza media convertido a la escala 100–1000 del DEMRE.',
        yes: [
          'Tu puntaje NEM según la tabla oficial del DEMRE del grupo que te corresponda',
          'Tu puntaje ranking estimado, comparando tu promedio con el histórico de tu colegio',
          'Cuántos puntos te suma el ranking por encima de tu NEM',
          'Qué grupo de tabla aplica: humanístico-científica diurna, de adultos o técnico-profesional',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El ranking oficial se calcula nivel por nivel (de 1° a 4° medio) contra las tres generaciones anteriores de tu colegio: esta es una estimación agregada y puede diferir del puntaje real',
          'El ranking nunca es menor que tu NEM, y llega al máximo de 1000 si igualas el mejor promedio histórico de tu colegio',
          'Un promedio bajo 4,0 no tiene puntaje NEM en la escala del DEMRE',
          'Cada carrera pondera NEM, ranking y pruebas de forma distinta: un buen ranking no sirve igual en todas partes',
        ],
        plazo:
          'los puntajes NEM y ranking los calcula el DEMRE con las notas que informa tu colegio; se publican junto con los resultados de las pruebas.',
        answer:
          'Tu puntaje NEM sale de convertir tu promedio de enseñanza media con la tabla oficial del DEMRE. El ranking parte de ese NEM y sube si estás por encima del promedio histórico de tu colegio.',
      },
      {
        id: 'tne',
        label: 'Pase escolar: cuánto ahorro con la TNE',
        hint: 'La Tarjeta Nacional Estudiantil paga un tercio de la tarifa adulto.',
        yes: [
          'Lo que pagas por viaje con la TNE frente a la tarifa adulto de tu ciudad',
          'Cuánto ahorras al mes según los días que uses el transporte',
          'Cuánto suma ese ahorro en el año',
          'Qué pasa si la tarjeta está bloqueada y tienes que pagar tarifa completa',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La tarifa adulto la pones tú: cambia por ciudad, por sistema de transporte y por horario, y no existe una tabla nacional única',
          'La TNE hay que revalidarla: si no se acredita la matrícula, la tarjeta se bloquea y vuelves a pagar tarifa completa',
          'El descuento aplica en los servicios de transporte público adheridos, no en todos los modos ni en todos los recorridos',
          'Usar una TNE bloqueada o de otra persona expone a sanción además de tener que pagar el viaje',
        ],
        plazo:
          'la revalidación de la TNE se hace cada año escolar en los operativos de JUNAEB o en los puntos habilitados.',
        answer:
          'Con la TNE pagas un tercio de la tarifa adulto en cada viaje. Sobre un uso diario, el ahorro anual es de varias decenas o cientos de miles de pesos según la tarifa de tu ciudad.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Aranceles y montos en pesos chilenos al año. El arancel regulado es un campo aparte a propósito: es lo que cubre la gratuidad, y casi nunca coincide con lo que cobra la institución.',
  fields: [
    {
      id: 'decil',
      label: 'Tu decil del Registro Social de Hogares',
      type: 'number',
      value: 5,
      min: 1,
      max: 10,
      step: 1,
      help: 'La gratuidad cubre los deciles 1 a 6. El decil sale de tu Cartola Hogar.',
    },
    {
      id: 'arancelReal',
      label: 'Arancel anual real de la carrera (CLP)',
      prefix: '$',
      value: '5.800.000',
      thousands: true,
      help: 'Lo que efectivamente cobra la institución al año, según su arancel publicado.',
    },
    {
      id: 'arancelRegulado',
      label: 'Arancel regulado anual (CLP)',
      prefix: '$',
      value: '3.500.000',
      thousands: true,
      help: 'Lo que cubre la gratuidad. Lo fija el Mineduc por grupo de carreras: si es menor que el real, la diferencia la pagas tú.',
    },
    {
      id: 'duracion',
      label: 'Duración formal de la carrera (años)',
      type: 'number',
      value: 5,
      min: 1,
      max: 8,
      step: 1,
      help: 'La duración del plan de estudios. Es el plazo por el que corre la cobertura de la gratuidad.',
    },
    {
      id: 'atraso',
      label: 'Años de atraso sobre la duración formal',
      type: 'number',
      value: 0,
      min: 0,
      max: 5,
      step: 1,
      help: 'Hasta un año extra te pueden cobrar la mitad del arancel regulado; pasado eso, el total.',
    },
    {
      id: 'reajuste',
      label: 'Reajuste anual del arancel',
      suffix: '%',
      type: 'number',
      value: 3,
      min: 0,
      max: 12,
      step: 0.5,
      help: 'Cuánto sube el arancel cada año. Los aranceles suelen reajustarse por sobre el IPC.',
    },
    {
      id: 'tasaCae',
      label: 'Tasa anual del crédito',
      suffix: '%',
      type: 'number',
      value: 2,
      min: 0,
      max: 8,
      step: 0.1,
      help: 'La tasa del CAE. Devenga durante la carrera y también durante el repago.',
    },
    {
      id: 'rentaEgreso',
      label: 'Renta bruta mensual esperada al egresar (CLP)',
      prefix: '$',
      value: '1.400.000',
      thousands: true,
      help: 'Define la cuota: el CAE se paga con un tope del 10% de la renta bruta.',
    },
    {
      id: 'deudaActual',
      label: 'Saldo actual de tu deuda CAE (CLP)',
      prefix: '$',
      value: '12.000.000',
      thousands: true,
      help: 'Sólo para el caso del FES: el saldo que tienes hoy.',
    },
    {
      id: 'cuotasPagadas',
      label: 'Cuotas del CAE ya pagadas',
      type: 'number',
      value: 24,
      min: 0,
      max: 300,
      step: 1,
      help: 'Sube la condonación del FES: el factor es cuotas pagadas ÷ cuotas totales, más uno.',
    },
    {
      id: 'cuotasTotales',
      label: 'Cuotas totales pactadas del CAE',
      type: 'number',
      value: 180,
      min: 1,
      max: 300,
      step: 1,
    },
    {
      id: 'perfilFes',
      label: 'Tu perfil para el FES',
      type: 'select',
      value: 'tituladoAlDia',
      options: [
        { value: 'noTituladoAlDia', label: `Sin título y al día — base ${FES.baseUf.noTituladoAlDia} UF` },
        { value: 'tituladoAlDia', label: `Titulado y al día — base ${FES.baseUf.tituladoAlDia} UF` },
        { value: 'noTituladoMoroso', label: `Sin título y en mora — base ${FES.baseUf.noTituladoMoroso} UF` },
        { value: 'tituladoMoroso', label: `Titulado y en mora — base ${FES.baseUf.tituladoMoroso} UF` },
      ],
    },
    {
      id: 'promedio',
      label: 'Tu promedio de notas de enseñanza media',
      type: 'number',
      value: 6.2,
      min: 4,
      max: 7,
      step: 0.01,
      help: 'De 4,0 a 7,0. Bajo 4,0 no hay puntaje NEM.',
    },
    {
      id: 'grupoNem',
      label: 'Tabla del DEMRE que te corresponde',
      type: 'select',
      value: 'A',
      options: [
        { value: 'A', label: 'Grupo A — humanístico-científica diurna' },
        { value: 'B', label: 'Grupo B — humanístico-científica de adultos' },
        { value: 'C', label: 'Grupo C — técnico-profesional' },
      ],
    },
    {
      id: 'promedioColegio',
      label: 'Promedio histórico de tu colegio',
      type: 'number',
      value: 5.6,
      min: 4,
      max: 7,
      step: 0.01,
      help: 'Promedio de las tres generaciones anteriores. Se usa para estimar el ranking.',
    },
    {
      id: 'maximoColegio',
      label: 'Nota máxima histórica de tu colegio',
      type: 'number',
      value: 6.8,
      min: 4,
      max: 7,
      step: 0.01,
    },
    {
      id: 'tarifaAdulto',
      label: 'Tarifa adulto de un viaje en tu ciudad (CLP)',
      prefix: '$',
      value: '900',
      thousands: true,
      help: 'La tarifa real de tu sistema de transporte. No existe una tabla nacional única: ponla tú.',
    },
    {
      id: 'viajesMes',
      label: 'Viajes al mes',
      type: 'number',
      value: 44,
      min: 1,
      max: 200,
      step: 1,
      help: 'Dos viajes por día hábil son unos 44 al mes.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'bars',
    title: 'A dónde va la plata de la carrera',
    caption:
      'Compara el arancel total de la carrera, lo que cubre la gratuidad o el crédito, y lo que efectivamente queda a tu cargo, incluyendo el interés que suma el financiamiento.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Quién tiene derecho a gratuidad?',
      a: 'Los estudiantes cuyo hogar pertenece a los seis primeros deciles de menores ingresos según el Registro Social de Hogares, que estudian en una institución adscrita a la gratuidad y acreditada, y que cumplen los requisitos académicos de avance. El beneficio está regulado por la Ley 21.091 sobre Educación Superior. El decil se acredita con el Formulario Único de Acreditación Socioeconómica y se revisa cada año, así que no es un derecho ganado para siempre.',
    },
    {
      q: 'Tengo gratuidad pero me están cobrando. ¿Puede ser?',
      a: 'Sí, y es la confusión más frecuente. La gratuidad cubre el arancel regulado, que fija el Ministerio de Educación por grupo de carreras, y los derechos básicos de matrícula. Si tu institución cobra un arancel real superior al regulado, esa diferencia queda a tu cargo. Por eso esta página pide los dos números por separado: es la única forma de ver cuánto vas a pagar de verdad.',
    },
    {
      q: '¿Qué pasa con la gratuidad si me atraso?',
      a: 'La cobertura corre por la duración formal de la carrera. Si te excedes hasta en un año sobre ese plazo, la institución puede cobrarte como máximo el 50% del arancel regulado y de los derechos básicos de matrícula correspondientes a ese período adicional. Si te excedes más de un año, ya puede cobrarte el total. No es que la gratuidad "se corte" de golpe: hay un tramo intermedio de cobro parcial que conviene tener presente antes de congelar un semestre.',
    },
    {
      q: '¿Cuánta deuda de CAE se junta en una carrera?',
      a: 'Bastante más que la suma de los aranceles, porque cada desembolso anual empieza a devengar interés desde que se entrega y sigue capitalizando hasta que te titulas. Sobre una carrera de cinco años y un arancel de varios millones al año, la deuda al egresar suele quedar entre un 5% y un 15% por encima de lo prestado, según la tasa. Y después sigue devengando durante el repago.',
    },
    {
      q: '¿Es cierto que el CAE no cobra interés después de que me titulo?',
      a: 'No. El crédito devenga su tasa durante toda la vida del préstamo, incluido el período de pago. Es un error común, y aparece incluso en calculadoras que asumen interés cero en el repago: eso subestima tanto el plazo como el costo total. Con la cuota topada en el 10% de la renta bruta, si la renta es baja una parte importante de la cuota se va sólo en interés y el saldo baja muy lento.',
    },
    {
      q: '¿Cuánto es la cuota del CAE?',
      a: 'Está topada en el 10% de tu renta bruta mensual: sobre una renta de un millón y medio, la cuota máxima es de 150.000 pesos al mes. Lo importante es que la cuota se ajusta a lo que ganas, así que funciona como un seguro si te va mal al egresar. La contracara es que una cuota baja alarga el plazo y, como el saldo sigue devengando interés, terminas pagando más en total.',
    },
    {
      q: '¿Qué es el FES y cuándo empieza?',
      a: 'El Financiamiento para la Educación Superior es un proyecto de ley que reorganiza las deudas educativas existentes, con una condonación inicial y luego un esquema de pago contingente al ingreso. Sigue en tramitación legislativa: no es derecho vigente. Cualquier cifra que veas hoy, incluida la de esta página, es una estimación basada en la fórmula que publicó el Ministerio de Educación, y puede cambiar con el texto que finalmente se apruebe.',
    },
    {
      q: '¿Cómo se calcula la condonación inicial del FES?',
      a: `Con una base en UF según tu perfil, multiplicada por un factor que premia las cuotas ya pagadas. Las bases publicadas son ${FES.baseUf.noTituladoAlDia} UF sin título y al día, ${FES.baseUf.tituladoAlDia} UF titulado y al día, ${FES.baseUf.noTituladoMoroso} UF sin título y en mora, y ${FES.baseUf.tituladoMoroso} UF titulado y en mora. El factor es las cuotas pagadas divididas por las cuotas totales, más uno. Después, sobre el saldo que queda, pagando el ${Math.round(FES.pagoAnticipado.pagoRequeridoPct * 100)}% en hasta ${FES.pagoAnticipado.cuotasMax} cuotas se condona el ${Math.round(FES.pagoAnticipado.condonacionPct * 100)}% restante.`,
    },
    {
      q: '¿Cómo se convierte mi promedio en puntaje NEM?',
      a: 'Con las tablas oficiales del DEMRE, que llevan el promedio de 4,0 a 7,0 a una escala de 100 a 1000 puntos, con un paso de 0,01 en el promedio. Hay tres tablas distintas: la del grupo A para la enseñanza humanístico-científica diurna, la del grupo B para la de adultos, y la del grupo C para la técnico-profesional. La conversión no es lineal: el mismo décimo de nota vale distinta cantidad de puntos según en qué parte de la escala estés.',
    },
    {
      q: '¿Para qué sirve el puntaje ranking?',
      a: 'Para premiar el rendimiento relativo dentro de tu propio colegio, no en abstracto. Se compara tu desempeño con el de las tres generaciones anteriores del establecimiento: si estás por encima del promedio histórico, el ranking te da puntaje por encima de tu NEM, y llega a 1000 si igualas el mejor promedio histórico. Nunca es menor que tu NEM. El cálculo oficial se hace nivel por nivel, así que una estimación agregada como la de esta página puede diferir.',
    },
    {
      q: '¿Cuánto ahorro con la TNE?',
      a: 'La Tarjeta Nacional Estudiantil te deja pagar un tercio de la tarifa adulto, o sea que ahorras dos tercios en cada viaje. Sobre dos viajes por día hábil, el ahorro mensual es del orden de dos tercios de lo que gastaría un adulto haciendo lo mismo. Como las tarifas cambian mucho por ciudad y por sistema de transporte, esta página te pide la tarifa real de tu caso en vez de suponerla.',
    },
    {
      q: 'Se me bloqueó la TNE. ¿Qué hago?',
      a: 'Hay que revalidarla acreditando la matrícula vigente, en los operativos de JUNAEB o en los puntos habilitados. Mientras esté bloqueada pagas tarifa adulto completa, y usarla igual expone a sanción además del cobro del viaje. La revalidación es anual: conviene hacerla al inicio del año escolar y no cuando la tarjeta ya dejó de funcionar.',
    },
    {
      q: '¿Conviene el CAE o un crédito bancario?',
      a: 'El CAE tiene dos ventajas difíciles de igualar: una tasa muy por debajo de la de un crédito de consumo y una cuota topada en el 10% de tu renta, que funciona como seguro si te va mal al egresar. Un crédito bancario suele tener tasa bastante mayor y cuota fija que no se ajusta a lo que ganes. Dicho eso, la comparación honesta incluye antes revisar las becas de arancel del Mineduc, que no se devuelven, y la gratuidad si tu decil la habilita.',
    },
  ],

  sources: [
    {
      name: 'Ley 21.091 sobre Educación Superior — gratuidad y cobro tras exceder la duración formal',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1118991',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Beneficios Estudiantiles Mineduc — gratuidad, aranceles regulados y becas',
      url: 'https://portal.beneficiosestudiantiles.cl/gratuidad',
      publisher: 'Ministerio de Educación',
    },
    {
      name: 'Mineduc — FES, plan de reorganización de deudas educativas',
      url: 'https://fes.mineduc.cl/plan-de-reorganizacion.html',
      publisher: 'Ministerio de Educación',
    },
    {
      name: 'Ingresa — Crédito con Aval del Estado: condiciones, tasa y tope de cuota',
      url: 'https://portal.ingresa.cl/',
      publisher: 'Comisión Administradora del Sistema de Créditos para Estudios Superiores',
    },
    {
      name: 'DEMRE — tablas de transformación de notas a puntaje NEM y cálculo del ranking',
      url: 'https://demre.cl/paes/factores-seleccion/tabla-transformacion-nem-grupo-a',
      publisher: 'DEMRE, Universidad de Chile',
    },
    {
      name: 'JUNAEB — Tarjeta Nacional Estudiantil: revalidación y uso',
      url: 'https://www.junaeb.cl/tarjeta-nacional-estudiantil',
      publisher: 'Junta Nacional de Auxilio Escolar y Becas',
    },
    {
      name: 'Ministerio de Transportes y Telecomunicaciones — tarifas y rebaja estudiantil',
      url: 'https://www.mtt.gob.cl/',
      publisher: 'Ministerio de Transportes y Telecomunicaciones',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-gratuidad-educacion-superior-chile-deciles-1-6',
    '/calculadora-mensualidad-universidad-privada-chile-uc-uss-uss',
    '/calculadora-credito-aval-cae-chile-deuda-final-promedio',
    '/calculadora-condonacion-cae-fes-chile-2026',
    '/calculadora-nem-ranking-puntaje-demre-chile-2026',
    '/calculadora-pase-escolar-tne-chile-precio-2026-recargo',
  ],

  lastReviewed: '2026-07-28',
};
