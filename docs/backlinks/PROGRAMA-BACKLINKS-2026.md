# Programa de Backlinks hacecuentas.com — Plan maestro 2026

> Estado del dominio al diseñar esto: creado **2026-04-14** (~2,5 meses), ~4.300 páginas,
> ~70% tráfico pago, Google sandboxed (~130 impr/día), Bing = motor real (~36k impr/sem),
> IA = 505 visitas/mes y creciendo. On-page MAXEADO. **El cuello es AUTORIDAD, no contenido.**

---

## 0. Tesis (leer antes de ejecutar nada)

El error que mata dominios jóvenes no es tener pocos links — es **conseguir muchos, rápido, todos
iguales**. Google modela la *velocidad* y la *naturalidad* del perfil de enlaces. Un dominio de
2 meses que de golpe suma 150 referring domains spamea su propia bandera de "scaled/artificial".

Por eso este programa optimiza **referring domains de calidad** (no cantidad de links), con:

- **Velocidad creciente y lenta** (ramp), nunca un pico.
- **Diversidad** de tipo, anchor, idioma y vertical (el perfil tiene que *parecer* ganado).
- **80% ganado / 20% sembrado**: el 80% sale de que nos citen como FUENTE (páginas-dato),
  el 20% de siembra controlada (directorios de nicho, perfiles, guest posts selectos).
- **Relevancia > autoridad bruta**: un link de un blog contable argentino DR20 vale más que
  un perfil DR90 irrelevante.

Métrica de éxito del programa = **referring domains nuevos relevantes / mes** + **% anchor
no-comercial** + **diversidad de TLD/vertical**. NO "cantidad de links".

---

## 1. Arquitectura del programa (5 motores)

| # | Motor | Qué genera | Esfuerzo Claude | Esfuerzo Martin | DoFollow |
|---|-------|-----------|-----------------|-----------------|----------|
| A | **Linkable assets (páginas-dato)** | links editoriales ganados | Alto (los construyo) | 0 | sí (editorial) |
| B | **Digital PR / outreach** | menciones de prensa/blogs | Alto (research+redacción) | login mail / envío | sí |
| C | **Siembra de directorios/perfiles** | citas de marca, NAP, nicho | Medio (lleno forms) | login/CAPTCHA/OAuth | mixto |
| D | **Distribución dev/IA (GEO)** | links + citas en LLMs | Medio | login puntual | mixto |
| E | **Embeds / widgets** | links contextuales escalables | ya construido | distribución | sí (atribución) |

El **80% del valor SEO real** viene de A + B + E (links editoriales/ganados).
C + D suman *diversidad y señales de marca* (muchos nofollow), que un perfil sano necesita
para no parecer manipulado — pero no son el driver.

---

## 2. Motor A — Linkable assets (el corazón del programa)

**Por qué es el #1 para vos:** authority-light, no depende de pedir favores, escala con lo que
ya tenés (datos), y es lo que los LLMs ya citan (505 visitas IA/mes vienen de páginas data-rich).

**El molde "página-dato" (ya probado, ver `/datos-monotributo-2026`):**
1. Página estática de referencia con **tabla screenshot-able** (la gente captura y linkea).
2. Schema `Dataset` → entra en **Google Dataset Search** (canal de descubrimiento propio).
3. Licencia **CC-BY 4.0** + bloque **"Cómo citar / Insertá este dato"** con la URL ya escrita
   y el `<iframe>`/cita lista para copiar → habilita el backlink por atribución.
4. Fuente única de datos (`src/lib/data/*.ts`) para que nunca quede stale.
5. ⚠️ Agregar la URL a mano al `core([...])` de `scripts/generate-sitemap.ts` (las páginas
   sueltas NO se auto-descubren). Verificar `curl sitemap-core.xml | grep <slug>`.

**Backlog de assets (prioridad por demanda + citabilidad):**
- ✅ `/datos-monotributo-2026`, ✅ `/datos-salario-minimo-latam`
- Escala Ganancias 2026 (tabla completa por tramo)
- Costo de vida / canasta básica por país LATAM (mensual, con histórico)
- Aguinaldo/SAC: tabla de fechas y topes por país
- Feriados LATAM 2026 (grilla, ya hay calendario — versionarlo como dato-citable)
- Inflación IPC mensual AR/CO/MX (gráfico + CSV descargable)
- Indemnización por despido: topes y tablas por país (YMYL, alto link-magnet)
- Tipo de cambio histórico / brecha (data financiera = muy citada)

**Cadencia:** 1–2 assets nuevos por mes. Cada uno = candidato a 3–15 links editoriales en 6 meses.

**Loop de promoción de cada asset (esto es lo que convierte el asset en links):**
1. Publico el asset + lo sumo a sitemap + IndexNow.
2. Identifico 10–20 páginas que YA hablan del tema con datos viejos/incompletos (Motor B).
3. Outreach: "armamos esta tabla 2026 actualizada con licencia abierta, por si les sirve citarla".
4. Lo siembro en los canales dev/IA (Motor D) y data search.

---

## 3. Motor B — Digital PR / Outreach (cómo contactamos lugares)

Esto reemplaza al "guest posting masivo" (Google lo ignora/penaliza en 2026). Es **outreach
quirúrgico a páginas relevantes** con un motivo genuino para linkear.

### 3.1 Cómo BUSCAMOS lugares (prospecting) — reproducible

Tácticas, en orden de ROI:

1. **Link intersection / competidores:** ver quién linkea a Cuanto.io, calculadoras.com.ar,
   Omni Calculator, calculadora-online, etc. Esos sitios YA linkean calculadoras → son targets
   calientes. (Herramienta: export de backlinks del competidor; si no hay presupuesto de Ahrefs,
   usar `link:` + búsquedas Google/Bing + el free tier de Ahrefs Webmaster / Bing Webmaster.)
2. **Footprints de búsqueda** (queries que encuentran páginas que linkean datos del tema):
   - `"monotributo 2026" + ("fuente" OR "según") -site:hacecuentas.com`
   - `"calculadora de" + intitle:recursos + (blog OR guía)`
   - `inurl:recursos contabilidad argentina`
   - `"tabla de" ganancias 2026 site:.edu.ar OR site:.gob.ar` (links .edu/.gob = oro)
3. **Páginas con datos desactualizados:** buscar artículos que citan cifras 2024/2025 de un tema
   donde nosotros tenemos el 2026 → motivo perfecto de outreach.
4. **Broken-link building:** encontrar links rotos a calculadoras/datos muertos en sitios de
   nicho y ofrecer el nuestro como reemplazo (ya hay `scripts/find-broken-links.py` adaptable).
5. **HARO / periodismo de datos:** responder pedidos de periodistas (consultas de finanzas
   personales LATAM) con nuestros datos → menciones en medios = links DR alto + brand.
6. **Menciones sin link:** buscar quién ya menciona "hacecuentas" sin linkear → pedir el link
   (la conversión más fácil que existe).

Output: `docs/backlinks/outreach-targets.json` (ya existe — lo mantenemos como pipeline con
campos: url, tipo, motivo, contacto, estado, fecha, follow-up).

### 3.2 Cómo CONTACTAMOS (el flujo)

- **Yo (Claude):** investigo el target, encuentro el contacto, redacto el mail personalizado
  (`scripts/outreach-email-generator.py` ya existe), lo dejo en cola.
- **Martin:** hace login del mail y envía (o autoriza envío). Nunca mando mails masivos
  idénticos — cada uno menciona algo real de la página destino.
- Plantilla: contexto genuino (1 línea) → valor concreto (el dato/tabla que les sirve) →
  pedido suave (no "linkeame", sino "por si les sirve citarlo"). Sin lenguaje de "intercambio".
- **Volumen seguro:** 15–30 outreach personalizados/semana. Tasa de conversión realista
  3–8% → ~2–6 links/mes de este motor cuando madura.

⚠️ **Nunca:** comprar links, PBNs, intercambios masivos, comentarios con anchor exacto,
fiverr "1000 backlinks". Todo eso es lo que más rápido hunde un dominio joven.

---

## 4. Motor C — Siembra de directorios/perfiles (cómo nos registramos)

Valor SEO directo ≈ bajo (muchos nofollow, dominios spameados), PERO aportan **diversidad y
señales de marca/NAP** que un perfil sano necesita. Se hace **una vez, bien, y se olvida** — no
es donde ponemos esfuerzo recurrente.

**El flujo de registro (patrón tag-team probado):**
- **Martin:** crea la cuenta / hace OAuth / resuelve CAPTCHA (los guardrails que yo no puedo).
- **Yo:** lleno todo el resto del formulario (descripción, categorías, URL, logo, etc.) y submiteo.

**Lista de siembra (una vez):**
- Directorios de producto/nicho: SaaSHub, AlternativeTo, Product Hunt, Indie Hackers, Uneed,
  Fazier (varios ya iniciados — ver `[[backlinks-execution-2026-06]]`).
- **Perfiles de marca con sameAs** (consistencia NAP, 5 puntos de sync ya documentados):
  GitHub, Crunchbase, About.me, Gravatar, perfiles sociales.
- **Wikidata** (entidad de la marca → señal de entidad para Google + base de LLMs). Draft listo
  en `docs/backlinks/wikidata-entry.md`.
- Directorios LATAM/locales de finanzas y herramientas (mayor relevancia que los genéricos).

❌ **NO perder tiempo en:** telegra.ph, graph.org, write.as, rentry, pastelink — verificado que
rinden ~nulo (dominios spam-abusados, Google los descuenta). Solo como relleno de diversidad
muy ocasional, jamás como táctica central.

---

## 5. Motor D — Distribución dev / IA (GEO/AEO)

Doble función: links reales en plataformas DR-alto + presencia en las fuentes que entrenan/citan
los LLMs (canal IA = 505 visitas/mes creciendo, palanca #1 authority-light para dominio joven).

**Ya LIVE:** dev.to (3 dofollow, DR~90), MCP Registry oficial (cascada a PulseMCP/Glama/mcp.so/
Smithery), repo GitHub, npm + HuggingFace + Kaggle + Google Dataset Search, academia.edu paper.

**Cola (drafts ya escritos en `docs/backlinks/`):**
- dev.to post #2 y #3, Hashnode post #1, Medium #1/#2, LinkedIn articles.
- ⚠️ **Espaciar el goteo: 1 post c/1–2 semanas.** 3 posts el mismo día en cuenta nueva = spam-flag
  y caen TODOS los links de esa plataforma.
- **Custom GPT** en el store de ChatGPT (instrucciones en `docs/geo-distribution-next.md`).
- **PR a `public-apis/public-apis`** (DR95, los LLMs entrenan sobre GitHub) + APIs.guru.

---

## 6. Motor E — Embeds / widgets (escalable, ya construido)

El motion de Omni Calculator: cada sitio que embebe una calc = link de atribución contextual.

- Backend LIVE: `/oembed.json`, `/api/calcs-slim.json`, discovery por-página.
- **Plugin WordPress** subido a wordpress.org (en revisión). Al aprobarse → cada instalación con
  crédito on = un backlink. Es el motor de mayor *escalabilidad* a largo plazo.
- Pendiente post-aprobación: SVN trunk + assets + actualizar `Plugin URI` y CTA de `/wordpress`.

---

## 7. Calendario y volumen — cuánto podemos crecer/mes

**Regla de oro para dominio de 2,5 meses: ramp lento.** No querés sumar 50 RD el primer mes y
0 el segundo. Querés una curva creciente y constante que parezca orgánica.

| Mes | Referring domains nuevos (objetivo) | Mix |
|-----|-------------------------------------|-----|
| 1 | 5–8 | siembra base (C) + 1 asset (A) + goteo dev/IA (D) |
| 2 | 8–12 | + outreach arranca (B) + 2º asset |
| 3 | 12–18 | outreach madura + embeds empiezan (E) |
| 4–6 | 15–25/mes | todos los motores corriendo, ramp creciente |
| 6+ | 20–35/mes | plugin WP aprobado escala embeds, assets compuestos |

**Total realista 6 meses: ~70–110 referring domains nuevos de calidad.** No 500. Y eso es
lo *bueno* — es la curva que sobrevive a un dominio joven.

> ⚠️ "Links" totales será mayor (un RD puede dar varios links) pero **medimos RD**, no links.
> Un solo dominio con 40 backlinks repetidos no vale como 40 dominios distintos.

**Anti-patrón a evitar:** que el 80% de los links tengan anchor comercial exacto
("calculadora de despido"). Perfil sano: ~70% anchors de marca/URL desnuda/genéricos
("hacecuentas", "hacecuentas.com", "acá", "esta calculadora"), ~30% parcial/temático.

---

## 8. Estrategia anti-penalización (el "no cagarla")

Reglas duras, no negociables:

1. **Velocidad creciente, nunca picos.** Si un mes explota, frenamos el siguiente para
   no dejar un escalón antinatural.
2. **Diversidad obligatoria:** TLD (.ar/.com/.mx/.edu/.gob), tipo (editorial/perfil/foro/dev),
   idioma (es/en/pt), vertical (finanzas/dev/educación). Un perfil monocolor = bandera.
3. **Anchor text natural:** mayoría marca/URL desnuda. Cero anchor-money repetido.
4. **Relevancia primero:** preferir DR20 relevante a DR80 irrelevante.
5. **Cero compra de links, PBN, intercambios, "paquetes" de Fiverr/blackhat.**
6. **Bajar la dependencia de pago en paralelo** (70%→<50%): el arbitraje pago es parte de la
   misma bandera de "scaled/artificial". Más orgánico afloja la bandera.
7. **Frenar la velocidad de creación de calcs** mientras el dominio madura — sumar links a un
   sitio que sigue inflando páginas refuerza el patrón granja.
8. **Disavow file** preparado: si aparecen links spam/tóxicos no solicitados (scrapers,
   granjas), revisarlos trimestral y desautorizar los obvios en GSC.
9. **Honestidad de datos:** todo asset cita ley/resolución/fecha real (E-E-A-T). Un link a una
   página con datos falsos es un pasivo, no un activo.

---

## 9. Medición y tablero

KPIs (pull mensual, scripts ya existen o se adaptan):
- **Referring domains nuevos/mes** (Bing Webmaster + Ahrefs free + GSC links report).
- **% anchor de marca vs comercial.**
- **Diversidad** (conteo de TLD/vertical/idioma).
- **Links → tráfico:** referral en GA4 (`scripts/ga4-alist-channels.py`) + posición media GSC.
- **Citas IA** (visitas canal "AI Assistant" en GA4).
- **Estado del pipeline de outreach** (`outreach-targets.json`: contactados/respondidos/links).

Revisión: tablero mensual + auditoría de perfil trimestral (toxicidad, velocidad, anchors).

---

## 10. Reparto de roles (qué hago yo / qué hacés vos)

**Claude (automatizable):**
- Construir los linkable assets (páginas-dato) end-to-end.
- Prospecting: generar la lista de targets con footprints + competidores.
- Redactar los outreach personalizados y los posts de distribución.
- Llenar y submitear formularios de directorios.
- Mantener el pipeline, los KPIs y la auditoría del perfil.

**Martin (guardrails que no puedo cruzar):**
- Login/OAuth/CAPTCHA/creación de cuentas.
- Enviar los mails de outreach (o autorizar el envío).
- Publicar lo que requiere cuenta (dev.to/Medium/LinkedIn — yo dejo el draft listo).
- Postear en Reddit (yo redacto, está bloqueado para mi tooling).

---

## Próximos 30 días (arranque concreto)

1. **Semana 1:** levantar `outreach-targets.json` como pipeline vivo + correr prospecting
   (competidores + footprints) → primeros 20 targets. Publicar 1 asset nuevo (escala Ganancias).
2. **Semana 2:** siembra base de directorios/perfiles (tag-team) + Wikidata + dev.to #2.
3. **Semana 3:** primera tanda de outreach (15 mails personalizados) + 2º asset.
4. **Semana 4:** medir, ajustar anchors/diversidad, Hashnode/Medium goteo, revisar perfil.

Objetivo mes 1: **5–8 referring domains nuevos** + pipeline cargado para que el mes 2 escale.
