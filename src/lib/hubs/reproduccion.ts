import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto dura la gestación de mi perra?"
 * Absorbe 4 URLs de calculadora suelta (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos. El resultado declara `format:'unit'` y cada fila declara
 *    el suyo (días, semanas, cachorros, meses). Una fila sin `format` cae a "$"
 *    y la página miente.
 *  - `chart.type: 'timeline'`: las etapas viajan con `from`/`to` en días de
 *    gestación y el día de hoy va en `position` + `positionLabel`.
 *  - Es salud animal. No es YMYL humano, pero el copy no da indicación clínica:
 *    toda complicación va al veterinario.
 */
export const hub: HubData = {
  slug: 'mascotas/gestacion',
  title: '¿Cuánto dura la gestación de mi perra? Fecha de parto, camada y celo',
  description:
    'La gestación canina dura unos 63 días desde la monta, con un rango normal de 58 a 68. Poné la fecha de la monta y salen la fecha estimada de parto, en qué semana va hoy, cuántos cachorros esperar según la raza y cuándo vuelve el celo. También gata, coneja y hámster.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuánto dura la gestación de mi perra?',
  lede:
    'Unos 63 días desde la monta, con un rango normal de 58 a 68. Es corto y pasa rápido: en nueve semanas tu perra pasa de no notarse nada a estar buscando dónde parir. Poné la fecha de la monta y vas a ver la fecha estimada, en qué semana está hoy, cuántos cachorros esperar según la raza y cuándo le vuelve el celo. La cuenta también sirve para gata, coneja y hámster.',
  stamps: ['Actualizado 27-07-2026', '63 días desde la monta · rango 58 a 68', '4 calculadoras adentro'],

  resultLabel: 'Fecha estimada de parto',

  inputsTitle: 'Contanos de tu perra',
  inputsIntro:
    'Con la fecha de la monta ya sale el parto. La raza y la edad afinan el tamaño de la camada; el ciclo, cuándo vuelve el celo.',
  fields: [
    {
      id: 'especie',
      label: 'Especie',
      type: 'select',
      value: 'perro',
      options: [
        { value: 'perro', label: 'Perra — 63 días' },
        { value: 'gato', label: 'Gata — 65 días' },
        { value: 'conejo', label: 'Coneja — 31 días' },
        { value: 'hamster', label: 'Hámster — 16 días' },
      ],
      help: 'La duración cambia por especie. El tamaño de camada por raza y la vuelta del celo son datos caninos: en las otras especies se omiten.',
    },
    {
      id: 'fechaMonta',
      label: 'Fecha de la monta',
      type: 'date',
      value: '2026-06-01',
      help: 'Si hubo varias montas, poné la primera: es la que marca el piso del rango. La cuenta arranca en la monta, no en el pico de LH, que suele caer 1 o 2 días antes.',
    },
    {
      id: 'raza',
      label: 'Raza de la perra',
      type: 'select',
      value: 'labrador-retriever',
      options: [
        { value: 'labrador-retriever', label: 'Labrador retriever' },
        { value: 'golden-retriever', label: 'Golden retriever' },
        { value: 'bulldog-frances', label: 'Bulldog francés' },
        { value: 'bulldog-ingles', label: 'Bulldog inglés' },
        { value: 'pastor-aleman', label: 'Pastor alemán' },
        { value: 'beagle', label: 'Beagle' },
        { value: 'caniche-poodle', label: 'Caniche / poodle' },
        { value: 'chihuahua', label: 'Chihuahua' },
        { value: 'rottweiler', label: 'Rottweiler' },
        { value: 'yorkshire-terrier', label: 'Yorkshire terrier' },
        { value: 'boxer', label: 'Bóxer' },
        { value: 'dachshund-salchicha', label: 'Dachshund / salchicha' },
        { value: 'husky-siberiano', label: 'Husky siberiano' },
        { value: 'shih-tzu', label: 'Shih tzu' },
        { value: 'pitbull', label: 'Pitbull' },
      ],
      help: 'Define el rango típico de cachorros. Es una referencia de raza: la ecografía y sobre todo la radiografía del último tercio dan el número real.',
    },
    {
      id: 'primeraCamada',
      label: '¿Es su primera camada?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, ya tuvo cachorros' },
        { value: 'si', label: 'Sí, es la primera' },
      ],
      help: 'La primera camada suele ser entre un 20 y un 30% más chica que las siguientes.',
    },
    {
      id: 'edadPerra',
      label: 'Edad de la madre',
      type: 'select',
      value: 'joven',
      options: [
        { value: 'joven', label: 'Joven o adulta en plenitud' },
        { value: 'mayor', label: 'Mayor (últimos años reproductivos)' },
      ],
      help: 'En las perras mayores las camadas achican y el riesgo obstétrico sube: eso lo evalúa el veterinario, no una calculadora.',
    },
    {
      id: 'ciclo',
      label: 'Cada cuántos meses le viene el celo',
      type: 'select',
      value: '6',
      options: [
        { value: '4', label: 'Cada 4 meses (razas chicas)' },
        { value: '6', label: 'Cada 6 meses (lo más común)' },
        { value: '8', label: 'Cada 8 meses' },
        { value: '12', label: 'Cada 12 meses (razas gigantes y algunas primitivas)' },
      ],
      help: 'Se cuenta desde el celo en el que ocurrió la monta. El rango real es de más o menos 15 días.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Ante sangrado, secreción con olor, vómitos, decaimiento o trabajo de parto que se estira, llamá al veterinario en el momento.',

  chart: {
    type: 'timeline',
    title: 'Las nueve semanas, con el día de hoy marcado',
    caption:
      'La barra recorre la gestación entera dividida en sus cuatro etapas. El marcador muestra en qué día está tu perra hoy: mientras esté sobre el verde falta bastante, cuando entra en el naranja es la recta final y hay que tener preparado el nido y el teléfono del veterinario.',
    bands: [
      { label: 'Implantación', from: 0, to: 21, tone: 'good' },
      { label: 'Embrionaria', from: 21, to: 35, tone: 'good' },
      { label: 'Fetal', from: 35, to: 47, tone: 'neutral' },
      { label: 'Recta final', from: 47, to: 63, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Los números de la preñez',
  breakdownIntro:
    'Cada fila trae su unidad: unas van en días, otras en semanas, cachorros o meses. Las barras comparan cada cifra con la mayor.',

  answer: {
    title: 'Sesenta y tres días desde la monta, con margen de cinco para cada lado',
    copy:
      'La gestación canina es de las más parejas del reino animal: 63 días desde la monta, y el rango normal va de 58 a 68. Ese margen no es imprecisión de la cuenta sino biología: el espermatozoide del perro sobrevive hasta una semana en el aparato reproductor de la hembra, así que entre la monta que vos anotaste y la fecundación real pueden pasar varios días. Si querés precisión de horas, la referencia que usa el veterinario no es la monta sino el pico de hormona luteinizante: desde ahí son 65 días con muy poca variación.',
    yes: [
      'Perra: 63 días desde la monta, con rango normal de 58 a 68',
      'Gata: 65 días. Coneja: 31 días. Hámster: 16 días',
      'La cuenta arranca en la monta; si hubo varias, se toma la primera',
      'Semanas 1 a 3: no se nota nada por fuera y el peso no cambia',
      'Semana 4: es el momento de la ecografía, que confirma la preñez y mira la viabilidad',
      'Semanas 5 a 6: el abdomen empieza a crecer y la comida sube gradualmente',
      'Semanas 7 a 9: la radiografía cuenta los cachorros porque ya se ven los esqueletos, y ahí es donde se decide si hace falta cesárea',
      'La caída de temperatura rectal por debajo de 37 °C suele anunciar el parto dentro de las 24 horas',
    ],
    warn: [
      'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
      'Pasados los 68 días desde la monta sin parto, es consulta veterinaria urgente: la gestación prolongada pone en riesgo a la madre y a los cachorros',
      'Más de dos horas de contracciones fuertes sin que salga un cachorro, o más de cuatro horas entre cachorro y cachorro, es una urgencia',
      'Cualquier secreción vaginal verdosa, oscura o con olor antes de que nazca el primer cachorro es motivo de consulta inmediata',
      'Las razas braquicéfalas —bulldog francés, bulldog inglés, boxer— tienen tasas altísimas de cesárea programada: eso se conversa con el veterinario antes, no el día del parto',
      'No desparasites ni vacunes por tu cuenta durante la preñez: varios productos no son seguros en esta etapa',
      'El aumento de comida no va desde el día uno: se sube recién en el último tercio, y de golpe engorda a la madre y complica el parto',
    ],
    plazo:
      'la ecografía se hace alrededor del día 28 y la radiografía para contar cachorros después del día 45; pasados los 68 días sin parto, consulta urgente.',
  },

  faq: [
    {
      q: '¿Cuánto dura la gestación de una perra?',
      a: 'Unos 63 días desde la monta, con un rango normal de 58 a 68 días. Es una de las gestaciones más constantes que hay: el margen de diez días no viene de la variabilidad de la preñez en sí sino de que la monta y la fecundación no ocurren el mismo día. El espermatozoide canino sobrevive hasta una semana dentro de la hembra, así que si anotaste la primera de varias montas, la fecha real puede correrse.',
    },
    {
      q: '¿Por qué el veterinario me dice 65 días y esta cuenta dice 63?',
      a: 'Porque miden desde puntos distintos. Contado desde la monta son 63 días con rango de 58 a 68. Contado desde el pico de hormona luteinizante —que es lo que se mide en la consulta con análisis seriados— son 65 días con una variación de apenas uno o dos. El pico de LH cae uno o dos días antes de la ovulación, y la monta puede ocurrir varios días antes o después. Si necesitás precisión, por ejemplo para programar una cesárea, la referencia buena es la LH, no la monta.',
    },
    {
      q: '¿En qué semana de gestación está mi perra?',
      a: 'Dividí los días transcurridos desde la monta por siete. Las nueve semanas se agrupan en cuatro etapas: implantación hasta el día 21, desarrollo embrionario hasta el 35, crecimiento fetal hasta el 47 y recta final del 47 al parto. En las primeras tres semanas no vas a notar prácticamente nada, y ahí es donde más gente cree que la monta no funcionó.',
    },
    {
      q: '¿Cuándo se le nota que está preñada?',
      a: 'Por fuera, recién alrededor de la quinta semana empieza a verse el abdomen y a notarse el desarrollo de las mamas. Antes de eso el diagnóstico es de consulta: la ecografía detecta la preñez desde los días 25 a 30 y además dice si los fetos están vivos, y el análisis de relaxina en sangre da positivo desde el día 25 aproximadamente. La palpación abdominal es poco confiable y no conviene hacerla en casa.',
    },
    {
      q: '¿Cuántos cachorros va a tener?',
      a: 'Depende sobre todo del tamaño de la raza: un chihuahua o un yorkshire promedian entre 2 y 4, un beagle o un caniche entre 3 y 7, un labrador o un pastor alemán entre 6 y 9, y un rottweiler puede llegar a 12. Dos factores achican la camada: si es la primera, suele ser entre un 20 y un 30% más chica, y en las perras mayores también baja. El único número confiable sale de la radiografía después del día 45, cuando ya se ven los esqueletos.',
    },
    {
      q: '¿Cuándo le vuelve el celo después de la camada?',
      a: 'El ciclo estral de la perra es de entre 4 y 12 meses según el tamaño y la raza, con 6 meses como valor más frecuente. Las razas chicas suelen ciclar cada 4 a 6 meses y las gigantes, o algunas primitivas como el basenji, una sola vez al año. La lactancia puede correr un poco el próximo celo, pero no lo suspende. El rango práctico es de más o menos 15 días alrededor de la fecha estimada.',
    },
    {
      q: '¿Cuántos días dura el celo y cuáles son los días fértiles?',
      a: 'El celo completo dura entre 2 y 4 semanas. La ventana fértil cae alrededor de los días 9 a 14 desde que empieza el sangrado, que es cuando la hembra acepta la monta. Es una referencia poblacional y falla bastante en perras con ciclos irregulares: si estás planificando una monta o, al revés, queriendo evitarla, la citología vaginal y la progesterona seriada son lo que de verdad marca el día.',
    },
    {
      q: '¿Cuánto dura la gestación de una gata?',
      a: 'Unos 65 días desde la monta, apenas más que la perra, con un rango normal de 63 a 67. La gata tiene una particularidad: ovula por estímulo de la monta, así que la fecha es un poco más previsible que en la perra. Las camadas van típicamente de 3 a 5 gatitos y la primera suele ser más chica.',
    },
    {
      q: '¿Cómo sé que el parto es inminente?',
      a: 'La señal más confiable es la temperatura: la rectal cae por debajo de 37 °C entre 12 y 24 horas antes del parto. A eso se suman la pérdida de apetito, la inquietud, el jadeo y el comportamiento de anidar, o sea buscar un lugar cerrado y armarlo. Preparale el nido con una semana de anticipación, en un lugar tranquilo, tibio y donde ella pueda entrar y salir sin que la molesten.',
    },
    {
      q: '¿Cuándo tengo que llamar al veterinario durante el parto?',
      a: 'Hay tres alarmas claras: más de dos horas de contracciones fuertes sin que salga ningún cachorro, más de cuatro horas entre un cachorro y el siguiente, o cualquier secreción verdosa u oscura antes de que nazca el primero. También si la perra está temblando, muy decaída o desorientada. Ante cualquiera de estas, es consulta en el momento, no de mañana. Y si pasaron 68 días desde la monta y no arrancó el trabajo de parto, también.',
    },
    {
      q: '¿Hay que darle más comida durante la preñez?',
      a: 'Sí, pero no desde el principio. Durante las primeras cinco semanas la necesidad casi no cambia; el aumento se hace en el último tercio y de forma gradual, hasta llegar a bastante más de lo habitual en las últimas semanas y durante la lactancia. Subirle la ración desde el día uno engorda a la madre sin beneficio para los cachorros y complica el parto. El plan concreto —cuánto, con qué alimento y con qué suplementos, si es que hacen falta— lo define el veterinario.',
    },
    {
      q: '¿Cuánto dura la gestación de una coneja o de un hámster?',
      a: 'La coneja tiene una gestación de unos 31 días y el hámster de apenas 16, que está entre las más cortas de los mamíferos. Las dos son especies que pueden volver a quedar preñadas casi inmediatamente después de parir, así que si no querés camadas encadenadas hay que separar al macho antes del parto, no después.',
    },
  ],

  sources: [
    {
      name: 'Breeding and Reproduction of Dogs — gestación, diagnóstico y parto',
      url: 'https://www.merckvetmanual.com/dog-owners/reproductive-disorders-of-dogs/breeding-and-reproduction-of-dogs',
      publisher: 'MSD / Merck Veterinary Manual',
    },
    {
      name: 'Breeding and Reproduction of Cats',
      url: 'https://www.merckvetmanual.com/cat-owners/reproductive-diseases-of-cats/breeding-and-reproduction-of-cats',
      publisher: 'MSD / Merck Veterinary Manual',
    },
    {
      name: 'Pregnancy and Parturition in Dogs — cronología de la gestación canina',
      url: 'https://vcahospitals.com/know-your-pet/breeding-for-pet-owners-pregnancy-in-dogs',
      publisher: 'VCA Animal Hospitals',
    },
    {
      name: 'Estrous Cycles in Dogs — duración del ciclo y ventana fértil',
      url: 'https://vcahospitals.com/know-your-pet/estrus-cycles-in-dogs',
      publisher: 'VCA Animal Hospitals',
    },
  ],

  replaces: [
    '/calculadora-gestacion-perro-gato-duracion-parto',
    '/calculadora-gestacion-perra',
    '/calculadora-fecha-celo-perra',
    '/calculadora-cachorros-camada-raza',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Duración de la gestación por especie. Calcado de gestacion-animal.ts
 * (perro 63, gato 65, conejo 31, hámster 16). El rango 58-68 de la perra viene
 * de gestacion-perra.ts, que es la única de las dos que lo declaraba.
 */
export const ESPECIES: Record<string, { dias: number; nombre: string; hembra: string; cria: string; margen: number }> = {
  perro: { dias: 63, nombre: 'Perro', hembra: 'perra', cria: 'cachorros', margen: 5 },
  gato: { dias: 65, nombre: 'Gato', hembra: 'gata', cria: 'gatitos', margen: 2 },
  conejo: { dias: 31, nombre: 'Conejo', hembra: 'coneja', cria: 'gazapos', margen: 2 },
  hamster: { dias: 16, nombre: 'Hámster', hembra: 'hámster', cria: 'crías', margen: 1 },
};

/** Rango típico de cachorros por raza. Espejo de cachorros-camada-raza.ts. */
export const RAZAS: Record<string, { min: number; max: number; nombre: string }> = {
  'labrador-retriever': { min: 6, max: 8, nombre: 'labrador retriever' },
  'golden-retriever': { min: 6, max: 10, nombre: 'golden retriever' },
  'bulldog-frances': { min: 3, max: 5, nombre: 'bulldog francés' },
  'bulldog-ingles': { min: 4, max: 5, nombre: 'bulldog inglés' },
  'pastor-aleman': { min: 6, max: 9, nombre: 'pastor alemán' },
  beagle: { min: 4, max: 7, nombre: 'beagle' },
  'caniche-poodle': { min: 3, max: 6, nombre: 'caniche' },
  chihuahua: { min: 2, max: 4, nombre: 'chihuahua' },
  rottweiler: { min: 8, max: 12, nombre: 'rottweiler' },
  'yorkshire-terrier': { min: 2, max: 4, nombre: 'yorkshire terrier' },
  boxer: { min: 5, max: 8, nombre: 'bóxer' },
  'dachshund-salchicha': { min: 3, max: 6, nombre: 'dachshund' },
  'husky-siberiano': { min: 4, max: 8, nombre: 'husky siberiano' },
  'shih-tzu': { min: 3, max: 5, nombre: 'shih tzu' },
  pitbull: { min: 5, max: 10, nombre: 'pitbull' },
};

/** Razas con tasa alta de cesárea: el copy las señala para mandar al veterinario antes del parto. */
export const BRAQUICEFALAS = ['bulldog-frances', 'bulldog-ingles', 'boxer'];

/**
 * Etapas de la gestación canina en días. Vienen de gestacion-perra.ts
 * (21 / 35 / 47 / 63), que corta por hitos reales y no por porcentajes.
 * Para las otras especies se escalan proporcionalmente.
 */
export const ETAPAS = [
  { nombre: 'Implantación', hasta: 21, tone: 'good' },
  { nombre: 'Embrionaria', hasta: 35, tone: 'exit' },
  { nombre: 'Fetal', hasta: 47, tone: 'main' },
  { nombre: 'Recta final', hasta: 63, tone: 'warn' },
];
