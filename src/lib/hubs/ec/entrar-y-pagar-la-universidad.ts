import type { HubData } from '../types';
import { SENESCYT_TRANSFORMAR_EC, UNIVERSIDADES_PRIVADAS_EC_2026, ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Con qué nota entro a la universidad y cuánto me cuesta la carrera?"
 *
 * Cálculo espejado de las fórmulas vivas:
 *   nota-postulacion-transformar-senescyt-ecuador.ts · promedio-notas-ecuador.ts ·
 *   costo-universidad-privada-ecuador.ts · presupuesto-utiles-escolares-sierra-ecuador.ts
 *
 * El gráfico es una escala posicional de 400 a 1000: la nota de postulación se calcula y se
 * ubica en la escala en TODAS las ramas, aunque el número grande del panel cambie según
 * estés mirando la nota o el costo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const SENESCYT = SENESCYT_TRANSFORMAR_EC;
export const UNIVERSIDADES = UNIVERSIDADES_PRIVADAS_EC_2026;
export const SBU = ECUADOR_2026.sbu;

/** Nota mínima de aprobación en el bachillerato ecuatoriano (escala sobre 10). */
export const NOTA_MINIMA_APROBACION = 7;

/**
 * Costos de regreso a clases por estudiante (USD), régimen Sierra-Amazonía.
 * [útiles de la lista, uniformes, mochila y zapatos]. Promedios de temporada, orientativos.
 */
export const UTILES_ESCOLARES = {
  fiscal: {
    inicial: [35, 45, 40],
    basica: [50, 50, 45],
    superior: [65, 55, 50],
    bachillerato: [80, 60, 55],
  },
  particular: {
    inicial: [70, 90, 55],
    basica: [110, 100, 60],
    superior: [140, 110, 65],
    bachillerato: [170, 120, 70],
  },
};

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/estudio/entrar-y-pagar-la-universidad',
  title: 'Nota de postulación Transformar y costo de la universidad en Ecuador',
  description:
    'Calcula tu nota de postulación del examen Transformar de la Senescyt con la ponderación de bachillerato general o técnico y la acción afirmativa, tu promedio de notas sobre 10, y cuánto cuesta una carrera completa en universidad privada del Ecuador, más el presupuesto de útiles escolares.',
  silo: 'Estudio',
  siloHref: '/ec/estudio',
  locale: 'ec',

  eyebrow: 'Ecuador · Senescyt, Ministerio de Educación y universidades',
  h1: '¿Con qué nota entras a la universidad en el Ecuador, y cuánto te va a costar la carrera?',
  lede:
    'La nota de postulación no es el puntaje del examen: el examen Transformar pesa menos que tu nota de grado del bachillerato, y mucha gente lo descubre tarde. Aquí calculas la nota real con la que compites por un cupo, y del otro lado, lo que cuesta la alternativa privada de punta a punta.',
  stamps: [
    `Examen Transformar de ${SENESCYT_TRANSFORMAR_EC.examenMin} a ${SENESCYT_TRANSFORMAR_EC.examenMax} puntos`,
    'Bachillerato general: examen 35% + nota de grado 65% · técnico: 25% + 75%',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Tu nota de postulación',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro:
      'La nota de postulación se calcula igual para todos, pero la ponderación cambia según el tipo de bachillerato que cursaste. Y una vez que sabes tu nota, la pregunta siguiente suele ser cuánto cuesta la opción privada.',
    items: [
      {
        id: 'general',
        label: 'Bachillerato general',
        hint: 'Examen 35% + nota de grado 65%',
        answer: `Si vienes del bachillerato general en ciencias, el examen Transformar pesa el ${(SENESCYT_TRANSFORMAR_EC.general.pesoExamen * 100).toFixed(0)}% y tu nota de grado del bachillerato el ${(SENESCYT_TRANSFORMAR_EC.general.pesoGrado * 100).toFixed(0)}%.`,
        yes: [
          `Puntaje del examen Transformar en escala de ${SENESCYT_TRANSFORMAR_EC.examenMin} a ${SENESCYT_TRANSFORMAR_EC.examenMax}, ponderado al ${(SENESCYT_TRANSFORMAR_EC.general.pesoExamen * 100).toFixed(0)}%`,
          `Nota de grado del bachillerato que reporta el Ministerio de Educación, llevada a escala de 1000 y ponderada al ${(SENESCYT_TRANSFORMAR_EC.general.pesoGrado * 100).toFixed(0)}%`,
          `Puntos adicionales por acción afirmativa: hasta ${SENESCYT_TRANSFORMAR_EC.accionAfirmativaMax} sobre el resultado`,
          'La nota de postulación es la que compite por el cupo, no el puntaje del examen suelto',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Que la nota de grado pese casi el doble que el examen tiene una consecuencia práctica: tres años de bachillerato regular valen más que un examen brillante de un día',
          'El puntaje de corte de cada carrera no es fijo: depende de cuántos postulen y con qué notas en ese período. Una nota que alcanzó el año pasado puede no alcanzar este año',
          'La acción afirmativa se acredita con documentación ante la Senescyt: no se aplica sola',
        ],
        plazo: 'la postulación se hace en la plataforma de la Senescyt dentro de las fechas de cada período; fuera de plazo no hay excepciones.',
      },
      {
        id: 'tecnico',
        label: 'Bachillerato técnico',
        hint: 'Examen 25% + nota de grado 75%',
        answer: `Si vienes de bachillerato técnico y postulas a una carrera técnica afín, el examen pesa solo el ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoExamen * 100).toFixed(0)}% y tu nota de grado el ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoGrado * 100).toFixed(0)}%.`,
        yes: [
          `El examen Transformar se pondera al ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoExamen * 100).toFixed(0)}%, menos que en el bachillerato general`,
          `La nota de grado pesa el ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoGrado * 100).toFixed(0)}%: tres de cada cuatro puntos vienen del colegio`,
          'La ponderación técnica aplica cuando postulas a una carrera técnica afín a tu especialidad de bachillerato',
          `Los puntos de acción afirmativa, hasta ${SENESCYT_TRANSFORMAR_EC.accionAfirmativaMax}, se suman igual que en el bachillerato general`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'La ponderación técnica no aplica si postulas a una carrera que no es afín a tu especialidad: en ese caso te evalúan con la ponderación general y tu nota de postulación baja',
          'Con la nota de grado pesando el 75%, una nota de colegio baja es muy difícil de compensar con el examen: el margen que da el examen es de apenas una cuarta parte del total',
        ],
        plazo: 'la afinidad entre la especialidad del bachillerato técnico y la carrera la define la Senescyt en el catálogo de oferta de cada período.',
      },
      {
        id: 'promedio',
        label: 'Calcular mi promedio de notas',
        hint: 'Escala sobre 10 · mínimo 7 para aprobar',
        answer: `En el Ecuador la escala de calificación es sobre 10 y la nota mínima para aprobar el bachillerato es ${NOTA_MINIMA_APROBACION}.`,
        yes: [
          'El promedio se calcula sobre la escala oficial de 0 a 10 que usan colegios y buena parte de las universidades',
          `La nota mínima de aprobación en el bachillerato es ${NOTA_MINIMA_APROBACION} sobre 10`,
          'Cuando las evaluaciones tienen pesos distintos, el promedio es ponderado: cada nota multiplica su peso y se divide por la suma de pesos',
          'Con el promedio a la vista puedes calcular qué nota necesitas en la evaluación que falta para llegar a tu meta',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Tu nota de grado del bachillerato, la que usa la Senescyt, no es un promedio simple de todas tus notas: la calcula el Ministerio de Educación con su propia fórmula y es la que figura en tu certificado',
          'Si la nota que necesitas en la próxima evaluación sale mayor a 10, ya no alcanza con una sola nota: hay que sumar otra evaluación o recuperar',
        ],
        plazo: 'la nota de grado que se usa para postular es la que consta en tu registro del Ministerio de Educación, no la que calcules por tu cuenta.',
      },
      {
        id: 'privada',
        label: 'Presupuestar una carrera privada',
        hint: 'Costo por semestre × toda la carrera',
        answer: `Una carrera de pregrado en universidad privada del Ecuador se presupuesta por semestre, y en ${UNIVERSIDADES_PRIVADAS_EC_2026.semestresPorCarrera} semestres el total pasa fácilmente de los treinta mil dólares en las más caras.`,
        yes: [
          `USFQ: matrícula de ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].matricula[0])} a ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].matricula[1])} y arancel de ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].aranceleSemestre[0])} a ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].aranceleSemestre[1])} por semestre`,
          `UDLA: matrícula de ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[1].matricula[0])} y arancel de ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[1].aranceleSemestre[0])} a ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[1].aranceleSemestre[1])} por semestre`,
          `PUCE: de ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[2].aranceleSemestre[0])} a ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[2].aranceleSemestre[1])} por semestre, matrícula incluida`,
          `Referencia de duración: ${UNIVERSIDADES_PRIVADAS_EC_2026.semestresPorCarrera} semestres de pregrado, más en medicina y odontología`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los aranceles se actualizan cada año académico: el total de una carrera de cuatro años va a ser mayor al que sale de multiplicar el arancel de hoy por ocho semestres',
          'Las becas suelen aplicarse solo al arancel y no a la matrícula, y muchas exigen mantener un promedio mínimo: si lo pierdes, pierdes la beca a mitad de carrera',
          'Este cálculo no incluye materiales, transporte, alimentación ni el semestre de nivelación que algunas universidades exigen al ingreso',
        ],
        plazo: 'los tarifarios oficiales de cada universidad se publican antes del inicio del año académico y son públicos.',
      },
      {
        id: 'utiles',
        label: 'Presupuestar el regreso a clases',
        hint: 'Sierra-Amazonía · útiles, uniformes y mochila',
        answer: 'La lista de útiles de una escuela fiscal ronda los cincuenta dólares, pero con uniformes, mochila y zapatos el regreso a clases se va bastante más arriba por estudiante.',
        yes: [
          'La lista de útiles de un estudiante de básica en institución fiscal promedia alrededor de $50',
          'Sumando uniformes, mochila, lonchera y zapatos, el regreso a clases completo por estudiante sube bastante por encima de esa lista',
          'En institución particular el gasto por estudiante llega a más del doble que en la fiscal',
          'El año lectivo del régimen Sierra-Amazonía arranca de forma escalonada a comienzos de septiembre',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Estos son promedios de temporada, no precios oficiales: los valores reales dependen mucho de la institución, de la lista que entregue y de dónde compres',
          'Con varios hijos el gasto se multiplica casi lineal: los uniformes y los zapatos no se comparten, y los útiles tampoco',
          'La institución no puede obligarte a comprar los útiles en un proveedor determinado ni a adquirir marcas específicas',
        ],
        plazo: 'el calendario del régimen Sierra-Amazonía lo publica el Ministerio de Educación; el régimen Costa arranca en otra fecha del año.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'La nota de postulación se calcula siempre, en todas las ramas, para que la veas ubicada en la escala de 400 a 1000. Los campos de costo solo se usan en las ramas de presupuesto.',
  fields: [
    {
      id: 'puntajeExamen',
      label: 'Puntaje del examen Transformar',
      type: 'number',
      value: 780,
      min: 0,
      max: 1000,
      step: 1,
      help: `La escala del examen va de ${SENESCYT_TRANSFORMAR_EC.examenMin} a ${SENESCYT_TRANSFORMAR_EC.examenMax} puntos.`,
    },
    {
      id: 'notaGrado',
      label: 'Nota de grado del bachillerato',
      type: 'number',
      value: 8.5,
      min: 0,
      max: 20,
      step: 0.01,
      help: 'La que consta en tu certificado del Ministerio de Educación. Elegí abajo si está sobre 10 o sobre 20.',
    },
    {
      id: 'escalaGrado',
      label: 'Escala de tu nota de grado',
      type: 'select',
      value: '10',
      options: [
        { value: '10', label: 'Sobre 10 (escala oficial del bachillerato)' },
        { value: '20', label: 'Sobre 20' },
      ],
      help: 'La nota se lleva a escala de 1000 para poder ponderarla junto al examen.',
    },
    {
      id: 'accionAfirmativa',
      label: 'Puntos de acción afirmativa',
      type: 'number',
      value: 0,
      min: 0,
      max: 45,
      step: 1,
      help: `Se suman al final, hasta un máximo de ${SENESCYT_TRANSFORMAR_EC.accionAfirmativaMax} puntos. Hay que acreditarlos ante la Senescyt.`,
    },
    {
      id: 'arancelSemestre',
      label: 'Arancel o pensión por semestre ($)',
      prefix: '$',
      value: '4.400',
      thousands: true,
      help: 'El valor del período académico completo, sin la matrícula. Está en el tarifario público de cada universidad.',
    },
    {
      id: 'matriculaSemestre',
      label: 'Matrícula por semestre ($)',
      prefix: '$',
      value: '450',
      thousands: true,
      help: 'Lo que se paga aparte del arancel cada período. En algunas universidades ya viene incluida: en ese caso dejala en 0.',
    },
    {
      id: 'semestres',
      label: 'Semestres que dura la carrera',
      type: 'number',
      value: 8,
      min: 1,
      max: 16,
      step: 1,
      help: 'La referencia de pregrado son 8 semestres; medicina y odontología llegan a 12 o más.',
    },
    {
      id: 'becaPct',
      label: 'Beca o descuento sobre el arancel (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      help: 'Las becas normalmente se aplican al arancel y no a la matrícula.',
    },
    {
      id: 'hijos',
      label: 'Estudiantes en el hogar',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'Solo se usa en la rama del regreso a clases.',
    },
    {
      id: 'nivelUtiles',
      label: 'Nivel e institución del regreso a clases',
      type: 'select',
      value: 'fiscal_basica',
      options: [
        { value: 'fiscal_inicial', label: 'Fiscal · inicial' },
        { value: 'fiscal_basica', label: 'Fiscal · básica elemental y media' },
        { value: 'fiscal_superior', label: 'Fiscal · básica superior (8.º a 10.º)' },
        { value: 'fiscal_bachillerato', label: 'Fiscal · bachillerato' },
        { value: 'particular_inicial', label: 'Particular · inicial' },
        { value: 'particular_basica', label: 'Particular · básica elemental y media' },
        { value: 'particular_superior', label: 'Particular · básica superior (8.º a 10.º)' },
        { value: 'particular_bachillerato', label: 'Particular · bachillerato' },
      ],
      help: 'Los valores son promedios de temporada del régimen Sierra-Amazonía, orientativos.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu nota de postulación',
    caption:
      'La escala del examen Transformar va de 400 a 1000, y tu nota de postulación se ubica ahí. Las carreras más demandadas suelen cortar en la franja alta, así que lo que importa no es aprobar sino en qué parte del rango quedas.',
    bands: [
      { label: 'Franja baja', from: 400, to: 700, tone: 'bad' },
      { label: 'Franja media', from: 700, to: 850, tone: 'warn' },
      { label: 'Franja alta', from: 850, to: 950, tone: 'good' },
      { label: 'Franja de excelencia', from: 950, to: 1000, tone: 'good' },
    ],
  },
  breakdownTitle: 'Tu nota y tu presupuesto, línea por línea',
  breakdownIntro:
    'Primero cómo se arma la nota de postulación con sus ponderaciones, después el promedio de notas y, si estás mirando la vía privada, el costo completo de la carrera.',

  faq: [
    {
      q: '¿Cómo se calcula la nota de postulación en Ecuador?',
      a: `Combinando el puntaje del examen Transformar con tu nota de grado del bachillerato, más los puntos de acción afirmativa. Si vienes de bachillerato general, el examen pesa el ${(SENESCYT_TRANSFORMAR_EC.general.pesoExamen * 100).toFixed(0)}% y la nota de grado el ${(SENESCYT_TRANSFORMAR_EC.general.pesoGrado * 100).toFixed(0)}%. Si vienes de bachillerato técnico y postulas a una carrera técnica afín, el examen pesa el ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoExamen * 100).toFixed(0)}% y la nota de grado el ${(SENESCYT_TRANSFORMAR_EC.tecnico.pesoGrado * 100).toFixed(0)}%. La nota de grado se lleva a la escala de 1000 para poder ponderarla junto al examen.`,
    },
    {
      q: '¿Cuál es el puntaje mínimo y máximo del examen Transformar?',
      a: `La escala va de ${SENESCYT_TRANSFORMAR_EC.examenMin} a ${SENESCYT_TRANSFORMAR_EC.examenMax} puntos. Es decir que ${SENESCYT_TRANSFORMAR_EC.examenMin} es el piso de la escala, no un cero: incluso rindiendo mal se arranca desde ahí. Lo que define el cupo no es el puntaje del examen sino la nota de postulación, que combina examen y nota de grado.`,
    },
    {
      q: '¿Pesa más el examen o mi nota del colegio?',
      a: 'La nota del colegio, y por mucho. En bachillerato general la nota de grado explica casi dos tercios de la nota de postulación, y en bachillerato técnico afín tres cuartos. Es la consecuencia práctica más importante del sistema: rendir bien durante tres años de bachillerato vale más que un examen excelente de un solo día, y también significa que una nota de grado baja es muy difícil de compensar.',
    },
    {
      q: '¿Qué es la acción afirmativa y cuántos puntos suma?',
      a: `Es un puntaje adicional que la Senescyt otorga a postulantes en situación de desventaja socioeconómica o territorial, o que pertenecen a grupos de atención prioritaria. Suma hasta ${SENESCYT_TRANSFORMAR_EC.accionAfirmativaMax} puntos sobre el resultado de la ponderación. No se aplica automáticamente: hay que acreditarla con la documentación que la Senescyt exige dentro del plazo del período de postulación.`,
    },
    {
      q: '¿Qué nota necesito para entrar a medicina o a la carrera que quiero?',
      a: 'No hay un puntaje de corte publicado de antemano, porque el corte lo determina la oferta y la demanda de cada período: es la nota del último postulante que entra al último cupo disponible. Las carreras más demandadas, como medicina en universidades públicas grandes, suelen cortar en la franja alta de la escala. Por eso conviene postular a varias opciones y no solo a la primera.',
    },
    {
      q: '¿Cuál es la nota mínima para aprobar en el bachillerato ecuatoriano?',
      a: `${NOTA_MINIMA_APROBACION} sobre 10. La escala oficial de calificación en el sistema educativo ecuatoriano va de 0 a 10, y ${NOTA_MINIMA_APROBACION} es el umbral de aprobación. Cuando las evaluaciones tienen pesos distintos, el promedio se calcula ponderado: cada nota se multiplica por su peso y el resultado se divide por la suma de los pesos, no por la cantidad de notas.`,
    },
    {
      q: '¿Cuánto cuesta una carrera en universidad privada en Ecuador?',
      a: `Depende mucho de la universidad. La USFQ, la más cara del país, cobra entre ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].aranceleSemestre[0])} y ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[0].aranceleSemestre[1])} de arancel por semestre más matrícula. La UDLA está entre ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[1].aranceleSemestre[0])} y ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[1].aranceleSemestre[1])} por semestre, y la PUCE, cofinanciada, entre ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[2].aranceleSemestre[0])} y ${usd(UNIVERSIDADES_PRIVADAS_EC_2026.rangos[2].aranceleSemestre[1])}. Sobre ${UNIVERSIDADES_PRIVADAS_EC_2026.semestresPorCarrera} semestres de pregrado, la diferencia entre una y otra es de decenas de miles de dólares.`,
    },
    {
      q: '¿Por qué se compara el costo por semestre y no por crédito?',
      a: 'Porque es lo que el estudiante paga realmente. Cada universidad ecuatoriana tiene su propio esquema: algunas cobran un arancel fijo por semestre regular con carga completa, otras cobran por crédito, y otras por período académico. El único dato comparable entre todas, y el que corresponde al desembolso concreto de cada seis meses, es el costo del semestre completo.',
    },
    {
      q: '¿Las becas cubren todo?',
      a: 'Casi nunca. Lo habitual es que el porcentaje de beca se aplique solo al arancel y no a la matrícula, que se sigue pagando completa cada semestre. Además, la mayoría exige mantener un promedio mínimo para renovarla: perder la beca a mitad de carrera obliga a cubrir el arancel completo justo cuando quedan los semestres más pesados. Vale la pena leer la condición de renovación antes de contar con la beca en el presupuesto.',
    },
    {
      q: '¿Cuánto cuesta el regreso a clases en el Ecuador?',
      a: 'La lista de útiles de un estudiante de básica en una institución fiscal ronda los cincuenta dólares, pero ese número solo cubre los útiles. Sumando uniformes, mochila, lonchera y zapatos, el gasto real por estudiante sube bastante. En instituciones particulares el total por estudiante más que duplica al de la fiscal, y con varios hijos el gasto se multiplica casi de forma lineal.',
    },
    {
      q: '¿Cuándo empiezan las clases en el régimen Sierra-Amazonía?',
      a: 'A comienzos de septiembre, de forma escalonada según lo dispone el Ministerio de Educación en el calendario del año lectivo. El régimen Costa e Insular tiene su propio calendario, que arranca en otra época del año. Conviene revisar la fecha exacta del calendario oficial, porque el escalonamiento hace que no todas las instituciones empiecen el mismo día.',
    },
    {
      q: '¿Me pueden obligar a comprar los útiles en un lugar específico?',
      a: 'No. La institución educativa puede entregar la lista de útiles necesarios, pero no puede condicionar la matrícula ni exigir que compres en un proveedor determinado ni marcas específicas. Si te lo imponen, es un cobro indebido y se puede denunciar ante el distrito educativo correspondiente.',
    },
  ],

  sources: [
    { name: 'Senescyt — Acceso a la educación superior', url: 'https://www.educacionsuperior.gob.ec/', publisher: 'Secretaría de Educación Superior, Ciencia, Tecnología e Innovación' },
    { name: 'Educación Superior — Cálculo de la nota de postulación', url: 'https://edusuperior.ec/etapas/postulacion/calcular-nota', publisher: 'Senescyt' },
    { name: 'Ministerio de Educación del Ecuador — Calendario y calificaciones', url: 'https://educacion.gob.ec/', publisher: 'Ministerio de Educación' },
    { name: 'USFQ — Aranceles y matrículas de pregrado', url: 'https://www.usfq.edu.ec/', publisher: 'Universidad San Francisco de Quito' },
    { name: 'UDLA — Tarifario de pregrado', url: 'https://academico.udla.edu.ec/page/tarifario/', publisher: 'Universidad de las Américas' },
    { name: 'PUCE — Financiamiento estudiantil', url: 'https://www.puce.edu.ec/financiamiento-estudiantil/', publisher: 'Pontificia Universidad Católica del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-nota-postulacion-transformar-senescyt-ecuador',
    '/ec/calculadora-promedio-notas-ecuador',
    '/ec/calculadora-costo-universidad-privada-ecuador',
    '/ec/calculadora-presupuesto-utiles-escolares-sierra-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
