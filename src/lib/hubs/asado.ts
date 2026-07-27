import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta carne compro para el asado?"
 * Arquetipo: RAMIFICADO (4 ramas). Absorbe 7 calculadoras sueltas (ver `replaces`).
 *
 * El resultado tiene que servir en el mostrador de la carnicería: kilos POR CORTE
 * y unidades de chorizo y morcilla, no un total abstracto. El total en kilos es el
 * titular, pero el desglose es la lista de compras.
 *
 * NÚMEROS: salen de las fórmulas que ya viven en el repo, no se inventan.
 *  - Raciones por adulto y por niño: `asado-kg-por-persona-cortes-tira-vacio-pollo.ts`
 *    (liviano 350/200 g, estándar 450/250 g, abundante 550/300 g de peso crudo).
 *  - Reparto por corte y embutidos (chorizo 100 g/u, morcilla 120 g/u, 60/40 entre
 *    chorizo y morcilla): misma fórmula.
 *  - Pan 80 g por adulto + 40 g por niño, carbón ~1 kg por kg de carne con mínimo
 *    de 3 kg: misma fórmula (bloque del planificador integral).
 *  - Chorizo como plato principal (3,5 por adulto) y como previa (1,5): factores de
 *    `chorizos-por-invitado-asado.ts`, con el 10% de colchón.
 *  - Pollo 300 g por adulto en presas y 350 g el pollo entero (~1,8 kg por pollo):
 *    `pollo-por-persona.ts`.
 *  - Hamburguesas 2 por adulto y 1,5 por niño con +15% de margen y medallón de
 *    120 g: `cantidad-hamburguesas-parrilla-cumpleanos.ts`.
 *  - Milanesas 2 por adulto y 1 por niño, 120 g de carne cada una:
 *    `milanesas-por-persona.ts`.
 *  - Quien come poco cuenta como 60% de una ración de adulto, el mismo criterio de
 *    "guarnición" de `pollo-por-persona.ts`.
 *
 * NOTA DE CONTRATO (no toco archivos compartidos): el override de `format` por fila
 * pisa la base con `undefined`, así que CADA fila declara su `format`/`unit`
 * explícito. Kilos y unidades van en `unit`; sólo el presupuesto es `ars`.
 */

/** Ración de peso crudo (g) a la parrilla por comensal, según la rama. */
export const RACIONES: Record<string, { adulto: number; nino: number; etiqueta: string }> = {
  clasico: { adulto: 450, nino: 250, etiqueta: 'estándar' },
  chicos: { adulto: 450, nino: 250, etiqueta: 'estándar, con reparto pensado para los chicos' },
  achuras: { adulto: 350, nino: 200, etiqueta: 'liviano: sólo achuras y embutidos' },
  libre: { adulto: 550, nino: 300, etiqueta: 'abundante: parrilla libre' },
};

/**
 * Reparto del peso total por corte, según la rama. Suman 1 cuando están todos
 * los rubros activos; si se apaga pollo o achuras se renormaliza.
 */
export const REPARTO: Record<string, { tira: number; vacio: number; pollo: number; embutidos: number; achuras: number }> = {
  clasico: { tira: 0.25, vacio: 0.20, pollo: 0.25, embutidos: 0.10, achuras: 0.20 },
  chicos: { tira: 0.20, vacio: 0.15, pollo: 0.35, embutidos: 0.15, achuras: 0.15 },
  achuras: { tira: 0, vacio: 0, pollo: 0.10, embutidos: 0.45, achuras: 0.45 },
  libre: { tira: 0.30, vacio: 0.25, pollo: 0.20, embutidos: 0.10, achuras: 0.15 },
};

/** Pesos unitarios crudos de los embutidos (g). */
export const PESO_CHORIZO_G = 100;
export const PESO_MORCILLA_G = 120;
/** Del peso de embutidos, 60% chorizo y 40% morcilla. */
export const SPLIT_CHORIZO = 0.6;
/** Quien "come poco" cuenta como esta fracción de una ración de adulto. */
export const FACTOR_COME_POCO = 0.6;

export const hub: HubData = {
  slug: 'eventos/asado',
  title: '¿Cuánta carne compro para el asado? Kilos por corte y chorizos por invitado',
  description:
    'Cuántos kilos de carne comprar para el asado según los invitados: tira, vacío, pollo, chorizos, morcillas y achuras, con la lista para la carnicería. Contempla chicos, los que comen poco y la parrilla libre.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Guía para organizar el asado',
  h1: '¿Cuánta carne compro para el asado?',
  lede:
    'La referencia rioplatense es medio kilo de carne cruda por adulto, pero lo que necesitás en la carnicería no es un total: es cuántos kilos de cada corte y cuántos chorizos. Partimos del asado clásico y lo ajustás si van muchos chicos, si es sólo picada de achuras y chorizos o si es parrilla libre.',
  stamps: [
    'Actualizado 27-07-2026',
    'Raciones de 350 a 550 g por adulto',
    '7 calculadoras adentro',
    'Lista lista para la carnicería',
  ],

  resultLabel: 'Carne a comprar (peso crudo)',

  cases: {
    title: '¿Qué asado estás organizando?',
    intro:
      'Cambia la ración por persona y, sobre todo, el reparto entre cortes. Los mismos invitados dan listas de compra distintas según el caso.',
    items: [
      {
        id: 'clasico',
        label: 'Asado clásico',
        hint: 'El caso más común · 450 g por adulto',
        answer: 'Para un asado clásico se calculan 450 g de carne cruda por adulto y 250 g por chico.',
        yes: [
          'Ración estándar: 450 g de peso crudo por adulto y 250 g por chico',
          'Reparto clásico: 25% tira de asado, 20% vacío, 25% pollo, 20% achuras y 10% embutidos',
          'Chorizos y morcillas convertidos a unidades (100 g el chorizo, 120 g la morcilla)',
          'Pan, carbón y, si cargás el precio del kilo, el presupuesto de la carne',
        ],
        warn: [
          'Los gramos son de peso CRUDO en la carnicería: la carne pierde entre 25% y 35% en la parrilla',
          'Si hay muchas guarniciones, ensaladas o una picada larga antes, la carne rinde bastante más de lo calculado',
          'El hueso cuenta: en la tira de asado buena parte del kilo es costilla, no carne',
        ],
        plazo: 'encargá los cortes en la carnicería 2 o 3 días antes; en fin de semana largo, una semana.',
      },
      {
        id: 'chicos',
        label: 'Van muchos chicos',
        hint: 'Más pollo y chorizo, menos vacío',
        answer: 'Los chicos comen alrededor de la mitad que un adulto y comen sobre todo pollo y chorizo.',
        yes: [
          'Misma ración por adulto, 250 g por chico',
          'Reparto corrido hacia lo que comen los chicos: 35% pollo y 15% embutidos, menos vacío',
          'Los chorizos alcanzan también para choripán, que es lo primero que sale',
          'Pan calculado aparte, que con chicos se va rápido',
        ],
        warn: [
          'Los menores de 4 o 5 años en la práctica casi no comen carne: contalos aparte o directamente no los sumes',
          'Conviene tener el pollo listo temprano: los chicos comen antes que los grandes',
          'Vigilá los huesos y el hueso de la tira con los más chicos',
        ],
        plazo: 'poné el pollo y los chorizos primero: los chicos comen entre 30 y 45 minutos antes que la mesa.',
      },
      {
        id: 'achuras',
        label: 'Sólo achuras y chorizos',
        hint: 'Picada de parrilla · 350 g por adulto',
        answer: 'Sin cortes de carne roja alcanza con 350 g por adulto entre achuras y embutidos.',
        yes: [
          'Ración liviana: 350 g por adulto y 200 g por chico',
          'Reparto sin tira ni vacío: 45% achuras, 45% embutidos y 10% pollo',
          'Chorizos y morcillas convertidos a unidades, más el pan del choripán',
          'Si el chorizo es el plato principal, la referencia sube a 3 o 4 por adulto',
        ],
        warn: [
          'La achura no se guarda: comprala el mismo día y mantenela en frío hasta la parrilla',
          'Chinchulín y mollejas tardan mucho más que el chorizo: si van juntos, arrancan primero',
          'Es una comida pesada: sumá ensalada y agua aunque no estén en la cuenta de la carne',
        ],
        plazo: 'la achura se compra el mismo día del asado, no antes.',
      },
      {
        id: 'libre',
        label: 'Parrilla libre / mucha hambre',
        hint: '550 g por adulto y repetición asegurada',
        answer: 'Para parrilla libre o comensales de mucho comer se calculan 550 g de carne cruda por adulto.',
        yes: [
          'Ración abundante: 550 g por adulto y 300 g por chico',
          'Reparto cargado a los cortes: 30% tira, 25% vacío y 20% pollo',
          'Pensado para que haya segunda vuelta y sobre algo',
          'Carbón recalculado sobre el total, que con más carne la parrilla va más tiempo',
        ],
        warn: [
          'Con esta ración lo esperable es que sobre: prevé cómo guardar y enfriar lo que quede',
          'Más kilos es más tiempo de parrilla: calculá el carbón y el horario de encendido con margen',
          'La carne cocida se guarda en heladera hasta 3 días; enfriala dentro de las 2 horas',
        ],
        plazo: 'con más de 8 kg a la parrilla, prendé el fuego al menos 90 minutos antes de servir.',
      },
    ],
  },

  inputsTitle: 'Contá quiénes van',
  inputsIntro:
    'Con adultos y chicos ya sale la lista. Marcá aparte a los que comen poco y cargá el precio del kilo si querés el presupuesto.',
  fields: [
    { id: 'adultos', label: 'Adultos', type: 'number', min: 0, max: 200, step: 1, value: 8 },
    { id: 'ninos', label: 'Chicos (hasta 12 años)', type: 'number', min: 0, max: 200, step: 1, value: 3 },
    {
      id: 'comenPoco',
      label: 'De esos adultos, cuántos comen poco',
      type: 'number',
      min: 0,
      max: 200,
      step: 1,
      value: 2,
      help: 'Cuentan como el 60% de una ración de adulto.',
    },
    {
      id: 'incluirPollo',
      label: '¿Va pollo a la parrilla?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'incluirAchuras',
      label: '¿Van achuras?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'precioKg',
      label: 'Precio del kilo de carne (opcional)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Si lo cargás, se estima el presupuesto y el costo por persona.',
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria. Los gramos son de peso crudo en la carnicería y el precio del kilo lo ponés vos: no estimamos precios de carne.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparten los kilos',
    caption:
      'El anillo muestra cómo se divide el peso total que va a la parrilla entre tira de asado, vacío, pollo, chorizos, morcillas y achuras. Es, literalmente, la lista de la carnicería: cada porción del anillo es un pedido distinto en el mostrador.',
  },
  breakdownTitle: 'Tu lista para la carnicería',
  breakdownIntro:
    'Las barras comparan cada rubro con el más grande. Los cortes van en kilos de peso crudo y los embutidos en unidades; el presupuesto es lo único en pesos.',

  faq: [
    {
      q: '¿Cuántos kilos de carne por persona para un asado?',
      a: 'La referencia estándar en Argentina es de 450 g de carne cruda por adulto y 250 g por chico, contando todo lo que va a la parrilla: cortes, pollo, achuras y embutidos. Para un asado liviano o con muchas guarniciones alcanza con 350 g, y para parrilla libre o gente de mucho comer conviene calcular 550 g.',
    },
    {
      q: '¿Cuántos chorizos por invitado hay que comprar?',
      a: 'Depende del rol del chorizo. Como previa o entrada, 1 o 1,5 por adulto; como acompañamiento del asado, entre 0,75 y 1; y si el choripán es el plato principal, entre 3 y 4 por adulto. Los chicos comen alrededor del 40% de lo que come un adulto. Sumá siempre un 10% de colchón y un pan por chorizo, más un 15% extra de pan.',
    },
    {
      q: '¿Cómo reparto los kilos entre los distintos cortes?',
      a: 'Un reparto clásico es 25% tira de asado, 20% vacío, 25% pollo, 20% achuras y 10% embutidos. Si no va pollo o no van achuras, ese porcentaje se reparte entre la tira y el vacío. Con muchos chicos conviene correr el reparto hacia el pollo y el chorizo, que es lo que comen.',
    },
    {
      q: '¿Cuánto pollo se calcula por persona en la parrilla?',
      a: 'Unos 300 g por adulto en presas o 350 g si es pollo entero (un pollo entero pesa alrededor de 1,8 kg y rinde unas 8 presas). Si el pollo es guarnición del asado y no el plato principal, alcanza con el 60% de esa cantidad. Los chicos comen aproximadamente el 60% de la ración de un adulto.',
    },
    {
      q: '¿Cuántas hamburguesas por persona en una parrilla de cumpleaños?',
      a: 'Si las hamburguesas son el plato principal, 2 por adulto y 1,5 por chico; si comparten mesa con asado o chorizos, 1,5 y 1; y si son lo único que hay, 2,5 y 2. Sumá un 15% de margen por los invitados de último momento y los medallones que se pierden en la parrilla. Con medallones de 120 g, cada 8 hamburguesas es alrededor de 1 kg de carne picada.',
    },
    {
      q: '¿Cuántas milanesas por persona si no hago asado?',
      a: 'Dos por adulto con apetito normal, tres si es abundante, y una por chico. Cada milanesa lleva alrededor de 120 g de carne o pollo, unos 30 g de pan rallado y un huevo cada cuatro milanesas. Para 8 adultos y 3 chicos son 19 milanesas, unos 2,25 kg de carne.',
    },
    {
      q: '¿Cuánto carbón necesito para el asado?',
      a: 'La regla práctica es un kilo de carbón por cada kilo de carne, con un mínimo de 3 kg aunque sean pocos. Si usás leña, calculá aproximadamente el doble en peso. Para más de 8 kg de carne conviene prender el fuego 90 minutos antes de la hora de servir, para tener brasa suficiente y una segunda tanda.',
    },
    {
      q: '¿Los chicos comen lo mismo que un adulto?',
      a: 'No. La referencia es alrededor de la mitad: 250 g de carne cruda contra 450 g de un adulto. Los menores de 4 o 5 años en la práctica comen mucho menos que eso, así que conviene no sumarlos a la cuenta o contarlos como medio chico. Y comen antes, sobre todo pollo y chorizo.',
    },
    {
      q: '¿Cuánto pierde la carne al cocinarse?',
      a: 'Entre un 25% y un 35% del peso, según el corte y el punto de cocción. Por eso todas las cuentas se hacen en peso crudo, que es como se compra en la carnicería. En cortes con hueso como la tira de asado, además, buena parte del kilo es hueso y no carne.',
    },
    {
      q: '¿Cuánta ensalada, pan y bebida calculo?',
      a: 'Como referencia, 80 g de pan por adulto y 40 g por chico, 150 g de ensalada por adulto y 80 g por chico, y una provoleta cada cuatro comensales. En bebida, alrededor de 1 litro con alcohol por adulto en un asado largo, medio litro de bebida sin alcohol por persona y otro medio litro de agua, más medio kilo de hielo por persona.',
    },
  ],

  sources: [
    {
      name: 'Tabla de composición y rendimiento de cortes vacunos argentinos',
      url: 'https://www.ipcva.com.ar/cortes/',
      publisher: 'Instituto de Promoción de la Carne Vacuna Argentina (IPCVA)',
    },
    {
      name: 'Consumo aparente de carnes por habitante (referencia de porciones)',
      url: 'https://www.magyp.gob.ar/sitio/areas/bovinos/estadistica/',
      publisher: 'Secretaría de Agricultura, Ganadería y Pesca',
    },
    {
      name: 'Guías Alimentarias para la Población Argentina — tamaño de porción de carnes',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable/guias-alimentarias',
      publisher: 'Ministerio de Salud de la Nación',
    },
    {
      name: 'Manipulación segura de carnes: cadena de frío, cocción y conservación de sobras',
      url: 'https://www.argentina.gob.ar/anmat/inspeccion-vigilancia/alimentos',
      publisher: 'ANMAT',
    },
  ],

  replaces: [
    '/calculadora-carne-asado-kg-por-persona',
    '/calculadora-asado-por-invitado-kg-carne',
    '/calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo',
    '/calculadora-pollo-por-persona',
    '/calculadora-cantidad-hamburguesas-parrilla-cumpleanos',
    '/calculadora-chorizos-por-invitado-asado',
    '/calculadora-milanesas-por-persona',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
