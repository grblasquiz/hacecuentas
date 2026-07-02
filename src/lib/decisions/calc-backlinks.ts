/**
 * Mapa inverso calc → salas de decisión (/decidir/*).
 *
 * Cada sala declara sus `componentCalcs` (las calcs que corre por dentro).
 * Este módulo invierte esa relación para que la página de cada calc pueda
 * linkear a las salas que la usan: son los links contextuales que pasan
 * autoridad desde las ~2.500 landings de calc (donde vive el tráfico) hacia
 * las salas (superficie nueva, sin autoridad propia todavía).
 *
 * Aislamiento por locale: una calc AR solo linkea salas AR (/decidir/*) y una
 * calc de vertical país (co/mx/cl/pe) solo linkea salas de SU país
 * (/<cc>/decidir/*). Nunca cruzamos país: el slug local difiere a propósito
 * (arriendo/renta/MSI) y cruzar rompería la señal geo.
 *
 * Consume los manifests auto-generados (data plana, sin compute), así que es
 * barato de importar desde cualquier template de build.
 */
import { DECISION_MANIFEST } from './manifest';
import { DECISION_MANIFEST_LOCALES } from './manifest-locales';

export interface DecisionRoomLink {
  /** URL absoluta-relativa de la sala, con prefijo de país si corresponde. */
  href: string;
  /** Pregunta de la sala (h1), ya en forma de decisión. */
  h1: string;
  icon: string;
  description: string;
}

/** key `${country}:${calcSlug}` — country '' = AR. */
const byCalc = new Map<string, DecisionRoomLink[]>();

function add(country: string, calcSlug: string, link: DecisionRoomLink) {
  const key = `${country}:${calcSlug}`;
  const list = byCalc.get(key) ?? [];
  // Una calc puede participar de varias salas; evitar duplicados exactos.
  if (!list.some((l) => l.href === link.href)) list.push(link);
  byCalc.set(key, list);
}

for (const room of DECISION_MANIFEST) {
  for (const c of room.componentCalcs ?? []) {
    add('', c.slug, {
      href: `/decidir/${room.slug}`,
      h1: room.h1,
      icon: room.icon,
      description: room.description,
    });
  }
}

for (const room of DECISION_MANIFEST_LOCALES) {
  for (const c of room.componentCalcs ?? []) {
    // Los componentCalcs de salas país vienen con prefijo ('co/calculadora-x');
    // el slug de la calc en su colección es el pelado.
    const bare = c.slug.startsWith(`${room.country}/`)
      ? c.slug.slice(room.country.length + 1)
      : c.slug;
    add(room.country, bare, {
      href: `/${room.country}/decidir/${room.slug}`,
      h1: room.h1,
      icon: room.icon,
      description: room.description,
    });
  }
}

/**
 * Salas que usan esta calc como componente.
 * @param lang código de locale del vertical ('' = AR, 'co', 'mx', 'cl', 'pe', ...).
 *             Verticales sin salas propias (es/en/pt/ec/ve/py/uy/do) devuelven [].
 */
export function getRoomsForCalc(calcSlug: string, lang = ''): DecisionRoomLink[] {
  return byCalc.get(`${lang}:${calcSlug}`) ?? [];
}
