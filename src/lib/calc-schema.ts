/**
 * Helpers compartidos de JSON-LD para las páginas de calculadora.
 *
 * Antes cada ruta por locale (`src/pages/<cc>/[...slug].astro`) tenía su propia
 * copia del schema. Las copias se fueron desincronizando de la ruta raíz
 * (`src/pages/[...slug].astro`) y quedaron con defectos reales:
 *
 *   - `applicationCategory` clavado en 'UtilitiesApplication' para todas las
 *     categorías (una calc de IRPF declarada como "utilidad", no finanzas).
 *   - `speakable.cssSelector` con selectores fantasma que no existen en el DOM
 *     renderizado (`#faq dt`, `#faq dd`, `#cuando-usar p`). Speakable roto a
 *     escala es señal de markup auto-generado.
 *   - `citation: []` vacío en cada página sin fuentes, y como array de strings
 *     en vez de nodos `CreativeWork` (la raíz ya usa objetos).
 *   - `description` cruda: Search Console marca "longitud de cadena no válida"
 *     cuando baja de ~50 chars.
 *   - Breadcrumb con dos ListItem apuntando a la MISMA url (la home del locale),
 *     y el crumb de categoría enlazando a un destino que no es esa categoría.
 *   - `priceCurrency` de otro país (BRL/PYG/UYU/VES/DOP servidos como USD).
 *
 * Este módulo es la fuente única de esas piezas.
 */

/** Categoría interna → applicationCategory de schema.org. */
export const APPLICATION_CATEGORY_MAP: Record<string, string> = {
  finanzas: 'FinanceApplication',
  impuestos: 'FinanceApplication',
  negocios: 'BusinessApplication',
  negocio: 'BusinessApplication',
  marketing: 'BusinessApplication',
  salud: 'HealthApplication',
  mascotas: 'HealthApplication',
  familia: 'LifestyleApplication',
  vida: 'LifestyleApplication',
  hogar: 'LifestyleApplication',
  jardineria: 'LifestyleApplication',
  cocina: 'LifestyleApplication',
  viajes: 'TravelApplication',
  deportes: 'HealthApplication',
  educacion: 'EducationalApplication',
  idiomas: 'EducationalApplication',
  matematica: 'EducationalApplication',
  ciencia: 'EducationalApplication',
  astronomia: 'EducationalApplication',
  clima: 'UtilitiesApplication',
  'medio-ambiente': 'UtilitiesApplication',
  construccion: 'UtilitiesApplication',
  automotor: 'UtilitiesApplication',
  tecnologia: 'UtilitiesApplication',
  electronica: 'UtilitiesApplication',
  entretenimiento: 'GameApplication',
  juegos: 'GameApplication',
};

export function applicationCategoryFor(category: string): string {
  return APPLICATION_CATEGORY_MAP[category] || 'UtilitiesApplication';
}

/**
 * Selectores speakable verificados uno por uno contra el markup de
 * `CalcLayoutV2.astro` (el layout que rendea TODAS las calcs, en todos los
 * locales).
 *
 * Los que había antes — `.answer-snippet`, `.aeo-quick-answer`, `.calc-intro`,
 * `.calc-key-takeaway`, `.use-cases li`, `.faq-list …` — no existen en ese
 * layout: son clases de páginas sueltas (`goleadores-mundial-2026`,
 * `dia-del-nino-2026-cuando-es`). En las calcs no matcheaban nada.
 *
 * NO agregar un selector sin confirmarlo en el layout: speakable apuntando al
 * vacío a escala se lee como markup generado a ciegas.
 */
export const SPEAKABLE_SELECTORS: string[] = [
  '[data-speakable]',                    // aside de respuesta rápida (v2-quick / v3-quick-dark)
  'h1',                                  // título principal
  '.v2-lede',                            // bajada (description/intro) bajo el h1
  '#intro > div > p:first-of-type',      // primer párrafo de la intro
  '#cuando-usar li',                     // casos de uso (alta densidad de intent)
  '#como-funciona p:first-of-type',      // primer párrafo de la explicación
  '#faq details > div p:first-of-type',  // primer párrafo de cada respuesta FAQ
];

/** Selectores speakable del nodo FAQPage (bloque `#faq` de CalcLayoutV2). */
export const FAQ_SPEAKABLE_SELECTORS: string[] = [
  '#faq summary',
  '#faq details > div',
];

/**
 * Description "safe" para structured data: Google exige ~50 chars mínimo en
 * Article/SoftwareApplication/Dataset. Si `description` es corta, completa con
 * contenido real de la calc (h1, keyTakeaway, categoría) — nunca con relleno.
 */
export function buildSchemaDescription(
  calc: any,
  categoryLabels: Record<string, string> = {},
): string {
  const base = String(calc?.description || '').trim();
  if (base.length >= 50) return base.slice(0, 500);
  const parts = [base];
  if (calc?.h1) parts.push(String(calc.h1));
  if (calc?.keyTakeaway) parts.push(String(calc.keyTakeaway).replace(/\*\*/g, ''));
  const catLabel = categoryLabels[calc?.category] || calc?.category;
  if (catLabel) parts.push(`Categoría: ${catLabel}.`);
  const merged = parts.filter(Boolean).join(' — ').trim();
  return (merged.length >= 50
    ? merged
    : `${merged} Calculadora gratis, sin registro, resultado inmediato.`
  ).slice(0, 500);
}

/**
 * `citation` como nodos CreativeWork (url + name + fecha + publisher) en vez de
 * strings sueltos: Bing/Copilot validan fuente y fecha antes de citar.
 * Devuelve `undefined` cuando no hay fuentes, para no emitir `citation: []`.
 */
export function citationNodes(sources: any): any[] | undefined {
  const list = (Array.isArray(sources) ? sources : [])
    .map((s: any) => {
      if (!s || (!s.url && !s.name)) return null;
      const o: any = { '@type': 'CreativeWork', name: s.name || s.url };
      if (s.url) o.url = s.url;
      if (s.date) o.datePublished = String(s.date);
      if (s.publisher) o.publisher = { '@type': 'Organization', name: s.publisher };
      return o;
    })
    .filter(Boolean);
  return list.length ? list : undefined;
}

/** Metadata por prefijo de locale (el segmento de URL, no el código ISO). */
export const LOCALE_META: Record<
  string,
  { lang: string; currency: string; country: string; home: string }
> = {
  cl:      { lang: 'es-CL', currency: 'CLP', country: 'Chile',                 home: 'Inicio' },
  co:      { lang: 'es-CO', currency: 'COP', country: 'Colombia',              home: 'Inicio' },
  do:      { lang: 'es-DO', currency: 'DOP', country: 'República Dominicana',  home: 'Inicio' },
  ec:      { lang: 'es-EC', currency: 'USD', country: 'Ecuador',               home: 'Inicio' },
  en:      { lang: 'en-US', currency: 'USD', country: 'United States',         home: 'Home' },
  es:      { lang: 'es-ES', currency: 'EUR', country: 'España',                home: 'Inicio' },
  mx:      { lang: 'es-MX', currency: 'MXN', country: 'México',                home: 'Inicio' },
  pe:      { lang: 'es-PE', currency: 'PEN', country: 'Perú',                  home: 'Inicio' },
  pt:      { lang: 'pt-BR', currency: 'BRL', country: 'Brasil',                home: 'Início' },
  'pt-pt': { lang: 'pt-PT', currency: 'EUR', country: 'Portugal',              home: 'Início' },
  py:      { lang: 'es-PY', currency: 'PYG', country: 'Paraguay',              home: 'Inicio' },
  uy:      { lang: 'es-UY', currency: 'UYU', country: 'Uruguay',               home: 'Inicio' },
  ve:      { lang: 'es-VE', currency: 'VES', country: 'Venezuela',             home: 'Inicio' },
};

/**
 * BreadcrumbList de una calc por locale: Inicio (raíz) → País (home del locale)
 * → calc.
 *
 * No emitimos crumb de categoría porque no existe una página de categoría por
 * locale: la versión anterior lo enlazaba a la home del locale, lo que dejaba
 * dos ListItem con la MISMA `item` y un crumb cuyo nombre no correspondía a su
 * destino. Tres niveles reales valen más que cuatro con uno inventado.
 */
export function localeBreadcrumb(locale: string, calcH1: string) {
  const meta = LOCALE_META[locale];
  const country = meta?.country || locale.toUpperCase();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: meta?.home || 'Inicio', item: 'https://hacecuentas.com/' },
      { '@type': 'ListItem', position: 2, name: country, item: `https://hacecuentas.com/${locale}/` },
      { '@type': 'ListItem', position: 3, name: calcH1 },
    ],
  };
}
