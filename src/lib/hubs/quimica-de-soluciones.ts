import type { HubData } from './types';

/**
 * Hub de decisión — "Química de soluciones: concentración, moles y diluciones"
 * Arquetipo RAMIFICADO (5 casos): masa molar y moles (default), molaridad,
 * dilución C1V1 = C2V2, molalidad y porcentaje, titulación ácido-base.
 *
 * Absorbe 8 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata. TODAS las filas declaran `format: 'unit'` con su unidad
 *    y sus decimales: el runtime hace Object.assign y una fila sin `format`
 *    propio saldría en pesos con "$".
 *  - `chart.type: 'scale'`: las franjas van en DÉCADAS logarítmicas de molaridad.
 *    Con anchos en mol/L crudos, la franja "concentrada" se comería el gráfico.
 *
 * EXACTITUD (regla dura): las constantes son las exactas del SI 2019, no las
 * truncadas que traían las fórmulas viejas.
 *   N_A = 6,022 140 76 × 10²³ mol⁻¹   (exacto desde la redefinición SI 2019)
 *   Kw  = 1,0 × 10⁻¹⁴ a 25 °C          (pKw = 14,00; cambia con la temperatura)
 * La fórmula vieja `moles-masa-formula-molecular` usaba N_A = 6,022e23
 * (truncado): con 1 mol da 6,022e23 en vez de 6,02214076e23, un error del
 * 0,0024%. Acá se usa el valor exacto.
 */
export const hub: HubData = {
  slug: 'ciencia/quimica-de-soluciones',
  title: 'Química de soluciones: molaridad, moles, diluciones y titulación',
  description:
    'Calculá la masa molar de un compuesto, pasá de gramos a moles, sacá la molaridad o la molalidad de una solución, resolvé una dilución con C1V1 = C2V2 y determiná la concentración de una muestra por titulación ácido-base. Con el número de Avogadro exacto del SI.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Química',
  h1: '¿Qué concentración tiene mi solución?',
  lede:
    'Cinco preguntas que en el laboratorio son siempre la misma cadena: cuánto pesa un mol, cuántos moles hay en lo que pesaste, en qué volumen los disolviste, cuánto tenés que diluir y qué concentración tenía la muestra desconocida. Acá están las cinco, en el mismo lugar y con las mismas unidades.',
  stamps: [
    'Actualizado 27-07-2026',
    'N_A exacto: 6,02214076 × 10²³ mol⁻¹',
    'Definiciones IUPAC',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste, el resto se ignora. Todas devuelven además las conversiones asociadas, así no tenés que volver a hacer la cuenta a mano.',
    items: [
      {
        id: 'moles',
        label: 'Masa molar y conversión mol ↔ gramo',
        hint: 'Cuánto pesa un mol y cuántos moles pesaste',
        answer:
          'La masa molar es la suma de las masas atómicas por su cantidad de átomos. Con ella, n = m / M pasa de gramos a moles en un paso.',
        yes: [
          'La masa molar del compuesto sumando hasta cuatro elementos con su cantidad de átomos',
          'El aporte de cada elemento al peso total, en gramos por mol y en porcentaje de composición',
          'La conversión n = m / M en las dos direcciones: de gramos a moles y de moles a gramos',
          'La cantidad de partículas con el número de Avogadro exacto (6,02214076 × 10²³, no el 6,022 truncado)',
        ],
        warn: [
          'Masa molar (g/mol) y masa molecular (uma) tienen el mismo número pero no la misma unidad: no se mezclan en una ecuación',
          'Las masas atómicas de tabla son promedios isotópicos: para trabajo isotópico hay que usar la masa del isótopo puro',
          'Un mol de moléculas no es un mol de átomos: 1 mol de H₂O tiene 3 moles de átomos adentro',
          'Los hidratos cuentan: el CuSO₄·5H₂O pesa 249,7 g/mol, no los 159,6 del sulfato anhidro',
        ],
        plazo:
          'las masas atómicas estándar las revisa la IUPAC cada dos años; los cambios recientes son de la cuarta cifra decimal.',
      },
      {
        id: 'molaridad',
        label: 'Molaridad de una solución',
        hint: 'M = moles de soluto / litros de solución',
        answer:
          'M = n / V. Una solución 1 molar tiene 1 mol de soluto por cada litro de SOLUCIÓN terminada, no por litro de solvente agregado.',
        yes: [
          'La molaridad despejada, o los moles, o el volumen: completá dos de los tres y sale el que falta',
          'Los gramos de soluto que hacen falta si además cargás la masa molar',
          'La equivalencia en g/L, en % p/v y en partes por millón',
          'Una lectura de si la solución es diluida, moderada o concentrada frente a las referencias de uso común',
        ],
        warn: [
          'El denominador es el volumen de la solución TERMINADA, no el del solvente que agregaste: por eso se usa matraz aforado y se completa hasta el aforo',
          'La molaridad cambia con la temperatura porque el volumen se dilata; la molalidad no',
          'Molaridad (M, mol/L) y normalidad (N, eq/L) sólo coinciden si la especie es monoprótica o monovalente',
          'Disolver un sólido puede contraer o expandir el volumen: 1 L de agua más 1 mol de sal no da exactamente 1 L de solución',
        ],
        plazo:
          'una solución acuosa preparada y rotulada se considera estable unos 6 meses; las de ácidos y bases fuertes hay que revalorarlas antes de usarlas como patrón.',
      },
      {
        id: 'dilucion',
        label: 'Dilución: cuánto tomo de la solución madre',
        hint: 'C1·V1 = C2·V2',
        answer:
          'V1 = C2·V2 / C1: el volumen que tenés que tomar del stock para llegar a la concentración final en el volumen final que querés.',
        yes: [
          'El volumen exacto de solución madre que hay que medir',
          'Cuánto solvente agregar para completar hasta el volumen final',
          'El factor de dilución expresado como 1:N, que es como se rotula en el laboratorio',
          'Un aviso cuando el volumen a medir es tan chico que conviene hacer una dilución seriada en dos pasos',
        ],
        warn: [
          'Se completa HASTA el volumen final, no se le suma el volumen de solvente calculado: la diferencia importa en soluciones concentradas',
          'Medir menos de 1 mL con probeta no es confiable: usá micropipeta o partí la dilución en dos pasos de 1:10',
          'Diluir ácido concentrado es exotérmico: siempre el ácido sobre el agua, nunca al revés',
          'C1V1 = C2V2 vale para cualquier unidad de concentración, pero las dos C tienen que estar en la MISMA unidad',
        ],
        plazo:
          'las diluciones de trabajo se preparan el día que se usan; guardar diluciones muy bajas cambia su concentración por adsorción en el vidrio.',
      },
      {
        id: 'molalidad',
        label: 'Molalidad y concentración porcentual',
        hint: 'mol/kg de solvente, % p/v, g/L y ppm',
        answer:
          'La molalidad es mol de soluto por kilo de SOLVENTE. No depende de la temperatura, por eso es la que se usa en propiedades coligativas.',
        yes: [
          'La molalidad en mol/kg a partir de la masa de soluto, su masa molar y los kilos de solvente',
          'El porcentaje masa-volumen y su equivalente en g/L y en ppm',
          'El descenso crioscópico y el ascenso ebulloscópico estimados en agua, que es para lo que sirve la molalidad',
          'La comparación entre molalidad y molaridad, que se separan cuando la solución se concentra',
        ],
        warn: [
          'En la molalidad el denominador es el SOLVENTE solo; en el porcentaje y en la molaridad es la solución completa. Confundirlos es el error más frecuente de todo este cálculo',
          'En soluciones acuosas muy diluidas molalidad y molaridad casi coinciden; arriba de 1 mol/kg ya difieren de forma notoria',
          'El "%" de una etiqueta puede ser p/p, p/v o v/v y dan números distintos: el alcohol 70% de farmacia es v/v',
          'Las propiedades coligativas dependen de las PARTÍCULAS: la sal se disocia en dos iones, así que su efecto es el doble del que sugiere la molalidad nominal',
        ],
        plazo:
          'el punto de congelación de una solución acuosa baja 1,86 °C por cada mol/kg de partículas disueltas.',
      },
      {
        id: 'titulacion',
        label: 'Titulación ácido-base',
        hint: 'Qué concentración tenía la muestra desconocida',
        answer:
          'C_muestra = (C_titulante × V_titulante × n_titulante) / (V_muestra × n_muestra). En el punto de equivalencia los equivalentes se igualan.',
        yes: [
          'La concentración de la muestra en molaridad y en normalidad',
          'Los milimoles de analito que había en la alícuota',
          'El factor de protones (n) de cada especie, que es lo que separa la molaridad de la normalidad',
          'Los gramos de analito de la alícuota si además cargás su masa molar',
        ],
        warn: [
          'Los factores n hacen trabajo real: el ácido sulfúrico es diprótico y olvidar su n = 2 duplica el resultado',
          'El punto de equivalencia (química) y el punto final (viraje del indicador) no son el mismo punto: elegí un indicador que vire cerca del pH de equivalencia',
          'Un ácido débil con base fuerte no equivale a pH 7 sino por encima; fenolftaleína sí, naranja de metilo no',
          'El titulante tiene que estar valorado contra un patrón primario: el NaOH toma CO₂ del aire y baja su título con los días',
        ],
        plazo:
          'una solución de NaOH valorada se revalora cada 15 a 30 días; el HCl aguanta varios meses bien cerrado.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba. Para la masa molar podés cargar hasta cuatro elementos con su masa atómica y su cantidad de átomos; los que dejes en cero se ignoran.',
  fields: [
    {
      id: 'ma1',
      label: 'Masa molar — masa atómica del elemento 1',
      type: 'number',
      suffix: 'u',
      value: 1.008,
      min: 0,
      step: 0.0001,
      help: 'H 1,008 · C 12,011 · N 14,007 · O 15,999 · Na 22,990 · S 32,06 · Cl 35,45 · Ca 40,078 · Fe 55,845 · Cu 63,546.',
    },
    { id: 'n1', label: 'Masa molar — cuántos átomos del elemento 1', type: 'number', value: 2, min: 0, step: 1 },
    { id: 'ma2', label: 'Masa molar — masa atómica del elemento 2', type: 'number', suffix: 'u', value: 15.999, min: 0, step: 0.0001 },
    { id: 'n2', label: 'Masa molar — cuántos átomos del elemento 2', type: 'number', value: 1, min: 0, step: 1 },
    { id: 'ma3', label: 'Masa molar — masa atómica del elemento 3', type: 'number', suffix: 'u', value: 0, min: 0, step: 0.0001 },
    { id: 'n3', label: 'Masa molar — cuántos átomos del elemento 3', type: 'number', value: 0, min: 0, step: 1 },
    { id: 'ma4', label: 'Masa molar — masa atómica del elemento 4', type: 'number', suffix: 'u', value: 0, min: 0, step: 0.0001 },
    { id: 'n4', label: 'Masa molar — cuántos átomos del elemento 4', type: 'number', value: 0, min: 0, step: 1 },
    {
      id: 'masaMolar',
      label: 'Masa molar del soluto (si ya la sabés)',
      type: 'number',
      suffix: 'g/mol',
      value: 58.44,
      min: 0,
      step: 0.0001,
      help: 'Agua 18,015 · NaCl 58,44 · glucosa 180,156 · NaOH 39,997 · H₂SO₄ 98,079. Si la dejás en 0 se usa la que calcula la rama de masa molar.',
    },
    {
      id: 'masa',
      label: 'Masa de soluto pesada',
      type: 'number',
      suffix: 'g',
      value: 5.844,
      min: 0,
      step: 0.0001,
      help: 'Si cargás masa y masa molar, se calculan los moles. Si preferís partir de los moles, poné 0 acá.',
    },
    { id: 'moles', label: 'Moles de soluto (alternativa a la masa)', type: 'number', suffix: 'mol', value: 0, min: 0, step: 0.000001 },
    {
      id: 'volumenL',
      label: 'Volumen final de la solución',
      type: 'number',
      suffix: 'L',
      value: 0.5,
      min: 0,
      step: 0.0001,
      help: 'Es el volumen de la solución terminada, no el del solvente agregado.',
    },
    {
      id: 'molaridadDato',
      label: 'Molaridad, si la conocés y querés despejar otra cosa',
      type: 'number',
      suffix: 'mol/L',
      value: 0,
      min: 0,
      step: 0.000001,
      help: 'Dejala en 0 para que la calcule con los moles y el volumen.',
    },
    { id: 'c1', label: 'Dilución — concentración de la solución madre', type: 'number', value: 1, min: 0, step: 0.0001 },
    { id: 'c2', label: 'Dilución — concentración final que querés', type: 'number', value: 0.1, min: 0, step: 0.0001 },
    {
      id: 'v2',
      label: 'Dilución — volumen final que querés preparar',
      type: 'number',
      suffix: 'mL',
      value: 250,
      min: 0,
      step: 0.01,
      help: 'C1 y C2 pueden estar en cualquier unidad, siempre que sea la MISMA para las dos.',
    },
    {
      id: 'kgSolvente',
      label: 'Molalidad — kilos de solvente',
      type: 'number',
      suffix: 'kg',
      value: 0.5,
      min: 0,
      step: 0.0001,
      help: 'Sólo el solvente, sin contar el soluto. 1 L de agua a 20 °C pesa 0,9982 kg.',
    },
    {
      id: 'ipartic',
      label: 'Molalidad — factor de van’t Hoff (partículas por fórmula)',
      type: 'number',
      value: 1,
      min: 1,
      max: 6,
      step: 1,
      help: 'Glucosa 1 · NaCl 2 · CaCl₂ 3 · Na₂SO₄ 3. Es lo que multiplica el efecto coligativo.',
    },
    { id: 'ct', label: 'Titulación — concentración del titulante', type: 'number', suffix: 'mol/L', value: 0.1, min: 0, step: 0.00001 },
    { id: 'vt', label: 'Titulación — volumen gastado de titulante', type: 'number', suffix: 'mL', value: 23.4, min: 0, step: 0.01 },
    {
      id: 'nt',
      label: 'Titulación — factor n del titulante',
      type: 'number',
      value: 1,
      min: 1,
      max: 6,
      step: 1,
      help: 'Protones u OH⁻ que intercambia: NaOH 1 · HCl 1 · H₂SO₄ 2 · Ca(OH)₂ 2 · H₃PO₄ 3.',
    },
    { id: 'va', label: 'Titulación — volumen de la alícuota de muestra', type: 'number', suffix: 'mL', value: 25, min: 0, step: 0.01 },
    { id: 'na', label: 'Titulación — factor n de la muestra', type: 'number', value: 1, min: 1, max: 6, step: 1 },
  ],
  fineprint:
    'Los cálculos son estequiométricos exactos: la única constante involucrada, el número de Avogadro, vale 6,02214076 × 10²³ mol⁻¹ por definición del SI desde 2019. Las estimaciones de descenso crioscópico y ascenso ebulloscópico valen para soluciones acuosas diluidas: por encima de 1 mol/kg la aproximación ideal se aparta de la realidad. Nada de esto reemplaza al procedimiento del laboratorio ni al rótulo del reactivo.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu concentración en la escala real',
    caption:
      'La regla va de un micromol por litro a diez molar en escala logarítmica, con referencias reconocibles: el agua de red, el suero fisiológico (0,154 M), el agua de mar (≈0,6 M de sal), el vinagre (≈0,8 M) y un ácido concentrado de laboratorio. Tu resultado queda marcado sobre esa regla.',
    bands: [
      { label: '1 µM a 1 mM — trazas, agua de red', from: 0.000001, to: 0.001, tone: 'neutral' },
      { label: '1 a 10 mM — buffers biológicos diluidos', from: 0.001, to: 0.01, tone: 'good' },
      { label: '10 a 100 mM — buffers de trabajo, titulantes 0,1 M', from: 0.01, to: 0.1, tone: 'good' },
      { label: '0,1 a 1 M — suero fisiológico 0,154 M, agua de mar, vinagre', from: 0.1, to: 1, tone: 'good' },
      { label: '1 a 10 M — reactivos concentrados de laboratorio', from: 1, to: 10, tone: 'warn' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay gramos, moles, litros, mol/L y porcentajes. Las barras comparan el número de cada fila entre sí, así que las unidades chicas siempre dan barras largas: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cómo se calcula la masa molar de un compuesto?',
      a: 'Sumando la masa atómica de cada elemento multiplicada por la cantidad de átomos que aporta la fórmula. Para el agua, H₂O: 2 × 1,008 + 1 × 15,999 = 18,015 g/mol. Para la sal de mesa, NaCl: 22,990 + 35,45 = 58,44 g/mol. Para la glucosa, C₆H₁₂O₆: 6 × 12,011 + 12 × 1,008 + 6 × 15,999 = 180,156 g/mol. Ojo con los hidratos: el sulfato de cobre pentahidratado CuSO₄·5H₂O pesa 249,7 g/mol porque las cinco aguas también cuentan.',
    },
    {
      q: '¿Cómo paso de gramos a moles?',
      a: 'Con n = m / M: los moles son la masa dividida por la masa molar. 5,844 g de NaCl (M = 58,44 g/mol) son 0,1 mol. Y al revés, m = n × M: para tener 0,25 mol de glucosa hay que pesar 0,25 × 180,156 = 45,04 g. La relación es lineal, así que el doble de masa siempre son el doble de moles.',
    },
    {
      q: '¿Cuántas partículas hay en un mol?',
      a: 'Exactamente 6,02214076 × 10²³, el número de Avogadro. Desde la redefinición del SI de 2019 no es un valor medido sino una definición: el mol es, por convención, esa cantidad de entidades elementales. Muchas calculadoras y libros escriben 6,022 × 10²³, que es la versión redondeada y difiere del valor real en un 0,0024%: para la mayoría de los cálculos no cambia nada, pero en trabajo de precisión sí.',
    },
    {
      q: '¿Qué diferencia hay entre molaridad y molalidad?',
      a: 'La molaridad (M, mol/L) usa el VOLUMEN de la solución terminada; la molalidad (m, mol/kg) usa la MASA del solvente solo. La consecuencia práctica es que la molaridad cambia cuando cambia la temperatura, porque el líquido se dilata, y la molalidad no. Por eso las propiedades coligativas —congelación, ebullición, presión osmótica— se calculan siempre con molalidad. En soluciones acuosas muy diluidas los dos números casi coinciden; por encima de 1 mol/kg ya se separan de forma notoria.',
    },
    {
      q: '¿Cómo se hace una dilución con C1V1 = C2V2?',
      a: 'Despejás V1 = C2·V2 / C1, que es el volumen de solución madre a tomar. Para preparar 250 mL de una solución 0,1 M partiendo de una 1 M: V1 = 0,1 × 250 / 1 = 25 mL de stock, y completás con solvente HASTA los 250 mL (no le sumás 250 mL). El factor es 1:10. Las dos concentraciones pueden estar en cualquier unidad —molar, %, g/L— siempre que sea la misma para las dos.',
    },
    {
      q: '¿Por qué se completa "hasta el aforo" y no se suma el solvente?',
      a: 'Porque los volúmenes no son estrictamente aditivos: al mezclar dos líquidos las moléculas se acomodan y el volumen final puede ser menor que la suma de las partes. El caso escolar es etanol y agua, donde 50 mL más 50 mL dan unos 96 mL, no 100. En una dilución de laboratorio el error es chico pero real, y por eso el procedimiento correcto es medir el stock, agregar solvente y completar hasta la marca del matraz aforado.',
    },
    {
      q: '¿Qué es el porcentaje masa-volumen y cómo se pasa a g/L y a ppm?',
      a: 'El % p/v son gramos de soluto por cada 100 mL de solución. La conversión es directa: 1% p/v = 10 g/L = 10.000 ppm. El suero fisiológico al 0,9% tiene entonces 9 g de NaCl por litro. Cuidado con el "%": en las etiquetas puede ser p/p (gramos por 100 g), p/v (gramos por 100 mL) o v/v (mL por 100 mL), y dan números distintos. El alcohol 70° de farmacia es v/v.',
    },
    {
      q: '¿Cómo se calcula la concentración de una muestra por titulación?',
      a: 'En el punto de equivalencia los equivalentes de titulante y de muestra se igualan: C_muestra = (C_titulante × V_titulante × n_titulante) / (V_muestra × n_muestra). Si gastaste 23,4 mL de NaOH 0,1 M para neutralizar una alícuota de 25 mL de un ácido monoprótico, la muestra es 0,0936 M. Los factores n son los protones u OH⁻ que intercambia cada especie: ignorar que el H₂SO₄ es diprótico duplica el resultado.',
    },
    {
      q: '¿Qué diferencia hay entre punto de equivalencia y punto final?',
      a: 'El punto de equivalencia es el instante químico en que los equivalentes se igualan; el punto final es cuando vos VES el viraje del indicador. No coinciden exactamente y esa diferencia es el error de titulación. Por eso el indicador se elige según el pH de equivalencia: en ácido fuerte con base fuerte la equivalencia cae en pH 7 y sirve casi cualquiera, pero en ácido débil con base fuerte cae por encima de 8 y hay que usar fenolftaleína, no naranja de metilo.',
    },
    {
      q: '¿Cuánto baja el punto de congelación del agua con sal?',
      a: 'El descenso crioscópico es ΔT = Kf × m × i, con Kf = 1,86 °C·kg/mol para el agua, m la molalidad y i las partículas por fórmula. Una solución 1 molal de glucosa (i = 1) congela a −1,86 °C; una 1 molal de NaCl (i = 2, porque se disocia en Na⁺ y Cl⁻) congela a −3,72 °C. Es exactamente por eso que se tira sal en las rutas nevadas y por eso el agua de mar congela por debajo de cero.',
    },
    {
      q: '¿Molaridad y normalidad son lo mismo?',
      a: 'Sólo cuando la especie intercambia un único protón o electrón. La normalidad es N = M × n, donde n es el número de equivalentes por mol. Para el HCl o el NaOH, n = 1 y molaridad y normalidad coinciden. Para el H₂SO₄, n = 2: una solución 0,5 M es 1 N. La normalidad quedó bastante en desuso en la literatura moderna, pero sigue apareciendo en normas de análisis de agua y de alimentos.',
    },
    {
      q: '¿Se puede preparar una solución más concentrada que el stock?',
      a: 'No con una dilución: C1V1 = C2V2 sólo funciona hacia abajo, y si pedís una concentración final mayor que la de la solución madre el cálculo devuelve un volumen mayor al final, lo que es físicamente imposible. Para subir la concentración hay que evaporar solvente, agregar más soluto sólido o partir de un stock más concentrado. Por eso este hub avisa cuando C2 supera a C1 en vez de devolver un número sin sentido.',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición del mol y valor exacto del número de Avogadro',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
    {
      name: 'IUPAC Compendium of Chemical Terminology ("Gold Book") — definiciones de concentración, molalidad y fracción molar',
      url: 'https://goldbook.iupac.org/',
      publisher: 'International Union of Pure and Applied Chemistry',
    },
    {
      name: 'Atomic Weights of the Elements — masas atómicas estándar revisadas',
      url: 'https://iupac.qmul.ac.uk/AtWt/',
      publisher: 'IUPAC Commission on Isotopic Abundances and Atomic Weights',
    },
    {
      name: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'NIST / CODATA',
    },
    {
      name: 'NIST Chemistry WebBook — propiedades termofísicas del agua y de compuestos puros',
      url: 'https://webbook.nist.gov/chemistry/',
      publisher: 'National Institute of Standards and Technology',
    },
  ],

  replaces: [
    '/calculadora-masa-molar-compuesto',
    '/calculadora-moles-gramos-conversion',
    '/calculadora-moles-masa-formula-molecular',
    '/calculadora-concentracion-molar-solucion',
    '/calculadora-molalidad-solucion',
    '/calculadora-dilucion-c1v1-c2v2',
    '/calculadora-porcentaje-masa-volumen-solucion',
    '/calculadora-titulacion-acido-base',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-conversion-ppm-mg-l-quimica-agua',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constantes exactas del SI y coeficientes coligativos del agua. */
export const CONST = {
  /** Número de Avogadro, exacto por definición del SI desde 2019. */
  NA: 6.02214076e23,
  /** Constante crioscópica del agua, °C·kg/mol. */
  KF_AGUA: 1.86,
  /** Constante ebulloscópica del agua, °C·kg/mol. */
  KB_AGUA: 0.512,
};

/** Regla logarítmica de concentración: de 1 µM a 10 M, con referencias reales. */
export const SCALE = {
  minM: 1e-6,
  maxM: 10,
  refs: [
    { m: 0.00005, label: 'el calcio disuelto del agua de red' },
    { m: 0.01, label: 'un buffer biológico diluido' },
    { m: 0.1, label: 'un titulante 0,1 M de laboratorio' },
    { m: 0.154, label: 'el suero fisiológico' },
    { m: 0.6, label: 'la sal del agua de mar' },
    { m: 0.83, label: 'el ácido acético del vinagre' },
    { m: 12, label: 'el ácido clorhídrico concentrado' },
  ],
};
