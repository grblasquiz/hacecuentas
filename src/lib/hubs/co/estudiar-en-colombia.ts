import type { HubData } from '../types';
import { COLOMBIA_2026, LIBRETA_MILITAR_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Con qué puntaje entro, cuánto cuesta y cómo lo pago?"
 *
 * Absorbe seis calculadoras: Saber 11, pública vs privada, crédito ICETEX,
 * promedio de notas, edad escolar SIMAT y cuota de compensación militar.
 * Esta última entra sólo por URL: es el trámite típico del egresado del
 * colegio, pero no forma parte de ninguna de las cuentas del hub.
 *
 * Ponderación oficial del Saber 11 (ICFES): el puntaje global va de 0 a 500 y
 * sale de (3·Lectura Crítica + 3·Matemáticas + 3·Sociales y Ciudadanas +
 * 3·Ciencias Naturales + 1·Inglés) ÷ 13 × 5. Cada prueba se reporta sobre 100
 * e Inglés pesa 1 mientras las otras cuatro pesan 3. Verificado contra
 * src/lib/formulas/puntaje-saber-11-icfes-colombia.ts: coincide exactamente.
 */

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** SMLMV vigente — Decreto 1469/2025. Referencia de costo de vida y de la libreta militar. */
export const SMLMV = COLOMBIA_2026.smlmv;

/** Ponderación oficial del puntaje global Saber 11. */
export const SABER11 = {
  pesos: { lectura: 3, matematicas: 3, sociales: 3, ciencias: 3, ingles: 1 },
  divisor: 13,
  escala: 5,
  maxPrueba: 100,
  maxGlobal: 500,
};

/**
 * Franjas de desempeño del puntaje global. Son una lectura de la distribución
 * nacional para orientar al usuario, NO cortes oficiales del ICFES ni puntajes
 * de corte de ninguna universidad: cada programa fija su propia ponderación.
 */
export const FRANJAS_SABER11 = [
  { label: 'Bajo', from: 0, to: 250 },
  { label: 'Medio', from: 250, to: 350 },
  { label: 'Alto', from: 350, to: 450 },
  { label: 'Superior', from: 450, to: 500 },
];

/**
 * Escala de notas colombiana. OJO: el Decreto 1290 de 2009 fijó una escala
 * NACIONAL cualitativa (desempeño superior, alto, básico y bajo) y dejó a cada
 * institución definir su escala numérica y su equivalencia. El 0 a 5 con 3,0
 * de mínimo aprobatorio es la convención abrumadoramente mayoritaria en
 * colegios y universidades, no una norma. Por eso el mínimo es editable.
 */
export const ESCALA_NOTAS = { min: 0, max: 5, aprueba: 3 };

/**
 * Edad mínima orientativa por grado, según la organización del sistema
 * educativo colombiano (Ley 115 de 1994 y Decreto 1075 de 2015). El SIMAT
 * registra la matrícula; la asignación final la hace la institución con su
 * secretaría de educación, que puede admitir por fuera del rango.
 */
export const EDADES_GRADO = [
  { grado: 'Prejardín y jardín', edad: 3 },
  { grado: 'Transición (grado 0)', edad: 5 },
  { grado: 'Básica primaria (1° a 5°)', edad: 6 },
  { grado: 'Básica secundaria (6° a 9°)', edad: 11 },
  { grado: 'Media (10° y 11°)', edad: 15 },
];

/** Semestres académicos al año y meses por semestre, para pasar de semestres a plazo. */
export const CALENDARIO = { semestresPorAnio: 2, mesesPorSemestre: 6 };

/**
 * Cuota de compensación militar — % del SMLMV según situación económica.
 * Absorbida sólo por URL: no participa de ninguna cuenta del hub.
 */
export const LIBRETA = LIBRETA_MILITAR_2026;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
slug: 'co/vida/estudiar-en-colombia',
  title: 'Estudiar en Colombia: puntaje ICFES, cuánto cuesta la carrera y cómo pagarla',
  description:
    'Calculá tu puntaje global del Saber 11 sobre 500, el costo total de la carrera entre matrícula y sostenimiento, la cuota real de un crédito ICETEX y el promedio ponderado de notas en escala 0 a 5.',
  silo: 'Vida',
siloHref: '/co/vida',
  locale: 'co',

  eyebrow: 'Colombia · ICFES, ICETEX y SIMAT',
  h1: '¿Con qué puntaje entro, cuánto cuesta la carrera y cómo la pago?',
  lede:
    'Las tres decisiones del final del colegio, en una sola cuenta: el puntaje global del Saber 11 con la ponderación oficial del ICFES, lo que cuesta de verdad una carrera cuando sumás el sostenimiento, y cuánto termina siendo la cuota del crédito después de graduarte. Con el promedio ponderado de notas de yapa.',
  stamps: [
    `Saber 11: 5 pruebas sobre ${SABER11.maxPrueba}, global sobre ${SABER11.maxGlobal}`,
    `Escala de notas ${ESCALA_NOTAS.min} a ${ESCALA_NOTAS.max}`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Resultado de tu caso',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro:
      'Las cuatro ramas usan tus mismos números. Arrancamos por la primera pregunta del calendario: el puntaje con el que aplicás.',
    items: [
      {
        id: 'publica',
        label: 'Universidad pública: ¿me alcanza el puntaje?',
        hint: 'Saber 11 · ponderación por programa',
        answer: `El puntaje global va de 0 a ${SABER11.maxGlobal} y sale de ponderar las 5 pruebas: Inglés pesa 1 y las otras cuatro pesan 3.`,
        yes: [
          'Los puntajes de las cinco pruebas del Saber 11, cada una en escala de 0 a 100',
          `La ponderación oficial: (3·Lectura Crítica + 3·Matemáticas + 3·Sociales y Ciudadanas + 3·Ciencias Naturales + 1·Inglés) ÷ ${SABER11.divisor} × ${SABER11.escala}`,
          'Qué prueba te conviene reforzar: subir un punto en una prueba de peso 3 vale el triple que subirlo en Inglés',
          'El promedio de notas del colegio, que varias universidades piden como requisito aparte',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El puntaje global no es el puntaje de admisión: cada universidad y cada programa arman su propia ponderación, y muchos le dan más peso a Matemáticas o a Lectura Crítica según la carrera',
          'Las franjas de desempeño que ves acá son una referencia de distribución, no cortes oficiales del ICFES ni puntajes de corte de ninguna universidad: los de corte cambian todos los semestres con la demanda',
          'Una universidad pública también cobra: la matrícula se liquida según tu situación socioeconómica, no siempre es gratis',
        ],
        plazo:
          'el Saber 11 se presenta en dos calendarios al año; revisá en el ICFES la fecha de inscripción de tu calendario antes de que cierre.',
      },
      {
        id: 'privada',
        label: 'Universidad privada: ¿cuánto cuesta en total?',
        hint: 'Matrícula por semestre + sostenimiento',
        answer:
          'El número que importa no es la matrícula del semestre: es matrícula por semestres, más el sostenimiento de todos esos meses.',
        yes: [
          'La matrícula de cada semestre, que suele subir todos los años por encima del IPC',
          'El sostenimiento mensual: arriendo o transporte, comida, materiales y salud',
          'La duración real del programa en semestres, contando prácticas y trabajo de grado',
          'Los derechos de grado y los semestres extra si perdés materias',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El sostenimiento suele ser la mitad o más del costo total y es el rubro que nadie proyecta: una carrera "barata" lejos de casa puede salir más cara que una cara al lado',
          'Esta cuenta usa la matrícula que vos cargás, sin proyectar aumentos: si querés el escenario real, cargá la matrícula promedio esperada, no la del primer semestre',
          'La calculadora vieja traía matrículas fijas por tipo de universidad (20, 10 y 6,5 millones) que eran estimaciones sin fuente y quedaban desactualizadas solas. Acá la ponés vos, con la cifra que te dio la universidad',
        ],
        plazo:
          'pedí el valor de matrícula del semestre entrante por escrito: el del año pasado casi nunca sirve para presupuestar.',
      },
      {
        id: 'icetex',
        label: 'Crédito ICETEX: ¿de cuánto me queda la cuota?',
        hint: 'Monto, tasa y plazo después de graduarte',
        answer:
          'Durante la carrera pagás poco o nada; la cuota real aparece cuando te gradúas y arranca la amortización.',
        yes: [
          'El capital: la parte de la matrícula que financiás, semestre a semestre',
          'La tasa efectiva anual de tu línea de crédito, que la fija el ICETEX y varía por línea y estrato',
          'El plazo de amortización, que en las líneas clásicas es del doble del tiempo que duró tu carrera',
          'Los intereses que corren durante los estudios y se suman al saldo si no los abonás en esa etapa',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No pudimos verificar contra una fuente viva la tasa vigente de cada línea del ICETEX, así que la tasa es un campo que cargás vos: pedila en la carta de aprobación de tu crédito y no la des por sentada',
          'La calculadora vieja tenía dos errores gruesos: repartía el crédito en tantos meses como el doble del número de SEMESTRES (una carrera de 10 semestres se pagaba en 20 meses, no en 120) y asignaba subsidios y tasas por estrato que no corresponden a ninguna línea real del ICETEX',
          'Un crédito en pesos con cuota fija se lleva una parte grande de tu primer sueldo: mirá la cuota contra el salario de enganche real de tu programa, no contra el promedio de la carrera',
        ],
        plazo:
          'el período de gracia termina al graduarte: pedí la simulación oficial de la cuota antes de firmar, con tu tasa y tu plazo.',
      },
      {
        id: 'colegio',
        label: 'Colegio: ¿en qué grado le corresponde entrar?',
        hint: 'Edad de ingreso por grado · matrícula en SIMAT',
        answer:
          'La edad orienta el grado, pero la asignación final la hace la institución con la secretaría de educación.',
        yes: [
          'La edad cumplida al momento de la matrícula',
          'La edad mínima orientativa del grado: transición desde los 5, primero desde los 6',
          'Los documentos del estudiante para el registro en SIMAT: documento de identidad, certificados de los grados cursados y afiliación en salud',
          'El grado que efectivamente cursó antes, que pesa más que la edad para la ubicación',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las edades de ingreso son orientativas: la secretaría puede admitir por fuera del rango, y para extraedad existen modelos flexibles que aceleran varios grados en un año',
          'Estar registrado en SIMAT es lo que garantiza el cupo oficial: si el colegio no hizo el registro, el cupo no existe aunque te hayan dicho que sí',
          'Este hub no calcula la cuota de compensación militar, que es otro trámite del egresado: se paga como porcentaje del salario mínimo según situación económica y hay exenciones',
        ],
        plazo:
          'los traslados y la matrícula ordinaria tienen ventana anual en cada secretaría: consultá el calendario de la tuya antes de mudarte a mitad de año.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Las cinco pruebas van en escala de 0 a 100 y la plata en pesos colombianos. Según la rama que elijas se usan unos campos u otros.',
  fields: [
    { id: 'lectura', label: 'Lectura Crítica (0 a 100)', type: 'number', value: 62, min: 0, max: 100, step: 1, help: 'Peso 3 en el global.' },
    { id: 'matematicas', label: 'Matemáticas (0 a 100)', type: 'number', value: 58, min: 0, max: 100, step: 1, help: 'Peso 3 en el global.' },
    { id: 'sociales', label: 'Sociales y Ciudadanas (0 a 100)', type: 'number', value: 55, min: 0, max: 100, step: 1, help: 'Peso 3 en el global.' },
    { id: 'ciencias', label: 'Ciencias Naturales (0 a 100)', type: 'number', value: 57, min: 0, max: 100, step: 1, help: 'Peso 3 en el global.' },
    { id: 'ingles', label: 'Inglés (0 a 100)', type: 'number', value: 50, min: 0, max: 100, step: 1, help: 'Peso 1: es la única prueba que pondera distinto.' },
    {
      id: 'notas',
      label: 'Tus notas del período, separadas por punto y coma',
      type: 'text',
      value: '4,2; 3,8; 4,5',
      help: `Escala ${ESCALA_NOTAS.min} a ${ESCALA_NOTAS.max}. Se promedian con peso igual y sirven para cualquiera de las ramas.`,
    },
    {
      id: 'matricula',
      label: 'Matrícula por semestre (COP)',
      prefix: '$',
      value: '8.500.000',
      thousands: true,
      help: 'La que te cotizó la universidad. En pública, el valor liquidado según tu situación socioeconómica.',
    },
    {
      id: 'semestres',
      label: 'Duración del programa en semestres',
      type: 'number',
      value: 10,
      min: 1,
      max: 20,
      step: 1,
      help: 'Contá prácticas y trabajo de grado si suman semestres.',
    },
    {
      id: 'sostenimiento',
      label: 'Sostenimiento mensual (COP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Arriendo o transporte, comida, materiales y salud. Es el rubro que más se subestima.',
    },
    {
      id: 'tasa',
      label: 'Tasa del crédito, efectiva anual (%)',
      type: 'number',
      value: 12,
      min: 0,
      max: 40,
      step: 0.1,
      suffix: '%',
      help: 'La de tu carta de aprobación del ICETEX. No la dejes en el valor de ejemplo: cambia por línea y por convocatoria.',
    },
    {
      id: 'edad',
      label: 'Edad del estudiante al matricular (años)',
      type: 'number',
      value: 6,
      min: 0,
      max: 20,
      step: 1,
      help: 'Sólo para la rama de colegio: orienta el grado de ingreso.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Los números de tu decisión, lado a lado',
    caption:
      'Según la rama: el puntaje de cada una de las cinco pruebas del Saber 11, la matrícula frente al sostenimiento de toda la carrera, el capital frente a los intereses del crédito, o la edad del estudiante frente a la edad mínima del grado.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Cada fila dice de dónde sale el número: la ponderación del ICFES, la suma de semestres, la fórmula de amortización o la referencia de edad del grado.',

  faq: [
    {
      q: '¿Cómo se calcula el puntaje global del Saber 11?',
      a: `El examen tiene cinco pruebas —Lectura Crítica, Matemáticas, Sociales y Ciudadanas, Ciencias Naturales e Inglés— y cada una se reporta en escala de 0 a 100. El global va de 0 a ${SABER11.maxGlobal} y sale de ponderar: las cuatro primeras pesan 3 cada una, Inglés pesa 1, se divide por ${SABER11.divisor} y se multiplica por ${SABER11.escala}. En números: (3·LC + 3·Mat + 3·Soc + 3·CN + 1·Ing) ÷ ${SABER11.divisor} × ${SABER11.escala}. Es la única cuenta oficial; todo lo demás que veas son ponderaciones que arma cada universidad.`,
    },
    {
      q: '¿Por qué Inglés pesa distinto que las otras pruebas?',
      a: 'Porque el ICFES la trata como prueba complementaria dentro del global: entra con peso 1 mientras las otras cuatro entran con peso 3. La consecuencia práctica es directa a la hora de estudiar: cada punto que subís en Matemáticas o en Lectura Crítica vale el triple en tu global que un punto en Inglés. Si te queda poco tiempo antes del examen, ahí está la palanca. Ojo igual: Inglés se reporta además en niveles del Marco Común Europeo y algunas universidades lo miran aparte.',
    },
    {
      q: '¿Qué puntaje necesito para entrar a una universidad pública?',
      a: 'No hay una respuesta única y desconfiá de quien te dé una. Cada universidad define su propio proceso: algunas usan el global, la mayoría arma una ponderación distinta para cada programa, y varias suman entrevista, prueba propia o portafolio. Además el corte no es fijo: depende de cuántos se presenten ese semestre y de cuántos cupos haya. Medicina y las ingenierías de las públicas grandes suelen cortar muy arriba; programas de la misma universidad en otras sedes cortan bastante más abajo con el mismo examen.',
    },
    {
      q: '¿La universidad pública en Colombia es gratis?',
      a: 'No siempre, y depende de la institución y del momento. Las públicas liquidan la matrícula según la situación socioeconómica del estudiante y de su familia, así que dos personas del mismo programa pueden pagar cifras muy distintas. A eso se le suman derechos complementarios y, sobre todo, el sostenimiento, que no cambia por ser pública. La política de gratuidad para estratos bajos ha existido con distinto alcance según el gobierno: confirmá la vigente con la oficina de admisiones antes de presupuestar.',
    },
    {
      q: '¿Cuánto cuesta realmente una carrera privada?',
      a: 'Multiplicá la matrícula por los semestres y sumá el sostenimiento de todos esos meses: es la única cuenta que sirve. En carreras de cinco años, el sostenimiento suele pesar tanto o más que la matrícula, sobre todo si te mudás de ciudad. Y proyectá aumentos: las matrículas suben todos los años, normalmente por encima del IPC, así que el valor del primer semestre subestima el total. Sumá también derechos de grado y el costo de los semestres que se estiren.',
    },
    {
      q: '¿Cómo funciona el crédito del ICETEX y cuándo empiezo a pagar?',
      a: 'El ICETEX desembolsa semestre a semestre contra la matrícula. Durante los estudios hay una etapa en la que pagás poco —a veces sólo intereses, a veces un porcentaje del valor— y la amortización fuerte arranca cuando te graduás. El plazo de amortización de las líneas clásicas es del doble del tiempo que duró la carrera. Lo que define tu cuota son tres cosas: cuánto capital acumulaste, la tasa efectiva anual de tu línea y ese plazo. Pedí la simulación oficial con tus tres datos antes de firmar.',
    },
    {
      q: '¿Por qué la deuda con el ICETEX termina siendo más alta de lo que pedí?',
      a: 'Por dos razones que se suman. Primero, los intereses que corren durante los años de estudio: si no los abonás en esa etapa, se capitalizan sobre el saldo y la deuda arranca la amortización más grande de lo que te desembolsaron. Segundo, el plazo: cuanto más largo, más chica la cuota pero más intereses totales. Por eso la comparación honesta no es entre cuotas, sino entre el total a pagar de cada alternativa de plazo.',
    },
    {
      q: '¿Cómo se calcula el promedio ponderado de notas en Colombia?',
      a: `Se multiplica cada nota por su peso, se suman los productos y se divide por la suma de los pesos. Si todas las evaluaciones pesan igual, el ponderado es el promedio simple. La escala habitual va de ${ESCALA_NOTAS.min} a ${ESCALA_NOTAS.max} con ${ESCALA_NOTAS.aprueba},0 como mínimo aprobatorio, pero conviene saber que esa escala numérica no la impone una norma nacional: el Decreto 1290 de 2009 fijó una escala nacional cualitativa —desempeño superior, alto, básico y bajo— y dejó a cada institución definir la suya y su equivalencia. Confirmá el mínimo en el reglamento de tu colegio o universidad.`,
    },
    {
      q: '¿A qué edad entra un niño a cada grado?',
      a: `Como referencia del sistema educativo colombiano: preescolar desde los ${EDADES_GRADO[0].edad} años, transición o grado cero desde los ${EDADES_GRADO[1].edad}, primaria desde los ${EDADES_GRADO[2].edad}, secundaria alrededor de los ${EDADES_GRADO[3].edad} y media alrededor de los ${EDADES_GRADO[4].edad}. Son orientativas: la ubicación real la decide la institución con la secretaría de educación, mirando sobre todo qué grados cursó antes el estudiante. Para quien está en extraedad existen modelos flexibles que permiten avanzar varios grados en un mismo año.`,
    },
    {
      q: '¿Qué es el SIMAT y por qué importa?',
      a: 'Es el Sistema Integrado de Matrícula del Ministerio de Educación: el registro nacional donde queda asentado cada estudiante del sistema oficial, con su grado, su institución y su historial. Importa por algo muy concreto: el cupo existe cuando el registro existe. Si cambiás de colegio o de municipio, el traslado se tramita ahí, y si el colegio no completó el registro, el estudiante puede quedar sin cupo formal aunque esté asistiendo a clase.',
    },
    {
      q: '¿La cuota de compensación militar entra en esta cuenta?',
      a: `No: es un trámite distinto y por eso no lo calculamos acá, aunque sea la gestión típica del egresado del colegio. Se liquida como un porcentaje del salario mínimo según la situación económica de la persona, desde el ${Math.round(LIBRETA.sinIngresos * 100)}% para quien no tiene ingresos hasta el ${Math.round(LIBRETA.mas4Smlmv * 100)}% para los tramos altos, con exenciones para víctimas del conflicto registradas, personas en pobreza extrema según Sisbén y personas con discapacidad permanente. Consultá el trámite directamente en el Ejército Nacional.`,
    },
    {
      q: '¿Conviene endeudarse para estudiar?',
      a: 'La pregunta correcta no es si conviene endeudarse, sino cuánto. Una regla práctica: mirá la cuota mensual proyectada contra el salario de enganche real de tu programa, no contra el promedio de la carrera ni contra lo que gana alguien con diez años de experiencia. Si la cuota se lleva más de un quinto de ese primer sueldo, el riesgo es alto. Antes de ir al crédito, agotá becas, apoyos de sostenimiento, la matrícula liquidada por situación socioeconómica en pública y los descuentos por puntaje del Saber 11 que muchas privadas ofrecen.',
    },
  ],

  sources: [
    {
      name: 'ICFES — examen Saber 11: estructura, pruebas y reporte de resultados',
      url: 'https://www.icfes.gov.co/',
      publisher: 'ICFES',
    },
    {
      name: 'ICETEX — líneas de crédito educativo, tasas y plazos',
      url: 'https://web.icetex.gov.co/',
      publisher: 'ICETEX',
    },
    {
      name: 'Ministerio de Educación Nacional — SIMAT, matrícula y traslados',
      url: 'https://www.mineducacion.gov.co/',
      publisher: 'MEN',
    },
    {
      name: 'Decreto 1290 de 2009 — evaluación del aprendizaje y escala nacional de desempeño',
      url: 'https://www.mineducacion.gov.co/1621/articles-187765_archivo_pdf_decreto_1290.pdf',
      publisher: 'MEN',
    },
    {
      name: 'Ley 115 de 1994 — Ley General de Educación (niveles y grados)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0115_1994.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ejército Nacional — cuota de compensación militar y libreta',
      url: 'https://www.ejercito.mil.co/',
      publisher: 'Ejército Nacional de Colombia',
    },
    {
      name: 'Decreto 1469/2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
    },
  ],

  replaces: [
    '/co/calculadora-puntaje-saber-11-icfes-colombia',
    '/co/calculadora-universidad-publica-vs-privada-colombia-coste-2026',
    '/co/calculadora-becas-icetex-colombia-credito-monto-2026',
    '/co/calculadora-notas-colombia',
    '/co/calculadora-edad-escolar-simat-colombia',
    '/co/calculadora-cuota-compensacion-militar-libreta-2026',
  ],

lastReviewed: '2026-07-28',
};
