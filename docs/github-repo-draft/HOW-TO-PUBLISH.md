# Cómo publicar este repo en GitHub

Tiempo estimado: **5 minutos**.

## Opción 1 — Via web (más simple)

1. Andá a [github.com/new](https://github.com/new)
2. Configurá:
   - **Repository name**: `calculadoras-argentinas` (o `hacecuentas-formulas`)
   - **Description**: "Open-source TypeScript implementations of Argentine fiscal, labor and financial calculation formulas. Maintained by hacecuentas.com"
   - **Public** (importante)
   - **NO inicializar** con README (ya tenemos uno)
3. Create repository
4. Volvé a la terminal y ejecutá:

```bash
cd ~/hacecuentas/docs/github-repo-draft
git init
git add .
git commit -m "Initial public release v0.1.0"
git branch -M main
git remote add origin https://github.com/grblasquiz/calculadoras-argentinas.git
git push -u origin main
```

Listo. URL final: `https://github.com/grblasquiz/calculadoras-argentinas`.

## Opción 2 — Via gh CLI (si lo tenés instalado)

```bash
brew install gh   # si no lo tenés
gh auth login

cd ~/hacecuentas/docs/github-repo-draft
git init
git add .
git commit -m "Initial public release v0.1.0"
gh repo create calculadoras-argentinas \
  --public \
  --source . \
  --remote origin \
  --description "Open-source TypeScript implementations of Argentine fiscal, labor and financial calculation formulas" \
  --push
```

## Después de publicar — para maximizar SEO impact

### 1. Activar GitHub Pages (5 min)

Settings → Pages → Source: `main` branch, `/docs` folder.

Esto crea `https://grblasquiz.github.io/calculadoras-argentinas/` que rankea adicional.

### 2. Topics

En el repo, click "About" (icon engranaje) y agregá topics:
- `argentina`
- `taxes`
- `calculator`
- `finance`
- `seo-formulas`
- `afip`
- `bcra`
- `anses`
- `monotributo`
- `aguinaldo`

Topics te hacen aparecer en `github.com/topics/argentina`, `github.com/topics/calculator`, etc. = backlinks naturales.

### 3. Submit a awesome-lists relevantes (15 min)

Hacer PRs a estas listas pidiendo agregar tu repo:

- [awesome-argentina](https://github.com/marcelo-pasquazzi/awesome-argentina) (si existe)
- [awesome-spain](https://github.com/jpquintana/awesome-spain) (acepta tools en español)
- [awesome-tax](https://github.com/topics/awesome-tax) (cualquier list de tax tools)
- Buscá en GitHub: `awesome calculators` y armá PRs a las que matcheen

Cada PR aceptado = 1 backlink fuerte de un repo con stars.

### 4. Cross-link a hacecuentas.com

En el README ya está pero verificalo:
- Cada calc en GitHub linkea a su versión live en hacecuentas.com
- En hacecuentas.com, cada calc puede linkear "Ver fórmula open-source en GitHub →"

### 5. Crear 1-2 issues "good first issue"

Para aparecer activos:
- Issue 1: "Agregar calc de [X]" (alguna fórmula que falte)
- Issue 2: "Mejorar tests para escala de Ganancias 2026"

Esto invita contributors y muestra al repo como "active" (boost en GitHub search).

## Métricas a seguir

A 30/60/90 días post-publicación, revisar:

| Métrica | 30d | 60d | 90d |
|---------|-----|-----|-----|
| GitHub stars | 5+ | 20+ | 50+ |
| Forks | 1+ | 3+ | 10+ |
| Backlinks externos | 1+ | 5+ | 15+ |
| Tráfico desde github.com a hacecuentas.com | 50/mes | 200/mes | 500/mes |

## Cómo lo medimos

GA4: filtro por referrer = `github.com` o `grblasquiz.github.io`.

GSC: Backlinks → ver crecimiento de menciones desde GitHub.

---

**Cuando publiques, avisame** y te corro un script que somete el repo a:
- Indexing API de Google
- Bing Webmaster Tools
- DuckDuckGo
- Wayback Machine

Eso garantiza que los crawlers lo encuentren en horas vs días.
