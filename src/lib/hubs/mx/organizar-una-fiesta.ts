import type { HubData } from '../types';

/**
 * Hub de decisión MX — "¿Cuánto compro y cuánto gasto para la fiesta?"
 *
 * Fusiona el presupuesto de la noche mexicana del 15 de septiembre, los litros
 * de bebida por invitado, los kilos de carne para la carne asada y el reparto de
 * la cuenta con propina cuando la reunión termina en restaurante.
 *
 * Todos los costos por persona y las raciones se copian TAL CUAL de las fórmulas
 * originales (src/lib/formulas/*.ts). Son precios de mercado: cambian.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Costos de la fiesta por persona, MXN — copiados de
 * src/lib/formulas/presupuesto-fiesta-noche-mexicana-mexico.ts
 * (promedios ANPEC/Profeco de temporada, vigentes a julio de 2026).
 */
export const FIESTA_MX = {
  comida: { pozole: 90, pozoleAntojitos: 200, taquiza: 250 } as Record<string, number>,
  bebidas: { sinAlcohol: 55, conCerveza: 140, conTequila: 290 } as Record<string, number>,
  dulcesPorPersona: 40,
  /** Decoración: costo fijo por fiesta. */
  decoracion: { no: 0, basica: 300, completa: 700 } as Record<string, number>,
  menuLabel: {
    pozole: 'pozole clásico',
    pozoleAntojitos: 'pozole y antojitos',
    taquiza: 'taquiza completa',
  } as Record<string, string>,
};

/**
 * Raciones de bebida — src/lib/formulas/bebidas-evento-litros-por-persona.ts
 * Litros por persona y por hora, con factor estacional y decrecimiento horario.
 */
export const BEBIDAS_MX = {
  alcoholPorPersonaHora: 0.35,
  noAlcoholPorPersonaHora: 0.25,
  temporada: { verano: 1.2, intermedia: 1.0, invierno: 0.85 } as Record<string, number>,
  /** Reparto del alcohol según el tipo de barra. */
  mezcla: {
    cerveza: { cerveza: 0.85, vino: 0.15, destilado: 0 },
    vino: { cerveza: 0.2, vino: 0.8, destilado: 0 },
    mixto: { cerveza: 0.4, vino: 0.3, destilado: 0.3 },
    sin_alcohol: { cerveza: 0, vino: 0, destilado: 0 },
  } as Record<string, { cerveza: number; vino: number; destilado: number }>,
  /** Litros por botella de vino. */
  litrosBotellaVino: 0.75,
  /** Cada litro de destilado arrastra este volumen de refresco o agua mineral. */
  refrescoPorLitroDestilado: 2.5,
};

/**
 * Raciones de carne asada — src/lib/formulas/carne-asado-kg-por-persona.ts
 */
export const CARNE_MX = {
  gramosPorAdulto: { almuerzo: 500, cena: 450, evento_largo: 380 } as Record<string, number>,
  /** Descuento en gramos por adulto cuando hay botana o entrada previa. */
  descuentoEntrada: 80,
  gramosPorMenor: 220,
  /** Kilos de vísceras por adulto. */
  viscerasPorAdulto: 0.1,
  /** Chorizos por adulto y por menor. */
  chorizosPorAdulto: 1,
  chorizosPorMenor: 0.5,
  /** Morongas por adulto. */
  morongasPorAdulto: 0.5,
};

export const hub: HubData = {
  slug: 'mx/vida/organizar-una-fiesta',
  title: 'Organizar una fiesta en México: cuánta comida, bebida y presupuesto por invitado',
  description:
    'Calcula el presupuesto de tu fiesta o noche mexicana por invitado, cuántos litros de bebida y kilos de carne comprar para la carne asada y cómo dividir la cuenta con propina cuando la reunión termina en restaurante.',
  silo: 'Vida',
  siloHref: '/mx/vida',

  eyebrow: 'México · fiestas y reuniones',
  h1: '¿Cuánto compro y cuánto gasto para la fiesta?',
  lede:
    'Quedarse corto de comida o pasarse de presupuesto son los dos miedos de quien organiza. Pon el número de invitados y el tipo de reunión: te decimos cuánto vas a gastar, cuántos litros y kilos comprar y cómo repartir la cuenta al final.',
  stamps: [
    'Presupuesto por invitado con desglose',
    'Litros de bebida por persona y por hora',
    'Kilos de carne por adulto y por menor',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que necesitas',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro:
      'Empezamos por el presupuesto total, que es lo primero que se decide antes de ponerse a comprar.',
    items: [
      {
        id: 'presupuesto',
        label: 'Cuánto me va a costar la fiesta',
        hint: 'Presupuesto total y por invitado, desglosado en comida, bebidas, dulces y decoración.',
        yes: [
          'Presupuesto total de la reunión y costo por invitado',
          'Desglose entre comida, bebidas, dulces típicos y decoración',
          'Comparación entre menús y entre barras de bebida',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Son precios de mercado promedio de temporada: cambian con la inflación y varían mucho entre ciudades',
          'Las bebidas suelen ser el rubro más pesado y el que más se dispara si la fiesta se alarga',
          'Comprar maíz pozolero, carne y verdura en mercado en vez de supermercado suele bajar la cuenta de forma notable',
          'No incluye renta de mobiliario, meseros, música ni el costo del lugar',
        ],
        plazo: 'compra los no perecederos con una semana de anticipación; la carne y la verdura, uno o dos días antes.',
        answer:
          'El presupuesto se arma con un costo por invitado de comida, bebidas y dulces, más un costo fijo de decoración por fiesta.',
      },
      {
        id: 'bebidas',
        label: 'Cuánta bebida comprar',
        hint: 'Litros de cerveza, vino, destilados y refresco según invitados, horas y temporada.',
        yes: [
          'Litros totales a comprar y litros por cabeza',
          'Reparto entre cerveza, vino, destilados y bebidas sin alcohol',
          'Botellas de vino equivalentes',
          'Ajuste por temporada y por duración de la fiesta',
        ],
        warn: [
          DISCLAIMER_FIN,
          'A partir de la cuarta hora el consumo por hora baja: el cálculo ya lo contempla y por eso no crece de forma lineal',
          'En calor se toma alrededor de un 20% más; en invierno, bastante menos',
          'Conviene comprar un 10% de más: sobra bebida cerrada, que se devuelve o se guarda, y no se hace el ridículo a mitad de fiesta',
          'Ten siempre agua y una opción sin alcohol suficiente: no todos los invitados toman y alguien tiene que manejar',
        ],
        plazo: 'compra el hielo el mismo día y calcula alrededor de un kilo por persona.',
        answer:
          'Se estiman litros por persona y por hora, ajustados por temporada y por la duración real de la fiesta, y luego se reparten según el tipo de barra.',
      },
      {
        id: 'carne',
        label: 'Cuánta carne para la carne asada',
        hint: 'Kilos por adulto y por menor, más vísceras, chorizos y morongas.',
        yes: [
          'Kilos de carne redondeados a medio kilo, que es como se compra',
          'Ajuste por tipo de reunión y por botana previa',
          'Kilos de vísceras, número de chorizos y de morongas',
          'Peso total que va a la parrilla',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los gramos son de carne en crudo y con hueso: la porción servida siempre pesa menos',
          'Si hay botana previa el cálculo baja la ración por adulto; si no la marcas, te va a sobrar',
          'En reuniones largas la gente come menos por hora pero pica más: el cálculo baja los gramos por adulto',
          'Refrigera la carne hasta el momento de asarla y no uses la misma tabla para lo crudo y lo cocido',
        ],
        plazo: 'saca la carne del refrigerador entre treinta y sesenta minutos antes de ponerla al fuego.',
        answer:
          'Se calcula por gramos por adulto según el tipo de reunión, más una ración menor para los niños, y se redondea hacia arriba a medio kilo.',
      },
      {
        id: 'cuenta',
        label: 'Dividir la cuenta y la propina',
        hint: 'Cuánto pone cada quien cuando la reunión termina en restaurante.',
        yes: [
          'Propina total y total a pagar',
          'Cuánto pone cada persona, con la propina ya incluida',
          'Redondeo de la parte de cada quien para que sea fácil de transferir',
          'Cuánto queda de propina extra por el redondeo',
        ],
        warn: [
          DISCLAIMER_FIN,
          'En México la propina es voluntaria y lo habitual es dejar entre el 10% y el 15%: nadie puede cobrártela de forma obligatoria',
          'Si el restaurante ya incluyó un cargo por servicio en la cuenta, revisa antes de sumar propina encima',
          'El redondeo siempre va hacia arriba para que no falte dinero en la mesa; el excedente queda para el personal',
        ],
        plazo: 'revisa la cuenta antes de dividir: los cargos por servicio suelen venir en letra chica.',
        answer:
          'La propina se calcula sobre el total de la cuenta y se reparte entre los comensales, redondeando hacia arriba la parte de cada quien.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'El número de invitados alimenta casi todas las ramas; el resto de los campos solo lo usa la rama que corresponde.',
  fields: [
    {
      id: 'invitados',
      label: 'Número de invitados',
      type: 'number',
      value: 20,
      min: 1,
      max: 200,
      step: 1,
      help: 'Cuenta a todos los que se van a sentar a la mesa.',
    },
    {
      id: 'menu',
      label: 'Menú de la fiesta',
      type: 'select',
      value: 'pozoleAntojitos',
      options: [
        { value: 'pozole', label: 'Pozole clásico' },
        { value: 'pozoleAntojitos', label: 'Pozole y antojitos' },
        { value: 'taquiza', label: 'Taquiza completa' },
      ],
      help: 'Incluye guarniciones y tostadas.',
    },
    {
      id: 'barra',
      label: 'Barra de bebidas',
      type: 'select',
      value: 'conCerveza',
      options: [
        { value: 'sinAlcohol', label: 'Sin alcohol' },
        { value: 'conCerveza', label: 'Con cerveza' },
        { value: 'conTequila', label: 'Con cerveza y tequila o mezcal' },
      ],
      help: 'Es el rubro que más se dispara si la fiesta se alarga.',
    },
    {
      id: 'incluyeDulces',
      label: '¿Dulces típicos y postre?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      help: 'Se calcula por persona.',
    },
    {
      id: 'decoracion',
      label: 'Decoración',
      type: 'select',
      value: 'basica',
      options: [
        { value: 'no', label: 'Sin decoración' },
        { value: 'basica', label: 'Básica' },
        { value: 'completa', label: 'Completa' },
      ],
      help: 'Es un costo fijo por fiesta, no por invitado.',
    },
    {
      id: 'duracionHoras',
      label: 'Duración de la fiesta (horas)',
      type: 'number',
      value: 5,
      min: 1,
      max: 24,
      step: 1,
      suffix: 'h',
      help: 'A partir de la cuarta hora el consumo por hora baja.',
    },
    {
      id: 'tipoBebida',
      label: 'Tipo de barra para el cálculo de litros',
      type: 'select',
      value: 'mixto',
      options: [
        { value: 'mixto', label: 'Mixta: cerveza, vino y destilados' },
        { value: 'cerveza', label: 'Sobre todo cerveza' },
        { value: 'vino', label: 'Sobre todo vino' },
        { value: 'sin_alcohol', label: 'Sin alcohol' },
      ],
      help: 'Define cómo se reparten los litros de alcohol.',
    },
    {
      id: 'temporadaBebida',
      label: 'Temporada',
      type: 'select',
      value: 'intermedia',
      options: [
        { value: 'verano', label: 'Calor (+20%)' },
        { value: 'intermedia', label: 'Templado (referencia)' },
        { value: 'invierno', label: 'Frío (–15%)' },
      ],
      help: 'En calor se toma bastante más.',
    },
    {
      id: 'adultos',
      label: 'Adultos en la carne asada',
      type: 'number',
      value: 12,
      min: 1,
      max: 200,
      step: 1,
      help: 'Los que comen ración completa.',
    },
    {
      id: 'menores',
      label: 'Menores en la carne asada',
      type: 'number',
      value: 4,
      min: 0,
      max: 200,
      step: 1,
      help: 'Se calculan con una ración reducida.',
    },
    {
      id: 'tipoEvento',
      label: 'Tipo de reunión',
      type: 'select',
      value: 'almuerzo',
      options: [
        { value: 'almuerzo', label: 'Comida (500 g por adulto)' },
        { value: 'cena', label: 'Cena (450 g por adulto)' },
        { value: 'evento_largo', label: 'Reunión larga (380 g por adulto)' },
      ],
      help: 'En reuniones largas la gente come menos por hora.',
    },
    {
      id: 'hayEntrada',
      label: '¿Hay botana o entrada previa?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Baja 80 gramos la ración por adulto.',
    },
    {
      id: 'incluirVisceras',
      label: '¿Vísceras, chorizos y morongas?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No, solo carne' },
      ],
      help: 'Suman peso a la parrilla y hay que contarlos aparte.',
    },
    {
      id: 'totalCuenta',
      label: 'Total de la cuenta del restaurante ($)',
      type: 'number',
      value: 800,
      min: 0,
      step: 50,
      prefix: '$',
      thousands: true,
      help: 'El subtotal que trae el ticket, antes de la propina.',
    },
    {
      id: 'propinaPct',
      label: 'Propina (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'En México lo habitual es entre 10% y 15%.',
    },
    {
      id: 'redondeo',
      label: 'Redondear la parte de cada quien',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'Sin redondeo' },
        { value: '10', label: 'A múltiplos de $10' },
        { value: '50', label: 'A múltiplos de $50' },
        { value: '100', label: 'A múltiplos de $100' },
      ],
      help: 'El redondeo siempre va hacia arriba y el excedente queda de propina.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Composición de tu fiesta',
    caption:
      'Según la rama, el gráfico reparte el presupuesto entre comida, bebidas, dulces y decoración; los litros entre tipos de bebida; los kilos entre carne y vísceras; o la cuenta entre consumo y propina.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto se gasta por invitado en una fiesta mexicana?',
      a: 'Depende sobre todo del menú y de la barra. Un pozole clásico con aguas frescas está muy por debajo de una taquiza completa con cerveza y tequila, y en esa diferencia se juega casi todo el presupuesto. La decoración, en cambio, es un costo fijo por fiesta y pesa poco cuando hay muchos invitados.',
    },
    {
      q: '¿Qué rubro se lleva más presupuesto en una fiesta?',
      a: 'Casi siempre las bebidas, sobre todo si hay destilados. Es también el rubro que peor escala, porque crece con los invitados y con las horas al mismo tiempo. Si quieres bajar el gasto sin que se note, la palanca es la barra, no la comida.',
    },
    {
      q: '¿Cuántos litros de bebida se calculan por persona?',
      a: 'Se parte de un consumo por persona y por hora, separando alcohol de bebidas sin alcohol, y se ajusta por temporada. A partir de la cuarta hora el consumo por hora baja de forma clara, así que una fiesta de ocho horas no necesita el doble de bebida que una de cuatro.',
    },
    {
      q: '¿Cuánta agua y refresco hay que comprar?',
      a: 'Además de la estimación de bebidas sin alcohol, cada litro de destilado arrastra alrededor de dos litros y medio de refresco o agua mineral para preparar. Y conviene tener agua simple de sobra: es lo primero que se acaba en fiestas con calor.',
    },
    {
      q: '¿Cuántos kilos de carne por persona en una carne asada?',
      a: 'Como referencia, medio kilo por adulto en una comida, algo menos en una cena y bastante menos en una reunión larga donde se come de a poco. Los menores se cuentan con alrededor de la mitad de la ración de un adulto. Si hay botana previa, la ración por adulto baja de forma apreciable.',
    },
    {
      q: '¿Por qué el cálculo redondea la carne a medio kilo?',
      a: 'Porque así es como se compra en la carnicería. Redondear hacia arriba a la media unidad evita pedir cantidades imposibles y deja un margen para el invitado que come más de la cuenta, que en toda parrilla existe.',
    },
    {
      q: '¿Cuánta propina se deja en México?',
      a: 'Lo habitual es entre el 10% y el 15% del consumo, y es voluntaria: nadie puede exigirla. Conviene revisar el ticket, porque algunos establecimientos incluyen un cargo por servicio y en ese caso no corresponde sumar propina encima.',
    },
    {
      q: '¿Cómo divido la cuenta si redondeamos lo de cada quien?',
      a: 'El redondeo va siempre hacia arriba, de modo que la suma de las partes nunca quede por debajo de la cuenta. Lo que sobra por el redondeo se convierte en propina adicional para el personal, así que en la práctica el porcentaje real acaba siendo un poco mayor al que pusiste.',
    },
    {
      q: '¿Con cuánta anticipación conviene comprar?',
      a: 'Los no perecederos y las bebidas, con una semana de anticipación, que además da margen para cazar promociones. La carne, la verdura y las tortillas, uno o dos días antes. El hielo, el mismo día, calculando alrededor de un kilo por persona.',
    },
    {
      q: '¿Cómo bajo el costo sin que se note?',
      a: 'Comprar en mercado en lugar de supermercado los ingredientes frescos suele hacer la diferencia más grande. Después, ajustar la barra: pasar de destilados a solo cerveza recorta el rubro más caro sin tocar la comida, que es lo que la gente recuerda.',
    },
    {
      q: '¿Qué no está incluido en el presupuesto?',
      a: 'La renta de mesas, sillas y mantelería, el personal de servicio, la música y el costo del lugar si no es tu casa. Son gastos que en una fiesta grande pueden pesar tanto como la comida, así que conviene presupuestarlos aparte.',
    },
    {
      q: '¿Qué cuidados de seguridad alimentaria hay que tener?',
      a: 'Mantener refrigerada la carne hasta el momento de asarla, no reutilizar la tabla ni los utensilios que tocaron el crudo para lo ya cocido, y no dejar comida preparada a temperatura ambiente durante horas. En una fiesta larga y con calor es donde más se descuida.',
    },
  ],

  sources: [
    {
      name: 'PROFECO — Quién es Quién en los Precios',
      url: 'https://www.gob.mx/profeco',
      publisher: 'Procuraduría Federal del Consumidor',
    },
    {
      name: 'ANPEC — reportes de precios de la canasta de temporada',
      url: 'https://anpec.com.mx/',
      publisher: 'Alianza Nacional de Pequeños Comerciantes',
    },
    {
      name: 'PROFECO — la propina es voluntaria',
      url: 'https://www.gob.mx/profeco/es/archivo/articulos',
      publisher: 'Procuraduría Federal del Consumidor',
    },
    {
      name: 'COFEPRIS — buenas prácticas de higiene en la preparación de alimentos',
      url: 'https://www.gob.mx/cofepris',
      publisher: 'COFEPRIS',
    },
  ],

  replaces: [
    '/calculadora-bebidas-por-invitado-evento-mexico',
    '/calculadora-carne-asado-kg-por-persona-mexico',
    '/calculadora-presupuesto-fiesta-noche-mexicana-15-septiembre',
    '/calculadora-cuanto-falta-grito-independencia-mexico',
    '/calculadora-de-propinas-mexico',
    '/conversor-tazas-a-gramos-cocina-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
