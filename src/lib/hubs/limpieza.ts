import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cada cuánto limpio y cuánto producto uso?"
 *
 * DECISIÓN DE ALCANCE: el cluster original traía 13 URLs y era un cajón de
 * sastre. Este hub absorbe 7 — las que responden de verdad la pregunta
 * (frecuencia, tiempo, dosis de producto y el ciclo de la ropa: lavar, gastar
 * agua, secar). Quedaron AFUERA a propósito, y siguen vivas:
 *   /calculadora-iluminacion-lux-lumens-ambiente   → iluminación, no limpieza (y es la más grande del cluster)
 *   /calculadora-forro-almohadon-medidas           → costura/textil, encaja en /hogar/amueblar
 *   /calculadora-plantas-purificar-aire-habitacion → plantas y calidad de aire
 *   /calculadora-vida-util-electrodomestico-anos   → reparar o reemplazar equipos
 *   /calculadora-proyectos-hogar                   → gestión de reformas
 *   /calculadora-costo-mantenimiento-hogar-anual   → mantenimiento del inmueble, no higiene
 * Un hub afilado de 7 rinde mejor que uno inflado de 13.
 */
export const hub: HubData = {
  slug: 'hogar/limpieza',
  title: '¿Cada cuánto limpio y cuánto producto uso? — Frecuencia, dosis y lavado',
  description:
    'Cuánto tiempo lleva limpiar tu casa, cada cuánto conviene hacerlo, cuántos ml de lavandina van por litro de agua según el uso, cuánto rinde un envase y qué cuesta lavar la ropa en casa frente a la lavandería.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Rutina, dosis y lavado',
  h1: '¿Cada cuánto limpio y cuánto producto uso?',
  lede:
    'Partimos del caso más frecuente: cuánto tiempo por semana te lleva mantener tu casa. Si lo que buscás es la dilución de la lavandina o el costo de lavar la ropa, cambiá el caso abajo.',
  stamps: ['Diluciones con advertencia de seguridad', 'Rutina, producto y ropa', '7 calculadoras adentro'],

  resultLabel: 'Tu estimación',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'rutina',
        label: '¿Cuánto tiempo por semana me lleva mantener la casa?',
        hint: 'Horas según metros y profundidad',
        answer: 'La limpieza de mantenimiento lleva unos 2 minutos por metro cuadrado.',
        yes: [
          'Horas semanales según los metros cuadrados y el nivel de profundidad',
          'Frecuencia recomendada según el tamaño de la casa',
          'Cuánto costaría tercerizarlo a valor hora',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Los minutos por metro cuadrado son un promedio: una casa con mucho mobiliario o alfombras se va bastante por encima.',
        ],
        plazo: 'repartir la carga en dos sesiones cortas por semana rinde más que una jornada larga.',
      },
      {
        id: 'ambiente',
        label: '¿Cada cuánto limpio cada ambiente?',
        hint: 'Cocina, baño, dormitorio…',
        answer: 'Cocina y baño piden frecuencia alta; el resto tolera semanal.',
        yes: [
          'Frecuencia recomendada por ambiente',
          'Minutos por sesión ajustados por cantidad de personas y mascotas',
          'Las tareas concretas que entran en cada limpieza',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Con más de 3 personas el tiempo sube un 30% y con mascotas un 40%: los recargos se multiplican entre sí.',
        ],
        plazo: 'ventilar 10-15 minutos por día baja la humedad y espacia las limpiezas profundas.',
      },
      {
        id: 'lavandina',
        label: '¿Cuánta lavandina va por litro de agua?',
        hint: 'Dilución por uso',
        answer: 'La dilución cambia según el uso: no hay una sola receta.',
        yes: [
          'Mililitros de lavandina por los litros de agua que prepares',
          'Equivalencia aproximada en tapitas de 5 ml',
          'Tiempo de contacto necesario para que desinfecte',
        ],
        warn: [
          'NUNCA mezcles lavandina con amoníaco, vinagre, limpiadores ácidos u otros productos: la mezcla libera cloramina y cloro gaseoso, que son tóxicos por inhalación.',
          'Usá siempre en lugar ventilado, con guantes, y mantenela fuera del alcance de chicos y mascotas.',
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'La dilución se prepara en el momento: pierde poder desinfectante en 24 horas y se degrada con la luz.',
        ],
        plazo: 'ante inhalación de vapores o contacto con los ojos, ventilá, enjuagá con agua y llamá al centro de intoxicaciones.',
      },
      {
        id: 'producto',
        label: '¿Cuánto me rinde un envase de producto?',
        hint: 'ml por m² y duración',
        answer: 'El rendimiento depende del producto y de los metros que limpies.',
        yes: [
          'Mililitros por uso según el tipo de producto y la superficie',
          'Cuántos días dura un envase de 1 litro con tu frecuencia',
          'Envases por mes que vas a necesitar comprar',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Los consumos por metro cuadrado suponen producto diluido según la etiqueta. Usarlo puro multiplica el gasto sin limpiar mejor.',
        ],
        plazo: 'comprar concentrado y diluirlo en casa suele bajar el costo por uso a menos de la mitad.',
      },
      {
        id: 'ropa',
        label: '¿Me conviene lavar en casa o en la lavandería?',
        hint: 'Costo por lavado',
        answer: 'La lavandería gana sólo si lavás poco o no tenés equipo.',
        yes: [
          'Costo por lavado en casa, sumando agua, luz, jabón y amortización del lavarropas',
          'Costo por lavado en la lavandería según el precio por kilo',
          'Diferencia mensual y anual entre las dos opciones',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si ponés el precio del lavarropas, la amortización se reparte entre todos los lavados de su vida útil: con poca frecuencia de lavado el equipo casi no se paga.',
        ],
        plazo: 'lavar con carga completa y en agua fría es lo que más mueve el costo por lavado.',
      },
      {
        id: 'lavarropas',
        label: '¿Cuánta agua y luz gasta mi lavarropas?',
        hint: 'Litros y kWh por ciclo',
        answer: 'El consumo por ciclo sale de la etiqueta de eficiencia y la capacidad.',
        yes: [
          'Litros de agua y kWh por ciclo según etiqueta energética y kilos de carga',
          'Costo mensual y anual separado en agua y energía',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Los coeficientes por etiqueta son valores de referencia del ensayo normalizado. El programa que elegís cambia bastante el consumo real.',
        ],
        plazo: 'el 80-90% de la energía de un lavado se va en calentar el agua: lavar en frío es el ahorro más grande.',
      },
      {
        id: 'secado',
        label: '¿Cuánto tarda en secarse la ropa al aire?',
        hint: 'Temperatura, humedad y viento',
        answer: 'La humedad y el viento pesan más que la temperatura.',
        yes: [
          'Horas estimadas de secado según prenda, temperatura, humedad, viento y sol',
          'Qué factor te está frenando el secado',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si la ropa pasa más de 24 horas húmeda aparece olor a humedad por proliferación bacteriana: conviene techo ventilado o secarropas.',
        ],
        plazo: 'colgar separado y sin doblar recorta el tiempo más que cualquier otro truco.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada caso usa sólo los campos que necesita. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'm2', label: 'Metros cuadrados de la casa', type: 'number', min: 1, value: 70 },
    {
      id: 'profundidad',
      label: 'Nivel de limpieza',
      type: 'select',
      value: 'mantenimiento',
      options: [
        { value: 'mantenimiento', label: 'Mantenimiento (2 min/m²)' },
        { value: 'media', label: 'Media (3 min/m²)' },
        { value: 'a_fondo', label: 'A fondo (6 min/m²)' },
      ],
    },
    { id: 'valorHora', label: 'Valor hora de un servicio de limpieza', prefix: '$', value: '8.000', thousands: true },
    {
      id: 'ambiente',
      label: 'Ambiente a limpiar',
      type: 'select',
      value: 'cocina',
      options: [
        { value: 'cocina', label: 'Cocina' },
        { value: 'bano', label: 'Baño' },
        { value: 'dormitorio', label: 'Dormitorio' },
        { value: 'living', label: 'Living' },
        { value: 'pisos', label: 'Pisos de toda la casa' },
        { value: 'ventanas', label: 'Ventanas y vidrios' },
      ],
    },
    { id: 'personas', label: 'Personas que viven en la casa', type: 'number', min: 1, max: 15, value: 3 },
    {
      id: 'mascotas',
      label: '¿Hay mascotas?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
    },
    {
      id: 'uso',
      label: 'Para qué vas a usar la lavandina',
      type: 'select',
      value: 'superficies',
      options: [
        { value: 'superficies', label: 'Desinfectar superficies' },
        { value: 'bano', label: 'Limpiar el baño' },
        { value: 'ropa', label: 'Desinfectar ropa' },
        { value: 'verduras', label: 'Lavar verduras' },
        { value: 'potabilizar', label: 'Potabilizar agua' },
        { value: 'tanque', label: 'Limpiar el tanque' },
      ],
    },
    { id: 'litros', label: 'Litros de agua que vas a preparar', type: 'number', min: 0, step: 0.5, value: 5 },
    {
      id: 'concentracion',
      label: 'Concentración de la lavandina',
      type: 'select',
      value: 'comun',
      options: [
        { value: 'comun', label: 'Común (≈25 g/L de cloro activo)' },
        { value: 'concentrada', label: 'Concentrada (el doble)' },
      ],
    },
    {
      id: 'producto',
      label: 'Producto de limpieza',
      type: 'select',
      value: 'limpiador',
      options: [
        { value: 'limpiador', label: 'Limpiador multiuso' },
        { value: 'desengrasante', label: 'Desengrasante' },
        { value: 'lavandina', label: 'Lavandina' },
        { value: 'limpiavidrios', label: 'Limpiavidrios' },
        { value: 'cera', label: 'Cera para pisos' },
        { value: 'detergente', label: 'Detergente' },
      ],
    },
    { id: 'm2Producto', label: 'Superficie que limpiás con ese producto (m²)', type: 'number', min: 1, value: 40 },
    { id: 'vecesSemana', label: 'Veces por semana que lo usás', type: 'number', min: 1, max: 21, value: 3 },
    { id: 'lavadosSemana', label: 'Lavados de ropa por semana', type: 'number', min: 1, max: 40, value: 3 },
    { id: 'kgPorLavado', label: 'Kilos de ropa por lavado', type: 'number', min: 1, max: 20, value: 5 },
    { id: 'precioLavanderiaKg', label: 'Precio de la lavandería por kilo', prefix: '$', value: '2.500', thousands: true },
    { id: 'costoAgua', label: 'Costo de agua por lavado', prefix: '$', value: '200', thousands: true },
    { id: 'costoLuz', label: 'Costo de luz por lavado', prefix: '$', value: '300', thousands: true },
    { id: 'costoJabon', label: 'Costo de jabón por lavado', prefix: '$', value: '400', thousands: true },
    { id: 'precioLavarropas', label: 'Precio del lavarropas (0 si ya lo tenés amortizado)', prefix: '$', value: '0', thousands: true },
    { id: 'vidaUtilAnos', label: 'Años de vida útil del lavarropas', type: 'number', min: 1, max: 30, value: 10 },
    { id: 'capacidadKg', label: 'Capacidad del lavarropas (kg)', type: 'number', min: 1, max: 25, value: 8 },
    {
      id: 'etiqueta',
      label: 'Etiqueta de eficiencia energética',
      type: 'select',
      value: 'A',
      options: [
        { value: 'A+++', label: 'A+++' },
        { value: 'A++', label: 'A++' },
        { value: 'A+', label: 'A+' },
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
      ],
    },
    { id: 'precioKwh', label: 'Precio del kWh', prefix: '$', value: '90', thousands: true },
    { id: 'precioM3Agua', label: 'Precio del m³ de agua', prefix: '$', value: '900', thousands: true },
    {
      id: 'prenda',
      label: 'Prenda a secar',
      type: 'select',
      value: 'remera',
      options: [
        { value: 'medias', label: 'Medias' },
        { value: 'remera', label: 'Remera' },
        { value: 'camisa', label: 'Camisa' },
        { value: 'sabana', label: 'Sábana' },
        { value: 'jean', label: 'Jean' },
        { value: 'buzo', label: 'Buzo' },
        { value: 'toalla', label: 'Toalla' },
      ],
    },
    { id: 'temperatura', label: 'Temperatura exterior (°C)', type: 'number', min: -15, max: 50, value: 22 },
    { id: 'humedad', label: 'Humedad relativa (%)', type: 'number', min: 1, max: 100, value: 65 },
    { id: 'viento', label: 'Viento (km/h)', type: 'number', min: 0, max: 150, value: 10 },
    {
      id: 'sol',
      label: 'Exposición al sol',
      type: 'select',
      value: 'parcial',
      options: [
        { value: 'pleno', label: 'Sol pleno' },
        { value: 'parcial', label: 'Sol parcial' },
        { value: 'sombra', label: 'Sombra' },
      ],
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Nunca mezcles lavandina con amoníaco, vinagre ni limpiadores ácidos: la mezcla libera gases tóxicos.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte el resultado',
    caption:
      'Cada segmento muestra qué parte del total aporta cada componente: los rubros de costo, los minutos de cada ambiente o los mililitros de cada preparación.',
  },
  breakdownTitle: 'El detalle de tu caso',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánta lavandina va por litro de agua para desinfectar superficies?',
      a: 'Con lavandina común de unos 25 g/L de cloro activo, la referencia es 10 ml por litro de agua (unas 2 tapitas), dejando 10 minutos de contacto sin enjuagar. Para el baño se sube a 15 ml/L y para desinfectar ropa a 20 ml/L. Con lavandina concentrada se usa la mitad.',
    },
    {
      q: '¿Por qué no se puede mezclar lavandina con vinagre o amoníaco?',
      a: 'La lavandina con un ácido como el vinagre libera cloro gaseoso, y con amoníaco (presente en muchos limpiavidrios) forma cloraminas. Las dos mezclas son tóxicas por inhalación y pueden causar daño respiratorio grave incluso en un baño chico. La lavandina se usa sola y diluida en agua.',
    },
    {
      q: '¿Cuánta lavandina se usa para potabilizar agua?',
      a: 'La referencia es 0,1 ml por litro —dos gotas por litro— dejando reposar 30 minutos antes de consumir. Es una medida de emergencia: si el agua está turbia hay que filtrarla antes, y si hay una fuente segura disponible, siempre es preferible.',
    },
    {
      q: '¿Cada cuánto hay que limpiar el baño?',
      a: 'Superficies de contacto e inodoro, dos o tres veces por semana, con una limpieza profunda semanal que incluya ducha, rejilla y azulejos. Una sesión típica lleva unos 15 minutos, que suben si viven más de tres personas.',
    },
    {
      q: '¿Cuántas horas por semana lleva limpiar una casa?',
      a: 'Para limpieza de mantenimiento se calculan unos 2 minutos por metro cuadrado: una casa de 70 m² son unas 2,3 horas semanales. Una limpieza media va a 3 min/m² y una a fondo a 6 min/m², que triplica el tiempo.',
    },
    {
      q: '¿Cuánto dura un envase de un litro de limpiador?',
      a: 'Depende de la superficie y la frecuencia. Un multiuso rinde unos 5 ml por metro cuadrado: limpiando 40 m² tres veces por semana se van 600 ml por semana y el litro dura poco más de diez días. Diluido según etiqueta el rendimiento se estira mucho.',
    },
    {
      q: '¿Conviene lavar la ropa en casa o llevarla a la lavandería?',
      a: 'En casa el costo por lavado es la suma de agua, luz y jabón, más la amortización del lavarropas repartida entre todos los lavados de su vida útil. La lavandería cobra por kilo, así que gana cuando lavás poco: cuanto más alta la frecuencia, más rápido se paga el equipo propio.',
    },
    {
      q: '¿Cuánta agua gasta un lavarropas por ciclo?',
      a: 'Depende de la etiqueta de eficiencia y de los kilos de carga. Un equipo A de 8 kg usa unos 72 litros por ciclo; uno D de la misma capacidad se va a 120 litros. En energía la brecha es mayor todavía: de 1,6 kWh a 3,4 kWh por ciclo.',
    },
    {
      q: '¿Cuánto tarda en secarse la ropa al aire libre?',
      a: 'Una remera con 22 °C, 65% de humedad, 10 km/h de viento y sol parcial tarda algo más de 2 horas. Un jean o un buzo duplican ese tiempo y una toalla lo triplica. La humedad alta es lo que más frena: por encima del 85% el tiempo se duplica.',
    },
    {
      q: '¿Qué factor influye más en el secado: el sol o el viento?',
      a: 'El viento. Pasar de aire quieto a más de 25 km/h recorta el tiempo a menos de la mitad, mientras que el sol pleno frente a la sombra lo baja alrededor de un tercio. Por eso conviene colgar separado y en un lugar donde circule el aire aunque no dé el sol.',
    },
    {
      q: '¿Cuánto tiempo suma tener mascotas a la limpieza?',
      a: 'Alrededor de un 40% por sesión, sobre todo por pelo en pisos y tapizados. Si además viven más de tres personas, los dos recargos se multiplican: una cocina que llevaba 20 minutos pasa a unos 36.',
    },
    {
      q: '¿Se puede reutilizar la lavandina diluida de un día para otro?',
      a: 'No conviene. El cloro activo se degrada con la luz y con el tiempo: a las 24 horas la solución ya perdió buena parte de su poder desinfectante. Se prepara la cantidad que vas a usar y se descarta el sobrante.',
    },
  ],

  sources: [
    {
      name: 'Desinfección de superficies y preparación de soluciones de hipoclorito de sodio',
      url: 'https://www.argentina.gob.ar/salud',
      publisher: 'Ministerio de Salud de la Nación',
    },
    {
      name: 'Cleaning and Disinfecting Your Home — diluciones y advertencia de no mezclar productos',
      url: 'https://www.cdc.gov/hygiene/about/cleaning-and-disinfecting-your-home.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'Guías para la calidad del agua de consumo humano — cloración de emergencia',
      url: 'https://www.who.int/publications/i/item/9789241549950',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Etiquetado de eficiencia energética de lavarropas (consumo de agua y energía por ciclo)',
      url: 'https://www.argentina.gob.ar/produccion/etiquetado-de-eficiencia-energetica',
      publisher: 'Secretaría de Industria y Comercio',
    },
  ],

  replaces: [
    '/calculadora-limpieza-hogar-tiempo-metros-frecuencia-total',
    '/calculadora-limpieza-frecuencia-ambiente-hogar',
    '/calculadora-lavandina-dilucion-litros-ml',
    '/calculadora-producto-limpieza-rendimiento-m2',
    '/calculadora-costo-lavado-ropa-lavadora-vs-lavanderia',
    '/calculadora-lavarropas-eficiencia-agua-litros-ciclo',
    '/calculadora-tiempo-secado-ropa-aire-libre-horas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Minutos por m² según profundidad. Espejo de limpieza-hogar-tiempo-metros-frecuencia-total.ts. */
export const MIN_POR_M2: Record<string, number> = { mantenimiento: 2, media: 3, a_fondo: 6 };

/** Frecuencia, minutos base y tareas por ambiente. Espejo de limpieza-frecuencia-ambiente.ts. */
export const AMBIENTES: Record<string, { freq: string; minutos: number; tareas: string }> = {
  cocina: {
    freq: 'Diaria (superficies) + semanal (profunda)',
    minutos: 20,
    tareas: 'Mesada, anafe, pisos, rejilla pileta, heladera (semanal), horno (quincenal)',
  },
  bano: {
    freq: '2-3 veces/semana + semanal profunda',
    minutos: 15,
    tareas: 'Inodoro, pileta, espejo, pisos, ducha/bañera, rejilla',
  },
  dormitorio: {
    freq: 'Semanal',
    minutos: 20,
    tareas: 'Cambiar sábanas, aspirar/barrer, limpiar superficies, ventilar 15 min',
  },
  living: {
    freq: 'Semanal',
    minutos: 25,
    tareas: 'Aspirar/barrer, limpiar muebles, ordenar, limpiar vidrios (quincenal)',
  },
  pisos: {
    freq: '2-3 veces/semana',
    minutos: 30,
    tareas: 'Barrer + pasar trapo húmedo. Aspirar alfombras. Baldeado profundo semanal',
  },
  ventanas: {
    freq: 'Mensual (interior) + trimestral (exterior)',
    minutos: 40,
    tareas: 'Vidrios interior/exterior, marcos, persianas, mosquiteros (trimestral)',
  },
};

/** ml de lavandina por litro de agua según uso. Espejo de lavandina-dilucion-litros.ts. */
export const ML_POR_LITRO: Record<string, number> = {
  superficies: 10,
  verduras: 5,
  potabilizar: 0.1,
  bano: 15,
  ropa: 20,
  tanque: 25,
};

/** Tiempo de contacto por uso. Espejo de lavandina-dilucion-litros.ts. */
export const TIEMPOS_CONTACTO: Record<string, string> = {
  superficies: '10 minutos de contacto, no enjuagar',
  verduras: '10 minutos de remojo, enjuagar bien',
  potabilizar: '30 minutos antes de consumir',
  bano: '15 minutos de contacto, enjuagar',
  ropa: '10 minutos en remojo, luego lavar normal',
  tanque: '2 horas, vaciar y enjuagar 2 veces',
};

export const USOS_NOMBRE: Record<string, string> = {
  superficies: 'desinfectar superficies',
  verduras: 'lavar verduras',
  potabilizar: 'potabilizar agua',
  bano: 'limpiar el baño',
  ropa: 'desinfectar ropa',
  tanque: 'limpiar el tanque',
};

/** ml por m² según producto. Espejo de producto-limpieza-rendimiento.ts. */
export const ML_POR_M2: Record<string, number> = {
  limpiador: 5,
  desengrasante: 8,
  lavandina: 3,
  limpiavidrios: 10,
  cera: 15,
  detergente: 2,
};

/** Coeficientes de agua (L/kg) y energía (kWh/kg) por etiqueta. Espejo de lavarropas-eficiencia-agua-litros-ciclo.ts. */
export const COEF_AGUA: Record<string, number> = { 'A+++': 6, 'A++': 7, 'A+': 8, A: 9, B: 11, C: 13, D: 15 };
export const COEF_KWH: Record<string, number> = { 'A+++': 0.1, 'A++': 0.13, 'A+': 0.16, A: 0.2, B: 0.25, C: 0.32, D: 0.42 };

/** Horas base de secado por prenda. Espejo de tiempo-secado-ropa-aire.ts. */
export const SECADO_BASE: Record<string, number> = {
  remera: 3,
  camisa: 3,
  medias: 2,
  buzo: 6,
  jean: 6,
  toalla: 9,
  sabana: 5,
};

/** Semanas promedio por mes que usan las fórmulas originales. */
export const SEMANAS_MES = 4.33;
