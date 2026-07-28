import type { HubData } from './types';

/**
 * Hub de decisión — "pH, equilibrio y estequiometría de la reacción"
 * Arquetipo RAMIFICADO (5 casos): pH desde [H⁺] o al revés (default), pOH desde
 * [OH⁻], pH de un ácido débil con Ka, constante de equilibrio Kc, y reactivo
 * limitante con rendimiento porcentual.
 *
 * Absorbe 7 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio.
 *  - `chart.type: 'scale'`: la regla es la escala de pH 0-14, que ya es
 *    logarítmica por construcción — acá las franjas SÍ van en unidades crudas.
 *  - La rama de reactivo limitante devuelve `position` sobre la misma regla
 *    usando el rendimiento porcentual reescalado a 0-14, y lo dice en el
 *    `positionLabel` para que no se lea como un pH.
 *
 * EXACTITUD: pKw = 14,00 vale a 25 °C. A 37 °C (temperatura corporal) el agua
 * neutra tiene pH 6,81, no 7,00 — el hub lo calcula con el Kw de la temperatura
 * cargada en vez de asumir 14 siempre, que es lo que hacían las calcs viejas.
 * El pH del ácido débil sale de la cuadrática exacta x² + Ka·x − Ka·C = 0, no
 * del atajo √(Ka·C), que falla cuando la disociación supera el 5%.
 */
export const hub: HubData = {
  slug: 'ciencia/ph-y-equilibrio-quimico',
  title: 'pH, pOH, ácidos débiles y equilibrio químico: calculadora',
  description:
    'Calculá el pH a partir de la concentración de H⁺ (o al revés), sacá el pOH desde [OH⁻], resolvé el pH de un ácido débil con su Ka usando la cuadrática exacta, calculá la constante de equilibrio Kc y determiná el reactivo limitante y el rendimiento porcentual de una reacción.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Química',
  h1: '¿Cuál es el pH y hasta dónde llega la reacción?',
  lede:
    'Cinco preguntas del mismo capítulo: cuán ácida es la solución, cuánto se disocia un ácido débil, hacia qué lado está corrido el equilibrio, cuál de los dos reactivos se termina primero y cuánto del máximo teórico realmente sacaste del matraz.',
  stamps: [
    'Actualizado 27-07-2026',
    'Kw corregido por temperatura',
    'Ácido débil por cuadrática exacta',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Las tres primeras devuelven siempre el par pH/pOH completo, así no tenés que hacer la resta a mano.',
    items: [
      {
        id: 'ph',
        label: 'pH desde la concentración de H⁺ (o al revés)',
        hint: 'pH = −log[H⁺]',
        answer:
          'pH = −log[H⁺] y, al revés, [H⁺] = 10^(−pH). Cada unidad de pH es un factor 10 en la concentración de protones.',
        yes: [
          'El pH y el pOH, con las concentraciones de H⁺ y de OH⁻ en notación científica',
          'La clasificación como ácida, neutra o alcalina en la escala del momento',
          'El punto neutro real a la temperatura que cargues, que a 25 °C es 7,00 pero a 37 °C es 6,81',
          'Comparaciones reconocibles: jugo gástrico, vinagre, agua de red, sangre, lavandina',
        ],
        warn: [
          'La escala es LOGARÍTMICA: un pH 4 no es "un poco más ácido" que un pH 5, es diez veces más ácido',
          'El pH 7 sólo es neutro a 25 °C. La neutralidad es donde [H⁺] = [OH⁻], y ese punto se corre con la temperatura',
          'La escala no termina en 0 ni en 14: un ácido muy concentrado puede dar pH negativo y una base fuerte, más de 14',
          'El pH mide ACTIVIDAD de protones, no concentración total de ácido: un ácido débil concentrado puede tener pH más alto que un ácido fuerte diluido',
        ],
        plazo:
          'un pHmetro se calibra con buffers antes de cada jornada de trabajo; las tiras reactivas leen ±0,5 unidades y no sirven para trabajo cuantitativo.',
      },
      {
        id: 'poh',
        label: 'pOH desde la concentración de OH⁻',
        hint: 'pOH = −log[OH⁻], y pH + pOH = pKw',
        answer:
          'pOH = −log[OH⁻]. Con pH + pOH = 14,00 a 25 °C, sacar uno te da el otro de forma directa.',
        yes: [
          'El pOH, el pH complementario y las dos concentraciones iónicas',
          'La suma pH + pOH ajustada al pKw de la temperatura, no fija en 14',
          'La lectura de si la solución es ácida o alcalina y con cuánto margen',
          'Referencias de soluciones alcalinas de uso diario para ubicar el resultado',
        ],
        warn: [
          'pH + pOH = 14 es una simplificación válida sólo a 25 °C: a 60 °C la suma da 13,02',
          'Una base fuerte 1 M no tiene pOH 0 exacto porque la actividad iónica se aparta de la concentración',
          'El amoníaco y las aminas son bases DÉBILES: su [OH⁻] no es la concentración nominal sino la que fija el Kb',
          'Las soluciones alcalinas atacan el vidrio y toman CO₂ del aire, y ese CO₂ les baja el pH con los días',
        ],
        plazo:
          'una solución de NaOH guardada en frasco de vidrio pierde título de forma medible en semanas; en polietileno bien cerrado aguanta meses.',
      },
      {
        id: 'debil',
        label: 'pH de un ácido débil con su Ka',
        hint: 'La cuadrática exacta, no el atajo √(Ka·C)',
        answer:
          'Se resuelve x² + Ka·x − Ka·C = 0, donde x es [H⁺]. El atajo √(Ka·C) sólo vale si la disociación queda por debajo del 5%.',
        yes: [
          'El pH real de la solución resolviendo la cuadrática completa',
          'El pKa del ácido y el porcentaje de disociación en esas condiciones',
          'La comparación contra el pH que daría un ácido fuerte a la misma concentración',
          'Un aviso cuando la aproximación clásica √(Ka·C) hubiera sido válida y cuánto se habría equivocado',
        ],
        warn: [
          'El atajo √(Ka·C) sobreestima el [H⁺] cuando la disociación pasa el 5%: por eso acá se usa la cuadrática',
          'El modelo no incluye la autoionización del agua: para ácidos ultradiluidos (menos de 10⁻⁶ M) el resultado se aparta',
          'El Ka depende de la temperatura y del solvente: los valores de tabla son en agua a 25 °C',
          'Un ácido poliprótico tiene un Ka por cada protón; esta rama modela sólo el primero, que es el que domina el pH',
        ],
        plazo:
          'un buffer preparado con un ácido débil y su sal mantiene el pH mientras no se consuma la capacidad amortiguadora: trabaja mejor a pH = pKa ± 1.',
      },
      {
        id: 'kc',
        label: 'Constante de equilibrio Kc',
        hint: 'Kc = [productos]^coef / [reactivos]^coef',
        answer:
          'Kc = [C]^c / ([A]^a · [B]^b). Si Kc es mayor que 1 el equilibrio está corrido a productos; si es menor, a reactivos.',
        yes: [
          'El valor de Kc con las concentraciones y los coeficientes estequiométricos que cargues',
          'El Δn de la reacción, que es lo que relaciona Kc con Kp',
          'La lectura de hacia qué lado está desplazado el equilibrio y con cuánta fuerza',
          'El numerador y el denominador por separado, para ver de dónde sale el número',
        ],
        warn: [
          'Las concentraciones tienen que ser las del EQUILIBRIO, no las iniciales: ese es el error clásico',
          'Los sólidos puros y los líquidos puros no entran en la expresión de Kc',
          'Kc sólo cambia con la TEMPERATURA: agregar reactivo o poner un catalizador mueve las concentraciones, nunca el valor de Kc',
          'Kc y Kp coinciden sólo si Δn = 0; si no, Kp = Kc × (RT)^Δn y hay que cuidar las unidades de R',
        ],
        plazo:
          'el equilibrio es dinámico y no tiene plazo: se alcanza cuando las velocidades directa e inversa se igualan, y el catalizador sólo acorta el tiempo que tarda.',
      },
      {
        id: 'limitante',
        label: 'Reactivo limitante y rendimiento',
        hint: 'Cuál se termina primero y cuánto se obtuvo de verdad',
        answer:
          'Limita el reactivo con el menor cociente mol/coeficiente. Ese cociente fija el avance de la reacción y el rendimiento teórico.',
        yes: [
          'Cuál de los dos reactivos limita y cuál sobra, con la cantidad exacta que queda sin reaccionar',
          'El avance de reacción y el rendimiento teórico de producto en moles',
          'El rendimiento porcentual comparando lo que obtuviste con el máximo teórico',
          'Cómo se multiplican los rendimientos en una ruta de varias etapas',
        ],
        warn: [
          'El limitante NO es el que está en menor cantidad: es el que tiene el menor cociente mol dividido coeficiente',
          'El rendimiento teórico supone conversión total, y eso casi nunca pasa: hay pérdidas en la transferencia, en el filtrado y en la purificación',
          'Un rendimiento superior al 100% es físicamente imposible: el producto está húmedo o impuro, hay que secar a peso constante y volver a pesar',
          'La ecuación tiene que estar BALANCEADA antes de usar los coeficientes, o todo el cálculo arrastra el error',
        ],
        plazo:
          'en una síntesis de varias etapas los rendimientos se multiplican: tres pasos al 80% dan un 51% global, no un 80%.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba. La temperatura afecta a las tres primeras ramas: cambia el Kw del agua y con él el punto neutro de la escala.',
  fields: [
    {
      id: 'modoPh',
      label: 'pH — qué dato tenés',
      type: 'select',
      value: 'concentracion',
      options: [
        { value: 'concentracion', label: 'Tengo la concentración de H⁺ y quiero el pH' },
        { value: 'ph', label: 'Tengo el pH y quiero la concentración de H⁺' },
      ],
    },
    {
      id: 'concH',
      label: 'Concentración de H⁺',
      type: 'number',
      suffix: 'mol/L',
      value: 0.0001,
      min: 0,
      step: 0.0000001,
      help: 'Jugo gástrico ≈ 0,03 · vinagre ≈ 0,0018 · agua pura 1 × 10⁻⁷.',
    },
    { id: 'phDato', label: 'pH conocido', type: 'number', value: 4, min: -2, max: 16, step: 0.01 },
    {
      id: 'concOH',
      label: 'Concentración de OH⁻',
      type: 'number',
      suffix: 'mol/L',
      value: 0.001,
      min: 0,
      step: 0.0000001,
      help: 'Amoníaco de limpieza ≈ 0,004 · lavandina diluida ≈ 0,01 · soda cáustica 0,1 M = 0,1.',
    },
    {
      id: 'temp',
      label: 'Temperatura de la solución',
      type: 'number',
      suffix: '°C',
      value: 25,
      min: 0,
      max: 100,
      step: 1,
      help: 'A 25 °C el punto neutro es pH 7,00. A 37 °C baja a 6,81 y a 0 °C sube a 7,47.',
    },
    {
      id: 'ka',
      label: 'Ácido débil — constante Ka',
      type: 'number',
      value: 0.0000175,
      min: 0,
      step: 0.0000000001,
      help: 'Acético 1,75 × 10⁻⁵ · fórmico 1,8 × 10⁻⁴ · cianhídrico 6,2 × 10⁻¹⁰ · carbónico 4,3 × 10⁻⁷.',
    },
    {
      id: 'concAcido',
      label: 'Ácido débil — concentración inicial',
      type: 'number',
      suffix: 'mol/L',
      value: 0.1,
      min: 0,
      step: 0.0001,
    },
    { id: 'prod', label: 'Equilibrio — concentración del producto', type: 'number', suffix: 'mol/L', value: 0.5, min: 0, step: 0.0001 },
    { id: 'coefProd', label: 'Equilibrio — coeficiente del producto', type: 'number', value: 2, min: 1, step: 1 },
    { id: 'reac1', label: 'Equilibrio — concentración del reactivo 1', type: 'number', suffix: 'mol/L', value: 0.2, min: 0, step: 0.0001 },
    { id: 'coef1', label: 'Equilibrio — coeficiente del reactivo 1', type: 'number', value: 1, min: 1, step: 1 },
    { id: 'reac2', label: 'Equilibrio — concentración del reactivo 2', type: 'number', suffix: 'mol/L', value: 0.3, min: 0, step: 0.0001 },
    { id: 'coef2', label: 'Equilibrio — coeficiente del reactivo 2', type: 'number', value: 3, min: 1, step: 1 },
    { id: 'molA', label: 'Reacción — moles disponibles del reactivo A', type: 'number', suffix: 'mol', value: 2, min: 0, step: 0.0001 },
    { id: 'coefA', label: 'Reacción — coeficiente de A en la ecuación balanceada', type: 'number', value: 1, min: 1, step: 1 },
    { id: 'molB', label: 'Reacción — moles disponibles del reactivo B', type: 'number', suffix: 'mol', value: 5, min: 0, step: 0.0001 },
    { id: 'coefB', label: 'Reacción — coeficiente de B', type: 'number', value: 3, min: 1, step: 1 },
    { id: 'coefP', label: 'Reacción — coeficiente del producto', type: 'number', value: 2, min: 1, step: 1 },
    {
      id: 'real',
      label: 'Reacción — producto que obtuviste de verdad',
      type: 'number',
      suffix: 'mol',
      value: 1.2,
      min: 0,
      step: 0.0001,
      help: 'Dejalo en 0 si sólo querés el rendimiento teórico y todavía no hiciste la reacción.',
    },
  ],
  fineprint:
    'Los cálculos de pH suponen soluciones acuosas diluidas donde la actividad se aproxima a la concentración: en soluciones concentradas o con mucha fuerza iónica hay que usar coeficientes de actividad. El Kw se corrige por temperatura con datos tabulados; el pH del ácido débil sale de la cuadrática exacta e ignora la autoionización del agua, que sólo importa por debajo de 10⁻⁶ M. Nada de esto reemplaza a la medición con pHmetro calibrado.',

  chart: {
    type: 'scale',
    title: 'Dónde cae en la escala de pH',
    caption:
      'La escala de pH va de 0 a 14 y ya es logarítmica por definición: cada unidad es un factor diez en la concentración de protones. Las franjas marcan la zona ácida, la neutra y la alcalina, y tu resultado queda ubicado sobre esa regla junto a las referencias de uso diario.',
    bands: [
      { label: '0 a 3 — muy ácido: jugo gástrico, ácido de batería', from: 0, to: 3, tone: 'bad' },
      { label: '3 a 6,5 — ácido: vinagre, jugo de naranja, café', from: 3, to: 6.5, tone: 'warn' },
      { label: '6,5 a 7,5 — neutro: agua pura, sangre, saliva', from: 6.5, to: 7.5, tone: 'good' },
      { label: '7,5 a 11 — alcalino: bicarbonato, jabón, agua de mar', from: 7.5, to: 11, tone: 'warn' },
      { label: '11 a 14 — muy alcalino: amoníaco, lavandina, soda cáustica', from: 11, to: 14, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay valores de pH sin unidad, concentraciones en mol/L, moles y porcentajes. Las barras comparan el número de cada fila entre sí, así que una concentración de 10⁻⁷ siempre va a dar una barra invisible: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cómo se calcula el pH a partir de la concentración de H⁺?',
      a: 'Con pH = −log₁₀[H⁺]. Si la concentración de protones es 1 × 10⁻⁴ mol/L, el pH es 4. Al revés, [H⁺] = 10^(−pH): un pH de 5,5 corresponde a 3,16 × 10⁻⁶ mol/L. Lo importante es que la escala es logarítmica, así que una diferencia de una unidad de pH significa un factor diez en la concentración de protones, y una diferencia de tres unidades, mil veces.',
    },
    {
      q: '¿El pH 7 siempre es neutro?',
      a: 'No: sólo a 25 °C. Neutro significa [H⁺] = [OH⁻], y ese punto lo fija el producto iónico del agua, el Kw, que crece con la temperatura. A 25 °C el pKw vale 14,00 y el punto neutro es 7,00; a 37 °C, la temperatura del cuerpo, el pKw baja a 13,62 y el agua neutra tiene pH 6,81; a 0 °C sube a 7,47. El agua no se vuelve ácida al calentarse: se corre la escala entera.',
    },
    {
      q: '¿Cuál es la relación entre pH y pOH?',
      a: 'pH + pOH = pKw, que a 25 °C vale 14,00. Si el pOH es 3, el pH es 11 y la solución es marcadamente alcalina. Igual que el pH, el pOH sale del logaritmo negativo: pOH = −log[OH⁻]. La regla de "restar de 14" funciona en la práctica de aula, pero hay que recordar que ese 14 es un valor que depende de la temperatura.',
    },
    {
      q: '¿Por qué el pH de un ácido débil no se calcula igual que el de uno fuerte?',
      a: 'Porque un ácido fuerte se disocia por completo y su [H⁺] es directamente su concentración, mientras que uno débil se disocia sólo parcialmente y hay que resolver el equilibrio. Para el ácido acético 0,1 M con Ka = 1,75 × 10⁻⁵, la ecuación x² + Ka·x − Ka·C = 0 da [H⁺] = 1,31 × 10⁻³ y pH 2,88, muy lejos del pH 1 que daría un ácido fuerte a la misma concentración. Sólo se disocia el 1,3% de las moléculas.',
    },
    {
      q: '¿Cuándo sirve el atajo √(Ka·C) y cuándo no?',
      a: 'Sirve mientras la disociación quede por debajo del 5% de la concentración inicial, que es la regla práctica de los libros. Por debajo de ese umbral, despreciar la x del denominador cambia el pH en menos de 0,02 unidades. Cuando el ácido es relativamente fuerte o está muy diluido, la disociación pasa el 5% y el atajo sobreestima el [H⁺]: ahí hay que ir a la cuadrática completa, que es lo que hace este cálculo siempre.',
    },
    {
      q: '¿Qué es el pKa y para qué sirve?',
      a: 'pKa = −log(Ka) y es la forma cómoda de comparar fuerzas de ácidos: cuanto más chico el pKa, más fuerte el ácido. El acético tiene pKa 4,76 y el cianhídrico 9,21, así que el acético es unos cuatro órdenes de magnitud más fuerte. El pKa también dice dónde funciona mejor un buffer: la capacidad amortiguadora es máxima cuando el pH del medio es igual al pKa, y sigue siendo útil en pH = pKa ± 1.',
    },
    {
      q: '¿Cómo se calcula la constante de equilibrio Kc?',
      a: 'Se ponen las concentraciones de equilibrio de los productos en el numerador y las de los reactivos en el denominador, cada una elevada a su coeficiente estequiométrico. Para aA + bB ⇌ cC: Kc = [C]^c / ([A]^a · [B]^b). Un Kc grande —por encima de 1.000— significa que el equilibrio está muy corrido a productos; uno chico —por debajo de 0,001—, que casi no hay reacción. Los sólidos y los líquidos puros no se incluyen en la expresión.',
    },
    {
      q: '¿Qué diferencia hay entre Kc y Kp?',
      a: 'Kc usa concentraciones molares y Kp, presiones parciales. Se relacionan por Kp = Kc × (RT)^Δn, donde Δn es la diferencia entre los moles gaseosos de productos y de reactivos. Si Δn = 0, los dos valores coinciden. Para la síntesis de amoníaco N₂ + 3H₂ ⇌ 2NH₃, Δn = 2 − 4 = −2, así que Kp es bastante menor que Kc a temperatura ambiente.',
    },
    {
      q: '¿Cómo sé cuál es el reactivo limitante?',
      a: 'Dividís los moles disponibles de cada reactivo por su coeficiente en la ecuación balanceada y el cociente MENOR marca el limitante. Con 2 mol de A (coeficiente 1) y 5 mol de B (coeficiente 3), los cocientes son 2 y 1,67: limita B, aunque haya más moles de B que de A. Ese es exactamente el error frecuente: mirar la cantidad en vez del cociente. El cociente menor es además el avance de reacción, y multiplicado por el coeficiente del producto da el rendimiento teórico.',
    },
    {
      q: '¿Cómo se calcula el rendimiento porcentual de una reacción?',
      a: 'Rendimiento % = (obtenido real / máximo teórico) × 100. Si el limitante permite 1,67 mol de producto y aislaste 1,2 mol, el rendimiento es del 71,9%. Un valor entre 70% y 90% se considera bueno en síntesis orgánica; por debajo del 50% conviene revisar el procedimiento. Y en una ruta de varias etapas los rendimientos se multiplican, no se promedian: tres pasos al 80% dan un 51,2% global.',
    },
    {
      q: '¿Puede dar un rendimiento mayor al 100%?',
      a: 'Numéricamente sí, físicamente no. Cuando pasa, la causa casi siempre es la misma: el producto está húmedo, con solvente residual, o contaminado con sales de la reacción. La solución es secar a peso constante —pesar, secar otro rato, volver a pesar hasta que el valor no cambie— y verificar la pureza antes de informar el número. Un rendimiento del 105% no es un buen resultado: es una señal de que la muestra está sucia.',
    },
    {
      q: '¿Qué pasa con el pH cuando diluyo un ácido diez veces?',
      a: 'En un ácido FUERTE el pH sube exactamente una unidad, porque la concentración de protones baja a la décima parte. En un ácido DÉBIL no: al diluir se favorece la disociación, así que la concentración de protones baja menos de lo proporcional y el pH sube menos de una unidad, típicamente entre 0,4 y 0,5. Y hay un piso: por más que diluyas, el pH nunca pasa de 7 hacia el lado ácido, porque el agua misma aporta sus protones.',
    },
  ],

  sources: [
    {
      name: 'IUPAC Compendium of Chemical Terminology ("Gold Book") — definiciones de pH, Ka, Kc y actividad',
      url: 'https://goldbook.iupac.org/',
      publisher: 'International Union of Pure and Applied Chemistry',
    },
    {
      name: 'The Measurement of pH — Definition, Standards and Procedures (IUPAC Recommendations)',
      url: 'https://iupac.org/what-we-do/recommendations/',
      publisher: 'IUPAC',
    },
    {
      name: 'NIST Chemistry WebBook — producto iónico del agua y constantes de disociación',
      url: 'https://webbook.nist.gov/chemistry/',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'CRC Handbook of Chemistry and Physics — tabla de Kw del agua en función de la temperatura',
      url: 'https://hbcp.chemnetbase.com/',
      publisher: 'CRC Press / Taylor & Francis',
    },
  ],

  replaces: [
    '/calculadora-ph-concentracion-hidrogeno',
    '/calculadora-poh-concentracion-oh',
    '/calculadora-ph-acido-debil-ka',
    '/calculadora-constante-equilibrio-kc',
    '/calculadora-reactivo-limitante-estequiometria',
    '/calculadora-rendimiento-porcentual-reaccion',
    '/calculadora-numero-oxidacion-elemento',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * pKw del agua en función de la temperatura (CRC Handbook).
 * A 25 °C vale 14,00 exacto por convención de la tabla; el resto se interpola
 * linealmente entre estos puntos. Sin esto, el hub asumiría pH neutro = 7
 * siempre, que es lo que hacían las calculadoras que absorbe.
 */
export const PKW = [
  { t: 0, pkw: 14.943 },
  { t: 10, pkw: 14.535 },
  { t: 20, pkw: 14.167 },
  { t: 25, pkw: 13.995 },
  { t: 30, pkw: 13.833 },
  { t: 37, pkw: 13.62 },
  { t: 40, pkw: 13.535 },
  { t: 50, pkw: 13.262 },
  { t: 60, pkw: 13.017 },
  { t: 80, pkw: 12.598 },
  { t: 100, pkw: 12.265 },
];

/** Referencias reconocibles sobre la escala de pH. */
export const REFS = [
  { ph: 1.0, label: 'el jugo gástrico' },
  { ph: 2.4, label: 'el jugo de limón' },
  { ph: 2.9, label: 'el vinagre' },
  { ph: 3.5, label: 'el jugo de naranja' },
  { ph: 5.0, label: 'el café negro' },
  { ph: 6.5, label: 'la leche' },
  { ph: 7.0, label: 'el agua pura a 25 °C' },
  { ph: 7.4, label: 'la sangre' },
  { ph: 8.2, label: 'el agua de mar' },
  { ph: 8.4, label: 'el bicarbonato de sodio' },
  { ph: 11.0, label: 'el amoníaco de limpieza' },
  { ph: 12.6, label: 'la lavandina concentrada' },
  { ph: 13.5, label: 'la soda cáustica' },
];
