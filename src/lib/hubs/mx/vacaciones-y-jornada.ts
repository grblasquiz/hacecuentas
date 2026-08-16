import type { HubData } from '../types';
import { MEXICO_2026, JORNADA_40H_CALENDARIO } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuántos días de vacaciones me tocan y cuánto valen mis horas extra?"
 *
 * Fusiona las cuatro calculadoras de tiempo de trabajo: los días de vacaciones
 * por antigüedad (LFT Art. 76 tras la reforma de vacaciones dignas), el pago de
 * vacaciones con su prima (Art. 80), el tiempo extraordinario doble y triple
 * (Arts. 66-68) y el calendario de la reducción gradual de la jornada.
 *
 * Constantes desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Vacaciones dignas: días por año de servicio (LFT Art. 76, reforma vigente desde 2023). */
export const VACACIONES_MX = {
  porAnio: MEXICO_2026.lft.vacacionesPorAnio,
  incrementoQuinquenal: MEXICO_2026.lft.vacacionesIncrementoQuinquenal,
  primaVacacional: MEXICO_2026.lft.primaVacacional,
};

/** Tiempo extraordinario (LFT Arts. 66, 67 y 68). */
export const HORAS_EXTRAS_MX = MEXICO_2026.lft.horasExtras;

/** Recargos por descanso y festivo laborados (LFT Arts. 73 y 75). */
export const DESCANSOS_MX = {
  descansoLaboradoExtra: MEXICO_2026.lft.descansoLaboradoExtra,
  festivoLaboradoExtra: MEXICO_2026.lft.festivoLaboradoExtra,
};

/** Calendario de la jornada máxima legal por año (reforma DOF 2026). */
export const JORNADA_MX = JORNADA_40H_CALENDARIO;

/** Factor de mensualización CONASAMI/IMSS: 30,4 días. */
export const FACTOR_MENSUAL_MX = MEXICO_2026.salarioMinimo.factorMensual;

/** Exención de ISR de la prima vacacional, en UMA diarias (LISR Art. 93). */
export const EXENCION_PRIMA_VAC_UMAS = MEXICO_2026.exencionesIsrUmas.primaVacacional;
export const UMA_DIARIA_MX = MEXICO_2026.uma.diaria;

export const hub: HubData = {
  slug: 'mx/trabajo/vacaciones-y-jornada',
  title: 'Vacaciones y horas extra México 2026: días, pago y jornada',
  description:
    'Cuántos días de vacaciones te tocan en México 2026 con la reforma de vacaciones dignas, prima vacacional, horas extra dobles y triples y jornada de 40 h.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · tiempo de trabajo',
  h1: '¿Cuántos días de vacaciones me tocan en México y cuánto valen mis horas extra?',
  lede:
    'La reforma de vacaciones dignas subió el primer año a 12 días y la reducción de jornada baja dos horas por año hasta llegar a 40 en 2030. Elige qué necesitas calcular y pon tu antigüedad y tu salario.',
  stamps: [
    'Vacaciones dignas · LFT Art. 76',
    'Prima vacacional 25% · Art. 80',
    'Tiempo extra doble y triple · Arts. 67-68',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿Qué necesitas calcular?',
    intro: 'Empezamos por los días de vacaciones, que es lo que más se consulta desde la reforma.',
    items: [
      {
        id: 'dias',
        label: 'Cuántos días de vacaciones me tocan',
        hint: 'Días por antigüedad con la tabla vigente de vacaciones dignas.',
        yes: [
          'Días de vacaciones del año que cumples, según el Art. 76 de la LFT reformado',
          'Doce días el primer año y dos más por cada año, hasta veinte en el quinto',
          'A partir del sexto año, veintidós días y dos más por cada quinquenio',
          'Los días proporcionales si aún no cumples el aniversario',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El derecho se genera al cumplir el aniversario laboral: antes del primer año solo hay proporcional en el finiquito',
          'Las vacaciones deben disfrutarse dentro de los seis meses siguientes al aniversario y prescriben al año',
          'La ley no permite pagar las vacaciones en lugar de disfrutarlas, salvo que termine la relación de trabajo',
        ],
        plazo: 'el patrón tiene que entregar cada año una constancia con tu antigüedad y los días que te corresponden.',
        answer:
          'Doce días el primer año, y suben de dos en dos hasta veinte en el quinto; después, veintidós y dos más por quinquenio.',
      },
      {
        id: 'pago',
        label: 'Cuánto cobro de vacaciones y prima vacacional',
        hint: 'El pago de los días de descanso más el 25% mínimo de prima.',
        yes: [
          'Salario de los días de vacaciones que te corresponden',
          'Prima vacacional del 25% como mínimo sobre esos días (LFT Art. 80)',
          'Parte exenta de ISR de la prima, medida en UMA (LISR Art. 93)',
          'Comparación entre lo que exige la ley y lo que te paga tu empresa si da más',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El 25% es el piso legal: muchos contratos colectivos pagan más y ese porcentaje se respeta',
          'La prima vacacional está exenta de ISR solo hasta 15 UMA diarias; el excedente se grava',
          'Si tu salario es variable, la base es el promedio de las percepciones del último año',
        ],
        plazo: 'la prima se paga junto con las vacaciones, no en diciembre.',
        answer:
          'Cobras el salario de tus días de vacaciones más una prima de al menos 25% sobre esos mismos días.',
      },
      {
        id: 'extras',
        label: 'Cuánto valen mis horas extra',
        hint: 'Primeras nueve semanales al doble, el resto al triple.',
        yes: [
          'Valor de tu hora ordinaria a partir de tu salario y tu jornada',
          'Primeras nueve horas extra de la semana pagadas al doble (LFT Art. 67)',
          'Horas que excedan esas nueve, pagadas al triple (LFT Art. 68)',
          'Aviso cuando superas el tope legal de nueve horas extra semanales',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Trabajar más de nueve horas extra por semana es ilegal aunque se paguen al triple (LFT Art. 66): el patrón puede ser sancionado por la STPS',
          'El tiempo extra hasta nueve horas semanales está exento de ISR en un 50% para quien gana el salario mínimo; arriba de eso las reglas cambian',
          'Un día de descanso o un festivo trabajado no es tiempo extra: se paga con salario doble adicional (Arts. 73 y 75)',
        ],
        plazo: 'el tiempo extra se paga en el mismo período de nómina en que se generó.',
        answer:
          'Las primeras nueve horas extra de la semana valen el doble de tu hora normal; de la décima en adelante, el triple.',
      },
      {
        id: 'jornada',
        label: 'Cuándo me baja la jornada a 40 horas',
        hint: 'Calendario gradual de reducción, año por año.',
        yes: [
          'Jornada máxima legal del año que elijas',
          'Cuántas horas se te acorta la semana respecto de lo que trabajas hoy',
          'Cuánto sube el valor de tu hora al mantenerse el salario',
          'El calendario completo hasta la meta de cuarenta horas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'En 2026 la jornada máxima sigue siendo de 48 horas semanales: la primera reducción real entra el 1 de enero de 2027',
          'La reducción no puede traducirse en menor salario ni en menos prestaciones',
          'Lo que trabajes por encima de la nueva jornada máxima pasa a contar como tiempo extraordinario',
        ],
        plazo: 'la jornada baja dos horas cada 1 de enero, de 2027 a 2030.',
        answer:
          'La jornada máxima baja a 46 horas en 2027, 44 en 2028, 42 en 2029 y 40 en 2030, sin bajar el sueldo.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro: 'En pesos mexicanos. Cada caso usa los campos que le sirven; los demás los ignora.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo bruto mensual (MXN)',
      prefix: '$',
      value: 15000,
      thousands: true,
      help: 'De aquí sale el salario diario y el valor de tu hora.',
    },
    {
      id: 'antiguedad',
      label: 'Años de antigüedad cumplidos',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Aniversarios cumplidos con el mismo patrón.',
    },
    {
      id: 'primaPct',
      label: 'Prima vacacional que paga tu empresa (%)',
      suffix: '%',
      type: 'number',
      value: 25,
      min: 25,
      max: 200,
      step: 5,
      help: 'El mínimo legal es 25%. Si tu contrato da más, ponlo aquí.',
    },
    {
      id: 'jornadaDiaria',
      label: 'Horas de tu jornada diaria',
      type: 'number',
      value: 8,
      min: 1,
      max: 12,
      step: 1,
      help: 'Se usa para calcular el valor de tu hora ordinaria.',
    },
    {
      id: 'horasExtra',
      label: 'Horas extra en la semana',
      type: 'number',
      value: 5,
      min: 0,
      max: 40,
      step: 1,
      help: 'Las primeras nueve van al doble; el resto, al triple.',
    },
    {
      id: 'horasSemana',
      label: 'Horas que trabajas por semana hoy',
      type: 'number',
      value: 48,
      min: 1,
      max: 48,
      step: 1,
      help: 'Para ver cuánto te acorta la semana la reducción de jornada.',
    },
    {
      id: 'anio',
      label: 'Año del calendario de jornada',
      type: 'select',
      value: '2027',
      options: Object.keys(JORNADA_40H_CALENDARIO).map((a) => ({
        value: a,
        label: `${a} — máximo ${JORNADA_40H_CALENDARIO[Number(a)]} h por semana`,
      })),
      help: 'La reducción arranca el 1 de enero de 2027.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Lo que te corresponde',
    caption: 'Compara los conceptos del caso que elegiste: días, pago de vacaciones, prima y tiempo extra.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuántos días de vacaciones me tocan en México?',
      a: 'Desde la reforma de vacaciones dignas, el primer año son 12 días y suben de dos en dos hasta llegar a 20 días en el quinto año. A partir del sexto año son 22 días y se agregan dos días por cada cinco años más de servicio, así que a los 11 años son 24 y a los 16 son 26. Todo eso son días naturales de vacaciones pagadas, no días hábiles.',
    },
    {
      q: '¿Desde cuándo aplica la reforma de vacaciones dignas?',
      a: 'Entró en vigor el 1 de enero de 2023 y se aplica a los aniversarios laborales que se cumplen desde esa fecha, incluidos los trabajadores que ya tenían antigüedad. No hay que renegociar el contrato: la ley se aplica sola, y si el contrato da más días que la ley, se respeta el más favorable.',
    },
    {
      q: '¿Qué pasa si todavía no cumplo un año?',
      a: 'El derecho a vacaciones nace al cumplir el aniversario. Si te vas antes, no las pierdes: en el finiquito se pagan proporcionales a los meses trabajados, junto con la parte proporcional del aguinaldo. Esa proporcional se calcula sobre los 12 días del primer año.',
    },
    {
      q: '¿Cómo se calcula la prima vacacional?',
      a: 'Es un porcentaje sobre el salario de los días de vacaciones que te corresponden, no sobre el sueldo anual. El mínimo legal es 25% (LFT Art. 80), así que con 12 días de vacaciones la prima equivale a 3 días de salario. Muchos contratos colectivos pagan porcentajes mayores y en ese caso manda el contrato.',
    },
    {
      q: '¿La prima vacacional paga ISR?',
      a: 'Solo parcialmente. La LISR exime la prima vacacional hasta el equivalente a 15 UMA diarias; lo que exceda ese monto se acumula a tus ingresos del mes y se grava con la tarifa del Art. 96. Como la UMA se actualiza cada año, el monto exento cambia junto con ella.',
    },
    {
      q: '¿Me pueden pagar las vacaciones en vez de dármelas?',
      a: 'No mientras siga vigente la relación de trabajo. Las vacaciones son un descanso obligatorio y la ley solo permite pagarlas en dinero cuando la relación termina y quedan días pendientes. Un acuerdo para "venderlas" no es válido y no libera al patrón de otorgarlas.',
    },
    {
      q: '¿Cuánto se paga una hora extra?',
      a: 'El valor de tu hora ordinaria sale de dividir tu salario diario entre las horas de tu jornada. Las primeras nueve horas extra de la semana se pagan al doble de ese valor y las que excedan de nueve, al triple. Ojo: el triple no es un permiso para trabajarlas, porque el Art. 66 fija el tope legal justo en nueve horas.',
    },
    {
      q: '¿Trabajar en domingo o en un día festivo cuenta como hora extra?',
      a: 'No, es otro concepto. Si trabajas tu día de descanso semanal, además del salario del día se paga un salario doble adicional (Art. 73), y lo mismo pasa con los festivos obligatorios (Art. 75). Trabajar en domingo cuando ese no es tu día de descanso genera la prima dominical del 25% (Art. 71), que es distinta y se acumula.',
    },
    {
      q: '¿Cuándo empieza la jornada de 40 horas?',
      a: 'La reducción es gradual y arranca el 1 de enero de 2027 con 46 horas semanales. Después baja a 44 en 2028, 42 en 2029 y 40 en 2030. Durante 2026 la jornada máxima legal sigue siendo de 48 horas: es el año de transición para que las empresas se preparen.',
    },
    {
      q: '¿Me pueden bajar el sueldo cuando baje la jornada?',
      a: 'No. La reforma establece expresamente que la reducción de la jornada no puede implicar disminución del salario ni de las prestaciones. En la práctica, el valor de tu hora sube: cobras lo mismo por menos horas trabajadas.',
    },
    {
      q: '¿Qué pasa con las horas que trabaje de más una vez que baje el tope?',
      a: 'Pasan a ser tiempo extraordinario y se pagan como tal. Si hoy trabajas 48 horas y en 2027 el tope baja a 46, esas dos horas dejan de ser jornada ordinaria: se pagan al doble mientras estén dentro de las primeras nueve horas extra de la semana.',
    },
    {
      q: '¿Cómo cuento la antigüedad si cambié de puesto dentro de la misma empresa?',
      a: 'La antigüedad se cuenta por la relación de trabajo con el patrón, no por el puesto. Cambiar de área, de categoría o de jefe no la reinicia. Sí puede haber discusión cuando cambia la razón social del empleador: en ese caso hay que revisar si hubo sustitución patronal, porque la sustitución conserva la antigüedad.',
    },
  ],

  sources: [
    {
      name: 'Ley Federal del Trabajo — vacaciones y prima vacacional (Arts. 76 y 80)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley Federal del Trabajo — jornada y tiempo extraordinario (Arts. 66, 67, 68, 71, 73 y 75)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Impuesto sobre la Renta — exenciones de prima vacacional (Art. 93)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Diario Oficial de la Federación — reducción gradual de la jornada laboral',
      url: 'https://www.dof.gob.mx/',
      publisher: 'DOF',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-vacaciones-dias-antiguedad-mexico',
    '/calculadora-vacaciones-mexico-2024-reforma-12-dias-incremento',
    '/calculadora-horas-extras-doble-triple-mexico',
    '/calculadora-jornada-40-horas-mexico-calendario-gradual-2027-2030',
  ],

  lastReviewed: '2026-08-16',
  locale: 'mx',
};
