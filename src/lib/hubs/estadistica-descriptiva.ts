import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué me dicen estos datos?"
 * Arquetipo RAMIFICADO: 5 ramas = las cinco preguntas de estadística
 * descriptiva que alguien se hace frente a una lista de números.
 * Absorbe 5 URLs (ver `replaces`).
 *
 * DESLINDE con los hubs vecinos:
 *  - /matematica/probabilidad cubre lo aleatorio (dados, combinatoria,
 *    binomial, normal como distribución). Acá NO se calcula ninguna
 *    probabilidad: se describe un conjunto de datos que ya tenés.
 *  - /matematica/estadistica-inferencial cubre el salto de la muestra a la
 *    población (tamaño de muestra, intervalos, correlación, chi-cuadrado).
 *    Acá nos quedamos dentro de los datos, sin generalizar.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara 'plain' o 'unit'.
 */
export const hub: HubData = {
  slug: 'matematica/estadistica-descriptiva',
  title: '¿Qué me dicen estos datos? — Media, mediana, desvío y percentiles',
  description:
    'Media, mediana, moda y rango; varianza y desvío estándar (poblacional o muestral); coeficiente de variación; percentiles, cuartiles y outliers; z-score. Con la fórmula, la sustitución y la lectura de cada resultado.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de estadística',
  h1: '¿Qué me dicen estos datos?',
  lede:
    'Describir un conjunto de datos son dos preguntas: dónde está el centro y qué tan desparramados están alrededor. Empezamos por el resumen clásico —media, mediana, moda y rango— y desde ahí bajás a la dispersión, a los percentiles o al z-score.',
  stamps: ['Actualizado 27-07-2026', '5 análisis descriptivos adentro', 'Con la fórmula y la lectura'],

  resultLabel: 'El estadístico principal de tu rama',

  cases: {
    title: '¿Qué querés saber de tus datos?',
    intro:
      'Las tres primeras ramas describen todo el conjunto; las dos últimas ubican a UN dato dentro del conjunto. Elegí según qué pregunta te hicieron.',
    items: [
      {
        id: 'resumen',
        label: 'Media, mediana, moda y rango',
        hint: 'Ej.: "¿cuál es el promedio y la mediana de estas 12 notas?"',
        answer: 'La media es el promedio, la mediana el valor del medio, la moda el que más se repite y el rango la distancia entre el mayor y el menor.',
        yes: [
          'Media: sumás todos los datos y dividís por cuántos son',
          'Mediana: ordenás y agarrás el del medio (si n es par, el promedio de los dos centrales)',
          'Moda: el valor que más veces aparece; puede haber más de una, o ninguna útil',
          'Rango: el máximo menos el mínimo, la medida de dispersión más simple que existe',
        ],
        warn: [
          'La media se deja arrastrar por los valores extremos; la mediana no. Con sueldos o precios de propiedades, la mediana describe mejor',
          'Si la media supera a la mediana hay valores altos estirando la distribución hacia arriba (sesgo a la derecha); si queda por debajo, pasa lo contrario',
          'El rango depende de sólo dos datos: un único outlier lo dispara y deja de representar nada',
        ],
        plazo: 'lectura rápida: si media y mediana están cerca, tu distribución es aproximadamente simétrica.',
      },
      {
        id: 'dispersion',
        label: 'Varianza y desvío estándar',
        hint: 'Ej.: "¿qué tan dispersos están estos valores respecto del promedio?"',
        answer: 'La varianza es el promedio de los desvíos al cuadrado; el desvío estándar es su raíz y se lee en la misma unidad que los datos.',
        yes: [
          'Varianza: promediás las diferencias contra la media, elevadas al cuadrado',
          'Desvío estándar: la raíz cuadrada de la varianza, en la unidad original de los datos',
          'Si tus datos son TODA la población, dividís por n (σ poblacional)',
          'Si son una MUESTRA de algo más grande, dividís por n − 1 (s muestral, corrección de Bessel)',
        ],
        warn: [
          'Elegir mal entre n y n − 1 cambia el resultado, y la diferencia se nota mucho con pocos datos',
          'La varianza está en unidades al cuadrado (pesos², cm²): no se puede comparar con los datos originales, por eso se usa el desvío',
          'Con n = 1 no hay desvío muestral posible: dividirías por cero',
        ],
        plazo: 'regla empírica: si la distribución es aproximadamente normal, el 68% de los datos cae dentro de ±1 desvío de la media.',
      },
      {
        id: 'cv',
        label: 'Coeficiente de variación (CV)',
        hint: 'Ej.: "¿cuál de estas dos series es más estable, si están en unidades distintas?"',
        answer: 'El CV es el desvío estándar como porcentaje de la media: permite comparar la dispersión de series que no comparten unidad.',
        yes: [
          'Fórmula: CV = desvío ÷ |media| × 100',
          'Es un número sin unidad, así que compara peras con manzanas: la variabilidad de sueldos contra la de alturas',
          'Referencia habitual: menos de 15% baja, entre 15% y 30% moderada, más de 30% alta',
          'También se usa como control de calidad en laboratorio y en producción',
        ],
        warn: [
          'Si la media es 0 el CV no existe: dividirías por cero',
          'Con datos que tienen valores negativos y positivos mezclados el CV pierde sentido: la media queda cerca de cero y el porcentaje se dispara',
          'Los cortes 15% y 30% son convenciones de uso, no una regla universal: en algunos rubros el umbral es distinto',
        ],
        plazo: 'lectura: un CV del 20% significa que el desvío equivale a la quinta parte del valor promedio.',
      },
      {
        id: 'percentil',
        label: 'Percentiles, cuartiles y outliers',
        hint: 'Ej.: "mi valor 78, ¿en qué percentil queda dentro de estos datos?"',
        answer: 'El percentil dice qué porcentaje de los datos queda por debajo de tu valor; los cuartiles parten el conjunto en cuatro.',
        yes: [
          'Percentil del dato: cuántos datos son menores o iguales al tuyo, sobre el total, por 100',
          'Q1, Q2 (la mediana) y Q3 parten los datos ordenados en cuatro grupos del 25%',
          'Rango intercuartílico: IQR = Q3 − Q1, la dispersión del 50% central, inmune a los extremos',
          'Regla de outliers: es atípico todo dato fuera de [Q1 − 1,5×IQR ; Q3 + 1,5×IQR]',
        ],
        warn: [
          'Hay varias definiciones de percentil y no siempre coinciden: acá el percentil del dato cuenta los "menores o iguales", y los cuartiles se calculan interpolando entre posiciones',
          'Con pocos datos los cuartiles son inestables: agregar un valor puede correr Q1 y Q3 bastante',
          'Estar en el percentil 90 no significa sacar 90 puntos: significa superar al 90% del grupo',
        ],
        plazo: 'lectura: el percentil siempre es relativo a ESTE conjunto de datos, no a una escala absoluta.',
      },
      {
        id: 'zscore',
        label: 'Z-score (a cuántos desvíos de la media)',
        hint: 'Ej.: "saqué 78 con media 70 y desvío 8, ¿es mucho?"',
        answer: 'El z-score mide a cuántos desvíos estándar de la media está tu valor: z = (x − μ) ÷ σ.',
        yes: [
          'Fórmula: z = (x − media) ÷ desvío',
          'z positivo: estás por encima de la media; negativo: por debajo',
          'Estandariza: permite comparar una nota de matemática con una de historia aunque tengan escalas distintas',
          'Si la distribución es aproximadamente normal, el z se traduce a un percentil',
        ],
        warn: [
          'El percentil que sale del z SÓLO vale si la distribución es aproximadamente normal. Con datos muy sesgados, el número engaña',
          'El desvío tiene que ser mayor que 0',
          'Referencias: |z| menor a 1 es lo habitual (68% central), entre 2 y 3 ya es atípico y más de 3 es raro (fuera del 99,7%)',
        ],
        plazo: 'lectura: z = 2 quiere decir que estás dos desvíos por encima del promedio, en el 2,3% superior si la distribución es normal.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Las ramas de resumen, dispersión y percentiles trabajan sobre la lista de datos. Las de CV y z-score toman la media y el desvío directamente, por si ya los tenés calculados.',
  fields: [
    {
      id: 'datos',
      label: 'Tus datos, separados por coma',
      value: '12, 15, 15, 18, 21, 24, 24, 24, 30, 45',
      help: 'Ramas de resumen, dispersión y percentiles. Aceptamos coma, punto y coma o espacio como separador.',
    },
    { id: 'valor', label: 'x — el dato que querés ubicar', value: '24', help: 'Ramas de percentil y z-score.' },
    { id: 'media', label: 'Media (μ) — sólo CV y z-score', value: '70', help: 'Si ya tenés la media calculada, cargala acá. En las otras ramas se calcula sola desde la lista.' },
    { id: 'desvio', label: 'Desvío estándar (σ) — sólo CV y z-score', value: '8', help: 'Tiene que ser mayor que 0.' },
    {
      id: 'tipo',
      label: '¿Tus datos son toda la población o una muestra?',
      type: 'select',
      value: 'pob',
      options: [
        { value: 'pob', label: 'Población completa — dividir por n (σ)' },
        { value: 'mue', label: 'Muestra de algo más grande — dividir por n − 1 (s)' },
      ],
      help: 'Sólo afecta a la rama de varianza y desvío.',
    },
  ],
  fineprint:
    'Aceptamos coma decimal en los campos sueltos ("1,5" es uno y medio), pero en la LISTA de datos la coma es el separador: escribí los decimales con punto (12.5) para que no se partan en dos.',

  chart: {
    type: 'bars',
    title: 'Tus datos, ordenados',
    caption:
      'Cada barra es un dato de tu lista, ordenada de menor a mayor. Ver la forma es la mejor manera de entender por qué la media y la mediana pueden estar lejos: si hay una o dos barras mucho más altas que el resto, esas son las que estiran la media hacia arriba mientras la mediana se queda quieta.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: los datos que entraron, la fórmula sustituida, el resultado y la lectura. En la rama de dispersión aparece la suma de cuadrados, que es donde se comete la mayoría de los errores.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre media y mediana?',
      a: 'La <b>media</b> es el promedio: sumás todo y dividís por la cantidad. La <b>mediana</b> es el valor que queda justo en el medio al ordenar los datos. La diferencia importa cuando hay valores extremos: en la serie 10, 10, 10, 10, 200 la media es <b>48</b> y la mediana <b>10</b>. Por eso los ingresos y los precios se informan casi siempre con la mediana.',
    },
    {
      q: '¿Cuándo divido por n y cuándo por n − 1 para el desvío?',
      a: 'Por <b>n</b> cuando tus datos son toda la población que te interesa (las notas de ESTE curso). Por <b>n − 1</b> cuando son una <b>muestra</b> con la que querés estimar algo más grande (100 clientes para hablar de todos). Dividir por n − 1 es la corrección de Bessel: sin ella, la muestra subestima sistemáticamente la dispersión real.',
    },
    {
      q: '¿Qué diferencia hay entre varianza y desvío estándar?',
      a: 'El desvío estándar es la <b>raíz cuadrada</b> de la varianza. La varianza queda en unidades al cuadrado (pesos², cm²), que no se pueden comparar con los datos; el desvío vuelve a la unidad original y por eso es el que se informa. La varianza sirve para las cuentas intermedias, el desvío para leer el resultado.',
    },
    {
      q: '¿Para qué sirve el coeficiente de variación?',
      a: 'Para comparar la dispersión de <b>series con unidades distintas</b> o de escalas muy diferentes. Un desvío de 5 kg no dice nada por sí solo: sobre una media de 8 kg es enorme (CV 62%), sobre una media de 500 kg es despreciable (CV 1%). La convención habitual es: menos de <b>15%</b> baja variabilidad, <b>15-30%</b> moderada, más de <b>30%</b> alta.',
    },
    {
      q: '¿Qué significa estar en el percentil 90?',
      a: 'Que tu valor <b>supera al 90% de los datos</b> del conjunto, no que sacaste 90 puntos. Es una medida relativa: el mismo valor puede caer en el percentil 30 de un grupo y en el 95 de otro. Por eso siempre hay que decir respecto a qué conjunto se calculó.',
    },
    {
      q: '¿Qué son los cuartiles y el rango intercuartílico?',
      a: 'Los cuartiles parten los datos ordenados en cuatro grupos del 25%: <b>Q1</b> deja abajo al 25%, <b>Q2</b> es la mediana y <b>Q3</b> deja abajo al 75%. El <b>rango intercuartílico (IQR = Q3 − Q1)</b> mide la dispersión del 50% central y, a diferencia del rango total, no se altera por uno o dos valores extremos.',
    },
    {
      q: '¿Cómo se detecta un valor atípico (outlier)?',
      a: 'Con la regla de Tukey: es atípico todo dato que caiga fuera del intervalo <b>[Q1 − 1,5 × IQR ; Q3 + 1,5 × IQR]</b>. Es el criterio que usan los diagramas de caja. Detectar un outlier no significa borrarlo: primero hay que entender si es un error de carga o un caso real que importa.',
    },
    {
      q: '¿Qué es el z-score y cómo se interpreta?',
      a: 'Es la distancia a la media medida en desvíos: <b>z = (x − μ) ÷ σ</b>. Un z de 1,5 significa que estás un desvío y medio por encima del promedio. La referencia práctica: <b>|z| &lt; 1</b> es lo habitual, entre 2 y 3 ya es atípico y más de 3 es raro. El signo dice de qué lado de la media caíste.',
    },
    {
      q: '¿El percentil que sale del z-score siempre vale?',
      a: 'No. Convertir un z en percentil supone que la distribución es <b>aproximadamente normal</b>. Si tus datos son muy asimétricos —ingresos, tiempos de espera, cantidad de clientes por día— ese percentil puede estar muy lejos de la realidad. Con datos sesgados conviene calcular el percentil directamente sobre la lista, que es lo que hace la rama de percentiles.',
    },
    {
      q: '¿Puede haber más de una moda?',
      a: 'Sí. Si dos o más valores empatan en la frecuencia máxima, la distribución es <b>bimodal</b> o multimodal, y eso suele ser una señal de que estás mezclando dos grupos distintos en la misma lista. Y si todos los valores aparecen una sola vez, la moda no aporta nada.',
    },
    {
      q: '¿Qué es la regla empírica del 68-95-99,7?',
      a: 'En una distribución aproximadamente normal, el <b>68%</b> de los datos cae dentro de ±1 desvío de la media, el <b>95%</b> dentro de ±2 y el <b>99,7%</b> dentro de ±3. Es el atajo mental para saber si un valor es raro sin hacer ninguna cuenta: si está a más de dos desvíos, ya es poco frecuente.',
    },
    {
      q: '¿Cuántos datos necesito para que estos estadísticos sirvan?',
      a: 'La media y la mediana se calculan con cualquier cantidad, pero recién con unas <b>20 o 30 observaciones</b> empiezan a ser estables. Los cuartiles y los outliers necesitan todavía más: con 6 u 8 datos, agregar uno solo puede correr Q1 y Q3 de forma notoria. Con muy pocos datos, mostrá la lista completa en vez de resumirla.',
    },
  ],

  sources: [
    {
      name: 'Estadística descriptiva — metodología y definiciones',
      url: 'https://www.indec.gob.ar/indec/web/Institucional-Indec-Metodologias',
      publisher: 'INDEC — Instituto Nacional de Estadística y Censos',
    },
    {
      name: 'Summarizing quantitative data — mean, median, spread and z-scores',
      url: 'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data',
      publisher: 'Khan Academy',
    },
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — Exploratory Data Analysis',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/eda.htm',
      publisher: 'NIST / SEMATECH',
    },
    {
      name: 'Glosario estadístico — media, mediana, desviación estándar, coeficiente de variación',
      url: 'https://stats.oecd.org/glossary/',
      publisher: 'OCDE — Glossary of Statistical Terms',
    },
  ],

  replaces: [
    '/calculadora-media-mediana-moda-rango-estadistica',
    '/calculadora-desvio-estandar-varianza-conjunto',
    '/calculadora-coeficiente-variacion',
    '/calculadora-percentil-dato',
    '/calculadora-z-score-valor-normal',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
