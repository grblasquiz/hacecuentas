import type { HubData } from './types';

/**
 * Hub de decisión — "Hice una cerveza: ¿cuánto alcohol, cuánto amargor y cuánta
 * azúcar de cebado?"
 *
 * Une las seis calculadoras de homebrewing que estaban sueltas. Todas trabajan
 * sobre los mismos dos números —densidad inicial y final— así que tenerlas
 * separadas obligaba a re-cargar OG y FG en cada página.
 */
export const hub: HubData = {
  slug: 'cocina/cerveza-casera',
  title: 'Cerveza casera: ABV, atenuación, IBU y azúcar de cebado | Hacé Cuentas',
  description:
    'Calculá el alcohol de tu cerveza a partir de OG y FG, la atenuación de la levadura, el amargor IBU por el modelo Tinseth, el azúcar de cebado para carbonatar y cuántos litros vas a terminar embotellando.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía de homebrewing',
  h1: 'Los números de tu cerveza casera',
  lede:
    'Partimos de lo primero que uno quiere saber al terminar la fermentación: cuánto alcohol quedó. Con la misma OG y FG salen la atenuación, el amargor, el cebado y el rendimiento en litros.',
  stamps: ['Modelo Tinseth para IBU', 'Corrección ASBC de hidrómetro', '6 calculadoras adentro'],

  resultLabel: 'Resultado del lote',

  cases: {
    title: '¿Qué querés calcular?',
    intro: 'Todas las ramas usan la misma OG y FG. Cargalas una vez y recorré las que necesites.',
    items: [
      {
        id: 'abv',
        label: 'Cuánto alcohol tiene',
        hint: 'ABV a partir de OG y FG',
        answer: 'ABV = (OG − FG) × 131,25.',
        yes: [
          'Graduación alcohólica en volumen (ABV) y en peso (ABW)',
          'Atenuación aparente que logró la levadura',
          'Calorías estimadas por cada 100 ml',
          'Estilo aproximado según la graduación',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'La fórmula ×131,25 es una aproximación lineal: por encima de 8% ABV subestima un poco el alcohol real',
          'Si medís con hidrómetro a una temperatura distinta a la de calibración, corregí la lectura antes de calcular',
        ],
        plazo: 'tomá la FG con dos lecturas separadas por 48 horas: si no se movió, terminó de fermentar.',
      },
      {
        id: 'atenuacion',
        label: 'Si la levadura hizo su trabajo',
        hint: 'Atenuación aparente y real',
        answer: 'La atenuación aparente es (OG − FG) ÷ (OG − 1), en porcentaje.',
        yes: [
          'Atenuación aparente y atenuación real',
          'Comparación contra la atenuación típica que declara la cepa',
          'Diagnóstico de fermentación incompleta o de sobre-atenuación',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Una atenuación muy por encima de la de la cepa suele ser contaminación con levaduras salvajes o Brettanomyces: si además está agria, no la embotelles',
          'Una atenuación muy por debajo indica fermentación trabada: embotellar así puede reventar botellas cuando arranque de nuevo',
        ],
        plazo: 'ante una fermentación trabada, subí la temperatura 2 °C y remové suave antes de agregar más levadura.',
      },
      {
        id: 'ibu',
        label: 'Cuánto amargor tiene',
        hint: 'IBU por el modelo Tinseth',
        answer: 'El IBU depende del alfa ácido, el tiempo de hervor y la densidad del mosto.',
        yes: [
          'IBU estimados según el modelo Tinseth de 1997',
          'Porcentaje de utilización del lúpulo en esas condiciones',
          'Clasificación del amargor y estilos donde encaja',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Tinseth y Rager dan números distintos para la misma receta: elegí un modelo y quedate con ese para poder comparar tus lotes',
          'El dry hopping aporta aroma pero casi nada de IBU: no entra en este cálculo',
        ],
        plazo: 'el alfa ácido del paquete baja con el tiempo: usá el del análisis del lote, no el del estilo.',
      },
      {
        id: 'cebado',
        label: 'Cuánta azúcar de cebado',
        hint: 'Priming para carbonatar',
        answer: 'Se ceba sólo la diferencia entre el CO2 objetivo y el residual de la fermentación.',
        yes: [
          'Gramos de azúcar de cebado para el volumen y la carbonatación que buscás',
          'CO2 residual que quedó disuelto según la temperatura de fermentación',
          'Equivalencia entre dextrosa, azúcar común, extracto seco y miel',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Por encima de 3,5 volúmenes de CO2 el riesgo de botellas reventadas es real: usá envases de pared gruesa',
          'Cebar antes de que la fermentación termine suma el CO2 de los azúcares que faltaban: es la causa más común de botellas bomba',
        ],
        plazo: 'disolvé el azúcar en agua hervida y mezclala en el fermentador, no botella por botella.',
      },
      {
        id: 'volumen',
        label: 'Cuántos litros voy a embotellar',
        hint: 'Pérdidas del proceso',
        answer: 'Entre lúpulo, trub y borra se pierden varios litros del volumen post-hervor.',
        yes: [
          'Litros que llegan al fermentador y litros que llegan a la botella',
          'Absorción de lúpulo estimada en 10 ml por gramo',
          'Rendimiento del lote en porcentaje',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Las pérdidas dependen mucho del equipo: medí las tuyas una vez y usá esos números para los lotes siguientes',
        ],
        plazo: 'si querés 20 litros embotellados, apuntá a unos 24 post-hervor.',
      },
      {
        id: 'hidrometro',
        label: 'Corregir la lectura del hidrómetro',
        hint: 'Por temperatura',
        answer: 'El hidrómetro está calibrado a una temperatura fija: fuera de ella, la lectura miente.',
        yes: [
          'Densidad corregida por temperatura, con la ecuación de la ASBC',
          'Cuánto se desviaba la lectura cruda',
          'Equivalencia aproximada en grados Brix',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'La corrección deja de ser confiable muy lejos del rango de calibración: enfriá la muestra en vez de corregir 40 °C',
          'El refractómetro necesita otra corrección distinta una vez que hay alcohol en el mosto: esta no le sirve',
        ],
        plazo: 'dejá enfriar la muestra en la probeta unos minutos antes de leer.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu lote',
  inputsIntro: 'La OG y la FG las usan varias ramas; el resto de los campos son de la rama que los pide.',
  fields: [
    { id: 'og', label: 'Densidad inicial (OG)', type: 'number', min: 1, max: 1.2, step: 0.001, value: 1.052 },
    { id: 'fg', label: 'Densidad final (FG)', type: 'number', min: 0.98, max: 1.1, step: 0.001, value: 1.012 },
    {
      id: 'atenuacionEsperada',
      label: 'Atenuación que declara tu cepa (%)',
      type: 'number',
      min: 0,
      max: 100,
      value: 75,
      help: 'Está en el datasheet de la levadura. Dejalo en 0 si no lo sabés.',
    },
    { id: 'volumen', label: 'Volumen del lote (L)', type: 'number', min: 1, max: 1000, step: 0.5, value: 20 },
    { id: 'gramosLupulo', label: 'Lúpulo total (g)', type: 'number', min: 0, max: 5000, value: 30 },
    { id: 'alfaAcidos', label: 'Alfa ácidos del lúpulo (%)', type: 'number', min: 0.1, max: 25, step: 0.1, value: 10 },
    { id: 'tiempoHervor', label: 'Tiempo de hervor del lúpulo (min)', type: 'number', min: 0, max: 180, value: 60 },
    { id: 'co2', label: 'Volúmenes de CO2 que buscás', type: 'number', min: 0.5, max: 6, step: 0.1, value: 2.4 },
    {
      id: 'temperatura',
      label: 'Temperatura (°C)',
      type: 'number',
      min: -5,
      max: 90,
      step: 0.5,
      value: 20,
      help: 'Para el cebado: la temperatura más alta que alcanzó la fermentación. Para corregir el hidrómetro: la de la muestra al medir.',
    },
    {
      id: 'tipoAzucar',
      label: 'Azúcar de cebado',
      type: 'select',
      value: 'dextrosa',
      options: [
        { value: 'dextrosa', label: 'Dextrosa (glucosa)' },
        { value: 'sacarosa', label: 'Azúcar común (sacarosa)' },
        { value: 'dme', label: 'Extracto de malta seco (DME)' },
        { value: 'miel', label: 'Miel' },
      ],
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu lote',
    caption:
      'La barra cambia con la rama: ABV en la de alcohol, porcentaje en la de atenuación, IBU en la de amargor, volúmenes de CO2 en la de cebado, rendimiento en la de litros y densidad en la del hidrómetro.',
  },
  breakdownTitle: 'Los números del lote',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿Cómo se calcula el alcohol de una cerveza casera?',
      a: 'La fórmula estándar del homebrewing es ABV = (OG − FG) × 131,25. Con una OG de 1.052 y una FG de 1.012 da 5,25% de alcohol en volumen. Es una aproximación lineal muy buena hasta 8% ABV; por encima de eso subestima el alcohol real y conviene una fórmula polinómica.',
    },
    {
      q: '¿Qué diferencia hay entre ABV y ABW?',
      a: 'ABV es alcohol por volumen y ABW es alcohol por peso. Como el etanol es menos denso que el agua, ABW ≈ ABV × 0,79. Una cerveza de 5% ABV tiene alrededor de 3,95% ABW. Las etiquetas de casi todo el mundo usan ABV; el cálculo de calorías, en cambio, se hace sobre ABW.',
    },
    {
      q: '¿Qué es la atenuación y cuál es la normal?',
      a: 'Es el porcentaje de azúcares fermentables que la levadura convirtió en alcohol y CO2. La atenuación aparente se calcula como (OG − FG) ÷ (OG − 1). Lo normal en ales va de 70 a 80%; las lagers y saisons llegan de 80 a 88%. Por debajo de 65% hay fermentación incompleta y por encima de 88% suele haber levaduras salvajes o enzimas agregadas.',
    },
    {
      q: '¿Por qué la atenuación real es menor que la aparente?',
      a: 'Porque el hidrómetro mide densidad y el alcohol es menos denso que el agua: su presencia hace que la lectura final sea más baja de lo que corresponde a los azúcares que quedan. La atenuación real corrige ese efecto y equivale aproximadamente a la aparente multiplicada por 0,81.',
    },
    {
      q: '¿Qué hago si la fermentación quedó trabada?',
      a: 'Primero confirmá que está trabada de verdad: dos lecturas iguales separadas por 48 horas, con la FG muy por encima de la esperada. Después subí la temperatura 2 °C, remové suavemente para resuspender la levadura y esperá 48 horas más. Si no se mueve, agregá levadura seca rehidratada de una cepa neutra y de alta atenuación.',
    },
    {
      q: '¿Qué es el IBU y cómo se calcula?',
      a: 'IBU son las unidades internacionales de amargor, una medida de los alfa ácidos isomerizados disueltos. El modelo Tinseth calcula la utilización del lúpulo combinando un factor de densidad del mosto y uno de tiempo de hervor, y de ahí sale el IBU en función de los gramos, el porcentaje de alfa ácidos y el volumen. Es un modelo, no una medición: el número real sólo sale de un laboratorio.',
    },
    {
      q: '¿Cuántos IBU tiene cada estilo?',
      a: 'Por debajo de 15 IBU, lagers muy suaves. De 15 a 30, pilsner y kölsch. De 30 a 45, pale ale. De 45 a 70, IPA. De 70 a 100, double IPA. Por encima de 100, imperial IPA, aunque el paladar humano deja de percibir diferencias mucho antes de ese número.',
    },
    {
      q: '¿Cuánta azúcar de cebado va por litro?',
      a: 'Depende del CO2 que busques y del residual que dejó la fermentación. Para 2,4 volúmenes en un lote fermentado a 20 °C hacen falta alrededor de 6,4 g de dextrosa por litro. La sacarosa rinde un poco más (hace falta menos cantidad) y el extracto de malta seco, bastante menos: se necesita más peso para el mismo CO2.',
    },
    {
      q: '¿Por qué revientan las botellas?',
      a: 'Por tres motivos, en orden de frecuencia: cebar antes de que la fermentación haya terminado, calcular el azúcar sin descontar el CO2 residual, o buscar más de 3,5 volúmenes en botellas de pared fina. Las botellas de cerveza comercial retornables aguantan bien hasta 3,5 volúmenes; por encima hay que usar envases tipo champán o belgas.',
    },
    {
      q: '¿Cuánto CO2 queda disuelto después de fermentar?',
      a: 'Depende de la temperatura más alta que alcanzó la cerveza durante la fermentación, porque el CO2 se disuelve mejor en frío. A 18 °C quedan cerca de 0,9 volúmenes; a 20 °C, alrededor de 0,85; a 24 °C, unos 0,98 menos. Ese residual se descuenta del objetivo antes de calcular el azúcar.',
    },
    {
      q: '¿Cuántos litros se pierden entre el hervor y la botella?',
      a: 'Bastantes. El lúpulo absorbe unos 10 ml por gramo, el trub de la olla se lleva alrededor de un litro, y en el fermentador quedan el espacio muerto y la cama de levadura, medio litro cada uno. De 23 litros post-hervor con 100 g de lúpulo terminás embotellando cerca de 20.',
    },
    {
      q: '¿Hay que corregir la lectura del hidrómetro por temperatura?',
      a: 'Sí, salvo que estés midiendo justo a la temperatura de calibración del instrumento (habitualmente 20 °C, a veces 15,6 °C). Fuera de ahí la lectura se desvía: medir a 30 °C en un hidrómetro calibrado a 20 °C subestima la densidad en unos 0,002 puntos, lo que se traduce en casi un cuarto de punto de ABV.',
    },
  ],

  sources: [
    {
      name: 'IBU — modelo de utilización de lúpulo de Glenn Tinseth',
      url: 'https://realbeer.com/hops/research.html',
      publisher: 'Glenn Tinseth',
      date: '1997',
    },
    {
      name: 'Methods of Analysis — corrección de densidad por temperatura',
      url: 'https://www.asbcnet.org/Methods/Pages/default.aspx',
      publisher: 'American Society of Brewing Chemists',
    },
    {
      name: 'Beer Style Guidelines — rangos de ABV, IBU y carbonatación por estilo',
      url: 'https://www.bjcp.org/beer-styles/beer-style-guidelines/',
      publisher: 'Beer Judge Certification Program',
    },
  ],

  replaces: [
    '/calculadora-abv-cerveza-og-fg',
    '/calculadora-alcohol-attenuation-levadura',
    '/calculadora-ibu-cerveza-lupulo-tinseth',
    '/calculadora-priming-sugar-carbonatacion-cerveza',
    '/calculadora-final-volume-cerveza-fermentador',
    '/calculadora-hidrometro-correccion-temperatura',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constante clásica del homebrewing para pasar densidad a alcohol en volumen. */
export const FACTOR_ABV = 131.25;
/** Relación entre alcohol en peso y alcohol en volumen. */
export const ABW_POR_ABV = 0.789;
/** La atenuación real es ~81% de la aparente. */
export const FACTOR_ATENUACION_REAL = 0.81;

/** Gramos de azúcar por litro y por volumen de CO2, según el tipo. */
export const FACTOR_AZUCAR: Record<string, { factor: number; nombre: string }> = {
  dextrosa: { factor: 3.86, nombre: 'dextrosa' },
  sacarosa: { factor: 3.51, nombre: 'azúcar común' },
  dme: { factor: 4.5, nombre: 'extracto de malta seco' },
  miel: { factor: 4.26, nombre: 'miel' },
};

/** Pérdidas típicas del proceso, en litros y en ml por gramo de lúpulo. */
export const PERDIDAS = {
  absorcionLupuloMlPorG: 10,
  trubOlla: 1,
  espacioMuerto: 0.5,
  camaLevadura: 0.5,
};

/** Temperatura de calibración habitual de los hidrómetros, en °C. */
export const TEMP_CALIBRACION = 20;
