// hreflang unificado para clusters trilingües + verticales país.
//
// Regla de la spec (Google/Bing): TODOS los miembros de un cluster deben
// declarar el MISMO set de alternates, con UN solo x-default. Antes cada
// route armaba su propio set (asimétrico) y cada idioma apuntaba x-default
// a sí mismo → señales contradictorias en ~500 clusters.
//
// Convención del sitio:
//   es    → ES raíz (Argentina)        https://hacecuentas.com/<slug>
//   en    → inglés                     https://hacecuentas.com/en/<slug>
//   pt    → portugués (Brasil)         https://hacecuentas.com/pt/<slug>
//   mx/esEs/co/cl/pe/ec → verticales   https://hacecuentas.com/<cc>/<slug>
//
// x-default → la versión ES raíz si existe; si no, el primer miembro que
// exista (en > pt > vertical). Cluster de 1 miembro → undefined y la página
// cae en el fallback de Layout.astro (self + x-default self).

import { canDistributeCalc, type CalcPolicyInput } from './content-policy.ts';

const BASE = 'https://hacecuentas.com';

export interface HreflangClusterMembers {
  /** slug pelado de la versión ES raíz (sin "/" inicial) */
  es?: string;
  en?: string;
  pt?: string;
  mx?: string;
  /** vertical España (carpeta /es/) */
  esEs?: string;
  co?: string;
  cl?: string;
  pe?: string;
  ec?: string;
  ve?: string;
  py?: string;
  uy?: string;
  do?: string;
  /** vertical Portugal (carpeta /pt-pt/, locale pt-PT) */
  ptPt?: string;
}

export interface HreflangTag {
  lang: string;
  href: string;
}

export type HreflangLocale = keyof HreflangClusterMembers;

export interface HreflangIndexEntry {
  slug: string;
  /**
   * Identidad común del cluster. Normalmente es el slug de la versión ES raíz.
   * Puede existir aunque la raíz no sea distribuible: las traducciones vivas
   * siguen pudiendo relacionarse entre sí sin apuntar a la URL retirada.
   */
  clusterKey?: string;
}

export type HreflangIndex = Partial<Record<HreflangLocale, HreflangIndexEntry[]>>;

export interface ResolvedHreflangRoute {
  members: HreflangClusterMembers;
  /**
   * `undefined` = página distribuible sin alternates (Layout emite self).
   * `[]` = página no distribuible/ambigua (Layout no debe emitir hreflang).
   */
  tags: HreflangTag[] | undefined;
}

export const HREFLANG_LOCALES: readonly HreflangLocale[] = [
  'es',
  'en',
  'pt',
  'mx',
  'esEs',
  'co',
  'cl',
  'pe',
  'ec',
  've',
  'py',
  'uy',
  'do',
  'ptPt',
] as const;

const strip = (slug?: string): string | undefined =>
  slug ? slug.replace(/^\/+/, '') : undefined;

type HreflangCalcInput = CalcPolicyInput & { canonicalSlug?: string };

const normalizePagePath = (pathname: string): string => {
  let path = pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
};

/**
 * El fallback de Layout sólo puede emitir hreflang self en una página
 * autocanónica. Los aliases con rel=canonical a otra URL no son alternates
 * válidos, aunque sigan sirviéndose con 200 por compatibilidad.
 */
export function isSelfCanonicalUrl(
  pathname: string,
  canonical: string,
  site = BASE,
): boolean {
  try {
    const canonicalUrl = new URL(canonical, site);
    const siteUrl = new URL(site);
    return (
      canonicalUrl.origin === siteUrl.origin &&
      normalizePagePath(canonicalUrl.pathname) === normalizePagePath(pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Fuente única de elegibilidad para hreflang.
 *
 * Además de la política normal de distribución, excluye aliases cuyo canonical
 * apunta a otro slug. Un alternate debe resolver directamente a una URL 200,
 * indexable y autocanónica; nunca a un salto intermedio.
 */
export function isHreflangEligibleCalc(
  calc: HreflangCalcInput | null | undefined,
  routePrefix = ''
): boolean {
  if (!calc?.slug || !canDistributeCalc(calc, routePrefix)) return false;
  const canonicalSlug = strip(calc.canonicalSlug);
  return !canonicalSlug || canonicalSlug === strip(calc.slug);
}

/**
 * Devuelve el set hreflang COMPLETO e IDÉNTICO para todos los miembros del
 * cluster, o undefined si el cluster tiene un solo miembro (solo-page →
 * fallback del Layout).
 */
export function buildHreflangCluster(
  members: HreflangClusterMembers
): HreflangTag[] | undefined {
  const es = strip(members.es);
  const en = strip(members.en);
  const pt = strip(members.pt);
  const mx = strip(members.mx);
  const esEs = strip(members.esEs);
  const co = strip(members.co);
  const cl = strip(members.cl);
  const pe = strip(members.pe);
  const ec = strip(members.ec);
  const ve = strip(members.ve);
  const py = strip(members.py);
  const uy = strip(members.uy);
  const doDom = strip(members.do);
  const ptPt = strip(members.ptPt);

  const urls = {
    es: es ? `${BASE}/${es}` : undefined,
    en: en ? `${BASE}/en/${en}` : undefined,
    pt: pt ? `${BASE}/pt/${pt}` : undefined,
    mx: mx ? `${BASE}/mx/${mx}` : undefined,
    esEs: esEs ? `${BASE}/es/${esEs}` : undefined,
    co: co ? `${BASE}/co/${co}` : undefined,
    cl: cl ? `${BASE}/cl/${cl}` : undefined,
    pe: pe ? `${BASE}/pe/${pe}` : undefined,
    ec: ec ? `${BASE}/ec/${ec}` : undefined,
    ve: ve ? `${BASE}/ve/${ve}` : undefined,
    py: py ? `${BASE}/py/${py}` : undefined,
    uy: uy ? `${BASE}/uy/${uy}` : undefined,
    do: doDom ? `${BASE}/do/${doDom}` : undefined,
    ptPt: ptPt ? `${BASE}/pt-pt/${ptPt}` : undefined,
  };

  const memberCount = Object.values(urls).filter(Boolean).length;
  if (memberCount <= 1) return undefined;

  const tags: HreflangTag[] = [];
  if (urls.es) tags.push({ lang: 'es-AR', href: urls.es });
  if (urls.en) {
    // en-US específico (mejor CTR Bing/Google US) + en genérico para el resto
    // de mercados EN. Ambos apuntan a la misma URL — válido según la spec.
    tags.push({ lang: 'en-US', href: urls.en });
    tags.push({ lang: 'en', href: urls.en });
  }
  if (urls.pt) tags.push({ lang: 'pt-BR', href: urls.pt });
  if (urls.mx) tags.push({ lang: 'es-MX', href: urls.mx });
  if (urls.esEs) tags.push({ lang: 'es-ES', href: urls.esEs });
  if (urls.co) tags.push({ lang: 'es-CO', href: urls.co });
  if (urls.cl) tags.push({ lang: 'es-CL', href: urls.cl });
  if (urls.pe) tags.push({ lang: 'es-PE', href: urls.pe });
  if (urls.ec) tags.push({ lang: 'es-EC', href: urls.ec });
  if (urls.ve) tags.push({ lang: 'es-VE', href: urls.ve });
  if (urls.py) tags.push({ lang: 'es-PY', href: urls.py });
  if (urls.uy) tags.push({ lang: 'es-UY', href: urls.uy });
  if (urls.do) tags.push({ lang: 'es-DO', href: urls.do });
  if (urls.ptPt) tags.push({ lang: 'pt-PT', href: urls.ptPt });

  const xDefault =
    urls.es ||
    urls.en ||
    urls.pt ||
    urls.mx ||
    urls.esEs ||
    urls.co ||
    urls.cl ||
    urls.pe ||
    urls.ec ||
    urls.ve ||
    urls.py ||
    urls.uy ||
    urls.do ||
    urls.ptPt;
  tags.push({ lang: 'x-default', href: xDefault! });

  return tags;
}

/**
 * Resuelve un cluster desde el índice generado en prebuild.
 *
 * Todos los routes llaman a esta misma función y consumen el mismo índice,
 * por lo que cada miembro recibe exactamente el mismo set. Si un locale tiene
 * dos candidatos para el mismo cluster se lo omite: elegir uno arbitrariamente
 * produciría un cluster no recíproco. La página duplicada queda standalone
 * hasta que se resuelva la ambigüedad editorial.
 */
export function resolveHreflangRoute(
  index: HreflangIndex,
  locale: HreflangLocale,
  rawSlug: string
): ResolvedHreflangRoute {
  const slug = strip(rawSlug);
  if (!slug) return { members: {}, tags: [] };

  const currentMatches = (index[locale] || []).filter((entry) => strip(entry.slug) === slug);
  if (currentMatches.length !== 1) {
    // No está en el índice: noindex, podada, 410, alias canónico o dato ambiguo.
    return { members: {}, tags: [] };
  }

  const current = currentMatches[0];
  if (!current.clusterKey) {
    return { members: { [locale]: slug }, tags: undefined };
  }

  const members: HreflangClusterMembers = {};
  for (const candidateLocale of HREFLANG_LOCALES) {
    const candidates = (index[candidateLocale] || []).filter(
      (entry) => entry.clusterKey === current.clusterKey
    );
    if (candidates.length === 1) {
      members[candidateLocale] = strip(candidates[0].slug);
    }
  }

  // Si este locale es ambiguo dentro del cluster, no lo vinculamos a un set
  // que no puede declarar su propia URL.
  if (members[locale] !== slug) {
    return { members: { [locale]: slug }, tags: undefined };
  }

  return { members, tags: buildHreflangCluster(members) };
}

/**
 * Busca en un catálogo (array de JSONs de calcs) la versión cuyo esSlug
 * apunta al slug ES raíz dado. `fuzzy` replica el matching laxo histórico
 * de las verticales mx/es/co/cl (slug sin prefijo "calculadora-"); pe/ec
 * usan matching estricto por esSlug.
 *
 * IMPORTANTE: si esSlug es falsy devuelve undefined — sin este guard,
 * `c.esSlug === undefined` matchearía la primera calc del catálogo que no
 * tenga campo esSlug.
 */
export function findVersionByEsSlug(
  catalog: any[],
  esSlug: string | undefined,
  fuzzy = false
): any | undefined {
  if (!esSlug) return undefined;
  return catalog.find(
    (c: any) =>
      c.esSlug === esSlug ||
      (fuzzy &&
        c.slug &&
        c.slug.replace('calculadora-', '') === esSlug.replace('calculadora-', ''))
  );
}

/**
 * Set hreflang único y simétrico para TODAS las homes (raíz, /en, /pt,
 * /global y las 6 verticales). x-default → home raíz en todas.
 */
export const HOME_HREFLANG: HreflangTag[] = [
  { lang: 'es-AR', href: `${BASE}/` },
  { lang: 'es', href: `${BASE}/global` },
  { lang: 'es-ES', href: `${BASE}/es` },
  { lang: 'es-MX', href: `${BASE}/mx` },
  { lang: 'es-CO', href: `${BASE}/co` },
  { lang: 'es-CL', href: `${BASE}/cl` },
  { lang: 'es-PE', href: `${BASE}/pe` },
  { lang: 'es-EC', href: `${BASE}/ec` },
  { lang: 'es-VE', href: `${BASE}/ve` },
  { lang: 'es-PY', href: `${BASE}/py` },
  { lang: 'es-UY', href: `${BASE}/uy` },
  { lang: 'es-DO', href: `${BASE}/do` },
  { lang: 'en-US', href: `${BASE}/en` },
  { lang: 'en', href: `${BASE}/en` },
  { lang: 'pt-BR', href: `${BASE}/pt` },
  { lang: 'pt-PT', href: `${BASE}/pt-pt` },
  { lang: 'x-default', href: `${BASE}/` },
];
