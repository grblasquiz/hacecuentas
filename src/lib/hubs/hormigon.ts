import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto cemento, arena y hierro necesito?"
 *
 * Arquetipo RAMIFICADO. Absorbe 12 calculadoras sueltas de materiales de obra
 * gruesa (ver `replaces`). Toda la lógica se reimplementa en el compute() de
 * src/pages/construccion/hormigon.astro.
 *
 * SILO COMPARTIDO con /construccion/pintura, /construccion/ladrillos y
 * /construccion/costo-por-m2. Este hub es obra gruesa húmeda + armadura:
 * hormigón, contrapiso, relleno, revoque, hierro y malla. La mampostería es
 * el hub de ladrillos y la terminación es el de pintura: no se duplican.
 *
 * ⚠️ CONTRADICCIONES DE LAS FÓRMULAS VIEJAS QUE ESTE HUB UNIFICA:
 *  1. Cemento por m³ de hormigón. `zapata-corrida-m3-hormigon.ts` usaba 10
 *     bolsas/m³ (500 kg), mientras `cemento-m3.ts` da 350 kg (7 bolsas) para
 *     un H-21 —que es justamente el hormigón de una zapata— y
 *     `conversor-bolsas-cemento-por-metro-cubico.ts` usa un factor fijo de 7
 *     bolsas/m³. Acá manda la tabla de `cemento-m3.ts`: la zapata se dosifica
 *     como el hormigón que es.
 *  2. Áridos por m³. `arena-grava.ts` y `cemento-m3.ts` coinciden exactamente
 *     en el H-21 (350 kg / 0,50 / 0,75) pero difieren en los demás grados:
 *     grava 0,80 vs 0,75 en H-17, 0,55 vs 0,75 en H-13, 0,70 vs 0,75 en H-25 y
 *     0,65 vs 0,75 con arena 0,42 vs 0,45 en H-30. Acá se adopta la tabla de
 *     `cemento-m3.ts`, que mantiene la piedra constante en 0,75 m³/m³ —el
 *     criterio habitual de dosificación en volumen— y se declara en la fuente.
 *  3. Revoque. `revoque-grueso-m3-m2.ts` daba 6 bolsas de cemento por m³ de
 *     mortero y ninguna cal; `revoque-mortero.ts` da 200 kg de cemento (4
 *     bolsas) más 100 kg de cal para el mismo grueso 1:1:6. Acá manda
 *     `revoque-mortero.ts`, que es la que respeta la proporción declarada.
 *     También cambiaba el espesor por defecto del grueso: 2 cm contra 1,5 cm.
 *  4. Acero de losa. `hierro-construccion.ts` sumaba dos veces el efecto de la
 *     luz: los tramos ya venían escalonados por luz (10, 14 y 18 kg/m² para
 *     ≤4 m, 4-6 m y >6 m) y encima le agregaba 2 kg/m² por cada metro sobre 4.
 *     Una losa maciza de 6 m elegida como "luz 4-6 m" devolvía 18 kg/m² en vez
 *     de 14. Acá se usa la curva limpia —10 kg/m² hasta 4 m y +2 kg/m² por
 *     metro adicional—, que reproduce exactamente los tres tramos originales
 *     en su valor de tope y queda dentro del rango 10-15 kg/m² que declara
 *     `acero-kg-m2-losa.ts` para luces normales.
 *
 * ⚠️ NO ENTRA: `/calculadora-arena-sanitaria-gato-kg-mes` es arena para gatos,
 * no arena de construcción. Homónimo puro. No está en `replaces`.
 *
 * ⚠️ YMYL — estructura. Los disclaimers salen de src/lib/disclaimers.ts
 * ('construction-structural' y 'construction-materials'). Van en `fineprint` y
 * el estructural es el PRIMER `warn` de cada rama. No aflojarlos: un
 * predimensionado no es un cálculo estructural.
 */
export const hub: HubData = {
  slug: 'construccion/hormigon',
  title: '¿Cuánto cemento, arena y hierro necesito? — Calculadora de materiales de obra',
  description:
    'Calculá los materiales de tu obra gruesa: cemento, arena, piedra y agua por m³ de hormigón según la resistencia (H-13 a H-30), zapatas y vigas, contrapiso y relleno, revoque grueso o fino, y el hierro y la malla de la losa. Con bolsas, m³, toneladas y camiones.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Cómputo de materiales de obra',
  h1: '¿Cuánto cemento, arena y hierro necesito?',
  lede:
    'Todo el cómputo de obra gruesa en una pantalla. Elegí qué estás por hacer —hormigón, fundación, contrapiso, revoque o armadura— y salí con la lista para el corralón: bolsas, metros cúbicos, toneladas y camiones.',
  stamps: [
    'Dosificaciones H-13 a H-30 en volumen',
    'Bolsas de cemento de 50 kg',
    '12 calculadoras adentro',
    'Predimensionado: no reemplaza el cálculo estructural',
  ],

  resultLabel: 'Lo que tenés que comprar',

  cases: {
    title: '¿Qué estás por hacer?',
    intro:
      'Arrancamos por el caso más general: un volumen de hormigón. Si lo tuyo es una fundación, un contrapiso, un revoque o la armadura de una losa, cambiá de rama acá.',
    items: [
      {
        id: 'hormigon',
        label: 'Hormigón: losa, platea o columna',
        hint: 'Por m³ y por resistencia (H-13 a H-30)',
        answer:
          'Un metro cúbico de hormigón estándar H-21 lleva 350 kg de cemento —7 bolsas de 50 kg—, medio metro cúbico de arena, 0,75 m³ de piedra y unos 180 litros de agua.',
        yes: [
          'Cemento en kilos y en bolsas de 50 kg según la resistencia que elijas',
          'Arena y piedra partida en metros cúbicos y en toneladas, para pedir por camión o por peso',
          'Agua de amasado en litros',
          'Cuántas bolsas de cemento entran por metro cúbico en esa dosificación',
          'Porcentaje de desperdicio ya sumado a las cantidades',
        ],
        warn: [
          'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
          'La resistencia la define el proyecto, no el presupuesto: para elementos estructurales el mínimo habitual es H-21, y bajar de ahí para "ahorrar cemento" es cambiar la seguridad de la obra',
          'Las dosificaciones son en volumen y suponen áridos limpios y de granulometría normal. Con arena húmeda o sucia el rendimiento cae y hace falta más cemento',
          'A partir de 1 m³ suele convenir hormigón elaborado: llega dosificado, con resistencia certificada y sin la variabilidad del mezclado a pala',
        ],
        plazo:
          'el hormigón se coloca dentro de las 2 horas de amasado y se cura mojándolo al menos 7 días: sin curado perdés buena parte de la resistencia que pagaste.',
      },
      {
        id: 'fundacion',
        label: 'Zapata corrida o viga',
        hint: 'De las medidas al volumen y al material',
        answer:
          'El volumen de una zapata corrida es largo × ancho × alto, y ese volumen se dosifica como el hormigón que es: alrededor de 7 bolsas de cemento por metro cúbico en H-21.',
        yes: [
          'Volumen de hormigón de la zapata en metros cúbicos, a partir de sus tres medidas',
          'Cemento, arena, piedra y agua para ese volumen, con la resistencia que elijas',
          'Predimensionado orientativo de una viga: alto igual a la luz dividido 12, ancho igual a la mitad del alto',
          'Cuántas bolsas de cemento entran por metro cúbico en esa dosificación',
        ],
        warn: [
          'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
          'El predimensionado de la viga es una regla de bolsillo para anticipar el volumen y el encofrado. Las secciones y la armadura reales las define un ingeniero según las cargas, la luz y el tipo de apoyo',
          'La profundidad de la fundación depende del suelo y del nivel de la capa firme, no de esta cuenta: un suelo expansivo o con relleno cambia todo el planteo',
          'Esta rama calcula el hormigón, no el hierro de la zapata: la armadura va en la rama de hierro y malla',
        ],
        plazo:
          'el hormigón de fundación se cuela el mismo día que se abre y se limpia la zanja: si la zanja queda abierta y llueve, hay que sacar el barro antes de colar.',
      },
      {
        id: 'contrapiso',
        label: 'Contrapiso o relleno de terreno',
        hint: 'De m² y espesor a m³, bolsas y camiones',
        answer:
          'Un contrapiso son los metros cuadrados por el espesor: cada metro cúbico de mezcla lleva unas 3 bolsas de cemento, 0,9 m³ de arena y 0,9 m³ de cascote.',
        yes: [
          'Volumen de mezcla del contrapiso en metros cúbicos, a partir de la superficie y el espesor',
          'Cemento en bolsas, arena y cascote en metros cúbicos',
          'Arena de relleno con el porcentaje de compactación ya sumado',
          'Cuántos camiones de arena hay que pedir para ese volumen',
          'Toneladas de arena, por si el corralón cobra por peso',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
          'El contrapiso de cascote lleva bastante menos cemento que un hormigón estructural: no es hormigón y no cumple función estructural',
          'Un relleno pierde volumen al compactar. Si pedís sólo el volumen neto vas a quedar bajo nivel: hay que sumarle el porcentaje de compactación',
          'El espesor mínimo habitual de un contrapiso sobre terreno es de 8 a 12 cm, y sobre losa de 5 cm. Menos que eso se fisura',
        ],
        plazo:
          'el relleno se compacta en capas de 20 cm como máximo, cada una regada y compactada por separado: de una sola vez no compacta.',
      },
      {
        id: 'revoque',
        label: 'Revoque de paredes',
        hint: 'Grueso, fino, impermeable o completo',
        answer:
          'Revocar un metro cuadrado con grueso y fino consume unos 0,02 m³ de mortero: alrededor de 5,5 kg de cemento, 1,5 kg de cal y 0,02 m³ de arena.',
        yes: [
          'Volumen de mortero necesario según los metros cuadrados y el espesor',
          'Cemento en kilos y en bolsas de 50 kg',
          'Cal en kilos y en bolsas de 25 kg, cuando el tipo de revoque la lleva',
          'Arena en metros cúbicos y en toneladas',
          'Agua de amasado en litros, con el desperdicio ya incluido',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
          'El espesor manda sobre todo lo demás: una pared despareja se lleva el doble de mortero que una pared a plomo. Si el muro está fuera de escuadra, medí el espesor real antes de comprar',
          'El revoque impermeable lleva hidrófugo en el agua de amasado, que no está computado acá: se dosifica según la ficha del producto',
          'El revoque fino sobre grueso fresco no agarra igual que sobre grueso curado: respetá los tiempos entre capas',
        ],
        plazo:
          'entre el grueso y el fino conviene esperar de 5 a 7 días, y el fino se termina con la pared todavía húmeda, no seca.',
      },
      {
        id: 'hierro',
        label: 'Hierro y malla para la losa',
        hint: 'Kilos, barras, paños y alambre',
        answer:
          'Una losa maciza de hasta 4 metros de luz consume alrededor de 10 kg de acero por metro cuadrado, y sube unos 2 kg por cada metro de luz adicional.',
        yes: [
          'Kilos de acero por metro cuadrado según el tipo de losa y la luz',
          'Kilos totales de hierro y cuántas barras de 12 metros son',
          'Alambre de atar, que se estima en 20 gramos por kilo de hierro',
          'Paños de malla electrosoldada SIMA y su peso total, con el solape ya descontado',
          'Porcentaje de desperdicio por cortes y empalmes ya sumado',
        ],
        warn: [
          'Estimación preliminar. No reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',
          'Los kilos por metro cuadrado son una cuantía orientativa para presupuestar y comprar. El diámetro, la separación y la posición de cada barra salen del plano de armadura de un ingeniero',
          'La malla electrosoldada de contrapiso no reemplaza la armadura de una losa estructural: son cosas distintas y cumplen funciones distintas',
          'Los paños de malla se venden enteros, de 2,40 por 6 metros: el solape de 20 a 25 cm ya está descontado del rendimiento, pero igual sobra recorte',
          'El recubrimiento del hierro no es un detalle: sin separadores, la armadura queda apoyada en el encofrado y se oxida a los pocos años',
        ],
        plazo:
          'el hierro se ata y se revisa antes de hormigonar, con el plano de armadura en la mano: una vez colado el hormigón ya no se corrige nada.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa sólo los campos que le corresponden: el volumen para el hormigón, las tres medidas para la fundación, la superficie y el espesor para contrapiso y revoque.',
  fields: [
    { id: 'm3', label: 'Volumen de hormigón (m³)', type: 'number', min: 0.05, max: 500, step: 0.05, value: 3 },
    {
      id: 'dosificacion',
      label: 'Resistencia del hormigón',
      type: 'select',
      value: 'h21',
      options: [
        { value: 'h13', label: 'H-13 — contrapisos y veredas' },
        { value: 'h17', label: 'H-17 — platea y losas livianas' },
        { value: 'h21', label: 'H-21 — losa, zapata y columna estándar' },
        { value: 'h25', label: 'H-25 — estructura y columnas resistentes' },
        { value: 'h30', label: 'H-30 — alta resistencia' },
      ],
    },
    { id: 'desperdicio', label: 'Desperdicio (%)', type: 'number', min: 0, max: 20, value: 5 },
    { id: 'largo', label: 'Largo de la zapata (m)', type: 'number', min: 0.1, max: 200, step: 0.1, value: 12 },
    { id: 'ancho', label: 'Ancho de la zapata (m)', type: 'number', min: 0.1, max: 5, step: 0.05, value: 0.4 },
    { id: 'alto', label: 'Alto de la zapata (m)', type: 'number', min: 0.1, max: 3, step: 0.05, value: 0.3 },
    { id: 'luz', label: 'Luz que salva la viga o la losa (m)', type: 'number', min: 1, max: 12, step: 0.1, value: 4 },
    { id: 'm2', label: 'Superficie (m²)', type: 'number', min: 1, max: 5000, value: 50 },
    { id: 'espesor', label: 'Espesor (cm)', type: 'number', min: 0.5, max: 60, step: 0.5, value: 10 },
    {
      id: 'tipoRevoque',
      label: 'Tipo de revoque',
      type: 'select',
      value: 'completo',
      options: [
        { value: 'completo', label: 'Completo — grueso 1,5 cm + fino 0,5 cm' },
        { value: 'grueso', label: 'Grueso — 1:1:6 cemento, cal y arena' },
        { value: 'fino', label: 'Fino — 1:3 con arena fina' },
        { value: 'impermeable', label: 'Impermeable — 1:3 con hidrófugo' },
      ],
    },
    {
      id: 'tipoLosa',
      label: 'Tipo de losa',
      type: 'select',
      value: 'maciza',
      options: [
        { value: 'maciza', label: 'Losa maciza de hormigón armado' },
        { value: 'alivianada', label: 'Losa alivianada (vigueta y bovedilla)' },
        { value: 'platea', label: 'Platea de fundación' },
        { value: 'contrapiso', label: 'Contrapiso armado' },
      ],
    },
    {
      id: 'tipoMalla',
      label: 'Malla electrosoldada SIMA',
      type: 'select',
      value: 'Q188',
      options: [
        { value: 'Q92', label: 'Q-92 — Ø 4,2 mm' },
        { value: 'Q131', label: 'Q-131 — Ø 5,0 mm' },
        { value: 'Q188', label: 'Q-188 — Ø 6,0 mm' },
        { value: 'Q257', label: 'Q-257 — Ø 7,0 mm' },
      ],
    },
  ],
  fineprint:
    'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo. Estimación preliminar: no reemplaza el cálculo estructural, la documentación técnica ni la dirección de un profesional habilitado.',

  chart: {
    type: 'donut',
    title: 'De qué está hecho lo que vas a comprar',
    caption:
      'Cada porción es un material medido en kilos, así se pueden comparar entre sí: el cemento contra los áridos, o el hierro contra el alambre. Es la composición en peso de lo que sale del corralón, no su costo.',
  },
  breakdownTitle: 'Tu cómputo, material por material',
  breakdownIntro:
    'Cada fila muestra su unidad al lado del número: kilos, bolsas, metros cúbicos, toneladas, litros, barras, paños o porcentaje. Ningún valor de este hub es dinero.',

  faq: [
    {
      q: '¿Cuántas bolsas de cemento lleva un metro cúbico de hormigón?',
      a: 'Depende de la resistencia. Un H-21, que es el hormigón estándar de losas, zapatas y columnas, lleva 350 kg de cemento por metro cúbico, o sea 7 bolsas de 50 kg. Un H-13 de contrapiso lleva 250 kg (5 bolsas), un H-17 de platea 300 kg (6 bolsas), un H-25 llega a 400 kg (8 bolsas) y un H-30 a 450 kg (9 bolsas). A esos números hay que sumarles el desperdicio, que en obra chica ronda el 5%.',
    },
    {
      q: '¿Qué significa una dosificación 1:2:3 o 1:3:3?',
      a: 'Son las partes en volumen de cemento, arena y piedra. Un 1:2:3 significa una parte de cemento, dos de arena y tres de piedra: es el hormigón estándar, equivalente a un H-21. Un 1:3:3 es más pobre en cemento y se usa para contrapisos y hormigones de baja exigencia. Un 1:2:4 da un hormigón común de platea, y un 1:1,5:2,5 o un 1:1:2 son mezclas ricas para alta resistencia. La parte se mide con un balde, no a ojo: mezclar "a la vista" es la forma más habitual de terminar con un hormigón que no da la resistencia.',
    },
    {
      q: '¿Cuánta arena y cuánta piedra lleva un metro cúbico de hormigón?',
      a: 'En dosificación por volumen, alrededor de 0,45 a 0,55 m³ de arena y 0,75 m³ de piedra partida por cada metro cúbico de hormigón terminado. Suena raro que las partes sumen más de un metro cúbico, pero es correcto: la arena se mete en los huecos de la piedra y la pasta de cemento en los huecos de la arena, así que el volumen final es menor que la suma de los componentes sueltos. En toneladas, esa arena pesa cerca de 1.550 kg por m³ y la piedra alrededor de 1.600 kg por m³.',
    },
    {
      q: '¿Cuánto material lleva un contrapiso?',
      a: 'Primero el volumen: los metros cuadrados por el espesor en metros. Un contrapiso de 50 m² con 10 cm da 5 m³ de mezcla. Cada metro cúbico de contrapiso de cascote lleva unas 3 bolsas de cemento de 50 kg, 0,9 m³ de arena y 0,9 m³ de cascote. Es bastante menos cemento que un hormigón estructural, porque el contrapiso no cumple función estructural: nivela y aísla. El espesor habitual va de 8 a 12 cm sobre terreno y 5 cm sobre losa.',
    },
    {
      q: '¿Cuánta arena necesito para rellenar un terreno?',
      a: 'El volumen neto es la superficie por el espesor del relleno, pero hay que sumarle la compactación, que ronda el 20%. Un relleno de 100 m² con 15 cm son 15 m³ netos y unos 18 m³ a pedir. Después se traduce a camiones: el camión estándar de corralón trae alrededor de 7 m³, así que ese relleno son 3 camiones. No recortes el porcentaje de compactación: es la diferencia entre quedar a nivel y quedar bajo nivel.',
    },
    {
      q: '¿Cuánto cemento, cal y arena lleva un revoque?',
      a: 'El volumen de mortero es los metros cuadrados por el espesor. Un revoque completo son 2 cm —1,5 de grueso más 0,5 de fino— y cada metro cúbico de ese mortero lleva unos 275 kg de cemento, 75 kg de cal y un metro cúbico de arena. Un grueso solo, en proporción 1:1:6, lleva 200 kg de cemento y 100 kg de cal por m³ de mortero; un fino 1:3 lleva 350 kg de cemento y nada de cal; y un impermeable llega a 400 kg de cemento más el hidrófugo, que se dosifica aparte según la ficha del producto.',
    },
    {
      q: '¿Cuántos kilos de hierro por metro cuadrado lleva una losa?',
      a: 'Una losa maciza de hormigón armado consume alrededor de 10 kg/m² cuando la luz no pasa de 4 metros, y sube unos 2 kg/m² por cada metro adicional: unos 14 kg/m² a los 6 metros y 18 kg/m² a los 8. Una losa alivianada de vigueta y bovedilla ronda los 8 kg/m², una platea de fundación 12 kg/m² y un contrapiso armado apenas 4 kg/m². Son cuantías para presupuestar y comprar: el diámetro y la separación de cada barra salen del plano de armadura.',
    },
    {
      q: '¿Cuántos paños de malla SIMA necesito?',
      a: 'El paño estándar mide 2,40 por 6 metros, o sea 14,4 m² brutos, pero el rendimiento real es menor porque los paños se solapan entre 20 y 25 cm. Con 25 cm de solape cada paño cubre alrededor de 12,3 m² netos. Así que una losa de 50 m², con un 5% de desperdicio, se resuelve con 5 paños. Los paños se venden enteros, no cortados: siempre sobra recorte y conviene tenerlo en cuenta al presupuestar.',
    },
    {
      q: '¿Cómo predimensiono una viga de hormigón?',
      a: 'La regla de bolsillo es alto igual a la luz dividido 12 y ancho igual a la mitad del alto. Para una viga que salva 4 metros da unos 33 cm de alto por 17 de ancho, que en obra se redondea a 35 por 20. Sirve para anticipar el volumen de hormigón y el encofrado, nada más: la sección definitiva y la armadura las calcula un ingeniero según las cargas reales, la luz y el tipo de apoyo.',
    },
    {
      q: '¿Cuánto desperdicio conviene agregar?',
      a: 'Entre un 5% y un 10% según el material y la prolijidad de la obra. Para hormigón y áridos alcanza con 5% si la obra es ordenada y el acceso es bueno; en obra chica, con mezclado a pala y traslado en carretilla, conviene 10%. Para el hierro se usa entre 5% y 10% por cortes y empalmes, y para revoque sobre paredes irregulares, 10% como mínimo. La regla es simple: es más barato que sobre un poco a parar la obra por media bolsa.',
    },
    {
      q: '¿Conviene hormigón elaborado o mezclado en obra?',
      a: 'Por encima del metro cúbico, casi siempre elaborado. Llega dosificado por peso, con resistencia certificada y ensayos, y elimina la variabilidad del mezclado a pala, que es la principal fuente de hormigón flojo en obra chica. Por debajo de ese volumen el costo del flete y el mínimo de despacho lo hacen poco práctico y se mezcla en obra, midiendo las partes con balde y respetando la cantidad de agua.',
    },
    {
      q: '¿Qué pasa si le pongo más agua a la mezcla para que sea más fácil trabajarla?',
      a: 'Perdés resistencia, y bastante. La relación agua-cemento es lo que más determina la resistencia final del hormigón: agregar agua de más para que la mezcla fluya la puede bajar de forma significativa, además de aumentar la retracción y las fisuras. Si la mezcla está dura, la salida correcta es un aditivo fluidificante, no el balde de agua. Y una vez colado, el hormigón se cura mojándolo al menos 7 días: sin curado se pierde buena parte de la resistencia que ya se pagó en cemento.',
    },
  ],

  sources: [
    {
      name: 'CIRSOC 201 — Reglamento argentino de estructuras de hormigón',
      url: 'https://www.inti.gob.ar/cirsoc/reglamentos',
      publisher: 'INTI — CIRSOC',
    },
    {
      name: 'Manual de dosificación y elaboración del hormigón',
      url: 'https://www.icpa.org.ar/',
      publisher: 'Instituto del Cemento Portland Argentino (ICPA)',
    },
    {
      name: 'Guía técnica de morteros de revoque y albañilería',
      url: 'https://www.lomanegra.com.ar/',
      publisher: 'Loma Negra',
    },
    {
      name: 'Mallas electrosoldadas SIMA — dimensiones, diámetros y peso por paño',
      url: 'https://www.acindar.com.ar/productos',
      publisher: 'Acindar',
    },
    {
      name: 'Barras de acero conformado ADN 420 — peso por metro lineal',
      url: 'https://www.acindar.com.ar/productos',
      publisher: 'Acindar',
    },
  ],

  replaces: [
    '/calculadora-revoque-grueso-m3-m2',
    '/calculadora-revoque-cemento-cal-arena',
    '/calculadora-arena-grava-hormigon',
    '/calculadora-cemento-arena-piedra-por-m3-hormigon',
    '/calculadora-arena-relleno-terreno-m3',
    '/calculadora-malla-sima-losa-m2',
    '/calculadora-hierro-construccion-losa-m2',
    '/calculadora-conversor-bolsas-cemento-por-metro-cubico',
    '/calculadora-viga-hormigon-h-b-dimensiones',
    '/calculadora-contrapiso-m3',
    '/calculadora-acero-kg-m2-losa',
    '/calculadora-zapata-corrida-m3-hormigon',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Dosificaciones por m³ de hormigón terminado. Tabla canónica: sale tal cual
 * de `src/lib/formulas/cemento-m3.ts`. Ver la nota de contradicciones arriba:
 * `arena-grava.ts` difiere en los grados que no son H-21.
 */
export const DOSIFICACIONES: Record<
  string,
  { nombre: string; corto: string; partes: string; cementoKg: number; arena: number; piedra: number; aguaL: number }
> = {
  h13: { nombre: 'H-13 — contrapisos y veredas', corto: 'H-13', partes: '1:3:3', cementoKg: 250, arena: 0.55, piedra: 0.75, aguaL: 180 },
  h17: { nombre: 'H-17 — platea y losas livianas', corto: 'H-17', partes: '1:2:4', cementoKg: 300, arena: 0.5, piedra: 0.75, aguaL: 180 },
  h21: { nombre: 'H-21 — losa, zapata y columna estándar', corto: 'H-21', partes: '1:2:3', cementoKg: 350, arena: 0.5, piedra: 0.75, aguaL: 180 },
  h25: { nombre: 'H-25 — estructura y columnas resistentes', corto: 'H-25', partes: '1:1,5:2,5', cementoKg: 400, arena: 0.45, piedra: 0.75, aguaL: 180 },
  h30: { nombre: 'H-30 — alta resistencia', corto: 'H-30', partes: '1:1:2', cementoKg: 450, arena: 0.45, piedra: 0.75, aguaL: 180 },
};

/**
 * Morteros de revoque por m³ de mortero. Tabla canónica: sale tal cual de
 * `src/lib/formulas/revoque-mortero.ts` (la que respeta las proporciones
 * declaradas; ver contradicción 3 arriba).
 */
export const REVOQUES: Record<
  string,
  { nombre: string; espesor: number; cementoKg: number; calKg: number; arena: number; aguaL: number }
> = {
  grueso: { nombre: 'revoque grueso 1:1:6 (cemento, cal y arena)', espesor: 1.5, cementoKg: 200, calKg: 100, arena: 1.0, aguaL: 220 },
  fino: { nombre: 'revoque fino 1:3 con arena fina', espesor: 0.5, cementoKg: 350, calKg: 0, arena: 1.0, aguaL: 200 },
  impermeable: { nombre: 'revoque impermeable 1:3 con hidrófugo', espesor: 1.5, cementoKg: 400, calKg: 0, arena: 1.0, aguaL: 200 },
  completo: { nombre: 'revoque completo (grueso 1,5 cm + fino 0,5 cm)', espesor: 2.0, cementoKg: 275, calKg: 75, arena: 1.0, aguaL: 210 },
};

/**
 * Cuantía de acero de losa. Curva limpia derivada de
 * `src/lib/formulas/hierro-construccion.ts`, sin el doble conteo por luz que
 * tenía el original (ver contradicción 4 arriba). Para la losa maciza,
 * kg/m² = base + 2 por cada metro de luz por encima de 4.
 */
export const LOSAS: Record<string, { nombre: string; kgPorM2: number; porLuz: boolean; diam: number }> = {
  maciza: { nombre: 'losa maciza de hormigón armado', kgPorM2: 10, porLuz: true, diam: 10 },
  alivianada: { nombre: 'losa alivianada de vigueta y bovedilla', kgPorM2: 8, porLuz: false, diam: 10 },
  platea: { nombre: 'platea de fundación', kgPorM2: 12, porLuz: false, diam: 10 },
  contrapiso: { nombre: 'contrapiso armado', kgPorM2: 4, porLuz: false, diam: 6 },
};

/** Peso por metro lineal de las barras de acero conformado, en kg/m. */
export const BARRAS: Record<number, number> = { 6: 0.222, 8: 0.395, 10: 0.617, 12: 0.888 };

/** Mallas electrosoldadas SIMA: peso por paño de 2,40 × 6,00 m. */
export const MALLAS: Record<string, { nombre: string; pesoKg: number }> = {
  Q92: { nombre: 'Q-92 (Ø 4,2 mm)', pesoKg: 21 },
  Q131: { nombre: 'Q-131 (Ø 5,0 mm)', pesoKg: 30 },
  Q188: { nombre: 'Q-188 (Ø 6,0 mm)', pesoKg: 42 },
  Q257: { nombre: 'Q-257 (Ø 7,0 mm)', pesoKg: 58 },
};

/** Constantes de obra compartidas por todas las ramas. */
export const OBRA = {
  /** Kilos por bolsa de cemento. */
  bolsaCemento: 50,
  /** Kilos por bolsa de cal. */
  bolsaCal: 25,
  /** Densidades aparentes en kg/m³. */
  densidadArena: 1550,
  densidadPiedra: 1600,
  densidadCascote: 1400,
  /** Contrapiso de cascote, por m³ de mezcla (fórmula contrapiso-m3.ts). */
  contrapiso: { bolsasPorM3: 3, arena: 0.9, cascote: 0.9 },
  /** Relleno de arena (fórmula arena-relleno-terreno-m3.ts). */
  relleno: { compactacionPct: 20, m3PorCamion: 7 },
  /** Paño de malla SIMA y solape estándar, en metros. */
  malla: { largo: 6.0, ancho: 2.4, solapeM: 0.25 },
  /** Largo estándar de la barra de acero, en metros. */
  largoBarra: 12,
  /** Alambre de atar, en kg por kg de hierro. */
  alambrePorKg: 0.02,
  /** Predimensionado de viga: alto = luz / 12, ancho = alto / 2. */
  viga: { divisorAlto: 12, relacionAncho: 2 },
};
