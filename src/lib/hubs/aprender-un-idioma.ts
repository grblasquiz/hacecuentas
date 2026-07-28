import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tardo en aprender un idioma?"
 * Arquetipo RAMIFICADO: 7 ramas. Absorbe 15 URLs (ver `replaces`).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LA TABLA ÚNICA (el problema que este hub viene a resolver)
 * ─────────────────────────────────────────────────────────────────────────
 * Las 15 calculadoras que absorbe usaban CINCO tablas de horas distintas y
 * mutuamente incompatibles:
 *   · horas-estudio-idioma-fluidez-fsi → inglés 600, alemán 900, ruso 1100,
 *     chino/japonés 2200. Es la tabla real del FSI, pero está medida DESDE EL
 *     INGLÉS y no declara nivel MCER (el FSI mide S-3/R-3, no B2 ni C1).
 *   · dificultad-idioma-fsi → inventaba horas por nivel propias (italiano
 *     B2 500 / C1 650; inglés B2 700 / C1 900) y clasificaba al inglés como
 *     "Cat II", lo cual es un error conceptual: el inglés NO está en la tabla
 *     FSI porque la tabla se mide desde el inglés.
 *   · horas-aprender-italiano-b1 (350), -portugues-b2 (500), -aleman-c1 (900):
 *     tres constantes sueltas sin escala común entre sí.
 *   · anos-fluidez-idioma → otra tabla más (cat1 B2 550 / C1 700 / C2 1000).
 *   · ingles-niveles-cambridge-duolingo → horas acumuladas Cambridge
 *     (A1 100, A2 250, B1 450, B2 750, C1 1150, C2 1350).
 *
 * El FSI **no publica horas por nivel MCER**. Quien sí las publica es Cambridge
 * English (guided learning hours). Así que la tabla de este hub se arma en dos
 * piezas, y el criterio queda documentado acá y en la FAQ:
 *
 *  1) BASE = horas guiadas acumuladas de Cambridge English por nivel MCER,
 *     tomando el punto medio de cada rango publicado (A1 ~90-100, A2 ~180-200,
 *     B1 ~350-400, B2 ~500-600, C1 ~700-800, C2 ~1000-1200).
 *     Esa base describe al INGLÉS, que es lo que Cambridge mide → multiplicador 1,0.
 *
 *  2) MULTIPLICADOR de distancia lingüística respecto del español, derivado de
 *     las categorías del FSI. Calibración: se eligió cada multiplicador para que
 *     las horas hasta C1 de la tabla reproduzcan aproximadamente las horas FSI
 *     conocidas de esa categoría.
 *
 *       cat        mult   C1 resultante   horas FSI de referencia
 *       ─────────────────────────────────────────────────────────
 *       romance    0,85       638 h        Cat I: 600-750 h        ✓
 *       inglés     1,00       750 h        (base Cambridge)        ✓
 *       germánica  1,30       975 h        Cat II alemán: 900 h    ✓
 *       cat III    1,60      1200 h        Cat III ruso: 1100 h    ✓
 *       cat IV     2,90      2175 h        Cat IV chino/jap: 2200 h ✓
 *
 *     Las correcciones respecto de un ajuste literal al FSI (germánica 1,2 →
 *     1,3; cat III 1,47 → 1,6) son deliberadas: el FSI mide desde el inglés, y
 *     un angloparlante arranca con ventaja de familia lingüística frente al
 *     alemán y al neerlandés que un hispanohablante NO tiene. En Cat IV no hay
 *     parentesco para ninguno de los dos, así que ahí el ajuste es ~nulo (2,9).
 *
 * NO HAY TABLA OFICIAL ÚNICA. Está dicho en el fineprint y en dos FAQ.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'unit' con horas/meses/palabras/XP, o 'plain'.
 */

/** Horas guiadas acumuladas por nivel MCER — base Cambridge English (inglés). */
export const BASE_MCER: Record<string, number> = {
  cero: 0,
  a1: 100,
  a2: 200,
  b1: 375,
  b2: 550,
  c1: 750,
  c2: 1100,
};

/** Multiplicador de distancia lingüística respecto del español (ver cabecera). */
export const IDIOMAS: Record<string, { nombre: string; mult: number; cat: string; nota: string }> = {
  italiano: { nombre: 'italiano', mult: 0.85, cat: 'Cat I FSI — muy cercano', nota: 'De los más rápidos: léxico y gramática casi transparentes desde el español.' },
  portugues: { nombre: 'portugués', mult: 0.85, cat: 'Cat I FSI — muy cercano', nota: 'El más cercano de todos. El riesgo no es la dificultad: es el portuñol fosilizado.' },
  frances: { nombre: 'francés', mult: 0.85, cat: 'Cat I FSI — cercano', nota: 'Fácil de leer, difícil de pronunciar y de entender hablado.' },
  ingles: { nombre: 'inglés', mult: 1.0, cat: 'Cercano — base Cambridge', nota: 'Gramática simple, ortografía y fonética irregulares. La base de la tabla.' },
  aleman: { nombre: 'alemán', mult: 1.3, cat: 'Cat II FSI — medio', nota: 'Cuatro casos y orden de palabras rígido. La curva es dura al principio y se aplana.' },
  neerlandes: { nombre: 'neerlandés', mult: 1.3, cat: 'Cat II FSI — medio', nota: 'Más simple que el alemán, pero con poca oferta de material en español.' },
  ruso: { nombre: 'ruso', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Cirílico se aprende en una semana; los seis casos y el aspecto verbal, no.' },
  polaco: { nombre: 'polaco', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Siete casos y fonética densa. De los eslavos, el más exigente.' },
  turco: { nombre: 'turco', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Aglutinante y regularísimo: la lógica es ajena pero casi no tiene excepciones.' },
  griego: { nombre: 'griego', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Alfabeto propio, pero muchísimo léxico compartido por raíces cultas.' },
  hebreo: { nombre: 'hebreo', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Escritura sin vocales y raíces triconsonánticas.' },
  hindi: { nombre: 'hindi', mult: 1.6, cat: 'Cat III FSI — difícil', nota: 'Indoeuropeo, así que la gramática no es tan ajena; la escritura devanagari sí.' },
  arabe: { nombre: 'árabe', mult: 2.9, cat: 'Cat IV FSI — muy difícil', nota: 'Diglosia: el árabe estándar que se estudia no es el que se habla en la calle.' },
  chino: { nombre: 'chino mandarín', mult: 2.9, cat: 'Cat IV FSI — muy difícil', nota: 'Gramática simple, pero tonos y ~3.000 caracteres para leer un diario.' },
  japones: { nombre: 'japonés', mult: 2.9, cat: 'Cat IV FSI — muy difícil', nota: 'Tres sistemas de escritura y registros de cortesía que cambian la gramática.' },
  coreano: { nombre: 'coreano', mult: 2.9, cat: 'Cat IV FSI — muy difícil', nota: 'El hangul se lee en un fin de semana; la sintaxis SOV y la honorificación no.' },
};

/**
 * Vocabulario por nivel MCER: [activas min, activas max, pasivas min, pasivas max].
 * Rangos de Nation (2001) y Milton (2009) — la misma tabla que usaba la calc
 * absorbida, que era el único dato de las 15 que no estaba en conflicto.
 */
export const VOCAB: Record<string, [number, number, number, number]> = {
  a1: [500, 800, 1000, 1500],
  a2: [1000, 1500, 2000, 3000],
  b1: [2000, 2500, 4000, 5000],
  b2: [4000, 5000, 8000, 10000],
  c1: [8000, 10000, 16000, 20000],
  c2: [16000, 20000, 32000, 40000],
};

export const hub: HubData = {
  slug: 'estudio/aprender-un-idioma',
  title: '¿Cuánto tardo en aprender un idioma? — Horas por nivel MCER, FSI y Duolingo',
  description:
    'Calculá cuántas horas y meses te faltan para llegar a A2, B1, B2, C1 o C2 en el idioma que estudiás, qué tan lejos está del español según el FSI, cuánto vocabulario pide cada nivel, cuánto suma Duolingo y cuánto rinde ver series en el idioma.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de idiomas',
  h1: '¿Cuánto tardo en aprender un idioma?',
  lede:
    'Empezamos por la pregunta más común: cuántos meses te faltan para llegar al nivel que querés, a tu ritmo real de estudio. Si tu caso es otro —comparar qué tan difícil es un idioma, cuánto vocabulario pide cada nivel, cuánto avanza Duolingo, cuánto suman las series, aprender dos idiomas a la vez o bajar el acento— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '7 cuentas de idiomas adentro', 'Escala MCER × distancia FSI'],

  resultLabel: 'Tu estimación',

  cases: {
    title: '¿Qué necesitás saber?',
    intro:
      'Elegí tu situación. Los campos que usa cada rama cambian, y el desglose te muestra exactamente qué entró en la cuenta y de dónde sale cada número.',
    items: [
      {
        id: 'nivel',
        label: 'Cuánto tardo en llegar a un nivel',
        hint: 'Ej.: "estoy en A2 de alemán y estudio 8 h por semana, ¿cuándo llego a B2?"',
        answer:
          'Se restan las horas acumuladas de tu nivel actual a las del nivel que buscás, se ajustan por cómo estudiás y se dividen por tus horas semanales.',
        yes: [
          'Fórmula: horas que faltan = (horas acumuladas del nivel meta − horas del nivel actual) × factor de tu forma de estudiar',
          'Las horas acumuladas salen de las horas guiadas de Cambridge por nivel MCER, multiplicadas por la distancia del idioma respecto del español',
          'Meses = horas que faltan ÷ horas por semana ÷ 4,345 semanas por mes',
          'El desglose te muestra la escalera completa del idioma: cuántas horas acumuladas pide cada nivel, de A1 a C2',
        ],
        warn: [
          'No existe una tabla oficial única de horas por nivel MCER: el FSI no publica equivalencias MCER y Cambridge publica rangos, no números exactos. Todo lo de acá es una estimación de referencia',
          'Las horas guiadas suponen clase más tarea. Estudiando solo con una app la cuenta se estira, y con inmersión se acorta: por eso está el campo de forma de estudio',
          'El calendario no es lineal: los primeros niveles rinden mucho más rápido que el salto de B2 a C1, que es el más largo de toda la escalera',
          'Estudiar menos de 3 horas por semana es el escenario donde el olvido se come buena parte de lo aprendido y la estimación se vuelve optimista',
        ],
        plazo: 'chequeo rápido: si tu nivel meta es igual o menor al actual, no hay horas que sumar.',
      },
      {
        id: 'dificultad',
        label: 'Qué tan difícil es este idioma para mí',
        hint: 'Ej.: "¿cuánto más me cuesta el japonés que el italiano?"',
        answer:
          'Se compara la distancia lingüística del idioma respecto del español, según las categorías del FSI, y se traduce a horas por nivel.',
        yes: [
          'El FSI (el instituto de idiomas del Departamento de Estado de EE.UU.) clasifica los idiomas en cuatro categorías por distancia lingüística',
          'Cat I son los romances, Cat II el alemán y el neerlandés, Cat III el ruso, el polaco o el turco, Cat IV el árabe, el chino, el japonés y el coreano',
          'El hub traduce esa categoría a un multiplicador sobre la escala MCER y te muestra las horas a B2, C1 y C2',
          'El desglose te compara el idioma elegido contra el inglés y contra el italiano, para que veas la diferencia real',
        ],
        warn: [
          'La tabla del FSI está medida desde el INGLÉS, no desde el español: por eso el hub aplica una corrección de familia lingüística en vez de copiarla tal cual',
          'El inglés no figura en la tabla del FSI, justamente porque es la lengua de partida. Cualquier calculadora que lo clasifique como "Cat II del FSI" está diciendo algo que el FSI nunca dijo',
          'El FSI mide alumnos adultos, seleccionados y a tiempo completo, con clases en grupos chicos: es un piso, no un promedio de la población',
          'La dificultad percibida depende también de tu experiencia previa: si ya sabés inglés, el alemán se te va a hacer más liviano que lo que dice la tabla',
        ],
        plazo: 'la distancia lingüística explica el orden de magnitud; la constancia semanal explica el resto.',
      },
      {
        id: 'vocabulario',
        label: 'Cuántas palabras necesito para cada nivel',
        hint: 'Ej.: "¿con cuántas palabras se llega a B2?"',
        answer:
          'Cada nivel del MCER tiene un rango de vocabulario activo (el que producís) y pasivo (el que reconocés al leer o escuchar).',
        yes: [
          'Vocabulario activo: las palabras que usás al hablar y escribir. Pasivo: las que entendés cuando las ves o las escuchás',
          'El pasivo es siempre alrededor del doble del activo, en todos los niveles',
          'B1 arranca en unas 2.000 palabras activas y B2 en unas 4.000: entre esos dos niveles el vocabulario se duplica',
          'El desglose te dice cuántas palabras te separan de tu nivel meta y a qué ritmo diario las cubrís',
        ],
        warn: [
          'Los rangos son de la investigación de Nation y Milton, no del Consejo de Europa: el MCER describe lo que sabés hacer con el idioma, no cuántas palabras sabés',
          'Contar "palabras" es ambiguo: casi todos los estudios cuentan familias de palabras, no formas sueltas, así que "correr, corriendo, corrió" es una sola',
          'Saber una palabra en una lista no es saberla: reconocerla no alcanza para producirla en una conversación',
          'Las 2.000 palabras más frecuentes cubren cerca del 80% de un texto corriente: el rendimiento por palabra aprendida cae fuerte a partir de ahí',
        ],
        plazo: 'atajo: 10 palabras nuevas por día son unas 3.650 al año, suficiente para pasar de cero a B1 en vocabulario.',
      },
      {
        id: 'duolingo',
        label: 'Cuánto avanzo con Duolingo',
        hint: 'Ej.: "hago 20 minutos por día, ¿a qué nivel llego y cuándo?"',
        answer:
          'Se traducen tus minutos diarios a XP, se comparan con el XP acumulado que pide el nivel y se estima el plazo.',
        yes: [
          'Referencia de conversión: una lección típica son unos 15 XP y un minuto de app rinde cerca de 10 XP',
          'XP acumulado de referencia por nivel: unos 5.000 para A1, 15.000 para A2 y 28.000 para B1, ajustado por idioma',
          'El desglose te muestra tu XP por día, las lecciones diarias equivalentes y cuántos días te faltan',
          'También te muestra qué porcentaje de las horas que pide el nivel llegás a cubrir con la app sola',
        ],
        warn: [
          'Duolingo sola no llega a B2 en ningún idioma: los árboles completos rondan A2-B1 y la app misma sólo reclama equivalencia hasta ahí',
          'El XP no mide aprendizaje: se puede farmear repitiendo lecciones fáciles y la racha premia el hábito, no el progreso',
          'La app entrena reconocimiento y traducción, no producción oral espontánea. Para hablar hace falta hablar',
          'Los valores de XP por nivel son estimaciones de la comunidad y de los árboles publicados, no una equivalencia MCER certificada por Duolingo',
        ],
        plazo: 'la racha vale por el hábito: 15 minutos todos los días rinden más que 2 horas los domingos.',
      },
      {
        id: 'series',
        label: 'Cuánto suma ver series en el idioma',
        hint: 'Ej.: "veo 6 horas de series por semana en inglés, ¿cuánto me rinde?"',
        answer:
          'Se convierten las horas de video en horas equivalentes de estudio activo con un factor de eficiencia, y se ve cuánto acortan tu plazo.',
        yes: [
          'Factor de referencia: una hora de series o películas en el idioma rinde como 0,3 a 0,5 horas de estudio activo. El hub usa 0,4 y lo podés cambiar',
          'La cuenta se apoya en la hipótesis del input comprensible: el video suma cuando entendés la mayor parte de lo que escuchás',
          'El desglose te muestra el equivalente semanal y mensual, y cuántos meses te acorta el camino a tu nivel meta',
          'El gráfico ubica qué porción de tu estudio total viene del video: mucho input y poca práctica activa es un desequilibrio, no un atajo',
        ],
        warn: [
          'El factor 0,4 es una estimación, no un dato medido: depende de cuánto entendés. Si te perdés todo el tiempo, el rendimiento real se acerca a cero',
          'Con subtítulos en español el rendimiento cae muchísimo: leés en vez de escuchar. Subtítulos en el idioma sí funcionan',
          'El input pasivo casi no entrena la producción: podés entender una serie entera y seguir sin poder pedir un café',
          'El video no reemplaza el estudio estructurado: es un complemento que funciona mejor a partir de A2-B1',
        ],
        plazo: 'regla práctica: que el video no supere la mitad de tu estudio semanal total.',
      },
      {
        id: 'dos',
        label: 'Aprender dos idiomas a la vez',
        hint: 'Ej.: "¿puedo con italiano y portugués al mismo tiempo?"',
        answer:
          'Se reparte tu tiempo entre los dos y se descuenta la interferencia, que crece cuanto más parecidos son entre sí.',
        yes: [
          'Se divide tu tiempo semanal en dos y se aplica una pérdida por interferencia: 8% si son idiomas distintos, 20% si son parecidos y 35% si son muy parecidos entre sí',
          'Muy parecidos entre sí quiere decir italiano y portugués, o francés y catalán: no "los dos son fáciles"',
          'El desglose te compara los meses hasta tu nivel meta estudiando uno solo contra estudiar los dos en paralelo',
          'Regla operativa: franjas horarias separadas y, si podés, un idioma en una modalidad distinta del otro',
        ],
        warn: [
          'Arrancar los dos desde cero es el peor escenario: la interferencia es máxima cuando los dos sistemas están a medio formar',
          'Lo más usual es llevar uno a B1-B2 y recién ahí sumar el segundo. A partir de B2 el primero se sostiene con mucho menos tiempo',
          'Con menos de una hora por día en total, repartir entre dos idiomas hace que no avances en ninguno',
          'La interferencia es un supuesto de planificación, no una constante medida: los estudios sobre interferencia entre lenguas no dan un número único',
        ],
        plazo: 'test honesto: si no sostenés 1 hora diaria hoy con un idioma, no la vas a sostener con dos.',
      },
      {
        id: 'acento',
        label: 'Cuánto tengo que practicar para bajar el acento',
        hint: 'Ej.: "tengo acento fuerte, ¿en cuánto se nota una mejora?"',
        answer:
          'Se estiman las semanas de práctica de pronunciación necesarias para que la mejora se vuelva perceptible.',
        yes: [
          'Referencia: unas 15 semanas de práctica por cada punto de acento en una escala de 1 a 10, repartidas según tus horas semanales',
          'Práctica quiere decir trabajo específico de pronunciación: shadowing, repetición con grabación y comparación, no conversación general',
          'El desglose te da las horas totales de práctica focalizada y los meses a tu ritmo',
          'El piso son 2 meses: por debajo de eso ninguna mejora es perceptible para un oyente, por más horas que metas',
        ],
        warn: [
          'El objetivo razonable es la INTELIGIBILIDAD, no el acento nativo. La investigación de Derwing y Munro es clara: se entiende perfecto con acento marcado',
          'Después de la adolescencia, alcanzar un acento indistinguible del nativo es raro. Perseguirlo suele costar más de lo que rinde',
          'La práctica sin retroalimentación mete errores: hace falta grabarse y comparar, o alguien que corrija',
          'Los sonidos que no existen en español son los que más tardan; el ritmo y la entonación mejoran mucho más rápido que los fonemas sueltos',
        ],
        plazo: 'prioridad: primero los sonidos que cambian el significado, después los que sólo suenan raro.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'La rama principal usa el idioma, tus niveles y tus horas por semana. Las demás suman los suyos. Los campos que no usa tu rama quedan ahí sin molestar.',
  fields: [
    {
      id: 'idioma',
      label: 'Idioma que estudiás',
      type: 'select',
      value: 'ingles',
      options: [
        { value: 'ingles', label: 'Inglés' },
        { value: 'portugues', label: 'Portugués' },
        { value: 'italiano', label: 'Italiano' },
        { value: 'frances', label: 'Francés' },
        { value: 'aleman', label: 'Alemán' },
        { value: 'neerlandes', label: 'Neerlandés' },
        { value: 'ruso', label: 'Ruso' },
        { value: 'polaco', label: 'Polaco' },
        { value: 'turco', label: 'Turco' },
        { value: 'griego', label: 'Griego' },
        { value: 'hebreo', label: 'Hebreo' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'arabe', label: 'Árabe' },
        { value: 'chino', label: 'Chino mandarín' },
        { value: 'japones', label: 'Japonés' },
        { value: 'coreano', label: 'Coreano' },
      ],
    },
    {
      id: 'nivelActual',
      label: 'Tu nivel actual',
      type: 'select',
      value: 'a2',
      options: [
        { value: 'cero', label: 'Desde cero' },
        { value: 'a1', label: 'A1 — principiante' },
        { value: 'a2', label: 'A2 — básico' },
        { value: 'b1', label: 'B1 — intermedio' },
        { value: 'b2', label: 'B2 — intermedio alto' },
        { value: 'c1', label: 'C1 — avanzado' },
      ],
    },
    {
      id: 'nivelMeta',
      label: 'Nivel al que querés llegar',
      type: 'select',
      value: 'b2',
      options: [
        { value: 'a1', label: 'A1 — principiante' },
        { value: 'a2', label: 'A2 — básico' },
        { value: 'b1', label: 'B1 — intermedio' },
        { value: 'b2', label: 'B2 — intermedio alto' },
        { value: 'c1', label: 'C1 — avanzado' },
        { value: 'c2', label: 'C2 — dominio' },
      ],
    },
    {
      id: 'horasSemana',
      label: 'Horas de estudio por semana',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.5,
      value: 8,
      help: 'Sumá clases, tarea y práctica. En la rama de dos idiomas es el total que repartís entre los dos.',
    },
    {
      id: 'calidad',
      label: 'Cómo estudiás',
      type: 'select',
      value: 'clases',
      options: [
        { value: 'inmersion', label: 'Con inmersión o profesor particular — rinde más' },
        { value: 'clases', label: 'Clases con tarea — el escenario de referencia' },
        { value: 'app', label: 'Solo, con app o autodidacta — rinde menos' },
      ],
      help: 'Las horas guiadas de referencia suponen clase más tarea. Este campo ajusta ese supuesto.',
    },
    {
      id: 'horasVideo',
      label: 'Horas de series o películas por semana en el idioma',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.5,
      value: 6,
    },
    {
      id: 'factorVideo',
      label: 'Cuánto rinde una hora de video',
      type: 'number',
      min: 0.1,
      max: 1,
      step: 0.05,
      value: 0.4,
      help: 'Fracción de hora de estudio activo que equivale a una hora de video. Referencia 0,3 a 0,5.',
    },
    {
      id: 'minutosApp',
      label: 'Minutos de Duolingo por día',
      type: 'number',
      min: 0,
      max: 300,
      step: 5,
      value: 20,
    },
    {
      id: 'similitud',
      label: 'Qué tan parecidos son entre sí los dos idiomas',
      type: 'select',
      value: 'distintos',
      options: [
        { value: 'distintos', label: 'Distintos — ej.: japonés y francés' },
        { value: 'similares', label: 'Parecidos — ej.: francés e italiano' },
        { value: 'muy-similares', label: 'Muy parecidos — ej.: portugués e italiano' },
      ],
    },
    {
      id: 'acentoNivel',
      label: 'Qué tan marcado es tu acento, del 1 al 10',
      type: 'number',
      min: 1,
      max: 10,
      step: 1,
      value: 5,
      help: '1 es casi imperceptible y 10 es un acento muy marcado que dificulta que te entiendan.',
    },
  ],
  fineprint:
    'No existe una tabla oficial única de horas por nivel MCER: el FSI publica categorías de dificultad medidas desde el inglés y sin equivalencia MCER, y Cambridge publica rangos de horas guiadas, no valores exactos. Todos los números de esta página son estimaciones de referencia construidas combinando las dos fuentes, y el tiempo real depende de tu experiencia previa con otros idiomas, del método, de la calidad de la práctica y de la constancia. Usalos para planificar, no como promesa.',

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu número dentro de la escala que corresponde a cada rama: la escalera de niveles MCER en horas acumuladas, la escala de dificultad FSI, el rango de vocabulario, la intensidad diaria de la app o la escala de acento. Ver la franja importa más que el número solo: entre B1 y B2 hay un salto que en horas es casi el doble que el de A2 a B1.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos base del idioma y su multiplicador de distancia, después las horas que faltan, después la conversión a semanas y meses, y al final las referencias para comparar.',

  faq: [
    {
      q: '¿Cuántas horas hacen falta para llegar a B2 en inglés?',
      a: 'Por la escala de este hub, alrededor de <b>550 horas guiadas acumuladas</b> desde cero. Si ya estás en A2 (unas 200 horas acumuladas), te faltan unas <b>350 horas</b>: a 8 horas por semana son unos <b>10 meses</b>. La base son las horas guiadas que publica Cambridge English por nivel MCER, tomando el punto medio de cada rango.',
    },
    {
      q: '¿Por qué cada calculadora me da un número distinto de horas?',
      a: 'Porque <b>no hay una tabla oficial única</b>. El FSI publica categorías de dificultad con horas totales, pero medidas <i>desde el inglés</i> y sin decir a qué nivel MCER corresponden. Cambridge publica horas guiadas por nivel MCER, pero para el inglés y en rangos amplios. El Consejo de Europa, que define el MCER, directamente no publica horas: describe competencias. Cada calculadora elige una combinación distinta y por eso los números no coinciden. Este hub usa una sola: Cambridge por nivel × un multiplicador de distancia derivado del FSI, y lo dice.',
    },
    {
      q: '¿Cómo se construyó la tabla de horas de esta página?',
      a: 'En dos piezas. <b>Base</b>: horas guiadas acumuladas de Cambridge English por nivel MCER, punto medio de cada rango publicado — A1 100, A2 200, B1 375, B2 550, C1 750 y C2 1.100 horas. <b>Multiplicador</b>: la distancia del idioma respecto del español, derivada de las categorías del FSI — 0,85 para los romances, 1,0 para el inglés (que es lo que mide Cambridge), 1,3 para alemán y neerlandés, 1,6 para ruso, polaco o turco y 2,9 para árabe, chino, japonés y coreano. Los multiplicadores están calibrados para que las horas hasta C1 reproduzcan aproximadamente las horas conocidas del FSI de cada categoría.',
    },
    {
      q: '¿El inglés es Cat II del FSI?',
      a: 'No, y es un error que arrastran varias calculadoras. <b>El inglés no está en la tabla del FSI</b> porque la tabla mide cuánto le cuesta a un angloparlante aprender otros idiomas: el inglés es el punto de partida, no un destino. Para un hispanohablante el inglés es un idioma cercano, más lejano que el italiano y bastante más cerca que el alemán. En esta página se usa como base de la escala, con multiplicador 1,0.',
    },
    {
      q: '¿Cuál es el idioma más fácil para un hispanohablante?',
      a: 'El <b>portugués</b>, seguido de cerca por el italiano. Los dos comparten con el español la mayor parte del léxico y una gramática casi calcada, y el FSI los ubica en la Cat I. Después vienen el francés —fácil de leer, mucho más difícil de escuchar— y el inglés. En el otro extremo, el árabe, el chino, el japonés y el coreano pueden pedir tres veces más horas para el mismo nivel.',
    },
    {
      q: '¿Cuánto vocabulario necesito para cada nivel del MCER?',
      a: 'Como referencia de la investigación de Nation y Milton: <b>A1</b> 500-800 palabras activas, <b>A2</b> 1.000-1.500, <b>B1</b> 2.000-2.500, <b>B2</b> 4.000-5.000, <b>C1</b> 8.000-10.000 y <b>C2</b> 16.000-20.000. El vocabulario pasivo —el que reconocés pero no producís— es alrededor del doble en cada nivel. Ojo: el MCER en sí no define umbrales de vocabulario, describe lo que sabés hacer con el idioma.',
    },
    {
      q: '¿Se puede llegar a B2 sólo con Duolingo?',
      a: 'No. Los árboles completos de los cursos más desarrollados llegan a un rango de <b>A2 a B1</b>, y la propia app no reclama más que eso. Duolingo funciona bien para sostener el hábito, fijar vocabulario básico y no perder contacto con el idioma, pero no entrena producción oral espontánea ni escritura extensa, que es justo lo que separa B1 de B2. Para pasar de ahí hace falta conversación, lectura larga y corrección.',
    },
    {
      q: '¿Cuánto rinde ver series y películas en el idioma?',
      a: 'Como referencia, una hora de video en el idioma equivale a entre <b>0,3 y 0,5 horas</b> de estudio activo, y esta página usa 0,4 por defecto. Con 6 horas semanales de series eso da unas 2,4 horas equivalentes por semana, cerca de 10 por mes. Dos condiciones: subtítulos en el idioma, no en español, y entender la mayor parte de lo que escuchás. Si te perdés todo el tiempo el rendimiento real se acerca a cero.',
    },
    {
      q: '¿Conviene aprender dos idiomas al mismo tiempo?',
      a: 'Sólo si el tiempo alcanza y los idiomas no son muy parecidos entre sí. Repartir el tiempo en dos ya te frena a la mitad, y encima aparece la interferencia: como supuesto de planificación esta página descuenta un 8% si los idiomas son distintos, 20% si son parecidos y 35% si son muy parecidos (portugués e italiano es el caso clásico). Lo más eficiente suele ser llevar uno a B1-B2 y recién después sumar el segundo, porque a partir de ahí el primero se sostiene con mucho menos tiempo.',
    },
    {
      q: '¿Cuánto tardo en perder el acento extranjero?',
      a: 'Depende de cuán marcado sea y de cuántas horas de práctica <i>específica de pronunciación</i> le dediques: como referencia, unas 15 semanas por cada punto en una escala de 1 a 10, repartidas según tus horas semanales. Con un acento 5/10 y 3 horas semanales, la mejora se vuelve perceptible en unos 6 meses. Importante: el objetivo razonable es la <b>inteligibilidad</b>, no el acento nativo. La investigación de Derwing y Munro muestra que se entiende perfecto con acento marcado, y que después de la adolescencia el acento indistinguible del nativo es la excepción.',
    },
    {
      q: '¿Por qué el salto de B1 a B2 se hace tan largo?',
      a: 'Porque a partir de B1 cada nivel exige más vocabulario y más precisión para el mismo avance visible. En horas la escalera es desparejo: de cero a A1 son unas 100 horas, de A1 a A2 otras 100, de A2 a B1 unas 175, de B1 a B2 otras 175 y de B2 a C1 unas 200 más, y de C1 a C2 unas 350. Sumado al hecho de que el vocabulario se duplica entre B1 y B2, se explica la sensación de meseta: seguís avanzando, pero el progreso deja de ser evidente semana a semana.',
    },
    {
      q: '¿Cuántas horas por semana conviene estudiar?',
      a: 'Como piso práctico, <b>3 horas semanales</b> repartidas en varios días. Por debajo de eso el olvido se come buena parte de lo aprendido entre sesión y sesión y la estimación de plazos se vuelve optimista. El punto dulce para la mayoría está entre 5 y 10 horas semanales sostenidas: más que eso acelera, pero es difícil de mantener durante los meses que el proyecto realmente dura. Y siempre rinde más repartir en cinco días que concentrar todo en uno.',
    },
  ],

  sources: [
    {
      name: 'Foreign Language Training — categorías de dificultad y horas de instrucción',
      url: 'https://www.state.gov/foreign-language-training/',
      publisher: 'Foreign Service Institute — U.S. Department of State',
    },
    {
      name: 'CEFR y horas guiadas de aprendizaje por nivel',
      url: 'https://www.cambridgeenglish.org/exams-and-tests/cefr/',
      publisher: 'Cambridge University Press & Assessment',
    },
    {
      name: 'Common European Framework of Reference for Languages (MCER)',
      url: 'https://www.coe.int/en/web/common-european-framework-reference-languages',
      publisher: 'Consejo de Europa',
    },
    {
      name: 'Duolingo Research — eficacia, retención y equivalencias de nivel',
      url: 'https://research.duolingo.com/',
      publisher: 'Duolingo',
    },
    {
      name: 'Paul Nation — investigación sobre tamaño y frecuencia de vocabulario',
      url: 'https://www.wgtn.ac.nz/lals/resources/paul-nations-resources',
      publisher: 'Victoria University of Wellington',
    },
    {
      name: 'Plan curricular del Instituto Cervantes — niveles de referencia',
      url: 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/',
      publisher: 'Instituto Cervantes',
    },
  ],

  replaces: [
    '/calculadora-horas-aprender-aleman-c1',
    '/calculadora-horas-aprender-italiano-b1',
    '/calculadora-horas-aprender-portugues-b2',
    '/calculadora-dificultad-idioma-fsi',
    '/calculadora-horas-estudio-idioma-fluidez-fsi',
    '/calculadora-ingles-nivel-mcer-horas-estudio-fsi',
    '/calculadora-anos-fluidez-idioma',
    '/calculadora-tiempo-c1-ingles-horas-semanales-meta-meses',
    '/calculadora-idioma-paralelo-2-al-mismo',
    '/calculadora-duolingo-tiempo-dia-nivel-mcer-progreso',
    '/calculadora-duolingo-xp-objetivo',
    '/calculadora-ingles-niveles-cambridge-duolingo-tiempo-conversion',
    '/calculadora-vocabulario-nivel-mcer-a1-c2-palabras',
    '/calculadora-horas-peliculas-serie-inmersion-idioma',
    '/calculadora-acento-extranjero-score-practica-horas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
