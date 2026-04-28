#!/usr/bin/env python3
"""
Genera src/pages/{mx,co,cl}/index.astro a partir del template de /es/.
Uso: python3 scripts/build-country-hub.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = (ROOT / "src/pages/es/index.astro").read_text()

# Configs por país
COUNTRIES = {
    "mx": {
        "audience": "MX",
        "code": "MX",
        "flag": "🇲🇽",
        "country_name": "México",
        "country_label": "México",
        "lang_code": "es-MX",
        "title": "Calculadoras México 2026 — ISR, IMSS, RFC | Hacé Cuentas",
        "description_template": "${totalCalcs} calculadoras gratis para México: ISR, IMSS, RFC, finiquito, INFONAVIT, AFORE. Datos oficiales SAT 2026.",
        "hero_h1": "Calculadoras para México",
        "hero_sub": "ISR, IMSS, RFC, finiquito, INFONAVIT, aguinaldo, prima vacacional. Datos oficiales SAT, IMSS y CONDUSEF. Gratis y sin registro.",
        "popular_slugs_comment": "(curado MX)",
        "popular_slugs": [
            "calculadora-isr-mexico",
            "calculadora-finiquito-mexico",
            "calculadora-imss-cuotas",
            "calculadora-aguinaldo-mexico",
            "calculadora-prima-vacacional-mexico",
            "calculadora-rfc-homoclave",
        ],
        "categories_intro_finanzas": "Sueldo, ISR, ahorro, AFORE, hipoteca.",
        "categories_intro_impuestos": "ISR 2026, IVA 16%, RFC, declaración anual SAT.",
        "categories_intro_familia": "Maternidad, escolarización, hijos.",
        "categories_intro_vida": "Renta, escrituración, costo de vida.",
        "categories_intro_automotor": "Tenencia, verificación, financiamiento auto.",
        "categories_intro_educacion": "Becas CONACYT, calificaciones.",
        "schema_breadcrumb_country": "México",
        "category_keys_priority": "impuestos,finanzas,vida,familia,salud,automotor,educacion,negocios,marketing,deportes,viajes,cocina,mascotas,matematica,tecnologia,medio-ambiente,electronica,ciencia,jardineria,construccion",
    },
    "co": {
        "audience": "CO",
        "code": "CO",
        "flag": "🇨🇴",
        "country_name": "Colombia",
        "country_label": "Colombia",
        "lang_code": "es-CO",
        "title": "Calculadoras Colombia 2026 — DIAN, retefuente, EPS | Hacé Cuentas",
        "description_template": "${totalCalcs} calculadoras gratis para Colombia: retefuente DIAN, prima legal, cesantías, EPS, salario mínimo. Datos oficiales 2026.",
        "hero_h1": "Calculadoras para Colombia",
        "hero_sub": "Retefuente DIAN, prima legal, cesantías, EPS, salario mínimo, ICA. Datos oficiales DIAN, MinTrabajo y Banco de la República. Gratis.",
        "popular_slugs_comment": "(curado CO)",
        "popular_slugs": [
            "calculadora-prima-legal-colombia",
            "calculadora-cesantias-colombia",
            "calculadora-retefuente-colombia",
            "calculadora-liquidacion-laboral-colombia",
            "calculadora-salario-minimo-colombia-2026",
            "calculadora-aporte-eps-pension-colombia",
        ],
        "categories_intro_finanzas": "Sueldo, retefuente, prima legal, cesantías.",
        "categories_intro_impuestos": "Retefuente DIAN 2026, IVA 19%, ICA, declaración renta.",
        "categories_intro_familia": "Licencia maternidad, hijos, escolarización.",
        "categories_intro_vida": "Arriendo, costo de vida, mercado.",
        "categories_intro_automotor": "Soat, impuesto vehículos, gasolina vs gas.",
        "categories_intro_educacion": "ICETEX, créditos universitarios, becas.",
        "schema_breadcrumb_country": "Colombia",
        "category_keys_priority": "finanzas,impuestos,vida,familia,salud,automotor,educacion,negocios,marketing,deportes,viajes,cocina,mascotas,matematica,tecnologia,medio-ambiente,electronica,ciencia,jardineria,construccion",
    },
    "cl": {
        "audience": "CL",
        "code": "CL",
        "flag": "🇨🇱",
        "country_name": "Chile",
        "country_label": "Chile",
        "lang_code": "es-CL",
        "title": "Calculadoras Chile 2026 — SII, AFP, isapre, finiquito | Hacé Cuentas",
        "description_template": "${totalCalcs} calculadoras gratis para Chile: impuesto a la renta SII, AFP, isapre, finiquito, gratificación, sueldo líquido. Datos 2026.",
        "hero_h1": "Calculadoras para Chile",
        "hero_sub": "Impuesto a la renta SII, AFP, isapre, finiquito, gratificación legal, sueldo líquido. Datos oficiales SII, Suseso y Banco Central. Gratis.",
        "popular_slugs_comment": "(curado CL)",
        "popular_slugs": [
            "calculadora-finiquito-chile",
            "calculadora-sueldo-liquido-chile",
            "calculadora-gratificacion-legal-chile",
            "calculadora-impuesto-renta-chile",
            "calculadora-afp-pension-chile",
            "calculadora-isapre-cotizacion-chile",
        ],
        "categories_intro_finanzas": "Sueldo líquido, AFP, ahorro, hipoteca CMF.",
        "categories_intro_impuestos": "Impuesto a la renta SII 2026, IVA 19%.",
        "categories_intro_familia": "Postnatal, escolarización, hijos.",
        "categories_intro_vida": "Arriendo, costo de vida, UF.",
        "categories_intro_automotor": "Permiso circulación, revisión técnica.",
        "categories_intro_educacion": "Gratuidad, CAE, becas Junaeb.",
        "schema_breadcrumb_country": "Chile",
        "category_keys_priority": "finanzas,impuestos,vida,familia,salud,automotor,educacion,negocios,marketing,deportes,viajes,cocina,mascotas,matematica,tecnologia,medio-ambiente,electronica,ciencia,jardineria,construccion",
    },
}


def render_for_country(cc: str, cfg: dict) -> str:
    audience = cfg["audience"]
    flag = cfg["flag"]
    cname = cfg["country_name"]

    glob_dir = f"calcs-{cc}"
    has_locale_dir = (ROOT / "src" / "content" / glob_dir).exists()

    # Para /mx existe calcs-mx/, para /co y /cl no
    if has_locale_dir:
        loader = f"""const localeModules = import.meta.glob<any>('../../content/{glob_dir}/*.json', {{ eager: true }});
const mainModules = import.meta.glob<any>('../../content/calcs/*.json', {{ eager: true }});
const localeCalcs = Object.values(localeModules).map((m: any) => m.default || m);
const audienceFiltered = Object.values(mainModules)
  .map((m: any) => m.default || m)
  .filter((c: any) => c.audience === '{audience}');
const calcs = [...localeCalcs, ...audienceFiltered];

const localeSlugs = new Set(localeCalcs.map((c: any) => c.slug));
function calcUrl(c: any): string {{
  return localeSlugs.has(c.slug) ? `/{cc}/${{c.slug}}` : `/${{c.slug}}`;
}}"""
    else:
        loader = f"""const mainModules = import.meta.glob<any>('../../content/calcs/*.json', {{ eager: true }});
const calcs = Object.values(mainModules)
  .map((m: any) => m.default || m)
  .filter((c: any) => c.audience === '{audience}');

function calcUrl(c: any): string {{
  // /co y /cl no tienen calcs locale: todas vienen de calcs/, URL en root
  return `/${{c.slug}}`;
}}"""

    popular_arr = ',\n  '.join(f"'{s}'" for s in cfg["popular_slugs"])
    cat_keys = ','.join(f"'{k}'" for k in cfg["category_keys_priority"].split(","))

    return f"""---
export const prerender = true;

import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import ScrollToTop from '../../components/ScrollToTop.astro';

{loader}

const byCategory: Record<string, any[]> = {{}};
calcs.forEach((c) => {{
  if (!byCategory[c.category]) byCategory[c.category] = [];
  byCategory[c.category].push(c);
}});

const categoryMeta: Record<string, {{ label: string; desc: string; color: string; icon: string }}> = {{
  finanzas:        {{ label: 'Finanzas',       desc: '{cfg["categories_intro_finanzas"]}',                color: '#2563eb', icon: '💰' }},
  impuestos:       {{ label: 'Impuestos',      desc: '{cfg["categories_intro_impuestos"]}',                color: '#7c3aed', icon: '🧾' }},
  salud:           {{ label: 'Salud',          desc: 'IMC, calorías, embarazo, fitness.',                  color: '#16a34a', icon: '❤️' }},
  familia:         {{ label: 'Familia',        desc: '{cfg["categories_intro_familia"]}',                  color: '#db2777', icon: '👨‍👩‍👧' }},
  vida:            {{ label: 'Vida cotidiana', desc: '{cfg["categories_intro_vida"]}',                     color: '#d97706', icon: '🏠' }},
  automotor:       {{ label: 'Automotor',      desc: '{cfg["categories_intro_automotor"]}',                color: '#6366f1', icon: '🚗' }},
  educacion:       {{ label: 'Educación',      desc: '{cfg["categories_intro_educacion"]}',                color: '#8b5cf6', icon: '🎓' }},
  negocios:        {{ label: 'Negocios',       desc: 'Márgenes, IVA, modelos fiscales.',                   color: '#0891b2', icon: '📊' }},
  marketing:       {{ label: 'Marketing',      desc: 'CTR, CPC, ROAS, CAC, LTV.',                          color: '#e11d48', icon: '📈' }},
  deportes:        {{ label: 'Deportes',       desc: 'Pace, 1RM, VO2 max, ciclismo.',                      color: '#65a30d', icon: '🏃' }},
  viajes:          {{ label: 'Viajes',         desc: 'Combustible, presupuesto, propinas.',                color: '#0891b2', icon: '✈️' }},
  cocina:          {{ label: 'Cocina',         desc: 'Tazas a gramos, ajustar receta.',                    color: '#ea580c', icon: '🍳' }},
  mascotas:        {{ label: 'Mascotas',       desc: 'Edad perro/gato, alimentación.',                     color: '#db2777', icon: '🐕' }},
  matematica:      {{ label: 'Matemática',     desc: 'Promedios, Pitágoras, conversores.',                 color: '#0d9488', icon: '🧮' }},
  tecnologia:      {{ label: 'Tecnología',     desc: 'Almacenamiento, IA, batería, cloud.',                color: '#06b6d4', icon: '💻' }},
  'medio-ambiente':{{ label: 'Medio Ambiente', desc: 'Huella de carbono, energía solar.',                  color: '#22c55e', icon: '🌱' }},
  electronica:     {{ label: 'Electrónica',    desc: 'Ley de Ohm, kWh, circuitos.',                        color: '#f59e0b', icon: '⚡' }},
  ciencia:         {{ label: 'Ciencia',        desc: 'Física, química, astronomía.',                       color: '#6366f1', icon: '🔬' }},
  jardineria:      {{ label: 'Jardinería',     desc: 'Riego, tierra, siembra.',                            color: '#15803d', icon: '🌿' }},
  construccion:    {{ label: 'Construcción',   desc: 'Materiales, presupuesto reforma.',                   color: '#b45309', icon: '🧱' }},
}};

const categoryOrder = [{cat_keys}];
const activeCategories = categoryOrder.filter((cat) => byCategory[cat] && byCategory[cat].length > 0);

const totalCalcs = calcs.length;

const popularSlugs = [
  {popular_arr}
];
const popular = popularSlugs.map((s) => calcs.find((c) => c.slug === s)).filter(Boolean);

const schema = {{
  '@context': 'https://schema.org',
  '@graph': [
    {{
      '@type': ['CollectionPage', 'WebPage'],
      '@id': 'https://hacecuentas.com/{cc}#webpage',
      url: 'https://hacecuentas.com/{cc}',
      name: '{cfg["title"]}',
      description: `Calculadoras gratis específicas para {cname}.`,
      inLanguage: '{cfg["lang_code"]}',
      isPartOf: {{ '@id': 'https://hacecuentas.com/#website' }},
      breadcrumb: {{ '@id': 'https://hacecuentas.com/{cc}#breadcrumb' }},
    }},
    {{
      '@type': 'BreadcrumbList',
      '@id': 'https://hacecuentas.com/{cc}#breadcrumb',
      itemListElement: [
        {{ '@type': 'ListItem', position: 1, name: 'Hacé Cuentas', item: 'https://hacecuentas.com/' }},
        {{ '@type': 'ListItem', position: 2, name: '{cname}', item: 'https://hacecuentas.com/{cc}' }},
      ],
    }},
  ],
}};

const hreflangTags = [
  {{ lang: '{cfg["lang_code"]}',     href: 'https://hacecuentas.com/{cc}' }},
  {{ lang: 'es-AR',     href: 'https://hacecuentas.com/' }},
  {{ lang: 'es-ES',     href: 'https://hacecuentas.com/es' }},
  {{ lang: 'es-MX',     href: 'https://hacecuentas.com/mx' }},
  {{ lang: 'es-CO',     href: 'https://hacecuentas.com/co' }},
  {{ lang: 'es-CL',     href: 'https://hacecuentas.com/cl' }},
  {{ lang: 'es',        href: 'https://hacecuentas.com/global' }},
  {{ lang: 'x-default', href: 'https://hacecuentas.com/global' }},
];
---

<Layout
  title="{cfg["title"]}"
  description={{`{cfg["description_template"]}`}}
  lang="es"
  audience="{audience}"
  hreflang={{hreflangTags}}
  schema={{schema}}
>
  <Header slot="header" />

  <div class="cc-index">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">{flag} {cname} · 2026</div>
        <h1>{cfg["hero_h1"]}</h1>
        <p class="hero-sub">{cfg["hero_sub"]}</p>
        <div class="hero-stats">
          <span class="stat"><strong>{{totalCalcs}}</strong> calculadoras</span>
          <span class="stat-sep" aria-hidden="true">·</span>
          <span class="stat"><strong>{{activeCategories.length}}</strong> categorías</span>
          <span class="stat-sep" aria-hidden="true">·</span>
          <span class="stat">100% gratis</span>
        </div>
      </div>
    </section>

    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Hacé Cuentas</a>
      <span class="sep" aria-hidden="true">/</span>
      <span class="current">{cname}</span>
    </nav>

    {{popular.length > 0 && (
      <section class="popular-section" aria-label="Más usadas">
        <h2 class="popular-title">Más usadas en {cname}</h2>
        <div class="popular-grid">
          {{popular.map((c: any) => (
            <a href={{calcUrl(c)}} class="popular-card">
              <span class="popular-icon">{{c.icon || '🧮'}}</span>
              <span class="popular-label">{{c.h1}}</span>
            </a>
          ))}}
        </div>
      </section>
    )}}

    <div class="categories">
      {{activeCategories.map((catKey) => {{
        const meta = categoryMeta[catKey];
        const catCalcs = byCategory[catKey];
        return (
          <section class="category-section" aria-labelledby={{`cat-${{catKey}}`}}>
            <div class="cat-header">
              <span class="cat-icon" aria-hidden="true" style={{`background: ${{meta?.color}}18`}}>{{meta?.icon ?? '📁'}}</span>
              <div class="cat-meta">
                <h2 id={{`cat-${{catKey}}`}} class="cat-label">{{meta?.label ?? catKey}}</h2>
                {{meta?.desc && <p class="cat-desc">{{meta.desc}}</p>}}
              </div>
            </div>
            <div class="calc-grid">
              {{catCalcs.map((calc: any) => (
                <a href={{calcUrl(calc)}} class="calc-card">
                  <span class="card-icon" aria-hidden="true">{{calc.icon}}</span>
                  <div class="card-body">
                    <span class="card-title">{{calc.h1}}</span>
                    <span class="card-desc">{{calc.description}}</span>
                  </div>
                  <span class="card-badge" style={{`background:${{meta?.color}}18; color:${{meta?.color}}`}}>{{meta?.label ?? catKey}}</span>
                </a>
              ))}}
            </div>
          </section>
        );
      }})}}
    </div>

    <aside class="cta-footer" aria-label="Otras versiones">
      <p class="cta-text">¿Buscas calculadoras de otro país?</p>
      <p class="cta-sub">Tenemos versiones específicas con datos locales para Argentina, España, México, Colombia, Chile y Brasil. La versión global aplica al resto del mundo hispano.</p>
      <div class="cta-links">
        <a href="/global" class="cta-pill">🌎 Global</a>
        <a href="/" class="cta-pill">🇦🇷 Argentina</a>
        <a href="/es" class="cta-pill">🇪🇸 España</a>
        <a href="/mx" class="cta-pill">🇲🇽 México</a>
        <a href="/co" class="cta-pill">🇨🇴 Colombia</a>
        <a href="/cl" class="cta-pill">🇨🇱 Chile</a>
        <a href="/pt" class="cta-pill">🇧🇷 Brasil</a>
      </div>
    </aside>
  </div>

  <ScrollToTop />
  <Footer slot="footer" />
</Layout>

<style>
  .cc-index {{ max-width: 1060px; margin: 0 auto; }}
  .hero {{ text-align: center; padding: 3rem 1rem 2.5rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }}
  .hero-inner {{ max-width: 720px; margin: 0 auto; }}
  .hero-badge {{
    display: inline-block; padding: 0.3rem 0.875rem; background: var(--accent-soft);
    color: var(--accent); border: 1px solid var(--border); border-radius: 999px;
    font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 1rem;
  }}
  .hero h1 {{ font-size: clamp(2rem, 5vw, 2.75rem); margin: 0 0 0.875rem; line-height: 1.15; }}
  .hero-sub {{ color: var(--text-muted); font-size: 1.0625rem; line-height: 1.6; max-width: 620px; margin: 0 auto 1.5rem; }}
  .hero-stats {{ display: inline-flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; color: var(--text-muted); font-size: 0.9375rem; }}
  .hero-stats .stat strong {{ color: var(--text); font-weight: 700; }}
  .hero-stats .stat-sep {{ opacity: 0.4; }}

  .breadcrumbs {{ padding: 0 1rem 1.5rem; font-size: 0.875rem; color: var(--text-muted); }}
  .breadcrumbs a {{ color: var(--text-muted); text-decoration: none; }}
  .breadcrumbs a:hover {{ color: var(--accent); }}
  .breadcrumbs .sep {{ margin: 0 0.5rem; opacity: 0.5; }}
  .breadcrumbs .current {{ color: var(--text); font-weight: 500; }}

  .popular-section {{ padding: 0 1rem 2rem; }}
  .popular-title {{ font-size: 1.125rem; margin: 0 0 0.875rem; color: var(--text-muted); font-weight: 600; }}
  .popular-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.625rem; }}
  .popular-card {{
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    padding: 1rem 0.75rem; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); text-decoration: none; color: var(--text);
    text-align: center; transition: all 0.15s;
  }}
  .popular-card:hover {{ border-color: var(--accent); transform: translateY(-2px); }}
  .popular-icon {{ font-size: 1.5rem; line-height: 1; }}
  .popular-label {{ font-size: 0.8125rem; font-weight: 600; line-height: 1.3; }}

  .categories {{ padding: 0 1rem; display: flex; flex-direction: column; gap: 2.5rem; }}
  .cat-header {{ display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1rem; }}
  .cat-icon {{ width: 2.5rem; height: 2.5rem; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 1.375rem; }}
  .cat-meta {{ display: flex; flex-direction: column; gap: 0.125rem; }}
  .cat-label {{ font-size: 1.125rem; margin: 0; font-weight: 700; }}
  .cat-desc {{ color: var(--text-muted); font-size: 0.875rem; margin: 0; }}

  .calc-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }}
  .calc-card {{
    display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1rem;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); text-decoration: none; color: var(--text);
    transition: all 0.15s;
  }}
  .calc-card:hover {{ border-color: var(--accent); transform: translateY(-1px); }}
  .card-icon {{ font-size: 1.5rem; line-height: 1; flex-shrink: 0; }}
  .card-body {{ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }}
  .card-title {{ font-weight: 600; font-size: 0.9375rem; line-height: 1.3; }}
  .card-desc {{ color: var(--text-muted); font-size: 0.8125rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}
  .card-badge {{ font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 4px; align-self: flex-start; flex-shrink: 0; }}

  .cta-footer {{ margin: 4rem 1rem 2rem; padding: 2rem 1.5rem; text-align: center; background: var(--bg-muted); border-radius: var(--radius); }}
  .cta-text {{ font-size: 1.125rem; font-weight: 700; margin: 0 0 0.5rem; }}
  .cta-sub {{ color: var(--text-muted); font-size: 0.9375rem; margin: 0 0 1rem; max-width: 600px; margin: 0 auto 1rem; line-height: 1.5; }}
  .cta-links {{ display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }}
  .cta-pill {{
    display: inline-flex; align-items: center; gap: 0.375rem;
    padding: 0.5rem 0.875rem; background: var(--bg);
    border: 1px solid var(--border); border-radius: 999px;
    font-size: 0.875rem; font-weight: 600; color: var(--text);
    text-decoration: none; transition: all 0.15s;
  }}
  .cta-pill:hover {{ border-color: var(--accent); color: var(--accent); }}
</style>
"""


for cc, cfg in COUNTRIES.items():
    out = ROOT / f"src/pages/{cc}/index.astro"
    out.write_text(render_for_country(cc, cfg))
    print(f"✓ {out}")
