import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto alcohol, sol y pantalla me hacen bien?"
 * Arquetipo: RAMIFICADO. La pregunta es siempre la dosis de un hábito
 * cotidiano; lo que cambia es el hábito: alcohol, sol, ayuno o pantallas.
 *
 * CONTENIDO YMYL DE SALUD: el disclaimer de dominio 'health' de
 * src/lib/disclaimers.ts va literal en `fineprint` y como PRIMER `warn` de cada
 * rama. Nada de indicaciones clínicas, dosis de medicamentos ni diagnósticos.
 *
 * RAMA ALCOHOL — REGLA INNEGOCIABLE: el resultado NUNCA habilita a manejar.
 * El BAC de Widmark es una estimación con un error enorme (±30%) y la ley
 * argentina no admite "estimaciones": el mensaje siempre es que si tomaste, no
 * manejés. Cualquier copy futuro que sugiera "estás bajo el límite, podés
 * manejar" es un problema legal, no una mejora de UX.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata. Todas las filas declaran `format: 'unit'` (con su
 *    `unit`) o `format: 'plain'`. Una fila sin `format` cae a pesos.
 *  - `chart.type: 'scale'` = barra con franjas y un marcador: el compute()
 *    devuelve `position` (0-100) y `positionLabel` en cada rama.
 */
export const hub: HubData = {
  slug: 'salud/habitos',
  title: '¿Cuánto alcohol, sol y pantalla me hacen bien? — Calculadora de hábitos 2026',
  description:
    'Calculá tu alcohol en sangre estimado frente al límite de la ley 24.449, los minutos de sol seguros según tu fototipo, tu ventana de ayuno intermitente y las pausas que pide la regla 20-20-20. Cuatro hábitos, un solo lugar.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de hábitos saludables',
  h1: '¿Cuánto alcohol, sol y pantalla me hacen bien?',
  lede:
    'Casi todos los hábitos cotidianos son cuestión de dosis: un poco hace bien y de más hace mal. Partimos del caso más consultado —cuánto alcohol tenés en sangre— y desde ahí cambiás al sol, al ayuno o a las pantallas.',
  stamps: ['Actualizado 27-07-2026', 'Ley 24.449 · OMS · AAO', '18 calculadoras adentro'],

  resultLabel: 'Tu dosis del hábito',

  cases: {
    title: '¿Qué hábito querés medir?',
    intro: 'Partimos del alcohol en sangre, que es la consulta más frecuente. Si venís por otro hábito, cambialo acá.',
    items: [
      {
        id: 'alcohol',
        label: 'Alcohol en sangre',
        hint: 'El más consultado · ley 24.449',
        answer: 'Si tomaste, no manejés: ninguna estimación te habilita a conducir.',
        yes: [
          'Alcoholemia estimada por la fórmula de Widmark: gramos de alcohol ÷ (peso × factor de distribución 0,68 en varones y 0,55 en mujeres)',
          'Gramos de alcohol por trago estándar: 13 g una cerveza de 330 ml, 20 g una de 500 ml, 15,4 g una copa de vino de 150 ml, 15,6 g un fernet de 50 ml',
          'Metabolización de 0,15 g/L por hora, que es el promedio poblacional del hígado',
          'Límites de la ley nacional de tránsito 24.449, art. 48: 0,5 g/L general, 0,2 g/L en moto y 0 g/L para conductores profesionales',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'ESTE NÚMERO NO TE HABILITA A MANEJAR. Si tomaste, no manejés: pedí un remis, un auto de aplicación o que maneje alguien que no tomó',
          'Widmark es una estimación poblacional y puede errarle 30% o más según qué comiste, medicación, hidratación y ritmo de la ingesta: tu alcoholemia real puede ser bastante mayor que la estimada',
          'Muchas provincias y municipios tienen alcohol cero al volante, más estricto que el límite nacional: verificá la norma de tu jurisdicción',
          'La coordinación y los reflejos ya se afectan por debajo de 0,5 g/L, aunque el test dé "legal"',
        ],
        plazo: 'el alcohol baja alrededor de 0,15 g/L por hora y no hay atajo: ni café, ni ducha fría, ni comer lo aceleran.',
      },
      {
        id: 'sol',
        label: 'Exposición al sol y protector',
        hint: 'Minutos seguros por fototipo',
        answer: 'Tu piel aguanta un tiempo propio al sol antes de quemarse, y el SPF lo multiplica.',
        yes: [
          'Tiempo de autoprotección por fototipo Fitzpatrick: 5 min el I, 10 el II, 15 el III, 20 el IV, 30 el V y 45 el VI',
          'Tiempo con protector = autoprotección × SPF × 0,6, porque casi nadie aplica los 2 mg/cm² del ensayo de laboratorio',
          'Minutos de sol para vitamina D según fototipo, latitud y estación, con brazos y piernas descubiertos',
          'Reaplicación cada 2 horas, y cada hora si hay agua, transpiración o fricción con la toalla',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El tiempo con protector es teórico: en la práctica dura menos y no se acumula reaplicando (reaplicar mantiene la protección, no la extiende)',
          'Entre las 10 y las 16 el índice UV es máximo: ahí la sombra vale más que cualquier SPF',
          'Si tenés lunares que cambian, antecedentes de cáncer de piel o tomás medicación fotosensibilizante, esto no aplica: consultá a un dermatólogo',
        ],
        plazo: 'reaplicá cada 2 horas de exposición, y cada hora si te metés al agua o transpirás.',
      },
      {
        id: 'ayuno',
        label: 'Ayuno intermitente',
        hint: 'Ventana y horarios 16/8, 18/6 o 20/4',
        answer: 'Tu ventana de comida es lo que sobra de las 24 horas después del ayuno.',
        yes: [
          'Ventana de comida = 24 horas − horas de ayuno del protocolo elegido',
          'Hora de romper el ayuno calculada desde la hora en que hacés la última comida',
          'Protocolos habituales: 16/8 (el más estudiado), 18/6 y 20/4 o una sola comida diaria',
          'Cuántas comidas entran cómodas en la ventana, a razón de una cada 3 horas',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El ayuno no está indicado en embarazo, lactancia, menores, diabetes con medicación, antecedentes de trastorno de la conducta alimentaria ni bajo peso',
          'Ayunar no reemplaza comer bien: si en la ventana comés de más, no hay déficit y el beneficio desaparece',
          'Protocolos de 20 horas o más pueden costar cubrir proteína, calcio y hierro: cuanto más largo el ayuno, más conviene el acompañamiento profesional',
        ],
        plazo: 'dale entre 2 y 4 semanas de adaptación antes de juzgar si te sienta bien.',
      },
      {
        id: 'pantallas',
        label: 'Pantallas y descanso',
        hint: 'Regla 20-20-20 y pasos del día',
        answer: 'Cada 20 minutos de pantalla, 20 segundos mirando a 6 metros.',
        yes: [
          'Pausas mínimas por la regla 20-20-20 de la Academia Americana de Oftalmología: una cada 20 minutos de pantalla',
          'Pausas largas de 5 minutos cada 2 horas, según la recomendación ergonómica de NIOSH',
          'Score de riesgo de fatiga visual que suma horas, tipo de tarea, distancia al monitor, pausas y síntomas',
          'Meta de pasos del día según edad (Paluch 2022 y OMS 2020), porque la contracara de la pantalla es el sedentarismo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La fatiga visual digital no daña la vista de forma permanente, pero el ojo seco, la cefalea y la visión borrosa son reales: si persisten, consultá a un oftalmólogo',
          'Sentarse menos importa tanto como parpadear más: las pausas largas son para levantarse, no para cambiar de pantalla',
          'La evidencia sobre los lentes con filtro de luz azul es débil; lo que sí está documentado es el efecto de la luz nocturna sobre el sueño',
        ],
        plazo: 'la regla 20-20-20 se aplica durante toda la jornada, no sólo cuando ya te arden los ojos.',
      },
    ],
  },

  inputsTitle: 'Completá lo que corresponde a tu hábito',
  inputsIntro: 'Cada rama usa sólo algunos campos: los demás quedan ahí para cuando cambies de hábito.',
  fields: [
    { id: 'peso', label: 'Peso corporal', type: 'number', suffix: 'kg', min: 30, max: 250, step: 0.5, value: 75, help: 'Se usa en la rama de alcohol.' },
    {
      id: 'sexo',
      label: 'Sexo (cambia el factor de distribución de Widmark)',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Masculino — factor 0,68' },
        { value: 'f', label: 'Femenino — factor 0,55' },
      ],
    },
    { id: 'bebidas', label: 'Tragos tomados', type: 'number', suffix: 'tragos', min: 0, max: 30, step: 1, value: 2 },
    {
      id: 'tipoBebida',
      label: 'Tipo de trago',
      type: 'select',
      value: 'cerveza_500',
      options: [
        { value: 'cerveza_330', label: 'Cerveza 330 ml — 13 g de alcohol' },
        { value: 'cerveza_500', label: 'Cerveza 500 ml — 20 g' },
        { value: 'vino_150', label: 'Copa de vino 150 ml — 15,4 g' },
        { value: 'fernet_50', label: 'Fernet 50 ml — 15,6 g' },
        { value: 'whisky_45', label: 'Whisky 45 ml — 14,2 g' },
        { value: 'champagne_150', label: 'Champagne 150 ml — 14,2 g' },
        { value: 'vodka_45', label: 'Vodka 45 ml — 14,2 g' },
      ],
    },
    { id: 'horas', label: 'Horas desde el primer trago', type: 'number', suffix: 'horas', min: 0, max: 24, step: 0.5, value: 2 },
    {
      id: 'fototipo',
      label: 'Fototipo de piel (Fitzpatrick)',
      type: 'select',
      value: 'III',
      options: [
        { value: 'I', label: 'I — muy clara, siempre se quema, nunca se broncea' },
        { value: 'II', label: 'II — clara, se quema fácil, se broncea poco' },
        { value: 'III', label: 'III — intermedia, se quema a veces, se broncea' },
        { value: 'IV', label: 'IV — morena clara, se quema poco' },
        { value: 'V', label: 'V — morena oscura, rara vez se quema' },
        { value: 'VI', label: 'VI — negra, prácticamente no se quema' },
      ],
      help: 'Se usa en la rama de sol.',
    },
    { id: 'spf', label: 'SPF del protector que usás', type: 'number', suffix: 'SPF', min: 2, max: 100, step: 1, value: 30 },
    { id: 'latitud', label: 'Latitud aproximada donde vivís', type: 'number', suffix: '°', min: 0, max: 65, step: 1, value: 34, help: 'Buenos Aires 34°, Córdoba 31°, Ushuaia 55°, Salta 25°.' },
    {
      id: 'estacion',
      label: 'Estación del año',
      type: 'select',
      value: 'verano',
      options: [
        { value: 'verano', label: 'Verano' },
        { value: 'primavera', label: 'Primavera' },
        { value: 'otono', label: 'Otoño' },
        { value: 'invierno', label: 'Invierno' },
      ],
    },
    {
      id: 'protocolo',
      label: 'Protocolo de ayuno',
      type: 'select',
      value: '16_8',
      options: [
        { value: '14_10', label: '14/10 — arranque suave' },
        { value: '16_8', label: '16/8 — el más estudiado' },
        { value: '18_6', label: '18/6 — intermedio' },
        { value: '20_4', label: '20/4 — ventana corta' },
      ],
      help: 'Se usa en la rama de ayuno.',
    },
    { id: 'horaUltimaComida', label: 'Hora de tu última comida', type: 'text', value: '20:00', help: 'Formato 24 h, por ejemplo 21:30.' },
    { id: 'horasPantalla', label: 'Horas de pantalla por día', type: 'number', suffix: 'horas', min: 0, max: 20, step: 0.5, value: 8, help: 'Se usa en la rama de pantallas.' },
    { id: 'pausasActuales', label: 'Pausas visuales que hacés hoy', type: 'number', suffix: 'pausas', min: 0, max: 100, step: 1, value: 4 },
    { id: 'distanciaMonitor', label: 'Distancia a la pantalla', type: 'number', suffix: 'cm', min: 20, max: 150, step: 1, value: 50 },
    { id: 'pasosActuales', label: 'Pasos que caminás por día', suffix: 'pasos', value: '5.000', thousands: true },
    {
      id: 'grupoEdad',
      label: 'Grupo de edad (para la meta de pasos)',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'nino', label: 'Niño o adolescente (6-17)' },
        { value: 'adulto', label: 'Adulto (18-59)' },
        { value: 'mayor60', label: 'Adulto mayor (60-79)' },
        { value: 'mayor80', label: 'Adulto mayor (80 o más)' },
      ],
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado. Si tomaste alcohol, no manejés: ninguna estimación de esta página te habilita a conducir.',

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra muestra las franjas del hábito que elegiste y el marcador indica dónde estás. En alcohol, las franjas arrancan en los límites de la ley 24.449 (0,5 g/L general, 0,2 en moto, 0 profesional): estar en la franja verde NO significa que puedas manejar. En sol, las franjas son los minutos que tu piel aguanta antes de enrojecer según tu fototipo.',
  },
  breakdownTitle: 'Tus números, uno por uno',
  breakdownIntro:
    'Cada fila trae su unidad: g/L para alcoholemia, minutos para sol, horas para ayuno y pasos o pausas para pantallas. Ninguna cifra de esta página es dinero.',

  faq: [
    {
      q: '¿Cuánto alcohol puedo tomar para manejar en Argentina?',
      a: 'Ninguna cantidad es segura para manejar. La ley 24.449 fija el tope en 0,5 g/L para autos particulares, 0,2 g/L para motos y 0 g/L para conductores profesionales, y muchas provincias y municipios aplican alcohol cero. Pero el límite legal no es un permiso: los reflejos y el juicio ya se afectan antes de llegar a él, y una estimación como la de esta calculadora puede errarle 30%. Si tomaste, no manejés.',
    },
    {
      q: '¿Cuánto tarda en bajar el alcohol en sangre?',
      a: 'El hígado metaboliza alrededor de 0,15 g/L por hora, y esa velocidad no se acelera. Con 0,6 g/L estimados hacen falta unas 4 horas para volver a cero. El café, la ducha fría, el vómito o comer no cambian nada: sólo pasa el tiempo. Por eso la resaca de la madrugada puede seguir dando positivo a la mañana siguiente.',
    },
    {
      q: '¿Cómo se calcula el alcohol en sangre?',
      a: 'Con la fórmula de Widmark: alcoholemia = gramos de alcohol ingeridos ÷ (peso corporal × factor de distribución), menos 0,15 g/L por cada hora transcurrida. El factor es 0,68 en varones y 0,55 en mujeres porque el agua corporal difiere. Un trago estándar tiene entre 13 y 20 gramos de alcohol según el tipo y el tamaño.',
    },
    {
      q: '¿Cuántos minutos de sol necesito para la vitamina D?',
      a: 'Depende de tu fototipo, la latitud y la estación: entre 8 y 45 minutos, 3 o 4 veces por semana, con brazos y piernas descubiertos y sin protector durante ese rato. En invierno y por encima de los 35° de latitud prácticamente no hay radiación UVB útil: ahí la vía real es suplementar, y eso se define con un profesional, no con una calculadora.',
    },
    {
      q: '¿Cuánto tiempo protege realmente un protector solar SPF 30?',
      a: 'En teoría multiplica por 30 el tiempo que tu piel aguanta sin quemarse: un fototipo III, que resiste unos 15 minutos, llegaría a 450. En la práctica se aplica menos producto del que usa el ensayo (2 mg/cm²), así que conviene descontar un 40%. Por eso la regla operativa es reaplicar cada 2 horas, o cada hora si hay agua o transpiración, sin importar el SPF.',
    },
    {
      q: '¿El protector solar bloquea la vitamina D?',
      a: 'La reduce mientras lo tenés puesto y bien aplicado, porque filtra justamente la UVB que la sintetiza. En la práctica casi nadie se aplica lo suficiente como para anularla del todo. La estrategia sensata es tener unos minutos de exposición corta en horarios de UV bajo y usar protector el resto del tiempo, en vez de quemarse "para la vitamina D".',
    },
    {
      q: '¿Cuál es la mejor ventana para el ayuno intermitente 16/8?',
      a: 'La que puedas sostener. Si cenás a las 20:00, rompés el ayuno a las 12:00 del día siguiente y comés entre las 12 y las 20. Correr la ventana hacia temprano (por ejemplo 9 a 17) tiene algo más de respaldo metabólico, pero la adherencia manda: el mejor protocolo es el que hacés sin pelearte con tus horarios.',
    },
    {
      q: '¿El ayuno intermitente sirve para bajar de peso?',
      a: 'Sirve en la medida en que te haga comer menos calorías en total. Los ensayos que comparan ayuno contra restricción calórica clásica con las mismas calorías no muestran gran ventaja del ayuno. Su fuerte es práctico: a mucha gente le resulta más fácil saltear el desayuno que medir porciones todo el día.',
    },
    {
      q: '¿Qué es la regla 20-20-20 para las pantallas?',
      a: 'Cada 20 minutos de pantalla, mirar algo a 6 metros (20 pies) durante 20 segundos. Relaja el músculo ciliar, que se fatiga al enfocar de cerca en forma sostenida, y obliga a parpadear, que es lo que evita el ojo seco. Con 8 horas de pantalla son 24 pausas cortas por día, más una pausa larga de 5 minutos cada 2 horas.',
    },
    {
      q: '¿Cuántos pasos por día hay que caminar?',
      a: 'El metaanálisis de Paluch (2022, Lancet Public Health) muestra que la mortalidad deja de bajar alrededor de 8.000 a 10.000 pasos en menores de 60 años y de 6.000 a 8.000 en mayores. Los 10.000 pasos no salieron de un estudio sino de una campaña publicitaria japonesa de 1965: pasar de 3.000 a 7.000 es el salto que más cambia el riesgo.',
    },
    {
      q: '¿Los lentes con filtro de luz azul sirven de algo?',
      a: 'Para la fatiga visual la evidencia es débil: las revisiones sistemáticas no encuentran diferencia clara contra lentes sin filtro. Lo que sí está documentado es que la luz de pantallas en las dos horas previas a dormir desplaza la melatonina y retrasa el sueño. Ahí el modo nocturno, bajar el brillo o directamente apagar la pantalla rinden más que el filtro.',
    },
    {
      q: '¿Esta página reemplaza una consulta médica?',
      a: 'No. Todos los números son estimaciones poblacionales orientativas y no contemplan tu historia clínica, medicación ni antecedentes. Si tenés síntomas persistentes, una condición diagnosticada o estás embarazada, lo que corresponde es una consulta con un profesional de la salud matriculado.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.449 de Tránsito y Seguridad Vial, art. 48 (límites de alcoholemia)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/818/texact.htm',
      publisher: 'InfoLEG — Ministerio de Justicia, Argentina',
      date: '1995 y modificatorias',
    },
    {
      name: 'Agencia Nacional de Seguridad Vial — Alcohol y conducción',
      url: 'https://www.argentina.gob.ar/seguridadvial/educacion-vial/alcohol',
      publisher: 'ANSV, Argentina',
    },
    {
      name: 'OMS — Alcohol (nota descriptiva: no hay nivel de consumo libre de riesgo)',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/alcohol',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Fitzpatrick TB — The validity and practicality of sun-reactive skin types I through VI',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3377516/',
      publisher: 'Arch Dermatol (PubMed)',
      date: '1988',
    },
    {
      name: 'Holick MF — Vitamin D deficiency (exposición solar y síntesis de vitamina D)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17634462/',
      publisher: 'N Engl J Med (PubMed)',
      date: '2007',
    },
    {
      name: 'OMS — Radiación ultravioleta e índice UV',
      url: 'https://www.who.int/es/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'de Cabo R, Mattson MP — Effects of intermittent fasting on health, aging and disease',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31881139/',
      publisher: 'N Engl J Med (PubMed)',
      date: '2019',
    },
    {
      name: 'American Academy of Ophthalmology — Computer use and eye strain (regla 20-20-20)',
      url: 'https://www.aao.org/eye-health/tips-prevention/computer-usage',
      publisher: 'American Academy of Ophthalmology',
    },
    {
      name: 'Paluch AE et al. — Daily steps and all-cause mortality: meta-analysis of 15 cohorts',
      url: 'https://pubmed.ncbi.nlm.nih.gov/35247352/',
      publisher: 'Lancet Public Health (PubMed)',
      date: '2022',
    },
    {
      name: 'OMS — Directrices sobre actividad física y hábitos sedentarios',
      url: 'https://www.who.int/es/publications/i/item/9789240015128',
      publisher: 'Organización Mundial de la Salud',
      date: '2020',
    },
  ],

  replaces: [
    '/calculadora-alcohol-sangre-bac',
    '/calculadora-exposicion-sol-vitamina-d',
    '/calculadora-protector-solar-spf-fototipo',
    '/calculadora-spf-proteccion-solar-minutos-piel',
    '/calculadora-ayuno-intermitente-16-8-ventana-horario',
    '/calculadora-ayuno-intermitente-beneficios-calorias-20-4',
    '/calculadora-screen-time-adultos-fatiga-visual-pausas',
    '/calculadora-pasos-diarios-recomendados-caminar-salud',
    '/calculadora-indice-bienestar-who5',
    '/calculadora-nivel-estres-percibido',
    '/calculadora-nivel-estres',
    '/calculadora-nivel-introversion-extraversion',
    '/calculadora-tiempo-digestion-alimentos-estomago',
    '/calculadora-lactosa-alimento-intolerancia',
    '/calculadora-fructosa-malabsorcion',
    '/calculadora-oxalatos-calculos-renales',
    '/calculadora-acidez-orina-alimentos',
    '/calculadora-agua-cafe-te-hidratacion-real-mitos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Gramos de alcohol por trago estándar, por tipo de bebida. */
export const GRAMOS_TRAGO: Record<string, number> = {
  cerveza_330: 13,
  cerveza_500: 20,
  vino_150: 15.4,
  fernet_50: 15.6,
  whisky_45: 14.2,
  champagne_150: 14.2,
  vodka_45: 14.2,
};

/** Constantes de la rama alcohol (Widmark + ley 24.449). */
export const ALCOHOL = {
  /** Factor de distribución de Widmark. */
  R_M: 0.68,
  R_F: 0.55,
  /** Metabolización media, g/L por hora. */
  ELIMINACION_HORA: 0.15,
  /** Límites del art. 48 de la ley 24.449, en g/L. */
  LIMITE_GENERAL: 0.5,
  LIMITE_MOTO: 0.2,
  LIMITE_PROFESIONAL: 0,
  /** Techo de la escala del gráfico. */
  ESCALA_MAX: 2.5,
};

/** Minutos de autoprotección solar por fototipo Fitzpatrick. */
export const FOTOTIPO_MIN: Record<string, number> = { I: 5, II: 10, III: 15, IV: 20, V: 30, VI: 45 };

/** Minutos base de sol para vitamina D por fototipo (verano, latitud media, mediodía). */
export const VITD_BASE_MIN: Record<string, number> = { I: 8, II: 12, III: 18, IV: 25, V: 35, VI: 45 };

/** Ajustes de la rama sol. */
export const SOL = {
  /** El SPF real rinde ~60% del de laboratorio por aplicación insuficiente. */
  FACTOR_APLICACION: 0.6,
  /** Multiplicadores de vitamina D por estación. */
  ESTACION: { verano: 1, primavera: 1.2, otono: 1.4, invierno: 2 } as Record<string, number>,
  /** Techo de la escala del gráfico, en minutos. */
  ESCALA_MAX: 60,
};

/** Horas de ayuno por protocolo. */
export const PROTOCOLO_HORAS: Record<string, number> = { '14_10': 14, '16_8': 16, '18_6': 18, '20_4': 20 };

/** Constantes de la rama pantallas (AAO + NIOSH + Paluch/OMS). */
export const PANTALLAS = {
  /** Regla 20-20-20: una pausa cada 20 minutos. */
  MIN_ENTRE_PAUSAS: 20,
  /** Pausa larga de 5 minutos cada 2 horas (NIOSH). */
  HORAS_ENTRE_PAUSAS_LARGAS: 2,
  /** Techo de la escala de riesgo de fatiga visual. */
  ESCALA_MAX: 16,
};

/** Metas de pasos por grupo de edad (Paluch 2022 · OMS 2020). */
export const PASOS_META: Record<string, { min: number; optimo: number; label: string }> = {
  nino: { min: 6000, optimo: 10000, label: 'niño o adolescente' },
  adulto: { min: 7000, optimo: 8000, label: 'adulto' },
  mayor60: { min: 6000, optimo: 7000, label: 'adulto mayor' },
  mayor80: { min: 4000, optimo: 5500, label: 'adulto mayor de 80' },
};
