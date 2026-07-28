import type { HubData } from './types';

/**
 * Hub de decisión — "¿Puedo confiar en lo que me dice esta muestra?"
 * Arquetipo RAMIFICADO: 5 ramas = las cinco preguntas de estadística
 * inferencial que aparecen al pasar de la muestra a la población.
 * Absorbe 4 URLs (ver `replaces`).
 *
 * DESLINDE con los hubs vecinos:
 *  - /matematica/probabilidad calcula probabilidades de eventos (dados,
 *    combinatoria, binomial, normal). Acá no se calcula ninguna probabilidad a
 *    priori: se parte de DATOS ya observados.
 *  - /matematica/estadistica-descriptiva describe el conjunto que tenés
 *    (centro, dispersión, percentiles) sin generalizar. Acá justamente
 *    generalizamos, y por eso todo viene con margen de error.
 *
 * La rama `ic-t` NO existía como calculadora suelta: se agregó porque la
 * calculadora vieja de intervalo de confianza usaba z incluso con n = 5, lo que
 * subestima el intervalo. Ver reporte.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara 'plain', 'unit' o '%'.
 */
export const hub: HubData = {
  slug: 'matematica/estadistica-inferencial',
  title: '¿Puedo confiar en esta muestra? — Tamaño, intervalos, correlación y chi-cuadrado',
  description:
    'Tamaño de muestra para una encuesta, intervalo de confianza para la media (con z o con t de Student), correlación de Pearson y test chi-cuadrado de independencia. Con la fórmula, la sustitución y cómo se lee el resultado.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de estadística',
  h1: '¿Puedo confiar en lo que me dice esta muestra?',
  lede:
    'Toda la estadística inferencial responde a la misma incomodidad: mediste unos pocos casos y querés hablar de todos. Elegí abajo en qué etapa estás —cuántos casos necesitás, qué margen tiene tu promedio, si dos variables se mueven juntas o si una diferencia es real— y te mostramos la cuenta completa.',
  stamps: ['Actualizado 27-07-2026', '5 tests e intervalos adentro', 'Con la fórmula y la conclusión'],

  resultLabel: 'El resultado principal de tu rama',

  cases: {
    title: '¿En qué etapa estás?',
    intro:
      'Las dos primeras ramas son de diseño y estimación (antes y después de medir). Las dos últimas son tests: contestan si lo que ves en los datos aguanta o puede ser casualidad.',
    items: [
      {
        id: 'muestra',
        label: 'Cuánta gente necesito encuestar',
        hint: 'Ej.: "quiero ±3% de margen al 95% de confianza, ¿a cuántos pregunto?"',
        answer: 'n = z² × p × (1 − p) ÷ e², con corrección por población finita si el universo es chico.',
        yes: [
          'Fórmula base: n = z² × p × (1 − p) ÷ e², donde e es el margen de error en tanto por uno',
          'z sale del nivel de confianza: 1,6449 al 90%, 1,96 al 95% y 2,5758 al 99%',
          'p es la proporción esperada; si no la conocés, usá 50%, que es el caso más exigente',
          'Corrección por población finita: n = n₀ ÷ (1 + (n₀ − 1) ÷ N), útil cuando el universo no es enorme',
        ],
        warn: [
          'Bajar el margen a la mitad CUADRUPLICA la muestra: de ±4% a ±2% pasás de unas 600 a unas 2.400 respuestas',
          'Este n es de respuestas VÁLIDAS, no de invitaciones enviadas: con 60% de tasa de respuesta tenés que contactar bastante más',
          'La fórmula asume muestreo aleatorio simple. Si la muestra está sesgada (auto-selección, sólo redes sociales), ningún n te salva',
        ],
        plazo: 'dato práctico: para una población grande, ±3% al 95% son 1.068 respuestas, sin importar si el país tiene 5 o 50 millones de habitantes.',
      },
      {
        id: 'ic-z',
        label: 'Intervalo de confianza con z (muestra grande)',
        hint: 'Ej.: "medí 200 casos, promedio 70, desvío 8: ¿entre qué valores está el promedio real?"',
        answer: 'IC = x̄ ± z × σ ÷ √n. El intervalo dice entre qué valores es razonable que esté la media de toda la población.',
        yes: [
          'Error estándar: σ ÷ √n — cuánto varía el promedio de una muestra a otra',
          'Margen de error: z × error estándar',
          'Intervalo: media ± margen',
          'Se usa cuando n es grande (regla práctica: 30 o más) o cuando conocés el desvío poblacional',
        ],
        warn: [
          'Con n menor a 30 y desvío estimado de la propia muestra, z se queda corto: usá la rama de t de Student',
          'Cuadruplicar la muestra sólo reduce el margen a la mitad: la precisión mejora con la raíz de n, no con n',
          'Lectura correcta: "95% de confianza" significa que el método acierta el 95% de las veces, no que hay 95% de probabilidad de que la media esté ahí',
        ],
        plazo: 'chequeo: si el intervalo contiene un valor de referencia, no podés afirmar que tu media difiera de él.',
      },
      {
        id: 'ic-t',
        label: 'Intervalo de confianza con t de Student (muestra chica)',
        hint: 'Ej.: "sólo tengo 8 mediciones y el desvío lo saqué de esas mismas 8"',
        answer: 'Mismo intervalo, pero con el valor crítico t en vez de z: con pocos datos el intervalo tiene que ser más ancho.',
        yes: [
          'IC = x̄ ± t × s ÷ √n, con n − 1 grados de libertad',
          'Se usa cuando el desvío lo estimaste de la propia muestra y n es chico',
          't siempre es mayor que z, así que el intervalo queda más ancho: es el precio de tener pocos datos',
          'A medida que n crece, t se acerca a z: con n = 100 la diferencia ya es mínima',
        ],
        warn: [
          'Con n = 5 y 95% de confianza, t = 2,776 contra z = 1,96: usar z te haría reportar un intervalo un 40% más angosto de lo que corresponde',
          'La t supone que los datos vienen de una distribución aproximadamente normal; con muestras chicas y datos muy sesgados, ningún intervalo es confiable',
          'n tiene que ser al menos 2: con un solo dato no hay grados de libertad',
        ],
        plazo: 'regla práctica: desvío estimado de la muestra + n menor a 30 → t, siempre.',
      },
      {
        id: 'pearson',
        label: 'Correlación entre dos variables (Pearson)',
        hint: 'Ej.: "¿las horas de estudio se relacionan con la nota?"',
        answer: 'r mide la fuerza y el sentido de la relación LINEAL entre dos variables, entre −1 y 1.',
        yes: [
          'Fórmula: r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² × Σ(y − ȳ)²)',
          'Signo: positivo si suben juntas, negativo si una sube cuando la otra baja',
          'R² = r² es la proporción de la variabilidad de y que queda explicada por x',
          'Referencia de lectura: menos de 0,3 débil, 0,3 a 0,7 moderada, más de 0,7 fuerte',
        ],
        warn: [
          'Correlación NO es causalidad: dos series pueden moverse juntas por una tercera variable o por pura casualidad',
          'Pearson sólo detecta relaciones LINEALES: una relación en forma de U puede dar r ≈ 0 y ser fortísima',
          'Es muy sensible a los outliers: un solo punto lejano puede llevar r de 0,2 a 0,8',
          'Hacen falta al menos 3 pares y las dos listas tienen que tener la misma cantidad de datos',
        ],
        plazo: 'antes de reportar un r alto: graficá los puntos. Un dibujo detecta en un segundo lo que el número esconde.',
      },
      {
        id: 'chi2',
        label: 'Chi-cuadrado de independencia (tabla 2×2)',
        hint: 'Ej.: "¿la conversión difiere entre la versión A y la B del test?"',
        answer: 'χ² compara lo observado contra lo que esperarías si las dos variables fueran independientes.',
        yes: [
          'Fórmula: χ² = Σ (observado − esperado)² ÷ esperado',
          'Esperado de cada celda: total de su fila × total de su columna ÷ total general',
          'Con una tabla 2×2 hay 1 grado de libertad y el valor crítico al 95% es 3,841',
          'Si p es menor a 0,05 rechazás la independencia: hay asociación entre las variables',
        ],
        warn: [
          'Si alguna frecuencia ESPERADA queda por debajo de 5, el test pierde validez: usá el test exacto de Fisher',
          'Las celdas van con CANTIDADES (personas, clics, casos), nunca con porcentajes',
          'χ² dice que hay asociación, no cuánta ni en qué dirección: para eso mirá las proporciones de cada fila',
          'No rechazar la independencia no prueba que no haya efecto: puede que la muestra sea chica',
        ],
        plazo: 'lectura: p menor a 0,05 significa "difícilmente sea casualidad", no "el efecto es grande".',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada rama usa dos, tres o cuatro campos; los demás quedan ahí sin molestar. El nivel de confianza se comparte entre las ramas de muestra e intervalos.',
  fields: [
    {
      id: 'confianza',
      label: 'Nivel de confianza',
      type: 'select',
      value: '95',
      options: [
        { value: '90', label: '90% — z = 1,6449' },
        { value: '95', label: '95% — z = 1,96 (el estándar)' },
        { value: '99', label: '99% — z = 2,5758' },
      ],
      help: 'Se usa en las ramas de tamaño de muestra e intervalos de confianza.',
    },
    { id: 'margen', label: 'Margen de error deseado (%)', value: '3', help: 'Sólo tamaño de muestra. El ±X% con el que querés reportar el resultado.' },
    { id: 'proporcion', label: 'Proporción esperada (%)', value: '50', help: 'Sólo tamaño de muestra. Si no la conocés, dejá 50: es el escenario más exigente.' },
    { id: 'poblacion', label: 'Población total (0 = muy grande)', value: '0', help: 'Sólo tamaño de muestra. Con 0 no se aplica la corrección por población finita.' },
    { id: 'media', label: 'Media de tu muestra (x̄)', value: '70', help: 'Ramas de intervalo de confianza.' },
    { id: 'desvio', label: 'Desvío estándar (σ o s)', value: '8', help: 'Ramas de intervalo de confianza. Tiene que ser mayor que 0.' },
    { id: 'n', label: 'n — tamaño de tu muestra', value: '200', help: 'Ramas de intervalo de confianza. Mínimo 2.' },
    { id: 'datosX', label: 'Variable X, separada por coma', value: '2, 4, 5, 7, 8, 10, 12', help: 'Sólo correlación. Tiene que tener la misma cantidad de valores que Y.' },
    { id: 'datosY', label: 'Variable Y, separada por coma', value: '4, 5, 7, 8, 9, 12, 13', help: 'Sólo correlación. Cada valor se aparea con el de X en la misma posición.' },
    { id: 'tabla', label: 'Tabla 2×2: a, b, c, d', value: '30, 70, 45, 55', help: 'Sólo chi-cuadrado. a y b son la primera fila; c y d la segunda. Cantidades, no porcentajes.' },
  ],
  fineprint:
    'Aceptamos coma decimal en los campos sueltos ("1,5" es uno y medio), pero en las LISTAS la coma es el separador: escribí los decimales con punto. El valor crítico t se calcula por expansión de Cornish-Fisher, con error menor a una milésima para 3 o más grados de libertad.',

  chart: {
    type: 'bars',
    title: 'Lo que estás comparando',
    caption:
      'En las ramas de intervalo, las barras muestran el límite inferior, la media y el límite superior: mirar el ancho entre las puntas es la forma más honesta de leer un promedio muestral. En chi-cuadrado se comparan las frecuencias observadas contra las esperadas bajo independencia: cuanto más se despegan, más grande es el estadístico.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: los datos que entraron, el valor crítico usado, los términos intermedios y la conclusión. En los tests, la última fila es siempre la decisión: rechazás o no rechazás.',

  faq: [
    {
      q: '¿A cuánta gente tengo que encuestar?',
      a: 'Con la fórmula <b>n = z² × p × (1 − p) ÷ e²</b>. Para un margen de <b>±3% al 95% de confianza</b> con proporción desconocida (p = 50%) hacen falta <b>1.068 respuestas válidas</b>, y ese número casi no depende del tamaño del país: 1.068 alcanza tanto para una ciudad de 500.000 como para un país de 45 millones.',
    },
    {
      q: '¿Por qué el tamaño de muestra casi no depende de la población?',
      a: 'Porque lo que manda es el margen de error, no el universo. La corrección por población finita sólo se nota cuando la muestra es una fracción grande del total: las 385 respuestas que pide un ±5% al 95% bajan a <b>279</b> si tu universo es una empresa de 1.000 personas. Con una población de un millón, la corrección es imperceptible.',
    },
    {
      q: '¿Qué significa "95% de confianza"?',
      a: 'Que si repitieras el estudio muchas veces con el mismo método, el <b>95% de los intervalos</b> construidos así contendrían la media verdadera. NO significa que haya 95% de probabilidad de que la media esté en TU intervalo: la media poblacional es un número fijo, el que varía es el intervalo.',
    },
    {
      q: '¿Cuándo uso z y cuándo t de Student para el intervalo?',
      a: 'Usá <b>z</b> si conocés el desvío poblacional o si tu muestra es grande (n ≥ 30). Usá <b>t</b> si estimaste el desvío de la propia muestra y n es chico. La diferencia no es cosmética: con n = 5 al 95%, t = <b>2,776</b> contra z = 1,96, o sea un intervalo un 40% más ancho. Usar z ahí te haría reportar más precisión de la que tenés.',
    },
    {
      q: '¿Cómo achico el margen de error de mi encuesta?',
      a: 'Aumentando n, pero con rendimientos decrecientes: el margen baja con la <b>raíz cuadrada</b> de la muestra. Para reducirlo a la mitad tenés que <b>cuadruplicar</b> los casos. Pasar de ±4% a ±2% te lleva de unas 600 a unas 2.400 respuestas, y de ahí a ±1% harían falta unas 9.600.',
    },
    {
      q: '¿Qué mide el coeficiente de correlación de Pearson?',
      a: 'La fuerza y el sentido de la relación <b>lineal</b> entre dos variables, en una escala de −1 a 1. Un r de 0,85 indica una relación positiva fuerte; uno de −0,9, una negativa muy fuerte; uno cercano a 0, que no hay relación lineal. El <b>R² = r²</b> se lee como el porcentaje de la variabilidad de y que queda explicado por x.',
    },
    {
      q: '¿Correlación implica causalidad?',
      a: 'No, y es el error más común de todos. Dos variables pueden correlacionar porque una causa a la otra, porque una <b>tercera variable</b> causa a las dos, o por pura casualidad si mirás suficientes series. El consumo de helado y los ahogamientos correlacionan fuerte, y el culpable es el verano. Para hablar de causa hacen falta un experimento o un diseño causal, no un r alto.',
    },
    {
      q: '¿Un r cercano a cero significa que no hay relación?',
      a: 'Significa que no hay relación <b>lineal</b>. Una relación en forma de U —el rendimiento sube con la temperatura y después baja— puede dar r ≈ 0 y ser perfectamente determinista. Por eso la primera regla frente a un r es <b>graficar los puntos</b>: el dibujo muestra en un segundo lo que el coeficiente esconde.',
    },
    {
      q: '¿Para qué sirve el test de chi-cuadrado?',
      a: 'Para decidir si dos variables categóricas están <b>asociadas</b> o son independientes. Compara lo que observaste con lo que esperarías si no hubiera ninguna relación: <b>χ² = Σ (observado − esperado)² ÷ esperado</b>. Es el test de un A/B test con conversiones, de una encuesta cruzada por género o de un tratamiento contra un control.',
    },
    {
      q: '¿Cómo se lee el valor p del chi-cuadrado?',
      a: 'Es la probabilidad de ver una diferencia como la tuya (o mayor) <b>si las variables fueran independientes</b>. Si p &lt; 0,05 rechazás la independencia: la asociación difícilmente sea casualidad. Si p ≥ 0,05, no tenés evidencia suficiente, que no es lo mismo que probar que no hay efecto: puede faltarte muestra.',
    },
    {
      q: '¿Qué pasa si alguna frecuencia esperada es menor a 5?',
      a: 'El chi-cuadrado deja de ser confiable, porque la aproximación a la distribución χ² se rompe con conteos muy chicos. En una tabla 2×2 la salida estándar es el <b>test exacto de Fisher</b>. Esta página te avisa cuando alguna esperada queda por debajo de 5.',
    },
    {
      q: '¿Un resultado significativo quiere decir que el efecto es importante?',
      a: 'No. La significancia estadística mide qué tan improbable es el resultado bajo la hipótesis de que no pasa nada, y con muestras enormes cualquier diferencia mínima se vuelve significativa. Para saber si <b>importa</b> hay que mirar el <b>tamaño del efecto</b>: la diferencia de proporciones, el r, el ancho del intervalo. Significativo y relevante son dos cosas distintas.',
    },
  ],

  sources: [
    {
      name: 'Metodologías de muestreo y estimación de encuestas a hogares',
      url: 'https://www.indec.gob.ar/indec/web/Institucional-Indec-Metodologias',
      publisher: 'INDEC — Instituto Nacional de Estadística y Censos',
    },
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — Confidence intervals and hypothesis tests',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/prc.htm',
      publisher: 'NIST / SEMATECH',
    },
    {
      name: 'Confidence intervals and significance tests',
      url: 'https://www.khanacademy.org/math/statistics-probability/confidence-intervals-one-sample',
      publisher: 'Khan Academy',
    },
    {
      name: 'ASA Statement on Statistical Significance and P-Values',
      url: 'https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf',
      publisher: 'American Statistical Association',
    },
    {
      name: 'Student (W. S. Gosset), "The Probable Error of a Mean", Biometrika 1908',
      url: 'https://doi.org/10.2307/2331554',
      publisher: 'Biometrika',
    },
  ],

  replaces: [
    '/calculadora-tamano-muestra-encuesta',
    '/calculadora-intervalo-confianza-media',
    '/calculadora-correlacion-pearson',
    '/calculadora-chi-cuadrado-independencia',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
