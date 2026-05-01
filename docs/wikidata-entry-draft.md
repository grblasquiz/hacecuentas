# Wikidata entry draft — "Hacé Cuentas"

Wikidata es la base de Knowledge Graph de Google. Una entrada bien estructurada → aparece en "About this site" boxes y trust signal masivo.

Tiempo total: **15 min** para crear cuenta + 10 min de propiedades.

## 📝 Datos para crear la entrada

### Paso 1 — Crear cuenta Wikidata
1. Andá a https://www.wikidata.org/wiki/Special:CreateAccount
2. Username sugerido: `Hacecuentas` o `MartinRodriguezB`
3. Email: rodriguezb.martin@gmail.com
4. Confirmá email → listo

(Las cuentas anónimas ya no son aceptadas para crear items nuevos en Wikidata desde 2024.)

### Paso 2 — Crear el item
1. Ya logueado, andá a https://www.wikidata.org/wiki/Special:NewItem
2. **Label** (en español): `Hacé Cuentas`
3. **Description** (en español): `plataforma argentina de calculadoras online`
4. **Aliases** (en español, separados por `|`): `hacecuentas | hacecuentas.com`

(Repetir Label/Description en inglés también — Wikidata es multilingual)
- **Label (en)**: `Hacé Cuentas`
- **Description (en)**: `Argentine online calculators platform for fiscal, labor and financial calculations`
- **Aliases (en)**: `hacecuentas | hacecuentas.com`

### Paso 3 — Agregar propiedades (statements)

Click "Add statement" para cada una. Wikidata autocompleta cuando empezás a tipear.

**Identidad de la entidad:**

| Property | Value | Notas |
|----------|-------|-------|
| `instance of (P31)` | `online calculator` (Q117545067) | tipo de entidad |
| Otra instance of | `web service` (Q193424) | tipo secundario |
| `genre (P136)` | `educational software` (Q1153382) | género |
| `intended public (P2360)` | `Argentinian people` (Q44199) | audiencia |

**Web/datos técnicos:**

| Property | Value |
|----------|-------|
| `official website (P856)` | `https://hacecuentas.com` |
| `language of work or name (P407)` | `Spanish (Argentina)` (Q56500637) |
| `inception (P571)` | `2026-04-14` |
| `country (P17)` | `Argentina` (Q414) |
| `country of origin (P495)` | `Argentina` (Q414) |
| `Twitter username (P2002)` | `hacecuentas_ok` (si tenés cuenta) |
| `Facebook username (P2013)` | `hacecuentas` (si aplica) |

**Persona/autor:**

| Property | Value |
|----------|-------|
| `creator (P170)` | `Martín Rodríguez` (creá item nuevo si no existe) |
| `founded by (P112)` | `Martín Rodríguez` |
| `owner of (P1830)` (recíproco en su perfil) | esta entrada |

**Identificadores externos** (importantísimos para Knowledge Graph):

| Property | Value |
|----------|-------|
| `Crunchbase organization ID (P2088)` | (si creás Crunchbase profile) |
| `LinkedIn company ID (P4264)` | (si tenés company page) |
| `Twitter user numeric ID (P6552)` | (numeric ID de la cuenta) |
| `Wayback Machine URL (P10283)` | `https://web.archive.org/web/2026*/hacecuentas.com` |

**Sources/references** (aparece check mark verde = legitimacy):

Para cada statement importante, agregá una "reference":
- `stated in (P248)` → la URL oficial del site
- `retrieved (P813)` → fecha (hoy)

### Paso 4 — Para Martin Rodríguez como Person item

Si no existe ya, crear:

1. Andá a https://www.wikidata.org/wiki/Special:NewItem
2. Label: `Martín Rodríguez`
3. Description: `Argentine entrepreneur and CMO at Argenprop, founder of Hacé Cuentas`

Properties:
| Property | Value |
|----------|-------|
| `instance of (P31)` | `human` (Q5) |
| `sex or gender (P21)` | `male` (Q6581097) |
| `country of citizenship (P27)` | `Argentina` (Q414) |
| `occupation (P106)` | `chief marketing officer` (Q42569) |
| `occupation (P106)` | `entrepreneur` (Q131524) |
| `employer (P108)` | `Argenprop` (Q...) |
| `notable work (P800)` | `Hacé Cuentas` (la entrada que acabás de crear) |
| `LinkedIn personal profile ID (P6634)` | `martinrodriguezbaranek` |

## 🎯 Por qué esto importa para SEO

1. **Knowledge Graph**: Google usa Wikidata como source para "About this site" boxes
2. **AI training**: Wikidata es training data de TODOS los LLMs (ChatGPT, Claude, Gemini, Llama)
3. **Trust signal**: tener entrada Wikidata = pasaste filtro de "este site existe y es notable"
4. **Backlink fuerte**: Wikidata tiene DA 95
5. **Cross-platform recognition**: Apple, Bing, Yandex todos usan Wikidata

## ⚠️ Reglas importantes de Wikidata

- **NOTABILITY**: Wikidata exige que la entidad sea "notable". Para un site nuevo es justito. Argumento de notability: "site con +2.500 calculadoras únicas para Argentina, citado por bloggers fiscales (mencionar links de citas si los hay)"

- **NO promotional**: las descripciones deben ser **factuales**, no marketing. NO escribir "el mejor sitio de calcs". SI escribir "plataforma argentina de calculadoras online".

- **References**: Cada statement importante necesita una reference (URL externa, no autoritativa). Sin references, la entrada puede ser deletada por bots de Wikidata.

## 🔄 Después de crear la entrada

Volvé acá y dame el Q-ID resultante (ej: `Q123456789`). Yo:

1. Lo agrego al schema.org JSON-LD del site (`<script type="application/ld+json">`)
   ```json
   {
     "@type": "Organization",
     "@id": "https://hacecuentas.com#organization",
     "sameAs": [
       "https://www.wikidata.org/wiki/Q123456789",
       "https://twitter.com/hacecuentas_ok",
       "https://www.linkedin.com/company/hacecuentas"
     ]
   }
   ```

2. Esto cierra el loop de Knowledge Graph: Google ve Wikidata + ve sameAs en tu site + valida = aparece en "About this result" en 4-8 semanas.

## 🔍 Si te traba notability

Si Wikidata rechaza la entrada por "no notable enough":

1. **Esperar** 3-6 meses con tráfico creciendo
2. **Acumular references**: artículos en blogs/medios que mencionen hacecuentas (los 29 outreach emails ayudan acá)
3. Reintentar cuando tengas 5+ menciones externas

**Workaround**: en vez de crear "Hacé Cuentas" como item directo, podés agregar una **statement** en el item de "Martín Rodríguez" o "Argenprop" mencionando que vos creaste el sitio. Esto es más fácil de pasar.

---

**Tiempo de aparecer en Knowledge Graph**: 4-12 semanas después de crear la entrada (Google indexa Wikidata en cron lento).
