import type { HubData } from './types';
import { cantidadPizzasPorInvitadosPizzeria } from '../formulas/cantidad-pizzas-por-invitados-pizzeria';
import { pizzaPorInvitadoPorciones } from '../formulas/pizza-por-invitado-porciones';
import { porcionesSushiPorPersonaPromedio } from '../formulas/porciones-sushi-por-persona-promedio';
import { compute as sushiEvento } from '../formulas/sushi-piezas-por-persona-evento-cumpleanos';
import { sushiPorInvitadoCena } from '../formulas/sushi-por-invitado-cena';
import { fiambreQuesoPorInvitadoPicada } from '../formulas/fiambre-queso-por-invitado-picada';
import { canapePorInvitadoCoctel } from '../formulas/canape-por-invitado-coctel';
import { sandwichesMigaPorPersona } from '../formulas/sandwiches-miga-por-persona';
import { compute as coffeeBreak } from '../formulas/bocadillos-por-invitado-evento-coffee-break';
import { porcionesTortaCumpleanosInvitadosTamano } from '../formulas/porciones-torta-cumpleanos-invitados-tamano';
import { porcionesTorta } from '../formulas/porciones-torta';
import { tortaPersonasKgPorciones } from '../formulas/torta-personas-kg-porciones';
import { compute as heladoEvento } from '../formulas/helado-litros-por-evento-invitados-tipos';
import { kilosChocolateCaseroBombonesReceta } from '../formulas/kilos-chocolate-casero-bombones-receta';
import { comidaParaInvitados } from '../formulas/comida-para-invitados';

/**
 * Hub de decisión — "¿Cuánta comida compro para la fiesta?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: cumpleaños en casa (default),
 * cóctel o casamiento, cumpleaños infantil y coffee break corporativo.
 *
 * Hermano de `bebidas-evento.ts`, y con el MISMO problema de fondo: sumar las
 * quince calculadoras sueltas para 50 invitados te hace comprar comida para
 * 200, porque cada una asume que TODOS los invitados comen eso. La misma
 * persona no come pizza Y sushi Y canapés Y sándwiches de miga.
 *
 * La solución es la misma que en bebidas y está declarada a la vista en
 * `REPARTO`: los invitados se reparten entre platos principales según el tipo
 * de evento, y cada porción se computa con SU fórmula, sin superponerse. Lo
 * que sí es para todos (la picada de la mesa, los canapés de la recepción, la
 * torta) se calcula sobre el total.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CONTRADICCIONES entre las calculadoras absorbidas, y cómo se resolvieron:
 *
 *  TORTA — dos métodos incompatibles para las porciones
 *    porciones-torta.ts .............. área ÷ 30 cm² por porción, Y multiplica
 *                                      por las capas (1→×1, 2→×1,3, 3→×1,5)
 *    porciones-torta-cumpleanos-* .... método Wilton: área ÷ 19,35 cm² (porción
 *                                      de fiesta), y dice EXPLÍCITAMENTE que la
 *                                      altura NO agrega porciones
 *    Un molde redondo de 22 cm da 16 porciones con el primero (2 capas) y 20
 *    con el segundo: 25% de diferencia, y con 1 sola capa la brecha llega al
 *    54% (13 contra 20).
 *    → El hub adopta WILTON (área ÷ footprint), porque es el estándar de la
 *      industria, está citado y es el único de los dos que separa porción de
 *      fiesta, de casamiento y de cumple infantil. Las capas suben los KILOS,
 *      no las porciones.
 *    torta-personas-kg-porciones.ts .. su campo `porciones` es siempre
 *      invitados × 1,1 (no depende del diámetro que ella misma sugiere), así
 *      que se usa sólo para los KILOS a encargar en la confitería.
 *
 *  SUSHI — tres calculadoras, tres números de piezas por adulto (principal)
 *    porciones-sushi-por-persona-promedio ......... 11 + 10% reserva = 12,1
 *    sushi-piezas-por-persona-evento-cumpleanos ... 10 (perfil mixto)
 *    sushi-por-invitado-cena ...................... 14 + 10% = 15,4
 *    54% de diferencia entre la más baja y la más alta.
 *    → El hub usa porciones-sushi-por-persona-promedio: es la única con
 *      referencias declaradas y la única que separa adultos de chicos.
 *
 *  PIZZA — dos calculadoras
 *    cantidad-pizzas-por-invitados-pizzeria ... 3 porciones/adulto y 2/niño de
 *                                              plato principal, +10% de margen
 *    pizza-por-invitado-porciones ............ 2,5 porciones/adulto con hambre
 *                                              normal, sin distinguir chicos
 *    → El hub usa la de pizzería (coincide además con comida-para-invitados,
 *      que también calcula 3 porciones por adulto).
 *
 *  PICADA — fiambre-queso-por-invitado-picada calcula 180 g de fiambre + 130 g
 *    de queso = 310 g por persona en modo "picada", mientras que
 *    comida-para-invitados usa 200 g de fiambres y quesos por adulto para lo
 *    mismo. → El hub respeta el rol elegido: en un cumpleaños la picada
 *    acompaña (rol 'previa'), no reemplaza a la comida.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Lo que el hub agrega y ninguna calc suelta resolvía:
 *  1. una sola lista con TODOS los renglones repartidos entre los invitados;
 *  2. las cantidades en lo que se compra de verdad: pizzas, rolls, planchas de
 *     miga, kilos de fiambrería, kilos de torta y su diámetro;
 *  3. la coherencia entre entrada, plato y postre, que es donde se dispara el
 *     gasto de una fiesta.
 */

/** Muestra grande: anula el efecto de los redondeos a envase entero. */
const N = 100000;
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const r2 = (x: number) => Math.round(x * 100) / 100;

/* ── Pizza ────────────────────────────────────────────────────────────── */

/**
 * Porciones de pizza por adulto y por chico, con el 10% de margen de la
 * fórmula YA incluido. Se pide `tamano_pizza: 1` para que "pizzas" salga en
 * porciones y el Math.ceil no contamine el valor unitario.
 */
function pizzaSlices(ocasion: string, quien: 'adultos' | 'ninos') {
  const o = cantidadPizzasPorInvitadosPizzeria({
    adultos: quien === 'adultos' ? N : 0,
    ninos: quien === 'ninos' ? N : 0,
    ocasion,
    tamano_pizza: 1,
  });
  return r3(Number(o.resultado) / N);
}
export const PIZZA_SLICES_ADULTO: Record<string, number> = {
  aperitivo: pizzaSlices('aperitivo', 'adultos'),
  principal: pizzaSlices('principal', 'adultos'),
  unico: pizzaSlices('unico', 'adultos'),
};
export const PIZZA_SLICES_NINO: Record<string, number> = {
  aperitivo: pizzaSlices('aperitivo', 'ninos'),
  principal: pizzaSlices('principal', 'ninos'),
  unico: pizzaSlices('unico', 'ninos'),
};

const _pizzaGrande = pizzaPorInvitadoPorciones({ invitados: N, hambre: 'bajo', tamano: 'grande' });
const _pizzaChica = pizzaPorInvitadoPorciones({ invitados: N, hambre: 'bajo', tamano: 'chica' });
/** Porciones que trae una pizza grande y una chica, desde la fórmula. */
export const PORCIONES_PIZZA_GRANDE = Math.round(_pizzaGrande.porcionesTotales / _pizzaGrande.pizzas);
export const PORCIONES_PIZZA_CHICA = Math.round(_pizzaChica.porcionesTotales / _pizzaChica.pizzas);

/* ── Sushi ────────────────────────────────────────────────────────────── */

function sushi(nivel: string) {
  const o = porcionesSushiPorPersonaPromedio({ personas: N, nivelHambre: nivel, ninos: 0 });
  const conNinos = porcionesSushiPorPersonaPromedio({ personas: N, nivelHambre: nivel, ninos: N });
  return {
    adulto: o.piezasPorAdulto,
    nino: conNinos.piezasPorNino,
    /** Reserva que suma la fórmula sobre la base. */
    reserva: r2(o.piezasTotales / (N * o.piezasPorAdulto)),
  };
}
export const SUSHI: Record<string, ReturnType<typeof sushi>> = {
  entrada: sushi('entrada'),
  principal: sushi('principal'),
  degustacion: sushi('degustacion'),
};
const _sushiRolls = porcionesSushiPorPersonaPromedio({ personas: N, nivelHambre: 'principal', ninos: 0 });
/** Piezas por roll, desde la fórmula. */
export const PIEZAS_POR_ROLL = Math.round(_sushiRolls.piezasTotales / _sushiRolls.rollsEquivalentes);

/** Las otras dos calculadoras de sushi, para poder mostrar el desacuerdo. */
export const SUSHI_ALTERNATIVAS = {
  eventoCumpleanos: sushiEvento({ invitados: N, rol: 'principal', perfil: 'mixto', incluye_extras: 'no' }).piezas_por_persona,
  cena: r2(sushiPorInvitadoCena({ invitados: N, rol: 'cena' }).piezasTotales / N),
};

/* ── Picada de fiambres y quesos ──────────────────────────────────────── */

function picada(rol: string) {
  const o = fiambreQuesoPorInvitadoPicada({ invitados: N, rol });
  return {
    fiambre: o.gramosFiambrePorPersona,
    queso: o.gramosQuesoPorPersona,
    aceitunas: Math.round((o.kgAceitunas * 1000) / N),
  };
}
export const PICADA: Record<string, ReturnType<typeof picada>> = {
  picada: picada('picada'),
  previa: picada('previa'),
  aperitivo: picada('aperitivo'),
};

/* ── Canapés ──────────────────────────────────────────────────────────── */

function canape(tipo: string, horas: number) {
  return canapePorInvitadoCoctel({ invitados: N, horas, tipoEvento: tipo }).canapesPorPersona;
}
/** Canapés por persona en un evento corto (hasta 2 h), desde la fórmula. */
export const CANAPES_PP: Record<string, number> = {
  coctel: canape('coctel', 2),
  coctelCena: canape('coctelCena', 2),
  aperitivo: canape('aperitivo', 2),
};
/**
 * Recargo que aplica la fórmula cuando el cóctel pasa las 2 horas.
 * Se deriva de `canapesTotales` y no de `canapesPorPersona`, porque este último
 * viene redondeado a un decimal y se comía el recargo (daba 1,14 en vez de 1,15).
 */
export const CANAPE_FACTOR_LARGO = r2(
  canapePorInvitadoCoctel({ invitados: N, horas: 3, tipoEvento: 'coctel' }).canapesTotales /
    canapePorInvitadoCoctel({ invitados: N, horas: 2, tipoEvento: 'coctel' }).canapesTotales
);
/** Variedades de canapé según el tamaño del evento, desde la fórmula. */
export const CANAPE_VARIEDADES: Array<{ desde: number; variedades: number }> = [10, 50, 100, 200].map((inv) => ({
  desde: inv,
  variedades: canapePorInvitadoCoctel({ invitados: inv, horas: 2, tipoEvento: 'coctel' }).variedades,
}));

/* ── Sándwiches de miga ───────────────────────────────────────────────── */

function migaPP(momento: string, quien: 'adultos' | 'ninos') {
  const o = sandwichesMigaPorPersona({
    adultos: quien === 'adultos' ? N : 0,
    ninos: quien === 'ninos' ? N : 0,
    momento,
  });
  return r3(o.sandwiches / N);
}
export const MIGA_ADULTO: Record<string, number> = {
  copetin_previa: migaPP('copetin_previa', 'adultos'),
  merienda: migaPP('merienda', 'adultos'),
  principal: migaPP('principal', 'adultos'),
};
export const MIGA_NINO: Record<string, number> = {
  copetin_previa: migaPP('copetin_previa', 'ninos'),
  merienda: migaPP('merienda', 'ninos'),
  principal: migaPP('principal', 'ninos'),
};
const _miga = sandwichesMigaPorPersona({ adultos: N, ninos: 0, momento: 'copetin_previa' });
/** Sándwiches por plancha de miga y por docena, desde la fórmula. */
export const MIGA_POR_PLANCHA = Math.round(_miga.sandwiches / _miga.planchas);
export const MIGA_POR_DOCENA = Math.round(_miga.sandwiches / _miga.docenas);

/* ── Coffee break ─────────────────────────────────────────────────────── */

function coffee(duracion: string, momento: string) {
  const o = coffeeBreak({ invitados: N, duracion, momento, incluirFrutas: 'si' });
  return {
    piezasPP: r3(o.bocadillosTotales / N),
    medialunasPP: r3(o.medialunas / N),
    sandwichesPP: r3(o.sandwiches / N),
    masasPP: r3(o.masasSecas / N),
    tortaPP: r3(o.tortaPorciones / N),
    cafeLPP: r3(o.cafeLitros / N),
    jugoLPP: r3(o.jugoLitros / N),
    frutasKgPP: r3(o.frutasKg / N),
  };
}
export const COFFEE: Record<string, ReturnType<typeof coffee>> = {
  corto_manana: coffee('corto', 'manana'),
  estandar_manana: coffee('estandar', 'manana'),
  extendido_manana: coffee('extendido', 'manana'),
  corto_tarde: coffee('corto', 'tarde'),
  estandar_tarde: coffee('estandar', 'tarde'),
  extendido_tarde: coffee('extendido', 'tarde'),
};

/* ── Torta ────────────────────────────────────────────────────────────── */

/**
 * Superficie que ocupa una porción, en cm², según el método Wilton de
 * porciones-torta-cumpleanos-invitados-tamano. Se mide sobre un molde
 * cuadrado enorme para que el Math.ceil no contamine.
 */
function footprint(portion: string) {
  const lado = 1000;
  const o = porcionesTortaCumpleanosInvitadosTamano({ shape: 'square', lado, portion });
  return r2((lado * lado) / Number(o.resultado));
}
export const PORCION_TORTA_CM2: Record<string, number> = {
  party: footprint('party'),
  wedding: footprint('wedding'),
  child: footprint('child'),
};

/** El método rival: porciones-torta.ts usa área ÷ 30 cm² y multiplica por capas. */
const _rival22 = porcionesTorta({ diametroMolde: 22, capas: '2' });
const _wilton22 = Number(porcionesTortaCumpleanosInvitadosTamano({ shape: 'round', diametro: 22, portion: 'party' }).resultado);
export const TORTA_22_RIVAL = _rival22.porcionesEstimadas;
export const TORTA_22_WILTON = _wilton22;

function tortaKg(tipoEvento: string) {
  const o = tortaPersonasKgPorciones({ invitados: N, tipoEvento });
  return {
    /** Gramos por porción que encarga la confitería. */
    gramos: Math.round((o.kgTorta * 1000) / o.porciones),
    /** Margen que suma la fórmula sobre los invitados. */
    margen: r2(o.porciones / N),
  };
}
export const TORTA: Record<string, ReturnType<typeof tortaKg>> = {
  evento: tortaKg('evento'),
  boda: tortaKg('boda'),
  infantil: tortaKg('infantil'),
};

/* ── Helado ───────────────────────────────────────────────────────────── */

function helado(rol: string, temperatura: string, ninos: string) {
  return heladoEvento({ invitados: N, rol, variedad: 'crema_y_agua', ninos, temperatura }).mlPorPersona;
}
/** Mililitros de helado por persona, por rol en el menú (clima templado). */
export const HELADO_ML_PP: Record<string, number> = {
  postre_principal: helado('postre_principal', 'templado', 'no'),
  postre_secundario: helado('postre_secundario', 'templado', 'no'),
  picoteo: helado('picoteo', 'templado', 'no'),
};
/** Recargos que aplica la fórmula de helado. */
export const HELADO_FACTOR_CALOR = r2(helado('postre_principal', 'calor', 'no') / HELADO_ML_PP.postre_principal);
export const HELADO_FACTOR_FRIO = r2(helado('postre_principal', 'frio', 'no') / HELADO_ML_PP.postre_principal);
export const HELADO_FACTOR_NINOS = r2(helado('postre_principal', 'templado', 'si') / HELADO_ML_PP.postre_principal);

/* ── Mesa dulce: bombones de chocolate ────────────────────────────────── */

/** Bombón de referencia de la mesa dulce. Los valores son los que pide la
 *  fórmula de chocolate casero: pieza chica, con relleno y merma de templado. */
export const BOMBON = { pesoG: 12, rellenoPct: 40, mermaPct: 6 };
/** Gramos de cobertura BRUTA por bombón, derivados de la fórmula. */
export const CHOCOLATE_G_POR_BOMBON = r2(
  Number(
    kilosChocolateCaseroBombonesReceta({
      cantidad: N,
      peso: BOMBON.pesoG,
      relleno: BOMBON.rellenoPct,
      merma: BOMBON.mermaPct,
    }).resultado
  ) / N
);
/** Gramos de relleno por bombón, derivados del mismo modelo. */
export const RELLENO_G_POR_BOMBON = r2((BOMBON.pesoG * BOMBON.rellenoPct) / 100);
/** Bombones por persona en una mesa dulce. Criterio del hub, declarado. */
export const BOMBONES_PP = 2;

/* ── Apetito y chicos ─────────────────────────────────────────────────── */

/** Factores de apetito, derivados de comida-para-invitados. */
function apetitoFactor(apetito: string) {
  const conta = (a: string) =>
    Number(/^(\d+)/.exec(comidaParaInvitados({ adultos: N, ninos: 0, tipo_comida: 'sandwiches', apetito: a }).plato_principal)?.[1] || 0);
  return r2(conta(apetito) / conta('normal'));
}
export const APETITO: Record<string, number> = {
  liviano: apetitoFactor('liviano'),
  normal: apetitoFactor('normal'),
  abundante: apetitoFactor('abundante'),
};
/** Cuánto come un chico respecto de un adulto, según comida-para-invitados. */
export const NINO_FACTOR = r2(
  Number(/^(\d+)/.exec(comidaParaInvitados({ adultos: 0, ninos: N, tipo_comida: 'sandwiches', apetito: 'normal' }).plato_principal)?.[1] || 0) /
    Number(/^(\d+)/.exec(comidaParaInvitados({ adultos: N, ninos: 0, tipo_comida: 'sandwiches', apetito: 'normal' }).plato_principal)?.[1] || 1)
);
/** Porciones de postre por invitado, según comida-para-invitados. */
export const POSTRE_PP = r2(comidaParaInvitados({ adultos: N, ninos: 0, tipo_comida: 'picada', apetito: 'normal', incluye_postre: 'si' }).postre_porciones / N);

/**
 * EL REPARTO — el criterio propio del hub, el mismo que usa bebidas-evento.
 *
 * No sale de ninguna fórmula, porque ninguna calculadora suelta sabe que la
 * misma persona no come pizza Y sushi Y sándwiches. Cada número es la fracción
 * de invitados que come ESE plato principal; la suma nunca pasa de 1 y lo que
 * falta para 1 son los que se quedan con la entrada (picada o canapés).
 *
 * `picada` y `canapes` son fracciones de los invitados que llegan a la mesa de
 * entrada — ahí sí la superposición es real y buscada: la picada es para todos.
 */
export const REPARTO: Record<
  string,
  {
    pizza: number;
    sushi: number;
    miga: number;
    picada: number;
    canapes: number;
    ocasionPizza: string;
    nivelSushi: string;
    momentoMiga: string;
    rolPicada: string;
    tipoCanape: string;
    tipoTorta: string;
    porcionTorta: string;
    rolHelado: string;
    coffee: string;
  }
> = {
  cumple: {
    pizza: 0.55, sushi: 0.15, miga: 0.3, picada: 1, canapes: 0,
    ocasionPizza: 'principal', nivelSushi: 'principal', momentoMiga: 'copetin_previa',
    rolPicada: 'previa', tipoCanape: 'coctel', tipoTorta: 'evento', porcionTorta: 'party',
    rolHelado: 'postre_principal', coffee: 'estandar_tarde',
  },
  coctel: {
    pizza: 0, sushi: 0.4, miga: 0.2, picada: 0, canapes: 1,
    ocasionPizza: 'aperitivo', nivelSushi: 'entrada', momentoMiga: 'copetin_previa',
    rolPicada: 'aperitivo', tipoCanape: 'coctelCena', tipoTorta: 'boda', porcionTorta: 'wedding',
    rolHelado: 'postre_secundario', coffee: 'estandar_tarde',
  },
  infantil: {
    pizza: 0.6, sushi: 0, miga: 0.4, picada: 0.3, canapes: 0,
    ocasionPizza: 'principal', nivelSushi: 'entrada', momentoMiga: 'merienda',
    rolPicada: 'aperitivo', tipoCanape: 'aperitivo', tipoTorta: 'infantil', porcionTorta: 'child',
    rolHelado: 'postre_principal', coffee: 'estandar_tarde',
  },
  coffee: {
    pizza: 0, sushi: 0, miga: 0, picada: 0, canapes: 0,
    ocasionPizza: 'aperitivo', nivelSushi: 'entrada', momentoMiga: 'merienda',
    rolPicada: 'aperitivo', tipoCanape: 'aperitivo', tipoTorta: 'evento', porcionTorta: 'party',
    rolHelado: 'picoteo', coffee: 'estandar_manana',
  },
};

const nAr = (v: number, d = 1) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

export const hub: HubData = {
  slug: 'eventos/comida',
  title: '¿Cuánta comida compro para la fiesta? Calculadora',
  description:
    'Cuánta pizza, sushi, picada, canapés, sándwiches de miga, torta y helado comprar para tu evento, repartido entre los invitados para no comprar de más. Cumpleaños, cóctel, cumple infantil y coffee break.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Fiestas y eventos',
  h1: '¿Cuánta comida compro para la fiesta?',
  lede:
    'Poné cuántos son y qué tipo de evento es: te devolvemos la lista en pizzas, rolls, planchas de miga, kilos de fiambrería y kilos de torta, repartida entre los invitados para que no termines comprando el triple.',
  stamps: [
    'Actualizado 27-07-2026',
    `${nAr(PIZZA_SLICES_ADULTO.principal)} porciones de pizza por adulto · ${nAr(SUSHI.principal.adulto)} piezas de sushi`,
    `Torta: ${nAr(PORCION_TORTA_CM2.party, 2)} cm² por porción de cumpleaños`,
    '15 calculadoras adentro',
  ],

  resultLabel: 'Piezas de comida a servir',

  cases: {
    title: '¿Qué evento es?',
    intro:
      'Partimos de un cumpleaños en casa. El tipo de evento no cambia sólo las cantidades: cambia CÓMO se reparten los invitados entre los platos, que es lo que evita comprar de más.',
    items: [
      {
        id: 'cumple',
        label: 'Cumpleaños en casa',
        hint: 'El caso más común',
        answer: `En un cumpleaños se calculan ${nAr(PIZZA_SLICES_ADULTO.principal)} porciones de pizza por adulto que come pizza, ${PICADA.previa.fiambre + PICADA.previa.queso} g de picada por cabeza y una porción de torta para cada invitado.`,
        yes: [
          `Picada para todos: ${PICADA.previa.fiambre} g de fiambre, ${PICADA.previa.queso} g de queso y ${PICADA.previa.aceitunas} g de aceitunas por persona`,
          `Plato principal repartido: ${Math.round(REPARTO.cumple.pizza * 100)}% come pizza, ${Math.round(REPARTO.cumple.sushi * 100)}% sushi y ${Math.round(REPARTO.cumple.miga * 100)}% sándwiches de miga`,
          `Pizza: ${nAr(PIZZA_SLICES_ADULTO.principal)} porciones por adulto y ${nAr(PIZZA_SLICES_NINO.principal)} por chico, con el 10% de margen adentro · ${PORCIONES_PIZZA_GRANDE} porciones por pizza grande`,
          `Sushi: ${nAr(SUSHI.principal.adulto)} piezas por adulto (+${Math.round((SUSHI.principal.reserva - 1) * 100)}% de reserva) · ${PIEZAS_POR_ROLL} piezas por roll`,
          `Torta: una porción de ${nAr(PORCION_TORTA_CM2.party, 2)} cm² por invitado, ${TORTA.evento.gramos} g cada una`,
        ],
        warn: [
          'Los invitados se reparten entre platos: la misma persona no come pizza y sushi a la vez, por eso el total NO es la suma de las quince calculadoras sueltas',
          'La picada sí es para todos, y es el renglón que más se subestima: arranca dos horas antes que la comida y desaparece',
          'Si la fiesta empieza antes de las 21, la gente llega con más hambre: subí el apetito a "abundante"',
          'La bebida, el agua y el hielo NO están acá: van en la calculadora de bebidas del evento, que ya reparte por tipo de fiesta',
        ],
        plazo:
          'la fiambrería se encarga con 48 h; la pizza y el sushi, el mismo día pero reservados con una semana si es fin de semana largo.',
      },
      {
        id: 'coctel',
        label: 'Cóctel o casamiento',
        hint: 'Recepción de pie, sin plato servido',
        answer: `En un cóctel se calculan ${nAr(CANAPES_PP.coctelCena)} canapés por invitado si reemplazan a la cena, y ${nAr(CANAPES_PP.coctel)} si es sólo recepción.`,
        yes: [
          `Canapés para todos: ${nAr(CANAPES_PP.coctelCena)} por persona en cóctel-cena y ${nAr(CANAPES_PP.coctel)} en recepción, más un ${Math.round((CANAPE_FACTOR_LARGO - 1) * 100)}% si pasa las 2 horas`,
          `Variedades de canapé según el tamaño: ${CANAPE_VARIEDADES.map((v) => `${v.variedades} desde ${v.desde}`).join(' · ')} invitados`,
          `Sushi para el ${Math.round(REPARTO.coctel.sushi * 100)}% de los invitados: ${nAr(SUSHI.entrada.adulto)} piezas por persona en modo entrada`,
          `Sándwiches de miga para el ${Math.round(REPARTO.coctel.miga * 100)}%: ${nAr(MIGA_ADULTO.copetin_previa)} por persona, ${MIGA_POR_PLANCHA} por plancha`,
          `Torta de casamiento: porción de ${nAr(PORCION_TORTA_CM2.wedding, 2)} cm², más chica que la de cumpleaños, ${TORTA.boda.gramos} g`,
        ],
        warn: [
          'La porción de casamiento es la mitad de una de cumpleaños: la misma torta rinde muchas más personas, no te la vendan como "más chica"',
          'Un cóctel de pie consume más que uno sentado: la gente pica sin darse cuenta de cuánto lleva',
          'Si el salón cobra por bandeja, pedí el gramaje por canapé por escrito: entre 15 g y 30 g por pieza hay el doble de comida',
          'La mesa dulce es un renglón aparte del postre: si ponés las dos cosas, no cuentes la torta dos veces',
        ],
        plazo:
          'el catering se cierra 30 días antes y el número final de invitados, 7 días antes: casi todos los salones cobran el confirmado, no el que fue.',
      },
      {
        id: 'infantil',
        label: 'Cumpleaños infantil',
        hint: 'Chicos y adultos acompañantes',
        answer: `En un cumple infantil la porción de torta baja a ${nAr(PORCION_TORTA_CM2.child, 2)} cm² y se calculan ${TORTA.infantil.gramos} g por chico, más helado y sándwiches de miga.`,
        yes: [
          `Sándwiches de miga de merienda: ${nAr(MIGA_ADULTO.merienda)} por adulto y ${nAr(MIGA_NINO.merienda)} por chico`,
          `Pizza para el ${Math.round(REPARTO.infantil.pizza * 100)}%: ${nAr(PIZZA_SLICES_NINO.principal)} porciones por chico, bastante menos que un adulto`,
          `Torta con porción infantil de ${nAr(PORCION_TORTA_CM2.child, 2)} cm²: la misma torta rinde ${Math.round((PORCION_TORTA_CM2.party / PORCION_TORTA_CM2.child - 1) * 100)}% más porciones que en un cumple de grandes`,
          `Helado: ${HELADO_ML_PP.postre_principal} ml por persona como postre principal, +${Math.round((HELADO_FACTOR_NINOS - 1) * 100)}% si hay chicos y +${Math.round((HELADO_FACTOR_CALOR - 1) * 100)}% con calor`,
          'Picada sólo para los adultos acompañantes, en modo aperitivo',
        ],
        warn: [
          'Cargá bien cuántos son chicos: si ponés a todos como adultos, la comida se te va un 35% para arriba y la torta también',
          'Los chicos comen poco y desparejo: la mitad no toca la comida y después arrasan con la torta y el helado',
          'El helado necesita freezer en el lugar: sin cadena de frío, a la hora y media es un batido',
          'Sumá una opción sin TACC y una sin lácteos: en un cumple de 20 chicos casi siempre hay alguna alergia',
        ],
        plazo:
          'la torta se encarga con 7 días; el helado se retira el mismo día, lo más tarde posible y con conservadora.',
      },
      {
        id: 'coffee',
        label: 'Coffee break o evento corporativo',
        hint: 'Media hora entre charlas',
        answer: `En un coffee break estándar se calculan ${nAr(COFFEE.estandar_manana.piezasPP)} piezas por persona: ${nAr(COFFEE.estandar_manana.medialunasPP)} medialunas, ${nAr(COFFEE.estandar_manana.sandwichesPP)} sándwiches y el resto entre masas y torta.`,
        yes: [
          `Piezas por persona según duración: ${nAr(COFFEE.corto_manana.piezasPP)} hasta 30 min, ${nAr(COFFEE.estandar_manana.piezasPP)} de 30 a 60 min y ${nAr(COFFEE.extendido_manana.piezasPP)} de 60 a 90 min`,
          `A la mañana manda lo dulce (${Math.round((COFFEE.estandar_manana.medialunasPP + COFFEE.estandar_manana.masasPP + COFFEE.estandar_manana.tortaPP) / COFFEE.estandar_manana.piezasPP * 100)}% de las piezas); a la tarde se da vuelta y manda lo salado`,
          `Café: ${nAr(COFFEE.estandar_manana.cafeLPP * 1000, 0)} ml por persona · jugos y agua: ${nAr(COFFEE.estandar_manana.jugoLPP * 1000, 0)} ml`,
          `Frutas: ${nAr(COFFEE.estandar_manana.frutasKgPP * 1000, 0)} g por persona si ponés fuente`,
          'Nadie se sirve una sola vez: las piezas por persona ya cuentan la segunda vuelta',
        ],
        warn: [
          `Los ${nAr(COFFEE.estandar_manana.cafeLPP * 1000, 0)} ml de café por persona que trae la fórmula son un pocillo corto: si tu público toma café de taza grande, duplicalos`,
          'El coffee break se agota en los primeros 10 minutos: pedí que repongan a mitad del break en vez de sacar todo junto',
          'Contá vasos, servilletas y azúcar: en un evento de oficina son el renglón que siempre falta',
          'Si el break es a la mañana temprano, la medialuna se come sola: subí la proporción dulce aunque la tabla diga otra cosa',
        ],
        plazo:
          'el catering corporativo se confirma 72 h antes con el número final de asistentes; las medialunas se piden frescas del día.',
      },
    ],
  },

  inputsTitle: 'Contá quiénes van',
  inputsIntro:
    'La cantidad de chicos importa mucho más que en la bebida: un chico come alrededor del ' +
    Math.round(NINO_FACTOR * 100) +
    '% de lo que come un adulto, pero se lleva la misma porción de torta y de helado.',
  fields: [
    { id: 'invitados', label: 'Invitados en total', type: 'number', min: 1, max: 2000, value: 30 },
    { id: 'ninos', label: 'De ellos, chicos', type: 'number', min: 0, max: 2000, value: 0 },
    { id: 'horas', label: 'Duración del evento (horas)', type: 'number', min: 1, max: 16, step: 0.5, value: 5 },
    {
      id: 'apetito',
      label: 'Apetito esperado',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'liviano', label: 'Liviano (picoteo, hora de la tarde)' },
        { value: 'normal', label: 'Normal' },
        { value: 'abundante', label: 'Abundante (es la comida de la noche)' },
      ],
    },
    {
      id: 'postre',
      label: 'Postre',
      type: 'select',
      value: 'torta',
      options: [
        { value: 'torta', label: 'Sólo torta' },
        { value: 'torta_helado', label: 'Torta y helado' },
        { value: 'mesa_dulce', label: 'Torta y mesa dulce con bombones' },
        { value: 'no', label: 'Sin postre' },
      ],
    },
    {
      id: 'clima',
      label: 'Clima',
      type: 'select',
      value: 'templado',
      options: [
        { value: 'templado', label: 'Templado' },
        { value: 'calor', label: 'Calor o al aire libre' },
        { value: 'frio', label: 'Frío' },
      ],
    },
    {
      id: 'precioPersona',
      label: 'Presupuesto de comida por persona ($)',
      type: 'number',
      min: 0,
      value: 12000,
      thousands: true,
      help: 'Poné lo que estimás gastar por cabeza: el hub calcula el total.',
    },
  ],
  fineprint:
    'Es una estimación de compra, no un menú cerrado: las cantidades salen de las quince calculadoras del sitio y ya traen su margen de seguridad. Los invitados se reparten entre platos principales según el tipo de evento, así que el total NO es la suma de todas las calculadoras por separado. La bebida, el agua y el hielo se calculan aparte. El costo por persona es el que cargues vos: los precios de comida se mueven todos los meses.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparten tus invitados entre los platos',
    caption:
      'Cada porción es la cantidad de invitados que come ESE plato principal, no la cantidad de comida. Es el gráfico que explica por qué el total es mucho menor que la suma de las calculadoras sueltas: si sumaras las quince, cada invitado aparecería cuatro o cinco veces. En el coffee break el reparto es distinto: ahí se muestran las piezas del break, que sí se comen todas.',
  },
  breakdownTitle: 'Tu lista de compras',
  breakdownIntro:
    'Las filas destacadas son las que llevás al changuito o encargás: pizzas enteras, rolls, planchas de miga, kilos de fiambrería y kilos de torta.',

  faq: [
    {
      q: '¿Cuánta comida se calcula por persona en una fiesta?',
      a: `No hay un número único porque depende de qué comida y qué evento, pero las referencias del sitio son: <b>${nAr(PIZZA_SLICES_ADULTO.principal)} porciones de pizza por adulto</b> como plato principal, <b>${nAr(SUSHI.principal.adulto)} piezas de sushi</b>, <b>${nAr(MIGA_ADULTO.copetin_previa)} sándwiches de miga</b> en el copetín, <b>${nAr(CANAPES_PP.coctel)} canapés</b> en un cóctel de recepción y <b>${PICADA.previa.fiambre + PICADA.previa.queso} g de fiambre y queso</b> de picada. La trampa está en sumarlas todas: cada una asume que TODOS los invitados comen eso, y la misma persona no come pizza y sushi y canapés al mismo tiempo.`,
    },
    {
      q: '¿Cuántas pizzas pido para 30 personas?',
      a: `Como plato principal se calculan <b>${nAr(PIZZA_SLICES_ADULTO.principal)} porciones por adulto</b> y ${nAr(PIZZA_SLICES_NINO.principal)} por chico, con un 10% de margen ya incluido. Para 30 adultos son ${Math.ceil((30 * PIZZA_SLICES_ADULTO.principal) / PORCIONES_PIZZA_GRANDE)} pizzas grandes de ${PORCIONES_PIZZA_GRANDE} porciones. Si la pizza es sólo el picoteo previo, baja a ${nAr(PIZZA_SLICES_ADULTO.aperitivo)} porciones por adulto (${Math.ceil((30 * PIZZA_SLICES_ADULTO.aperitivo) / PORCIONES_PIZZA_GRANDE)} pizzas); si es lo único que hay y el evento es largo, sube a ${nAr(PIZZA_SLICES_ADULTO.unico)}. Pedí siempre al menos tres variedades: con una sola siempre queda alguien afuera.`,
    },
    {
      q: '¿Cuánto sushi por persona para un evento?',
      a: `<b>${nAr(SUSHI.principal.adulto)} piezas por adulto</b> si el sushi es la comida principal, ${nAr(SUSHI.entrada.adulto)} si es entrada o picoteo y ${nAr(SUSHI.degustacion.adulto)} en una degustación amplia, más un ${Math.round((SUSHI.principal.reserva - 1) * 100)}% de reserva. Los chicos comen ${nAr(SUSHI.principal.nino)} piezas. Como los rolls se venden enteros de ${PIEZAS_POR_ROLL} piezas, siempre redondeá para arriba. Acá hay un desacuerdo grande entre las calculadoras que este hub absorbió: una calculaba ${SUSHI_ALTERNATIVAS.eventoCumpleanos} piezas por persona y otra ${nAr(SUSHI_ALTERNATIVAS.cena)} — un 50% de diferencia. Nos quedamos con la que tiene las referencias declaradas.`,
    },
    {
      q: '¿Cuántas porciones salen de una torta?',
      a: `Se calcula por <b>superficie</b>, no por peso ni por altura: cada porción de cumpleaños ocupa <b>${nAr(PORCION_TORTA_CM2.party, 2)} cm²</b>, la de casamiento ${nAr(PORCION_TORTA_CM2.wedding, 2)} cm² y la infantil ${nAr(PORCION_TORTA_CM2.child, 2)} cm². Una torta redonda de 22 cm tiene 380 cm² de superficie, así que salen <b>${TORTA_22_WILTON} porciones</b> de cumpleaños. Y acá va el dato contraintuitivo: <b>agregar capas NO agrega porciones</b>. Una torta de tres pisos del mismo diámetro rinde la misma cantidad de cortes, sólo que cada porción es más alta (y más pesada, y más cara).`,
    },
    {
      q: '¿Cuántos kilos de torta necesito?',
      a: `Los kilos son otra cuenta que las porciones: se calculan <b>${TORTA.evento.gramos} g por porción</b> en un evento de adultos, ${TORTA.boda.gramos} g en un casamiento y ${TORTA.infantil.gramos} g en un cumple infantil, con un ${Math.round((TORTA.evento.margen - 1) * 100)}% de margen. Para 50 invitados en un cumpleaños son ${nAr((50 * TORTA.evento.margen * TORTA.evento.gramos) / 1000, 1)} kg. Las porciones te dan el diámetro que necesitás y los kilos te dan lo que te va a cobrar la confitería: son datos distintos y conviene pedir los dos, porque una torta de 3 kg puede tener 25 o 45 porciones según lo alta que sea.`,
    },
    {
      q: '¿Cuánta picada de fiambre y queso por invitado?',
      a: `Depende del rol que juegue en el menú, y la diferencia es enorme. Si la picada es <b>la comida</b>: ${PICADA.picada.fiambre} g de fiambre + ${PICADA.picada.queso} g de queso + ${PICADA.picada.aceitunas} g de aceitunas por persona. Si es la <b>previa</b> de otra comida: ${PICADA.previa.fiambre} + ${PICADA.previa.queso} + ${PICADA.previa.aceitunas} g. Si es sólo un <b>aperitivo</b> mientras llega la gente: ${PICADA.aperitivo.fiambre} + ${PICADA.aperitivo.queso} + ${PICADA.aperitivo.aceitunas} g. El error clásico es pedir la picada "completa" y además hacer la comida: ahí es donde sobran dos kilos de salame.`,
    },
    {
      q: '¿Cuántos canapés por persona en un cóctel?',
      a: `<b>${nAr(CANAPES_PP.coctelCena)} canapés por invitado</b> si el cóctel reemplaza a la cena, <b>${nAr(CANAPES_PP.coctel)}</b> si es una recepción antes de otra comida y <b>${nAr(CANAPES_PP.aperitivo)}</b> si es sólo el aperitivo de bienvenida. Si el evento pasa las 2 horas, sumá un ${Math.round((CANAPE_FACTOR_LARGO - 1) * 100)}%. La variedad importa tanto como la cantidad: desde ${CANAPE_VARIEDADES[1].desde} invitados conviene tener ${CANAPE_VARIEDADES[1].variedades} variedades y desde ${CANAPE_VARIEDADES[3].desde}, ${CANAPE_VARIEDADES[3].variedades}. Con menos, la gente deja de comer por aburrimiento antes de llenarse.`,
    },
    {
      q: '¿Cuántos sándwiches de miga por persona?',
      a: `<b>${nAr(MIGA_ADULTO.copetin_previa)} por adulto</b> en el copetín de la previa, <b>${nAr(MIGA_ADULTO.merienda)}</b> en una merienda y <b>${nAr(MIGA_ADULTO.principal)}</b> si son la comida principal. Los chicos comen el ${Math.round((MIGA_NINO.copetin_previa / MIGA_ADULTO.copetin_previa) * 100)}% de eso. Se compran por plancha (${MIGA_POR_PLANCHA} sándwiches) o por docena (${MIGA_POR_DOCENA}), así que el hub te devuelve las dos unidades: en la sandwichería te van a preguntar en planchas.`,
    },
    {
      q: '¿Cuánto helado compro para un evento?',
      a: `<b>${HELADO_ML_PP.postre_principal} ml por persona</b> si el helado es el postre principal, ${HELADO_ML_PP.postre_secundario} ml si acompaña a la torta y ${HELADO_ML_PP.picoteo} ml si es picoteo. Con calor se multiplica por ${nAr(HELADO_FACTOR_CALOR, 2)}, con frío por ${nAr(HELADO_FACTOR_FRIO, 2)} y si hay chicos por ${nAr(HELADO_FACTOR_NINOS, 2)}. Para 40 invitados con torta de por medio en un día templado son ${nAr((40 * HELADO_ML_PP.postre_secundario) / 1000, 1)} litros. El reparto que mejor funciona es 70% crema y 30% agua o sorbete: los sabores de agua salen mucho más rápido de lo que la gente cree, sobre todo con chicos.`,
    },
    {
      q: '¿Por qué el total es menor que la suma de las calculadoras sueltas?',
      a: 'Porque cada calculadora suelta asume que TODOS los invitados comen ese plato. Si para 50 personas sumás la de pizza, la de sushi, la de sándwiches y la de canapés, terminás comprando comida para 200. Este hub reparte a los invitados entre platos principales según el tipo de evento —en un cumpleaños, por ejemplo, 55% pizza, 15% sushi y 30% miga— y después le aplica a cada grupo su propia fórmula, así que las porciones no se superponen. Lo que sí es para todos (la picada de la mesa, los canapés de la recepción, la torta) se calcula sobre el total de invitados, porque ahí la superposición es real.',
    },
    {
      q: '¿Cuánta comida para un coffee break?',
      a: `<b>${nAr(COFFEE.estandar_manana.piezasPP)} piezas por persona</b> en un break estándar de 30 a 60 minutos: ${nAr(COFFEE.corto_manana.piezasPP)} si es de media hora y ${nAr(COFFEE.extendido_manana.piezasPP)} si se estira a 90 minutos. A la mañana el reparto se inclina a lo dulce (medialunas, masas secas y budín) y a la tarde a lo salado (sándwiches). Sumá ${nAr(COFFEE.estandar_manana.cafeLPP * 1000, 0)} ml de café y ${nAr(COFFEE.estandar_manana.jugoLPP * 1000, 0)} ml de jugo o agua por persona — ese café es un pocillo corto, así que si tu público toma en taza grande, duplicalo.`,
    },
    {
      q: '¿Cuánto chocolate necesito para una mesa dulce con bombones?',
      a: `Contando <b>${BOMBONES_PP} bombones por invitado</b> de ${BOMBON.pesoG} g cada uno con ${BOMBON.rellenoPct}% de relleno, hacen falta <b>${nAr(CHOCOLATE_G_POR_BOMBON, 2)} g de cobertura por bombón</b> (ya con el ${BOMBON.mermaPct}% de merma de templado adentro) más ${nAr(RELLENO_G_POR_BOMBON, 1)} g de relleno. Para 60 invitados son ${nAr((60 * BOMBONES_PP * CHOCOLATE_G_POR_BOMBON) / 1000, 2)} kg de chocolate cobertura. Comprá cobertura real, no baño repostero: el baño no necesita templado pero tiene grasa hidrogenada en vez de manteca de cacao y se nota en la boca.`,
    },
    {
      q: '¿Y la bebida, el agua y el hielo?',
      a: 'No están en este hub a propósito: van en la calculadora de bebidas del evento, que hace exactamente el mismo reparto pero entre cerveza, vino, fernet, gaseosa y agua, y suma el hielo, que es el renglón que siempre falta. Calcular la comida y la bebida por separado no es un problema: la única variable que comparten es la cantidad de invitados y la duración, y las dos te las va a pedir igual. Lo que sí conviene es hacerlas el mismo día, porque la duración que pongas tiene que ser la misma en las dos.',
    },
  ],

  sources: [
    {
      name: 'Wilton Cake Serving Guide — porciones por superficie de torta',
      url: 'https://www.wilton.com/cake-serving-guides/',
      publisher: 'Wilton Brands',
    },
    {
      name: 'Guía de porciones y planificación de eventos',
      url: 'https://www.webstaurantstore.com/article/103/cake-serving-sizes.html',
      publisher: 'WebstaurantStore',
    },
    {
      name: 'Guía de buenas prácticas para servicios de comidas y eventos',
      url: 'https://www.argentina.gob.ar/anmat/codigoalimentario',
      publisher: 'ANMAT · Código Alimentario Argentino',
    },
    {
      name: 'Manipulación segura de alimentos: cadena de frío y tiempos',
      url: 'https://www.argentina.gob.ar/senasa/inocuidad-y-calidad-agroalimentaria',
      publisher: 'SENASA',
    },
    {
      name: 'Cinco claves para la inocuidad de los alimentos',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/food-safety',
      publisher: 'OMS · Organización Mundial de la Salud',
    },
    {
      name: 'Índice de Precios al Consumidor — capítulo Alimentos y bebidas',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
  ],

  replaces: [
    '/calculadora-porciones-torta-tamano-molde',
    '/calculadora-porciones-torta-cumpleanos-invitados-tamano',
    '/calculadora-helado-litros-por-evento-invitados-tipos',
    '/calculadora-cantidad-pizzas-por-invitados-pizzeria',
    '/calculadora-porciones-sushi-por-persona-promedio',
    '/calculadora-fiambre-queso-por-invitado-picada',
    '/calculadora-torta-personas-kg-porciones',
    '/calculadora-comida-para-invitados',
    '/calculadora-pizza-por-invitado-porciones',
    '/calculadora-kilos-chocolate-casero-bombones-receta',
    '/calculadora-canape-por-invitado-coctel',
    '/calculadora-bocadillos-por-invitado-evento-coffee-break',
    '/calculadora-sushi-piezas-por-persona-evento-cumpleanos',
    '/calculadora-sandwiches-miga-por-persona',
    '/calculadora-sushi-por-invitado-cena',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
