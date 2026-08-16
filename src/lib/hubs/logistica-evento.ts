import type { HubData } from './types';
import { sillasMesasInvitados } from '../formulas/sillas-mesas-invitados';
import { meserosNecesariosInvitados } from '../formulas/meseros-necesarios-invitados';
import { vajillaAlquilerInvitados } from '../formulas/vajilla-alquiler-invitados';
import { cotillonCumplePersonas } from '../formulas/cotillon-cumple-personas';
import { globosDecoracionSalonMetros } from '../formulas/globos-decoracion-salon-metros';
import { invitacionesCumpleNumero } from '../formulas/invitaciones-cumple-numero';
import { regalosInvitadoSouvenir } from '../formulas/regalos-invitado-souvenir';
import { karaokeCancionesPorHora } from '../formulas/karaoke-canciones-por-hora';
import { playlistDuracionCanciones } from '../formulas/playlist-duracion-canciones';

/**
 * Hub de decisión — "¿Cuántas mesas, sillas, meseros y cosas necesito para la fiesta?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Seis ramas: cumpleaños de adultos (default),
 * casamiento o fiesta de 15, cumpleaños infantil, cóctel o evento corporativo,
 * asado o fiesta en casa, y noche de karaoke.
 *
 * La comida y la bebida NO viven acá: tienen sus propios hubs (/eventos/comida y
 * /eventos/bebidas). Este resuelve todo lo que NO se come ni se toma: mobiliario,
 * personal de servicio, vajilla, decoración, invitaciones, souvenirs y música.
 *
 * IMPORTANTE — de dónde salen los números:
 * ninguna ratio está escrita a mano. Todas se DERIVAN llamando a las fórmulas
 * reales del repo, casi siempre con una muestra enorme para que los `Math.ceil`
 * a unidad entera no contaminen el valor por persona:
 *
 *   personas por mesa y margen de sillas          → sillas-mesas-invitados.ts
 *   invitados por mozo, bartender y maître        → meseros-necesarios-invitados.ts
 *   platos, copas y cubiertos por invitado        → vajilla-alquiler-invitados.ts
 *   ítems de cotillón por persona                 → cotillon-cumple-personas.ts
 *   globos por metro y reparto 12"/5"             → globos-decoracion-salon-metros.ts
 *   invitaciones por invitado y anticipación      → invitaciones-cumple-numero.ts
 *   souvenirs por invitado                        → regalos-invitado-souvenir.ts
 *   canciones que entran y espera entre turnos    → karaoke-canciones-por-hora.ts
 *   canciones para cubrir las horas de fiesta     → playlist-duracion-canciones.ts
 *
 * Lo que el hub agrega y ninguna calc suelta resuelve:
 *  1. una sola lista con TODO el armado del evento, coherente entre sí (las mesas
 *     que elegís cambian las sillas, el servicio cambia los mozos y la vajilla);
 *  2. precios que no envejecen: las nueve calculadoras traían precios unitarios
 *     fósiles (una silla a $3, un mozo a $60). Acá se conserva la PROPORCIÓN
 *     entre rubros que fijan esas fórmulas y vos ponés dos precios de hoy —
 *     el de una silla y el de un mozo — que reescalan todo;
 *  3. la música medida en canciones, que es lo único que se calcula por horas y
 *     no por invitados.
 */

/** Muestra grande: anula el efecto de los redondeos a unidad entera. */
const N = 100000;

/* ── Mesas y sillas ───────────────────────────────────────────────────── */

const TIPOS_MESA = ['redonda8', 'redonda10', 'rectangular', 'coctail'] as const;

/** Personas por mesa según el tipo, derivadas de la fórmula. */
export const PERSONAS_POR_MESA: Record<string, number> = Object.fromEntries(
  TIPOS_MESA.map((t) => [t, Math.round(N / sillasMesasInvitados({ invitados: N, tipoMesa: t }).mesas)])
);

/** Margen de sillas sobre invitados que aplica la fórmula (el 5% de imprevistos). */
export const MARGEN_SILLAS =
  Math.round((sillasMesasInvitados({ invitados: N, tipoMesa: 'redonda8' }).sillas / N) * 100) / 100;

/** El margen de sillas expresado en porcentaje entero, para el copy. */
export const PCT_MARGEN_SILLAS = Math.round((MARGEN_SILLAS - 1) * 100);

/**
 * Precio relativo de una silla, en la unidad interna de las fórmulas viejas.
 * Se despeja con dos corridas chicas: con 1 invitado hay 1 mesa y 2 sillas, con
 * 2 invitados hay 1 mesa y 3 sillas, así que la diferencia de costo es una silla.
 */
export const SILLA_REL =
  sillasMesasInvitados({ invitados: 2, tipoMesa: 'redonda8' }).costoAlquiler -
  sillasMesasInvitados({ invitados: 1, tipoMesa: 'redonda8' }).costoAlquiler;

/** Precio relativo de cada tipo de mesa, despejado sacándole las sillas al total. */
export const PRECIO_MESA_REL: Record<string, number> = Object.fromEntries(
  TIPOS_MESA.map((t) => {
    const o = sillasMesasInvitados({ invitados: 1, tipoMesa: t });
    return [t, (o.costoAlquiler - o.sillas * SILLA_REL) / o.mesas];
  })
);

/** Nota que devuelve cada formato de mesa. */
export const NOTA_MESA: Record<string, string> = Object.fromEntries(
  TIPOS_MESA.map((t) => [t, sillasMesasInvitados({ invitados: 10, tipoMesa: t }).notas])
);

/* ── Personal de servicio ─────────────────────────────────────────────── */

const TIPOS_SERVICIO = ['aLaMesa', 'coctelPasando', 'buffet', 'barraLibre'] as const;

/** Invitados que atiende un mozo según el tipo de servicio (0 = sin mozos). */
export const INVITADOS_POR_MOZO: Record<string, number> = Object.fromEntries(
  TIPOS_SERVICIO.map((t) => {
    const m = meserosNecesariosInvitados({ invitados: N, tipoServicio: t }).meseros;
    return [t, m ? Math.round(N / m) : 0];
  })
);

/** Invitados por bartender, derivado de la fórmula. */
export const INVITADOS_POR_BARTENDER = Math.round(
  N / meserosNecesariosInvitados({ invitados: N, tipoServicio: 'buffet' }).bartenders
);

/** Desde cuántos invitados la fórmula suma maître. */
export const MAITRE_DESDE = (() => {
  for (let i = 1; i <= 200; i++) {
    if (meserosNecesariosInvitados({ invitados: i, tipoServicio: 'buffet' }).maitre > 0) return i;
  }
  return 50;
})();

/** Cachés relativos del personal, despejados de la fórmula. */
export const BARTENDER_REL = meserosNecesariosInvitados({ invitados: 1, tipoServicio: 'barraLibre' }).costoEstimado;
export const MOZO_REL =
  meserosNecesariosInvitados({ invitados: 1, tipoServicio: 'aLaMesa' }).costoEstimado - BARTENDER_REL;
export const MAITRE_REL = (() => {
  const o = meserosNecesariosInvitados({ invitados: MAITRE_DESDE, tipoServicio: 'buffet' });
  return o.costoEstimado - o.meseros * MOZO_REL - o.bartenders * BARTENDER_REL;
})();

/* ── Vajilla ──────────────────────────────────────────────────────────── */

const TIPOS_COMIDA = ['completa', 'coctel', 'asado', 'buffet'] as const;

/** Piezas por invitado, con el 10% de reserva por roturas ya adentro. */
export const VAJILLA_PP: Record<string, { platos: number; copas: number; cubiertos: number }> = Object.fromEntries(
  TIPOS_COMIDA.map((t) => {
    const o = vajillaAlquilerInvitados({ invitados: N, tipoComida: t });
    return [
      t,
      {
        platos: Math.round((o.platos / N) * 1000) / 1000,
        copas: Math.round((o.copas / N) * 1000) / 1000,
        cubiertos: Math.round((o.cubiertos / N) * 1000) / 1000,
      },
    ];
  })
);

/** Reserva por roturas que aplica la fórmula de vajilla. */
export const RESERVA_VAJILLA = Math.round((VAJILLA_PP.completa.copas / 4) * 100) / 100;

/** Precio relativo de una pieza de vajilla alquilada. */
export const PIEZA_REL = (() => {
  const o = vajillaAlquilerInvitados({ invitados: N, tipoComida: 'completa' });
  return Math.round((o.costoEstimado / (o.platos + o.copas + o.cubiertos)) * 1000) / 1000;
})();

/* ── Cotillón ─────────────────────────────────────────────────────────── */

const TIPOS_COTILLON = ['cumpleInfantil', 'cumpleAdulto', 'cumple15Casamiento', 'finDeAno'] as const;

export const COTILLON_PP: Record<string, number> = Object.fromEntries(
  TIPOS_COTILLON.map((t) => [t, cotillonCumplePersonas({ invitados: N, tipoEvento: t }).itemsPorPersona])
);

export const COTILLON_REL: Record<string, number> = Object.fromEntries(
  TIPOS_COTILLON.map((t) => {
    const o = cotillonCumplePersonas({ invitados: N, tipoEvento: t });
    return [t, Math.round((o.costoEstimado / o.itemsTotales) * 1000) / 1000];
  })
);

export const COTILLON_SUGERENCIAS: Record<string, string> = Object.fromEntries(
  TIPOS_COTILLON.map((t) => [t, cotillonCumplePersonas({ invitados: 10, tipoEvento: t }).sugerencias])
);

/* ── Globos ───────────────────────────────────────────────────────────── */

const TIPOS_GLOBO = ['arco', 'guirnalda', 'columna'] as const;

/** Globos por metro lineal, derivados de la fórmula. */
export const GLOBOS_POR_METRO: Record<string, number> = Object.fromEntries(
  TIPOS_GLOBO.map((t) => [t, globosDecoracionSalonMetros({ metrosArco: N, tipoDecoracion: t }).globosTotales / N])
);

/** Porcentaje de globos grandes (12") sobre el total, desde la fórmula. */
export const PCT_GLOBOS_12 = (() => {
  const o = globosDecoracionSalonMetros({ metrosArco: N, tipoDecoracion: 'arco' });
  return Math.round((o.globos12pulg / o.globosTotales) * 100) / 100;
})();

/** Precio relativo promedio de un globo, mezclando 12" y 5" en esa proporción. */
export const GLOBO_REL = (() => {
  const o = globosDecoracionSalonMetros({ metrosArco: N, tipoDecoracion: 'arco' });
  return Math.round((o.costoEstimado / o.globosTotales) * 1000) / 1000;
})();

/* ── Invitaciones ─────────────────────────────────────────────────────── */

/** Invitaciones por invitado: la fórmula asume familias y parejas. */
export const INVITACIONES_PP =
  Math.round((invitacionesCumpleNumero({ invitados: N, formato: 'digital' }).invitacionesAImprimir / N) * 100) / 100;

export const INVITACION_REL: Record<string, number> = Object.fromEntries(
  ['digital', 'impresa', 'premium'].map((f) => [f, invitacionesCumpleNumero({ invitados: N, formato: f }).costoUnidad])
);

/** Días de anticipación que recomienda la fórmula, según tamaño del evento. */
export const ANTICIPACION_CHICA = invitacionesCumpleNumero({ invitados: 10, formato: 'digital' }).tiempoEnvio;
export const ANTICIPACION_GRANDE = invitacionesCumpleNumero({ invitados: 200, formato: 'digital' }).tiempoEnvio;
/** Invitados a partir de los cuales sube la anticipación. */
export const UMBRAL_ANTICIPACION = (() => {
  for (let i = 1; i <= 300; i++) {
    if (invitacionesCumpleNumero({ invitados: i, formato: 'digital' }).tiempoEnvio > ANTICIPACION_CHICA) return i;
  }
  return 80;
})();

/* ── Souvenirs ────────────────────────────────────────────────────────── */

/** Souvenirs por invitado, por tipo de evento. */
export const SOUVENIR_PP: Record<string, number> = {
  cumpleInfantil:
    Math.round((regalosInvitadoSouvenir({ invitados: N, tipoEvento: 'cumpleInfantil', presupuestoPorSouvenir: 1 }).souvenirsTotales / N) * 100) / 100,
  otro:
    Math.round((regalosInvitadoSouvenir({ invitados: N, tipoEvento: 'otro', presupuestoPorSouvenir: 1 }).souvenirsTotales / N) * 100) / 100,
};

/* ── Música ───────────────────────────────────────────────────────────── */

/** Duración promedio de una canción y transición entre turnos (minutos). */
export const CANCION_MIN = 3.5;
export const TRANSICION_MIN = 2;

/** Canciones por hora de fiesta, según la fórmula de playlist. */
export const CANCIONES_POR_HORA = playlistDuracionCanciones({ canciones: 100, duracionPromMin: CANCION_MIN }).cancionesPorHora;

/** Canciones que entran en una hora de karaoke (con la transición entre turnos). */
export const KARAOKE_POR_HORA = karaokeCancionesPorHora({
  duracionSesionMin: 60,
  duracionCancionMin: CANCION_MIN,
  tiempoEntreMin: TRANSICION_MIN,
  cantantes: 1,
}).cancionesTotal;

/* ── Ramas ────────────────────────────────────────────────────────────── */

export interface RamaLogistica {
  mesa: string;
  servicio: string;
  comida: string;
  cotillon: string;
  globo: string;
  invitacion: string;
  souvenir: string;
  karaoke: boolean;
}

/**
 * Cada rama sólo elige QUÉ opción de cada fórmula corresponde. Los números
 * siguen saliendo de las fórmulas: acá no hay ninguna constante nueva.
 */
export const RAMAS: Record<string, RamaLogistica> = {
  adultos: { mesa: 'redonda10', servicio: 'buffet', comida: 'completa', cotillon: 'cumpleAdulto', globo: 'arco', invitacion: 'impresa', souvenir: 'otro', karaoke: false },
  casamiento: { mesa: 'redonda10', servicio: 'aLaMesa', comida: 'completa', cotillon: 'cumple15Casamiento', globo: 'arco', invitacion: 'premium', souvenir: 'otro', karaoke: false },
  infantil: { mesa: 'redonda8', servicio: 'buffet', comida: 'buffet', cotillon: 'cumpleInfantil', globo: 'arco', invitacion: 'digital', souvenir: 'cumpleInfantil', karaoke: false },
  coctel: { mesa: 'coctail', servicio: 'coctelPasando', comida: 'coctel', cotillon: 'cumpleAdulto', globo: 'columna', invitacion: 'digital', souvenir: 'otro', karaoke: false },
  casa: { mesa: 'rectangular', servicio: 'barraLibre', comida: 'asado', cotillon: 'finDeAno', globo: 'guirnalda', invitacion: 'digital', souvenir: 'otro', karaoke: false },
  karaoke: { mesa: 'coctail', servicio: 'barraLibre', comida: 'coctel', cotillon: 'cumpleAdulto', globo: 'guirnalda', invitacion: 'digital', souvenir: 'otro', karaoke: true },
};

const nAr = (v: number, d = 2) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

export const hub: HubData = {
  slug: 'eventos/logistica',
  title: 'Logística de eventos: mesas, sillas, meseros y playlist',
  description:
    'Calculá mesas, sillas, mozos, vajilla, cotillón, globos, invitaciones, souvenirs y canciones para tu evento. Cumpleaños, casamiento, cumple infantil, cóctel, asado en casa y karaoke, en una sola lista.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Armado del evento',
  h1: '¿Cuántas mesas, sillas, meseros y cosas necesito para la fiesta?',
  lede:
    'Todo lo que no se come ni se toma: mobiliario, personal, vajilla, decoración, invitaciones, souvenirs y música. Poné cuántos son y cuántas horas dura, y te devolvemos la lista completa del alquiler con su costo.',
  stamps: [
    'Actualizado 27-07-2026',
    `1 mozo cada ${INVITADOS_POR_MOZO.aLaMesa} invitados con servicio a la mesa`,
    `${PCT_MARGEN_SILLAS}% de sillas de más por imprevistos`,
    '9 calculadoras adentro',
  ],

  resultLabel: 'Lo que sale armar tu evento',

  cases: {
    title: '¿Qué evento estás armando?',
    intro:
      'Partimos de un cumpleaños de adultos con buffet. Si lo tuyo es un casamiento, un cumple de chicos, un cóctel, un asado en casa o una noche de karaoke, cambialo acá y se recalcula todo.',
    items: [
      {
        id: 'adultos',
        label: 'Cumpleaños de adultos',
        hint: 'Buffet, mesas redondas',
        answer: `Para un cumpleaños de adultos con buffet se calcula 1 mesa redonda cada ${PERSONAS_POR_MESA.redonda10} invitados, 1 mozo cada ${INVITADOS_POR_MOZO.buffet} y 1 bartender cada ${INVITADOS_POR_BARTENDER}.`,
        yes: [
          `Mesas redondas de ${PERSONAS_POR_MESA.redonda10} personas, más las sillas con ${PCT_MARGEN_SILLAS}% de margen`,
          `Mozos en ritmo de buffet: 1 cada ${INVITADOS_POR_MOZO.buffet} invitados, que es el servicio más liviano en personal`,
          `Vajilla de comida completa: ${nAr(VAJILLA_PP.buffet.platos, 1)} platos, ${nAr(VAJILLA_PP.buffet.copas, 1)} copas y ${nAr(VAJILLA_PP.buffet.cubiertos, 1)} cubiertos por invitado, con la reserva por roturas adentro`,
          `Cotillón de adulto: ${nAr(COTILLON_PP.cumpleAdulto, 1)} ítems por persona (${COTILLON_SUGERENCIAS.cumpleAdulto.toLowerCase()})`,
          `Playlist: ${CANCIONES_POR_HORA} canciones por hora de fiesta`,
        ],
        warn: [
          'Sumá dos o tres mesas que no son de invitados: la del buffet, la de la torta y la de los regalos. El cálculo cuenta las de comensales',
          'La mesa de 10 personas entra más gente pero deja menos espacio: si el salón es chico, la de 8 circula mejor',
          `A partir de ${MAITRE_DESDE} invitados el cálculo suma un maître, que es quien coordina al resto: en fiestas grandes no es un lujo`,
          'Las sillas se alquilan por unidad y casi siempre con flete aparte: pedí el precio puesto en el salón, no en el depósito',
        ],
        plazo:
          'reservá mobiliario y vajilla con 30 días; el personal de servicio, con 45, porque los fines de semana de temporada se agotan primero.',
      },
      {
        id: 'casamiento',
        label: 'Casamiento o fiesta de 15',
        hint: 'Servicio a la mesa',
        answer: `En un casamiento con servicio a la mesa se calcula 1 mozo cada ${INVITADOS_POR_MOZO.aLaMesa} invitados: es el formato que más personal necesita, casi el triple que un buffet.`,
        yes: [
          `Mozos: 1 cada ${INVITADOS_POR_MOZO.aLaMesa} invitados, contra 1 cada ${INVITADOS_POR_MOZO.buffet} del buffet`,
          `Bartenders: 1 cada ${INVITADOS_POR_BARTENDER} invitados, y maître desde ${MAITRE_DESDE}`,
          `Vajilla de comida completa: ${nAr(VAJILLA_PP.completa.platos, 1)} platos, ${nAr(VAJILLA_PP.completa.copas, 1)} copas y ${nAr(VAJILLA_PP.completa.cubiertos, 1)} cubiertos por invitado`,
          `Cotillón de casamiento o 15: ${nAr(COTILLON_PP.cumple15Casamiento, 1)} ítems por persona, el reparto más alto de todos`,
          `Invitaciones premium: ${INVITACIONES_PP} por invitado, porque se manda una por pareja o por familia`,
        ],
        warn: [
          `Con más de ${UMBRAL_ANTICIPACION} invitados las invitaciones salen con ${ANTICIPACION_GRANDE} días de anticipación, no con ${ANTICIPACION_CHICA}`,
          'Confirmá qué incluye el salón: muchas veces mesas, sillas y vajilla vienen adentro y estarías alquilando dos veces lo mismo',
          'Las copas son el rubro que más se rompe: la reserva del cálculo es el piso, no el techo',
          'El personal cobra por jornada y las horas extra se pactan aparte: si la fiesta se estira, ese costo no está en esta lista',
        ],
        plazo:
          'el salón y el personal se cierran con 4 a 6 meses; las invitaciones se mandan con ' +
          ANTICIPACION_GRANDE +
          ' días y la confirmación final de cantidad, 10 días antes.',
      },
      {
        id: 'infantil',
        label: 'Cumpleaños infantil',
        hint: 'Chicos, cotillón y souvenirs',
        answer: `En un cumple de chicos se calculan ${nAr(COTILLON_PP.cumpleInfantil, 1)} ítems de cotillón por invitado y ${SOUVENIR_PP.cumpleInfantil} souvenir por cabeza, sin margen extra.`,
        yes: [
          `Cotillón infantil: ${nAr(COTILLON_PP.cumpleInfantil, 1)} ítems por chico (${COTILLON_SUGERENCIAS.cumpleInfantil.toLowerCase()})`,
          `Souvenirs: ${SOUVENIR_PP.cumpleInfantil} por invitado, sin el ${Math.round((SOUVENIR_PP.otro - 1) * 100)}% de margen que sí llevan los eventos de adultos`,
          `Mesas de ${PERSONAS_POR_MESA.redonda8} lugares, que es la medida que dejan libre los peloteros`,
          `Vajilla de buffet: ${nAr(VAJILLA_PP.buffet.platos, 1)} platos y ${nAr(VAJILLA_PP.buffet.copas, 1)} vasos por invitado`,
          'Invitaciones digitales, que además te dan la confirmación por escrito',
        ],
        warn: [
          'Contá a los adultos acompañantes como invitados: ocupan silla y usan vajilla aunque no coman lo mismo',
          'El souvenir infantil rinde exacto: si aparece un hermanito de más, alguien se queda sin el suyo. Comprá dos o tres de más siempre',
          'Los globos con helio duran menos de un día: si el cumple es al mediodía, se inflan a la mañana',
          'Globos chicos y objetos de cotillón son riesgo de asfixia en menores de 3 años: mirá la edad de los invitados antes de comprar',
        ],
        plazo:
          'el pelotero o salón infantil se reserva con 30 a 60 días; el cotillón y los souvenirs, con 15, que es lo que tarda cualquier personalizado.',
      },
      {
        id: 'coctel',
        label: 'Cóctel o evento corporativo',
        hint: 'De pie, sin sillas',
        answer: `En un cóctel de pie se calcula 1 mesa alta cada ${PERSONAS_POR_MESA.coctail} personas y cero sillas: el cálculo de sillas se apaga solo.`,
        yes: [
          `Mesas altas de apoyo: 1 cada ${PERSONAS_POR_MESA.coctail} personas`,
          `Mozos pasando bandeja: 1 cada ${INVITADOS_POR_MOZO.coctelPasando} invitados, un punto medio entre el buffet y el servicio a la mesa`,
          `Vajilla de cóctel: ${nAr(VAJILLA_PP.coctel.platos, 1)} platitos y ${nAr(VAJILLA_PP.coctel.copas, 1)} copas por persona, sin cubiertos`,
          `Decoración en columnas de globos: ${GLOBOS_POR_METRO.columna} globos por metro`,
          'Invitaciones digitales, que es el estándar corporativo',
        ],
        warn: [
          'Cero sillas es el cálculo, no la realidad: dejá al menos una silla cada diez personas para quien no puede estar parado dos horas',
          'Sin cubiertos, todo lo que se sirva tiene que comerse con la mano: coordinalo con el menú antes de cerrar la vajilla',
          'Un cóctel rota más gente que asistentes en simultáneo: si es de entrada libre, calculá sobre el pico, no sobre el total del día',
          'La vajilla de cóctel se ensucia más rápido porque cada persona toma varias copas distintas: el margen por roturas se queda corto si no hay reposición',
        ],
        plazo:
          'los eventos corporativos se cierran con 30 días, pero el catering pide el número final 72 horas antes: esa es la fecha que importa.',
      },
      {
        id: 'casa',
        label: 'Asado o fiesta en casa',
        hint: 'Sin personal, tablones',
        answer:
          `En una fiesta en casa no hay mozos: el cálculo baja el personal a cero y sólo cuenta 1 bartender cada ${INVITADOS_POR_BARTENDER} personas si querés barra.`,
        yes: [
          `Mesas rectangulares de ${PERSONAS_POR_MESA.rectangular} lugares, que es el tablón que se alquila para patio`,
          'Personal en cero: barra libre y autoservicio, la modalidad de casa',
          `Vajilla de asado: ${nAr(VAJILLA_PP.asado.platos, 1)} platos, ${nAr(VAJILLA_PP.asado.copas, 1)} vasos y ${nAr(VAJILLA_PP.asado.cubiertos, 1)} cubiertos por persona`,
          `Guirnaldas de globos: ${GLOBOS_POR_METRO.guirnalda} globos por metro, la mitad que un arco`,
          `Playlist para todas las horas: ${CANCIONES_POR_HORA} canciones por hora`,
        ],
        warn: [
          'Si no hay mozos, alguien de la casa hace ese trabajo: contá una persona cada 25 invitados aunque no la pagues',
          'El tablón entra mucha gente pero necesita pasillo de circulación de los dos lados: medí el patio antes de alquilar',
          'La vajilla descartable sale más barata que el alquiler pero pesa en la basura: con más de 40 personas conviene el alquiler',
          'Chequeá el consumo eléctrico antes de enchufar equipo de música, luces y freezer en la misma línea',
        ],
        plazo:
          'el alquiler de tablones y sillas para casa se reserva con 7 a 15 días; en diciembre, con 30, que es cuando se agota todo.',
      },
      {
        id: 'karaoke',
        label: 'Noche de karaoke',
        hint: 'Cuántas canciones entran',
        answer: `En una hora de karaoke entran ${KARAOKE_POR_HORA} canciones contando los ${TRANSICION_MIN} minutos de transición entre turno y turno, contra ${CANCIONES_POR_HORA} de una playlist que corre sola.`,
        yes: [
          `Canciones que entran: ${KARAOKE_POR_HORA} por hora, con temas de ${nAr(CANCION_MIN, 1)} minutos`,
          `La espera entre tus dos turnos crece con el grupo: son ${nAr(CANCION_MIN + TRANSICION_MIN, 1)} minutos por cada persona que canta antes que vos`,
          'El cálculo reparte las canciones entre todos los cantantes, así ves cuántas le tocan a cada uno',
          `Mesas altas cada ${PERSONAS_POR_MESA.coctail} personas y nada de servicio: es formato de pie`,
          'Si el grupo es grande, conviene cantar de a dos: duplicás los turnos sin alargar la noche',
        ],
        warn: [
          'Menos de 2 canciones por persona es señal de que el grupo es muy grande para las horas: alargá la sesión o achicá la lista',
          'La transición entre turnos es lo que más tiempo come: dos minutos por canción parecen poco y se llevan más de un tercio de la noche',
          'Reservá los últimos 20 minutos para el tema final: si no, la sesión termina cortada a mitad de canción',
          'Si es en casa, mirá el horario de descanso de tu municipio antes de programar el final',
        ],
        plazo:
          'armá la lista de temas el día anterior y probá el equipo dos horas antes: los micrófonos con acople son el problema número uno de cualquier karaoke.',
      },
    ],
  },

  inputsTitle: 'Contá cómo es tu evento',
  inputsIntro:
    'Los dos precios son los que reescalan toda la lista: poné lo que te cobran a vos por una silla y por un mozo, y el resto de los rubros se ajusta manteniendo la proporción de las nueve calculadoras.',
  fields: [
    { id: 'invitados', label: 'Invitados en total', type: 'number', min: 1, max: 2000, value: 60 },
    { id: 'horas', label: 'Duración del evento (horas)', type: 'number', min: 1, max: 16, step: 0.5, value: 5 },
    {
      id: 'metrosGlobos',
      label: 'Metros de decoración con globos',
      type: 'number',
      min: 0,
      max: 200,
      step: 0.5,
      value: 6,
      help: 'El largo del arco, la guirnalda o la suma de las columnas. Poné 0 si no vas a decorar con globos.',
    },
    {
      id: 'precioSilla',
      label: 'Precio de alquiler de una silla ($)',
      type: 'number',
      min: 0,
      value: 2500,
      thousands: true,
      help: 'Es el ancla de precios: con esto se reescalan mesas, vajilla, cotillón, globos e invitaciones.',
    },
    {
      id: 'precioMozo',
      label: 'Caché de un mozo por la jornada ($)',
      type: 'number',
      min: 0,
      value: 60000,
      thousands: true,
      help: 'Escala el costo de mozos, bartenders y maître, que se cotizan aparte del alquiler.',
    },
    {
      id: 'presupuestoSouvenir',
      label: 'Presupuesto por souvenir ($)',
      type: 'number',
      min: 0,
      value: 3500,
      thousands: true,
      help: 'Poné 0 si tu evento no lleva souvenirs.',
    },
  ],
  fineprint:
    'Es una estimación de armado y de compra, no un presupuesto cerrado: las cantidades salen de las nueve calculadoras del sitio y ya traen su margen por roturas e imprevistos. Los precios unitarios de esas fórmulas quedaron viejos, así que acá se conserva sólo la proporción entre rubros y se reescala con los dos precios que cargás vos. Pedí siempre presupuesto por escrito, con flete y horas extra incluidos, antes de reservar.',

  chart: {
    type: 'donut',
    title: 'En qué se te va el presupuesto de logística',
    caption:
      'Cada porción es un rubro del armado, en pesos. Sirve para ver de un vistazo qué manda en tu evento: en un casamiento el personal se come la mitad, en un cumple de chicos ganan el cotillón y los souvenirs, y en una fiesta en casa casi todo es mobiliario. Es la comparación que ninguna calculadora suelta te deja hacer.',
  },
  breakdownTitle: 'Tu lista de armado',
  breakdownIntro:
    'Las barras comparan cada renglón con el más grande. Las filas destacadas son las que tenés que pedir al proveedor; el resto son las ratios con las que se calcularon.',

  faq: [
    {
      q: '¿Cuántas mesas y sillas necesito según los invitados?',
      a: `Depende del formato de mesa. Una mesa redonda clásica entra <b>${PERSONAS_POR_MESA.redonda8} personas</b>, la redonda grande ${PERSONAS_POR_MESA.redonda10}, el tablón rectangular ${PERSONAS_POR_MESA.rectangular} y la mesa alta de cóctel ${PERSONAS_POR_MESA.coctail}. Las sillas se calculan con un <b>${PCT_MARGEN_SILLAS}% de margen</b> sobre los invitados, para imprevistos y para el que aparece sin avisar. Para 100 invitados en mesas de ${PERSONAS_POR_MESA.redonda10} son ${Math.ceil(100 / PERSONAS_POR_MESA.redonda10)} mesas y ${Math.ceil(100 * MARGEN_SILLAS)} sillas. Ojo: el cálculo cuenta mesas de comensales, así que sumale aparte la del buffet, la de la torta y la de los regalos.`,
    },
    {
      q: '¿Cuántos mozos se necesitan para 100 invitados?',
      a: `Manda el tipo de servicio, no la cantidad de comida. Con <b>servicio a la mesa</b> se calcula 1 mozo cada ${INVITADOS_POR_MOZO.aLaMesa} invitados (${Math.ceil(100 / INVITADOS_POR_MOZO.aLaMesa)} para 100 personas), con <b>cóctel pasando bandeja</b> 1 cada ${INVITADOS_POR_MOZO.coctelPasando} (${Math.ceil(100 / INVITADOS_POR_MOZO.coctelPasando)}) y con <b>buffet</b> 1 cada ${INVITADOS_POR_MOZO.buffet} (${Math.ceil(100 / INVITADOS_POR_MOZO.buffet)}). Aparte va 1 bartender cada ${INVITADOS_POR_BARTENDER} invitados y, desde ${MAITRE_DESDE} personas, un maître que coordina al equipo. En una fiesta en casa con barra libre el cálculo de mozos baja a cero, pero el trabajo lo hace alguien igual.`,
    },
    {
      q: '¿Cuánta vajilla tengo que alquilar por invitado?',
      a: `Para una comida completa se calculan <b>${nAr(VAJILLA_PP.completa.platos, 1)} platos, ${nAr(VAJILLA_PP.completa.copas, 1)} copas y ${nAr(VAJILLA_PP.completa.cubiertos, 1)} cubiertos por invitado</b>, con el ${Math.round((RESERVA_VAJILLA - 1) * 100)}% de reserva por roturas ya incluido. En cóctel baja a ${nAr(VAJILLA_PP.coctel.platos, 1)} platos y ${nAr(VAJILLA_PP.coctel.copas, 1)} copas sin cubiertos; en asado, ${nAr(VAJILLA_PP.asado.platos, 1)} platos y ${nAr(VAJILLA_PP.asado.cubiertos, 1)} cubiertos; en buffet, ${nAr(VAJILLA_PP.buffet.platos, 1)} platos. Parece mucho porque una persona usa varios platos y varias copas a lo largo de la noche: entrada, principal, postre, y una copa distinta por bebida.`,
    },
    {
      q: '¿Cuántos globos necesito para un arco o una guirnalda?',
      a: `Se calcula por metro lineal: <b>${GLOBOS_POR_METRO.arco} globos por metro</b> en un arco orgánico, ${GLOBOS_POR_METRO.columna} en una columna y ${GLOBOS_POR_METRO.guirnalda} en una guirnalda. El reparto es ${Math.round(PCT_GLOBOS_12 * 100)}% de globos grandes de 12 pulgadas y ${Math.round((1 - PCT_GLOBOS_12) * 100)}% chicos de 5, que son los que rellenan los huecos y le dan el aspecto orgánico. Un arco de entrada de 4 metros son ${Math.ceil(4 * GLOBOS_POR_METRO.arco)} globos. Comprá un 10 a 15% de más: se revientan al inflar y al armar, siempre.`,
    },
    {
      q: '¿Cuántas invitaciones imprimo si tengo 80 invitados?',
      a: `Menos de las que pensás: se calcula <b>${INVITACIONES_PP} invitación por invitado</b>, o sea alrededor de 1 cada 2, porque las parejas y las familias reciben una sola. Para 80 invitados son ${Math.ceil(80 * INVITACIONES_PP)} invitaciones. La anticipación recomendada es de <b>${ANTICIPACION_CHICA} días</b> para eventos chicos y <b>${ANTICIPACION_GRANDE} días</b> desde ${UMBRAL_ANTICIPACION} invitados, porque con más gente hay más agenda que coordinar y más gente que viaja.`,
    },
    {
      q: '¿Cuántos souvenirs preparo y cuántos de más?',
      a: `En eventos de adultos se preparan <b>${SOUVENIR_PP.otro} souvenirs por invitado</b>, o sea un ${Math.round((SOUVENIR_PP.otro - 1) * 100)}% de más por imprevistos: el acompañante que no estaba en la lista, el que se lleva uno para el que no vino, el que se rompe. En cumpleaños infantiles el cálculo es exacto, ${SOUVENIR_PP.cumpleInfantil} por chico, así que ahí conviene sumar dos o tres a mano. El costo total es simplemente esa cantidad por lo que decidas gastar en cada uno, que es el número que más varía de todo el evento.`,
    },
    {
      q: '¿Cuánto cotillón se calcula por persona?',
      a: `Depende del evento: <b>${nAr(COTILLON_PP.cumpleInfantil, 1)} ítems por chico</b> en un cumple infantil, ${nAr(COTILLON_PP.cumpleAdulto, 1)} en un cumple de adultos, ${nAr(COTILLON_PP.cumple15Casamiento, 1)} en un casamiento o fiesta de 15 —que es donde más se usa, con la carioca completa— y ${nAr(COTILLON_PP.finDeAno, 1)} en una fiesta de fin de año, el máximo. Un ítem es un gorro, una máscara, un collar fluo, una corneta. Como con los globos, comprá un 10 a 15% extra: es lo primero que se rompe y lo que menos se puede reponer a las dos de la mañana.`,
    },
    {
      q: '¿Cuántas canciones necesito para cubrir la fiesta?',
      a: `Con temas de ${nAr(CANCION_MIN, 1)} minutos entran <b>${CANCIONES_POR_HORA} canciones por hora</b>, así que una fiesta de 5 horas pide unas ${Math.ceil(5 * 60 / CANCION_MIN)} y una de 8 horas, ${Math.ceil(8 * 60 / CANCION_MIN)}. Armá un 20% de más: siempre se saltean temas y siempre la fiesta se estira. Si tenés DJ no hace falta, pero si la música la maneja el celular de alguien, esta es la cuenta que evita que a las 3 de la mañana empiece a repetirse la playlist.`,
    },
    {
      q: '¿Cuántas canciones entran en una noche de karaoke?',
      a: `Menos que en una playlist, porque entre turno y turno se pierden un par de minutos. Contando ${nAr(CANCION_MIN, 1)} minutos de canción y ${TRANSICION_MIN} de transición entran <b>${KARAOKE_POR_HORA} canciones por hora</b>, contra ${CANCIONES_POR_HORA} de música corrida. En una sesión de 3 horas con 8 personas cantan ${Math.floor((180 / (CANCION_MIN + TRANSICION_MIN)) / 8)} temas cada uno y la espera entre tus dos turnos es de casi ${Math.round((8 - 1) * (CANCION_MIN + TRANSICION_MIN))} minutos. Menos de dos canciones por cabeza es señal de que el grupo es demasiado grande para el tiempo que tenés.`,
    },
    {
      q: '¿Por qué el hub pide el precio de una silla en vez de traer precios?',
      a: 'Porque las nueve calculadoras originales traían precios unitarios fósiles —una silla a $3, un mozo a $60— que hoy no significan nada, y ningún organismo publica un índice oficial de alquiler de mobiliario para eventos. Lo que sí se conserva es la <b>proporción</b> entre rubros, que se mueve mucho menos que los precios: una mesa vale varias sillas, un mozo vale bastante más que un bartender. Vos cargás dos números de tu presupuesto real —la silla y el mozo— y el resto se reescala solo. Es la única forma de que la cuenta no quede vieja el mes que viene.',
    },
    {
      q: '¿Qué no está incluido en esta lista?',
      a: 'La comida y la bebida, que tienen sus propias calculadoras en este mismo silo, y todo lo que se cotiza por evento y no por invitado: salón, DJ o banda, fotógrafo, iluminación, carpa, baños químicos, flete del mobiliario y horas extra del personal. También quedan afuera los seguros y los permisos municipales, que en eventos con público pueden ser obligatorios. Usá esta lista para lo que escala con la cantidad de gente, y pedí presupuesto cerrado para lo demás.',
    },
    {
      q: '¿Cómo sé si el salón entra la cantidad de gente que invito?',
      a: 'El límite no lo pone el mobiliario sino el factor de ocupación que fija el código de edificación de tu jurisdicción, que se calcula por metros cuadrados y por ancho de las salidas de emergencia. Como referencia práctica: un evento sentado con mesas redondas necesita alrededor de 1,2 a 1,5 m² por persona contando circulación, y uno de pie tipo cóctel, cerca de 0,8 m². Si el número de invitados te da un salón al límite, revisá primero las salidas y después las mesas: se puede achicar el mobiliario, no la capacidad reglamentaria.',
    },
  ],

  sources: [
    {
      name: 'Convenio Colectivo de Trabajo 389/04 — Gastronómicos (UTHGRA)',
      url: 'https://www.uthgra.org.ar/',
      publisher: 'UTHGRA · Unión de Trabajadores del Turismo, Hoteleros y Gastronómicos',
    },
    {
      name: 'Escalas salariales y convenios homologados',
      url: 'https://www.argentina.gob.ar/trabajo',
      publisher: 'Ministerio de Capital Humano · Secretaría de Trabajo',
    },
    {
      name: 'Índice de Precios al Consumidor — capítulo Restaurantes y hoteles',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Código de Edificación — factor de ocupación y medios de salida',
      url: 'https://buenosaires.gob.ar/desarrollourbano/codigo-de-edificacion',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Ley 19.587 de Higiene y Seguridad en el Trabajo',
      url: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/17612/norma.htm',
      publisher: 'InfoLEG · Ministerio de Justicia',
    },
    {
      name: 'Aranceles por ejecución pública de música en eventos',
      url: 'https://www.sadaic.org.ar/',
      publisher: 'SADAIC · Sociedad Argentina de Autores y Compositores',
    },
  ],

  replaces: [
    '/calculadora-sillas-mesas-invitados',
    '/calculadora-meseros-necesarios-invitados',
    '/calculadora-vajilla-alquiler-invitados',
    '/calculadora-cotillon-cumple-personas',
    '/calculadora-globos-decoracion-salon-metros',
    '/calculadora-invitaciones-cumple-numero',
    '/calculadora-regalos-invitado-souvenir',
    '/calculadora-karaoke-canciones-por-hora',
    '/calculadora-playlist-duracion-canciones',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
