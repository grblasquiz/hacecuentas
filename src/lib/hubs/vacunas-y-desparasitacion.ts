import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué vacuna le toca a mi perro o a mi gato y cuándo?"
 *
 * Arquetipo RAMIFICADO por especie: el calendario canino y el felino son
 * distintos y el felino además depende de si el gato sale a la calle. Absorbe
 * 7 URLs (ver hub.replaces): los tres calendarios de vacunas, la castración y
 * los dos calculadores de talle de antiparasitario / antipulgas por peso.
 *
 * `/calculadora-dosis-medicamento-mascota-por-peso` se absorbe SÓLO POR URL:
 * era una regla de tres genérica (mg/kg × peso ÷ concentración) para cualquier
 * medicamento, sin producto ni indicación, y meterla acá sería empujar a
 * automedicar a un animal. El 301 cae en este hub, que es lo más cercano en
 * intención, pero la calculadora no se reconstruye.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format:'unit'` (meses) y cada fila
 *    declara el suyo. Una fila sin `format` cae a "$" y la página miente.
 *  - `chart.type: 'timeline'`: las etapas del calendario viajan con `from`/`to`
 *    en meses de vida y la edad del animal en `position` + `positionLabel`.
 *  - Salud animal: el copy no da indicación clínica y todo lo que sea dosis,
 *    reacción o esquema atrasado va al veterinario.
 */
export const hub: HubData = {
  slug: 'mascotas/vacunas-y-desparasitacion',
  title: '¿Qué vacuna le toca a mi perro o gato? Calendario, desparasitación y castración',
  description:
    'Poné la edad y mirá qué vacuna le corresponde a tu cachorro o gatito, cuándo va cada refuerzo, qué talle de pipeta antiparasitaria le toca por peso y cuál es la ventana ideal de castración según especie, sexo y tamaño.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Qué vacuna le toca a mi perro o a mi gato?',
  lede:
    'El esquema sanitario del primer año es el que más dudas genera y el que menos margen de error tiene: hasta que el cachorro no completa las tres dosis no está protegido, por más que ya tenga dos. Poné la edad y el peso y vas a ver qué le toca ahora, cuánto falta para la siguiente, qué talle de pipeta le corresponde y en qué ventana entra la castración.',
  stamps: ['Actualizado 27-07-2026', 'WSAVA Vaccination Guidelines + antirrábica obligatoria en Argentina', '7 calculadoras adentro'],

  resultLabel: 'Lo que le toca ahora',

  cases: {
    title: 'Perro',
    intro: 'Elegí la especie: el calendario canino y el felino se parecen en la lógica pero no en las vacunas.',
    items: [
      {
        id: 'perro',
        label: 'Perro',
        hint: 'Esquema cachorro de tres dosis más antirrábica, después refuerzo anual.',
        yes: [
          'Séxtuple o quíntuple: primera a las 6 a 9 semanas, segunda a las 11 o 12 y tercera a las 15 o 16',
          'Antirrábica: junto a la tercera dosis, a las 15 o 16 semanas. Es obligatoria por ley en Argentina',
          'Refuerzo anual de por vida, que conviene combinar con la desparasitación',
          'Talle de pipeta antiparasitaria según el peso, de XS a XXL',
          'Ventana de castración según sexo y tamaño de la raza',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Hasta completar las tres dosis del esquema cachorro no lo saques a la calle ni lo pongas en contacto con perros desconocidos: el parvovirus sobrevive meses en el suelo',
          'No dividas pipetas ni combines talles a ojo: si queda entre dos rangos, va el superior y lo confirma el veterinario',
          'Un adulto sin vacunas no se pone al día con una sola dosis: necesita reiniciar el esquema',
        ],
        plazo: 'la tercera dosis y la antirrábica van entre las semanas 15 y 16; el refuerzo, todos los años en la misma fecha.',
        answer: 'Un cachorro recibe la séxtuple a las 6-9, 11-12 y 15-16 semanas, con la antirrábica en la última, y después un refuerzo anual de por vida.',
      },
      {
        id: 'gato',
        label: 'Gato',
        hint: 'Triple felina más antirrábica, y leucemia felina sólo si sale a la calle.',
        yes: [
          'Triple felina (FVRCP): primera a las 8 o 9 semanas, segunda a las 12 y tercera a las 16',
          'Antirrábica junto a la tercera dosis, a las 16 semanas',
          'Leucemia felina (FeLV): dos dosis, pero sólo si el gato sale o convive con gatos de la calle, y siempre con test FeLV/FIV previo',
          'Refuerzo anual de antirrábica y triple cada 1 a 3 años según protocolo',
          'Talle de pipeta felina por peso y ventana de castración',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Nunca uses un antiparasitario de perro en un gato: la permetrina que llevan muchos es tóxica y puede matarlo',
          'La FeLV se vacuna después del test: vacunar a un gato ya positivo no sirve y tapa el diagnóstico',
          'Un gatito de menos de 8 semanas todavía no tiene edad de vacuna: hasta entonces, adentro y sin contacto con gatos desconocidos',
        ],
        plazo: 'la tercera triple y la antirrábica van a las 16 semanas; el refuerzo antirrábico es anual.',
        answer: 'Un gatito recibe la triple felina a las 8-9, 12 y 16 semanas, con la antirrábica en la última, y la FeLV sólo si sale a la calle.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu animal',
  inputsIntro:
    'La edad define la vacuna; el peso, el talle de pipeta; el sexo y el tamaño, la ventana de castración.',
  fields: [
    {
      id: 'edadMeses',
      label: 'Edad',
      type: 'number',
      suffix: 'meses',
      min: 0.5,
      max: 240,
      step: 0.5,
      value: 3,
      help: 'Si lo tenés en semanas, dividí por 4,3: ocho semanas son 1,8 meses.',
    },
    {
      id: 'peso',
      label: 'Peso actual',
      type: 'number',
      suffix: 'kg',
      min: 0.3,
      max: 80,
      step: 0.1,
      value: 12,
      help: 'Es el dato que define el talle de la pipeta o el comprimido. Si está justo en el límite, va el talle superior.',
    },
    {
      id: 'vacunado',
      label: '¿Ya empezó el esquema de vacunas?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, viene con dosis aplicadas' },
        { value: 'no', label: 'No, nunca se vacunó' },
      ],
      help: 'Si nunca se vacunó y ya pasó el año, no alcanza con una dosis: hay que reiniciar el esquema.',
    },
    {
      id: 'sale',
      label: '¿Sale a la calle o convive con animales de afuera?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, vive puertas adentro' },
        { value: 'si', label: 'Sí, sale o tiene contacto con otros' },
      ],
      help: 'En gatos es el dato que decide si corresponde la vacuna contra la leucemia felina.',
    },
    {
      id: 'sexo',
      label: 'Sexo',
      type: 'select',
      value: 'macho',
      options: [
        { value: 'macho', label: 'Macho' },
        { value: 'hembra', label: 'Hembra' },
      ],
      help: 'Cambia la ventana de castración y el costo de la cirugía.',
    },
    {
      id: 'tamano',
      label: 'Tamaño de la raza (sólo perros)',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'mini', label: 'Toy o mini — hasta 5 kg de adulto' },
        { value: 'chico', label: 'Chica — 5 a 10 kg' },
        { value: 'mediano', label: 'Mediana — 10 a 25 kg' },
        { value: 'grande', label: 'Grande — 25 a 45 kg' },
        { value: 'gigante', label: 'Gigante — más de 45 kg' },
      ],
      help: 'En razas grandes y gigantes conviene esperar el cierre de las placas de crecimiento antes de castrar.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. El calendario que ves es el esquema estándar; el protocolo concreto lo define el veterinario según la zona, la situación epidemiológica y el estado del animal. Ante una reacción adversa, un esquema atrasado o cualquier duda sobre una dosis, la consulta es obligatoria.',

  chart: {
    type: 'timeline',
    title: 'Dónde está tu animal en el calendario',
    caption:
      'La barra recorre el primer año y medio de vida dividido en las etapas del esquema sanitario: sin cobertura, esquema cachorro en curso, cobertura completa y calendario adulto de refuerzos. El marcador muestra en qué punto está tu animal hoy.',
    bands: [
      { label: 'Sin cobertura', from: 0, to: 1.5, tone: 'bad' },
      { label: 'Esquema en curso', from: 1.5, to: 4, tone: 'warn' },
      { label: 'Cobertura completa', from: 4, to: 12, tone: 'good' },
      { label: 'Refuerzo anual', from: 12, to: 18, tone: 'neutral' },
    ],
  },
  breakdownTitle: 'Las fechas y los talles',
  breakdownIntro:
    'Todo en meses, semanas o kilos: acá no hay dinero salvo la referencia de la castración, que va marcada como tal. Las barras comparan cada valor contra el mayor.',

  faq: [
    {
      q: '¿Qué vacunas necesita un cachorro y a qué edad?',
      a: 'El esquema estándar en Argentina son tres dosis de séxtuple o quíntuple —parvovirus, moquillo, hepatitis, parainfluenza y leptospirosis— a las 6 a 9 semanas, a las 11 o 12 y a las 15 o 16 semanas, con la antirrábica aplicada junto a la última. Después va un refuerzo al año y de ahí en más un refuerzo anual de por vida. Algunos veterinarios agregan una dosis "puppy" temprana a las 6 semanas cuando el riesgo de parvovirus en la zona es alto.',
    },
    {
      q: '¿Cuándo puedo sacar a mi cachorro a la calle?',
      a: 'Recién cuando completó las tres dosis del esquema y pasó una a dos semanas de la última, o sea cerca de los cuatro meses y medio. Antes de eso la protección es parcial: el parvovirus sobrevive meses en la tierra y en el asfalto y es la principal causa de muerte en cachorros. Eso no significa aislarlo: la socialización se puede hacer en casa, en brazos y con perros adultos vacunados y conocidos.',
    },
    {
      q: '¿Qué vacunas necesita un gatito?',
      a: 'Tres dosis de triple felina (FVRCP: panleucopenia, calicivirus y herpesvirus) a las 8 o 9 semanas, a las 12 y a las 16, con la antirrábica junto a la última. Si el gato sale a la calle o convive con gatos de afuera, se agrega la vacuna contra la leucemia felina, que son dos dosis con refuerzo anual y siempre después de un test FeLV/FIV. Un gato estrictamente indoor no necesita FeLV.',
    },
    {
      q: '¿La antirrábica es obligatoria?',
      a: 'Sí, en Argentina la vacunación antirrábica de perros y gatos es obligatoria por ley y muchos municipios la exigen para la libreta sanitaria, para viajar y para ingresar a guarderías o pensionados. Se aplica por primera vez cerca de los cuatro meses y se refuerza todos los años. También suele haber campañas gratuitas de vacunación antirrábica en centros de zoonosis municipales.',
    },
    {
      q: '¿Y si mi perro adulto nunca se vacunó?',
      a: 'No se pone al día con una sola dosis. El esquema se reinicia: una primera aplicación y un refuerzo a las tres o cuatro semanas, más la antirrábica, y a partir de ahí el calendario anual normal. Lo mismo vale para un gato adulto sin vacunas, con la diferencia de que si sale a la calle conviene hacer test de FeLV y FIV antes de decidir qué se aplica.',
    },
    {
      q: '¿Cada cuánto se desparasita?',
      a: 'Contra parásitos externos —pulgas y garrapatas—, las pipetas y la mayoría de los comprimidos son mensuales, con excepciones como el Bravecto, que dura 90 días, y los collares tipo Seresto, de 6 a 8 meses. Contra parásitos internos, en cachorros se desparasita cada 15 días hasta los tres meses y después mensualmente hasta los seis; en adultos, cada tres o cuatro meses, y más seguido si sale mucho o convive con chicos.',
    },
    {
      q: '¿Qué talle de pipeta le corresponde a mi perro?',
      a: 'Los talles estándar son XS de 2 a 4,5 kg, S de 4,5 a 10, M de 10 a 20, L de 20 a 40 y XL de 40 a 60; por encima de 60 kg puede requerir combinación y lo define el veterinario. Si tu perro está justo en el límite entre dos talles, va el superior. Lo que nunca hay que hacer es dividir una pipeta grande para un perro chico: la concentración del principio activo no es lineal.',
    },
    {
      q: '¿Puedo usar el antipulgas del perro en mi gato?',
      a: 'No, nunca. Muchos antiparasitarios caninos llevan permetrina, que en gatos es tóxica y puede provocar temblores, convulsiones y la muerte. Los gatos tienen su propia línea de productos, con talles distintos —menos de 4 kg y de 4 a 8 kg en pipeta—. Si aplicaste un producto de perro a un gato por error, es una urgencia veterinaria inmediata, no algo para esperar a ver qué pasa.',
    },
    {
      q: '¿A qué edad conviene castrar?',
      a: 'En gatos, machos y hembras, entre los 4 y los 6 meses, antes del primer celo y antes de que el macho empiece a marcar. En perros depende del tamaño: en razas mini, chicas y medianas, machos entre los 6 y los 9 meses y hembras entre los 5 y los 6 o después del primer celo; en razas grandes conviene esperar a los 12 a 18 meses en machos y a los 10 a 14 en hembras, y en gigantes hasta los 18 a 24, para que cierren las placas de crecimiento.',
    },
    {
      q: '¿Qué pasa si me atraso con un refuerzo?',
      a: 'Un atraso corto, de semanas, se resuelve aplicando la dosis y siguiendo el calendario. Un atraso largo, de más de un año en un adulto, suele requerir reiniciar con dos dosis separadas por tres o cuatro semanas. En el esquema cachorro es más delicado: si se pasan muchas semanas entre dosis, la serie pierde eficacia y el veterinario puede indicar dosis adicionales.',
    },
    {
      q: '¿Se pueden dar la vacuna y la desparasitación el mismo día?',
      a: 'Sí, es la práctica habitual y de hecho conviene: aprovechar la visita anual para el refuerzo y la desparasitación reduce costos y hace que no se olvide ninguna de las dos. Lo que sí conviene es que el animal esté desparasitado antes de vacunar en el esquema del cachorro, porque una carga parasitaria alta puede reducir la respuesta inmune a la vacuna.',
    },
    {
      q: '¿Puedo calcular yo la dosis de un medicamento por el peso?',
      a: 'No, y esta herramienta a propósito no lo hace. La cuenta de miligramos por kilo es aritmética simple, pero elegir el fármaco, la concentración, la vía y la duración no lo es, y muchos medicamentos humanos comunes —ibuprofeno, paracetamol, aspirina— son tóxicos para perros y directamente letales para gatos. La dosis la indica el veterinario que examinó al animal.',
    },
  ],

  sources: [
    {
      name: 'WSAVA Vaccination Guidelines for Dogs and Cats',
      url: 'https://wsava.org/global-guidelines/vaccination-guidelines/',
      publisher: 'World Small Animal Veterinary Association',
    },
    {
      name: 'AAHA Canine Vaccination Guidelines',
      url: 'https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/',
      publisher: 'American Animal Hospital Association',
      date: '2022',
    },
    {
      name: 'AAFP Feline Vaccination Guidelines',
      url: 'https://catvets.com/guidelines/practice-guidelines/feline-vaccination-guidelines/',
      publisher: 'American Association of Feline Practitioners',
    },
    {
      name: 'SENASA — Programa Nacional de Control de la Rabia',
      url: 'https://www.argentina.gob.ar/senasa/programas-sanitarios/sanidadanimal/rabia',
      publisher: 'SENASA · Argentina',
    },
    {
      name: 'ESCCAP — Guías de control de parásitos internos y externos en perros y gatos',
      url: 'https://www.esccap.org/guidelines/',
      publisher: 'European Scientific Counsel Companion Animal Parasites',
    },
    {
      name: 'ASPCA Animal Poison Control — toxicidad de la permetrina en gatos',
      url: 'https://www.aspca.org/pet-care/animal-poison-control',
      publisher: 'ASPCA',
    },
  ],

  replaces: [
    '/calculadora-vacunas-perro-calendario',
    '/calculadora-vacunas-perro-calendario-cachorro',
    '/calculadora-vacunas-gato-calendario-gatito',
    '/calculadora-castracion-edad-ideal-perro-gato',
    '/calculadora-dosis-antiparasitario-perro-gato-peso',
    '/calculadora-dosis-antipulgas-peso-mascota',
    '/calculadora-dosis-medicamento-mascota-por-peso',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Calendario canino, calcado de `vacunas-perro-calendario.ts`. `desde` es la
 * edad en meses a partir de la cual corresponde cada hito.
 */
export const CALENDARIO_PERRO = [
  { desde: 1.4, edad: '6 semanas (1,4 meses)', vacuna: 'Puppy / séxtuple cachorro', detalle: 'Parvovirus y moquillo, para cubrir la caída de anticuerpos maternos.' },
  { desde: 1.9, edad: '8 a 9 semanas (2 meses)', vacuna: '1ª séxtuple o quíntuple', detalle: 'Parvovirus, moquillo, hepatitis, parainfluenza y leptospirosis.' },
  { desde: 2.6, edad: '11 a 12 semanas (3 meses)', vacuna: '2ª séxtuple', detalle: 'Refuerzo con la misma vacuna. Es la dosis que arma la inmunidad.' },
  { desde: 3.5, edad: '15 a 16 semanas (4 meses)', vacuna: '3ª séxtuple + antirrábica', detalle: 'Última del esquema cachorro y primera antirrábica, obligatoria por ley.' },
  { desde: 6, edad: '6 meses', vacuna: 'Refuerzo antirrábico opcional', detalle: 'Según protocolo del veterinario y situación de la zona.' },
  { desde: 12, edad: '1 año', vacuna: 'Refuerzo anual: séxtuple + antirrábica', detalle: 'Arranca el calendario adulto.' },
  { desde: 24, edad: 'Anual de por vida', vacuna: 'Séxtuple + antirrábica', detalle: 'Todos los años, combinado con la desparasitación.' },
];

/** Calendario felino, calcado de `vacunas-gato-calendario-gatito.ts`. */
export const CALENDARIO_GATO = [
  { desde: 1.9, edad: '8 a 9 semanas (2 meses)', vacuna: '1ª triple felina (FVRCP)', detalle: 'Panleucopenia, calicivirus y herpesvirus.' },
  { desde: 2.8, edad: '12 semanas (3 meses)', vacuna: '2ª triple felina', detalle: 'Refuerzo. Si sale a la calle, primera dosis de leucemia felina tras el test.' },
  { desde: 3.7, edad: '16 semanas (4 meses)', vacuna: '3ª triple + antirrábica', detalle: 'Última del esquema gatito y antirrábica obligatoria. Segunda FeLV si sale.' },
  { desde: 12, edad: '1 año', vacuna: 'Refuerzo triple + antirrábica', detalle: 'Primer refuerzo adulto. FeLV anual si sale a la calle.' },
  { desde: 24, edad: 'Anual de por vida', vacuna: 'Antirrábica anual + triple cada 1 a 3 años', detalle: 'Según protocolo veterinario.' },
];

/** Talles de pipeta / comprimido por peso, calcados de `dosis-antiparasitario.ts`. */
export const TALLES_PERRO = [
  { hasta: 2, label: 'Miniatura (menos de 2 kg) — lo define el veterinario' },
  { hasta: 4.5, label: 'XS (2 a 4,5 kg)' },
  { hasta: 10, label: 'S (4,5 a 10 kg)' },
  { hasta: 20, label: 'M (10 a 20 kg)' },
  { hasta: 40, label: 'L (20 a 40 kg)' },
  { hasta: 60, label: 'XL (40 a 60 kg)' },
  { hasta: 999, label: 'XXL (más de 60 kg) — puede requerir combinación' },
];

export const TALLES_GATO = [
  { hasta: 2.5, label: 'Gatito (0,5 a 2,5 kg)' },
  { hasta: 7.5, label: 'Gato adulto (2,5 a 7,5 kg)' },
  { hasta: 999, label: 'Gato grande (más de 7,5 kg) — consultá al veterinario' },
];

/**
 * Ventana de castración, calcada de `castracion-edad-ideal-perro-gato.ts`.
 * `costoMin` y `costoMax` son referencias en ARS para CABA.
 */
export const CASTRACION: Record<string, { ideal: string; mesesMin: number; mesesMax: number; costoMin: number; costoMax: number }> = {
  gato_macho: { ideal: '4 a 5 meses, antes de que empiece a marcar', mesesMin: 4, mesesMax: 6, costoMin: 50000, costoMax: 70000 },
  gato_hembra: { ideal: '4 a 5 meses, antes del primer celo', mesesMin: 4, mesesMax: 6, costoMin: 60000, costoMax: 90000 },
  perro_mini_macho: { ideal: '6 a 9 meses', mesesMin: 6, mesesMax: 9, costoMin: 60000, costoMax: 80000 },
  perro_mini_hembra: { ideal: '5 a 6 meses, antes del primer celo', mesesMin: 5, mesesMax: 6, costoMin: 80000, costoMax: 110000 },
  perro_chico_macho: { ideal: '6 a 9 meses', mesesMin: 6, mesesMax: 9, costoMin: 60000, costoMax: 80000 },
  perro_chico_hembra: { ideal: '5 a 6 meses, antes del primer celo', mesesMin: 5, mesesMax: 6, costoMin: 80000, costoMax: 110000 },
  perro_mediano_macho: { ideal: '6 a 9 meses', mesesMin: 6, mesesMax: 9, costoMin: 60000, costoMax: 90000 },
  perro_mediano_hembra: { ideal: '5 a 6 meses, o 8 a 12 después del primer celo', mesesMin: 5, mesesMax: 12, costoMin: 80000, costoMax: 120000 },
  perro_grande_macho: { ideal: '12 a 18 meses, esperando el desarrollo óseo', mesesMin: 12, mesesMax: 18, costoMin: 80000, costoMax: 120000 },
  perro_grande_hembra: { ideal: '10 a 14 meses, después del primer celo', mesesMin: 10, mesesMax: 14, costoMin: 100000, costoMax: 150000 },
  perro_gigante_macho: { ideal: '18 a 24 meses, con las placas óseas ya cerradas', mesesMin: 18, mesesMax: 24, costoMin: 100000, costoMax: 150000 },
  perro_gigante_hembra: { ideal: '12 a 18 meses, después del primer celo', mesesMin: 12, mesesMax: 18, costoMin: 120000, costoMax: 180000 },
};
