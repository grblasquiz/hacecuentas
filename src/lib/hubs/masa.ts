import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tiene que leudar la masa?"
 * Absorbe 5 URLs de calculadora suelta (ver hub.replaces).
 *
 * EL HALLAZGO: las tres calculadoras de fermentación absorbidas modelan lo
 * mismo (la levadura acelera con el calor y con la dosis) pero con constantes
 * distintas y resultados que no coinciden entre sí. El hub unifica en el
 * modelo Q10 documentado de `leudado-pan-levadura-tiempo-temperatura.ts`:
 *
 *   t = 60 min × 2^((25 − T) / 10) × (2 / dosis en equivalente de fresca)
 *
 * Es el único de los tres que declara su referencia (Q10 ≈ 2 cada 10 °C, dosis
 * patrón 2% de levadura fresca a 25 °C) y el único que convierte entre tipos
 * de levadura. Las diferencias contra los otros dos están en el reporte.
 *
 * DIFERENCIA con los otros hubs del silo /cocina — no se pisan:
 *   · /cocina/porciones      → cuánta comida comprar para N personas
 *   · /cocina/tazas-y-gramos → convertir unidades de una receta
 *   · /cocina/temperatura-del-horno → a qué temperatura hornear
 *   Este responde lo que pasa ANTES del horno: cuánto tarda la masa en levar
 *   y cuánta levadura hay que ponerle. Ninguno de los otros modela fermentación.
 *
 * LA VARIABLE QUE MANDA ES LA TEMPERATURA y la gente no lo sabe: 4 horas a
 * 20 °C no es lo mismo que 4 horas a 28 °C. Por eso el gráfico es una escala
 * de temperatura, no un donut de ingredientes.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: TODA fila lleva `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'scale'`: ubica la temperatura de la masa sobre el eje de
 *    fermentación. compute() devuelve `position` y `positionLabel`.
 */
export const hub: HubData = {
  slug: 'cocina/masa-y-levadura',
  title: '¿Cuánto tiene que leudar la masa? Calculadora de levadura, tiempo y temperatura',
  description:
    'Calculá cuánto tarda en levar tu masa según la temperatura ambiente y la levadura que pusiste, cuánta levadura necesitás para que esté lista a una hora fija, y los gramos de masa de pizza para tus invitados. Con el modelo Q10 y conversión entre levadura fresca, seca activa e instantánea.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía y estimación de panadería',
  h1: '¿Cuánto tiene que leudar la masa?',
  lede:
    'No hay un tiempo fijo: la temperatura manda. Cuatro horas a 20 °C no son cuatro horas a 28 °C — cada 10 °C de más, la levadura trabaja al doble de velocidad. Partimos del caso más común (tenés la masa hecha y querés saber cuánto esperar) y si tu situación es otra, la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Modelo Q10 · dosis patrón 2% de levadura fresca a 25 °C', '5 calculadoras adentro'],

  resultLabel: 'Tiempo de leudado',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cuatro ramas usan el mismo motor: temperatura y dosis de levadura. Lo que cambia es qué dato tenés y cuál buscás.',
    items: [
      {
        id: 'leudado',
        label: 'Tengo la masa hecha y quiero saber cuánto esperar',
        hint: 'El caso más común',
        answer: 'A 22 °C con 2% de levadura fresca, el primer leudado ronda las 2 horas.',
        yes: [
          'El tiempo del primer leudado a la temperatura de tu cocina',
          'La comparación con 18, 22, 26 y 30 °C, para que veas cuánto pesa el termómetro',
          'La conversión de tu levadura a equivalente de fresca (la seca activa rinde 2,25 veces y la instantánea 3 veces)',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El número es una referencia, no un cronómetro: la masa está lista cuando pasa el test del dedo, no cuando suena la alarma',
        ],
        plazo: 'controlá desde el 70% del tiempo estimado: pasarse de fermentación no se arregla.',
      },
      {
        id: 'dosis',
        label: 'Quiero que esté lista a una hora fija',
        hint: 'Al revés: fijás el tiempo y sale la levadura',
        answer: 'Fijando el tiempo, la dosis de levadura es la que se ajusta.',
        yes: [
          'Los gramos de levadura para que la masa esté lista en las horas que pusiste',
          'El porcentaje panadero equivalente sobre el peso de la harina',
          'La dosis en los tres tipos de levadura, por si tenés otra en casa',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Por encima del 4% de levadura fresca la masa toma gusto a levadura: si te da más, bajá el tiempo o subí la temperatura en vez de cargar dosis',
        ],
        plazo: 'si el resultado te da menos de 0,2%, conviene una fermentación larga en heladera.',
      },
      {
        id: 'pizza',
        label: 'Voy a hacer pizza para varios',
        hint: 'Bollos, harina, agua, sal y levadura',
        answer: 'La cuenta arranca por el peso del bollo y el porcentaje panadero.',
        yes: [
          'Cuántos bollos salen para la cantidad de invitados, según el estilo',
          'Harina, agua, sal, aceite y levadura en porcentaje panadero (la harina es el 100%)',
          'Cuánto va a tardar en levar esa masa a la temperatura de tu cocina',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'La receta usa 1% de levadura seca instantánea, que es dosis de fermentación corta. Para napolitana de 24 horas hay que bajarla muy por debajo del 0,3%',
        ],
        plazo: 'bollá y dejá reposar tapado: la masa destapada hace costra y no crece.',
      },
      {
        id: 'frio',
        label: 'La voy a dejar en la heladera',
        hint: 'Retardo en frío · masa madre',
        answer: 'En heladera a 4 °C el leudado se estira entre 8 y 24 horas.',
        yes: [
          'El tiempo estimado a la temperatura de la heladera que pongas (poné 4 °C si no sabés)',
          'La comparación contra dejarla afuera, para ver el factor real del frío',
          'La dosis de levadura equivalente si querés que salga a una hora concreta',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'La masa sigue fermentando mientras se enfría: el cálculo asume que ya está a la temperatura de la heladera, así que en la práctica va a leudar algo más rápido que el número',
        ],
        plazo: 'sacala 1 o 2 horas antes de estirar para que tome temperatura ambiente.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'La temperatura es el dato que más mueve el resultado: si no tenés termómetro, poné la de tu cocina, no la del pronóstico.',
  fields: [
    {
      id: 'harina',
      label: 'Harina de la receta',
      suffix: 'g',
      value: '1.000',
      thousands: true,
      help: 'El porcentaje panadero se calcula siempre sobre la harina. En la rama de pizza este campo no se usa: la harina sale del cálculo.',
    },
    {
      id: 'temp',
      label: 'Temperatura de la masa o del ambiente',
      type: 'number',
      suffix: '°C',
      min: -5,
      max: 55,
      value: 22,
      help: 'Poné 4 °C si va a la heladera. Por encima de 40 °C la levadura sufre y a 50 °C se muere.',
    },
    {
      id: 'levaduraPct',
      label: 'Levadura que pusiste, sobre el peso de la harina',
      type: 'number',
      suffix: '%',
      min: 0.05,
      max: 10,
      step: 0.05,
      value: 2,
      help: 'La dosis patrón de panadería es 2% de levadura fresca. Si usás seca, suele estar entre 0,6% y 1%.',
    },
    {
      id: 'tipoLevadura',
      label: 'Tipo de levadura',
      type: 'select',
      value: 'fresca',
      options: [
        { value: 'fresca', label: 'Fresca (en cubito)' },
        { value: 'seca_activa', label: 'Seca activa (se hidrata antes)' },
        { value: 'instantanea', label: 'Seca instantánea (va directo a la harina)' },
      ],
      help: '1 g de instantánea equivale a 3 g de fresca; 1 g de seca activa, a 2,25 g de fresca.',
    },
    {
      id: 'horas',
      label: 'Horas hasta que la querés lista (0 = calculalo vos)',
      type: 'number',
      min: 0,
      max: 72,
      step: 0.5,
      value: 4,
      help: 'Sólo lo usan las ramas de dosis y de heladera: con este dato la cuenta se invierte y sale cuánta levadura poner.',
    },
    {
      id: 'invitados',
      label: 'Cuántos comen (pizza)',
      type: 'number',
      min: 1,
      max: 60,
      value: 4,
      help: 'Sólo lo usa la rama de pizza.',
    },
    {
      id: 'estilo',
      label: 'Estilo de pizza',
      type: 'select',
      value: 'molde',
      options: [
        { value: 'molde', label: 'Al molde argentina (bollo de 300 g, 4 personas)' },
        { value: 'napolitana', label: 'Napolitana AVPN (bollo de 250 g, 3 personas)' },
        { value: 'fina', label: 'Fina o a la piedra (bollo de 220 g, 3 personas)' },
        { value: 'fugazza', label: 'Fugazza o focaccia (bollo de 380 g, 6 personas)' },
      ],
      help: 'La napolitana AVPN va sin aceite; las otras tres llevan 3% sobre la harina.',
    },
    {
      id: 'hidratacion',
      label: 'Hidratación de la masa',
      type: 'number',
      suffix: '%',
      min: 50,
      max: 80,
      value: 60,
      help: 'Agua sobre harina. 55-60% es masa de molde manejable; 65-70% da más alveolo y se pega más.',
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',

  chart: {
    type: 'scale',
    title: 'Dónde cae la temperatura de tu masa',
    caption:
      'La escala va de la heladera al punto en que la levadura muere. El marcador es la temperatura que pusiste: mover ese marcador 10 °C cambia el tiempo al doble o a la mitad, más que cualquier otro ajuste de la receta.',
    bands: [
      { label: 'Heladera', from: 0, to: 10, tone: 'neutral' },
      { label: 'Fresco', from: 10, to: 20, tone: 'good' },
      { label: 'Óptimo', from: 20, to: 28, tone: 'good' },
      { label: 'Caliente', from: 28, to: 40, tone: 'warn' },
      { label: 'La levadura muere', from: 40, to: 55, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Qué está pesando en el tiempo',
  breakdownIntro: 'Las dos palancas son la temperatura y la dosis. El resto de la receta casi no mueve la aguja.',

  faq: [
    {
      q: '¿Cuánto tarda en leudar una masa a temperatura ambiente?',
      a: 'Con la dosis patrón de 2% de levadura fresca, el primer leudado ronda 1 hora a 25 °C, unas 2 horas a 22 °C y más de 4 horas a 15 °C. La regla que ordena todo es el coeficiente Q10: cada 10 °C de más, la actividad de la levadura se duplica y el tiempo se parte al medio.',
    },
    {
      q: '¿Por qué la misma receta leva distinto en invierno que en verano?',
      a: 'Porque la fermentación es una reacción biológica y depende de la temperatura, no del reloj. Una cocina a 28 °C en enero fermenta al doble de velocidad que la misma cocina a 18 °C en julio. Si la receta dice "1 hora", esa hora fue medida a alguna temperatura que casi nunca se aclara.',
    },
    {
      q: '¿Cómo convierto levadura fresca a seca?',
      a: 'Dividí por 3 para la instantánea y por 2,25 para la seca activa. Es decir: 30 g de fresca equivalen a 10 g de instantánea o a unos 13 g de seca activa. Al revés, multiplicá.',
    },
    {
      q: '¿Cómo sé que la masa ya levó lo suficiente?',
      a: 'Con el test del dedo: hundí un dedo enharinado un centímetro en la masa. Si la marca vuelve enseguida, le falta; si vuelve despacio y queda una huella leve, está en punto; si queda hundida y la masa se desinfla, se pasó. El volumen "al doble" es orientativo, el test del dedo es más confiable.',
    },
    {
      q: '¿Qué pasa si me paso de fermentación?',
      a: 'La red de gluten se degrada, la masa deja de retener gas y se desinfla al manipularla: el pan sale bajo, con miga apretada y gusto ácido o alcohólico. No se revierte del todo, pero se puede desgasificar, volver a bollar y hornear enseguida para rescatar algo.',
    },
    {
      q: '¿Puedo dejar la masa en la heladera toda la noche?',
      a: 'Sí, es el retardo en frío. A 4 °C la levadura queda casi dormida y el leudado se estira entre 8 y 24 horas según la dosis, mientras las enzimas siguen trabajando y desarrollan mucho más sabor. Sacala 1 o 2 horas antes de estirarla para que tome temperatura ambiente.',
    },
    {
      q: '¿Cuánta levadura lleva la pizza si la quiero fermentar 24 horas?',
      a: 'Muy poca: por debajo del 0,3% de fresca sobre la harina, y a menudo cerca del 0,1%. La cuenta es inversa — al multiplicar el tiempo por diez, la dosis se divide por diez. Poner dosis de fermentación corta y esperar 24 horas es la receta segura para pasarse.',
    },
    {
      q: '¿Cuántos gramos de masa lleva cada pizza?',
      a: 'Depende del estilo: 250 g para la napolitana de 30 cm del disciplinar AVPN, unos 300 g para la pizza al molde argentina, 220 g para una fina a la piedra y 380 g para una fugazza. Sobre ese peso de bollo se despeja la harina con el porcentaje panadero.',
    },
    {
      q: '¿Qué es el porcentaje panadero?',
      a: 'Es la convención con la que se escriben las recetas de panadería: la harina siempre es 100% y todo lo demás se expresa como porcentaje de ese peso. Una masa de 60% de hidratación, 2% de sal y 1% de levadura significa 600 g de agua, 20 g de sal y 10 g de levadura por cada kilo de harina.',
    },
    {
      q: '¿La sal frena la levadura?',
      a: 'Sí, la sal es osmóticamente activa y retrasa la fermentación, por eso conviene no volcarla directamente sobre la levadura. Con la dosis habitual de 2% el efecto es moderado y ya está contemplado en los tiempos de referencia; recién por encima del 3% el retraso se vuelve notorio.',
    },
    {
      q: '¿Y si uso masa madre en vez de levadura comercial?',
      a: 'Los tiempos se estiran mucho: una masa con 20% de masa madre activa suele necesitar entre 4 y 6 horas a temperatura ambiente para el primer leudado, y bastante más en frío. La temperatura sigue mandando igual, pero el equivalente en dosis no es directo porque depende de la actividad de tu propio fermento.',
    },
    {
      q: '¿El agua tiene que estar tibia?',
      a: 'Lo que importa es la temperatura final de la masa, no la del agua. En invierno el agua tibia (unos 30-35 °C) sirve para llegar a una masa de 24-26 °C; en verano, con harina y cocina calientes, a veces hay que usar agua fría para no arrancar por encima de 28 °C. Nunca pases de 45 °C: ahí la levadura empieza a morir.',
    },
  ],

  sources: [
    {
      name: 'Yeast conversions — equivalencias entre levadura fresca, seca activa e instantánea',
      url: 'https://www.kingarthurbaking.com/blog/2018/02/26/yeast-conversions',
      publisher: 'King Arthur Baking',
    },
    {
      name: 'A few tips on dough temperature — efecto de la temperatura sobre el tiempo de fermentación',
      url: 'https://www.weekendbakery.com/posts/a-few-tips-on-dough-temperature/',
      publisher: 'Weekend Bakery',
    },
    {
      name: 'Disciplinare Internazionale — peso del bollo y proporciones de la pizza napoletana',
      url: 'https://www.avpn.it/en/',
      publisher: 'Associazione Verace Pizza Napoletana',
    },
    {
      name: 'The Food Lab: the science of no-knead dough — fermentación, tiempo y desarrollo de sabor',
      url: 'https://www.seriouseats.com/the-food-lab-the-science-of-no-knead-dough',
      publisher: 'Serious Eats',
    },
  ],

  replaces: [
    '/calculadora-levadura-fermentacion-pizza-pan',
    '/calculadora-masa-pizza-casera-gramos-invitados',
    '/calculadora-masa-pizza-ingredientes-porciones',
    '/calculadora-tiempo-fermentacion-masa-temperatura',
    '/calculadora-leudado-pan-levadura-tiempo-temperatura',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Motor de fermentación. Espejo de src/lib/formulas/leudado-pan-levadura-tiempo-temperatura.ts:
 *   t = BASE_MIN × 2^((T_REF − T) / Q10) × (DOSIS_REF / dosis_equiv_fresca)
 */
export const LEUDADO = {
  /** Minutos del primer leudado en las condiciones de referencia. */
  BASE_MIN: 60,
  /** Temperatura de referencia, en °C. */
  T_REF: 25,
  /** Cada cuántos °C se duplica la actividad de la levadura. */
  Q10: 10,
  /** Dosis de referencia, en % de levadura fresca sobre la harina. */
  DOSIS_REF: 2,
  /** Límites duros del modelo. */
  TEMP_MIN: -5,
  TEMP_MAX: 55,
  DOSIS_MIN: 0.1,
  DOSIS_MAX: 20,
  /** Cuánta levadura fresca equivale 1 g de cada tipo. */
  EQUIV: { fresca: 1, seca_activa: 2.25, instantanea: 3 } as Record<string, number>,
  NOMBRE: {
    fresca: 'fresca',
    seca_activa: 'seca activa',
    instantanea: 'seca instantánea',
  } as Record<string, string>,
  /** Temperaturas de la fila comparativa. */
  COMPARAR: [18, 22, 26, 30],
};

/**
 * Estilos de pizza. Espejo de src/lib/formulas/masa-pizza-casera-gramos-invitados.ts:
 * porcentaje panadero con harina = 100%, sal 2%, aceite 3% (salvo napolitana)
 * y levadura seca instantánea 1%.
 */
export const ESTILOS: Record<string, { bollo: number; comen: number; aceite: boolean; nombre: string }> = {
  molde: { bollo: 300, comen: 4, aceite: true, nombre: 'al molde' },
  napolitana: { bollo: 250, comen: 3, aceite: false, nombre: 'napolitana' },
  fina: { bollo: 220, comen: 3, aceite: true, nombre: 'fina' },
  fugazza: { bollo: 380, comen: 6, aceite: true, nombre: 'fugazza' },
};

/** Porcentajes panaderos fijos de la receta de pizza. */
export const PIZZA = { SAL: 0.02, ACEITE: 0.03, LEVADURA_SECA: 0.01 };
