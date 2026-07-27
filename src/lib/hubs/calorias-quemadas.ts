import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas calorías quemé entrenando?"
 * Absorbe 19 URLs de calculadora suelta (ver hub.replaces).
 *
 * EL HALLAZGO: las 19 calculadoras absorbidas son LA MISMA FÓRMULA.
 * Todas hacen kcal = MET × peso × horas y sólo cambian el MET. Lo único
 * genuinamente distinto es el ciclismo por potenciómetro (trabajo en kJ
 * dividido por la eficiencia mecánica humana, sin MET). Por eso el hub tiene
 * un solo motor y un catálogo de actividades, y una rama aparte para watts.
 *
 * DIFERENCIA con los otros hubs de /salud y con /nutricion — no se pisan:
 *   · /nutricion/calorias-diarias → cuánta energía NECESITÁS (TDEE, entra)
 *   · /salud/proteina             → de esa comida, cuánta proteína
 *   · /salud/peso-ideal-imc       → cuánto deberías pesar
 *   · /salud/grasa-corporal       → de ese peso, cuánto es grasa
 *   · /salud/habitos              → alcohol, sol, pantallas, pasos
 *   Este responde la otra mitad del balance: cuánta energía SALE al moverte.
 *   Ninguno de los otros calcula gasto por actividad.
 *
 * YMYL SALUD: el aviso del dominio `health` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: TODA fila lleva `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'scale'`: ubica el MET de tu actividad sobre el eje de
 *    intensidad del Compendium (ligera / moderada / vigorosa / muy vigorosa).
 *    compute() devuelve `position` y `positionLabel`.
 */
export const hub: HubData = {
  slug: 'salud/calorias-quemadas',
  title: '¿Cuántas calorías quemé entrenando? Calculadora por actividad, peso y tiempo',
  description:
    'Calculá las calorías que quemaste en cualquier actividad: caminar, correr, bici, natación, fútbol, pádel, pesas, yoga, escaleras o tareas de casa. Con los MET del Compendium of Physical Activities, el gasto neto sobre tu metabolismo basal y el equivalente en pasos y en comida.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de gasto energético',
  h1: '¿Cuántas calorías quemé entrenando?',
  lede:
    'Hay una sola cuenta detrás de todas las actividades: los MET que exige el esfuerzo, por tu peso, por el tiempo. Partimos del caso más común —elegís la actividad y los minutos— y ya tenés el número. Si medís con distancia, pisos o potenciómetro, lo cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'MET del Compendium of Physical Activities (Ainsworth 2011)',
    '19 calculadoras adentro',
  ],

  resultLabel: 'Calorías quemadas',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Todas las ramas usan tu peso y el catálogo de actividades de arriba. Lo que cambia es de dónde sale el esfuerzo: del MET de tabla, de la velocidad que sostuviste, de los pisos que subiste o de los watts que marcó el potenciómetro.',
    items: [
      {
        id: 'catalogo',
        label: 'Elijo la actividad y los minutos',
        hint: 'El caso más común: MET de tabla × peso × horas.',
        answer:
          'Las calorías salen de multiplicar el MET de la actividad por tu peso en kilos y por las horas de esfuerzo.',
        yes: [
          'El MET de la actividad según el Compendium of Physical Activities',
          'Las calorías brutas y también las netas, descontando el metabolismo que ibas a gastar igual estando quieto',
          'El gasto por minuto y por hora, para comparar actividades entre sí',
          'El equivalente en minutos de caminata, en pasos y en comida',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El MET es un promedio poblacional: dos personas del mismo peso haciendo lo mismo pueden diferir 15% o más por eficiencia, entrenamiento y composición corporal',
          'Si tu reloj o tu cinta te da otro número, no está mal ninguno de los dos: usan modelos distintos. Lo que sirve es comparar siempre con el mismo método',
        ],
        plazo: 'para bajar peso lo que manda es el balance de la semana, no el de una sesión.',
      },
      {
        id: 'ritmo',
        label: 'Sé la distancia y el tiempo',
        hint: 'Caminata, running o bici: el MET sale de la velocidad.',
        answer:
          'Con distancia y tiempo la velocidad define el MET, y eso es más fiel que elegir una intensidad a ojo.',
        yes: [
          'La velocidad media que sostuviste, en km/h',
          'El MET que corresponde a esa velocidad en la escala del Compendium, según sea caminata, carrera o bici',
          'El ajuste por pendiente si subiste: cada 1% de subida suma unos 0,6 MET al caminar',
          'Las calorías por kilómetro, además del total',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La escala de velocidad vale para terreno firme y esfuerzo continuo. Si parás en semáforos o hacés intervalos, el MET medio real baja',
          'En bici el viento y el peso que cargás pesan tanto como la velocidad: si tenés potenciómetro, usá la rama de watts',
        ],
        plazo: 'elegí una actividad de caminata, carrera o bici para que la escala de velocidad se aplique.',
      },
      {
        id: 'pisos',
        label: 'Subí escaleras',
        hint: 'Pisos subidos, no minutos: el tiempo lo calculamos.',
        answer:
          'Subir escaleras a buen ritmo son 8,8 MET, uno de los gastos por minuto más altos que vas a encontrar.',
        yes: [
          'El tiempo estimado a partir de los pisos: unos 20 escalones por piso a medio segundo cada uno',
          'Los metros de altura ganados, a 3 m por piso',
          'Las calorías de la subida y cuánto rinde por minuto comparado con caminar',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El MET 8,8 corresponde a subir rápido y sin pausas. Si subís lento o parás en cada descanso, el valor real está más cerca de 4',
          'Bajar escaleras no es la mitad de subir: son unos 3 MET y castiga más las rodillas',
        ],
        plazo: 'cambiar el ascensor por la escalera es de los gestos más eficientes del día.',
      },
      {
        id: 'watts',
        label: 'Tengo el dato en watts',
        hint: 'Potenciómetro de bici o de remo: no usa MET.',
        answer:
          'Con watts se mide el trabajo real: los kilojoules que produjiste, divididos por la eficiencia mecánica del cuerpo.',
        yes: [
          'El trabajo mecánico en kilojoules: watts por segundos, dividido mil',
          'Las calorías reales, dividiendo ese trabajo por la eficiencia humana (21% a 27% según el ciclista)',
          'El detalle de por qué en ciclismo 1 kJ ≈ 1 kcal: la eficiencia del 24% casi cancela el factor de conversión',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Esta rama NO usa MET: es la única del hub que mide trabajo en vez de estimar esfuerzo, y por eso es la más precisa si tenés el dato',
          'El potenciómetro mide la potencia entregada al pedal o al manubrio, no la que gasta el resto del cuerpo: el total real es un poco mayor',
        ],
        plazo: 'la potencia media de la sesión sirve; la potencia normalizada infla el número.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'El peso y la actividad los usan todas las ramas. Distancia, pendiente, pisos y watts los usa sólo la rama que los pide.',
  fields: [
    { id: 'peso', label: 'Tu peso', type: 'number', min: 20, max: 300, step: 1, value: 75, suffix: 'kg' },
    {
      id: 'actividad',
      label: 'Actividad',
      type: 'select',
      value: 'correr-10',
      options: [
        { value: 'caminar-lento', label: 'Caminar lento — paseo (3 km/h)' },
        { value: 'caminar-normal', label: 'Caminar a paso normal (4,8 km/h)' },
        { value: 'caminar-rapido', label: 'Caminar rápido (5,6 km/h)' },
        { value: 'caminar-muy-rapido', label: 'Caminar muy rápido (6,4 km/h)' },
        { value: 'trotar', label: 'Trotar suave (8 km/h)' },
        { value: 'correr-10', label: 'Correr moderado (10 km/h)' },
        { value: 'correr-12', label: 'Correr rápido (12 km/h)' },
        { value: 'correr-14', label: 'Correr muy rápido (14 km/h)' },
        { value: 'bici-paseo', label: 'Bici de paseo (menos de 16 km/h)' },
        { value: 'bici-suave', label: 'Bici suave (16 a 19 km/h)' },
        { value: 'bici-moderada', label: 'Bici moderada (19 a 22 km/h)' },
        { value: 'bici-vigorosa', label: 'Bici vigorosa (22 a 25 km/h)' },
        { value: 'bici-carrera', label: 'Bici de carrera (25 a 30 km/h)' },
        { value: 'mtb', label: 'Mountain bike' },
        { value: 'spinning', label: 'Spinning / bici indoor' },
        { value: 'natacion-libre', label: 'Natación crol moderada' },
        { value: 'natacion-libre-fuerte', label: 'Natación crol intensa' },
        { value: 'natacion-pecho', label: 'Natación pecho' },
        { value: 'natacion-espalda', label: 'Natación espalda' },
        { value: 'natacion-mariposa', label: 'Natación mariposa' },
        { value: 'remo-suave', label: 'Remo ergómetro suave (50 W)' },
        { value: 'remo-moderado', label: 'Remo ergómetro moderado (100 W)' },
        { value: 'remo-intenso', label: 'Remo ergómetro intenso (200 W)' },
        { value: 'futbol-recreativo', label: 'Fútbol recreativo / picado' },
        { value: 'futbol-5', label: 'Fútbol 5 o 7' },
        { value: 'futbol-competitivo', label: 'Fútbol competitivo / torneo' },
        { value: 'mediocampista', label: 'Mediocampista, partido completo' },
        { value: 'padel', label: 'Pádel' },
        { value: 'tenis', label: 'Tenis' },
        { value: 'basquet', label: 'Básquet recreativo' },
        { value: 'pesas-liviano', label: 'Pesas livianas / gym con descansos' },
        { value: 'pesas-moderado', label: 'Pesas, rutina de hipertrofia' },
        { value: 'pesas-intenso', label: 'Pesas intensas / poco descanso' },
        { value: 'crossfit', label: 'CrossFit / HIIT funcional' },
        { value: 'soga', label: 'Saltar la cuerda, ritmo moderado' },
        { value: 'soga-rapida', label: 'Saltar la cuerda, rápido' },
        { value: 'eliptico', label: 'Elíptico' },
        { value: 'escaleras', label: 'Subir escaleras, ritmo vivo' },
        { value: 'yoga-hatha', label: 'Yoga hatha' },
        { value: 'yoga-power', label: 'Yoga power / vinyasa' },
        { value: 'pilates', label: 'Pilates' },
        { value: 'baile', label: 'Baile aeróbico / zumba' },
        { value: 'boxeo', label: 'Boxeo con bolsa' },
        { value: 'escalada', label: 'Escalada indoor' },
        { value: 'skate', label: 'Skate' },
        { value: 'surf', label: 'Surf' },
        { value: 'sexo', label: 'Relación sexual, esfuerzo moderado' },
        { value: 'barrer', label: 'Barrer o aspirar la casa' },
        { value: 'trapear', label: 'Trapear o baldear pisos' },
        { value: 'planchar', label: 'Planchar' },
        { value: 'cocinar', label: 'Cocinar de pie' },
        { value: 'jardineria', label: 'Jardinería general' },
        { value: 'jardineria-pala', label: 'Jardinería con pala / cavar' },
      ],
      help: 'El MET de cada actividad sale del Compendium of Physical Activities de Ainsworth. Se muestra en el desglose.',
    },
    { id: 'minutos', label: 'Minutos de actividad', type: 'number', min: 1, max: 1440, step: 1, value: 45, suffix: 'min' },
    {
      id: 'distancia',
      label: 'Distancia recorrida (sólo rama de distancia)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 8,
      suffix: 'km',
      help: 'Con la distancia y los minutos sale la velocidad, y de ahí el MET real de tu ritmo.',
    },
    {
      id: 'pendiente',
      label: 'Pendiente media (sólo rama de distancia)',
      type: 'number',
      min: -30,
      max: 30,
      step: 1,
      value: 0,
      suffix: '%',
      help: 'Al caminar, cada 1% de subida suma unos 0,6 MET. Poné 0 si fue llano.',
    },
    {
      id: 'pisos',
      label: 'Pisos subidos (sólo rama de escaleras)',
      type: 'number',
      min: 0,
      max: 500,
      step: 1,
      value: 20,
      help: 'Se toman 20 escalones y 3 m de altura por piso.',
    },
    {
      id: 'watts',
      label: 'Potencia media (sólo rama de watts)',
      type: 'number',
      min: 0,
      max: 800,
      step: 5,
      value: 180,
      suffix: 'W',
      help: 'La potencia media de la sesión que marca el potenciómetro o el ergómetro.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu esfuerzo en la escala de intensidad',
    caption:
      'El eje son los MET, la unidad con la que el Compendium mide el esfuerzo: 1 MET es estar sentado sin hacer nada. Por debajo de 3 la actividad es ligera, entre 3 y 6 moderada, entre 6 y 9 vigorosa y de 9 para arriba muy vigorosa. La marca es la actividad que elegiste.',
  },
  breakdownTitle: 'De dónde salen esas calorías',
  breakdownIntro:
    'Las barras comparan cada valor con el mayor del desglose. El gasto neto es el que suma de verdad a tu balance del día.',

  faq: [
    {
      q: '¿Cómo se calculan las calorías quemadas en un ejercicio?',
      a: 'Con una sola fórmula: calorías = MET × peso en kilos × horas de actividad. El MET es cuántas veces por encima del reposo trabaja tu cuerpo en esa actividad, y sale de una tabla científica. Caminar rápido son 4,3 MET; correr a 10 km/h, 9,8. Todo lo demás —el reloj, la cinta, la app— es una variante de esta misma cuenta.',
    },
    {
      q: '¿Qué es un MET y de dónde salen los valores?',
      a: 'MET significa equivalente metabólico: 1 MET es el gasto en reposo, aproximadamente 1 kcal por kilo de peso por hora, o 3,5 ml de oxígeno por kilo por minuto. Los valores vienen del Compendium of Physical Activities de Ainsworth y colaboradores, la tabla de referencia internacional que asigna un MET a cada una de cientos de actividades medidas en laboratorio.',
    },
    {
      q: '¿Por qué mi reloj me da un número distinto?',
      a: 'Porque no usa MET: estima con tu frecuencia cardíaca, tu edad y a veces tu VO2 máximo. Los dos métodos son aproximaciones y pueden diferir 10% a 20% en la misma sesión. Ninguno es el número exacto. Lo que sirve es elegir un método y comparar siempre contra sí mismo, en vez de mezclar fuentes.',
    },
    {
      q: '¿Qué diferencia hay entre calorías brutas y calorías netas?',
      a: 'Las brutas son todo lo que gastaste durante la actividad, incluyendo lo que ibas a gastar igual estando quieto. Las netas descuentan ese metabolismo de fondo, restando 1 MET al valor de la actividad. Para un déficit calórico las netas son las honestas: una hora de yoga a 2,5 MET suma mucho menos de lo que parece porque 1 de esos 2,5 lo gastabas igual.',
    },
    {
      q: '¿Por qué a veces la misma actividad da 5% más en otras calculadoras?',
      a: 'Porque hay dos formas de escribir la misma fórmula. La forma corta, MET × kg × horas, asume que 1 MET equivale a 1 kcal por kilo por hora. La forma del ACSM, MET × 3,5 × kg × minutos ÷ 200, parte del consumo de oxígeno y da exactamente un 5% más. Este hub usa la forma corta y te muestra la variante ACSM en el desglose para que veas el rango completo.',
    },
    {
      q: '¿Cuántas calorías se queman caminando 10.000 pasos?',
      a: 'Depende de tu peso y de tu altura, porque la altura define el largo del paso. Con una zancada de unos 0,414 veces tu altura, 10.000 pasos son cerca de 7 km, algo más de una hora a paso normal. Para 75 kg a 4,8 km/h son unas 380 kcal brutas. Elegí "caminar a paso normal" y poné los minutos para tu caso.',
    },
    {
      q: '¿Qué actividad quema más calorías por minuto?',
      a: 'A igual peso, las de MET más alto: saltar la cuerda rápido, correr por encima de 12 km/h, remo intenso en ergómetro y ciclismo de competición pasan todos los 12 MET. Subir escaleras a buen ritmo, con 8,8 MET, es la que mejor rinde por minuto entre las que podés hacer sin equipo ni salir de tu edificio.',
    },
    {
      q: '¿Cuántas calorías tengo que quemar para bajar un kilo?',
      a: 'La regla clásica dice unas 7.700 kcal de déficit por kilo de grasa, pero en la práctica el cuerpo se adapta y baja el gasto en reposo, así que el descenso real es más lento que esa cuenta. Además el ejercicio suele aumentar el apetito. Por eso lo que se recomienda es combinar la actividad con el ajuste de lo que comés, y no perseguir un número diario.',
    },
    {
      q: '¿El ciclismo por watts es más preciso que por MET?',
      a: 'Sí, bastante. El potenciómetro mide el trabajo mecánico real que hiciste, en kilojoules, en vez de estimar el esfuerzo desde una tabla. Dividiendo ese trabajo por la eficiencia mecánica humana, que va de 21% a 27%, salen las calorías. Como esa eficiencia ronda el 24%, en ciclismo se cumple la regla práctica de que 1 kJ equivale a 1 kcal.',
    },
    {
      q: '¿Las tareas de la casa cuentan como ejercicio?',
      a: 'Cuentan como actividad física, aunque no como entrenamiento. Trapear pisos son 3,5 MET y aspirar 3,3, valores de intensidad moderada, los mismos que caminar a paso normal. No reemplazan una sesión de cardio, pero sumadas a lo largo de la semana mueven el balance energético más de lo que la gente supone.',
    },
    {
      q: '¿Sirve calcular las calorías de una relación sexual?',
      a: 'Sirve para bajar el mito. El Compendium le asigna entre 1,8 y 2,8 MET, y el estudio de Frappier de 2013, que midió a parejas reales con acelerómetros, encontró unas 101 kcal en promedio en los hombres y 69 en las mujeres para encuentros de unos 25 minutos. Es actividad ligera a moderada, comparable a caminar, no a correr.',
    },
    {
      q: '¿El gasto sigue después de entrenar?',
      a: 'Un poco, sí: es el EPOC, el consumo de oxígeno elevado tras el esfuerzo. Después de trabajo de fuerza o de alta intensidad puede sumar entre 6% y 15% adicional durante horas. No está incluido en este cálculo porque el MET mide sólo el tiempo de la actividad, así que tomá el resultado como el piso y no como el techo.',
    },
  ],

  sources: [
    {
      name: '2011 Compendium of Physical Activities: a second update of codes and MET values',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21681120/',
      publisher: 'Ainsworth BE et al. — Medicine & Science in Sports & Exercise',
      date: '2011',
    },
    {
      name: 'Adult Compendium of Physical Activities — buscador oficial de códigos y valores MET',
      url: 'https://pacompendium.com/adult-compendium/',
      publisher: 'Arizona State University / Compendium of Physical Activities',
    },
    {
      name: "ACSM's Guidelines for Exercise Testing and Prescription — ecuaciones metabólicas",
      url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
      publisher: 'American College of Sports Medicine',
    },
    {
      name: 'Energy Expenditure during Sexual Activity in Young Healthy Couples',
      url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0079342',
      publisher: 'Frappier J et al. — PLOS ONE 8(10):e79342',
      date: '2013',
    },
    {
      name: 'Recomendaciones mundiales sobre actividad física para la salud',
      url: 'https://www.who.int/es/publications/i/item/9789240015128',
      publisher: 'Organización Mundial de la Salud',
    },
  ],

  replaces: [
    '/calculadora-calorias-caminando',
    '/calculadora-calorias-subir-escaleras-pisos',
    '/calculadora-calorias-quemadas-deporte',
    '/calculadora-calorias-quemadas-ejercicio',
    '/calculadora-calorias-sexo-relacion-intima-duracion',
    '/calculadora-calorias-natacion-estilos-distancia-velocidad',
    '/calculadora-calorias-padel-hora-intensidad',
    '/calculadora-cuantas-calorias-bicicleta-distancia-pendiente-perfil',
    '/calculadora-pasos-a-kilometros',
    '/calculadora-calorias-remo-indoor-ergometro',
    '/calculadora-calorias-gym-pesas-hora',
    '/calculadora-calorias-futbol-5-7-11',
    '/calculadora-calorias-quemadas-yoga-pilates',
    '/calculadora-calorias-quemadas-mediocampista-partido',
    '/calculadora-calorias-ciclismo-intensidad',
    '/calculadora-calorias-saltar-cuerda-minutos',
    '/calculadora-calorias-quemadas-running-km-peso',
    '/calculadora-calorias-ciclismo-watts',
    '/calculadora-calorias-quemadas-tareas-domesticas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Catálogo único de actividades.
 *
 * `met`   valor usado por el hub.
 * `fam`   familia con escala de velocidad propia ('caminar' | 'correr' | 'bici'),
 *         que la rama de distancia usa para derivar el MET del ritmo real.
 * `nota`  aclaración que se muestra como `ref` de la fila del MET.
 *
 * Todos los valores son del 2011 Compendium of Physical Activities salvo los
 * marcados en `nota`, donde el Compendium no tiene la actividad y se usa el
 * proxy indicado.
 */
export const ACTIVIDADES: Record<string, { met: number; label: string; fam?: string; nota: string }> = {
  'caminar-lento': { met: 2.8, label: 'caminar lento', fam: 'caminar', nota: 'Compendium 17152 — 3,2 km/h' },
  'caminar-normal': { met: 3.5, label: 'caminar a paso normal', fam: 'caminar', nota: 'Compendium 17190 — 4,8 km/h' },
  'caminar-rapido': { met: 4.3, label: 'caminar rápido', fam: 'caminar', nota: 'Compendium 17200 — 5,6 km/h' },
  'caminar-muy-rapido': { met: 5.0, label: 'caminar muy rápido', fam: 'caminar', nota: 'Compendium 17220 — 6,4 km/h' },
  trotar: { met: 8.3, label: 'trotar suave', fam: 'correr', nota: 'Compendium 12030 — 8 km/h' },
  'correr-10': { met: 9.8, label: 'correr moderado', fam: 'correr', nota: 'Compendium 12050 — 10 km/h' },
  'correr-12': { met: 11.5, label: 'correr rápido', fam: 'correr', nota: 'Compendium 12070 — 12 km/h' },
  'correr-14': { met: 12.8, label: 'correr muy rápido', fam: 'correr', nota: 'Compendium 12080 — 14 km/h' },
  'bici-paseo': { met: 4.0, label: 'bici de paseo', fam: 'bici', nota: 'Compendium 01015 — menos de 16 km/h' },
  'bici-suave': { met: 6.8, label: 'bici suave', fam: 'bici', nota: 'Compendium 01010 — 16 a 19 km/h' },
  'bici-moderada': { met: 8.0, label: 'bici moderada', fam: 'bici', nota: 'Compendium 01020 — 19 a 22 km/h' },
  'bici-vigorosa': { met: 10.0, label: 'bici vigorosa', fam: 'bici', nota: 'Compendium 01030 — 22 a 25 km/h' },
  'bici-carrera': { met: 12.0, label: 'bici de carrera', fam: 'bici', nota: 'Compendium 01040 — 25 a 30 km/h' },
  mtb: { met: 8.5, label: 'mountain bike', nota: 'Compendium 01009 — BTT general' },
  spinning: { met: 8.5, label: 'spinning', nota: 'Compendium 02019 — clase de spinning' },
  'natacion-libre': { met: 5.8, label: 'natación crol moderada', nota: 'Compendium 18240 — crol, esfuerzo moderado' },
  'natacion-libre-fuerte': { met: 9.8, label: 'natación crol intensa', nota: 'Compendium 18230 — crol, esfuerzo vigoroso' },
  'natacion-pecho': { met: 10.3, label: 'natación pecho', nota: 'Compendium 18220 — braza general' },
  'natacion-espalda': { met: 9.5, label: 'natación espalda', nota: 'Compendium 18200 — espalda general' },
  'natacion-mariposa': { met: 13.8, label: 'natación mariposa', nota: 'Compendium 18210 — mariposa general' },
  'remo-suave': { met: 4.8, label: 'remo suave', nota: 'Compendium 02068 — ergómetro 50 W' },
  'remo-moderado': { met: 7.0, label: 'remo moderado', nota: 'Compendium 02071 — ergómetro 100 W' },
  'remo-intenso': { met: 12.0, label: 'remo intenso', nota: 'Compendium 02073 — ergómetro 200 W' },
  'futbol-recreativo': { met: 7.0, label: 'fútbol recreativo', nota: 'Compendium 15610 — casual' },
  'futbol-5': { met: 8.0, label: 'fútbol 5 o 7', nota: 'interpolado entre casual 7,0 y competitivo 10,0' },
  'futbol-competitivo': { met: 10.0, label: 'fútbol competitivo', nota: 'Compendium 15605 — competitivo' },
  mediocampista: { met: 10.0, label: 'mediocampista', nota: 'fútbol competitivo, el puesto de más volumen' },
  padel: { met: 7.3, label: 'pádel', nota: 'proxy: tenis general, Compendium 15675' },
  tenis: { met: 7.3, label: 'tenis', nota: 'Compendium 15675 — tenis general' },
  basquet: { met: 6.5, label: 'básquet recreativo', nota: 'Compendium 15055 — general' },
  'pesas-liviano': { met: 3.5, label: 'pesas livianas', nota: 'Compendium 02050 — esfuerzo ligero o moderado' },
  'pesas-moderado': { met: 5.0, label: 'pesas de hipertrofia', nota: 'Compendium 02052 — series de sentadillas' },
  'pesas-intenso': { met: 6.0, label: 'pesas intensas', nota: 'Compendium 02054 — esfuerzo vigoroso' },
  crossfit: { met: 8.0, label: 'CrossFit / HIIT', nota: 'Compendium 02040 — circuito vigoroso' },
  soga: { met: 11.8, label: 'saltar la cuerda', nota: 'Compendium 15552 — ritmo moderado' },
  'soga-rapida': { met: 12.3, label: 'saltar la cuerda rápido', nota: 'Compendium 15553 — ritmo rápido' },
  eliptico: { met: 5.0, label: 'elíptico', nota: 'Compendium 02048 — esfuerzo general' },
  escaleras: { met: 8.8, label: 'subir escaleras', nota: 'Compendium 17133 — ritmo vivo' },
  'yoga-hatha': { met: 2.5, label: 'yoga hatha', nota: 'Compendium 02150 — hatha' },
  'yoga-power': { met: 4.0, label: 'yoga power', nota: 'Compendium 02160 — power yoga' },
  pilates: { met: 3.0, label: 'pilates', nota: 'Compendium 02170 — general' },
  baile: { met: 7.3, label: 'baile aeróbico', nota: 'Compendium 03015 — alto impacto' },
  boxeo: { met: 5.5, label: 'boxeo con bolsa', nota: 'Compendium 15250 — bolsa de arena' },
  escalada: { met: 8.0, label: 'escalada indoor', nota: 'Compendium 15533 — ascenso en roca' },
  skate: { met: 5.0, label: 'skate', nota: 'Compendium 15580 — general' },
  surf: { met: 3.0, label: 'surf', nota: 'Compendium 18120 — surf general' },
  sexo: { met: 2.8, label: 'relación sexual', nota: 'Compendium 15535 — esfuerzo activo o vigoroso' },
  barrer: { met: 3.3, label: 'barrer o aspirar', nota: 'Compendium 05043 — aspirar' },
  trapear: { met: 3.5, label: 'trapear pisos', nota: 'Compendium 05021 — fregar pisos' },
  planchar: { met: 1.8, label: 'planchar', nota: 'Compendium 05070 — planchar de pie' },
  cocinar: { met: 3.3, label: 'cocinar de pie', nota: 'Compendium 05035 — preparar comida de pie' },
  jardineria: { met: 3.8, label: 'jardinería general', nota: 'Compendium 08245 — jardinería general' },
  'jardineria-pala': { met: 5.0, label: 'jardinería con pala', nota: 'Compendium 08050 — cavar o palear' },
};

/**
 * Escalas de MET por velocidad, para la rama de distancia.
 * `hasta` es el techo de km/h de cada escalón.
 * Fuente: 2011 Compendium of Physical Activities, secciones 17 (caminar),
 * 12 (correr) y 01 (bicicleta).
 */
export const ESCALAS: Record<string, Array<{ hasta: number; met: number; label: string }>> = {
  caminar: [
    { hasta: 3.2, met: 2.0, label: 'muy lenta (paseo)' },
    { hasta: 4.0, met: 2.8, label: 'lenta' },
    { hasta: 4.8, met: 3.5, label: 'normal' },
    { hasta: 5.6, met: 4.3, label: 'rápida' },
    { hasta: 6.4, met: 5.0, label: 'muy rápida' },
    { hasta: 7.2, met: 7.0, label: 'marcha atlética' },
    { hasta: Infinity, met: 8.3, label: 'casi trote' },
  ],
  correr: [
    { hasta: 8.0, met: 8.3, label: 'trote suave' },
    { hasta: 9.7, met: 9.0, label: 'rodaje' },
    { hasta: 11.3, met: 9.8, label: 'moderada' },
    { hasta: 12.9, met: 11.5, label: 'rápida' },
    { hasta: 14.5, met: 12.8, label: 'muy rápida' },
    { hasta: 16.1, met: 14.5, label: 'ritmo de competición' },
    { hasta: Infinity, met: 16.0, label: 'ritmo de élite' },
  ],
  bici: [
    { hasta: 16.0, met: 4.0, label: 'paseo' },
    { hasta: 19.3, met: 6.8, label: 'suave' },
    { hasta: 22.5, met: 8.0, label: 'moderada' },
    { hasta: 25.7, met: 10.0, label: 'vigorosa' },
    { hasta: 30.6, met: 12.0, label: 'de carrera' },
    { hasta: Infinity, met: 15.8, label: 'de competición' },
  ],
};

/** Constantes del motor. Cada una con su origen. */
export const MOTOR = {
  /** ACSM: kcal/min = MET × 3,5 × kg / 200. Da +5% sobre MET × kg × h. */
  ACSM_FACTOR: (3.5 * 60) / 200,
  /** Compendium: subir escaleras ≈ 20 escalones por piso, 0,5 s por escalón. */
  ESCALONES_POR_PISO: 20,
  SEG_POR_ESCALON: 0.5,
  ALTURA_PISO_M: 3,
  /** Ajuste de pendiente al caminar: ~0,6 MET por cada 1% de subida. */
  MET_POR_PUNTO_PENDIENTE: 0.6,
  /** Eficiencia mecánica humana en ciclismo (rama de watts). */
  EFICIENCIA: 0.24,
  /** 1 kcal = 4,184 kJ. */
  KJ_POR_KCAL: 4.184,
  /** Caminata de referencia para el equivalente: 4,8 km/h, 3,5 MET. */
  MET_CAMINATA_REF: 3.5,
  VEL_CAMINATA_REF: 4.8,
  /** Zancada ≈ 0,7 m promedio, para el equivalente en pasos. */
  ZANCADA_M: 0.7,
  /** Medialuna ≈ 230 kcal. */
  KCAL_MEDIALUNA: 230,
  /** Techo del eje MET del gráfico. */
  ESCALA_MAX: 16,
};
