/**
 * hub-config — normaliza la data de un hub agrupador a un `HubConfig` único que
 * consume `PillarHub.astro` (la plantilla del mockup aprobado). Una sola
 * plantilla para pilares Y categorías: cada builder arma el config desde la
 * fuente real correspondiente, sin duplicar markup por ruta (brief 2026-07-12).
 *
 * Builders PUROS (sin `import.meta.glob`): reciben la data ya resuelta desde el
 * `.astro` (que ya globea calcs/guías) para no re-globear en cada página.
 */
import type { PillarDef } from './pillars';
import { HUB_CONTENT, type HubReceipt } from './hub-content';
import { DECISION_MANIFEST } from './decisions/manifest';
import { cleanDesc } from './category-layout';
import {
  CATEGORY_TITLES,
  CATEGORY_ICONS,
  SIBLING_CATEGORIES,
  GUIDE_TITLES,
} from './category-guide-map';

const YEAR = 2026;
const TONES = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'] as const;

export interface HubCardView {
  href: string;
  icon: string;
  badge: string;
  title: string;
  blurb: string;
  meta: string;
  cta: string;
  receipt?: HubReceipt;
}
export interface HubNeedView { icon: string; tone: string; title: string; desc: string; href: string }
export interface HubRoomView { href: string; icon: string; h1: string; tag?: string; num: string }
export interface HubFactView { icon: string; title: string; desc: string; href: string }
export interface HubQuickView {
  tag: string;
  title: string;
  desc: string;
  placeholder?: string;
  cta: string;
  micro?: string;
  href: string;
  variant: 'input' | 'cta';
}
export interface HubConfig {
  color: string;
  nav: string;
  h1: string;
  seoTail?: string; // texto sr-only con la keyword (cuando el título visible es beneficio puro)
  breadcrumb: Array<{ label: string; href?: string }>;
  eyebrow: string;
  titleLines: string[];
  lead: string;
  trust: string[];
  quick?: HubQuickView;
  needsKicker: string;
  needsTitle: string;
  needsSub: string;
  needs: HubNeedView[];
  featuredKicker: string;
  featuredTitle: string;
  featuredSub: string;
  showFeaturedSearch: boolean;
  filterBadges: string[];
  allNote?: string;
  primary?: HubCardView;
  cards: HubCardView[];
  roomsKicker: string;
  roomsTitle: string;
  roomsSub: string;
  rooms: HubRoomView[];
  guide?: { href: string; badge: string; h1: string; description: string };
  factsTitle: string;
  facts: HubFactView[];
  schema?: object; // sólo pilares (en categorías el schema lo emite el Layout)
  schemaBreadcrumb?: object;
}

const catLabel = (cat?: string) => CATEGORY_TITLES[cat || ''] || 'Calculadora';

/* ─────────────────────────  PILARES  ───────────────────────── */

export function buildPillarConfig(
  pillar: PillarDef,
  ctx: { calcBySlug: Map<string, any>; guiaBySlug: Map<string, any> },
): HubConfig {
  const { calcBySlug, guiaBySlug } = ctx;
  const c = HUB_CONTENT[pillar.slug];

  const buildCard = (slug: string, o?: any): HubCardView | null => {
    const calc = calcBySlug.get(slug);
    if (!calc) return null;
    return {
      href: `/${slug}`,
      icon: calc.icon || '🧮',
      badge: o?.badge || catLabel(calc.category),
      title: o?.title || calc.h1,
      blurb: o?.blurb || cleanDesc(calc.description || calc.answerSnippet || ''),
      meta: o?.meta || `Actualizada ${YEAR}`,
      cta: o?.cta || 'Calcular →',
      receipt: o?.receipt,
    };
  };

  const mainCalc = calcBySlug.get(pillar.mainCalc);
  const primary = mainCalc ? buildCard(pillar.mainCalc, c?.primary) : undefined;
  const cards = pillar.calcs
    .filter((s) => s !== pillar.mainCalc)
    .map((s) => buildCard(s, c?.cards?.[s]))
    .filter(Boolean) as HubCardView[];

  const roomsBySlug = new Map(DECISION_MANIFEST.map((r) => [r.slug, r]));
  const rooms: HubRoomView[] = pillar.rooms
    .map((s) => roomsBySlug.get(s))
    .filter(Boolean)
    .slice(0, 6)
    .map((r: any, i: number) => ({
      href: `/decidir/${r.slug}`,
      icon: r.icon,
      h1: r.h1,
      tag: c?.roomTags?.[r.slug],
      num: String(i + 1).padStart(2, '0'),
    }));

  const guia = guiaBySlug.get(pillar.guide);
  const facts: HubFactView[] =
    c?.facts && c.facts.length
      ? c.facts
      : pillar.dataPages.map((d) => ({ icon: '📈', title: d.label, desc: '', href: d.href }));

  const quick: HubQuickView | undefined =
    c?.quick && mainCalc
      ? { ...c.quick, href: `/${mainCalc.slug}`, variant: 'input' }
      : undefined;

  const siteUrl = 'https://hacecuentas.com';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pillar.h1,
    description: pillar.description,
    url: `${siteUrl}/${pillar.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: (primary ? 1 : 0) + cards.length,
      itemListElement: [primary, ...cards].filter(Boolean).map((k: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: k.title,
        url: `${siteUrl}${k.href}`,
      })),
    },
  };
  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: pillar.h1, item: `${siteUrl}/${pillar.slug}` },
    ],
  };

  return {
    color: pillar.color,
    nav: pillar.nav,
    h1: pillar.h1,
    seoTail: `${pillar.h1} 2026`,
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: pillar.nav }],
    eyebrow: c?.eyebrow || `${pillar.icon} ${pillar.nav}`,
    titleLines: c?.titleLines || [pillar.h1],
    lead: c?.lead || pillar.intro,
    trust: c?.trust || ['Fórmulas verificadas', `Normativa ${YEAR}`, 'Cálculo privado'],
    quick,
    needsKicker: 'Elegí por necesidad',
    needsTitle: '¿Qué necesitás resolver hoy?',
    needsSub: 'Llegá a la herramienta correcta sin conocer su nombre técnico.',
    needs: (c?.needs || []).map((n) => ({ ...n })),
    featuredKicker: 'Herramientas populares',
    featuredTitle: 'Calculadoras destacadas',
    featuredSub: `Las más usadas para entender ${pillar.nav.toLowerCase()} sin vueltas.`,
    showFeaturedSearch: true,
    filterBadges: [...new Set(cards.map((k) => k.badge))],
    allNote: `Estás viendo las calculadoras destacadas de ${pillar.nav}.`,
    primary,
    cards,
    roomsKicker: 'Más que una calculadora',
    roomsTitle: 'Tomá una decisión con todos los números',
    roomsSub: 'Las salas combinan varias herramientas y te dan una recomendación clara.',
    rooms,
    guide: guia
      ? {
          href: `/guia/${guia.slug}`,
          badge: c?.guideBadge || 'Guía esencial 2026',
          h1: guia.h1,
          description: guia.description,
        }
      : undefined,
    factsTitle: 'Datos de referencia',
    facts,
    schema,
    schemaBreadcrumb,
  };
}

/* ─────────────────────────  CATEGORÍAS  ───────────────────────── */

export interface CategoryHubInput {
  cat: string;
  label: string;
  color: string;
  icon: string;
  intro: string;
  featured: any[]; // featuredCalcs(cat)
  renderGroups: Array<{ id: string | null; title: string | null; icon: string | null; calcs: any[] }>;
  totalCalcs: number;
  pillarSlug?: string | null;
  guia?: any | null; // JSON de la guía-pilar (si se pudo resolver)
}

export function buildCategoryConfig(input: CategoryHubInput): HubConfig {
  const { cat, label, color, icon, intro, featured, renderGroups, totalCalcs, pillarSlug, guia } = input;
  const labelLc = label.toLowerCase();

  // slug → título de sub-grupo (para el badge de cada card destacada).
  const groupOf = new Map<string, { id: string; title: string; icon: string }>();
  const realGroups = renderGroups.filter((g) => g.id && g.title);
  for (const g of realGroups) {
    for (const c of g.calcs) groupOf.set(c.slug, { id: g.id!, title: g.title!, icon: g.icon || '🧮' });
  }

  const seen = new Set<string>();
  const take = (c: any): HubCardView => {
    seen.add(c.slug);
    const g = groupOf.get(c.slug);
    return {
      href: `/${c.slug}`,
      icon: c.icon || '🧮',
      badge: g?.title || label,
      title: c.h1,
      blurb: cleanDesc(c.description || c.answerSnippet || ''),
      meta: `Actualizada ${YEAR}`,
      cta: 'Calcular →',
    };
  };

  // Destacadas = featured curadas + primer calc de cada sub-grupo, y si faltan
  // (categorías sin featured ni sub-grupos) se completa con el listado plano.
  const allCalcs = renderGroups.flatMap((g) => g.calcs);
  const picked: any[] = [];
  for (const c of featured) if (c && !seen.has(c.slug)) { picked.push(c); seen.add(c.slug); }
  for (const g of realGroups) {
    if (picked.length >= 9) break;
    const first = g.calcs.find((c) => !seen.has(c.slug));
    if (first) { picked.push(first); seen.add(first.slug); }
  }
  for (const c of allCalcs) {
    if (picked.length >= 9) break;
    if (c && !seen.has(c.slug)) { picked.push(c); seen.add(c.slug); }
  }
  seen.clear();
  const views = picked.slice(0, 9).map(take);
  const primary = views[0];
  const cards = views.slice(1);

  // Necesidades = sub-temas del grid (saltan al ancla del sub-grupo). Sólo se
  // muestran cuando la categoría tiene sub-grupos reales; en categorías planas
  // duplicarían las destacadas, así que la sección se omite.
  const needs: HubNeedView[] =
    realGroups.length >= 2
      ? realGroups.slice(0, 6).map((g, i) => ({
          icon: g.icon || '🧮',
          tone: TONES[i % 6],
          title: g.title!,
          desc: `${g.calcs.length} ${g.calcs.length === 1 ? 'calculadora' : 'calculadoras'}`,
          href: `#g-${g.id}`,
        }))
      : [];

  // Salas de decisión de esta categoría (muchas categorías no tienen → se oculta).
  const rooms: HubRoomView[] = DECISION_MANIFEST
    .filter((r) => r.category === cat)
    .slice(0, 6)
    .map((r, i) => ({ href: `/decidir/${r.slug}`, icon: r.icon, h1: r.h1, num: String(i + 1).padStart(2, '0') }));

  // Datos de referencia = categorías hermanas + todo el catálogo.
  const facts: HubFactView[] = (SIBLING_CATEGORIES[cat] || [])
    .filter((s) => CATEGORY_TITLES[s])
    .map((s) => ({
      icon: CATEGORY_ICONS[s] || '🧮',
      title: `Calculadoras de ${CATEGORY_TITLES[s]}`,
      desc: 'Explorá una temática relacionada.',
      href: `/categoria/${s}`,
    }));
  facts.push({ icon: '🔎', title: 'Todas las calculadoras', desc: 'El catálogo completo, con buscador.', href: '/calculadoras' });

  const quick: HubQuickView | undefined = primary
    ? {
        tag: '⚡ La más usada',
        title: primary.title,
        desc: primary.blurb,
        cta: 'Abrir calculadora →',
        href: primary.href,
        variant: 'cta',
      }
    : undefined;

  return {
    color,
    nav: label,
    h1: `Calculadoras de ${label}`,
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label }],
    eyebrow: `${icon} Categoría`,
    titleLines: ['Calculadoras de', label],
    lead: intro,
    trust: ['Fórmulas verificadas', `Actualizadas ${YEAR}`, 'Cálculo privado'],
    quick,
    needsKicker: 'Explorá por tema',
    needsTitle: '¿Qué querés calcular?',
    needsSub: 'Elegí un tema y saltá directo a esas calculadoras.',
    needs,
    featuredKicker: 'Herramientas populares',
    featuredTitle: 'Las más usadas',
    featuredSub: `Las calculadoras de ${labelLc} que más se usan.`,
    showFeaturedSearch: false,
    filterBadges: [],
    allNote: `Y todas las ${totalCalcs} calculadoras de ${labelLc}, más abajo ↓`,
    primary,
    cards,
    roomsKicker: 'Más que una calculadora',
    roomsTitle: 'Tomá una decisión con todos los números',
    roomsSub: 'Las salas combinan varias herramientas y te dan una recomendación clara.',
    rooms,
    guide:
      pillarSlug
        ? {
            href: `/guia/${pillarSlug}`,
            badge: 'Guía completa',
            h1: guia?.h1 || GUIDE_TITLES[pillarSlug] || `Guía de ${labelLc}`,
            description:
              guia?.description ||
              `Contexto, conceptos clave y cómo usar las calculadoras de ${labelLc}.`,
          }
        : undefined,
    factsTitle: 'Seguí explorando',
    facts,
  };
}
