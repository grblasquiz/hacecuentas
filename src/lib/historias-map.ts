/**
 * historias-map.ts — mapa inverso artículo → Web Story (/historias/<slug>).
 *
 * Cada historia declara su `article` de origen, pero el artículo no linkeaba de
 * vuelta: las 7 historias tenían UN solo link entrante (el índice /historias).
 * Los blog posts incluso traen un campo `webStory` que NADIE renderizaba.
 *
 * Generado a mano desde el campo `article` de src/content/historias/*.json
 * (son 7; si agregás una, sumá la entrada acá).
 */

export interface HistoriaRef {
  slug: string;
  title: string;
}

/** Clave = path del artículo tal cual figura en `article` de la historia. */
export const ARTICLE_TO_HISTORIA: Record<string, HistoriaRef> = {
  '/calculadora-aguinaldo-sac': { slug: 'aguinaldo-2026-como-se-calcula', title: 'Aguinaldo 2026: cómo se calcula' },
  '/blog/aguinaldo-2026-plazo-fijo-dolar-uva-donde-conviene': { slug: 'aguinaldo-2026-plazo-fijo-dolar-uva', title: 'Aguinaldo 2026: plazo fijo, dólar o UVA' },
  '/blog/cuanto-cuesta-calefaccionar-casa-invierno-2026': { slug: 'calefaccion-invierno-2026', title: 'Cuánto cuesta calefaccionar la casa' },
  '/cuanto-perdio-tu-sueldo': { slug: 'cuanto-perdio-tu-sueldo-inflacion', title: 'Cuánto perdió tu sueldo con la inflación' },
  '/fixture-mundial-2026': { slug: 'mundial-2026-lo-que-tenes-que-saber-hoy', title: 'Mundial 2026: lo que tenés que saber hoy' },
  '/calculadora-monotributo-categoria-2026-recategorizacion-julio': { slug: 'recategorizacion-monotributo-julio-2026', title: 'Recategorización del monotributo: julio 2026' },
  '/blog/vacaciones-invierno-2026-cuanto-sale-presupuesto': { slug: 'vacaciones-invierno-2026', title: 'Vacaciones de invierno 2026: cuánto sale' },
};

/** Historia asociada a un path de artículo, o null. */
export function getHistoriaForArticle(articlePath: string | undefined | null): HistoriaRef | null {
  if (!articlePath) return null;
  return ARTICLE_TO_HISTORIA[articlePath] || null;
}
