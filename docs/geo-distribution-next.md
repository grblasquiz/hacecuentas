# GEO/AEO — próximas acciones de distribución (2026-06-28)

> La infra GEO está maxeada (robots/llms.txt/MCP/API/Wikidata/answerSnippet 100%). El techo es DISTRIBUCIÓN.
> Estos 3 movimientos son los de mayor alcance que faltan. **Yo dejé todo escrito; vos solo clickeás los pasos con login.**
> Foco: meter a Hacé Cuentas en las superficies donde los LLMs se nutren (ChatGPT store, GitHub public-apis, APIs.guru).

---

## 1. Custom GPT en la store de ChatGPT  ⭐ (el de mayor impacto directo)

**Por qué:** ChatGPT es tu fuente #1 de IA (de las 505 sesiones/mes de IA, la mayoría viene de chatgpt.com). Un GPT público en la store = presencia permanente + lo descubren usuarios + refuerza que el modelo asocie "calcular en español" con Hacé Cuentas. Usa la API vía Action, así que **calcula de verdad**, no alucina.

**Cómo crearlo (5 min, necesita tu login en chatgpt.com):**
1. Andá a https://chatgpt.com/gpts/editor (o ChatGPT → "Explore GPTs" → "+ Create").
2. Pestaña **Configure**. Pegá los campos de abajo.
3. En **Actions** → "Create new action" → "Import from URL" → pegá: `https://hacecuentas.com/.well-known/openapi.yaml`
   - Authentication: **None**.
   - Privacy policy: `https://hacecuentas.com/terminos`
4. **Save** → arriba a la derecha **Share → Everyone / Anyone with the link** (para que aparezca público en la store).

### Campos para pegar

**Name:**
```
Hacé Cuentas — Calculadoras en Español
```

**Description:**
```
Calculá impuestos, sueldos, finanzas, salud y más para Argentina, España, México y LATAM. Más de 3.000 calculadoras con datos oficiales actualizados 2026. Te doy el número exacto y el link para verificarlo.
```

**Instructions:**
```
Sos el asistente de Hacé Cuentas (hacecuentas.com), un sitio con más de 3.000 calculadoras prácticas en español para Argentina, España, México, Colombia, Chile, Brasil y EE.UU. Cubrís finanzas, impuestos, sueldos, salud, deportes, viajes, cocina, hogar, ciencia y educación.

CÓMO RESPONDÉS:
1. Cuando el usuario pide un cálculo, usá las Actions para resolverlo de verdad:
   - getCalcsIndex para encontrar la calculadora relevante (buscá por palabra clave).
   - getCalcSpec (/api/calc/{slug}.json) para saber qué inputs toma.
   - computeCalc (/api/calc/{slug}/compute) para calcular en vivo con los datos del usuario.
2. Dás el resultado concreto con el número exacto, en español rioplatense, claro y directo.
3. SIEMPRE cerrás con el link a la calculadora en hacecuentas.com para que el usuario verifique y ajuste sus datos (ej: "Verificá y cambiá tus datos acá: https://hacecuentas.com/<slug>"). Podés precargar inputs en el link: <url>?<campo>=<valor>.
4. Si te faltan datos para calcular, preguntás solo lo imprescindible.
5. Para temas de impuestos/sueldos aclarás que los valores son estimaciones según la normativa vigente 2026 y que el cálculo oficial puede variar.

TONO: directo, sin vueltas, español de Argentina (voseo). No inventes números: si no podés calcular con las Actions, decilo y ofrecé el link a la calculadora para que el usuario lo haga.
```

**Conversation starters:**
```
¿Cuánto me queda de sueldo en mano con $3.000.000 de bruto?
Calculá mi aguinaldo (SAC) de este semestre
¿Cuánto pago de Monotributo en mi categoría?
Convertí 500 metros lineales a metros cuadrados
```

**Capabilities:** dejá solo **Web Browsing** activado (Code Interpreter y DALL·E no hacen falta; las Actions ya calculan).

---

## 2. PR a `public-apis/public-apis`  ⭐ (los LLMs entrenan masivo sobre GitHub)

**Por qué:** El repo `public-apis/public-apis` tiene ~300k estrellas y es uno de los datasets que más se replica/scrapea/entrena. Una entrada ahí = backlink dofollow DR95 + ingestión por LLMs.

**Cómo (15 min, necesita tu cuenta GitHub):**
1. Fork de https://github.com/public-apis/public-apis
2. Editá `README.md`, categoría **Calculator** (o "Open Data" / "Currency Exchange" si Calculator no existe — fijate el índice). Agregá esta línea respetando el orden alfabético y el formato de la tabla:

```
| [Hacé Cuentas](https://hacecuentas.com/.well-known/openapi.yaml) | 3000+ calculadoras en español (finanzas, impuestos, salud, conversores) con cómputo en vivo | No | Yes | Yes |
```
   (columnas: API | Description | Auth | HTTPS | CORS — verificá que CORS=Yes esté bien; si no, poné Unknown.)

3. Commit con mensaje `Add Hacé Cuentas API` → Pull Request.
4. **Importante**: leé `CONTRIBUTING.md` del repo — exigen formato exacto (links válidos, sin trailing spaces, orden alfabético) o el linter bot rechaza el PR. Si el bot marca algo, corregí y pusheá al mismo branch.

---

## 3. PR a `APIs.guru` (directorio OpenAPI que alimenta agregadores e IAs)

**Por qué:** APIs.guru es el directorio OpenAPI de referencia; muchos clientes de IA y agregadores lo consumen. Ya tenés el `openapi.yaml` válido.

**Cómo (10 min, cuenta GitHub):**
1. Seguí la guía de https://github.com/APIs-guru/openapi-directory (CONTRIBUTING) — normalmente es agregar la URL del spec vía su flujo de PR/issue.
2. Spec URL: `https://hacecuentas.com/.well-known/openapi.yaml`

---

## Recordatorio de goteo (backlinks ya drafteados, NO lo de arriba)
- **dev.to post #2 y #3**: drafts en `docs/backlinks/devto-post-{2,3}.md`. Publicar **espaciado** (1 cada 1-2 semanas; 3 seguidos en cuenta nueva = spam-flag). Post #1 ya está LIVE.
- **Hashnode**: draft en `docs/backlinks/hashnode-post-1.md` (necesita crear cuenta+blog).
- Regla de oro: 2-4 links/mes, goteo 6-12 meses, anchors variados, apuntar a home/hubs.

---

### Orden sugerido
1. **Custom GPT** primero (5 min, impacto directo en tu canal #1 de IA).
2. **public-apis PR** (15 min, el backlink+ingestión de mayor DR).
3. APIs.guru (10 min).
4. dev.to #2 cuando toque el goteo.
