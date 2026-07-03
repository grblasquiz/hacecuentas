/**
 * Config de los 4 hubs de FIN DE SEMANA por intención (/fin-de-semana/<slug>).
 *
 * Son sub-hubs del meta-hub /calculadoras-fin-de-semana: cada uno concentra
 * la link-equity de una intención concreta (comer, festejar, escaparse,
 * arreglar la casa) con herramientas destacadas, orden recomendado y FAQ.
 *
 * Los `clusterKeys` se expanden a slugs vía WEEKEND_CLUSTERS (validados por el
 * link-guard). Los `extraSlugs` son calcs nuevas evergreen agregadas en este
 * lote. `featuredSlugs` deben estar dentro del set resuelto.
 */

export interface FindeHubDef {
  slug: string;
  title: string;
  h1: string;
  description: string;
  lede: string;
  pitch: string;
  icon: string;
  shortLabel: string;
  lastReviewed: string; // YYYY-MM-DD → señal de lastmod del sitemap
  clusterKeys: string[];
  extraSlugs: string[];
  featuredSlugs: string[];
  relatedGuides: Array<{ slug: string; label: string }>;
  relatedComparisons: Array<{ slug: string; label: string }>;
  quePodesCalcular: string[];
  ordenRecomendado: Array<{ paso: string; detalle: string }>;
  faq: Array<{ q: string; a: string }>;
}

export const FINDE_HUBS: FindeHubDef[] = [
  {
    slug: 'comida-y-juntadas',
    title: 'Comida y juntadas: cuánto comprar para tus invitados | Hacé Cuentas',
    h1: 'Comida y juntadas',
    description: 'Todas las calculadoras para comer con amigos sin comprar de más ni quedarte corto: carne, pan, ensalada, bebidas, café, mate, pizza, empanadas y postre por persona.',
    lede: 'La juntada perfecta empieza por no quedarte corto ni tirar comida. Reunimos las calculadoras que te dicen exactamente cuánto comprar de cada cosa —carne, pan, ensalada, bebidas, café, pizza, empanadas y postre— según cuántos van a comer. Cargás los invitados una vez y salís a comprar con la lista justa.',
    pitch: 'Calcular al ojo termina siempre igual: o falta comida y alguien se queda con hambre, o sobra medio kilo de cada cosa que después nadie come. Estas herramientas usan porciones de referencia probadas para que compres lo justo, con un margen sano para el que cae sin avisar.',
    icon: '🍽️',
    shortLabel: 'Comida y juntadas',
    lastReviewed: '2026-07-03',
    clusterKeys: ['comida-invitados', 'bebidas-evento', 'cocina-porciones', 'cocina-conversores'],
    extraSlugs: [
      'calculadora-carbon-asado-kg',
      'calculadora-pan-para-comida-evento',
      'calculadora-ensalada-por-persona',
      'calculadora-hielo-para-fiesta',
      'calculadora-cafe-para-evento',
      'calculadora-mate-yerba-para-ronda',
      'calculadora-brochetas-por-invitado',
      'calculadora-sandwiches-miga-por-persona',
      'calculadora-pollo-por-persona',
      'calculadora-milanesas-por-persona',
    ],
    featuredSlugs: [
      'calculadora-comida-para-invitados',
      'calculadora-cerveza-invitado-evento',
      'calculadora-carbon-asado-kg',
    ],
    relatedGuides: [
      { slug: 'comida-reunion-cuanto-comprar', label: 'Cómo calcular cuánta comida comprar para una reunión' },
      { slug: 'dividir-gastos-amigos-sin-errores', label: 'Cómo dividir gastos entre amigos sin equivocarse' },
    ],
    relatedComparisons: [
      { slug: 'cuanta-comida-comprar-reunion', label: '¿Cuánta comida comprar para una reunión?' },
    ],
    quePodesCalcular: [
      'Cuánta comida principal comprar según el plato (pizza, empanadas, milanesas, pollo, picada).',
      'Cuánto pan, ensalada, carbón y hielo sumar para no olvidarte de nada.',
      'Cuánta cerveza, vino, fernet, agua y café por invitado, según cuántas horas dure.',
      'Cuántas porciones de postre y torta según los comensales.',
      'Cómo escalar una receta para más o menos personas y convertir tazas a gramos.',
      'Cuánta yerba y agua caliente para una ronda de mates.',
    ],
    ordenRecomendado: [
      { paso: 'Definí el menú', detalle: 'Elegí el plato principal y calculá las porciones por persona con la calculadora de comida para invitados.' },
      { paso: 'Sumá los complementos', detalle: 'Pan, ensalada y —si es asado— carbón. Son los que más se olvidan.' },
      { paso: 'Calculá la bebida', detalle: 'Cerveza, vino o fernet por invitado, más agua y hielo según las horas y el calor.' },
      { paso: 'Cerrá con el postre', detalle: 'Torta o postre por comensal, y el café si hay sobremesa.' },
      { paso: 'Armá la lista final', detalle: 'Anotá cantidades con un 10% de margen por si cae alguien de último momento.' },
    ],
    faq: [
      { q: '¿Cuánta comida calculo por persona en una juntada?', a: 'Depende del plato: 3 porciones de pizza, 6 empanadas, 1,5 hamburguesas o 500 g de carne de asado por adulto. La calculadora de comida para invitados te lo resuelve según el tipo de comida y la cantidad de gente.' },
      { q: '¿Cómo evito que sobre o falte comida?', a: 'Usá porciones de referencia y sumá un 10% de margen. Elegí platos que se guarden bien (pizza, empanadas, picada) para que las sobras no se desperdicien.' },
      { q: '¿Cuánta bebida por invitado?', a: 'Alrededor de 0,75 L por adulto para todo el evento entre gaseosa, cerveza o vino, más 0,5 L de agua por persona. Si hace calor o dura más de 4 horas, sumá un 20%.' },
      { q: '¿Cuánto pan y ensalada agrego?', a: 'Unos 90 g de pan por adulto en una comida de mesa (150 g si es asado) y 110 g de ensalada como guarnición. Tenemos una calculadora para cada uno.' },
      { q: '¿Cuánto carbón para el asado?', a: 'Entre 0,6 y 1,3 kg de carbón por persona según lo largo que sea. Para 10 personas en un asado normal, unos 9 kg. La calculadora de carbón te da también las pastillas y el tiempo hasta las brasas.' },
      { q: '¿Cómo calculo el postre?', a: 'Alrededor de 1,1 porciones de postre por persona, o una torta según los comensales. Si hay torta y postre, bajá la porción de postre a la mitad.' },
      { q: '¿Sirve para una picada o previa?', a: 'Sí: calculá 200 g de fiambre y queso por adulto si es la comida principal, o 100-150 g si es previa, más pan, y sumá bebidas y hielo con las calculadoras del hub.' },
    ],
  },
  {
    slug: 'fiestas-y-reuniones',
    title: 'Fiestas y reuniones: presupuesto, bebidas y vajilla | Hacé Cuentas',
    h1: 'Fiestas y reuniones',
    description: 'Organizá una fiesta o reunión sin sorpresas: presupuesto por invitado, bebidas, vasos y platos descartables, sillas y mesas, hielo y todo lo que necesitás calcular.',
    lede: 'Un cumpleaños, un after o una reunión grande se van de presupuesto por los detalles que nadie calcula: los vasos descartables, el hielo, las sillas, cuánta bebida por invitado. Este hub junta las herramientas para que armes la fiesta con números, no a ojo, y sepas cuánto vas a gastar antes de empezar.',
    pitch: 'La diferencia entre una fiesta redonda y un dolor de cabeza suele estar en la planificación. Calcular el presupuesto por invitado, la bebida, la vajilla y el mobiliario de antemano te evita el viaje de último momento al kiosco y el susto cuando llega la cuenta.',
    icon: '🎉',
    shortLabel: 'Fiestas y reuniones',
    lastReviewed: '2026-07-03',
    clusterKeys: ['presupuesto-evento', 'bebidas-evento', 'asado'],
    extraSlugs: [
      'calculadora-vajilla-descartable-fiesta',
      'calculadora-facturas-por-persona-desayuno',
      'calculadora-hielo-para-fiesta',
      'calculadora-brochetas-por-invitado',
    ],
    featuredSlugs: [
      'calculadora-presupuesto-cumpleanos',
      'calculadora-cerveza-invitado-evento',
      'calculadora-vajilla-descartable-fiesta',
    ],
    relatedGuides: [
      { slug: 'presupuesto-fiesta-como-armar', label: 'Cómo armar un presupuesto para una fiesta' },
      { slug: 'dividir-gastos-amigos-sin-errores', label: 'Cómo dividir gastos entre amigos sin equivocarse' },
    ],
    relatedComparisons: [
      { slug: 'cuanto-gastar-por-invitado', label: '¿Cuánto debería gastar por invitado?' },
    ],
    quePodesCalcular: [
      'El presupuesto total y por invitado de un cumpleaños, casamiento o fiesta de 15.',
      'Cuánta cerveza, vino, fernet, whisky y agua según los invitados y las horas.',
      'Cuántos vasos, platos, cubiertos y servilletas descartables comprar.',
      'Cuántas sillas y mesas necesitás para sentar a todos.',
      'Cuánto hielo para enfriar bebidas o armar la barra de tragos.',
      'Cotillón, invitaciones y souvenirs según la cantidad de gente.',
    ],
    ordenRecomendado: [
      { paso: 'Fijá el presupuesto', detalle: 'Empezá por el presupuesto de cumpleaños o evento para saber cuánto podés gastar por invitado.' },
      { paso: 'Calculá la bebida', detalle: 'Cerveza, vino, fernet y agua por invitado según las horas del evento.' },
      { paso: 'Resolvé la vajilla', detalle: 'Vasos, platos, cubiertos y servilletas descartables según la cantidad de gente.' },
      { paso: 'Sentá a todos', detalle: 'Sillas y mesas necesarias, y el hielo para las bebidas.' },
      { paso: 'Detalles finales', detalle: 'Cotillón, invitaciones y souvenirs para cerrar la organización.' },
    ],
    faq: [
      { q: '¿Cuánto se gasta por invitado en una fiesta?', a: 'Varía mucho según el tipo de evento y si es en casa o en salón. La calculadora de presupuesto de cumpleaños desglosa comida, bebida, torta, cotillón y extras para que veas el costo por invitado con tus propios precios.' },
      { q: '¿Cuántos vasos descartables compro?', a: 'Alrededor de 3 vasos por persona en un cumpleaños y hasta 4 en un after largo, porque la gente cambia de vaso. Para 30 personas, unos 90 vasos. La calculadora de vajilla descartable te da también platos, cubiertos y servilletas.' },
      { q: '¿Cuánta bebida por invitado?', a: 'Para un evento de varias horas, calculá 1 litro de bebida por adulto más agua, ajustando según si hay barra de tragos. Cada bebida (cerveza, vino, fernet) tiene su propia calculadora por invitado.' },
      { q: '¿Cuántas sillas y mesas necesito?', a: 'Depende de si es formato sentado o de pie. La calculadora de sillas y mesas te dice cuántas necesitás y cómo distribuirlas según los invitados.' },
      { q: '¿Cuánto hielo para una fiesta?', a: 'Entre 0,5 y 1 kg de hielo por persona según el uso (enfriar bebidas o barra de tragos) y el calor. Para 30 personas, entre 15 y 30 kg. Compralo el mismo día.' },
      { q: '¿Cómo calculo un cumpleaños infantil?', a: 'Usá la calculadora de costo de fiesta infantil: contempla la merienda, la torta, el cotillón, los souvenirs y el salón o animación, con el costo por chico.' },
      { q: '¿Y si es un evento con desayuno o merienda?', a: 'Sumá la calculadora de facturas y medialunas por persona y la de café para evento, que te dan las cantidades para el catering dulce.' },
    ],
  },
  {
    slug: 'escapadas',
    title: 'Escapadas de fin de semana: presupuesto, nafta y hospedaje | Hacé Cuentas',
    h1: 'Escapadas de fin de semana',
    description: 'Planificá tu escapada sin sorpresas: costo de combustible y peajes, presupuesto del viaje, noches de hospedaje, tiempo con paradas y cómo dividir los gastos.',
    lede: 'Una escapada de fin de semana se disfruta más cuando sabés cuánto vas a gastar antes de salir. Este hub reúne las calculadoras para estimar la nafta y los peajes, el hospedaje, el presupuesto total del viaje y cuánto le toca a cada uno, así arrancás tranquilo y sin sorpresas en la tarjeta.',
    pitch: 'El costo de un viaje en auto casi nunca es lo que uno cree: entre nafta, peajes, hospedaje y comidas, la cuenta se dispara. Calcularlo de antemano —y dividirlo entre los que van— te deja planificar con realismo y evita las discusiones de "quién puso qué" al volver.',
    icon: '🚗',
    shortLabel: 'Escapadas',
    lastReviewed: '2026-07-03',
    clusterKeys: ['viajes-combustible', 'viajes-presupuesto'],
    extraSlugs: [
      'calculadora-noches-hospedaje-costo',
      'calculadora-tiempo-viaje-con-paradas',
      'calculadora-alquiler-auto-costo-dias',
      'calculadora-nafta-mensual-commute',
    ],
    featuredSlugs: [
      'calculadora-costo-viaje-combustible-kilometros',
      'calculadora-presupuesto-viaje',
      'calculadora-noches-hospedaje-costo',
    ],
    relatedGuides: [
      { slug: 'presupuesto-viaje-completo', label: 'Cómo calcular el presupuesto completo de un viaje' },
      { slug: 'combustible-peajes-costo-por-persona-viaje', label: 'Cómo calcular combustible, peajes y costo por persona' },
    ],
    relatedComparisons: [
      { slug: 'auto-vs-transporte-publico-vacaciones', label: '¿Conviene viajar en auto o en transporte público?' },
    ],
    quePodesCalcular: [
      'El costo total del viaje en auto: nafta, peajes, estacionamiento y comidas.',
      'Cuánta nafta vas a gastar según la distancia y el consumo de tu auto.',
      'El presupuesto completo de las vacaciones o la escapada por destino.',
      'Cuánto sale el hospedaje según las noches y el precio por noche.',
      'Cuánto tarda el viaje sumando las paradas.',
      'Cómo dividir todos los gastos entre los que viajan.',
    ],
    ordenRecomendado: [
      { paso: 'Estimá el combustible', detalle: 'Cargá la distancia y el consumo de tu auto para saber cuánta nafta y cuánto vas a gastar.' },
      { paso: 'Sumá el hospedaje', detalle: 'Noches por precio por noche: el mayor costo de casi cualquier escapada.' },
      { paso: 'Armá el presupuesto total', detalle: 'Combustible, peajes, hospedaje, comidas y actividades en un solo número.' },
      { paso: 'Calculá el tiempo', detalle: 'La duración del viaje con paradas, para organizar la salida y las reservas.' },
      { paso: 'Dividí los gastos', detalle: 'Repartí el total entre los viajeros para que quede claro cuánto pone cada uno.' },
    ],
    faq: [
      { q: '¿Cómo calculo el costo de un viaje en auto?', a: 'Con la calculadora de costo de viaje: cargás la distancia, el consumo de tu auto, el precio de la nafta y los peajes, y te da el gasto total y por pasajero. Los precios los ponés vos, no inventamos tarifas.' },
      { q: '¿Cuánta nafta voy a gastar?', a: 'Depende de la distancia y del consumo de tu auto (litros cada 100 km). La calculadora de combustible lo resuelve; para un consumo de 8 L/100 km y 300 km, son unos 24 litros.' },
      { q: '¿Cuánto debería presupuestar para una escapada?', a: 'Sumá combustible, hospedaje, comidas y actividades. La calculadora de presupuesto de viaje te ayuda a armar el total por día y por persona con tus propios precios.' },
      { q: '¿Cómo calculo el hospedaje?', a: 'Multiplicá las noches por el precio por noche y las habitaciones. La calculadora de noches de hospedaje te da el total, el costo por noche y por persona.' },
      { q: '¿Cuánto tarda el viaje con paradas?', a: 'El tiempo de manejo depende de la distancia y la velocidad promedio; después sumás los minutos de cada parada. La calculadora de tiempo de viaje lo hace por vos.' },
      { q: '¿Conviene llevar auto propio o alquilar?', a: 'Depende de los kilómetros y los días. Podés estimar el costo de tu auto con la calculadora de combustible y compararlo con el de alquiler de auto por días (más seguro y nafta).' },
      { q: '¿Cómo divido los gastos del viaje?', a: 'Con la calculadora de dividir gastos entre amigos: cargás lo que puso cada uno y te dice quién le debe a quién para saldar todo al final.' },
    ],
  },
  {
    slug: 'proyectos-en-casa',
    title: 'Proyectos en casa: materiales para pintar, pisos y jardín | Hacé Cuentas',
    h1: 'Proyectos en casa',
    description: 'Calculá los materiales exactos para tus proyectos del finde: pintura, pisos, cerámicos, contrapiso, machimbre, adoquines, tierra para el jardín y más, sin comprar de más.',
    lede: 'El finde de arreglar la casa se arruina cuando faltan tres cajas de cerámicos o sobran cuatro latas de pintura. Este hub reúne las calculadoras de materiales para que estimes lo justo —con su margen de desperdicio— antes de ir al corralón: pintura, pisos, contrapiso, machimbre, adoquines, tierra para el jardín y mucho más.',
    pitch: 'Comprar materiales de más inmoviliza plata; comprar de menos te frena la obra y te obliga a volver al corralón. Calcular las cantidades con las fórmulas reales —incluyendo el desperdicio— es la forma más simple de que el proyecto del finde salga a la primera y sin gastar de más.',
    icon: '🔨',
    shortLabel: 'Proyectos en casa',
    lastReviewed: '2026-07-03',
    clusterKeys: ['hogar-proyectos', 'hogar-pintura', 'hogar-pisos', 'hogar-jardin', 'hogar-pileta'],
    extraSlugs: [
      'calculadora-tierra-jardin-cantero-m3',
      'calculadora-machimbre-revestimiento-m2',
      'calculadora-pintura-rejas-metal-litros',
      'calculadora-adoquines-m2',
      'calculadora-contrapiso-m3',
      'calculadora-venecitas-mosaico-m2',
      'calculadora-garrafa-gas-duracion',
      'calculadora-lena-estufa-hogar-invierno',
      'calculadora-pintura-pileta-piscina-m2',
    ],
    featuredSlugs: [
      'calculadora-proyectos-hogar',
      'calculadora-pintura-por-m2-litros-latas',
      'calculadora-contrapiso-m3',
    ],
    relatedGuides: [
      { slug: 'pintar-casa-materiales-litros', label: 'Cómo calcular materiales para pintar una casa' },
      { slug: 'estimar-materiales-construccion-sin-comprar-de-mas', label: 'Cómo estimar materiales sin comprar de más' },
    ],
    relatedComparisons: [
      { slug: 'pintar-vs-empapelar', label: '¿Conviene pintar o empapelar?' },
      { slug: 'reparar-vs-reemplazar-electrodomestico', label: '¿Conviene reparar o reemplazar?' },
    ],
    quePodesCalcular: [
      'Cuántos litros de pintura y latas para paredes, techos, rejas o la pileta.',
      'Cuántas cajas de cerámicos, porcellanato o piso flotante, y el zócalo.',
      'Materiales para contrapiso, revoque, machimbre, adoquines y venecitas.',
      'Cuánta tierra o sustrato para el jardín, la huerta o un cantero.',
      'El planificador de proyectos con materiales, tiempo y cronograma.',
      'Cuánto dura una garrafa y cuánta leña para la estufa en invierno.',
    ],
    ordenRecomendado: [
      { paso: 'Medí la superficie', detalle: 'Tomá los m² o metros lineales del área a trabajar; casi todas las calculadoras parten de ahí.' },
      { paso: 'Elegí el material', detalle: 'Pintura, cerámicos, contrapiso, machimbre o adoquines: cada uno tiene su calculadora con desperdicio incluido.' },
      { paso: 'Sumá el desperdicio', detalle: 'Dejá el margen sugerido (8-12%) para cortes, roturas y retoques.' },
      { paso: 'Armá la lista del corralón', detalle: 'Anotá cantidades en las unidades de venta (latas, cajas, bolsas) para comprar exacto.' },
      { paso: 'Estimá tiempo y costo', detalle: 'Usá el planificador de proyectos para el cronograma y sumá tus precios para el presupuesto.' },
    ],
    faq: [
      { q: '¿Cómo calculo cuánta pintura necesito?', a: 'Por los metros cuadrados de pared descontando aberturas, la cantidad de manos y el rendimiento de la pintura (unos 10-12 m²/L por mano). La calculadora de pintura te da los litros y las latas exactas.' },
      { q: '¿Cuántas cajas de cerámicos compro?', a: 'Por los m² del ambiente más un 8-10% de desperdicio por cortes, dividido por los m² que rinde cada caja. La calculadora de pisos te lo resuelve y te dice cuántas cajas comprar.' },
      { q: '¿Qué margen de desperdicio dejo?', a: 'Como regla, 8-10% en pisos y cerámicos, 10% en pintura y hasta 12% en venecitas o piezas chicas. Las calculadoras ya incluyen ese margen y podés ajustarlo.' },
      { q: '¿Cómo calculo el contrapiso?', a: 'Por el volumen (m² por espesor): la calculadora de contrapiso te da los m³ y las bolsas de cemento, la arena y el cascote necesarios.' },
      { q: '¿Cuánta tierra para el jardín o la huerta?', a: 'Por el volumen del cantero (largo × ancho × profundidad). La calculadora de tierra te da los m³, los litros y las bolsas de sustrato de 40 L.' },
      { q: '¿Puedo calcular el presupuesto de materiales?', a: 'Sí: las calculadoras te dan las cantidades y vos sumás tus precios del corralón. No inventamos precios porque varían por zona y marca.' },
      { q: '¿Sirve para proyectos de un fin de semana?', a: 'Justamente para eso: el planificador de proyectos del hogar te da los materiales, el tiempo estimado y el cronograma para pintar, poner piso o empapelar en el finde.' },
    ],
  },
];
