/**
 * Registro automático de hubs de decisión.
 *
 * Levanta con `import.meta.glob` todos los `src/lib/hubs/*.ts` que exporten un
 * `hub: HubData`. No hay lista que mantener: si alguien agrega un hub nuevo,
 * aparece solo en su silo, en el sitemap y en el índice.
 *
 * Sirve para:
 *  - las páginas de silo (/trabajo, /salud, …) que listan sus hubs
 *  - el mapa de 301: cada hub declara qué URLs viejas reemplaza
 *  - detectar colisiones (dos hubs que reclaman la misma URL vieja)
 */
import type { HubData } from './types';

// El glob es de dos niveles: `./*.ts` son los hubs de AR/global y `./<locale>/*.ts`
// los de cada mercado (co, mx, en…). Astro resuelve ambos en build.
const modules = import.meta.glob<{ hub?: HubData }>(['./*.ts', './*/*.ts'], { eager: true });

export const ALL_HUBS: HubData[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/types.ts') && !path.endsWith('/registry.ts'))
  .map(([, mod]) => mod.hub)
  .filter((h): h is HubData => !!h && typeof h.slug === 'string')
  .sort((a, b) => a.h1.localeCompare(b.h1, 'es'));

/** Hubs de un silo, por su href ('/trabajo', '/co/impuestos'). */
export function hubsOfSilo(siloHref: string): HubData[] {
  return ALL_HUBS.filter((h) => h.siloHref === siloHref);
}

/** Hubs de un mercado. Sin argumento devuelve los de AR/global. */
export function hubsOfLocale(locale?: HubData['locale']): HubData[] {
  return ALL_HUBS.filter((h) => h.locale === locale);
}

/** Silos de un mercado, para armar su índice. */
export function silosOfLocale(locale?: HubData['locale']): Array<{ silo: string; href: string; hubs: HubData[] }> {
  const map = new Map<string, { silo: string; href: string; hubs: HubData[] }>();
  for (const h of hubsOfLocale(locale)) {
    const cur = map.get(h.siloHref) ?? { silo: h.silo, href: h.siloHref, hubs: [] };
    cur.hubs.push(h);
    map.set(h.siloHref, cur);
  }
  return [...map.values()].sort((a, b) => b.hubs.length - a.hubs.length);
}

/** Todos los silos que existen hoy, derivados de los hubs. */
export function allSilos(): Array<{ silo: string; href: string; hubs: HubData[] }> {
  const map = new Map<string, { silo: string; href: string; hubs: HubData[] }>();
  for (const h of ALL_HUBS) {
    const cur = map.get(h.siloHref) ?? { silo: h.silo, href: h.siloHref, hubs: [] };
    cur.hubs.push(h);
    map.set(h.siloHref, cur);
  }
  return [...map.values()].sort((a, b) => b.hubs.length - a.hubs.length);
}

/**
 * Mapa URL vieja → URL del hub, para generar los 301.
 * Devuelve también las colisiones: dos hubs no pueden reclamar la misma URL,
 * porque el redirect quedaría indefinido según el orden del glob.
 */
export function redirectMap(): { map: Array<[string, string]>; collisions: string[] } {
  const seen = new Map<string, string>();
  const collisions: string[] = [];
  for (const h of ALL_HUBS) {
    for (const old of h.replaces ?? []) {
      if (seen.has(old) && seen.get(old) !== `/${h.slug}`) collisions.push(old);
      else seen.set(old, `/${h.slug}`);
    }
  }
  return { map: [...seen.entries()], collisions: [...new Set(collisions)] };
}
