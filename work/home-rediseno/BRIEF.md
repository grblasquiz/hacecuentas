# Brief: rediseño de la home de hacecuentas.com

Repo: `/Users/marrod/hacecuentas` — Astro 6 sobre Cloudflare Workers.
Archivo a rehacer: **`src/pages/index.astro`** (hoy 3.734 líneas).
Dev server: `npm run dev` → http://localhost:4388

Este brief es autocontenido. **No hagas build, commit ni deploy** — de eso se encarga otra sesión.

---

## 1. Qué pasó, y por qué la home quedó desfasada

Hasta ayer el sitio era un catálogo de **3.334 calculadoras sueltas**. Hoy es un sitio de **488 hubs de decisión**: cada hub responde UNA pregunta concreta que una persona real se hace, con todas las calculadoras necesarias adentro.

Ejemplo: antes había `/calculadora-cts-peru`, `/calculadora-gratificacion-peru` y `/calculadora-vacaciones-truncas-peru` por separado. Hoy hay un hub `/pe/trabajo/liquidacion-y-beneficios` que responde *"Me voy o me despiden: ¿cuánto me tienen que pagar?"* y calcula las tres cosas en ramas.

El sitio pasó de 2.942 URLs a **846**, con 5.998 redirects. Ninguna URL indexada se perdió.

**La home todavía habla el idioma viejo.** Su H1 dice *"Calculadoras online para tomar mejores decisiones con números claros"* y tiene 13 secciones que ordenan el mundo por *tipo de herramienta* ("Las calculadoras más usadas", "Convertí lo que necesites"), no por *pregunta del usuario*. Ese es el trabajo.

---

## 2. Los datos (GA4, 90 días — 120.320 sesiones)

**La home casi no es puerta de entrada: 2.116 sesiones, el 1,8% del total.** La gente entra directo a la página que responde su pregunta, desde buscadores. Eso tiene dos consecuencias para el diseño:

- La home no se optimiza para "convertir visitantes nuevos": se optimiza para **orientar a quien ya llegó** y para **repartir autoridad** hacia los hubs (internal linking).
- Su valor SEO principal es ser el nodo que enlaza y jerarquiza los 110 silos.

**Las 5 páginas que traían el 25% del tráfico hoy son 301 a hubs:**

```
11.733  /calculadora-imc                        → /salud/peso-ideal-imc
 4.227  /calculadora-actualizacion-alquiler-icl  → /alquiler/aumento-de-alquiler
 3.405  /calculadora-indemnizacion-despido       → /trabajo/indemnizacion-por-despido
 2.367  /calculadora-aguinaldo-sac               → /trabajo/aguinaldo
 1.915  /dias-entre-dos-fechas                   → /fechas/dias-entre-fechas
```

**Dónde cae realmente el tráfico, siguiendo los redirects** (esto manda para decidir qué destacar):

```
14.645  /salud          3.442  /co/trabajo      1.958  /conversores
14.121  /trabajo        3.185  Mundial          1.912  /tecnologia
 7.160  /alquiler       3.025  /auto            1.521  /embarazo
 4.812  /fechas         3.000  /construccion
 4.618  /impuestos      2.385  /finanzas-personales
```

**Canal**: el tráfico orgánico viene mayoritariamente de **Bing**, no de Google. No asumas patrones de Google Discover ni de featured snippets de Google.

**Mercados**: hay 13 además de Argentina. Sus portadas (`/co`, `/mx`, `/cl`, `/en`…) suman 596 sesiones y son el destino del breadcrumb de todos sus hubs. La home de AR tiene que ofrecer una salida clara hacia ellas sin que el argentino sienta que el sitio no es para él.

---

## 3. Qué tiene que comunicar la home ahora

**La idea central**: *acá no venís a buscar una calculadora, venís a resolver una decisión.*

Tres cosas que el visitante tiene que entender en los primeros 5 segundos:

1. **Qué es esto**: un lugar donde cada pregunta de plata, trabajo o salud tiene una página que la responde entera — con la ley, la fuente y la fecha del dato.
2. **Que la respuesta es confiable**: los números salen de normativa citada y datos actualizados, no de una fórmula anónima. Este es el diferencial real y hoy está enterrado en un pilar genérico.
3. **Por dónde entrar**: acceso directo a las preguntas más frecuentes, no a un índice alfabético de herramientas.

**Lo que NO debe hacer:**
- Presentarse como "calculadora online" a secas — es la categoría de la que nos estamos diferenciando.
- Listar herramientas por tipo ("conversores", "calculadoras científicas").
- Prometer features que no existen: **`/embed/*` está vacío** desde la consolidación, así que nada de "embebé nuestras calculadoras".

---

## 4. Estructura propuesta

Es una propuesta, no un dogma: si encontrás algo mejor, hacelo y explicá por qué. Lo que **no** es negociable son los datos, las URLs reales y las reglas técnicas de la sección 6.

**Hero.** Una pregunta, no un eslogan. La promesa concreta: respuesta completa, con la norma aplicada y la fecha del dato. Un buscador que lleve a hubs (no a calculadoras sueltas: ya no existen).

**Las decisiones más frecuentes.** 8-12 hubs reales, elegidos por el tráfico que cae en cada silo (sección 2). Cada uno con la pregunta en la voz del usuario, no con el nombre de la herramienta: *"¿Cuánto me tienen que pagar si me echan?"* en vez de *"Calculadora de indemnización"*.

**Por momento de la vida, no por categoría.** Cambio de trabajo · alquilo o compro · me enfermo o tengo un hijo · impuestos del año · el auto · la casa. Cada bloque enlaza a su silo y a 2-3 hubs adentro.

**Qué hay de nuevo / qué venció.** El sitio tiene datos vivos y estacionales reales (monotributo, salario mínimo por país, feriados, valores BCRA). Mostrar frescura con fecha es señal de confianza y es contenido que se renueva solo.

**Los otros 13 mercados.** Bloque de salida claro. No es "internacional" genérico: son sitios completos por país.

**Cómo verificamos los números.** Corto y con enlace a `/metodologia`. Es el diferencial; hoy está en un pilar decorativo.

---

## 5. Internal linking — la parte que más rinde

La home es el nodo con más autoridad del sitio. Hoy emite **71 links internos**, muchos a URLs que ahora redirigen.

Reglas:

- **Cero links a URLs que redirigen.** Antes de enlazar algo, verificá que dé 200. Un link interno a un 301 desperdicia autoridad. La lista de redirects está en `src/lib/pruning-redirects.ts`.
- **Enlazar hubs y silos, nunca calculadoras sueltas** — ya no existen como URL propia.
- **Los 110 silos tienen que ser alcanzables** desde la home en 1 clic (directo) o 2 (vía su silo padre). Hoy varios quedaron huérfanos tras la consolidación.
- **Anchor text con la keyword**, no "Ver más" ni "Ver todas →". Hubo 744 anchors genéricos en el sitio; no sumes.
- **Prioridad por tráfico**: `/salud`, `/trabajo`, `/alquiler`, `/fechas` e `/impuestos` concentran el 60%. Que estén arriba y con más de un link de entrada.

---

## 6. Reglas técnicas del repo (rompen cosas en silencio)

- **No inventes URLs.** Toda ruta que enlaces tiene que existir. Verificá con `curl -s -o /dev/null -w '%{http_code}' http://localhost:4388/<ruta>`. Para listar los hubs reales:
  ```bash
  grep -h "^  slug: '" src/lib/hubs/**/*.ts | sed "s/.*'\(.*\)'.*/\//"
  ```
- **No toques** `src/lib/hubs/**` (los 488 hubs), `src/components/hub/DecisionHub.astro`, `src/components/hub/SiloIndex.astro`, `src/styles/hub.css`, ni `scripts/`.
- **Header y Footer** (`src/components/Header.astro`, `Footer.astro`) sí podés tocarlos si el rediseño lo pide, pero avisá en el reporte: los ve todo el sitio.
- **GA4 y Google Ads**: no borres, renombres ni muevas ningún tag de `gtag`/`dataLayer`, y no toques CSP ni headers de seguridad. El `<script async src="gtag.js">` va **siempre en el `<head>`**, nunca al final del `<body>` (se pierden sesiones cortas). Datos perdidos = irrecuperables.
- **Mobile primero**: el grueso del tráfico es móvil. Nada de tablas que desborden; contenedores anchos con `overflow-x: auto`.
- **Accesibilidad**: foco visible, contraste real, `prefers-reduced-motion` respetado.
- El CSS del sitio es pesado (~512 KB bloqueantes). No agregues frameworks ni fuentes externas nuevas.

---

## 7. Verificación antes de entregar

```bash
npm run dev                                   # y revisá la home en el browser
python3 scripts/check-hubs.py                 # integridad de hubs
node scripts/audit-sitemap-coverage.mjs --check
```

Además, comprobá a mano que **cada link de la home devuelve 200** (no 301). Un one-liner:

```bash
curl -s http://localhost:4388/ | grep -oE 'href="/[^"#]*"' | sed 's/href="//;s/"//' | sort -u | while read u; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4388$u)" "$u"
done | grep -v '^200' 
```

Ese comando no debe imprimir nada.

---

## 8. Qué entregar en el reporte

- Qué cambiaste y por qué, sección por sección.
- La lista de hubs/silos que decidiste destacar y con qué criterio.
- Cuántos links internos emite la home ahora y la confirmación de que **todos dan 200**.
- Si tocaste Header o Footer, decilo explícitamente.
- Cualquier URL que quisiste enlazar y no existía (es señal de un hueco de contenido que vale la pena conocer).
