import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuál es mi promedio?"
 * Arquetipo RAMIFICADO: 7 ramas = las 7 formas en que un estudiante llega a
 * preguntar por su promedio. Absorbe 11 URLs (ver `replaces`).
 *
 * Vive en /estudio y no en /matematica a propósito: la pregunta no es
 * aritmética (dividir una suma no lo es), es de vida académica —promocionar,
 * no quedar libre, llegar a la beca, aplicar afuera—. /matematica ya tiene el
 * hub de porcentajes para la parte de cuentas.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'plain' para notas y cantidades, 'unit' para
 * porcentajes, clases y créditos.
 *
 * GPA: las tres calculadoras que absorbe daban tres resultados distintos para
 * la misma nota. El hub muestra los tres métodos en el desglose y toma como
 * respuesta el de tabla de letras, que es el que usan las universidades de
 * EE.UU. y las agencias de convalidación.
 */
export const hub: HubData = {
  slug: 'estudio/promedio',
  title: '¿Cuál es mi promedio? — Notas, ponderado, faltas, GPA y beca',
  description:
    'Calculá tu promedio de notas simple o ponderado por créditos, la nota final de la materia, cuántas faltas te quedan, tu equivalencia en GPA 4.0 y si llegás al promedio que pide la beca. Con la cuenta paso a paso.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de estudio',
  h1: '¿Cuál es mi promedio?',
  lede:
    'Empezamos por el promedio simple de tus notas, que es lo que casi todo el mundo busca. Si tu caso es otro —materias con distinto peso, la nota final de una materia, las faltas que te quedan, el GPA para aplicar afuera o el promedio que pide una beca— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '7 cuentas académicas adentro', 'Secundaria, universidad y GPA'],

  resultLabel: 'Tu promedio',

  cases: {
    title: '¿Qué promedio necesitás sacar?',
    intro:
      'Elegí tu situación. Los campos que usa cada rama cambian, y el desglose te muestra exactamente qué entró en la cuenta.',
    items: [
      {
        id: 'simple',
        label: 'Promedio simple de mis notas',
        hint: 'Ej.: "tengo 7, 8, 9, 6 y 10, ¿cuánto me da?"',
        answer: 'Sumás todas las notas y dividís por la cantidad de notas.',
        yes: [
          'Fórmula: promedio = suma de las notas ÷ cantidad de notas',
          'Cargá las notas en el campo "Tus notas", separadas por espacio o punto y coma',
          'Sirve igual para secundaria y para universidad si todas las materias valen lo mismo',
          'El desglose te marca la nota más alta, la más baja y cuántas materias te tiran el promedio abajo',
        ],
        warn: [
          'En la mayoría de las universidades argentinas se aprueba con 4 y en la secundaria con 6: el desglose cuenta las dos cosas',
          'Ojo con los aplazos: muchas facultades los promedian igual y otras sólo cuentan la nota de aprobación. Fijate el régimen de tu carrera',
          'Si las materias tienen distinto peso o distintos créditos, esta rama te da un número que no es el de tu certificado analítico: usá la rama de ponderado',
        ],
        plazo: 'atajo: si sumás una nota nueva igual a tu promedio actual, el promedio no se mueve.',
      },
      {
        id: 'ponderado',
        label: 'Promedio ponderado por créditos u horas',
        hint: 'Ej.: "cada materia tiene distinta carga horaria"',
        answer: 'Multiplicás cada nota por su peso, sumás todo y dividís por la suma de los pesos.',
        yes: [
          'Fórmula: ponderado = Σ (nota × peso) ÷ Σ pesos',
          'El "peso" son los créditos, las horas o el porcentaje que vale cada materia o parcial',
          'Cargá las notas y los pesos en el mismo orden y con la misma cantidad de elementos',
          'El desglose te compara el ponderado con el promedio simple para que veas cuánto te movió la ponderación',
        ],
        warn: [
          'Tiene que haber tantos pesos como notas: si sobran o faltan, la cuenta no cierra',
          'Los pesos no necesitan sumar 100: se normalizan solos al dividir por el total',
          'Si tus mejores notas están en las materias de menos créditos, el ponderado te va a dar más bajo que el simple',
        ],
        plazo: 'chequeo: con todos los pesos iguales, el ponderado tiene que dar exactamente el promedio simple.',
      },
      {
        id: 'final',
        label: 'La nota final de una materia',
        hint: 'Ej.: "cursada 7 y final 8, ¿con cuánto cierro?"',
        answer: 'Ponderás la cursada y el final según cuánto vale cada uno.',
        yes: [
          'Fórmula: nota final = cursada × (100 − peso del final) ÷ 100 + final × peso del final ÷ 100',
          'El régimen clásico de UBA XXI es 40% trabajos y 60% examen final: por eso el campo viene en 60',
          'Cambiá el peso del final si tu materia usa otro reparto (50/50, 30/70)',
          'El desglose te muestra cuántos puntos aporta cada parte a la nota de cierre',
        ],
        warn: [
          'En casi todos los regímenes el final tiene nota mínima propia: con menos de 4 en el examen la materia queda desaprobada aunque el promedio dé más de 4',
          'Verificá el reparto en el programa de tu materia: el 60/40 no es universal',
          'Los redondeos los define cada cátedra: un 6,5 puede cerrar en 6 o en 7 según el reglamento',
        ],
        plazo: 'chequeo: los dos pesos tienen que sumar 100%.',
      },
      {
        id: 'asistencia',
        label: 'Cuántas faltas me quedan',
        hint: 'Ej.: "piden 75% de asistencia, ¿cuántas puedo faltar?"',
        answer: 'Calculás el mínimo de clases a las que tenés que ir y restás las que ya faltaste.',
        yes: [
          'Fórmula: clases mínimas = redondeo hacia arriba de (total × mínimo ÷ 100)',
          'Faltas máximas = total − clases mínimas; faltas disponibles = máximas − las que ya usaste',
          'El redondeo va SIEMPRE hacia arriba: con 75% sobre 32 clases hay que ir a 24, no a 23,9',
          'El resultado principal es tu porcentaje de asistencia actual',
        ],
        warn: [
          'El mínimo lo fija cada institución: 75% y 80% son los más comunes, pero hay materias con 85%',
          'Muchos reglamentos distinguen falta justificada de injustificada, y algunos cuentan media falta por llegada tarde',
          'Esta cuenta asume que ya conocés el total de clases del cuatrimestre: si se suspende una clase, el total baja y el mínimo también',
        ],
        plazo: 'chequeo: si las faltas disponibles dan 0, la próxima falta te deja libre.',
      },
      {
        id: 'gpa',
        label: 'Mi promedio en GPA 4.0 (para aplicar afuera)',
        hint: 'Ej.: "tengo 8 de promedio, ¿qué GPA es?"',
        answer: 'Se pasa la nota a escala 100 y se traduce por la tabla de letras del sistema estadounidense.',
        yes: [
          'El hub toma el promedio de las notas que cargaste arriba y lo convierte',
          'Método principal: nota sobre 100 → letra (A, B+, C…) → puntos GPA. Es el que usan las universidades y las agencias de convalidación',
          'El desglose también te muestra los dos métodos lineales que circulan, para que veas la diferencia',
          'Referencias: 3,0 es "good standing" en la mayoría de las admisiones y 3,7 habilita honores y becas competitivas',
        ],
        warn: [
          'No hay una conversión oficial única: cada universidad puede aplicar su propia tabla y la diferencia entre métodos llega a medio punto de GPA',
          'Para un trámite formal de admisión la conversión la hace una agencia (WES, ECE) sobre tu analítico, no una calculadora',
          'El GPA real de EE.UU. es ponderado por créditos, así que si tus materias pesan distinto usá primero la rama de ponderado',
        ],
        plazo: 'guardá siempre tu promedio original en la escala argentina: es el dato que te van a pedir certificar.',
      },
      {
        id: 'beca',
        label: 'Si llego al promedio de la beca',
        hint: 'Ej.: "¿me alcanza el promedio para Progresar?"',
        answer: 'Comparás tu promedio con el mínimo que exige el programa que elegiste.',
        yes: [
          'El hub toma el promedio de las notas que cargaste arriba y lo compara con el umbral de la beca',
          'Elegí el programa en el desplegable de becas',
          'El desglose te dice cuántos puntos te sobran o te faltan',
          'Progresar no exige promedio mínimo: exige regularidad (materias aprobadas por año) y tope de ingreso familiar',
        ],
        warn: [
          'El promedio es sólo uno de los requisitos: casi todas piden además regularidad, cantidad de materias al día e inscripción en fecha',
          'Los umbrales cambian por convocatoria y por universidad: verificá siempre en la fuente oficial antes de descartarte',
          'Las becas de universidades privadas manejan sus propias tablas y pueden pedir entrevista o examen',
        ],
        plazo: 'las convocatorias tienen ventana de inscripción corta: revisá las fechas del programa antes que el promedio.',
      },
      {
        id: 'estadistica',
        label: 'Promedio, mediana, moda y desvío',
        hint: 'Ej.: "para el TP de estadística descriptiva"',
        answer: 'Sacás las cuatro medidas sobre el mismo conjunto de datos y las comparás entre sí.',
        yes: [
          'Promedio (media): suma ÷ cantidad · Mediana: el valor del medio con los datos ordenados',
          'Moda: el valor que más se repite · Rango: máximo − mínimo',
          'Desvío estándar poblacional: raíz de la media de los cuadrados de las distancias al promedio',
          'Si promedio y mediana coinciden, los datos están repartidos de forma simétrica',
        ],
        warn: [
          'El desvío que calcula esta rama es el poblacional (divide por n). El muestral divide por n − 1 y da un poco más alto',
          'Cuando el promedio queda muy por encima de la mediana, hay valores altos estirando la media: en ese caso la mediana describe mejor al conjunto',
          'Si ningún valor se repite no hay moda, y si hay empate puede haber más de una',
        ],
        plazo: 'chequeo rápido: la mediana siempre cae entre el mínimo y el máximo, y el desvío nunca es negativo.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'La rama de promedio simple, GPA, beca y estadística usan sólo el campo de notas. Las demás suman los suyos. Los campos que sobran quedan ahí sin molestar.',
  fields: [
    {
      id: 'notas',
      label: 'Tus notas',
      value: '7 8 9 6 10',
      help: 'Separadas por espacio o punto y coma. La coma queda libre para los decimales: "7,5 8 9".',
    },
    {
      id: 'pesos',
      label: 'Créditos o peso de cada nota',
      value: '6 4 8 4 6',
      help: 'Sólo la rama de ponderado. Tiene que haber tantos pesos como notas, en el mismo orden.',
    },
    { id: 'cursada', label: 'Promedio de la cursada o de los trabajos prácticos', type: 'number', min: 0, max: 10, step: 0.1, value: 7 },
    { id: 'examen', label: 'Nota del examen final', type: 'number', min: 0, max: 10, step: 0.1, value: 8 },
    {
      id: 'pesoExamen',
      label: 'Cuánto pesa el examen final',
      type: 'number',
      min: 0,
      max: 100,
      suffix: '%',
      value: 60,
      help: 'El resto lo aporta la cursada. UBA XXI usa 60% final y 40% trabajos.',
    },
    { id: 'clasesTotales', label: 'Clases totales del cuatrimestre', type: 'number', min: 1, value: 32 },
    { id: 'clasesAsistidas', label: 'Clases a las que fuiste', type: 'number', min: 0, value: 26 },
    { id: 'minAsist', label: 'Asistencia mínima que te exigen', type: 'number', min: 50, max: 100, suffix: '%', value: 75 },
    {
      id: 'beca',
      label: 'Programa de beca',
      type: 'select',
      value: 'progresar',
      options: [
        { value: 'progresar', label: 'Progresar (ANSES) — sin promedio mínimo' },
        { value: 'uba_excelencia', label: 'UBA Excelencia Académica — 7+' },
        { value: 'conicet', label: 'CONICET doctoral — 7,5+' },
        { value: 'santander', label: 'Santander Universidades — 6+' },
        { value: 'privada', label: 'Beca académica de universidad privada — 8+' },
        { value: 'deportiva', label: 'Beca deportiva — 5+' },
      ],
    },
  ],
  fineprint:
    'Los umbrales de beca y los mínimos de asistencia son de referencia: cada convocatoria e institución fija los suyos y pueden cambiar entre llamados. Verificá siempre en la fuente oficial antes de tomar una decisión. La conversión a GPA no reemplaza una convalidación formal.',

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu número dentro de la escala que corresponde a cada rama: 0 a 10 en las de notas, 0 a 100% en la de asistencia y 0 a 4,0 en la de GPA. Ver la franja en la que caés dice más que el número solo: la diferencia entre un 5,9 y un 6 es un decimal en la cuenta y un cambio de estado en el reglamento.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después la suma o el producto, después la división y al final los chequeos. En la rama de GPA aparecen los tres métodos de conversión que circulan, con su resultado.',

  faq: [
    {
      q: '¿Cómo se calcula el promedio de las notas?',
      a: 'Se suman todas las notas y se divide por la cantidad de notas. Con 7, 8, 9, 6 y 10: la suma es 40 y son 5 notas, así que el promedio es 40 ÷ 5 = <b>8</b>. Es el promedio simple, y sirve cuando todas las materias valen lo mismo.',
    },
    {
      q: '¿Qué diferencia hay entre promedio simple y promedio ponderado?',
      a: 'El <b>simple</b> trata a todas las notas por igual. El <b>ponderado</b> multiplica cada nota por su peso (créditos, horas o porcentaje) antes de sumar, y divide por la suma de los pesos. Un 4 en una materia de 8 créditos pesa el doble que un 4 en una de 4. Si todos los pesos son iguales, los dos métodos dan exactamente lo mismo.',
    },
    {
      q: '¿Los aplazos cuentan en el promedio de la facultad?',
      a: 'Depende del régimen de cada universidad y a veces de cada carrera. Hay facultades que informan dos promedios —uno con aplazos y otro sin— y usan uno u otro según el trámite (beca, orden de mérito, ayudantía). Como los reglamentos difieren, calculá tu promedio de las dos formas y fijate cuál te piden.',
    },
    {
      q: '¿Cuántas faltas puedo tener con 75% de asistencia?',
      a: 'Sobre 32 clases, el 75% son 24 clases, así que podés faltar a <b>8</b>. La regla es: clases mínimas = total × mínimo ÷ 100, <b>redondeado hacia arriba</b>, y faltas máximas = total − mínimas. El redondeo hacia arriba importa: con 30 clases el 75% da 22,5 y hay que ir a 23, no a 22.',
    },
    {
      q: '¿Cómo se calcula la nota final de una materia con parcial y final?',
      a: 'Se pondera cada parte por lo que vale. Con el régimen 40% cursada y 60% final, una cursada de 7 y un final de 8 dan 7 × 0,40 + 8 × 0,60 = 2,8 + 4,8 = <b>7,6</b>. Ojo: en la mayoría de los regímenes el examen final tiene nota mínima propia, así que con menos de 4 en el final la materia queda desaprobada aunque el promedio ponderado dé más.',
    },
    {
      q: '¿Cuánto es un promedio de 8 en GPA 4.0?',
      a: 'Por la tabla de letras que usan las universidades de EE.UU., un 8/10 equivale a 80/100, letra <b>B−</b> y un GPA de <b>2,7</b>. Con el método lineal directo (nota ÷ 10 × 4) daría 3,2, y con el método que arranca la escala en 1 daría 3,11. No hay una conversión única: por eso el hub te muestra los tres.',
    },
    {
      q: '¿Por qué distintas calculadoras me dan distinto GPA para la misma nota?',
      a: 'Porque hay tres criterios en circulación. El de <b>tabla de letras</b> traduce la nota a la escala 100 y de ahí a los puntos por letra (93+ = 4,0; 83–86 = 3,0…). El <b>lineal directo</b> hace nota ÷ 10 × 4. El <b>lineal desde 1</b> asume que la escala argentina empieza en 1 y hace (nota − 1) × 4 ÷ 9. Para un mismo 8/10 dan 2,7, 3,2 y 3,11. Para un trámite real vale el que aplique la institución o la agencia de convalidación.',
    },
    {
      q: '¿Qué promedio piden las becas universitarias en Argentina?',
      a: 'Varía por programa. <b>Progresar</b> no exige promedio: pide regularidad (materias aprobadas por año) y tope de ingreso familiar. <b>UBA Excelencia Académica</b> pide 7 o más, <b>CONICET</b> doctoral 7,5, <b>Santander Universidades</b> 6 y las becas académicas de universidades privadas suelen arrancar en 8. Los valores cambian por convocatoria: confirmalos en la fuente oficial.',
    },
    {
      q: '¿Cuánto necesito en la próxima materia para subir el promedio?',
      a: 'Sumar una nota igual a tu promedio actual no lo mueve; cualquier nota más alta lo sube y cualquiera más baja lo baja. La cuenta exacta es: nota necesaria = promedio objetivo × (cantidad de notas + 1) − suma actual. Con 5 notas que suman 40 (promedio 8) y objetivo 8,5, hace falta 8,5 × 6 − 40 = <b>11</b>: imposible en escala 0-10, o sea que con una sola materia no llegás.',
    },
    {
      q: '¿Qué diferencia hay entre promedio, mediana y moda?',
      a: 'El <b>promedio</b> es la suma dividida por la cantidad y se mueve con los valores extremos. La <b>mediana</b> es el valor del medio con los datos ordenados y no se mueve con los extremos. La <b>moda</b> es el valor que más se repite. Si el promedio queda muy por encima de la mediana, hay pocos valores altos estirando la media: ahí la mediana describe mejor al conjunto.',
    },
    {
      q: '¿Con cuánto se aprueba, con 4 o con 6?',
      a: 'En la mayoría de las universidades argentinas se aprueba con <b>4</b> y la promoción sin final suele pedir 7 u 8. En la secundaria el piso habitual es <b>6</b>. Por eso el desglose de la rama de promedio simple te cuenta las dos cosas: cuántas notas tenés por debajo de 4 y cuántas por debajo de 6.',
    },
    {
      q: '¿El promedio del certificado analítico es el mismo que este?',
      a: 'No siempre. El analítico lo emite tu universidad con su propio régimen: puede ponderar por créditos, incluir o excluir aplazos y usar reglas de redondeo propias. Esta página te da el número para orientarte y para simular escenarios; el dato oficial es el que figura en el certificado que emite tu casa de estudios.',
    },
  ],

  sources: [
    {
      name: 'Becas Progresar — requisitos, montos y convocatorias',
      url: 'https://www.argentina.gob.ar/educacion/becas/progresar',
      publisher: 'Ministerio de Educación / ANSES (Argentina)',
    },
    {
      name: 'Becas de la Universidad de Buenos Aires — programas y requisitos',
      url: 'https://www.uba.ar/becas/',
      publisher: 'Universidad de Buenos Aires',
    },
    {
      name: 'Becas doctorales y posdoctorales — bases y condiciones',
      url: 'https://convocatorias.conicet.gov.ar/becas/',
      publisher: 'CONICET',
    },
    {
      name: 'Grading systems and GPA conversion — cómo se traducen las notas extranjeras',
      url: 'https://www.wes.org/education-resources/',
      publisher: 'World Education Services (WES)',
    },
    {
      name: 'Media, mediana, moda y desvío estándar — estadística descriptiva',
      url: 'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data',
      publisher: 'Khan Academy',
    },
  ],

  replaces: [
    '/calculadora-promedio-notas-universidad',
    '/calculadora-promedio-secundaria',
    '/calculadora-promedio-ponderado-notas-materias',
    '/calculadora-promedio-ponderado-universidad',
    '/calculadora-uba-xxi-nota-final-promedio',
    '/calculadora-indice-asistencia-faltas',
    '/calculadora-notas-gpa-conversor',
    '/calculadora-gpa-promedio-americano-escala-4-0',
    '/calculadora-gpa-argentino-a-escala-4',
    '/calculadora-promedio-beca-argentina',
    // Estadística descriptiva: no es "mi promedio de notas", pero la cuenta
    // central es la misma y le damos rama propia hasta que exista
    // /matematica/estadistica. Ver reporte.
    '/calculadora-promedio-mediana-moda-estadistica',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-nota-promedio-bachillerato-secundario-materias',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
