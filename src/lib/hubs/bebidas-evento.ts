import type { HubData } from './types';
import { cervezaInvitadoEvento } from '../formulas/cerveza-invitado-evento';
import { vinoPorInvitadoHorasEvento } from '../formulas/vino-por-invitado-horas-evento';
import { vinoPorInvitadoCena } from '../formulas/vino-por-invitado-cena';
import { fernetColaPorInvitadoJuntada } from '../formulas/fernet-cola-por-invitado-juntada';
import { fernetColaProporciones } from '../formulas/fernet-cola-proporciones';
import { whiskyPorInvitadoEvento } from '../formulas/whisky-por-invitado-evento';
import { whiskySourProporciones } from '../formulas/whisky-sour-proporciones';
import { gaseosaPorInvitadoCumpleInfantil } from '../formulas/gaseosa-por-invitado-cumple-infantil';
import { aguaPorInvitadoFiesta } from '../formulas/agua-por-invitado-fiesta';
import { bebidasEventoLitrosPorPersona } from '../formulas/bebidas-evento-litros-por-persona';
import { bebidasEventoCervezaVinoRefrescoCalculadora } from '../formulas/bebidas-evento-cerveza-vino-refresco-calculadora';

/**
 * Hub de decisión — "¿Cuánta bebida compro para la fiesta?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: cumpleaños de adultos
 * (default), casamiento o fiesta larga, cumpleaños infantil y previa o juntada.
 *
 * IMPORTANTE — de dónde salen los consumos:
 * NINGUNO está escrito a mano. Todos se DERIVAN llamando a las fórmulas reales
 * del repo con 100.000 invitados, para que los `Math.ceil` a botella entera no
 * contaminen el valor por persona:
 *
 *   litros de cerveza por persona-hora, hielo y latas → cerveza-invitado-evento.ts
 *   copas de vino por hora y reparto tinto/blanco     → vino-por-invitado-horas-evento.ts
 *   botellas de vino en cena y su reparto             → vino-por-invitado-cena.ts
 *   fernets por persona, vaso y proporción con cola   → fernet-cola-por-invitado-juntada.ts
 *   receta del fernet (ml por trago)                  → fernet-cola-proporciones.ts
 *   medidas de whisky por persona y botellas          → whisky-por-invitado-evento.ts
 *   batch de whisky sour: limones y claras            → whisky-sour-proporciones.ts
 *   litros de gaseosa de chicos y de adultos          → gaseosa-por-invitado-cumple-infantil.ts
 *   litros de agua por clima y bidones                → agua-por-invitado-fiesta.ts
 *   consumo total por persona-hora y estacionalidad   → bebidas-evento-litros-por-persona.ts
 *   cajón de cerveza y copas por botella (modelo DPPH)→ bebidas-evento-cerveza-vino-refresco-calculadora.ts
 *
 * Cuando alguien actualice esas fórmulas, este hub se actualiza solo.
 *
 * Lo que el hub agrega y ninguna calc suelta resuelve:
 *  1. una sola compra con TODAS las bebidas repartidas entre los invitados,
 *     en vez de once calculadoras que ignoran que la misma persona toma de a una;
 *  2. el resultado en BOTELLAS, latas y packs, no en litros abstractos;
 *  3. el hielo, que nadie calcula y siempre falta.
 */

/** Muestra grande: anula el efecto de los redondeos a envase entero. */
const N = 100000;

/* ── Cerveza ──────────────────────────────────────────────────────────── */

function cervezaUnitaria(tipo: string, verano: boolean) {
  const o = cervezaInvitadoEvento({
    personas: N,
    horasEvento: 1,
    tipoEvento: tipo,
    porcentajeTomadores: 100,
    esVerano: verano ? 'si' : 'no',
  });
  return o.litrosTotal / N;
}

/**
 * Litros de cerveza por persona-hora, con el 15% de margen de la fórmula ya
 * dentro. La clave es el `tipoEvento` de cerveza-invitado-evento.ts.
 */
export const CERVEZA_LH: Record<string, number> = {
  asado: cervezaUnitaria('asado', false),
  cumpleanos: cervezaUnitaria('cumpleanos', false),
  casamiento: cervezaUnitaria('casamiento', false),
  corporativo: cervezaUnitaria('corporativo', false),
  fiesta_joven: cervezaUnitaria('fiesta_joven', false),
  familia: cervezaUnitaria('familia', false),
};

/** Recargo de verano que aplica la fórmula de cerveza. */
export const FACTOR_VERANO = Math.round((cervezaUnitaria('cumpleanos', true) / CERVEZA_LH.cumpleanos) * 100) / 100;

const _cerveza = cervezaInvitadoEvento({
  personas: N,
  horasEvento: 4,
  tipoEvento: 'cumpleanos',
  porcentajeTomadores: 100,
  esVerano: 'no',
});
/** Contenido de la lata de cerveza (ml), desde la fórmula. */
export const LATA_CERVEZA_ML = Math.round((_cerveza.litrosTotal * 1000) / _cerveza.latas473);
/** Kg de hielo por litro de cerveza a enfriar, desde la fórmula. */
export const HIELO_POR_LITRO_CERVEZA = Math.round((_cerveza.hieloNecesario / _cerveza.litrosTotal) * 100) / 100;
/** Barril comercial de chopp (litros), desde la fórmula. */
export const BARRIL_L = Math.round(_cerveza.litrosTotal / _cerveza.barriles30L);

/** Unidades por cajón de cerveza, desde el modelo DPPH. */
export const CAJON_U = (() => {
  const o = bebidasEventoCervezaVinoRefrescoCalculadora({
    invitados: N,
    horas: 1,
    pct_cerveza: 100,
    pct_vino: 0,
    pct_gaseosa: 0,
  });
  const resumen = String(o.resumen || '');
  const unidades = Number(/Cerveza: (\d+) unidades/.exec(resumen)?.[1] || 0);
  const cajones = Number(/\*\*(\d+) cajón/.exec(resumen)?.[1] || 0);
  return cajones ? Math.round(unidades / cajones) : 24;
})();

/* ── Vino ─────────────────────────────────────────────────────────────── */

function vinoUnitario(tipo: string) {
  const o = vinoPorInvitadoHorasEvento({
    personas: N,
    horasEvento: 1,
    tipoEvento: tipo,
    porcentajeTomadores: 100,
  });
  const total = o.botellasTotal;
  return {
    /** Botellas por persona-hora, con el 15% de margen de la fórmula adentro. */
    botellasPersonaHora: total / N,
    tinto: Math.round((o.botellasTinto / total) * 100) / 100,
    blanco: Math.round((o.botellasBlanco / total) * 100) / 100,
    espumante: Math.round((o.botellasEspumante / total) * 100) / 100,
  };
}

export const VINO: Record<string, ReturnType<typeof vinoUnitario>> = {
  cocktail: vinoUnitario('cocktail'),
  cena: vinoUnitario('cena'),
  casamiento: vinoUnitario('casamiento'),
  corporativo: vinoUnitario('corporativo'),
  asado: vinoUnitario('asado'),
};

const _vinoCena = vinoPorInvitadoCena({ invitados: N, horas: 4, tipo: 'cena' });
/** Copas que salen de una botella de 750 ml, desde la fórmula de cena. */
export const COPAS_POR_BOTELLA = Math.round((_vinoCena.copasPorPersona * N) / _vinoCena.botellas);
/** Litros de una botella de vino, desde la fórmula de cena. */
export const BOTELLA_VINO_L = Math.round((_vinoCena.litrosTotales / _vinoCena.botellas) * 100) / 100;
/** Botellas por persona en una cena tradicional (con margen), desde la fórmula. */
export const VINO_CENA_PP = Math.round((_vinoCena.botellas / N) * 1000) / 1000;

/* ── Fernet ───────────────────────────────────────────────────────────── */

const _fernet = fernetColaPorInvitadoJuntada({ invitados: N, horas: 4, proporcion: '3070' });
/** Vaso de fernet (ml), desde la fórmula de juntada. */
export const VASO_FERNET_ML = Math.round(
  (_fernet.litrosFernet + _fernet.litrosCola) * 1000 / (_fernet.fernetsPorPersona * N)
);
/** Proporción fernet/cola que usa el hub (opción 30/70 de la fórmula). */
export const FERNET_PCT = Math.round((_fernet.litrosFernet / (_fernet.litrosFernet + _fernet.litrosCola)) * 100) / 100;
/** Botella de fernet (litros), desde la fórmula. */
export const BOTELLA_FERNET_L = Math.round((_fernet.litrosFernet / _fernet.botellas750) * 100) / 100;
/** Botella de gaseosa grande (litros), desde la fórmula. */
export const BOTELLA_COLA_L = Math.round((_fernet.litrosCola / _fernet.botellasCola225) * 100) / 100;

const _receta = fernetColaProporciones({
  personas: N,
  tragosPorPersona: 1,
  mlfernetbrancaPorTrago: 50,
  mlcocacolaPorTrago: 150,
  mlhieloPorTrago: 120,
});
/** Receta de referencia del fernet, tal como la trae su calculadora. */
export const RECETA_FERNET = {
  fernetMl: 50,
  colaMl: 150,
  hieloG: 120,
  tragos: _receta.totalTragos / N,
};

/* ── Whisky ───────────────────────────────────────────────────────────── */

function whiskyUnitario(perfil: string, horas: number) {
  const o = whiskyPorInvitadoEvento({ invitados: N, horas, perfil });
  return o.medidasPorPersona;
}
/** Medidas de whisky por persona, por perfil de consumo (evento de 4 h). */
export const WHISKY_MEDIDAS_PP: Record<string, number> = {
  bajo: whiskyUnitario('bajo', 4),
  medio: whiskyUnitario('medio', 4),
  alto: whiskyUnitario('alto', 4),
};
/** Recargos por duración que aplica la fórmula de whisky. */
export const WHISKY_FACTOR_LARGO = Math.round((whiskyUnitario('medio', 6) / WHISKY_MEDIDAS_PP.medio) * 100) / 100;
export const WHISKY_FACTOR_CORTO = Math.round((whiskyUnitario('medio', 2) / WHISKY_MEDIDAS_PP.medio) * 100) / 100;

const _whisky = whiskyPorInvitadoEvento({ invitados: N, horas: 4, perfil: 'medio' });
/** Medida de whisky (ml), desde la fórmula. */
export const MEDIDA_WHISKY_ML = Math.round((_whisky.litrosWhisky * 1000) / _whisky.medidasTotales);
/** Botella de destilado (litros) y margen que aplica la fórmula. */
export const BOTELLA_DESTILADO_L = 0.75;
export const MARGEN_WHISKY = Math.round((_whisky.botellas750 * BOTELLA_DESTILADO_L / _whisky.litrosWhisky) * 100) / 100;

const _sour = whiskySourProporciones({
  personas: N,
  tragosPorPersona: 1,
  mlwhiskyPorTrago: 50,
  mljugodelimonPorTrago: 25,
  mljarabesimplePorTrago: 15,
  mlclaradehuevoPorTrago: 15,
});
/** ml de jugo que da un limón y ml de clara que da un huevo, desde la fórmula. */
export const ML_POR_LIMON = Math.round((25 * N) / Number(/Limones: (\d+)/.exec(_sour.listaCompras)?.[1] || 1));
export const ML_POR_HUEVO = Math.round((15 * N) / Number(/Huevos: (\d+)/.exec(_sour.listaCompras)?.[1] || 1));
/** Receta clásica del whisky sour, en ml por trago. */
export const RECETA_SOUR = { whiskyMl: 50, limonMl: 25, jarabeMl: 15, claraMl: 15 };

/* ── Gaseosa ──────────────────────────────────────────────────────────── */

const _gaseosaNinos = gaseosaPorInvitadoCumpleInfantil({ invitados: N, ninos: N, horas: 4 });
const _gaseosaAdultos = gaseosaPorInvitadoCumpleInfantil({ invitados: N, ninos: 0, horas: 4 });
/** Litros de gaseosa por chico y por adulto, con el 10% de margen adentro. */
export const GASEOSA_NINO_L = Math.round((_gaseosaNinos.litrosGaseosa / N) * 1000) / 1000;
export const GASEOSA_ADULTO_L = Math.round((_gaseosaAdultos.litrosGaseosa / N) * 1000) / 1000;
/** Recargos por duración de la fórmula de gaseosa. */
export const GASEOSA_FACTOR_LARGO =
  Math.round((gaseosaPorInvitadoCumpleInfantil({ invitados: N, ninos: N, horas: 5 }).litrosGaseosa / _gaseosaNinos.litrosGaseosa) * 100) / 100;
export const GASEOSA_FACTOR_CORTO =
  Math.round((gaseosaPorInvitadoCumpleInfantil({ invitados: N, ninos: N, horas: 2 }).litrosGaseosa / _gaseosaNinos.litrosGaseosa) * 100) / 100;
/** Botella grande de gaseosa (litros), desde la fórmula. */
export const BOTELLA_GASEOSA_L = Math.round((_gaseosaNinos.litrosGaseosa / _gaseosaNinos.botellas225) * 100) / 100;

/* ── Agua ─────────────────────────────────────────────────────────────── */

function aguaUnitaria(clima: string, horas: number) {
  return aguaPorInvitadoFiesta({ invitados: N, horas, clima }).litrosTotales / N;
}
/** Litros de agua por persona (con el 10% de reserva adentro), por clima. */
export const AGUA_PP: Record<string, number> = {
  verano: Math.round(aguaUnitaria('verano', 4) * 1000) / 1000,
  templado: Math.round(aguaUnitaria('templado', 4) * 1000) / 1000,
  invierno: Math.round(aguaUnitaria('invierno', 4) * 1000) / 1000,
};
/** Recargo de la fórmula de agua cuando la fiesta pasa las 6 horas. */
export const AGUA_FACTOR_LARGO = Math.round((aguaUnitaria('templado', 6) / AGUA_PP.templado) * 100) / 100;

const _agua = aguaPorInvitadoFiesta({ invitados: N, horas: 4, clima: 'templado' });
export const BOTELLA_AGUA_L = Math.round((_agua.litrosTotales / _agua.botellas500) * 100) / 100;
export const BIDON_L = Math.round(_agua.litrosTotales / _agua.bidones20L);

/* ── Referencia global de consumo ─────────────────────────────────────── */

function consumoTotalPPHora(temporada: string) {
  const o = bebidasEventoLitrosPorPersona({
    personas: N,
    duracionHoras: 1,
    tipoBebida: 'sin_alcohol',
    temporada,
  });
  return Math.round((o.litrosTotales / N) * 1000) / 1000;
}
/** Litros de líquido por persona y por hora, según el modelo general. */
export const CONSUMO_PP_HORA: Record<string, number> = {
  verano: consumoTotalPPHora('verano'),
  templado: consumoTotalPPHora('intermedia'),
  invierno: consumoTotalPPHora('invierno'),
};

/** Kg de hielo por persona: la regla de bar que nadie calcula. */
export const PERSONAS_POR_KG_HIELO = 3;

/**
 * Reparto de los tomadores entre bebidas, por rama. No sale de una fórmula
 * —ninguna calculadora suelta sabe que la misma persona no toma cerveza y
 * fernet a la vez— así que es el criterio del hub, declarado a la vista:
 * cada porción de tomadores se computa con SU fórmula, sin superponerse.
 */
export const RAMAS: Record<
  string,
  {
    cerveza: number;
    fernet: number;
    vino: number;
    whisky: number;
    tipoCerveza: string;
    tipoVino: string;
    perfilWhisky: string;
  }
> = {
  adultos: { cerveza: 0.45, fernet: 0.35, vino: 0.15, whisky: 0.05, tipoCerveza: 'cumpleanos', tipoVino: 'cena', perfilWhisky: 'medio' },
  casamiento: { cerveza: 0.3, fernet: 0.15, vino: 0.45, whisky: 0.1, tipoCerveza: 'casamiento', tipoVino: 'casamiento', perfilWhisky: 'medio' },
  infantil: { cerveza: 0.4, fernet: 0, vino: 0.2, whisky: 0, tipoCerveza: 'familia', tipoVino: 'cena', perfilWhisky: 'bajo' },
  previa: { cerveza: 0.4, fernet: 0.6, vino: 0, whisky: 0, tipoCerveza: 'fiesta_joven', tipoVino: 'cocktail', perfilWhisky: 'bajo' },
};

const nAr = (v: number, d = 2) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

export const hub: HubData = {
  slug: 'eventos/bebidas',
  title: '¿Cuánta bebida compro para la fiesta? Calculadora 2026',
  description:
    'Calculá cuánta cerveza, vino, fernet, gaseosa, agua y hielo comprar para tu fiesta, y sobre todo cuántas botellas, latas y packs. Cumpleaños de adultos, casamiento, cumple infantil y previa.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Fiestas y juntadas',
  h1: '¿Cuánta bebida compro para la fiesta?',
  lede:
    'Poné cuántos son, cuántas horas y con qué clima: te devolvemos la lista del supermercado en botellas, latas y packs, con el hielo incluido y sin que se superponga lo que toma cada uno.',
  stamps: [
    'Actualizado 27-07-2026',
    `${nAr(CONSUMO_PP_HORA.templado)} L de líquido por persona y por hora`,
    `1 kg de hielo cada ${PERSONAS_POR_KG_HIELO} personas`,
    '11 calculadoras adentro',
  ],

  resultLabel: 'Envases que tenés que comprar',

  cases: {
    title: '¿Qué fiesta es?',
    intro: 'Partimos de un cumpleaños de adultos. Si lo tuyo es otra cosa, cambialo.',
    items: [
      {
        id: 'adultos',
        label: 'Cumpleaños de adultos',
        hint: 'El caso más común',
        answer: `En un cumpleaños de adultos se calculan ${nAr(CERVEZA_LH.cumpleanos)} litros de cerveza por persona y por hora, más el fernet, el vino y las bebidas sin alcohol.`,
        yes: [
          `Cerveza: ${nAr(CERVEZA_LH.cumpleanos)} L por tomador y por hora, con el 15% de margen ya sumado`,
          `Fernet con cola: vaso de ${VASO_FERNET_ML} ml en proporción ${Math.round(FERNET_PCT * 100)}/${Math.round((1 - FERNET_PCT) * 100)}`,
          `Vino: ${nAr(VINO.cena.botellasPersonaHora, 3)} botellas por tomador y por hora`,
          `Gaseosa y agua para todos, chicos incluidos`,
          `Hielo: 1 kg cada ${PERSONAS_POR_KG_HIELO} personas, o ${HIELO_POR_LITRO_CERVEZA} kg por litro de cerveza a enfriar, lo que sea mayor`,
        ],
        warn: [
          'Los tomadores se reparten entre bebidas: la misma persona no toma cerveza y fernet al mismo tiempo, por eso el total no es la suma de las once calculadoras sueltas',
          'Si hay asado, la cerveza arranca dos horas antes que la fiesta: sumá esas horas',
          'La gaseosa de la fiesta y la cola del fernet son la misma compra: el hub ya las junta para que no compres el doble',
          'En verano el consumo sube un ' + Math.round((FACTOR_VERANO - 1) * 100) + '% y el agua casi se duplica',
        ],
        plazo:
          'comprá la bebida dos días antes y enfriá 24 horas: una heladera llena tarda mucho más de lo que creés, y el hielo se compra el mismo día.',
      },
      {
        id: 'casamiento',
        label: 'Casamiento o fiesta larga',
        hint: 'Más de 6 horas, con cena',
        answer: `En un casamiento manda el vino: ${nAr(VINO.casamiento.botellasPersonaHora, 3)} botellas por invitado y por hora, más el espumante del brindis.`,
        yes: [
          `Vino: ${nAr(VINO.casamiento.botellasPersonaHora, 3)} botellas por tomador y por hora, repartidas en ${Math.round(VINO.casamiento.tinto * 100)}% tinto, ${Math.round(VINO.casamiento.blanco * 100)}% blanco y ${Math.round(VINO.casamiento.espumante * 100)}% espumante`,
          `Cerveza en ritmo de casamiento: ${nAr(CERVEZA_LH.casamiento)} L por tomador y por hora, bastante menos que en un cumpleaños`,
          `Barra de whisky: ${WHISKY_MEDIDAS_PP.medio} medidas de ${MEDIDA_WHISKY_ML} ml por persona`,
          'Agua en la mesa durante toda la cena, que es la mitad del consumo real',
          `Fiestas de 6 horas o más: el whisky sube un ${Math.round((WHISKY_FACTOR_LARGO - 1) * 100)}% y el agua un ${Math.round((AGUA_FACTOR_LARGO - 1) * 100)}%`,
        ],
        warn: [
          'El espumante del brindis es aparte del vino de la cena: contá una copa por invitado y no lo saques del tinto',
          'A partir de la cuarta hora el consumo por hora baja, pero no se corta: no dividas linealmente',
          'Si contratás barra libre, el salón suele exigir su propia bebida: confirmá antes de comprar',
          'El vino blanco y el espumante necesitan tres horas de frío: el salón tiene que tener lugar para eso',
        ],
        plazo:
          'cerrá la compra de bebida 15 días antes: si el salón la provee, pedí por escrito qué marcas y qué cantidades entran, porque ahí es donde aparecen los extras.',
      },
      {
        id: 'infantil',
        label: 'Cumpleaños infantil',
        hint: 'Chicos y algunos adultos',
        answer: `Un chico toma unos ${nAr(GASEOSA_NINO_L)} litros de gaseosa en un cumpleaños y un adulto acompañante, ${nAr(GASEOSA_ADULTO_L)}.`,
        yes: [
          `Gaseosa: ${nAr(GASEOSA_NINO_L)} L por chico y ${nAr(GASEOSA_ADULTO_L)} L por adulto, con el 10% de margen adentro`,
          'Mitad cola y mitad sabores, que es como se reparte el consumo real',
          'Agua para todos, que en un salón con pelotero se toma más de lo que parece',
          'Cerveza y vino sólo para la porción de adultos que toma alcohol',
          `Botellas grandes de ${nAr(BOTELLA_GASEOSA_L)} L: en un cumple infantil rinden más que las latas`,
        ],
        warn: [
          'Cargá bien cuántos son chicos: si ponés a todos como adultos, la gaseosa te queda corta',
          'Fiestas de menos de 2 horas consumen un ' + Math.round((1 - GASEOSA_FACTOR_CORTO) * 100) + '% menos de gaseosa; las de 5 horas o más, un ' + Math.round((GASEOSA_FACTOR_LARGO - 1) * 100) + '% más',
          'Sumá jugos o aguas saborizadas: cada vez más familias piden que no todo sea gaseosa',
          'La torta y el helado dan sed: el agua nunca sobra en un cumple infantil',
        ],
        plazo:
          'la gaseosa se enfría la noche anterior; el hielo, la mañana del cumple, o para la hora de la torta ya es agua.',
      },
      {
        id: 'previa',
        label: 'Previa o juntada',
        hint: 'Pocas horas, mucho fernet',
        answer: `En una juntada se calculan alrededor de ${fernetColaPorInvitadoJuntada({ invitados: 1, horas: 4, proporcion: '3070' }).fernetsPorPersona} fernets por persona en cuatro horas.`,
        yes: [
          `Fernet: vaso de ${VASO_FERNET_ML} ml, proporción ${Math.round(FERNET_PCT * 100)}/${Math.round((1 - FERNET_PCT) * 100)} con cola`,
          `Receta de referencia por trago: ${RECETA_FERNET.fernetMl} ml de fernet, ${RECETA_FERNET.colaMl} ml de cola y ${RECETA_FERNET.hieloG} g de hielo`,
          `Cerveza en ritmo de fiesta joven: ${nAr(CERVEZA_LH.fiesta_joven)} L por tomador y por hora, el más alto de todos`,
          'Juntadas de menos de 3 horas: baja a 1,5 fernets por cabeza',
          'Hielo y vasos, que es lo que siempre falta a las dos horas',
        ],
        warn: [
          'La cola se termina antes que el fernet: comprá una botella grande de más, siempre',
          'El hielo es el cuello de botella real de una previa: 1 kg cada 3 personas es el piso',
          'Si la previa se estira más de 6 horas, el consumo se aplana: no multipliques linealmente',
          'Nunca calcules alcohol para alguien que maneja: el hub cuenta agua y gaseosa para todos por algo',
        ],
        plazo:
          'el hielo se compra el mismo día y a último momento: en el freezer de casa una bolsa de 3 kg se hace bloque en cuatro horas.',
      },
    ],
  },

  inputsTitle: 'Contá quiénes van',
  inputsIntro:
    'La cantidad de chicos importa: no toman alcohol pero son los que más gaseosa consumen. El porcentaje de tomadores es sobre los adultos.',
  fields: [
    { id: 'invitados', label: 'Invitados en total', type: 'number', min: 1, max: 2000, value: 30 },
    { id: 'ninos', label: 'De ellos, chicos', type: 'number', min: 0, max: 2000, value: 0 },
    { id: 'horas', label: 'Duración de la fiesta (horas)', type: 'number', min: 1, max: 16, step: 0.5, value: 5 },
    {
      id: 'clima',
      label: 'Clima o temporada',
      type: 'select',
      value: 'templado',
      options: [
        { value: 'templado', label: 'Templado' },
        { value: 'verano', label: 'Verano o al aire libre' },
        { value: 'invierno', label: 'Invierno' },
      ],
    },
    {
      id: 'pctTomadores',
      label: 'Adultos que toman alcohol (%)',
      type: 'number',
      min: 0,
      max: 100,
      value: 80,
    },
    {
      id: 'precioLitro',
      label: 'Precio promedio del litro de bebida ($)',
      type: 'number',
      min: 0,
      value: 3500,
      thousands: true,
      help: 'Cambialo por lo que pagás vos: el costo se recalcula.',
    },
  ],
  fineprint:
    'Es una estimación de compra, no una receta cerrada: los consumos salen de las once calculadoras del sitio y ya traen su margen de seguridad. El costo es una referencia con el precio por litro que cargues vos, mezclando bebidas caras y baratas. No calcules alcohol para quien maneja.',

  chart: {
    type: 'donut',
    title: 'El reparto de tu compra',
    caption:
      'Cada porción es un renglón de la lista del supermercado, medido en litros (el hielo, en kilos). Sirve para ver de un vistazo si tu fiesta es de cerveza, de vino o de fernet, y cuánto pesa lo que no tiene alcohol, que casi siempre es más de lo que la gente cree.',
  },
  breakdownTitle: 'Tu lista del supermercado',
  breakdownIntro: 'Las barras comparan cada renglón con el más grande. Lo que llevás al changuito son las filas de botellas, latas y packs.',

  faq: [
    {
      q: '¿Cuánta bebida se calcula por persona en una fiesta?',
      a: `Como piso, <b>${nAr(CONSUMO_PP_HORA.templado)} litros de líquido por persona y por hora</b> en clima templado, contando alcohol y sin alcohol juntos. En verano sube a ${nAr(CONSUMO_PP_HORA.verano)} L y en invierno baja a ${nAr(CONSUMO_PP_HORA.invierno)} L. Ese número incluye todo: cerveza, vino, fernet, gaseosa y agua. La trampa habitual es sumar las calculadoras sueltas de cada bebida, porque cada una asume que TODOS los invitados toman eso: la misma persona no toma cerveza y fernet a la vez.`,
    },
    {
      q: '¿Cuánta cerveza compro por invitado?',
      a: `Depende del tipo de fiesta. Por tomador y por hora se calculan <b>${nAr(CERVEZA_LH.cumpleanos)} L en un cumpleaños</b>, ${nAr(CERVEZA_LH.casamiento)} L en un casamiento, ${nAr(CERVEZA_LH.asado)} L en un asado y hasta ${nAr(CERVEZA_LH.fiesta_joven)} L en una fiesta joven, con el 15% de margen ya incluido. En verano se multiplica por ${FACTOR_VERANO}. Después eso se traduce a latas de ${LATA_CERVEZA_ML} ml o a cajones de ${CAJON_U} unidades, que es como se compra de verdad.`,
    },
    {
      q: '¿Cuántas botellas de vino necesito para un casamiento?',
      a: `Se calculan <b>${nAr(VINO.casamiento.botellasPersonaHora, 3)} botellas por invitado que toma vino y por hora</b>, con el 15% de margen. Para 100 invitados de los que 80 toman vino, en una fiesta de 6 horas, son cerca de ${Math.ceil(80 * 6 * VINO.casamiento.botellasPersonaHora)} botellas. El reparto típico de casamiento es ${Math.round(VINO.casamiento.tinto * 100)}% tinto, ${Math.round(VINO.casamiento.blanco * 100)}% blanco y ${Math.round(VINO.casamiento.espumante * 100)}% espumante. Cada botella de ${nAr(BOTELLA_VINO_L)} L rinde ${COPAS_POR_BOTELLA} copas servidas.`,
    },
    {
      q: '¿Cuánto fernet y cuánta cola compro?',
      a: `El vaso de referencia es de <b>${VASO_FERNET_ML} ml</b> en proporción ${Math.round(FERNET_PCT * 100)}/${Math.round((1 - FERNET_PCT) * 100)}: unos ${RECETA_FERNET.fernetMl} ml de fernet, ${RECETA_FERNET.colaMl} ml de cola y ${RECETA_FERNET.hieloG} g de hielo por trago. En una juntada de cuatro horas se calculan 2 fernets por persona, y a partir de las 5 horas sube medio fernet por hora hasta un tope. La botella de fernet de ${nAr(BOTELLA_FERNET_L)} L rinde unos ${Math.round((BOTELLA_FERNET_L * 1000) / RECETA_FERNET.fernetMl)} tragos, y por cada una vas a necesitar cerca de ${Math.ceil((BOTELLA_FERNET_L * 1000 / RECETA_FERNET.fernetMl * RECETA_FERNET.colaMl) / 1000 / BOTELLA_COLA_L)} botellas de cola de ${nAr(BOTELLA_COLA_L)} L.`,
    },
    {
      q: '¿Cuánto hielo se necesita para una fiesta?',
      a: `La regla de bar es <b>1 kg de hielo cada ${PERSONAS_POR_KG_HIELO} personas</b>, y el chequeo alternativo es <b>${HIELO_POR_LITRO_CERVEZA} kg por litro de cerveza</b> que haya que enfriar. El hub toma el mayor de los dos, porque son criterios distintos: uno mide los tragos que se sirven con hielo y el otro, la bebida que hay que bajar de temperatura. Es el renglón que más se olvida y el que más rápido se agota: comprá el hielo el mismo día de la fiesta, no antes, porque en un freezer doméstico las bolsas se convierten en un bloque.`,
    },
    {
      q: '¿Cuánta gaseosa y cuánta agua compro?',
      a: `En un cumpleaños infantil se calculan <b>${nAr(GASEOSA_NINO_L)} L de gaseosa por chico</b> y ${nAr(GASEOSA_ADULTO_L)} L por adulto, con el 10% de margen. De agua se calculan ${nAr(AGUA_PP.templado)} L por persona en clima templado, ${nAr(AGUA_PP.verano)} L en verano y ${nAr(AGUA_PP.invierno)} L en invierno, y sube un ${Math.round((AGUA_FACTOR_LARGO - 1) * 100)}% más si la fiesta pasa las 6 horas. La gaseosa se compra en botellas de ${nAr(BOTELLA_GASEOSA_L)} L y el agua conviene en bidones de ${BIDON_L} L si son muchos, o en botellas de ${nAr(BOTELLA_AGUA_L)} L si querés que cada uno tenga la suya.`,
    },
    {
      q: '¿Cuánto whisky lleva una barra de evento?',
      a: `La medida estándar es de <b>${MEDIDA_WHISKY_ML} ml</b> y se calculan ${WHISKY_MEDIDAS_PP.medio} medidas por persona en un evento de cuatro horas: ${WHISKY_MEDIDAS_PP.bajo} si el perfil es bajo y ${WHISKY_MEDIDAS_PP.alto} si es una barra intensa. En fiestas de 6 horas o más se multiplica por ${WHISKY_FACTOR_LARGO}, y en las de 2 horas o menos por ${WHISKY_FACTOR_CORTO}. Una botella de ${BOTELLA_DESTILADO_L} L rinde ${Math.floor((BOTELLA_DESTILADO_L * 1000) / MEDIDA_WHISKY_ML)} medidas. Si vas a hacer whisky sour, la receta clásica es ${RECETA_SOUR.whiskyMl}-${RECETA_SOUR.limonMl}-${RECETA_SOUR.jarabeMl} ml más ${RECETA_SOUR.claraMl} ml de clara: contá un limón cada ${Math.round(ML_POR_LIMON / RECETA_SOUR.limonMl)} tragos y un huevo cada ${Math.round(ML_POR_HUEVO / RECETA_SOUR.claraMl)}.`,
    },
    {
      q: '¿Por qué el total no es la suma de las calculadoras de cada bebida?',
      a: 'Porque cada calculadora suelta asume que TODOS los invitados toman esa bebida. Si sumás la de cerveza, la de vino y la de fernet para 50 personas, terminás comprando bebida para 150. Este hub reparte a los tomadores entre las bebidas según el tipo de fiesta y después le aplica a cada grupo su propia fórmula, así que las porciones no se superponen. La gaseosa que pide el fernet y la gaseosa suelta también se suman en un solo renglón, por la misma razón.',
    },
    {
      q: '¿Qué pasa si la fiesta dura más de lo previsto?',
      a: `El consumo por hora no crece en línea recta: después de la cuarta hora la gente toma menos por hora, pero sigue tomando. Las fórmulas ya lo contemplan (el whisky se multiplica por ${WHISKY_FACTOR_LARGO} pasadas las 6 horas y el agua por ${AGUA_FACTOR_LARGO}, no por el doble). De todos modos, la regla práctica es tener una botella grande de cola y una bolsa de hielo de reserva: son las dos cosas que se terminan primero y las únicas que se consiguen a las 3 de la mañana.`,
    },
    {
      q: '¿Cuánto sale la bebida de una fiesta?',
      a: 'Depende muchísimo de la mezcla: el vino y el whisky pueden ser diez veces más caros por litro que la gaseosa. Por eso el hub pide un precio promedio por litro y calcula el costo sobre los litros totales de la compra, en vez de inventar precios de góndola que quedan viejos en un mes. Cargá lo que pagás vos en tu supermercado y vas a tener el número de hoy; si querés afinarlo, calculá una vez con el precio de la cerveza y otra con el del vino y quedate con el promedio ponderado.',
    },
    {
      q: '¿Cuántas latas de cerveza entran en un cajón?',
      a: `Un cajón estándar trae <b>${CAJON_U} unidades</b>, y la lata de referencia es de ${LATA_CERVEZA_ML} ml. Si la fiesta es grande conviene mirar el barril: ${BARRIL_L} litros equivalen a más de ${Math.round((BARRIL_L * 1000) / LATA_CERVEZA_ML)} latas, sale bastante menos por litro y te ahorra la montaña de envases vacíos. La contra es que necesitás la chopera, el CO₂ y alguien que sepa servir sin hacer todo espuma.`,
    },
    {
      q: '¿Qué pasa si hay embarazadas, chicos o gente que maneja?',
      a: 'Se cuentan como no tomadores de alcohol y sí como consumidores de gaseosa y agua, que es exactamente lo que hace el hub con el campo de chicos y con el porcentaje de adultos que toman. Bajá ese porcentaje y vas a ver cómo se corre la compra hacia lo que no tiene alcohol. La Ley 24.788 fija además tolerancia cero de alcohol para conducir en buena parte del país: tener agua y gaseosa fría de sobra no es un detalle de la lista, es lo que hace que la fiesta termine bien.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.788 — Ley Nacional de Lucha contra el Alcoholismo',
      url: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42480/norma.htm',
      publisher: 'InfoLEG · Ministerio de Justicia',
    },
    {
      name: 'Consumo de alcohol: información y recomendaciones',
      url: 'https://www.argentina.gob.ar/salud/mental-y-adicciones/alcohol',
      publisher: 'Ministerio de Salud de la Nación',
    },
    {
      name: 'Alcohol — datos y recomendaciones de la región',
      url: 'https://www.paho.org/es/temas/alcohol',
      publisher: 'OPS · Organización Panamericana de la Salud',
    },
    {
      name: 'Estadísticas de consumo y despacho de vino al mercado interno',
      url: 'https://www.argentina.gob.ar/inv',
      publisher: 'INV · Instituto Nacional de Vitivinicultura',
    },
    {
      name: 'Índice de Precios al Consumidor — capítulo Bebidas',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
  ],

  replaces: [
    '/calculadora-bebidas-evento-litros-por-persona',
    '/calculadora-fernet-cola-proporciones',
    '/calculadora-fernet-cola-por-invitado-juntada',
    '/calculadora-bebidas-evento-cerveza-vino-refresco-calculadora',
    '/calculadora-whisky-por-invitado-evento',
    '/calculadora-cerveza-invitado-evento',
    '/calculadora-vino-por-invitado-horas-evento',
    '/calculadora-vino-por-invitado-cena',
    '/calculadora-gaseosa-por-invitado-cumple-infantil',
    '/calculadora-whisky-sour-proporciones',
    '/calculadora-agua-por-invitado-fiesta',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
