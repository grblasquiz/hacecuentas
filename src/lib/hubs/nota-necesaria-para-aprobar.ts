import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué nota necesito para aprobar?"
 * Arquetipo RAMIFICADO: 5 ramas = las 5 formas en que alguien llega a preguntar
 * por la nota que le FALTA sacar. Absorbe 3 URLs (ver `replaces`).
 *
 * DELIMITACIÓN con el hub hermano `/estudio/promedio`: aquel responde "cuál ES
 * mi promedio" (simple, ponderado, nota final, faltas, GPA, beca). Este responde
 * la pregunta inversa —qué me falta sacar— y no reclama ninguna de sus URLs.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'plain' para notas y cantidades, 'unit' para
 * porcentajes y puntos.
 *
 * CRITERIO: las tres fórmulas que absorbe son la misma cuenta
 * (necesaria = objetivo × total − acumulado, ÷ lo que falta) con distintos
 * envoltorios. El valor no está en la cuenta sino en los casos borde, y por eso
 * el hub los hace explícitos: nota mínima propia del final, techo de la escala,
 * redondeo de cátedra, y la diferencia entre aprobar (4), promocionar (7 u 8) y
 * quedar libre.
 */
export const hub: HubData = {
  slug: 'estudio/nota-necesaria-para-aprobar',
  title: '¿Qué nota necesito para aprobar? — Final, recuperatorio y promoción',
  description:
    'Calculá qué nota necesitás en el final, en el recuperatorio o en el parcial que te falta para aprobar la materia, promocionar sin final o no quedar libre. Con el despeje paso a paso y los casos borde de cada régimen.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de estudio',
  h1: '¿Qué nota necesito para aprobar?',
  lede:
    'Arrancamos por la más pedida: qué nota necesitás en el final para cerrar la materia. Si tu caso es otro —te faltan varias evaluaciones, vas por la promoción directa, tenés que ir al recuperatorio o querés saber si todavía te da— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 situaciones adentro', 'Aprobar, promocionar y no quedar libre'],

  resultLabel: 'La nota que necesitás',

  cases: {
    title: '¿En qué situación estás?',
    intro:
      'Elegí tu caso. Cada rama usa sus propios campos y el desglose te muestra el despeje completo, con el chequeo de si el número entra en la escala.',
    items: [
      {
        id: 'final',
        label: 'Qué nota necesito en el final',
        hint: 'Ej.: "tengo 6 de cursada y el final vale 60%, ¿con cuánto apruebo?"',
        answer:
          'Despejás la nota del final: lo que te falta para el objetivo, dividido por cuánto pesa el final.',
        yes: [
          'Fórmula: nota del final = (objetivo − cursada × peso de la cursada) ÷ peso del final',
          'El "objetivo" es la nota de cierre que querés: 4 para aprobar, 7 u 8 si tu cátedra usa otro piso',
          'El régimen clásico de UBA XXI es 40% trabajos y 60% examen: por eso el campo viene en 60',
          'El desglose te muestra cuántos puntos ya trae la cursada y cuántos tiene que aportar el final',
        ],
        warn: [
          'Casi todos los regímenes le ponen al final una nota mínima propia: con menos de 4 en el examen la materia queda desaprobada aunque el promedio ponderado dé más de 4',
          'Si el peso del final es 0 la cuenta no existe: la nota ya está cerrada por la cursada',
          'Verificá el reparto en el programa de tu materia. El 60/40 es habitual, no universal',
        ],
        plazo: 'chequeo: si el número te da más de 10, con este final no llegás — mirá la rama de "si todavía me da".',
      },
      {
        id: 'restantes',
        label: 'Me faltan varias evaluaciones',
        hint: 'Ej.: "llevo 5 y 7, me faltan dos parciales, ¿cuánto necesito en cada uno?"',
        answer:
          'Sumás lo que ya tenés, calculás cuántos puntos pide el objetivo en total y repartís la diferencia entre lo que falta.',
        yes: [
          'Fórmula: nota necesaria = (objetivo × total de evaluaciones − suma de lo que ya tenés) ÷ evaluaciones que faltan',
          'Cargá las notas rendidas en "Notas que ya tenés" y el total de evaluaciones de la materia',
          'El resultado es el promedio que tenés que sostener en cada una de las que faltan',
          'El desglose te dice cuántos puntos llevás acumulados y cuántos te faltan juntar',
        ],
        warn: [
          'Esta cuenta asume que todas las evaluaciones pesan lo mismo. Si un parcial vale más que otro, usá la rama del final y tratá al parcial pesado como "el final"',
          'Si el número te da 0 o menos, el objetivo ya está asegurado: con cualquier nota lo mantenés',
          'Si te da más de 10 no alcanza con las evaluaciones que quedan, por más que saques todo perfecto',
        ],
        plazo: 'atajo: cada punto que sacás por encima del objetivo te compra margen para la siguiente.',
      },
      {
        id: 'promocion',
        label: 'Quiero promocionar sin rendir final',
        hint: 'Ej.: "la cátedra promociona con 7 de promedio y 7 en cada parcial"',
        answer:
          'La promoción pide dos cosas a la vez: el promedio mínimo y una nota mínima en cada instancia. El hub chequea las dos.',
        yes: [
          'Requisito 1 — promedio: (promedio mínimo × total − suma actual) ÷ lo que falta',
          'Requisito 2 — piso por instancia: ninguna nota puede quedar por debajo de la mínima que pide la promoción',
          'La nota que necesitás es la mayor de las dos: te tiene que alcanzar para el promedio Y para el piso',
          'El desglose te muestra por separado cuánto pide cada requisito, para que veas cuál te aprieta',
        ],
        warn: [
          'Un promedio alto no salva un parcial por debajo del piso: la mayoría de los reglamentos pierden la promoción con una sola nota baja, aunque el promedio sobre',
          'Los umbrales cambian por cátedra y por facultad: 6, 7 y 8 conviven en la misma universidad',
          'En muchos regímenes rendir el recuperatorio te deja regular aunque apruebes: la promoción se pierde por haber recuperado, no por la nota',
        ],
        plazo: 'confirmá el régimen en el programa de la materia antes de contar con la promoción.',
      },
      {
        id: 'recuperatorio',
        label: 'Voy al recuperatorio: cómo quedo',
        hint: 'Ej.: "saqué 4 y 6, ¿quedo regular, libre o puedo promocionar?"',
        answer:
          'Con las dos notas de parcial el hub te dice tu condición y qué nota necesitás en el recuperatorio para cambiarla.',
        yes: [
          'Condición: promocionás si las dos notas llegan al piso y el promedio llega al mínimo de promoción',
          'Quedás regular si aprobaste las dos (4 o más) pero no llegás a la promoción: rendís final',
          'Quedás libre si alguna quedó por debajo de 4 y no la recuperás',
          'El recuperatorio conviene darlo sobre la nota más baja: es la que menos exige para levantar el promedio',
        ],
        warn: [
          'El recuperatorio reemplaza a la nota original en casi todos los regímenes, pero algunos la promedian: fijate cuál es el tuyo antes de decidir si te conviene darlo',
          'Hay cátedras que topean la nota del recuperatorio en el mínimo de aprobación: sacás 9 y te ponen 4',
          'Quedar libre por parciales no siempre es definitivo: casi siempre hay una instancia de recuperación antes del cierre de la cursada',
        ],
        plazo: 'las fechas de recuperatorio son fijas y no se corren: anotalas apenas sale el cronograma.',
      },
      {
        id: 'techo',
        label: '¿Todavía me da?',
        hint: 'Ej.: "si saco 10 en todo lo que falta, ¿a cuánto llego?"',
        answer:
          'Calculás el promedio máximo alcanzable poniendo 10 en todo lo que queda, y ves qué objetivos siguen vivos.',
        yes: [
          'Fórmula: promedio máximo = (suma actual + 10 × evaluaciones que faltan) ÷ total de evaluaciones',
          'También calcula el promedio mínimo posible, si sacaras 0 en todo lo que falta',
          'El desglose te marca cuáles de los umbrales —4, 6, 7 y 8— todavía están al alcance',
          'Sirve para decidir temprano si conviene apuntar a la promoción o resignarse al final',
        ],
        warn: [
          'Que el número sea alcanzable no quiere decir que sea razonable: llegar al techo pide nota perfecta en todo lo que queda',
          'Los pisos por instancia siguen valiendo: podés llegar al promedio de promoción y perderla igual por una nota baja ya rendida',
          'Si el máximo alcanzable no llega a 4, la materia ya está perdida por parciales: preguntá por el recuperatorio antes de abandonar',
        ],
        plazo: 'hacé esta cuenta apenas sale la nota del primer parcial, no a mitad del segundo.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Las ramas de final usan la cursada y su peso; las de evaluaciones, tus notas y el total. La de recuperatorio usa los dos parciales. Los campos que sobran quedan ahí sin molestar.',
  fields: [
    {
      id: 'notas',
      label: 'Notas que ya tenés',
      value: '5 7',
      help: 'Separadas por espacio o punto y coma. La coma queda libre para los decimales: "6,5 7".',
    },
    {
      id: 'totalEval',
      label: 'Total de evaluaciones de la materia',
      type: 'number',
      min: 1,
      max: 20,
      value: 4,
      help: 'Contá todas las instancias que promedian, incluidas las que ya rendiste.',
    },
    {
      id: 'objetivo',
      label: 'Nota que querés alcanzar',
      type: 'number',
      min: 1,
      max: 10,
      step: 0.5,
      value: 4,
      help: 'En la mayoría de las universidades se aprueba con 4 y se promociona con 7 u 8. En la secundaria el piso es 6.',
    },
    { id: 'cursada', label: 'Promedio de la cursada o de los trabajos prácticos', type: 'number', min: 0, max: 10, step: 0.1, value: 6 },
    {
      id: 'pesoFinal',
      label: 'Cuánto pesa el examen final',
      type: 'number',
      min: 1,
      max: 100,
      suffix: '%',
      value: 60,
      help: 'El resto lo aporta la cursada. UBA XXI usa 60% final y 40% trabajos.',
    },
    { id: 'parcial1', label: 'Nota del primer parcial', type: 'number', min: 0, max: 10, step: 0.5, value: 4 },
    { id: 'parcial2', label: 'Nota del segundo parcial', type: 'number', min: 0, max: 10, step: 0.5, value: 6 },
    {
      id: 'minPorParcial',
      label: 'Nota mínima por parcial que pide la promoción',
      type: 'number',
      min: 4,
      max: 9,
      step: 0.5,
      value: 6,
      help: 'El piso que no podés bajar en ninguna instancia. Suele ser 6 o 7.',
    },
    {
      id: 'promedioPromo',
      label: 'Promedio mínimo para promocionar',
      type: 'number',
      min: 4,
      max: 10,
      step: 0.5,
      value: 7,
      help: 'El promedio que pide la cátedra para no rendir final. 7 es el valor más frecuente.',
    },
  ],
  fineprint:
    'Los pisos de aprobación, los mínimos de promoción y las reglas de recuperatorio los fija cada cátedra y cada reglamento académico, y cambian entre facultades de una misma universidad. Los valores precargados son de referencia: verificá siempre el programa de tu materia o el régimen de tu carrera antes de tomar una decisión. Los redondeos también los define la cátedra, así que un 6,5 puede cerrar en 6 o en 7.',

  chart: {
    type: 'scale',
    title: 'Dónde cae la nota que necesitás',
    caption:
      'La barra ubica el número que te dio dentro de la escala 0 a 10 y sus umbrales: por debajo de 4 estás desaprobado, de 4 a 6 aprobado, de 6 a 7 en zona de regularidad cómoda y de 7 para arriba en zona de promoción. Si la nota necesaria se va por encima de 10 el marcador queda pegado al tope: no es que sea difícil, es que no entra en la escala.',
  },
  breakdownTitle: 'El despeje, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los puntos que ya tenés acumulados, después los que pide el objetivo, después la resta y la división, y al final los chequeos de escala y de piso por instancia.',

  faq: [
    {
      q: '¿Cómo se calcula la nota que necesito para aprobar?',
      a: 'Se despeja del promedio. La cuenta es: <b>nota necesaria = (objetivo × total de evaluaciones − suma de las notas que ya tenés) ÷ evaluaciones que te faltan</b>. Con 5 y 7 rendidos (suman 12), 4 evaluaciones en total y objetivo 4, hacen falta 4 × 4 − 12 = 4 puntos repartidos en 2 evaluaciones: <b>2 en cada una</b>. Es decir, ya estás muy cerca.',
    },
    {
      q: '¿Qué nota necesito en el final si la cursada ya está cerrada?',
      a: 'Ahí la cuenta cambia porque las partes pesan distinto: <b>nota del final = (objetivo − cursada × peso de la cursada) ÷ peso del final</b>. Con 6 de cursada, el final valiendo 60% y objetivo 4: (4 − 6 × 0,40) ÷ 0,60 = (4 − 2,4) ÷ 0,60 = <b>2,67</b>. Pero ojo con el punto siguiente: casi siempre el final tiene nota mínima propia.',
    },
    {
      q: 'Si el promedio me da 4 pero saqué 2 en el final, ¿apruebo?',
      a: 'No, en la enorme mayoría de los regímenes. El examen final tiene una <b>nota mínima propia</b> —habitualmente 4— y por debajo de ese piso la materia queda desaprobada aunque el promedio ponderado dé 4 o más. Por eso el hub te avisa cuando la nota que "alcanza" para el promedio queda por debajo del piso del final.',
    },
    {
      q: '¿Qué pasa si la nota necesaria me da más de 10?',
      a: 'Que con las evaluaciones que quedan <b>no llegás</b>: la escala termina en 10 y el despeje pide más. No es una cuestión de esfuerzo, es aritmética. En ese caso lo que corresponde es preguntar por el recuperatorio, por una instancia de recuperación al cierre de la cursada, o bajar el objetivo de promoción a aprobación.',
    },
    {
      q: '¿Con cuánto se aprueba y con cuánto se promociona?',
      a: 'En la mayoría de las universidades argentinas se <b>aprueba con 4</b>. La <b>promoción directa</b> —cerrar la materia sin rendir final— suele pedir <b>7 u 8</b> de promedio y además una nota mínima en cada parcial, que en general es 6 o 7. En la secundaria el piso de aprobación habitual es <b>6</b>. Los tres números conviven en instituciones distintas: confirmá el tuyo en el programa.',
    },
    {
      q: '¿Puedo promocionar con un parcial bajo si el promedio me da?',
      a: 'Casi nunca. La promoción es un requisito <b>doble</b>: promedio mínimo <i>y</i> piso por instancia. Con 9 y 5, el promedio da 7 pero el 5 queda por debajo del piso de 6 o 7 que pide la mayoría de las cátedras, así que se pierde la promoción y se queda regular. Por eso el hub calcula los dos requisitos por separado y te muestra cuál te aprieta.',
    },
    {
      q: '¿Rendir el recuperatorio me saca la promoción?',
      a: 'En muchos regímenes, sí: la promoción exige aprobar <b>en primera instancia</b>, así que quien recupera queda regular aunque saque 10. En otros el recuperatorio reemplaza la nota a todos los efectos y la promoción sigue viva. Es una de las diferencias más grandes entre cátedras y hay que verificarla en el programa, no asumirla.',
    },
    {
      q: '¿El recuperatorio reemplaza la nota vieja o se promedia?',
      a: 'Depende del reglamento. Lo más común es que la <b>reemplace</b>. Pero hay cátedras que promedian las dos notas y otras que <b>topean</b> la nota del recuperatorio en el mínimo de aprobación: sacás 9 y te queda 4 en el acta. Antes de decidir si te conviene recuperar una nota que ya está aprobada, confirmá cuál de las tres reglas se aplica.',
    },
    {
      q: '¿Cómo sé si todavía me da para aprobar?',
      a: 'Calculando el techo: <b>promedio máximo = (suma actual + 10 × evaluaciones que faltan) ÷ total de evaluaciones</b>. Si ese máximo no llega al objetivo, la materia ya está definida por lo rendido. Conviene hacer esta cuenta apenas sale la primera nota, no a mitad del segundo parcial: temprano todavía se puede cambiar la estrategia.',
    },
    {
      q: '¿Cómo se redondea la nota final?',
      a: 'Lo define cada cátedra y no hay una regla única. Un 6,5 puede cerrar en 6 o en 7, y algunas facultades directamente truncan los decimales. La recomendación práctica es no apuntar al número justo: si necesitás 7, buscá 7,5, porque el redondeo es la variable que no controlás.',
    },
    {
      q: '¿Esta cuenta sirve para el secundario?',
      a: 'Sí, cambiando los umbrales. El piso de aprobación de la secundaria argentina suele ser <b>6</b> y muchas jurisdicciones promedian por trimestre o cuatrimestre en lugar de por parcial. Cargá tus notas del período, poné el total de instancias que promedian y el objetivo en 6: el despeje es exactamente el mismo.',
    },
    {
      q: '¿Y si lo que quiero saber es cuál es mi promedio, no qué me falta?',
      a: 'Esa es la pregunta inversa y la responde <a href="/estudio/promedio">¿Cuál es mi promedio?</a>: promedio simple y ponderado por créditos, nota final de la materia, faltas que te quedan, equivalencia en GPA 4.0 y si llegás al promedio que pide la beca. Este hub sirve para lo que todavía no rendiste; aquel, para lo que ya está en el acta.',
    },
  ],

  sources: [
    {
      name: 'Régimen académico y condiciones de regularidad — Universidad de Buenos Aires',
      url: 'https://www.uba.ar/estudiar/',
      publisher: 'Universidad de Buenos Aires',
    },
    {
      name: 'Ordenanza de régimen de estudios: aprobación, promoción y recuperatorios',
      url: 'https://www.utn.edu.ar/es/secretaria-academica',
      publisher: 'Universidad Tecnológica Nacional',
    },
    {
      name: 'Régimen de enseñanza y promoción de las materias',
      url: 'https://unlp.edu.ar/academica/',
      publisher: 'Universidad Nacional de La Plata',
    },
    {
      name: 'Régimen académico marco para la educación secundaria',
      url: 'https://www.argentina.gob.ar/educacion',
      publisher: 'Ministerio de Educación de la Nación',
    },
    {
      name: 'UBA XXI — régimen de cursada, parciales y examen final',
      url: 'https://www.uba.ar/ubaxxi/',
      publisher: 'Universidad de Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-nota-necesaria-aprobar',
    '/calculadora-nota-minima-aprobar-final-parcial-promedio',
    '/calculadora-nota-parcial-recuperatorio-promocion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
