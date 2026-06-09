# Plan de ejecución de backlinks — Hacé Cuentas

> Generado 2026-06-09. **El lado del sitio ya está construido** (embed engine + crédito followable + galería de widgets, API REST + MCP + OpenAPI, datasets CC-BY + schema Dataset, páginas-dato citables, infografías, llms.txt/ai.txt, Wikidata). Lo que falta es **ejecución** — casi todo requiere TUS logins (yo no puedo crear el link por vos). Esto es la lista priorizada "hacé esto ahora".
>
> Drafts ya escritos (solo pegar): `docs/backlinks/{devto-post-*,medium-post-*,hashnode-post-1,linkedin-articles,reddit-posts,submission-kit,outreach-emails,wikidata-entry}.md` + `docs/llm-distribution-playbook.md` + `docs/github-readme.md`.

## Regla de oro
2-4 links relevantes/mes, goteo constante 6-12 meses. Anchors variados (marca + URL desnuda, no exact-match). Apuntar a home + hubs (`/guia/*`, `/categoria/*`), no a calcs profundas sueltas.

---

## TIER 1 — links dofollow reales, $0, sin outreach (hacelos esta semana)

| # | Acción | Dónde | Dofollow | Esfuerzo | Asset listo |
|---|--------|-------|----------|----------|-------------|
| 1 | **Repo GitHub público** `hacecuentas-api` (README + OpenAPI) | github.com (tu cuenta) | ✅ DR alto | 30 min | `docs/github-readme.md` + `docs/github-repo-draft/` + `public/.well-known/openapi.yaml` |
| 2 | **PR a `public-apis/public-apis`** (categoría Calculator) | github.com PR | ✅ DR 95+ | 15 min | descripción en `docs/llm-distribution-playbook.md` |
| 3 | **MCP a registries** (mcp.so, Smithery, PulseMCP, Glama, registro Anthropic) | cada sitio | ✅ | 30 min | endpoint `https://hacecuentas.com/mcp` |
| 4 | **APIs.guru** (submit OpenAPI vía PR) | github.com/APIs-guru | ✅ | 10 min | `/.well-known/openapi.yaml` |
| 5 | **Dev.to** ×3 posts (canonical dofollow) | dev.to (tu cuenta) | ✅ | 15 min | `docs/backlinks/devto-post-{1,2,3}.md` |
| 6 | **Hashnode** ×1 post | hashnode.com | ✅ | 5 min | `docs/backlinks/hashnode-post-1.md` |

## TIER 2 — alta autoridad / alto valor, $0 (semanas 2-3)

| # | Acción | Dónde | Nota |
|---|--------|-------|------|
| 7 | **Product Hunt** — lanzar "Hacé Cuentas" (o un tool puntual: el MCP/API) | producthunt.com | dofollow + spike de tráfico; 1 sola vez |
| 8 | **AlternativeTo / SaaSHub** — listar como alternativa a Omni Calculator | alternativeto.net, saashub.com | dofollow, temático |
| 9 | **Wikipedia (ES)** — agregar hacecuentas como *referencia/enlace externo* en artículos donde una calc/tabla gratis es útil: Monotributo, Aguinaldo (SAC), IMC, Salario mínimo Argentina | es.wikipedia.org | nofollow PERO DR99 + lo crawlean las IAs. Frágil (editores revierten promo) → que sea referencia genuina, no spam |
| 10 | **Datasets a portales** (inflación, dólar, UVA — ya tienen schema Dataset + CC-BY) | Google Dataset Search (auto vía schema), data.world, Kaggle Datasets | citas + links de sitios de mucha autoridad |
| 11 | **Medium ×2 + LinkedIn ×3 artículos** (republicar guías con link) | medium.com, linkedin.com | marca + referral; canonical a tu URL |

## TIER 3 — comunidad (nofollow, pero referral + crawl IA)

| # | Acción | Dónde | Nota |
|---|--------|-------|------|
| 12 | **Reddit** (r/argentina, r/merval, r/devargentina) — responder con la calc relevante | reddit.com | nofollow; `scripts/reddit-monitor.py` ya genera la cola en `docs/reddit-queue-*.md`. Postear a mano (anti-shadowban) |
| 13 | **Quora ES** — responder preguntas de finanzas/impuestos | quora.com | nofollow; drafts en `docs/backlinks/reddit-quora-outreach-plan.md` |

## SIEMPRE-ON — auto-replicante (ya construido, solo difundir)

| # | Acción | Cómo |
|---|--------|------|
| 14 | **Widgets embebibles** = backlink dofollow por cada sitio que los pone. Promocioná `/embeber` (galería 1-clic, crédito followable). | Mencionalo en los posts de Dev.to/Medium ("embebé esta calc gratis"), en el footer de los guest posts, y a contadores/blogs de finanzas que ya conozcas |
| 15 | **GEO tweets** (señal social que crawlean Grok/Perplexity) | VPS: `cd /opt/hacecuentas && python3 geo_tweets.py inject 3` |

---

## Qué NO hacer (ya decidido)
- ❌ Comprar links Fiverr / packs "DA50+" / PBNs / dominios vencidos → plata tirada o riesgo (peor en dominio suprimido).
- ❌ Exact-match anchors a escala.
- ❌ Outreach manual a periodistas (Martin lo descartó).

## Presupuesto $100/mes
Tier 1 + 2 + 14/15 son **$0**. Reservá los $100/mes para **1 colocación editorial real/mes** en un blog/medio AR de finanzas (>1k visitas/mes, temático) — o juntá 2 meses para uno mejor. El goteo > el conteo.
