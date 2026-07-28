import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuáles son mis días fértiles?"
 *
 * Arquetipo RAMIFICADO. Absorbe 7 calculadoras sueltas de fertilidad,
 * ovulación y datación de la concepción (ver `replaces`). Toda la lógica se
 * reimplementa en el compute() de src/pages/embarazo/dias-fertiles.astro con
 * los mismos números de las fórmulas originales.
 *
 * SILO: comparte /embarazo con el hub "¿De cuántas semanas estoy?"
 * (src/lib/hubs/semanas-embarazo.ts). NO se pisan:
 *   - `/embarazo/semanas` responde "ya estoy embarazada, ¿de cuánto?".
 *   - este hub responde lo de ANTES: cuándo puedo quedar embarazada y, si ya
 *     pasó, en qué día del ciclo fue la concepción.
 * Por eso acá no hay tamaño del bebé, ni trimestres, ni calendario de
 * ecografías: eso vive en el otro hub y se linkea, no se duplica.
 *
 * ⚠️ YMYL — SALUD. El disclaimer sale de src/lib/disclaimers.ts: el dominio
 * 'health' ('Resultado orientativo: no reemplaza diagnóstico…') más el
 * override ES de 'calculadora-ovulacion-dias-fertiles' ('Estimación
 * estadística, no un método anticonceptivo ni diagnóstico…'). Los dos van
 * juntos en `fineprint` y el de salud es el PRIMER `warn` de cada rama.
 * Además, en cada rama se dice explícitamente que esto NO es un método
 * anticonceptivo: el método del ritmo/calendario falla en torno al 24% de las
 * usuarias en el primer año de uso típico (Trussell, Contraception 2011).
 * No aflojar ese texto ni sacarlo del fold.
 */
export const hub: HubData = {
  slug: 'embarazo/dias-fertiles',
  title: '¿Cuáles son mis días fértiles? — Calculadora de ovulación 2026',
  description:
    'Calculá tu ventana fértil y el día de ovulación según tu ciclo, tengas ciclos regulares o irregulares. Datá la concepción desde la FUM o la fecha probable de parto y mirá tus probabilidades reales según la edad. No es un método anticonceptivo.',
  silo: 'Embarazo',
  siloHref: '/embarazo',

  eyebrow: 'Guía y estimación de fertilidad',
  h1: '¿Cuáles son mis días fértiles?',
  lede:
    'La ventana fértil son los 5 días previos a la ovulación más el día de la ovulación: seis días en total, porque los espermatozoides sobreviven hasta 5 días y el óvulo apenas 24 horas. Partimos del caso más común —ciclo regular— y lo ajustás con tus datos.',
  stamps: [
    'Actualizado 27-07-2026',
    'Criterio OMS / ACOG · regla del día 14',
    '7 calculadoras adentro',
    'No es un método anticonceptivo',
  ],

  resultLabel: 'Tu ventana fértil estimada',

  cases: {
    title: '¿Qué querés averiguar?',
    intro:
      'Arrancamos por el ciclo regular, que es el caso más frecuente. Si tus ciclos varían, si querés datar una concepción que ya ocurrió o si te interesa la probabilidad según la edad, cambiá de rama acá.',
    items: [
      {
        id: 'regular',
        label: 'Tengo ciclos regulares',
        hint: 'Ciclos parejos, mes a mes',
        answer:
          'Con ciclos regulares ovulás 14 días antes de la próxima menstruación y sos fértil los 5 días previos más ese día.',
        yes: [
          'Día exacto de ovulación estimado: primer día de tu última menstruación + (duración del ciclo − 14)',
          'Ventana fértil de 6 días: los 5 anteriores a la ovulación más el día de la ovulación',
          'En qué día de tu ciclo estás hoy y en qué fase (menstrual, folicular, fértil o lútea)',
          'Fecha de tu próxima menstruación y de los tres ciclos siguientes',
          'Probabilidad de embarazo por relación en cada día de la ventana',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Esto NO es un método anticonceptivo. El método del ritmo o del calendario falla en cerca del 24% de las usuarias durante el primer año de uso típico: si estás evitando un embarazo, usá un método de eficacia probada.',
          'La regla del día 14 asume una fase lútea fija de 14 días. En la vida real la ovulación se corre por estrés, viajes, enfermedad, lactancia o cambios de peso',
          'Un solo ciclo raro no invalida nada, pero si tus ciclos varían más de 7 u 8 días entre el más corto y el más largo, usá la rama de ciclo irregular',
        ],
        plazo:
          'la relación más fértil es la de los 2 días previos a ovular y la del día mismo: si vas por test de ovulación, empezá a testear 3 o 4 días antes de la fecha estimada.',
      },
      {
        id: 'irregular',
        label: 'Mis ciclos son irregulares',
        hint: 'Método del calendario (Ogino-Knaus)',
        answer:
          'Con ciclos irregulares la ventana fértil no es un día: es un rango que sale de tu ciclo más corto y tu ciclo más largo.',
        yes: [
          'Primer día potencialmente fértil: tu ciclo MÁS CORTO de los últimos 6 a 12 meses menos 18 días',
          'Último día potencialmente fértil: tu ciclo MÁS LARGO menos 11 días',
          'La ventana ampliada que cubre toda la incertidumbre de tus ciclos',
          'La ovulación más temprana y la más tardía posibles según ese rango',
          'Cuántos días varían tus ciclos entre sí, que es la medida real de la irregularidad',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Esto NO es un método anticonceptivo. En ciclos irregulares el método del calendario es todavía menos confiable que el ~24% de fallo del uso típico: nunca lo uses para evitar un embarazo.',
          'Ciclos de menos de 21 días o de más de 35, o variaciones de más de 8 días entre uno y otro, ameritan consulta: pueden indicar síndrome de ovario poliquístico, tiroides o baja reserva ovárica',
          'La ventana ampliada puede dar 10 días o más. Eso no significa que seas fértil todos esos días: significa que no sabemos cuál de ellos es el bueno',
          'Si buscás embarazo con ciclos muy irregulares, la ecografía folicular y los tests de LH orientan mucho mejor que el calendario',
        ],
        plazo:
          'anotá al menos 6 ciclos seguidos antes de confiar en el rango; con 12 meses de registro la ventana se afina bastante.',
      },
      {
        id: 'concepcion',
        label: 'Quiero saber cuándo fue la concepción',
        hint: 'Desde la FUM o desde la fecha probable de parto',
        answer:
          'La concepción se data hacia atrás: son 266 días antes de la fecha probable de parto, o el día de ovulación contado desde tu última menstruación.',
        yes: [
          'Fecha probable de concepción con una ventana de más o menos 2 días',
          'Día de tu ciclo en el que ocurrió esa ovulación, ajustado a la duración real de tu ciclo',
          'Fecha probable de parto y edad gestacional de hoy, para cruzar con tu control',
          'Ventana de implantación del embrión: de 6 a 12 días después de la ovulación, con pico al día 9',
          'Desde qué día un test de embarazo deja de dar falso negativo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La fecha de concepción NO es necesariamente el día de la relación sexual: los espermatozoides sobreviven hasta 5 días, así que la relación pudo ser hasta 5 días antes',
          'Este cálculo no sirve como prueba de paternidad ni como dato legal. La única prueba es un estudio de ADN',
          'Un test hecho antes de la implantación da negativo aunque haya embarazo: no es un resultado, es una prueba hecha demasiado temprano',
          'Si ya sabés de cuántas semanas estás y querés el detalle del embarazo, eso se calcula en el hub de semanas de embarazo, no acá',
        ],
        plazo:
          'la ecografía de las semanas 11 a 13+6 es la que fija la edad gestacional definitiva; después de las 22 semanas ya no se recalcula.',
      },
      {
        id: 'edad',
        label: 'Quiero saber mi probabilidad según la edad',
        hint: 'Fecundabilidad por ciclo y en 12 meses',
        answer:
          'La edad es el factor que más pesa: la probabilidad de embarazo por ciclo cae de cerca del 25% antes de los 25 años a menos del 5% pasados los 41.',
        yes: [
          'Probabilidad de embarazo por ciclo (fecundabilidad mensual) a tu edad',
          'Probabilidad acumulada de lograrlo dentro de los 12 meses de búsqueda',
          'Cuántos meses de búsqueda son estadísticamente esperables antes de consultar',
          'Riesgo de aborto espontáneo y probabilidad de trisomía 21 al nacer por edad materna',
          'El factor masculino: motilidad esperada y fragmentación del ADN espermático por edad del varón',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Son estadísticas de población, no un pronóstico personal: hay mujeres de 40 que conciben en el primer ciclo y de 28 que necesitan tratamiento',
          'Las cifras de trisomía 21 y aborto son probabilidades poblacionales, NO un diagnóstico. Lo que diagnostica es el NIPT o un estudio invasivo indicado por tu obstetra',
          'La recomendación estándar es consultar tras 12 meses de búsqueda sin éxito, o tras 6 meses si la mujer tiene 35 años o más',
          'Ningún número de esta pantalla evalúa tu reserva ovárica ni la calidad seminal: eso lo dicen una AMH, una ecografía de recuento folicular y un espermograma',
        ],
        plazo:
          'consulta a los 12 meses de búsqueda; a partir de los 35 años, a los 6 meses; a partir de los 40, sin esperar.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Con la fecha de tu última menstruación y la duración de tu ciclo alcanza para las dos primeras ramas. Los demás campos sólo se usan en la rama que los pide.',
  fields: [
    { id: 'fum', label: 'Primer día de tu última menstruación', type: 'date', value: '2026-07-05' },
    {
      id: 'ciclo',
      label: 'Duración de tu ciclo (días)',
      type: 'number',
      min: 21,
      max: 45,
      value: 28,
      help: 'Del primer día de una menstruación al primer día de la siguiente.',
    },
    {
      id: 'cicloCorto',
      label: 'Tu ciclo más corto de los últimos 6 meses',
      type: 'number',
      min: 21,
      max: 45,
      value: 25,
      help: 'Sólo se usa en la rama de ciclos irregulares.',
    },
    {
      id: 'cicloLargo',
      label: 'Tu ciclo más largo de los últimos 6 meses',
      type: 'number',
      min: 21,
      max: 60,
      value: 34,
      help: 'Sólo se usa en la rama de ciclos irregulares.',
    },
    {
      id: 'tipoRef',
      label: 'Para datar la concepción, ¿qué fecha tenés?',
      type: 'select',
      value: 'fum',
      options: [
        { value: 'fum', label: 'La fecha de mi última menstruación (la de arriba)' },
        { value: 'fpp', label: 'La fecha probable de parto que me dieron' },
      ],
    },
    {
      id: 'fpp',
      label: 'Fecha probable de parto',
      type: 'date',
      value: '2027-04-11',
      help: 'Sólo se usa si elegiste datar desde la FPP.',
    },
    { id: 'edadMujer', label: 'Tu edad', type: 'number', min: 18, max: 50, value: 32 },
    {
      id: 'edadVaron',
      label: 'Edad de tu pareja varón (si corresponde)',
      type: 'number',
      min: 18,
      max: 60,
      value: 34,
      help: 'Sólo se usa en la rama de probabilidad por edad.',
    },
  ],
  fineprint:
    'Estimación estadística, no un método anticonceptivo ni diagnóstico. Consultá a un profesional si buscás o evitás un embarazo. Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional.',

  chart: {
    type: 'timeline',
    title: 'Tu ciclo completo y dónde cae la ventana fértil',
    caption:
      'La línea es un ciclo entero partido en sus cuatro fases: menstrual, folicular, la ventana fértil de 6 días (los 5 previos a la ovulación más el día de ovular) y la fase lútea. El marcador muestra en qué día del ciclo estás hoy.',
    bands: [
      { label: 'Menstruación', from: 0, to: 18, tone: 'bad' },
      { label: 'Folicular', from: 18, to: 32, tone: 'neutral' },
      { label: 'Ventana fértil', from: 32, to: 54, tone: 'good' },
      { label: 'Lútea', from: 54, to: 100, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu fertilidad en números',
  breakdownIntro:
    'Cada fila muestra su unidad al lado del número: días, horas, porcentajes o días del ciclo. Ningún valor de este hub es dinero.',

  faq: [
    {
      q: '¿Cuáles son exactamente los días fértiles del ciclo?',
      a: 'Son seis: los cinco días previos a la ovulación más el día de la ovulación. El límite lo pone la biología: los espermatozoides sobreviven hasta 5 días dentro del aparato reproductor femenino, mientras que el óvulo vive apenas 12 a 24 horas después de liberarse. En un ciclo regular de 28 días esa ventana cae aproximadamente entre el día 9 y el día 15, contando desde el primer día de la menstruación.',
    },
    {
      q: '¿Cómo se calcula el día de ovulación?',
      a: 'Se resta 14 al largo de tu ciclo y se cuenta desde el primer día de tu última menstruación. En un ciclo de 28 días la ovulación cae el día 14; en uno de 32, el día 18; en uno de 24, el día 10. El número 14 no es la mitad del ciclo: es la duración de la fase lútea, que es la parte estable del ciclo en la mayoría de las mujeres.',
    },
    {
      q: '¿Puedo usar esto como método anticonceptivo?',
      a: 'No, y es la advertencia más importante de esta página. El método del ritmo o del calendario falla en alrededor del 24% de las usuarias durante el primer año de uso típico, es decir que casi una de cada cuatro queda embarazada igual. La ovulación se corre por estrés, enfermedad, viajes o cambios de peso, y ningún calendario predice ese corrimiento. Si estás evitando un embarazo, usá un método de eficacia probada y consultalo con tu ginecóloga.',
    },
    {
      q: '¿Qué hago si mis ciclos son irregulares?',
      a: 'Usá el método del calendario ampliado: anotá tus ciclos durante 6 a 12 meses, restale 18 días al más corto para saber cuándo empieza tu ventana y 11 días al más largo para saber cuándo termina. Vas a obtener un rango amplio, de 10 días o más, que refleja la incertidumbre real. Si la diferencia entre tu ciclo más corto y el más largo supera los 8 días, o si tenés ciclos de menos de 21 o más de 35, conviene una consulta ginecológica.',
    },
    {
      q: '¿Cómo sé cuándo fue la concepción?',
      a: 'Hay dos caminos. Desde la fecha probable de parto: la concepción ocurrió 266 días antes, porque el embarazo dura 38 semanas desde la fecundación y 40 desde la última menstruación. Desde tu última menstruación: la concepción coincide con la ovulación, o sea el día del ciclo que resulta de restarle 14 a su duración. En ambos casos la ventana real es de más o menos 2 días, y la relación sexual pudo haber sido hasta 5 días antes de la fecundación.',
    },
    {
      q: '¿Cuándo se implanta el embrión y desde cuándo da positivo un test?',
      a: 'La implantación ocurre entre 6 y 12 días después de la ovulación, con pico alrededor del día 9. Recién después de implantarse el embrión empieza a producir hCG, la hormona que detectan los tests, así que un test hecho antes de eso da negativo aunque haya embarazo. En general un test de orina es confiable a partir de los 14 días posteriores a la ovulación, es decir el día del atraso.',
    },
    {
      q: '¿Cuánta probabilidad de embarazo hay por ciclo?',
      a: 'Con relaciones en la ventana fértil, una pareja sin problemas de fertilidad tiene alrededor de un 25% de probabilidad por ciclo antes de los 25 años, cerca de 18% entre los 30 y los 34, alrededor de 13% entre los 35 y los 37, y menos del 5% pasados los 41. Acumulado en 12 meses de búsqueda, eso da entre un 85% y un 88% antes de los 30 y en torno al 25% a los 42.',
    },
    {
      q: '¿La edad del varón también influye?',
      a: 'Sí, aunque menos abruptamente. Después de los 40 la motilidad espermática baja hacia el 40-45% y la fragmentación del ADN sube al 25-30%, y a partir de los 45 la motilidad ronda el 35% con fragmentación del 30-40%. Eso alarga el tiempo promedio hasta el embarazo y aumenta la tasa de aborto espontáneo y de mutaciones de novo. Si llevan más de seis meses buscando y el varón supera los 40, pedí un espermograma con test de fragmentación.',
    },
    {
      q: '¿Cuándo tengo que consultar por dificultad para embarazarme?',
      a: 'La pauta habitual es consultar tras 12 meses de búsqueda sin embarazo si la mujer tiene menos de 35 años, y tras 6 meses si tiene 35 o más. A partir de los 40 años conviene la consulta sin esperar. También hay que consultar sin plazo si hay ciclos ausentes o muy irregulares, endometriosis conocida, cirugías pélvicas previas, tratamientos oncológicos o un espermograma alterado.',
    },
    {
      q: '¿En qué se diferencia este cálculo del de semanas de embarazo?',
      a: 'Este responde lo de antes: cuáles son tus días fértiles y, si el embarazo ya empezó, en qué día ocurrió la concepción. El cálculo de semanas de embarazo responde lo de después: de cuántas semanas estás, en qué trimestre vas y cuándo es la fecha probable de parto. Si ya te confirmaron el embarazo, ese es el que te sirve.',
    },
    {
      q: '¿Los tests de ovulación son más confiables que el calendario?',
      a: 'Sí. Los tests de LH detectan el pico hormonal que precede en 24 a 36 horas a la ovulación, así que avisan de un evento real en vez de proyectar un promedio. El calendario sólo sirve para saber cuándo empezar a testear: de tres a cuatro días antes de la fecha estimada. La temperatura basal, en cambio, confirma la ovulación después de que pasó, así que sirve para registrar patrones pero no para elegir el día.',
    },
  ],

  sources: [
    {
      name: 'The timing of the "fertile window" in the menstrual cycle: day-specific estimates',
      url: 'https://www.bmj.com/content/321/7271/1259',
      publisher: 'BMJ (Wilcox, Dunson & Baird)',
      date: '2000',
    },
    {
      name: 'Contraceptive failure in the United States — tasas de fallo del método del calendario en uso típico',
      url: 'https://www.contraceptionjournal.org/article/S0010-7824(11)00025-1/fulltext',
      publisher: 'Contraception (Trussell)',
      date: '2011',
    },
    {
      name: 'Optimizing natural fertility: a committee opinion',
      url: 'https://www.asrm.org/practice-guidance/practice-committee-documents/optimizing-natural-fertility-a-committee-opinion-2021/',
      publisher: 'American Society for Reproductive Medicine (ASRM)',
      date: '2022',
    },
    {
      name: 'Female age-related fertility decline — Committee Opinion 589',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2014/03/female-age-related-fertility-decline',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2014, reafirmado 2020',
    },
    {
      name: 'Methods for Estimating the Due Date — Committee Opinion 700',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2017',
    },
    {
      name: 'Revised estimates of the maternal age specific live birth prevalence of Down syndrome',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12036305/',
      publisher: 'Journal of Medical Screening (Morris, Mutton & Alberman)',
      date: '2002',
    },
    {
      name: 'Salud sexual y reproductiva — recomendaciones de atención preconcepcional',
      url: 'https://www.argentina.gob.ar/salud/saludsexual',
      publisher: 'Ministerio de Salud de la Nación (Argentina)',
    },
  ],

  replaces: [
    '/calculadora-ovulacion-dias-fertiles',
    '/calculadora-ciclo-menstrual',
    '/calculadora-fertilidad-masculina-edad',
    '/calculadora-riesgo-embarazo-edad',
    '/calculadora-fecha-probable-concepcion',
    '/calculadora-fecha-concepcion-desde-fpp',
    '/calculadora-implantacion-embrion',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-dias-minimos-test-embarazo-positivo',
    '/calculadora-test-embarazo-cuando',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros fisiológicos de la ventana fértil.
 * Vienen de la fórmula `ovulacion.ts` que este hub absorbe: ovulación en
 * ciclo − 14, ventana de −5 a +1 día.
 */
export const CICLO = {
  /** Días que se restan al largo del ciclo para ubicar la ovulación (fase lútea). */
  faseLutea: 14,
  /** Días fértiles previos a la ovulación (supervivencia espermática). */
  diasPrevios: 5,
  /** Días fértiles posteriores a la ovulación (vida del óvulo). */
  diasPosteriores: 1,
  /** Duración típica del sangrado, para dibujar la fase menstrual. */
  sangrado: 5,
  /** Fallo del método del calendario en uso típico, primer año (Trussell 2011). */
  falloMetodoRitmo: 24,
  /** Ajustes del método del calendario / Ogino-Knaus para ciclos irregulares. */
  ogino: { restaCorto: 18, restaLargo: 11 },
  /** Días de la concepción al parto y de la FUM al parto (ACOG 700). */
  diasConcepcionParto: 266,
  diasFumParto: 280,
  /** Margen de la ventana de concepción, en días. */
  margenConcepcion: 2,
  /** Implantación en días post-ovulación (fórmula implantacion-embrion.ts). */
  implantacion: { inicio: 6, pico: 9, fin: 12, testDesdePico: 5 },
};

/**
 * Probabilidad de embarazo por día de la ventana fértil, tomando el día de
 * ovulación como 0 (Wilcox, BMJ 2000). Se usa para armar el desglose.
 */
export const PROB_POR_DIA: Array<{ offset: number; label: string; pct: number }> = [
  { offset: -5, label: 'Cinco días antes de ovular', pct: 10 },
  { offset: -4, label: 'Cuatro días antes de ovular', pct: 16 },
  { offset: -3, label: 'Tres días antes de ovular', pct: 14 },
  { offset: -2, label: 'Dos días antes de ovular', pct: 27 },
  { offset: -1, label: 'Un día antes de ovular', pct: 31 },
  { offset: 0, label: 'El día de la ovulación', pct: 33 },
  { offset: 1, label: 'Un día después de ovular', pct: 8 },
];

/**
 * Fertilidad femenina por edad. `porCiclo` es la fecundabilidad mensual y
 * `docemeses` la probabilidad acumulada tras un año de búsqueda (ASRM/ACOG).
 * `aborto` es el punto medio del rango de aborto espontáneo que usa la
 * fórmula `riesgo-embarazo-edad.ts`.
 */
export const EDAD_MUJER: Array<{
  hasta: number;
  porCiclo: number;
  doceMeses: number;
  aborto: number;
  abortoTxt: string;
  etiqueta: string;
}> = [
  { hasta: 24, porCiclo: 25, doceMeses: 88, aborto: 10, abortoTxt: '~10%', etiqueta: 'Fertilidad en su pico' },
  { hasta: 29, porCiclo: 22, doceMeses: 85, aborto: 12, abortoTxt: '~12%', etiqueta: 'Fertilidad alta' },
  { hasta: 34, porCiclo: 18, doceMeses: 75, aborto: 15, abortoTxt: '~15%', etiqueta: 'Descenso leve' },
  { hasta: 37, porCiclo: 13, doceMeses: 60, aborto: 23, abortoTxt: '~20-25%', etiqueta: 'Descenso marcado' },
  { hasta: 40, porCiclo: 8, doceMeses: 45, aborto: 23, abortoTxt: '~20-25%', etiqueta: 'Descenso marcado' },
  { hasta: 42, porCiclo: 5, doceMeses: 25, aborto: 42, abortoTxt: '~35-50%', etiqueta: 'Fertilidad baja' },
  { hasta: 50, porCiclo: 2, doceMeses: 10, aborto: 62, abortoTxt: '~50-75%', etiqueta: 'Fertilidad muy baja' },
];

/**
 * Probabilidad de trisomía 21 al nacer, expresada como "1 en N" por edad
 * materna. Tabla idéntica a la de `riesgo-embarazo-edad.ts` (Morris 2002 /
 * Hook 1981). El riesgo cromosómico total se estima en N ÷ 1,5.
 */
export const RIESGO_DOWN: Record<number, number> = {
  18: 1500, 19: 1500, 20: 1500, 21: 1500, 22: 1450, 23: 1400, 24: 1350,
  25: 1250, 26: 1200, 27: 1100, 28: 1000, 29: 950, 30: 900, 31: 800,
  32: 720, 33: 570, 34: 450, 35: 350, 36: 280, 37: 240, 38: 175,
  39: 135, 40: 100, 41: 75, 42: 55, 43: 40, 44: 30, 45: 25,
  46: 20, 47: 15, 48: 12, 49: 10, 50: 8,
};

/**
 * Factor masculino por edad. Motilidad y fragmentación del ADN salen de los
 * tramos de la fórmula `fertilidad-masculina-edad.ts`; `meses` es el punto
 * medio del rango de tiempo a la concepción que declara cada tramo.
 */
export const EDAD_VARON: Array<{
  hasta: number;
  motilidad: number;
  fragmentacion: number;
  meses: number;
  calidad: string;
}> = [
  { hasta: 29, motilidad: 60, fragmentacion: 15, meses: 4.5, calidad: 'Óptima' },
  { hasta: 34, motilidad: 55, fragmentacion: 17, meses: 4.5, calidad: 'Muy buena' },
  { hasta: 39, motilidad: 50, fragmentacion: 20, meses: 7.5, calidad: 'Buena con descenso leve' },
  { hasta: 44, motilidad: 43, fragmentacion: 28, meses: 9, calidad: 'Descenso moderado' },
  { hasta: 60, motilidad: 35, fragmentacion: 35, meses: 15, calidad: 'Descenso significativo' },
];
