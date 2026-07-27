import type { HubData } from './types';
import { pinturaM2 } from '../formulas/pintura-m2';
import { pinturaParedesHabitacionLitros } from '../formulas/pintura-paredes-habitacion-litros';
import { conversorLitrosPinturaPorMetroCuadrado } from '../formulas/conversor-litros-pintura-por-metro-cuadrado';
import { barnizAceiteM2Madera } from '../formulas/barniz-aceite-m2-madera';
import { pinturaRejasMetalLitros } from '../formulas/pintura-rejas-metal-litros';
import { m2ParedAberturas } from '../formulas/m2-pared-aberturas';

/**
 * Hub de decisión — "¿Cuántos litros de pintura necesito?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: paredes interiores (default),
 * frente o exterior, madera (barniz/aceite) y rejas o metal.
 *
 * IMPORTANTE — de dónde salen los rendimientos:
 * NINGUNO está escrito a mano. Todos se DERIVAN llamando a las fórmulas reales
 * del repo con superficies grandes (1.000 m²), para que los `Math.ceil` a lata
 * entera de las fórmulas no contaminen el valor unitario:
 *
 *   m²/L por mano de látex, esmalte, membrana…  → pintura-m2.ts
 *   m² de puerta y de ventana + margen del 10%  → pintura-paredes-habitacion-litros.ts
 *   rendimiento genérico de referencia (10 m²/L) → conversor-litros-pintura-por-metro-cuadrado.ts
 *   m²/L de barniz, aceite, laca, lasur y cera   → barniz-aceite-m2-madera.ts
 *   factor de metal por tipo de reja + 12 m²/L   → pintura-rejas-metal-litros.ts
 *   descuento de aberturas (m² netos)            → m2-pared-aberturas.ts
 *
 * Cuando alguien actualice esas fórmulas, este hub se actualiza solo.
 *
 * Lo que el hub agrega y ninguna calc suelta resuelve:
 *  1. el descuento de puertas y ventanas es un CAMPO del hub, no otra calculadora;
 *  2. el resultado principal está en LATAS de 4 y 20 L, que es lo que se compra
 *     en la pinturería, con el sobrante a la vista.
 */

/** Presentaciones reales de pinturería. El resultado se arma con estas dos. */
export const LATA_GRANDE_L = 20;
export const LATA_CHICA_L = 4;
/** Lata de 1 L: la presentación típica del esmalte para rejas. */
export const LATA_ESMALTE_L = 1;

/** m²/L por mano de cada producto, derivado de pintura-m2.ts. */
function rendimientoDe(tipo: string): number {
  const out = pinturaM2({ m2: 1000, manos: 1, tipo });
  return Math.round((1000 / out.litros) * 100) / 100;
}

/** Rendimiento genérico de referencia (m²/L por mano), desde el conversor. */
export const RENDIMIENTO_GENERICO = (() => {
  const out = conversorLitrosPinturaPorMetroCuadrado({ valor: 1000, direccion: 'ida' });
  const litros = Number(String(out.resultado).split(' ')[0]);
  return Math.round((1000 / litros) * 100) / 100;
})();

/**
 * Margen de compra y m² de cada abertura, derivados de la fórmula de habitación.
 * Se usa una habitación enorme para que el `Math.ceil` a litro entero no pese.
 */
const _sinAberturas = pinturaParedesHabitacionLitros({ largo: 1000, ancho: 1000, alto: 1, manos: 1, rendimiento: 10 });
const _conPuerta = pinturaParedesHabitacionLitros({ largo: 1000, ancho: 1000, alto: 1, manos: 1, rendimiento: 10, puertas: 1 });
const _conVentana = pinturaParedesHabitacionLitros({ largo: 1000, ancho: 1000, alto: 1, manos: 1, rendimiento: 10, ventanas: 1 });

/** m² que descuenta una puerta estándar, según la fórmula. */
export const M2_PUERTA = Math.round((_sinAberturas.superficieTotal - _conPuerta.superficieTotal) * 100) / 100;
/** m² que descuenta una ventana estándar, según la fórmula. */
export const M2_VENTANA = Math.round((_sinAberturas.superficieTotal - _conVentana.superficieTotal) * 100) / 100;
/** Margen por desperdicio y retoques que aplican las fórmulas del repo. */
export const MARGEN = Math.round((_sinAberturas.litrosNecesarios / ((_sinAberturas.superficieTotal * 1) / 10) - 1) * 100) / 100;

/** m²/L efectivo de cada producto de madera, por porosidad, desde su fórmula. */
function rendimientoMadera(producto: number, porosidad: number): number {
  const out = barnizAceiteM2Madera({ m2: 1000, producto, capas: 1, porosidad });
  const litros = Number(String(out.litros).replace(' L', ''));
  // litros = m2 * capas / rEfectivo * (1 + MARGEN)  →  rEfectivo = m2 * (1+MARGEN) / litros
  return Math.round((1000 * (1 + MARGEN)) / litros * 100) / 100;
}

/** Factor de superficie metálica real por tipo de reja, desde su fórmula. */
function factorReja(tipo: string): number {
  const out = pinturaRejasMetalLitros({ largo_reja_m: 1000, alto_m: 1, tipo_reja: tipo, manos: 1 });
  return Math.round((out.area_pintar / 1000) * 100) / 100;
}

/** m²/L del esmalte sintético para rejas, desde la fórmula de rejas. */
export const RENDIMIENTO_ESMALTE_REJA = (() => {
  const out = pinturaRejasMetalLitros({ largo_reja_m: 1000, alto_m: 1, tipo_reja: 'macizo', manos: 1 });
  return Math.round((out.area_pintar / out.pintura_litros) * 100) / 100;
})();

export const REJAS: Record<string, { label: string; factor: number }> = {
  barrotes: { label: 'Reja de barrotes', factor: factorReja('barrotes') },
  tejido: { label: 'Tejido romboidal o malla', factor: factorReja('tejido') },
  macizo: { label: 'Portón de chapa o superficie maciza', factor: factorReja('macizo') },
};

export const POROSIDAD: Record<string, { label: string; id: number }> = {
  baja: { label: 'Madera dura y cerrada (lapacho, incienso)', id: 1 },
  media: { label: 'Madera media (pino tratado, eucalipto)', id: 2 },
  alta: { label: 'Madera porosa o sin sellar (pino nuevo, deck viejo)', id: 3 },
};

/**
 * Catálogo de productos del hub.
 *  - `rend` es m²/L por mano (0 en madera: ahí manda `rendMadera`).
 *  - `familia` decide en qué rama aparece.
 */
export const PRODUCTOS: Record<
  string,
  {
    label: string;
    rend: number;
    familia: 'pared' | 'madera' | 'metal';
    rendMadera?: Record<string, number>;
  }
> = {
  latex_interior: { label: 'Látex interior', rend: rendimientoDe('latex_interior'), familia: 'pared' },
  latex_exterior: { label: 'Látex exterior / frente', rend: rendimientoDe('latex_exterior'), familia: 'pared' },
  fondo: { label: 'Fijador o fondo sellador', rend: rendimientoDe('fondo'), familia: 'pared' },
  antihumedad: { label: 'Pintura antihumedad', rend: rendimientoDe('antihumedad'), familia: 'pared' },
  impermeabilizante: { label: 'Impermeabilizante de muro', rend: rendimientoDe('impermeabilizante'), familia: 'pared' },
  membrana_liquida: { label: 'Membrana líquida (techos)', rend: rendimientoDe('membrana_liquida'), familia: 'pared' },
  esmalte_sintetico: { label: 'Esmalte sintético (aberturas y molduras)', rend: rendimientoDe('esmalte_sintetico'), familia: 'pared' },
  barniz_poliuretano: {
    label: 'Barniz poliuretánico',
    rend: 0,
    familia: 'madera',
    rendMadera: { baja: rendimientoMadera(1, 1), media: rendimientoMadera(1, 2), alta: rendimientoMadera(1, 3) },
  },
  aceite_lino: {
    label: 'Aceite de lino o tung',
    rend: 0,
    familia: 'madera',
    rendMadera: { baja: rendimientoMadera(2, 1), media: rendimientoMadera(2, 2), alta: rendimientoMadera(2, 3) },
  },
  laca_nitro: {
    label: 'Laca nitrocelulósica',
    rend: 0,
    familia: 'madera',
    rendMadera: { baja: rendimientoMadera(3, 1), media: rendimientoMadera(3, 2), alta: rendimientoMadera(3, 3) },
  },
  lasur: {
    label: 'Lasur / protector para exterior',
    rend: 0,
    familia: 'madera',
    rendMadera: { baja: rendimientoMadera(4, 1), media: rendimientoMadera(4, 2), alta: rendimientoMadera(4, 3) },
  },
  cera: {
    label: 'Cera para madera',
    rend: 0,
    familia: 'madera',
    rendMadera: { baja: rendimientoMadera(5, 1), media: rendimientoMadera(5, 2), alta: rendimientoMadera(5, 3) },
  },
  esmalte_reja: { label: 'Esmalte sintético para metal', rend: RENDIMIENTO_ESMALTE_REJA, familia: 'metal' },
  convertidor: { label: 'Convertidor de óxido (mano previa)', rend: RENDIMIENTO_ESMALTE_REJA, familia: 'metal' },
};

/** Producto por defecto de cada rama, si el elegido no pertenece a esa familia. */
export const PRODUCTO_POR_RAMA: Record<string, string> = {
  interior: 'latex_interior',
  exterior: 'latex_exterior',
  madera: 'barniz_poliuretano',
  metal: 'esmalte_reja',
};

/** Los rendimientos con decimales se muestran con coma: es-AR, nunca 12.5. */
const nAr = (v: number, d = 1) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

const REND_INT = nAr(PRODUCTOS.latex_interior.rend);
const REND_EXT = nAr(PRODUCTOS.latex_exterior.rend);
const REND_ESM = nAr(PRODUCTOS.esmalte_sintetico.rend);
const REND_BARNIZ = nAr(PRODUCTOS.barniz_poliuretano.rendMadera!.media);
const MARGEN_PCT = Math.round(MARGEN * 100);

/** Sanity check del descuento de aberturas contra su propia fórmula. */
export const ABERTURAS_DEMO = m2ParedAberturas({
  largoPared: 12,
  altoPared: 2.6,
  puertaAncho: 0.9,
  puertaAlto: 2,
  puertaCantidad: 1,
  ventanaAncho: 1.2,
  ventanaAlto: 1.1,
  ventanaCantidad: 2,
});

export const hub: HubData = {
  slug: 'construccion/pintura',
  title: '¿Cuántos litros de pintura necesito? Calculadora de latas 2026',
  description:
    'Calculá cuántos litros de pintura necesitás y, sobre todo, cuántas latas de 4 y 20 L tenés que comprar. Paredes interiores, frente, madera y rejas, con el descuento de puertas y ventanas ya incluido.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Cómputo de materiales',
  h1: '¿Cuántos litros de pintura necesito?',
  lede:
    'Poné las medidas, cuántas puertas y ventanas hay y cuántas manos vas a dar: te devolvemos las latas de 4 y 20 litros que tenés que pedir en la pinturería, con el sobrante a la vista.',
  stamps: [
    'Actualizado 27-07-2026',
    `Látex interior ${REND_INT} m²/L · exterior ${REND_EXT} m²/L`,
    `Margen de retoques ${MARGEN_PCT}% ya incluido`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Latas que tenés que comprar',

  cases: {
    title: '¿Qué vas a pintar?',
    intro: 'Partimos de las paredes interiores de una casa. Si lo tuyo es otra cosa, cambialo.',
    items: [
      {
        id: 'interior',
        label: 'Paredes interiores',
        hint: 'El caso más común',
        answer: `Un litro de látex interior cubre ${REND_INT} m² por mano, así que una habitación típica se resuelve con dos o tres latas de ${LATA_CHICA_L} L.`,
        yes: [
          `Látex interior: ${REND_INT} m² por litro y por mano`,
          'El perímetro por la altura, menos los m² de puertas y ventanas',
          `Dos manos por defecto, más un ${MARGEN_PCT}% de margen para retoques`,
          `La compra armada en latas de ${LATA_GRANDE_L} L y de ${LATA_CHICA_L} L, con el sobrante calculado`,
          'El techo, si lo marcás, se suma como superficie aparte',
        ],
        warn: [
          `Si pasás de un color oscuro a uno claro vas a necesitar tres manos, no dos: cargá 3 en el campo de manos`,
          'Sobre pared nueva o muy porosa va primero una mano de fijador, que se calcula aparte cambiando el producto',
          'El rendimiento de la lata es el de la ficha técnica: con rodillo de pelo largo y pared áspera cae hasta un 20%',
          'No descuentes los vanos chicos, de menos de 1 m²: lo que ahorrás se te va en los cortes alrededor',
        ],
        plazo:
          'entre mano y mano dejá 4 horas de secado al tacto y 24 horas antes de mover muebles contra la pared.',
      },
      {
        id: 'exterior',
        label: 'Frente, medianera o exterior',
        hint: 'Látex exterior, impermeabilizante o membrana',
        answer: `El látex exterior rinde ${REND_EXT} m² por litro y por mano, menos que el interior porque la pared de afuera es más rugosa y absorbe más.`,
        yes: [
          `Látex exterior: ${REND_EXT} m² por litro y por mano`,
          `Impermeabilizante de muro: ${nAr(PRODUCTOS.impermeabilizante.rend)} m²/L, es mucho más espeso`,
          `Membrana líquida para techos: ${nAr(PRODUCTOS.membrana_liquida.rend)} m²/L, el producto que más se consume de todos`,
          `Pintura antihumedad: ${nAr(PRODUCTOS.antihumedad.rend)} m²/L`,
          'Los m² son de cara vista del frente, descontando aberturas',
        ],
        warn: [
          'En exterior las dos manos NO son opcionales: la primera se la come el revoque',
          'La membrana líquida se aplica en tres manos cruzadas y con malla en las juntas: multiplicá por tres, no por dos',
          'Sobre frente descascarado hay que raspar y dar fijador antes; ese fijador es material extra',
          'Si el frente da al sur y junta verdín, lavá con lavandina diluida y dejá secar 48 horas o la pintura no agarra',
        ],
        plazo:
          'no pintes exterior con pronóstico de lluvia dentro de las 24 horas ni con menos de 10 °C: la película no cura y se lava.',
      },
      {
        id: 'madera',
        label: 'Madera: barniz, aceite o lasur',
        hint: 'Deck, muebles, aberturas',
        answer: `El barniz poliuretánico sobre madera de porosidad media rinde alrededor de ${REND_BARNIZ} m² por litro y por capa.`,
        yes: [
          `Barniz poliuretánico: ${REND_BARNIZ} m²/L por capa en madera media`,
          `Aceite de lino o tung: ${nAr(PRODUCTOS.aceite_lino.rendMadera!.media)} m²/L`,
          `Lasur para exterior: ${nAr(PRODUCTOS.lasur.rendMadera!.media)} m²/L · cera: ${nAr(PRODUCTOS.cera.rendMadera!.media)} m²/L`,
          'La porosidad de la madera ajusta el consumo: la porosa chupa hasta un 20% más',
          'Tres capas es lo normal en barniz; el aceite se da hasta que deje de absorber',
        ],
        warn: [
          'La primera capa sobre madera cruda se absorbe casi entera: no la cuentes como capa de terminación',
          'Lijá 180 y después 240 antes de la primera capa, y 280 suave entre capas',
          'El deck a la intemperie se renueva cada 12 a 18 meses: calculá el material como gasto recurrente',
          'La cera no es impermeable: no la uses en mesada, baño ni exterior',
        ],
        plazo:
          'el barniz poliuretánico necesita unas 6 horas entre capas y el aceite hasta 18; apurarlo deja la superficie pegajosa por semanas.',
      },
      {
        id: 'metal',
        label: 'Rejas, portones y metal',
        hint: 'Esmalte sintético',
        answer: `Una reja tiene mucha más superficie de metal que su frente aparente: el factor va de ${nAr(REJAS.barrotes.factor, 2)} en barrotes a ${nAr(REJAS.tejido.factor, 2)} en tejido romboidal.`,
        yes: [
          `Superficie real de metal = frente × factor del tipo de reja (barrotes ${nAr(REJAS.barrotes.factor, 2)}, tejido ${nAr(REJAS.tejido.factor, 2)}, chapa ${nAr(REJAS.macizo.factor, 2)})`,
          `Esmalte sintético: ${nAr(RENDIMIENTO_ESMALTE_REJA)} m² por litro y por mano`,
          `La equivalencia en latas de ${LATA_ESMALTE_L} L, que es como se vende el esmalte`,
          'El convertidor de óxido, si la reja está oxidada, se calcula como una mano más',
        ],
        warn: [
          'La reja se pinta de los dos lados: el factor ya lo contempla, no dupliques la superficie a mano',
          'Sobre óxido suelto no pinta nada: cepillo de acero primero y convertidor de óxido después',
          'El esmalte al agua seca más rápido pero rinde menos que el sintético: pedí la ficha técnica',
          'Con sol directo el esmalte forma piel antes de nivelar y queda marcado el pincel: pintá temprano o al atardecer',
        ],
        plazo:
          'el esmalte sintético seca al tacto en 6 horas pero cura recién a los 7 días: no apoyes ni frotes la reja hasta entonces.',
      },
    ],
  },

  inputsTitle: 'Medí lo que vas a pintar',
  inputsIntro:
    'En una habitación entera el largo es el perímetro: sumá los cuatro lados. En una pared sola, el largo de esa pared. En madera y metal usá el largo y el alto de la pieza.',
  fields: [
    {
      id: 'largo',
      label: 'Largo o perímetro a pintar (m)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 14,
      help: 'Habitación de 4 × 3 m = perímetro de 14 m.',
    },
    { id: 'alto', label: 'Altura (m)', type: 'number', min: 0, step: 0.1, value: 2.6 },
    { id: 'puertas', label: 'Puertas a descontar', type: 'number', min: 0, max: 50, value: 1 },
    { id: 'ventanas', label: 'Ventanas a descontar', type: 'number', min: 0, max: 50, value: 2 },
    {
      id: 'extra',
      label: 'Otros m² a descontar (placard, azulejos)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 0,
    },
    {
      id: 'techo',
      label: '¿Pintás también el techo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, sólo paredes' },
        { value: 'si', label: 'Sí, sumar el techo' },
      ],
    },
    { id: 'techoM2', label: 'm² del techo (si lo pintás)', type: 'number', min: 0, step: 0.1, value: 12 },
    {
      id: 'producto',
      label: 'Producto',
      type: 'select',
      value: 'latex_interior',
      options: Object.entries(PRODUCTOS).map(([value, p]) => ({ value, label: p.label })),
    },
    {
      id: 'porosidad',
      label: 'Porosidad de la madera (sólo madera)',
      type: 'select',
      value: 'media',
      options: Object.entries(POROSIDAD).map(([value, p]) => ({ value, label: p.label })),
    },
    {
      id: 'reja',
      label: 'Tipo de reja (sólo metal)',
      type: 'select',
      value: 'barrotes',
      options: Object.entries(REJAS).map(([value, r]) => ({ value, label: r.label })),
    },
    { id: 'manos', label: 'Manos o capas', type: 'number', min: 1, max: 6, value: 2 },
    {
      id: 'precioLitro',
      label: 'Precio del litro de pintura ($)',
      type: 'number',
      min: 0,
      value: 9500,
      thousands: true,
      help: 'Cambialo por el precio real de tu pinturería: el costo se recalcula.',
    },
  ],
  fineprint:
    `Es un cómputo de material, no un presupuesto: no incluye enduido, fijador, cintas, rodillos ni mano de obra. Los rendimientos son los de ficha técnica y ya llevan un ${MARGEN_PCT}% de margen por desperdicio y retoques. El costo es una referencia con el precio que cargues vos.`,

  chart: {
    type: 'bars',
    title: 'Litros por mano y latas a comprar',
    caption:
      `Cada barra es un renglón de la compra: los litros que consume cada mano, el total con el ${MARGEN_PCT}% de margen y, abajo, en cuántas latas de ${LATA_GRANDE_L} y de ${LATA_CHICA_L} litros se traduce eso en la pinturería. Lo que llevás a la góndola son latas, no litros.`,
  },
  breakdownTitle: 'Tu pedido a la pinturería',
  breakdownIntro: 'Las barras comparan cada renglón con el más grande. Lo que importa son las dos filas de latas.',

  faq: [
    {
      q: '¿Cuántos m² cubre un litro de pintura?',
      a: `Depende del producto y de cuántas manos des. El látex interior rinde <b>${REND_INT} m² por litro y por mano</b>; el látex exterior baja a ${REND_EXT} m²/L porque la pared de afuera es más rugosa; el esmalte sintético llega a ${REND_ESM} m²/L. En el otro extremo están los productos espesos: la membrana líquida rinde apenas ${nAr(PRODUCTOS.membrana_liquida.rend)} m²/L y el impermeabilizante de muro ${nAr(PRODUCTOS.impermeabilizante.rend)} m²/L. Como referencia rápida de mostrador se usa ${nAr(RENDIMIENTO_GENERICO)} m²/L por mano.`,
    },
    {
      q: '¿Cuántas latas de pintura compro: de 4 o de 20 litros?',
      a: `La regla práctica es llenar primero con latas de ${LATA_GRANDE_L} L y completar con latas de ${LATA_CHICA_L} L, salvo que hagan falta cinco o más latas chicas: ahí conviene una lata grande más, porque el litro sale bastante menos y te queda margen para retoques. El hub hace esa cuenta solo y te muestra cuántos litros te sobran, que es el dato que nadie calcula y termina en el fondo del lavadero.`,
    },
    {
      q: '¿Cómo descuento las puertas y las ventanas al calcular la pintura?',
      a: `Se restan los m² del vano de la superficie de pared. Una puerta estándar ocupa <b>${M2_PUERTA} m²</b> y una ventana promedio <b>${M2_VENTANA} m²</b>. En una habitación de 12 m de perímetro y 2,6 m de altura con una puerta y dos ventanas, la pared bruta es de ${ABERTURAS_DEMO.m2Bruto} m² y quedan ${ABERTURAS_DEMO.m2Neto} m² netos: las aberturas se comen el ${nAr(ABERTURAS_DEMO.porcentajeAberturas)}%. Ojo con los vanos de menos de 1 m²: no los descuentes, porque el material que ahorrás se te va en los cortes alrededor del marco.`,
    },
    {
      q: '¿Cuántas manos de pintura hay que dar?',
      a: 'Dos es el estándar sobre pared ya pintada del mismo tono. Van tres cuando cambiás de oscuro a claro, cuando pintás sobre revoque nuevo o cuando el color es muy saturado (rojos, amarillos y azules intensos cubren peor porque el pigmento tiñe menos). En exterior las dos manos no son negociables: la primera se la absorbe el revoque. En madera, tres capas de barniz es lo normal y la primera prácticamente no cuenta como terminación.',
    },
    {
      q: '¿Cuánta pintura necesito para una habitación de 4 por 3 metros?',
      a: `El perímetro es (4 + 3) × 2 = 14 m; por 2,6 m de altura da 36,4 m² brutos. Descontando una puerta (${M2_PUERTA} m²) y dos ventanas (${M2_VENTANA * 2} m²) quedan unos ${nAr(36.4 - M2_PUERTA - M2_VENTANA * 2)} m² netos. Con dos manos de látex interior a ${REND_INT} m²/L eso son cerca de ${nAr((36.4 - M2_PUERTA - M2_VENTANA * 2) * 2 / PRODUCTOS.latex_interior.rend)} litros; con el ${MARGEN_PCT}% de margen te conviene una lata de ${LATA_CHICA_L} L más otra, o directamente pasarte a una de ${LATA_GRANDE_L} L si vas a pintar también el techo o el pasillo.`,
    },
    {
      q: '¿Cuánto barniz lleva un deck o un mueble de madera?',
      a: `El barniz poliuretánico rinde ${REND_BARNIZ} m² por litro y por capa en madera de porosidad media, y baja a ${nAr(PRODUCTOS.barniz_poliuretano.rendMadera!.alta)} m²/L en madera porosa o sin sellar. El aceite de lino o tung rinde ${nAr(PRODUCTOS.aceite_lino.rendMadera!.media)} m²/L, el lasur ${nAr(PRODUCTOS.lasur.rendMadera!.media)} y la cera ${nAr(PRODUCTOS.cera.rendMadera!.media)}, que es la que más rinde porque va en capa finísima. Contá tres capas para barniz y dejá 6 horas de secado entre cada una.`,
    },
    {
      q: '¿Cuánta pintura lleva una reja? ¿Cuento el frente o el metal?',
      a: `El metal, siempre. Una reja tiene mucha más superficie que su frente aparente porque cada barrote tiene cuatro caras. El factor que corrige eso es de <b>${nAr(REJAS.barrotes.factor, 2)}</b> para reja de barrotes, <b>${nAr(REJAS.tejido.factor, 2)}</b> para tejido romboidal (que es el peor: la malla multiplica el desarrollo) y <b>${nAr(REJAS.macizo.factor, 2)}</b> para portón de chapa. Después se aplica el rendimiento del esmalte sintético, ${nAr(RENDIMIENTO_ESMALTE_REJA)} m²/L. Por eso una reja de 3 × 2 m parece 6 m² y en realidad son casi 10 m² de metal a cubrir.`,
    },
    {
      q: '¿Cuánto margen de pintura de más conviene comprar?',
      a: `Un ${MARGEN_PCT}%, que es lo que ya viene sumado en el resultado. No es capricho: entre lo que queda en el rodillo, lo que se derrama, los retoques a la semana y el hecho de que el rendimiento de ficha técnica se mide sobre superficie lisa y sellada, el consumo real siempre supera al teórico. Además guardá el sobrante bien cerrado: si tenés que volver a comprar dentro de seis meses, el lote nuevo puede no dar exactamente el mismo tono.`,
    },
    {
      q: '¿El fijador o sellador se cuenta aparte?',
      a: `Sí, es otro producto y otro cálculo. El fijador rinde ${nAr(PRODUCTOS.fondo.rend)} m²/L y va en una sola mano sobre pared nueva, muy porosa o muy reparada con enduido. Calculalo cambiando el producto a "Fijador o fondo sellador" y poniendo 1 mano: te va a dar sus propias latas. Saltearlo es la causa número uno de que la pintura de terminación rinda la mitad de lo que dice la lata.`,
    },
    {
      q: '¿Pintar el techo se calcula igual que las paredes?',
      a: 'Los metros se calculan distinto —el techo es largo por ancho de la habitación, no perímetro por altura— pero el rendimiento del látex es el mismo. Lo que cambia es el consumo real: pintando hacia arriba se pierde más producto por goteo y el rodillo carga más, así que sumale un poco de margen extra. Por eso el techo es un campo aparte en este hub: lo cargás en m² directos y se suma a la superficie total.',
    },
    {
      q: '¿Cuánto sale pintar una habitación?',
      a: 'El material es la parte chica: entre dos y cuatro latas de látex interior para un dormitorio estándar. Lo que mueve la aguja es la mano de obra, que en pintura de interior se cotiza por m² de pared y suele multiplicar por dos o tres el costo del material. El costo que ves acá es sólo el producto, calculado con el precio por litro que cargues vos, así que actualizalo con lo que te cotiza tu pinturería y vas a tener el número de hoy.',
    },
    {
      q: '¿La pintura al agua y la sintética se calculan igual?',
      a: `La cuenta es la misma —superficie por manos dividido el rendimiento— pero los rendimientos son distintos: el esmalte sintético rinde ${REND_ESM} m²/L, más que el látex, porque se aplica en película más fina y nivela solo. Lo que sí cambia es todo lo demás: el sintético necesita aguarrás para limpiar, tarda mucho más en curar y no conviene en ambientes sin ventilación. Elegí el producto en el selector y el hub usa el rendimiento que corresponde.`,
    },
  ],

  sources: [
    {
      name: 'Norma IRAM 1109 — Pinturas para la construcción: métodos de ensayo y rendimiento',
      url: 'https://www.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'INTI — Programa de Pinturas y Recubrimientos, ensayos de poder cubritivo',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/quimica-y-materiales',
      publisher: 'INTI',
    },
    {
      name: 'Reglamento CIRSOC 101 — cargas y terminaciones en obra',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura/cirsoc',
      publisher: 'INTI · CIRSOC',
    },
    {
      name: 'Índice del Costo de la Construcción (ICC) — capítulo materiales',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-20',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Índice del Costo de la Construcción — Cámara Argentina de la Construcción',
      url: 'https://www.camarco.org.ar/',
      publisher: 'CAMARCO',
      date: 'publicación mensual',
    },
  ],

  replaces: [
    '/calculadora-pintura-paredes-habitacion-litros',
    '/calculadora-pintura-por-m2-litros-latas',
    '/calculadora-conversor-litros-pintura-por-metro-cuadrado',
    '/calculadora-barniz-aceite-m2-madera',
    '/calculadora-pintura-rejas-metal-litros',
    '/calculadora-m2-pared-descontando-aberturas-pintura',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
