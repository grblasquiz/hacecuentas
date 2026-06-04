# Playbook de Broken-Link Building — hacecuentas.com

> **Qué es esto.** Guía operativa para conseguir backlinks relevantes detectando *links rotos* (404 / error / redirect mal hecho) en artículos argentinos que apuntan a calculadoras o herramientas que ya no existen, y ofreciendo la calculadora equivalente de hacecuentas como reemplazo.
>
> **Por qué es la táctica de mayor ROI.** No pedís un favor: das valor real (le arreglás un link roto que le ensucia la UX y le tira SEO al editor) y a cambio conseguís un link contextual y relevante. La tasa de respuesta es muy superior al outreach frío clásico.
>
> **Estado de este documento.** Investigación inicial del 2026-06-04. Todas las URLs de la sección "URLs muertas" fueron **fetcheadas y verificadas** (status HTTP real). Las "páginas objetivo" están en su mayoría **pendientes de chequeo manual del link saliente** — ver la sección de honestidad al final. **Regla dura: cero URLs inventadas.**

---

## 1. Metodología paso a paso

El flujo tiene 4 fases. La idea es escalarlo: una vez que tenés el patrón, cada hora de trabajo te puede dar 1-3 candidatos sólidos.

### Fase A — Armar la lista de "herramientas muertas de alto rendimiento"

Buscás herramientas que **mucha gente linkeaba** y que **cambiaron de URL o murieron**. Las mejores fuentes de links rotos en el nicho argentino de calculadoras financieras son:

1. **Migración AFIP → ARCA (2024-2025).** AFIP se renombró a ARCA (Agencia de Recaudación y Control Aduanero). Muchísimos applicativos, simuladores y URLs `afip.gob.ar/...` viejos quedaron en 404 o se movieron. Esto es **oro**: hay miles de notas (2015-2024) que linkean a calculadoras/simuladores de AFIP que hoy dan 404.
2. **Herramientas del Ministerio de Trabajo / Producción** que se dieron de baja o rompieron tras los cambios de organigrama del Estado (fusiones de ministerios 2024).
3. **Calculadoras de medios** (Cronista, iProfesional, Infobae, La Nación) que vivían en `/herramientas/...` y que el CMS discontinuó (hoy redirigen mal o caen al home = soft-404).
4. **Simuladores de bancos** discontinuados o movidos de path (cuenta sueldo, plazo fijo, préstamos).

> **Cómo verificar que una URL está muerta (obligatorio antes de pitchear):**
> - Abrila en incógnito y mirá el status. 404 / 500 = muerta segura.
> - **Cuidado con el soft-404:** muchos CMS devuelven HTTP 200 pero te tiran al home o a una página genérica. Si la URL es `/herramientas/calculadora-X` y te aparece el home del diario, es soft-404 → sirve igual como candidato, pero confirmalo viendo que el contenido NO es la herramienta.
> - Chequeá Wayback Machine (`https://web.archive.org/web/*/URL`) para confirmar que la herramienta **existió** y ver qué hacía. Útil para el email ("antes esto era la calculadora de X").

### Fase B — Encontrar los artículos que linkean a esas herramientas muertas

Acá están las **queries exactas de Google** que sirven. Reemplazá `[dominio-muerto]` por el dominio/path de la herramienta muerta que ya verificaste en la Fase A.

```
# 1. Quién linkea a una URL/herramienta específica (la más potente)
"serviciosweb.afip.gob.ar/genericos/calculadoraDeIntereses"
"afip.gob.ar/genericos/guiavirtual/intereses"
"trabajo.gob.ar/calculadora"

# 2. Páginas de "recursos / enlaces útiles" que suelen acumular links viejos
"calculadora" "afip" ("enlaces útiles" OR "recursos" OR "links útiles") site:.com.ar
"calculadora de sueldo" ("herramientas" OR "recursos") blog finanzas argentina

# 3. Notas-calculadora de medios y blogs (las que más linkean a tools oficiales)
intitle:"calculadora" (aguinaldo OR ganancias OR "sueldo neto" OR indemnización) site:.com.ar
"cómo calcular" (aguinaldo OR ganancias OR indemnización OR monotributo) "afip" -site:afip.gob.ar

# 4. Foros y comunidades (Reddit, foros de RRHH, taringa-likes) con links viejos
"calculadora de la afip" OR "calculadora del ministerio" (sueldo OR liquidación OR ganancias)

# 5. Filtrar por antigüedad — los artículos viejos tienen más chance de link roto
# En Google: Herramientas → Cualquier fecha → 2015-2022
```

> **Atajo con herramientas SEO (si hay acceso):** en Ahrefs/Semrush, poné el dominio muerto en *Backlinks* y exportá quién le apunta. Eso te da la lista directa sin scrapear Google. Sin acceso pago, las queries de arriba + revisión manual alcanzan.

### Fase C — Verificar el link roto en cada página objetivo

1. Abrí el artículo candidato.
2. Buscá el link saliente (Ctrl+F el dominio muerto, o pasá un checker de links sobre la página: `https://www.brokenlinkcheck.com/` o la extensión *Check My Links* de Chrome).
3. Confirmá que ese link da 404/error.
4. Anotá: URL del artículo + texto ancla + URL rota exacta.

### Fase D — Mapear el reemplazo de hacecuentas y hacer outreach

1. Elegí la calc de hacecuentas que reemplaza **exactamente** la herramienta muerta (tabla de la sección 3, slugs verificados).
2. Mandá el email del template (sección 5). Corto, directo, sin fluff.
3. Seguimiento: si no responden en 7-10 días, un único follow-up. No insistir más.

---

## 2. Tabla — URLs muertas de alto rendimiento (VERIFICADAS)

Todas estas URLs fueron fetcheadas el 2026-06-04. El status es real.

| # | Herramienta vieja | URL | Estado verificado | Reemplazo en hacecuentas | Confianza |
|---|---|---|---|---|---|
| 1 | AFIP — Calculadora de Intereses (deuda/moratoria) | `https://serviciosweb.afip.gob.ar/genericos/calculadoraDeIntereses/` | **HTTP 404** ✅ | `/calculadora-monotributo-2026` (cuota+intereses) o hub `/guia/impuestos-argentina-2026` · *si hay calc de intereses por mora, verificar slug* | Alta |
| 2 | AFIP — Intereses guía virtual | `https://www.afip.gob.ar/genericos/guiavirtual/intereses.aspx` | **HTTP 404** ✅ | igual que #1 | Alta |
| 3 | Ministerio de Trabajo — Calculadora (path raíz) | `https://www.trabajo.gob.ar/calculadora/` | **HTTP 500** ✅ | `/calculadora-indemnizacion-despido` | Alta |
| 4 | El Cronista — Calculadora de sueldo (sección herramientas) | `https://www.cronista.com/herramientas/calculadora-de-sueldo/` | **HTTP 200 pero sirve el HOME del diario** (soft-404 probable) ⚠️ | `/calculadora-sueldo-bruto-desde-neto` o `/calculadora-impuesto-ganancias-sueldo` | Media — confirmar manual que no es la herramienta real |
| 5 | iProfesional — Calculadora de ganancias (sección herramientas) | `https://www.iprofesional.com/herramientas/calculadora-de-ganancias` | **HTTP 200 pero sirve el HOME** (soft-404 probable) ⚠️ | `/calculadora-impuesto-ganancias-sueldo` | Media — confirmar manual |

**Herramientas que probé y SIGUEN VIVAS — NO pitchear como rotas (evitar quedar mal):**

| Herramienta | URL | Estado |
|---|---|---|
| AFIP/ARCA — Simulador retenciones RG 830 | `https://servicioscf.afip.gob.ar/calc-rg830/` | **VIVA (200)** ✅ |
| AFIP/ARCA — Monotributo categorías vigentes | `https://www.afip.gob.ar/monotributo/categorias.asp` | **VIVA (200)** ✅ |
| AFIP/ARCA — Portal Monotributo | `https://monotributo.afip.gob.ar/` | **VIVA (200)** ✅ |
| BBVA — Calculadora de sueldo neto | `https://www.bbva.com.ar/personas/productos/cuenta-sueldo/calculadora-sueldo-neto.html` | **VIVA (200)** ✅ |

> **Nota de honestidad sobre #1 y #2 (AFIP intereses):** el endpoint da 404 hoy y es un path clásico que se citaba mucho, pero la consulta a la API de Wayback no devolvió snapshot para ese path exacto (puede ser limitación del match de la API, no prueba de que nunca existió). Antes de usarlos en outreach, confirmá en `web.archive.org` que la herramienta existía, para poder decir con propiedad "esto antes era X".

---

## 3. Mapa de reemplazos — calcs de hacecuentas (SLUGS VERIFICADOS LIVE)

Estos slugs fueron confirmados con fetch (HTTP 200 + H1 correcto) el 2026-06-04. **Usá estos, no los inventados.**

| Tema de la herramienta muerta | Calc de hacecuentas (URL real) | Verificado |
|---|---|---|
| Sueldo neto / bruto↔neto | `https://hacecuentas.com/calculadora-sueldo-bruto-desde-neto` | slug del repo (no fetcheado individualmente) — *verificar 200 antes de usar* |
| Aguinaldo / SAC | `https://hacecuentas.com/calculadora-aguinaldo-sac` | ✅ 200, H1 "Calculadora de Aguinaldo (SAC)" |
| Impuesto a las Ganancias (sueldo, relación de dependencia) | `https://hacecuentas.com/calculadora-impuesto-ganancias-sueldo` | ✅ 200, H1 "Calculadora de Impuesto a las Ganancias — Sueldo" |
| Ganancias 4ta categoría empleados | `https://hacecuentas.com/calculadora-ganancias-empleados-4ta-categoria-2026` | slug del repo — *verificar 200* |
| Monotributo (categoría + cuota) | `https://hacecuentas.com/calculadora-monotributo-2026` | ✅ 200, H1 "Calculadora de monotributo 2026" |
| Indemnización por despido | `https://hacecuentas.com/calculadora-indemnizacion-despido` | ✅ 200, H1 "Calculadora de indemnización por despido sin causa" |
| IVA (agregar/discriminar) | `https://hacecuentas.com/calculadora-iva-incluido-neto-discriminar` | slug del repo — *verificar 200* |
| Plazo fijo | `https://hacecuentas.com/comparador-plazo-fijo` | ✅ 200, H1 "Comparador de plazo fijo: bancos Argentina 2026" |
| Jubilación / ANSES | `https://hacecuentas.com/simulador-jubilacion-anses` | ✅ 200, H1 "Simulador de jubilación ANSES" |
| Hub impuestos (fallback) | `https://hacecuentas.com/guia/impuestos-argentina-2026` | listado en sitemap-core ✅ |
| Hub sueldos (fallback) | `https://hacecuentas.com/guia/sueldos-argentina-2026` | listado en sitemap-core ✅ |

> **Importante (corrección a supuestos previos):** las URLs cortas tipo `/calculadora-sueldo-neto`, `/calculadora-ganancias` y `/calculadora-aguinaldo` **NO son los slugs reales** del sitio. Los reales son los de arriba. Antes de mandar cualquier email, hacé un último `curl -sI` del slug de reemplazo para confirmar 200 (los slugs marcados "verificar 200" no los fetcheé uno por uno).

---

## 4. Tabla — Páginas objetivo (candidatos de outreach)

Estas son páginas argentinas **vivas y relevantes** que tratan los temas exactos de nuestras calcs y que son el perfil típico que linkea a herramientas oficiales. **La mayoría está pendiente de confirmar el link roto saliente** (ver columna). Donde encontré evidencia de links a gob.ar, lo anoto.

| # | Artículo / página | Medio / blog | Relevancia | Link roto encontrado | Reemplazo sugerido | Cómo contactar |
|---|---|---|---|---|---|---|
| 1 | `https://wise.com/ar/blog/como-se-calcula-impuesto-a-las-ganancias` | Wise (blog AR) | Alta — artículo "cómo se calcula Ganancias 2026" | **Linkea a PDFs/normas de `biblioteca.afip.gob.ar` y a tabla Art. 94 LIG.** No verificado si esos PDFs dan 404 — *chequear*, los links de biblioteca.afip suelen romperse en migraciones | `/calculadora-impuesto-ganancias-sueldo` | Form de contacto Wise / LinkedIn del equipo de contenidos AR |
| 2 | `https://www.infobae.com/economia/2022/12/08/calculadora-de-ganancias-detalles-de-la-nueva-actualizacion...` | Infobae | Alta — nota-calculadora de Ganancias 2023 | Pendiente — el fetch no detectó links gob.ar en el body, **revisar manual** (Infobae suele embeber tools propias que discontinúa) | `/calculadora-impuesto-ganancias-sueldo` | Contacto redacción Infobae / autor de la nota |
| 3 | `https://www.lanacion.com.ar/economia/calculadora-de-ganancias-chequea-como-quedara-tu-sueldo...nid28062024/` | La Nación | Alta — nota-calculadora Ganancias 2024 | Pendiente de chequeo manual | `/calculadora-impuesto-ganancias-sueldo` | Contacto LN / autor |
| 4 | `https://siap.blogdelcontador.com.ar/tipo_herramienta/planillas-utiles/` | Blog del Contador | Muy alta — blog contable de autoridad, página de "herramientas útiles" | Pendiente — fetch no detectó links salientes (puede ser render JS); **revisar manual**, este tipo de página acumula links a SIAP/AFIP viejos | `/calculadora-monotributo-2026` + `/calculadora-impuesto-ganancias-sueldo` | Form del Blog del Contador |
| 5 | `https://e-sueldos.com/liquidacion-de-haberes-en-argentina-guia-completa/` | e-Sueldos | Alta — guía de liquidación de haberes | **Bloqueó el fetch (HTTP 403)** — abrir manual en navegador | `/calculadora-sueldo-bruto-desde-neto` + `/calculadora-indemnizacion-despido` | Contacto e-Sueldos |
| 6 | `https://www.bloomberglinea.com/latinoamerica/argentina/calcular-aguinaldo/` | Bloomberg Línea | Alta — calculadora de aguinaldo 2026 | Pendiente de chequeo manual | `/calculadora-aguinaldo-sac` | Redacción Bloomberg Línea AR |
| 7 | `https://www.infobae.com/economia/2026/05/18/calculadora-del-aguinaldo-2026...` | Infobae | Alta — nota aguinaldo junio 2026 | Pendiente | `/calculadora-aguinaldo-sac` | Autor de la nota |
| 8 | `https://www.infobae.com/economia/2026/05/29/empleadas-domesticas-como-calcular-el-aguinaldo...` | Infobae | Media-alta — aguinaldo empleadas de casa | Pendiente | `/calculadora-aguinaldo-empleada-casa-particular-medio-tiempo-categoria` (verificar slug live) | Autor |
| 9 | `https://www.casi.com.ar/2024CALCULADORAS` | Colegio de Abogados de San Isidro (CASI) | Muy alta — colegio profesional, página de "calculadoras" con links a tools de actualización monetaria | Pendiente — **revisar manual**, páginas de colegios suelen tener links a tools provinciales/nacionales caídos. Backlink .org de colegio = altísimo valor | `/calculadora-indemnizacion-despido` | Secretaría / contacto CASI |

> **Por qué estos perfiles:** notas-calculadora de medios (2,3,6,7,8), guías de finanzas (1,5), páginas de "recursos/herramientas" de blogs contables y colegios profesionales (4,9). Estos tres formatos son los que acumulan links a herramientas oficiales que se mueren con cada cambio de gobierno/organigrama.

---

## 5. Template de email de outreach (español, corto)

Asunto: **Link roto en tu nota sobre [tema]**

```
Hola [nombre]:

Estaba leyendo tu nota "[título del artículo]" y vi que el link a
la calculadora de [AFIP / Ministerio de Trabajo / la que sea] ya no
funciona — tira un error 404 (te lo dejo: [URL rota]).

Por si te sirve para reemplazarlo, nosotros tenemos una calculadora
de [aguinaldo / ganancias / lo que aplique] gratis y actualizada a
2026: [URL de hacecuentas].

Cero obligación, te lo paso más que nada para avisarte del link roto.

Saludos,
Martín — hacecuentas.com
```

**Reglas del email:**
- Una sola idea: el link roto. El reemplazo es secundario.
- Nombrá la nota específica (demuestra que la leíste).
- Pegá la URL rota exacta — que pueda verificar en 5 segundos.
- Sin adjuntos, sin firma pomposa, sin "somos líderes en...".
- Un solo follow-up a los 7-10 días si no contesta.

**Variante para "página de recursos / herramientas":**

```
Hola:

En tu página de [recursos/herramientas] hay un par de links a
calculadoras que quedaron rotos tras la migración de AFIP a ARCA
(ej: [URL rota] → da 404).

Si querés reemplazarlos, te dejo equivalentes vivos y gratis:
- [tema]: [URL hacecuentas]
- [tema]: [URL hacecuentas]

Avisame si te sirve.
Saludos, Martín — hacecuentas.com
```

---

## 6. Honestidad: verificado vs pendiente de chequeo manual

**✅ VERIFICADO POR MÍ (fetch directo, status HTTP real):**
- 404 confirmado: `serviciosweb.afip.gob.ar/genericos/calculadoraDeIntereses/`, `www.afip.gob.ar/genericos/guiavirtual/intereses.aspx`.
- 500 confirmado: `www.trabajo.gob.ar/calculadora/`.
- 200-pero-sirve-home (soft-404 probable, NO 100% confirmado): `cronista.com/herramientas/calculadora-de-sueldo/`, `iprofesional.com/herramientas/calculadora-de-ganancias`.
- Vivas (NO pitchear como rotas): RG 830 de AFIP, monotributo AFIP, BBVA sueldo neto.
- Calcs de hacecuentas vivas (200 + H1 correcto): `calculadora-aguinaldo-sac`, `calculadora-impuesto-ganancias-sueldo`, `calculadora-monotributo-2026`, `calculadora-indemnizacion-despido`, `comparador-plazo-fijo`, `simulador-jubilacion-anses`.
- Páginas objetivo que existen y son relevantes (200): Wise, Infobae (varias), La Nación, Bloomberg Línea, Blog del Contador, CASI. El **artículo de Wise efectivamente linkea a `biblioteca.afip.gob.ar`** (visto en el fetch).

**⚠️ PENDIENTE DE CHEQUEO MANUAL (hipótesis razonable, NO confirmado):**
- Que las páginas objetivo (#1-#9) tengan **el link saliente roto específico**. El fetcher resume el HTML y a veces se come los `<a href>`; varios reportaron "sin links" cuando probablemente sí los tengan. **Hay que abrir cada una en navegador con un checker de links** (Check My Links / brokenlinkcheck.com) antes de pitchear. La nota de Wise que linkea a biblioteca.afip es la más prometedora: falta confirmar si esos PDFs dan 404.
- El soft-404 de Cronista e iProfesional: confirmar visualmente que la URL profunda NO muestra la herramienta.
- Slugs de hacecuentas marcados "verificar 200" en la tabla 3 (`calculadora-sueldo-bruto-desde-neto`, `calculadora-ganancias-empleados-4ta-categoria-2026`, `calculadora-iva-incluido-neto-discriminar`, aguinaldo empleada de casa): salieron del repo local, falta `curl -sI` final.
- Wayback de las herramientas AFIP de intereses: la API no devolvió snapshot para el path exacto. No prueba que no existieran (limitación de match), pero conviene confirmar en `web.archive.org` antes de afirmar "esto antes era X".

**Próximos pasos recomendados (orden de prioridad):**
1. Pasar Check My Links sobre las 9 páginas objetivo → confirmar el link roto real. Esto convierte hipótesis en candidatos pitcheables.
2. Confirmar los PDFs de biblioteca.afip que linkea Wise (#1) — alta probabilidad de 404 post-migración.
3. Correr las queries de la Fase B con filtro de fecha 2015-2022 para AFIP intereses/sueldo → ahí está el volumen real de links rotos.
4. `curl -sI` final de los 4 slugs de hacecuentas marcados "verificar 200".
